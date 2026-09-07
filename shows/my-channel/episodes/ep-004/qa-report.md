# Semantic explainer QA

## Purpose

This episode replaces the earlier generic diagram set with 16 scene-specific Remotion explainers.  The visuals use the bright pastel theme from `CaptionDiagramPlacement`, while every layout and animation is selected to explain the corresponding spoken idea.

## Content alignment

The sequence covers the narration from frame 0 through 6477 without gaps: post-production compression, audio-to-explainer handoff, AI editing, waveform surgery, conversational revisions, code-to-visual generation, prompting and rendering, referral growth, speech-to-storyboard mapping, command routing, generation at the spoken beat, iterative revisions, production steps, audio timing, the production conveyor, and the Palmier/Remotion/Codex handoff.

## Verification

- `pnpm --filter @studio/motion-system typecheck` passed.
- `pnpm --filter @studio/motion-system lint` passed.
- `pnpm validate:episode --episode shows/my-channel/episodes/ep-004` passed.
- `pnpm render:episode --episode shows/my-channel/episodes/ep-004` produced all 16 1920x1080, 30 fps H.264 renders with their declared integer frame durations and no audio stream.
- `pnpm qa:episode --episode shows/my-channel/episodes/ep-004` confirmed all 16 declared render artifacts exist.
- `pnpm build-storybook` passed for the `SemanticExplainer` stories.
- The Remotion Player and Palmier timeline were visually inspected across all 16 scenes, including the meaningful late-scene cues for the spoken-beat placement, revision, timing ruler, production conveyor, and final three-role handoff.

## Palmier readback

- `V2_AUTO_GRAPHICS` (`2A334628`) is the top video track and has 16 contiguous semantic clips covering frames 0–6477.
- `Narration` (`3A77B626`) remains separate with 64 clips, a +6.6 dB clip gain, and the requested short breaks at frames 591–603, 4342–4354, and 5824–5836.
- The former 21-clip generic graphics track and its 21 Palmier media assets were removed after the new track was checked.

## Targeted correction: referral growth flywheel

- The `semantic-referral-growth-flywheel` panel originally mixed canvas coordinates with panel-local coordinates, which pushed the referral connector and growth graph outside the panel.
- The scene was rebuilt with local coordinates for its user, referral, and growth stages, the connectors, and the return loop. Local frames 207 and 309 were visually checked after re-rendering.
- Palmier imported the corrected 408-frame render and swapped it into the existing clip `9E5BDA8E` at frames 2309–2717. The clip retained its placement and now references `AB022287`; the former source asset was deleted after the timeline inspection.

## Previous correction: audio timing ruler (superseded by V3 below)

- The `semantic-audio-is-the-timing-ruler` scene had its external ruler, moving marker, diagram card, and lower labels sharing the same visual lane.
- The corrected scene gives the audio highlight, fixed marker, moving diagram card, ruler, and assistance labels separate panel-local lanes. The diagram now moves beside the marker rather than having the marker cross it during the snap.
- The 587-frame corrected render was inspected at four animation phases, then swapped into Palmier clip `3732DED1` at frames 4918–5505. The clip retained its placement and now references `E29BAE38`; the former source asset was deleted after the timeline inspection.

## V3 semantic rebuild: audio meaning and placement

The scene was rebuilt from its word-level timeline transcript. It now demonstrates the full spoken operation: ask Codex to use the edited audio, create pictures matching its meaning, then place each picture at the corresponding speech interval. The pastel theme is retained; the previous ruler layout is no longer used.

- Act 1 shows the Codex request and a concrete speech → referral diagram → Palmier placement example. Act 2 expands the operation into three matching pairs: more users / more people, referrals / branching people, and faster growth / a rising curve. The examples are explicitly labeled as placement examples, not quoted as narration from this scene.
- Local cue frames are `[0,75,165,224,319,400,458,512]`, anchored to the actual words in timeline frames `[4918,5505)`. Duration and placement remain 587 frames.
- `SemanticExplainer` and the content ID remain stable. `AudioMeaningPlacement` provides the new internal drawing and animation. Content props, the dedicated Storybook variant, script cues, and edit inspection frames were updated together.
- Full workspace typecheck, lint, Storybook build, and episode manifest validation passed. Phase 1 artifact QA found all 16 declared files. It does not perform visual inspection; the additional visual checks below were performed separately.
- The existing `renderEpisode` implementation rendered only this selected content item after validating the entire episode. Output: `renders/remotion-semantic/semantic-audio-meaning-placement-v3.mp4`, H.264, 1920×1080, 30 fps, 587 frames, no audio. The other 15 render files were left untouched. Final content hash: `22cd9291940489e20b4168b9da20556e157e73a452b705189ffdb573bc91333f`.
- Rendered phases were checked at local frames 250, 498, 537, and 575, including generation, moving cards, and settled placement. The inherited default footer was explicitly suppressed to prevent overlap. The Storybook Player was checked by frame seek and playback, including frame 586.
- Live timeline and media were read before a targeted Media Swap dry-run; there were no conflicts. Palmier clip `3732DED1` now references media `1B6D7789`, named `14-semantic-audio-timing-ruler`, at unchanged frames `[4918,5505)`. The old library asset is labeled `v2-superseded` for rollback.
- Palmier rendered timeline inspection at frames `[5196,5252,5308,5364,5420,5476]` confirmed the new scene. Full read-back confirmed all other 15 video clips and the complete 64-clip Narration track were unchanged, including gains, trims, fades, and the three intentional pauses. Total timeline length remains 6477 frames. Local evidence is saved in `state/timing-v3-sync.json`.

## V2 semantic rebuild: three tools and the closing workflow

The closing scene at `[5836,6477)` was rebuilt from its word-level narration. It now demonstrates Palmier editing a waveform, Remotion turning AI-written code into a graph, and Codex sending chat instructions to both tools. The second act follows the spoken summary: read a script, record audio, pass the audio through editing, create explanatory graphics, and place them on the timeline. A Codex instruction bar connects to all three post-recording operations at the final spoken cue.

- The stable content ID and `SemanticExplainer` composition remain unchanged. The internal `ThreeToolHandoff` scene, its existing `LongFinishEdge` Storybook variant, content props, script cues, and edit inspection frames were updated together. A separate output path preserves the former render until the live swap.
- Main local cues: `[0,151,298,343,418,488,545,587]`. Supporting actions align at frames 80 (editing), 237 (generated animation), 435/453 (voice/recording), and 512 (diagram creation). The scene stays 641 frames long.
- Workspace typecheck and lint, Storybook build, full episode manifest validation, and all 16 artifact existence checks passed. Artifact QA remains Phase 1; the visual checks below were performed separately.
- The existing `renderEpisode` implementation rendered only the selected content item after full episode validation. Output: `renders/remotion-semantic/semantic-three-tool-handoff-v2.mp4`, H.264, 1920×1080, 30 fps, 641 frames, no audio. Final content hash: `e2a9132556744b03172d50bbfe9fdf7aa30c22adbbec707fba67046d55e055b9`. The other 15 renders were left untouched.
- Rendered frames 60, 278, 380, 470, 537, and 630 were visually inspected for the individual roles, Codex connections, recording, intermediate build, and finished workflow. The audio-transfer arrowhead was delayed until its line arrives. Storybook Player playback and frame 640 were checked.
- Live timeline/media reads and a targeted Media Swap dry-run found no conflicts. Palmier clip `40C4DF19` now references `8CE66F66`, named `16-semantic-three-role-finish`, at unchanged frames `[5836,6477)`. The old library asset is labeled `v1-superseded` for rollback.
- Palmier inspection at `[6110,6192,6273,6354,6436,6476]` showed the new scene and its settled ending. Full read-back confirmed the other 15 video clips, complete Narration track, three pauses, and total 6477-frame timeline length were unchanged. Local evidence is in `state/finish-v2-sync.json`.

## V2 rebuild: remaining fourteen narration scenes

Scenes 1–13 and 15 were rebuilt from the current edited timeline narration. The user-approved scenes 14 and 16 were explicitly excluded. Their content and placement entries, dedicated source files, and rendered video SHA256 values are unchanged.

- The bright pastel theme is retained. Scene-specific diagrams now show actual waveform cuts, a command becoming an editing operation, captions and clip duration changing, code becoming different visual forms, referrals reaching new people, speech becoming a storyboard, and generated pictures moving to the corresponding voice interval. The production summary follows the narrated steps. Remotion is used because coordinated drawing, state changes, and timed transfers make the explanations clearer as finished video assets.
- Public composition and content IDs remain stable. Content props, output paths, script cues, and inspection frames are recorded in the manifests. The fourteen-scene Storybook catalog uses the same manifest props. Frames and durations remain integers.
- Full workspace typecheck and lint, full episode validation (0 issues), and final Storybook build passed. The existing renderEpisode API rendered only the fourteen selected items after validating the entire episode. Output directory: `renders/remotion-semantic-v2/`. Per-item rendered actions and content hashes are in `state/bulk-v2-sync.json`.
- Phase 1 artifact QA confirmed all 16 declared files exist. Separate ffprobe checks verified the fourteen new outputs are H.264, 1920×1080, 30 fps, their exact declared frame counts, and contain no audio stream. Forty-five inspection images were extracted. Early and settled phases were visually reviewed for each scene; corrected transitions and final renders were checked again.
- Visual corrections included separated material clips throughout their move, removal of unwanted waveform spans before the retained spans close, intentional Japanese line breaks, an arrow landing at the generated picture, and matching simplified diagrams in the main preview and timeline thumbnail. Storybook Player frame seeking and playback were also checked.
- Live Timeline and Media reads preceded a targeted Media Swap dry-run with fourteen operations and zero conflicts, insertions, deletions, or ripple operations. All fourteen new media were imported and read back before being swapped into the existing clips. Old media remain labeled `v1-superseded` for rollback.
- Native Palmier inspections at timeline frames 337, 592, 970, 1278, 1792, 2086, 2298, 2706, 3048, 3458, 3919, 4343, 4907, and 5825 confirmed all fourteen new scenes on the timeline. These additional live inspections are separate from the repository's Phase 1 QA.
- Final Timeline and Media readback passed: all 16 graphic clip IDs and placements remain unchanged; only the fourteen intended media references changed. The two excluded clips retain media 1B6D7789 and 8CE66F66. The entire 64-clip Narration track is unchanged, including trims, +6.6 dB gains, fades, and all three pauses. Total timeline duration remains 6477 frames. Complete mapping and readback evidence: `state/bulk-v2-sync.json`.

## Native introductory scene: この動画の説明

A 300-frame (10-second) editable Palmier introductory card was added at the beginning, using the existing cream, navy, sky-blue and lavender palette. It states that this explanatory video was made only with Palmier Pro + Remotion + Codex, and displays the user-specified production model GPT-6 Astra（極高）. Text fades in sequentially and remains visible through the end of the card. No new narration was generated.

- Native editable text and a generated solid matte were selected because this is a short production note. No Remotion item was added or rerendered. All sixteen existing content entries remain byte-identical.
- The explicit prepend request authorized a one-time movement of all 80 original video/audio clips by +300 integer frames. Live Timeline/Media reads, manifest validation, and the recorded dry-run preceded writes. No ripple operation was used. The existing graphic placements and script table were shifted by the same amount; native scene styles and timing are recorded in edit.json metadata.nativeScenes.
- The final card consists of five simultaneous text layers on separate native tracks and a matte on V2_AUTO_GRAPHICS. Palmier inspection at frames 60, 150, 270 and 330 confirmed readable text, separate vertical regions, and the transition to the original body.
- Full episode validation passed with zero issues. Phase 1 artifact QA found all 16 existing render files. Type checking and Remotion rendering were not needed because this change contains native Palmier edits and manifest placement changes.
- Final live readback confirmed all 80 original clip IDs, sources, durations, trims, gains and fades were preserved, with exactly +300 added to their timeline positions. All 64 narration clips remain synchronized with the 16 graphics clips. The original three pauses now occupy [891,903), [4642,4654), and [6124,6136); the body begins at frame 300. Total duration is 6777 frames (225.9 seconds). Complete dry-run, final scene specification and readback are saved in state/intro-native-sync.json.
