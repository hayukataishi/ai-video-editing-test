import type {
  ContentManifest,
  CrossFileManifestPair,
  EditManifest,
  ValidationIssue,
  ValidationResult,
  VideoSpec,
} from "./types.js";

/**
 * Validates references and timebase invariants that need both manifest files.
 * Call `validateContentManifest` and `validateEditManifest` first to validate
 * each envelope and its file-local semantic rules.
 */
export function validateCrossFile(
  content: ContentManifest,
  edit: EditManifest,
): ValidationResult<CrossFileManifestPair> {
  const issues: ValidationIssue[] = [];

  if (content.projectId !== edit.projectId) {
    issues.push({
      path: "/projectId",
      message: `projectId '${edit.projectId}' does not match content projectId '${content.projectId}'`,
      code: "manifest.project-mismatch",
    });
  }

  if (content.episodeId !== edit.episodeId) {
    issues.push({
      path: "/episodeId",
      message: `episodeId '${edit.episodeId}' does not match content episodeId '${content.episodeId}'`,
      code: "manifest.episode-mismatch",
    });
  }

  issues.push(...videoMismatchIssues(content.video, edit.video));

  const contentById = new Map(content.items.map((item) => [item.id, item]));
  const trackIds = new Set(edit.tracks.map((track) => track.id));

  for (const [placementIndex, placement] of edit.placements.entries()) {
    const placementPath = `/placements/${placementIndex}`;

    if (!trackIds.has(placement.trackId)) {
      issues.push({
        path: `${placementPath}/trackId`,
        message: `references track '${placement.trackId}', but no matching track exists`,
        code: "track-reference.missing",
      });
    }

    if (placement.source.type !== "content") {
      continue;
    }

    const contentItem = contentById.get(placement.source.ref);
    if (contentItem === undefined) {
      issues.push({
        path: `${placementPath}/source/ref`,
        message: `references content '${placement.source.ref}', but no matching content item exists`,
        code: "content-reference.missing",
      });
      continue;
    }

    const sourceInFrame = placement.sourceInFrame ?? 0;
    const sourceEndFrame = sourceInFrame + placement.durationFrames;
    if (!Number.isSafeInteger(sourceEndFrame)) {
      issues.push({
        path: `${placementPath}/durationFrames`,
        message: "sourceInFrame plus durationFrames must be a safe integer frame",
        code: "frame.range",
      });
      continue;
    }

    if (sourceEndFrame > contentItem.durationFrames) {
      const path = sourceInFrame >= contentItem.durationFrames
        ? `${placementPath}/sourceInFrame`
        : `${placementPath}/durationFrames`;
      issues.push({
        path,
        message:
          `content '${contentItem.id}' has ${contentItem.durationFrames} frames, but the placement requires ` +
          `frames ${sourceInFrame} through ${sourceEndFrame - 1}`,
        code: "content-duration.exceeded",
      });
    }
  }

  const value: CrossFileManifestPair = { content, edit };
  return {
    valid: issues.length === 0,
    issues,
    value,
  };
}

function videoMismatchIssues(contentVideo: VideoSpec, editVideo: VideoSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (contentVideo.width !== editVideo.width) {
    issues.push(videoMismatchIssue("width", contentVideo.width, editVideo.width));
  }

  if (contentVideo.height !== editVideo.height) {
    issues.push(videoMismatchIssue("height", contentVideo.height, editVideo.height));
  }

  if (contentVideo.frameRate.numerator !== editVideo.frameRate.numerator) {
    issues.push(
      videoMismatchIssue(
        "frameRate/numerator",
        contentVideo.frameRate.numerator,
        editVideo.frameRate.numerator,
      ),
    );
  }

  if (contentVideo.frameRate.denominator !== editVideo.frameRate.denominator) {
    issues.push(
      videoMismatchIssue(
        "frameRate/denominator",
        contentVideo.frameRate.denominator,
        editVideo.frameRate.denominator,
      ),
    );
  }

  const contentPixelAspect = contentVideo.pixelAspectRatio ?? 1;
  const editPixelAspect = editVideo.pixelAspectRatio ?? 1;
  if (contentPixelAspect !== editPixelAspect) {
    issues.push(videoMismatchIssue("pixelAspectRatio", contentPixelAspect, editPixelAspect));
  }

  return issues;
}

function videoMismatchIssue(field: string, contentValue: number, editValue: number): ValidationIssue {
  return {
    path: `/video/${field}`,
    message: `edit video ${field} '${editValue}' does not match content video ${field} '${contentValue}'`,
    code: "manifest.video-mismatch",
  };
}
