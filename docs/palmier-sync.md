# Palmier同期の安全規則

## 現在の状態

ライブPalmier MCP adapterはPhase 1では未実装である。このリポジトリのManifestとPipelineは、将来のAdapterに渡す宣言とdry-run計画の基盤であり、Palmierへの実書き込みが成功したように見せる出力をしてはならない。

## 同期前提

- `content.json` と `edit.json` のSchema・意味検証が成功している。
- 必要なRender Artifactが存在し、現在のContent Hashと一致している。
- 対象のPalmier Project／Timeline、Media Library、Track、既存ClipをRead APIで取得している。
- ユーザーがdry-run planの追加、移動、swap、保持、警告を確認している。

## dry-runの必須ルール

dry-runは状態を変更しない。少なくとも次を出力する。

- 対象ProjectとTimeline、管理対象Track
- import、add、move、swap、marker変更の予定
- 既存手動Clipと、保持するPalmier Effect／Keyframe
- Content Hashが変わり再レンダリングが必要なItem
- Track内の時間重複、未解決参照、overwrite要求などの失敗理由

`allowOverwrite: false` のPlacementに衝突があれば、同期を停止する。人間管理Track（`managed: false`）は読み取り専用とし、Ripple Insert／Deleteは既定で使わない。

## 将来の書き込み順序

1. Palmier接続と対象Project／Timelineを確認する。
2. MediaとTimelineの現状を再読込し、dry-runとの差分を再計算する。
3. `managed: true` の専用Trackだけを更新する。
4. 同一Logical Assetの更新は、レイアウト、Effect、Keyframeを保てる `swap_clip_media` を優先する。
5. `inspectionFrames` とPlacement境界を検査し、機械可読Reportと短い人間向けサマリーを残す。

失敗、未接続、Collision、未承認のOverwriteは成功として報告しない。最終書き出しはManifest検証、Timeline検査、人間レビューの後にのみ行う。
