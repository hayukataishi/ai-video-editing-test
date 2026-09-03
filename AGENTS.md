# 動画制作基盤の運用ルール

## ミッション

再利用可能なRemotion Motion Design Systemを構築し、レンダリング成果物をPalmier Proへ安全に配置・同期する。

## Source of Truth

- `content.json` は「何をレンダリングするか」の唯一の正。
- `edit.json` は「どこへ配置するか」の唯一の正。
- `renders/`、`.video-cache/`、Palmier Media/Clip IDは生成物またはローカル状態であり、Gitの正ではない。
- Palmierの人間管理Trackは、明示的な一回限りの依頼がない限り読み取り専用とする。

## 安全規則

- `managed: true` のTrackだけを自動Reconcile対象にする。
- `allowOverwrite: false` の衝突は、上書きせず失敗として報告する。
- Palmierへ書き込む前にMediaとTimelineを読み、必ずdry-run計画を出す。
- Ripple Insert/Deleteは人間管理Timelineでは使わない。
- 同一論理素材の更新では、既存編集を保つMedia Swapを優先する。
- フレームは整数で扱い、時間を浮動小数点秒へ往復変換しない。

## RemotionとStorybook

- アニメーションは`useCurrentFrame()`、`useVideoConfig()`、`interpolate()`、Springでフレーム駆動にする。
- CSS `transition` / `animation`や未seed乱数をレンダリング対象に使わない。
- 公開Composition IDはAPIとして扱い、Manifest移行なしに変更しない。
- 公開コンポーネントには型、必要なZod schema、Default/Variant Storyを用意する。
- Storybookは`@remotion/player`でカタログを提供し、Remotion Studioはフレーム単位の制作に使う。
- 新規表現はFirst-party Catalog、既存Wrapper、Remotion Bits公式Docs、新規実装の順に検討する。

## 完了条件

変更したEpisodeは、Schema・相互参照・props・素材・衝突の検証を通過し、必要なレンダリング／検査結果をレポートする。同期処理はPalmierの状態をread-backしてから完了とする。
