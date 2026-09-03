# Episode 001 ブリーフ

## 目的

Remotion、Codex、Palmier Proの役割分担を約60秒で説明し、再利用可能なモーショングラフィックスをPalmierの人間編集へ安全に渡す制作基盤を紹介する。

## 視聴者と到達点

- 対象: 動画制作の仕組み化を検討するエンジニア、編集者、テクニカルディレクター
- 視聴後に伝えること: Remotionは部品を作る場所、Codexは検証・レンダー・同期を担う場所、Palmier Proは人間が完成させる場所である。

## 画面方針

- 16:9、1920×1080、30fps。重要要素はShowの8% Safe Zone内に置く。
- 0–149 frameに全画面の `TitleCard`、1260–1499 frameに話者を避けた右上の `FlowDiagram` を置く。
- 自動生成素材はPalmierの `V2_AUTO_GRAPHICS` のみで管理し、実写・音声・最終的な間は人間編集として残す。

## 完了条件

- `content.json` と `edit.json` が同じShow、Episode、Canvas、Frame Rateを参照している。
- 2つのレンダー対象が `renders/remotion/` に出力される設計である。
- Palmier同期を行う前にdry-runで配置と衝突の有無をレビューする。
