import { Ajv2020 } from "ajv/dist/2020.js";
import type { ErrorObject, ValidateFunction } from "ajv";

import type {
  ComponentDefinition,
  ComponentPropsValidationIssue,
  ContentItem,
  ContentManifest,
  EditManifest,
  ManifestValidationOptions,
  Placement,
  RenderCodec,
  RenderContainer,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

// Use dynamic JSON imports so source-mode workspace consumers and compiled ESM
// both load the checked-in Draft 2020-12 schemas from the same location.
const jsonModuleOptions = { with: { type: "json" } } as unknown as ImportCallOptions;
const contentManifestSchema = (
  await import("../schemas/content-manifest.schema.json", jsonModuleOptions)
).default;
const editManifestSchema = (await import("../schemas/edit-manifest.schema.json", jsonModuleOptions)).default;

const MAX_SAFE_FRAME = Number.MAX_SAFE_INTEGER;

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  validateFormats: true,
});

ajv.addFormat("date-time", {
  type: "string",
  validate: (value: string): boolean => {
    const rfc3339DateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    return rfc3339DateTime.test(value) && !Number.isNaN(Date.parse(value));
  },
});

const contentEnvelopeValidator = ajv.compile(contentManifestSchema);
const editEnvelopeValidator = ajv.compile(editManifestSchema);

const COMPATIBLE_CODECS: Readonly<Record<RenderContainer, readonly RenderCodec[]>> = {
  mp4: ["h264", "h265"],
  mov: ["h264", "h265", "prores"],
  webm: ["vp8", "vp9"],
  "png-sequence": ["png"],
};

/** Validates the content envelope and its content-only semantic rules. */
export function validateContentManifest(
  input: unknown,
  options: ManifestValidationOptions = {},
): ValidationResult<ContentManifest> {
  const envelope = validateEnvelope<ContentManifest>(contentEnvelopeValidator, input);
  if (envelope.value === undefined) {
    return envelope;
  }

  const issues = [...envelope.issues, ...validateContentSemanticIssues(envelope.value, options)];
  return resultFor(envelope.value, issues);
}

/** Validates the edit envelope and its edit-only semantic rules. */
export function validateEditManifest(input: unknown): ValidationResult<EditManifest> {
  const envelope = validateEnvelope<EditManifest>(editEnvelopeValidator, input);
  if (envelope.value === undefined) {
    return envelope;
  }

  const issues = [...envelope.issues, ...validateEditSemanticIssues(envelope.value)];
  return resultFor(envelope.value, issues);
}

function validateEnvelope<T>(validator: ValidateFunction, input: unknown): ValidationResult<T> {
  const valid = validator(input);
  if (!valid) {
    return {
      valid: false,
      issues: toSchemaIssues(validator.errors),
    };
  }

  return resultFor(input as T, []);
}

function toSchemaIssues(errors: ErrorObject[] | null | undefined): ValidationIssue[] {
  return (errors ?? []).map((error) => {
    const path = schemaErrorPath(error);
    const message = error.message ?? "does not satisfy the manifest schema";

    return {
      path,
      message,
      code: `schema.${error.keyword}`,
    };
  });
}

function schemaErrorPath(error: ErrorObject): string {
  if (error.keyword !== "required") {
    return error.instancePath || "/";
  }

  const missingProperty = (error.params as { missingProperty?: unknown }).missingProperty;
  if (typeof missingProperty !== "string") {
    return error.instancePath || "/";
  }

  return `${error.instancePath}/${escapeJsonPointerSegment(missingProperty)}`;
}

function escapeJsonPointerSegment(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function resultFor<T>(value: T, issues: ValidationIssue[]): ValidationResult<T> {
  return {
    valid: issues.length === 0,
    issues,
    value,
  };
}

function validateContentSemanticIssues(
  manifest: ContentManifest,
  options: ManifestValidationOptions,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  issues.push(...duplicateIdIssues(manifest.items, "items", "content"));

  const assetIds = new Set(Object.keys(manifest.assets ?? {}));
  for (const [itemIndex, item] of manifest.items.entries()) {
    const itemPath = `/items/${itemIndex}`;

    for (const [dependencyIndex, dependency] of (item.dependencies ?? []).entries()) {
      if (!assetIds.has(dependency)) {
        issues.push({
          path: `${itemPath}/dependencies/${dependencyIndex}`,
          message: `references asset '${dependency}', but no matching asset exists`,
          code: "content-dependency.missing",
        });
      }
    }

    issues.push(...validateRenderSpec(item, itemPath));
    issues.push(...validateComponentContract(item, itemIndex, manifest, options));
  }

  return issues;
}

function validateRenderSpec(item: ContentItem, itemPath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const compatibleCodecs = COMPATIBLE_CODECS[item.render.container];

  if (!compatibleCodecs.includes(item.render.codec)) {
    issues.push({
      path: `${itemPath}/render/codec`,
      message: `codec '${item.render.codec}' is not supported by '${item.render.container}'`,
      code: "render.codec-container",
    });
  }

  if (item.render.proresProfile !== undefined && item.render.codec !== "prores") {
    issues.push({
      path: `${itemPath}/render/proresProfile`,
      message: "proresProfile is only valid when codec is 'prores'",
      code: "render.prores-profile",
    });
  }

  if (item.render.alpha) {
    const proresWithAlpha =
      item.render.codec === "prores" &&
      (item.render.proresProfile === "4444" || item.render.proresProfile === "4444-xq");
    const pngWithAlpha = item.render.codec === "png";

    if (!proresWithAlpha && !pngWithAlpha) {
      issues.push({
        path: `${itemPath}/render/alpha`,
        message: "alpha output requires png or ProRes 4444/4444-xq",
        code: "render.alpha-codec",
      });
    }
  }

  if (item.render.codec === "png" && item.render.audio) {
    issues.push({
      path: `${itemPath}/render/audio`,
      message: "png-sequence output cannot include audio",
      code: "render.audio-codec",
    });
  }

  return issues;
}

function validateComponentContract(
  item: ContentItem,
  itemIndex: number,
  manifest: ContentManifest,
  options: ManifestValidationOptions,
): ValidationIssue[] {
  const resolver = options.componentResolver;
  if (resolver === undefined) {
    return [];
  }

  let definition: ComponentDefinition | undefined;
  try {
    definition = resolver(item.compositionId);
  } catch (error) {
    return [
      {
        path: `/items/${itemIndex}/compositionId`,
        message: `component resolver failed: ${errorMessage(error)}`,
        code: "component-resolver.failed",
      },
    ];
  }

  // An absent definition means the caller intentionally has no contract for this component.
  if (definition === undefined) {
    return [];
  }

  const issues: ValidationIssue[] = [];
  const itemPath = `/items/${itemIndex}`;
  const minDuration = definition.minDurationFrames;
  const maxDuration = definition.maxDurationFrames;

  if (minDuration !== undefined && !isPositiveSafeInteger(minDuration)) {
    issues.push({
      path: `${itemPath}/durationFrames`,
      message: "component contract has an invalid minDurationFrames value",
      code: "component-contract.invalid-min-duration",
    });
  }

  if (maxDuration !== undefined && !isPositiveSafeInteger(maxDuration)) {
    issues.push({
      path: `${itemPath}/durationFrames`,
      message: "component contract has an invalid maxDurationFrames value",
      code: "component-contract.invalid-max-duration",
    });
  }

  if (
    minDuration !== undefined &&
    maxDuration !== undefined &&
    isPositiveSafeInteger(minDuration) &&
    isPositiveSafeInteger(maxDuration) &&
    minDuration > maxDuration
  ) {
    issues.push({
      path: `${itemPath}/durationFrames`,
      message: "component contract minDurationFrames cannot exceed maxDurationFrames",
      code: "component-contract.inverted-duration-range",
    });
  }

  if (isPositiveSafeInteger(minDuration) && item.durationFrames < minDuration) {
    issues.push({
      path: `${itemPath}/durationFrames`,
      message: `durationFrames must be at least ${minDuration} for '${item.compositionId}'`,
      code: "content-duration.below-minimum",
    });
  }

  if (isPositiveSafeInteger(maxDuration) && item.durationFrames > maxDuration) {
    issues.push({
      path: `${itemPath}/durationFrames`,
      message: `durationFrames must be at most ${maxDuration} for '${item.compositionId}'`,
      code: "content-duration.above-maximum",
    });
  }

  if (definition.validateProps === undefined) {
    return issues;
  }

  try {
    const outcome = definition.validateProps(item.props, { item, manifest });
    issues.push(...componentPropsIssues(outcome, itemPath));
  } catch (error) {
    issues.push({
      path: `${itemPath}/props`,
      message: `component props validator failed: ${errorMessage(error)}`,
      code: "component-props-validator.failed",
    });
  }

  return issues;
}

function componentPropsIssues(
  outcome: ReturnType<NonNullable<ComponentDefinition["validateProps"]>>,
  itemPath: string,
): ValidationIssue[] {
  if (outcome === undefined || outcome === true) {
    return [];
  }

  if (outcome === false) {
    return [
      {
        path: `${itemPath}/props`,
        message: "component props did not satisfy the component contract",
        code: "component-props.invalid",
      },
    ];
  }

  if (outcome.valid) {
    return [];
  }

  const details = outcome.issues;
  if (details === undefined || details.length === 0) {
    return [
      {
        path: `${itemPath}/props`,
        message: "component props did not satisfy the component contract",
        code: "component-props.invalid",
      },
    ];
  }

  return details.map((issue) => componentPropsIssueToValidationIssue(issue, itemPath));
}

function componentPropsIssueToValidationIssue(
  issue: ComponentPropsValidationIssue,
  itemPath: string,
): ValidationIssue {
  const relativePath = issue.path;
  const propsPath =
    relativePath === undefined || relativePath === "" || relativePath === "/"
      ? `${itemPath}/props`
      : `${itemPath}/props/${relativePath.replace(/^\/+/, "")}`;

  return {
    path: propsPath,
    message: issue.message,
    code: issue.code ?? "component-props.invalid",
  };
}

function validateEditSemanticIssues(manifest: EditManifest): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  issues.push(...duplicateIdIssues(manifest.tracks, "tracks", "track"));
  issues.push(...duplicateIdIssues(manifest.placements, "placements", "placement"));
  if (manifest.markers !== undefined) {
    issues.push(...duplicateIdIssues(manifest.markers, "markers", "marker"));
  }

  const tracksById = new Map(manifest.tracks.map((track) => [track.id, track]));
  for (const [placementIndex, placement] of manifest.placements.entries()) {
    const placementPath = `/placements/${placementIndex}`;
    const track = tracksById.get(placement.trackId);

    if (track === undefined) {
      issues.push({
        path: `${placementPath}/trackId`,
        message: `references track '${placement.trackId}', but no matching track exists`,
        code: "track-reference.missing",
      });
    } else if (!track.managed && isAutomatedSyncPolicy(placement.sync.policy)) {
      issues.push({
        path: `${placementPath}/sync/policy`,
        message: `policy '${placement.sync.policy}' cannot write to human-managed track '${track.id}'`,
        code: "human-track.automated-placement",
      });
    }

    issues.push(...validatePlacementTiming(placement, placementPath));
  }

  for (const [markerIndex, marker] of (manifest.markers ?? []).entries()) {
    if (marker.endFrame !== undefined && marker.endFrame < marker.startFrame) {
      issues.push({
        path: `/markers/${markerIndex}/endFrame`,
        message: "endFrame cannot be earlier than startFrame",
        code: "marker.invalid-range",
      });
    }
  }

  issues.push(...managedTrackCollisionIssues(manifest));
  return issues;
}

function validatePlacementTiming(placement: Placement, placementPath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const endFrame = placement.startFrame + placement.durationFrames;

  if (!Number.isSafeInteger(endFrame)) {
    issues.push({
      path: `${placementPath}/durationFrames`,
      message: "startFrame plus durationFrames must be a safe integer frame",
      code: "frame.range",
    });
  }

  for (const [laneIndex, lane] of (placement.keyframes ?? []).entries()) {
    for (const [pointIndex, point] of lane.points.entries()) {
      if (point.frameOffset >= placement.durationFrames) {
        issues.push({
          path: `${placementPath}/keyframes/${laneIndex}/points/${pointIndex}/frameOffset`,
          message: `keyframe offset must be within 0..${placement.durationFrames - 1}`,
          code: "keyframe.out-of-range",
        });
      }
    }
  }

  const fadeInFrames = placement.audio?.fadeInFrames;
  if (fadeInFrames !== undefined && fadeInFrames > placement.durationFrames) {
    issues.push({
      path: `${placementPath}/audio/fadeInFrames`,
      message: "fadeInFrames cannot exceed placement durationFrames",
      code: "audio-fade.out-of-range",
    });
  }

  const fadeOutFrames = placement.audio?.fadeOutFrames;
  if (fadeOutFrames !== undefined && fadeOutFrames > placement.durationFrames) {
    issues.push({
      path: `${placementPath}/audio/fadeOutFrames`,
      message: "fadeOutFrames cannot exceed placement durationFrames",
      code: "audio-fade.out-of-range",
    });
  }

  return issues;
}

function managedTrackCollisionIssues(manifest: EditManifest): ValidationIssue[] {
  const tracksById = new Map(manifest.tracks.map((track) => [track.id, track]));
  const placementsByTrack = new Map<string, Array<{ placement: Placement; index: number }>>();

  for (const [index, placement] of manifest.placements.entries()) {
    const track = tracksById.get(placement.trackId);
    if (track?.managed !== true) {
      continue;
    }

    const placements = placementsByTrack.get(track.id) ?? [];
    placements.push({ placement, index });
    placementsByTrack.set(track.id, placements);
  }

  const issues: ValidationIssue[] = [];
  for (const [trackId, placements] of placementsByTrack) {
    for (let left = 0; left < placements.length; left += 1) {
      const first = placements[left];
      if (first === undefined) {
        continue;
      }

      for (let right = left + 1; right < placements.length; right += 1) {
        const second = placements[right];
        if (second === undefined || !placementsOverlap(first.placement, second.placement)) {
          continue;
        }

        issues.push({
          path: `/placements/${second.index}`,
          message: `overlaps placement '${first.placement.id}' on managed track '${trackId}'`,
          code: "managed-track.collision",
        });
      }
    }
  }

  return issues;
}

function placementsOverlap(first: Placement, second: Placement): boolean {
  const firstEnd = first.startFrame + first.durationFrames;
  const secondEnd = second.startFrame + second.durationFrames;
  return first.startFrame < secondEnd && second.startFrame < firstEnd;
}

function duplicateIdIssues<T extends { id: string }>(
  entries: readonly T[],
  collection: string,
  kind: string,
): ValidationIssue[] {
  const firstIndexById = new Map<string, number>();
  const issues: ValidationIssue[] = [];

  for (const [index, entry] of entries.entries()) {
    const firstIndex = firstIndexById.get(entry.id);
    if (firstIndex === undefined) {
      firstIndexById.set(entry.id, index);
      continue;
    }

    issues.push({
      path: `/${collection}/${index}/id`,
      message: `duplicate ${kind} id '${entry.id}' (first used at /${collection}/${firstIndex}/id)`,
      code: `duplicate.${kind}-id`,
    });
  }

  return issues;
}

function isAutomatedSyncPolicy(policy: Placement["sync"]["policy"]): boolean {
  return policy === "strict" || policy === "placement-only";
}

function isPositiveSafeInteger(value: number | undefined): value is number {
  return value !== undefined && Number.isSafeInteger(value) && value >= 1 && value <= MAX_SAFE_FRAME;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
