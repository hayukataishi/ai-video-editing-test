---
name: author-episode-manifests
description: "台本と素材一覧から、Episode の content.json と edit.json を既存スキーマに沿って安全に作成・更新する。Remotion素材の宣言や自動グラフィックス配置を追加・修正するときに使う。"
---

# Author Episode Manifests

台本、Brief、素材一覧を、レンダー意図の content.json と配置意図の edit.json に分けて安全に反映する。独立した manifest.json を導入しない。

必要な入力は、対象 Episode、台本または Brief、利用可能な素材、使う Composition、尺、配置意図である。未確定の内容は実在しない Asset、Palmier ID、Timeline 状態として補完しない。

## 表現の配置判断

content.json に item を追加する前に、root AGENTS.md の Remotion と Palmier の表現選択ガイドを適用する。通常テロップ、字幕、基本的なLower Third、単純タイトル、BGM/SE、カットと尺調整、簡単な画像配置、基本トランジションはPalmierネイティブの編集対象を推奨する。

ただし、名前・肩書き・タイトルであっても、ブランド固有のルックやリッチなアニメーションに明確な価値があり、レンダー後にほぼ完成素材として扱えるならRemotion itemを作成してよい。データ駆動・プログラム生成・複雑な連動もRemotionに適した根拠である。Palmierを選んだ表現は、アダプタ不在を理由にRemotionへ代替せず、必要な編集意図を台本・Brief・notesへ記録する。Palmierの実書込みはこのスキルの範囲外である。

## 読み取りと境界

変更前に、root と Show の AGENTS.md、show.config.json、theme/tokens.json、brief.md、script.md、対象 Episode の content.json と edit.json、Composition Registry と Zod schema を読む。

- content.json は「何をレンダーするか」、edit.json は「どこに置くか」の唯一の正とする。
- renders、state、.video-cache、Palmier の Media ID/Clip ID は生成状態であり、Manifest に書き戻さない。
- 既に同期を始めた logical ID、Content item ID、Placement ID は改名しない。
- Show の video、Theme、Safe Zone、Palmier project 名と Timeline の慣例を守る。CLI が直接検証しない Safe Zone と台本時刻の整合も確認する。

新規 Episode では、両ファイルが最初から必要である。対象 Show の既存 Episode を構造テンプレートとして読み、値を記憶で組み立てない。

- content.json は $schema、manifestType: content、schemaVersion、projectId、episodeId、video、catalog、items を必須にし、Show の Theme/Asset 方針に合わせる。
- edit.json は $schema、manifestType: edit、schemaVersion、projectId、episodeId、video、target、tracks、placements を必須にし、必要な markers、inspectionFrames、metadata を追加する。
- projectId/episodeId/video は両ファイルで一致させる。target.palmierProject と timeline は Show の projectNamePattern と defaultTimeline に合わせる。
- テンプレートの素材、item、Placement、Marker を無関係な新Episodeへコピーしない。新規ファイルも作成直後に両方そろえて検証する。

## content.json を作成・更新する

各レンダー素材を、登録済みの Composition に対応する item として記述する。

- compositionId は packages/motion-system の registry に存在するものだけを使い、props はその Zod schema に適合させる。
- durationFrames は整数で扱う。秒へ往復変換して丸め誤差を作らない。
- Asset は実在するファイルを assets に論理IDで宣言し、Episode からの安全な相対 path を使う。item が使う Asset は dependencies にも列挙する。
- 現在、logoAssetId は image Asset と dependencies の両方を必要とする。別の Asset props を使うなら、Pipeline でレンダー時に解決されることを確認する。
- render.outputFile は Episode 内に限定し、container、codec、alpha、audio、ProRes profile の組み合わせをスキーマに適合させる。

## edit.json を作成・更新する

人間用 Timeline を変更しない。自動編集の対象は managed: true の V2_AUTO_GRAPHICS だけである。

- 既存の V1_MAIN_HUMAN、A1_VOICE_HUMAN、または他の managed: false Track は読み取り専用とし、Track 定義、Placement、既存の編集意図を変更しない。
- 新規 Episode で Track を初期化する必要がある場合も、自動配置は V2_AUTO_GRAPHICS 用の managed: true Track に限定する。
- V2_AUTO_GRAPHICS は Palmier 側の palmierName である。Placement の trackId には Track の論理 id を使う。既存の標準では auto-graphics を参照し、V2_AUTO_GRAPHICS を直接入れない。
- 自動グラフィックスは source.type を content にし、その source.ref を Content item ID に合わせる。
- startFrame、durationFrames、sourceInFrame、keyframe offsets、marker 範囲はすべて整数で整合させる。sourceInFrame + durationFrames は Content item 尺以内にし、managed Track に重複を作らない。
- 自動 Placement は strict または placement-only を選び、原則 allowOverwrite: false と preservePalmierEffects: true を使う。人間用 Track に自動 policy を置かない。
- 台本の開始・中間・終了直前と Placement 境界を inspectionFrames に入れる。自動生成する Marker は managed: true とし、既存の非管理 Marker は保持する。

## 変更後の確認

変更対象、追加/変更する item、Asset、Placement、Marker を先に明示し、既存の人間管理 Track を変更していないことを確認する。その後、必ず実行する。

~~~sh
pnpm validate:episode --episode <episode-dir>
~~~

失敗なら JSON Pointer と issue code に沿って最小限に直し、再検証する。Palmier への書込み、同期済みの記録、ライブ Timeline の推測はこのスキルの範囲外である。完了時には Content と Edit の変更、検証結果、未解決のタイミングまたは素材の不確実性を報告する。
