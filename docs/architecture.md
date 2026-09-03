# アーキテクチャ

このリポジトリは、再利用する動画表現をコードで管理し、レンダリング済みの素材だけをPalmier Proへ渡すモノレポである。RemotionのReactコンポーネントそのものをPalmierのTimelineへ置くことはしない。

```text
packages/motion-system  ─┐
                           ├─ content.json → Render Artifact → Palmier Timeline
packages/manifest       ─┤
                           └─ edit.json    → dry-run / reconcile plan
packages/pipeline       ─┘
```

## 責務

- `packages/motion-system`: stableなComposition ID、props型／Zod schema、テーマ、Storybook Catalogを提供する。
- `packages/manifest`: Content／Edit ManifestのJSON Schemaと、ID・参照・時間・Track衝突を検証する。
- `packages/pipeline`: Manifestを検証し、Content Hashに基づく差分レンダー、dry-run、Palmier向けのReconcile計画、QA reportを担当する。
- `shows/<show>`: ブランド設定、共有素材、EpisodeごとのBrief、台本、2つのManifestを持つ。

## Source of Truth

`content.json` は「どのCompositionをどのpropsでレンダリングするか」、`edit.json` は「成果物をどのFrame・Trackへ置くか」の唯一の参照元である。レンダー結果、キャッシュ、PalmierのMedia ID／Clip IDは生成状態であり、Manifestへ書き戻さない。

## 典型フロー

1. Brief、台本、Show Token、2つのManifestをレビューする。
2. Schema、Component props、相互参照、相対Asset Path、Frame／Track衝突を検証する。
3. 変更されたContent HashだけをRemotionでレンダリングする。
4. Palmierの現在状態を読み、dry-run planで差分と保護対象を確認する。
5. 承認済みの管理Trackだけを同期し、指定Inspection Frameを確認してreportを残す。

最終的なカット、音、色、字幕、間、書き出しの判断はPalmier Proと人間の編集者に残す。
