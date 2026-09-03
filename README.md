# AI Video Editing Studio

Remotionで再利用可能な動画コンポーネントを実装し、Storybookでカタログ化したうえで、Manifestを介してPalmier Proのタイムラインへ安全に配置するためのpnpmモノレポです。

## 構成

- `packages/motion-system`: Remotion Component、Composition、Theme、Storybook
- `packages/manifest`: Content / Edit Manifestの型、Schema、意味的検証
- `packages/pipeline`: validate、render、Palmier dry-run、QAのCLI
- `shows/`: 番組・EpisodeごとのBrief、Script、Manifest、素材

## 初期化

```bash
pnpm install
pnpm typecheck
pnpm validate:episode --episode shows/my-channel/episodes/ep-001
pnpm storybook
```

`render:episode`は変更されたContent ItemだけをRemotionでレンダリングします。`palmier:plan`は書き込みをせず、Palmier同期で予定される操作を表示します。`palmier:sync`はPalmier MCP Adapterが実装・接続されるまで安全に停止します。

## 基本フロー

```text
Storybook Catalog → content.json → Remotion Render → edit.json
→ Pipeline（validate / plan / reconcile）→ Palmier Pro → Human finish
```

設計判断と安全規則は[docs/architecture.md](docs/architecture.md)と[AGENTS.md](AGENTS.md)を参照してください。
