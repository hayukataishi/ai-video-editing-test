# コンポーネント作成ガイド

`packages/motion-system` に置く公開Componentは、1本のEpisode専用の画面ではなく、propsで内容を差し替えられる動画部品として作る。Episode固有の配置タイミングはComponentではなく `edit.json` に置く。

## 公開前の必須契約

- 変更しないstableな `compositionId` を持つ。名前を変える場合はManifest migrationを用意する。
- TypeScript props型、必要な入力制約を表すZod schema、JSONシリアライズ可能なdefaultPropsを持つ。
- 対応Canvas、推奨duration、Safe Zone、音声とalpha出力の可否を明記する。
- `@remotion/player` を使うDefault Storyと主要Variant StoryをStorybookへ追加する。Controlsのargsは `Player.inputProps` へ渡す。
- 代表的なフレームでVisual Regressionを確認する。

## 実装規則

- Motionは `useCurrentFrame()`、`useVideoConfig()`、`interpolate()`、`spring()` と明示的なFrame計算で作る。CSS `transition`／`animation`、現在時刻、seedなし乱数には依存しない。
- ブランド値はShowのTheme TokenまたはMotion SystemのThemeから読む。Component内に色、フォント、Episode名を固定しない。
- `props`からAsset IDを受ける場合は、PipelineでAsset辞書から解決する。ローカル絶対パスやPalmier IDをpropsへ入れない。
- 新しい表現は、既存Storybook Catalog、Show Wrapper、Remotion Bits公式Docs、新規First-party実装の順で検討する。外部Componentを採用して公開APIにする場合はWrapperで境界を作り、出自・version・Storyを記録する。

## 追加手順

1. 既存Componentで表現できないことを確認する。
2. props schema、defaultProps、Composition登録、Storyを同じ変更で追加する。
3. 代表propsでStudioとStorybookを確認し、必要ならEpisodeのContent Manifestを更新する。
4. 型検査、lint、Storybook build、Visual Regressionを通してからstable APIとして扱う。
