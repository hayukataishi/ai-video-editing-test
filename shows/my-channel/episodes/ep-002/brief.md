# Episode 002 ブリーフ

## 目的

Palmier Pro、Remotion、Codexを組み合わせる解説動画のために、収録済みナレーションへフレーム単位で一致する6本の図解アニメーションを作る。

## 表現の分担

- Remotion: 3ツールの役割比較、編集タイムラインの概念図、要素連動図、設計フロー、制作ワークフロー。複数要素が連動し、同じ表現を別の解説動画にも再利用できるため、完成素材としてレンダーする価値がある。
- Palmier Pro: 収録音声、無音カット、字幕、Bロール、最終的なタイミング調整。文言や表示尺を頻繁に変え得る要素はPalmier側に残す。

## 音声同期の正

Palmier Proプロジェクト `youtube` のタイムライン `Narration Selects` を読み取り、無音カット後の30fps・4736フレームを唯一の同期基準とする。各境界は半開区間で、間を作らずに隣接する。

| Section | Frame range | Duration |
| --- | ---: | ---: |
| Intro | 0–427 | 428f |
| Palmier Pro | 428–1221 | 794f |
| Remotion | 1222–2273 | 1052f |
| Codex | 2274–3135 | 862f |
| Workflow | 3136–4045 | 910f |
| Conclusion | 4046–4735 | 690f |

Palmierの人間管理音声トラックは変更しない。ユーザー承認により、Palmier MCPで新規ビデオトラック `Graphics` を作り、6素材をそのトラックだけへ直接配置する。Palmier固有のMedia IDやClip IDはローカル状態のためManifestには記録しない。

## 画面方針

- 16:9、1920×1080、30fps。重要な文字はShowの8% Safe Zone内に置く。
- Palmierはミント、Remotionは青紫、Codexはミントと青紫の接続で役割を識別する。
- すべて不透明・無音の全画面グラフィックとしてレンダーし、Palmierの専用 `Graphics` ビデオトラックにだけ配置する。
