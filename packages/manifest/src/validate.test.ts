import {describe, expect, it} from "vitest";
import type {ContentManifest, EditManifest} from "./types.js";
import {
  validateContentManifest,
  validateCrossFile,
  validateEditManifest,
} from "./index.js";

const createContent = (): ContentManifest => ({
  manifestType: "content",
  schemaVersion: "1.0.0",
  projectId: "test-show",
  episodeId: "ep-001",
  video: {
    width: 1920,
    height: 1080,
    frameRate: {numerator: 30, denominator: 1},
  },
  catalog: {package: "@studio/motion-system", revision: "test"},
  items: [
    {
      id: "title",
      compositionId: "TitleCard",
      durationFrames: 90,
      props: {title: "A valid title"},
      render: {outputFile: "renders/title.mp4", container: "mp4", codec: "h264"},
    },
  ],
});

const createEdit = (): EditManifest => ({
  manifestType: "edit",
  schemaVersion: "1.0.0",
  projectId: "test-show",
  episodeId: "ep-001",
  video: {
    width: 1920,
    height: 1080,
    frameRate: {numerator: 30, denominator: 1},
  },
  target: {palmierProject: "test-show_ep-001", timeline: "main"},
  tracks: [
    {
      id: "auto-graphics",
      kind: "video",
      role: "graphics",
      palmierName: "V2_AUTO_GRAPHICS",
      managed: true,
    },
  ],
  placements: [
    {
      id: "place-title",
      source: {type: "content", ref: "title"},
      trackId: "auto-graphics",
      startFrame: 0,
      durationFrames: 90,
      sync: {policy: "strict", allowOverwrite: false},
    },
  ],
});

describe("Manifest validation", () => {
  it("accepts a valid pair of content and edit manifests", () => {
    const content = createContent();
    const edit = createEdit();

    expect(validateContentManifest(content).valid).toBe(true);
    expect(validateEditManifest(edit).valid).toBe(true);
    expect(validateCrossFile(content, edit).valid).toBe(true);
  });

  it("rejects an incompatible container and codec", () => {
    const content = createContent();
    content.items[0]!.render.codec = "vp9";

    expect(validateContentManifest(content).issues).toContainEqual(
      expect.objectContaining({code: "render.codec-container"}),
    );
  });

  it("rejects overlapping placements on a managed track", () => {
    const edit = createEdit();
    edit.placements.push({
      id: "place-title-again",
      source: {type: "content", ref: "title"},
      trackId: "auto-graphics",
      startFrame: 45,
      durationFrames: 30,
      sync: {policy: "strict", allowOverwrite: false},
    });

    expect(validateEditManifest(edit).issues).toContainEqual(
      expect.objectContaining({code: "managed-track.collision"}),
    );
  });
});
