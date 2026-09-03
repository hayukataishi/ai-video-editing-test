---
name: validate-episode
description: "Episode のManifest、素材参照、Composition ID、Zod props、出力先、Track 時間を検証し、問題ごとの最小修正方針を示す。レンダーやPalmier同期の前の診断に使う。"
---

# Validate Episode

対象 Episode の準備状態を診断する。通常は読み取り専用で、検証結果と修正方針を返す。ユーザーが明示して修正を求めた場合だけ、Manifest を最小限に更新して再検証する。

## 読み取り順序

root と Show の AGENTS.md、show.config.json、Brief と台本、content.json、edit.json、packages/motion-system の Root、Composition Registry/Zod schema、packages/manifest の schema を確認する。

content.json と edit.json だけを正規 Manifest として扱う。新しい manifest.json、Palmier Media/Clip ID、レンダー cache/state を作成または修正しない。

## 実行

対象を指定して、まず次を実行する。

~~~sh
pnpm validate:episode --episode <episode-dir>
~~~

CLI の status と issues の path、message、code を保存して要約する。pass でも、次のプロジェクト固有の確認を行う。

- Show の video、themeId、Safe Zone と、両 Manifest の video 仕様が整合すること
- Content item の論理ID、登録済み Composition ID、Zod props、整数 duration、Asset dependencies、出力形式と安全な出力先
- Asset path が実在し、Episode/Workspace の許可範囲に収まること
- projectId、episodeId、video、Content source 参照、sourceInFrame と duration の相互整合
- Root の Composition と compositionRegistry の ID、schema、default duration、fps、width、height が同じ契約を表すこと。CLI は Registry を見るが Root の登録漏れまでは検証しない
- V2_AUTO_GRAPHICS の managed: true Track だけが自動配置の対象で、人間管理 Track に変更または自動 policy がないこと。ほかの managed: true Track があれば、Schema が通っても Show 方針違反として報告し自動同期は blocked とする
- managed Track の重複、keyframe/fade/marker のフレーム範囲、台本と inspectionFrames の整合

## 修正方針

問題は、JSON Pointer → 原因 → 最小修正 → 再検証コマンド、の対応で報告する。例えば Composition 未登録は Registry と Root の登録を確認し、props 不適合は schema に合わせて Content item を直し、managed-track collision は Placement の整数 frame 範囲を解消する。

明示的な修正依頼がある場合も、次を守る。

- 既存の同期済み logical ID と Placement ID を改名しない。
- managed: false の Track、既存の人間編集、非管理 Marker を変更しない。
- allowOverwrite: false の競合を上書きで隠さない。
- 修正後は同じ validate コマンドを再実行する。

この検証は Palmier の実 Timeline、Media、Clip の状態を読まない。allowOverwrite: false のライブ衝突、Palmier上の見た目、同期完了は未確認として扱う。レンダー、QA、Palmier同期を実行するのは、別途求められた場合だけである。
