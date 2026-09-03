# 動画制作基盤の運用ルール

## ミッション

Palmierネイティブの編集可能な表現と、コード生成の価値が高いRemotion表現を分けた、再利用可能なVideo Design Systemを構築する。Remotionのレンダリング成果物はPalmier Proへ安全に配置・同期する。

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

## RemotionとPalmierの表現選択ガイド

新しい表現では、再利用性だけでなく「コード生成の価値が、レンダー・受け渡し・差し替えのコストを上回るか」を先に判断する。この節は固定的な責務分離ではなく、編集可能性と制作効率を両立するための推奨ガイドである。

- 編集中に文言、改行、表示尺、位置を頻繁に調整するものはPalmierを第一候補とする。通常テロップ、字幕、基本的な名前・肩書き、単純タイトル、BGM/SE、カットと尺調整、簡単な画像配置、基本トランジションが該当する。
- データ連動グラフ、コードアニメーション、複雑な図解、ブランド固有のOP/ED、多数要素が連動するモーション、プログラム生成のランキング・比較表はRemotionを第一候補とする。
- 名前・肩書き・タイトルなどでも、ブランド固有のルック、複数要素が連動するリッチなモーション、再利用できるアニメーション設計に明確な価値がある場合は、Remotionを選んでよい。その場合は、焼き込み後に完成素材として扱える理由と、Palmierで直接編集するより得られる価値を記録する。
- 新規表現は、(1) Palmierネイティブ機能で十分か、(2) 編集で触る可能性が高いか、(3) データ駆動・再現性・複雑な連動がレンダーコストを上回るか、の順で判断する。迷う場合はPalmierを推奨するが、明示的なデザイン要件や上記の価値があればRemotionを選択できる。
- 単純なテキスト変更、タイミング変更、改行変更だけのためにRemotion素材を新設・再レンダーしない。Palmierを選んだ場合は、content.json のRemotion itemとして代替表現を作らない。
- 現在はライブPalmier adapterが未実装である。Palmierを選んだ表現は、アダプタ不在を理由にRemotionへ置換せず、必要な編集仕様を記録してPalmier側の作業として扱う。実書込みは既存の同期安全規則に従う。

## RemotionとStorybook

- アニメーションは`useCurrentFrame()`、`useVideoConfig()`、`interpolate()`、Springでフレーム駆動にする。
- CSS `transition` / `animation`や未seed乱数をレンダリング対象に使わない。
- 公開Composition IDはAPIとして扱い、Manifest移行なしに変更しない。
- 公開コンポーネントには型、必要なZod schema、Default/Variant Storyを用意する。
- Storybookは`@remotion/player`でカタログを提供し、Remotion Studioはフレーム単位の制作に使う。
- 新規表現はFirst-party Catalog、既存Wrapper、Remotion Bits公式Docs、新規実装の順に検討する。

## 完了条件

変更したEpisodeは、Schema・相互参照・props・素材・衝突の検証を通過し、必要なレンダリング／検査結果をレポートする。同期処理はPalmierの状態をread-backしてから完了とする。
