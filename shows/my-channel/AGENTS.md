# My Channel の制作ルール

- `theme/tokens.json` をShowの色、文字、Safe Zone、基本モーションの唯一の参照元とする。個別Episodeで同じ値を再定義しない。
- 公開済みの `TitleCard`、`FlowDiagram` などは `@studio/motion-system` から利用する。Show固有の見た目が必要な場合は `component-wrappers/` にWrapperを追加し、公開Composition IDを直接変更しない。
- 画面内の重要な文字・ロゴは、`show.config.json` のnormalized Safe Zone（上下左右8%）に収める。
- Episodeの論理ID、Content Item ID、Placement IDは一度同期を始めたら変更しない。Palmierが生成したMedia IDやClip IDはManifestへ記録しない。
- 同期の対象は `V2_AUTO_GRAPHICS` のみとする。このTrackは `managed: true`、人間用の `V1_MAIN_HUMAN` と `A1_VOICE_HUMAN` は `managed: false` である。
- Palmierへ書き込む前に、必ずManifestの検証、dry-run plan、現在のMedia／Timelineの読み取り、Collision Checkを行う。`allowOverwrite: false` の衝突は解決または明示承認まで失敗として扱う。
- 同じShowでPalmier同期中のEpisode以外は変更しない。Palmier Project名は `{showId}_{episodeId}`、標準Timeline名は `main` とする。
