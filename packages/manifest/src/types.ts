/** A stable, manifest-owned identifier. */
export type LogicalId = string;

/** A path relative to the manifest's owning directory. */
export type RelativePath = string;

export interface FrameRate {
  numerator: number;
  denominator: number;
}

export interface VideoSpec {
  width: number;
  height: number;
  frameRate: FrameRate;
  pixelAspectRatio?: number;
}

export interface CatalogReference {
  package: string;
  revision: string;
}

export type AssetKind = "image" | "video" | "audio" | "font" | "data" | "other";

export interface Asset {
  kind: AssetKind;
  path: RelativePath;
  sha256?: string;
  licenseNote?: string;
  description?: string;
}

export type RenderContainer = "mp4" | "mov" | "webm" | "png-sequence";
export type RenderCodec = "h264" | "h265" | "prores" | "vp8" | "vp9" | "png";
export type ProresProfile = "proxy" | "light" | "standard" | "hq" | "4444" | "4444-xq";

export interface RenderSpec {
  outputFile: RelativePath;
  container: RenderContainer;
  codec: RenderCodec;
  alpha?: boolean;
  audio?: boolean;
  pixelFormat?: string;
  proresProfile?: ProresProfile;
  overwrite?: boolean;
}

export interface ContentItem {
  id: LogicalId;
  compositionId: string;
  variant?: LogicalId;
  durationFrames: number;
  props: Record<string, unknown>;
  dependencies?: LogicalId[];
  render: RenderSpec;
  description?: string;
  tags?: string[];
}

export interface ManifestMetadata {
  title?: string;
  author?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface ContentManifest {
  $schema?: string;
  manifestType: "content";
  schemaVersion: string;
  projectId: LogicalId;
  episodeId: LogicalId;
  video: VideoSpec;
  catalog: CatalogReference;
  themeId?: LogicalId;
  assets?: Record<LogicalId, Asset>;
  items: ContentItem[];
  metadata?: ManifestMetadata;
}

export type TrackKind = "video" | "audio";
export type TrackRole =
  | "primary"
  | "broll"
  | "graphics"
  | "overlay"
  | "captions"
  | "voice"
  | "music"
  | "sfx"
  | "reference"
  | "other";

export interface EditTrack {
  id: LogicalId;
  kind: TrackKind;
  role: TrackRole;
  palmierName: string;
  order?: number;
  managed: boolean;
  syncLock?: boolean;
  mute?: boolean;
  hidden?: boolean;
}

export type PlacementSourceType = "content" | "file" | "palmier-media" | "timeline";

export interface PlacementSource {
  type: PlacementSourceType;
  ref: string;
}

export interface PalmierTarget {
  palmierProject: string;
  timeline: string;
  createIfMissing?: boolean;
  duplicateFromTimeline?: string;
}

export interface Position {
  unit: "normalized" | "pixels";
  x: number;
  y: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Crop {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface PlacementLayout {
  preset?:
    | "full-frame"
    | "contain"
    | "cover"
    | "picture-in-picture"
    | "sidebar-left"
    | "sidebar-right"
    | "split-left"
    | "split-right"
    | "grid";
  position?: Position;
  anchor?: Position;
  scale?: number;
  rotationDegrees?: number;
  opacity?: number;
  crop?: Crop;
  blendMode?: string;
}

export interface PlacementAudio {
  volumeDb?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

export type KeyframeProperty =
  | "opacity"
  | "rotation"
  | "position"
  | "scale"
  | "crop"
  | "blur"
  | "volume";

export type KeyframeInterpolation = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "hold";
export type KeyframeValue = number | Vector2 | Crop;

export interface KeyframePoint {
  frameOffset: number;
  value: KeyframeValue;
  interpolation?: KeyframeInterpolation;
}

export interface KeyframeLane {
  property: KeyframeProperty;
  points: KeyframePoint[];
}

export type SyncPolicy = "strict" | "placement-only" | "once" | "manual";

export interface PlacementSync {
  policy: SyncPolicy;
  allowOverwrite: boolean;
  preservePalmierEffects?: boolean;
}

export interface Placement {
  id: LogicalId;
  source: PlacementSource;
  trackId: LogicalId;
  startFrame: number;
  durationFrames: number;
  sourceInFrame?: number;
  layout?: PlacementLayout;
  audio?: PlacementAudio;
  keyframes?: KeyframeLane[];
  sync: PlacementSync;
  notes?: string;
}

export interface Marker {
  id: LogicalId;
  startFrame: number;
  endFrame?: number;
  label: string;
  note?: string;
  managed?: boolean;
}

export interface EditManifest {
  $schema?: string;
  manifestType: "edit";
  schemaVersion: string;
  projectId: LogicalId;
  episodeId: LogicalId;
  video: VideoSpec;
  target: PalmierTarget;
  tracks: EditTrack[];
  placements: Placement[];
  markers?: Marker[];
  inspectionFrames?: number[];
  metadata?: ManifestMetadata;
}

/** A validation problem suitable for direct CLI output. Paths use JSON Pointer syntax. */
export interface ValidationIssue {
  path: string;
  message: string;
  code?: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  issues: ValidationIssue[];
  value?: T;
}

export interface ComponentPropsValidationIssue {
  /** Relative JSON Pointer below the component props object, if known. */
  path?: string;
  message: string;
  code?: string;
}

export interface ComponentPropsValidationResult {
  valid: boolean;
  issues?: readonly ComponentPropsValidationIssue[];
}

export interface ComponentPropsValidationContext {
  item: ContentItem;
  manifest: ContentManifest;
}

/**
 * An adapter owned by Motion System can implement this without making the
 * manifest package depend on Zod, Remotion, or a concrete component catalog.
 */
export type ComponentPropsValidator = (
  props: Record<string, unknown>,
  context: ComponentPropsValidationContext,
) => ComponentPropsValidationResult | boolean | void;

export interface ComponentDefinition {
  minDurationFrames?: number;
  maxDurationFrames?: number;
  validateProps?: ComponentPropsValidator;
}

export type ComponentResolver = (compositionId: string) => ComponentDefinition | undefined;

export interface ManifestValidationOptions {
  componentResolver?: ComponentResolver;
}

export interface CrossFileManifestPair {
  content: ContentManifest;
  edit: EditManifest;
}
