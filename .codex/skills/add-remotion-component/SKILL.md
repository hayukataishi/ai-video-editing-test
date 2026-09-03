---
name: add-remotion-component
description: "再利用可能なRemotionコンポーネントを、Zod props、安定Composition、Storybook、サンプルContent、検証まで一貫して追加する。新規表現または公開部品の拡張時に使い、Episode固有の配置だけには使わない。"
---

# Add Remotion Component

再利用可能な Motion System の部品を、公開APIとして安全に追加する。入力として Component 名、props、尺、Canvas サイズ、デザイン要件、必要ならサンプルを置く Episode を受け取る。

不足した入力は、既存の Show 設定とコンポーネントの慣例から最小限に補う。ただし、公開 Composition ID、Canvas、または props 契約が大きく変わる場合は、仮定した内容を明示する。

## Remotion 採用ゲート

実装前に、まず Palmier ネイティブで十分かを判断する。編集時に文言、改行、表示尺、位置を頻繁に触る通常テロップ、字幕、基本的なLower Third、単純タイトル、簡単な画像配置、BGM/SE、基本トランジションは Palmier を第一候補とする。

これは禁止ではない。名前・肩書き・タイトルでも、ブランド固有のルック、複数要素が連動するリッチなアニメーション、再利用可能なモーション設計に明確な価値があり、完成素材として扱えるなら Remotion を選んでよい。データ駆動、プログラム生成、複雑なキネティックタイポグラフィ、コードアニメーション、複雑な図解、ブランドOP/ED、多数要素の連動も同様に適した候補である。

迷う場合は Palmier を推奨する。現在のライブPalmier adapter未実装は、単純な表現をRemotion化する理由にならない。Palmierを選んだ場合は必要な編集仕様を記録し、実書込みや同期はPalmierの安全な別ワークフローに任せる。Remotionを選んだ場合は、編集後にほぼ固定素材として扱える理由と、レンダーコストを上回る表現上の価値を引き渡し時に示す。

## 事前確認

最初に、対象 Show/Episode の AGENTS.md、docs/component-authoring.md、既存コンポーネント、packages/motion-system/src/Root.tsx、packages/motion-system/src/index.ts を読む。

- 既存の First-party Catalog、Show 固有 Wrapper、Remotion Bits 公式Docs の順に再利用可能性を確認する。既存部品で満たせる場合は新しい公開部品を増やさない。
- 公開部品は Episode 専用の画面にしない。配置時刻、Track、Palmier の編集意図は edit.json に置く。
- Show 固有の見た目が必要なら、公開 Composition ID を変更せず Show 側 Wrapper を検討する。

## 実装する公開契約

packages/motion-system/src/components/<Name>.tsx に、次を同じ変更で追加する。

- stable で一意な Composition ID
- Zod schema、schema の output を使う TypeScript props 型、JSON シリアライズ可能な defaultProps
- 対応 Canvas、推奨 duration、Safe Zone、音声と alpha 出力の可否をコードコメントまたは近接ドキュメントに明記
- useCurrentFrame()、useVideoConfig()、interpolate()、spring() を使うフレーム駆動の motion

CSS transition、CSS animation、現在時刻、未seed乱数は使わない。色・フォント・基本モーションは Motion System Theme または Show の Token を使い、Episode 名や固定素材を公開部品へ埋め込まない。

props が素材を参照する場合は、絶対パスや Palmier Media/Clip ID ではなく論理 Asset ID を受け取る。新しい論理素材propsを増やす前に packages/pipeline/src/asset-props.ts を確認し、レンダー時に解決できる明示的な処理と検証を同じ変更に含める。現状の logoAssetId は image Asset をレンダー時の logoSrc に解決する契約である。

Composition ID は Content schema の英数字とハイフンだけの命名規則に適合させる。指定された Component 名がこの公開 ID として不適切なら、使う ID を明示してから実装する。

## Registry と Storybook

次の公開面を同期させる。

1. packages/motion-system/src/components/index.ts から Component、schema、defaultProps、型を export する。
2. packages/motion-system/src/Root.tsx に Composition を登録する。id、component、durationInFrames、fps、width、height、schema、defaultProps を揃える。
3. packages/motion-system/src/index.ts の compositionRegistry に、同じ ID、schema、defaultProps、defaultDurationInFrames、fps、width、height を登録する。必要なら package.json の個別 export も追加する。
4. 公開済み ID を改名しない。改名が必要なら、先に Manifest migration を設計する。

packages/motion-system/src/components/<Name>.stories.tsx を追加する。@remotion/player の Player に args を inputProps として渡し、Composition と同じ duration、fps、Canvas を使う。

- Default Story を必ず作る。
- 主要なデザインまたはコンテンツ Variant を少なくとも1つ作る。
- 長い日本語、最小/最大配列、欠落可能な値など、実際の props 境界を表す Edge case を少なくとも1つ作る。

## サンプル Content

独立した manifest.json は作らない。content.json と edit.json が正規 Manifest である。

指定されたサンプル Episode の content.json に、実際にレンダー可能な item を追加する。Episode が未指定の場合は、既存の canonical sample が適切か確認してから選ぶ。

- item ID は論理IDの命名規則に従い、Composition ID、整数 durationFrames、Zod に適合する props、render 仕様を入れる。
- 使う Asset は content.json の assets に宣言し、item.dependencies にも入れる。Asset path は Episode からの安全な相対パスにする。
- 出力先は Episode 内の renders/remotion/<item-id>.<ext> を基本とし、container と codec、alpha、audio の組み合わせをスキーマに適合させる。
- 配置要求がない限り edit.json には Placement を追加しない。

Root/Registry の Canvas と fps を対象 Episode の content.video と比較する。render:episode は Root の既定値ではなく content.video の width、height、fps を渡すため、異なる Canvas（例: 縦型）を既存の横型 Episode のサンプルに混ぜない。Canvas が異なる場合は、video 仕様が一致する Episode を選ぶか、意図した responsive 対応を実装・検査したうえで差異を報告する。この一致は validate:episode だけでは保証されない。

## 検証と引き渡し

対象 Episode を指定して、次を実行する。

~~~sh
pnpm lint
pnpm typecheck
pnpm build-storybook
pnpm validate:episode --episode <episode-dir>
~~~

失敗時は、自分の変更による失敗を修正して再実行する。既存の失敗なら変更由来の失敗と区別して報告する。完了時には、追加した公開 ID、props 契約、Story（Default/Variant/Edge case）、サンプル item、実行結果を簡潔に示す。
