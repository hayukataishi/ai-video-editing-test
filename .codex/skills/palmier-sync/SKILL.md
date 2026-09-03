---
name: palmier-sync
description: "Palmierへ送る安全なManifest由来dry-run計画を生成し、実同期の前提・静的競合・承認状態を判定する。現行の未接続リポジトリで同期完了を主張したり書込みを行ったりする用途には使わない。"
---

# Palmier Sync

現状の標準操作は計画生成だけである。ライブ Palmier MCP adapter は未実装であり、pnpm palmier:sync は意図的に停止する。明示承認があっても、adapter がない現在は書込みや同期済みの報告をしてはならない。

## 現行の安全な操作

対象 Episode を検証し、将来の同期準備として成果物の存在を確認してから、Manifest 由来のオフライン計画を作る。

~~~sh
pnpm validate:episode --episode <episode-dir>
pnpm qa:episode --episode <episode-dir>
pnpm palmier:plan --episode <episode-dir>
~~~

validation が失敗した場合は計画を作らない。artifact が不足している場合は、将来の apply は不可と報告する。

palmier:plan の status は offline-preview であり、実 Project、Timeline、Media Library、Track、Clip を読んだ実行可能計画ではない。出力の target、managedTracks、imports、placementsToAdd、warnings をそのまま要約し、「計画生成済み（未同期）」と明示する。

qa:episode は artifact が不足していても終了コード 0 を返し得るため、expectedArtifacts の各 exists を読む。1件でも false なら、QA failed / sync blocked とする。

計画の前に edit.json の managed: true Track を確認する。Show の V2_AUTO_GRAPHICS 以外に managed Track があれば、palmier:plan が列挙しても安全な計画ではないため blocked/not-synced と報告し、apply の候補にしない。

pnpm palmier:sync は現時点では必ず安全停止する。ユーザーがその停止状態の確認を明示的に求めた場合以外は実行しない。失敗出力を同期の試行成功や適用結果として扱わない。

## 守る境界

- managed: true の専用 Track だけが自動 reconcile の対象。Show の標準では V2_AUTO_GRAPHICS のみである。
- V1_MAIN_HUMAN、A1_VOICE_HUMAN、その他 managed: false の Track は読み取り専用とする。
- allowOverwrite: false の衝突は停止し、未解決または明示承認前に成功扱いしない。
- Ripple Insert/Delete は人間管理 Timeline で使わない。
- 同一 logical Asset の更新は、配置、Effect、Keyframe を維持できる swap_clip_media を優先する。
- preservePalmierEffects を尊重し、Palmier の Media ID/Clip ID を Manifest へ書き戻さない。

オフライン計画では実 Timeline の collision は確認できない。allowOverwrite: false のライブ衝突は、adapter が Timeline を read してから初めて判定可能であり、それまでは未確認とする。

## 将来の adapter 導入後

実書込みは、現在の dry-run の内容に対する利用者の明示的かつ最新の承認があり、検証済み adapter が存在する場合だけ可能にする。apply の直前に必ず次を行う。

1. Manifest validation と必要 artifact/content hash を再確認する。
2. 対象 Project、Timeline、Media、Track、既存 Clip を read する。
3. read-back した状態で dry-run と collision check を再計算し、対象操作・保持対象・警告を提示する。
4. 承認済みの managed: true Track だけに最小の変更を適用する。
5. Timeline と Media を再読込し、inspectionFrames と Placement 境界を確認して結果を報告する。

adapter、read-back、承認、または衝突解消のいずれかが欠ける場合は blocked/not-synced と報告する。成功は実際の書込みと read-back の両方が確認できた場合だけ報告する。
