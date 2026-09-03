---
name: render-and-qa-episode
description: "有効なEpisodeをContent Hashで差分レンダーし、出力仕様、成果物の存在、宣言済みinspectionFramesを現行Phase 1 QAとして実行・報告する。Palmier上の視覚検査には使わない。"
---

# Render And Qa Episode

対象 Episode の生成物を、検証済みの Manifest から差分レンダーし、現行実装で可能な QA を正確に報告する。

## 実行順序

まず検証を通し、失敗していればレンダーしない。

~~~sh
pnpm validate:episode --episode <episode-dir>
pnpm render:episode --episode <episode-dir>
pnpm qa:episode --episode <episode-dir>
~~~

render は Content Hash に基づき、変更された item だけを rendered、未変更かつ成果物がある item を skipped として扱う。renders と Episode の state は生成物・ローカル状態であり、Git の正ではない。各 item の action と outputFile を報告する。

## 出力仕様の確認

content.json の render 仕様を確認し、出力先が Episode 内であること、container と codec が対応すること、alpha と audio の制約を満たすことを確認する。

- mp4 は h264 または h265
- mov は h264、h265、または prores
- webm は vp8 または vp9
- png-sequence は png。audio は不可
- alpha は png、または ProRes 4444/4444-xq のみ

素材変更時は dependencies に Asset ID が含まれることを確認する。これにより差分判定が素材の変更を検出する。

## 現行 QA の範囲

pnpm qa:episode は、宣言済み inspectionFrames と各 render artifact の存在を返す Phase 1 QA である。実フレームの画像抽出、視覚的なレイアウト判定、Palmier Timeline 上の inspection、Media/Clip の read-back は現状未実装である。

したがって、QA レポートには以下を区別して書く。

- Manifest validation: pass/fail
- Render: rendered/skipped/failure と出力先
- Artifact QA: 各 artifact の exists 結果
- Inspection frames: 宣言された整数 frame の一覧
- Visual/Palmier QA: 現行実装では未実施

artifact が1つでも存在しなければ Artifact QA は失敗として扱う。宣言フレームがあるだけで視覚確認済みとは報告しない。

qa:episode は artifact が不足していても終了コード 0 を返し得る。コマンド成功だけで QA を pass とせず、expectedArtifacts の各 exists を必ず判定する。

pnpm build:episode は render、plan、qa の後に Palmier 未同期として意図的にエラー終了するため、成功検証には使わない。Palmier の書込みも行わない。必要なら、QA後に読み取り専用の pnpm palmier:plan --episode <episode-dir> を別途実行できるが、これは live sync ではない。
