import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player } from "@remotion/player";

import {
  PalmierEditingWorkflow,
  palmierEditingWorkflowDefaultProps,
  type PalmierEditingWorkflowProps,
} from "./PalmierEditingWorkflow";

const meta = {
  title: "Remotion/Explainers/PalmierEditingWorkflow",
  component: PalmierEditingWorkflow,
  args: palmierEditingWorkflowDefaultProps,
  argTypes: {
    eyebrow: { control: "text" },
    headline: { control: "text" },
    stages: { control: "object" },
    outcomeLabel: { control: "text" },
    summary: { control: "text" },
    showOutro: { control: "boolean" },
    palette: { control: "object" },
  },
  render: (args: PalmierEditingWorkflowProps) => (
    <Player
      component={PalmierEditingWorkflow}
      inputProps={args}
      durationInFrames={359}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
      controls
      style={{
        width: "100%",
        maxWidth: 960,
        aspectRatio: "16 / 9",
        display: "block",
        borderRadius: 16,
        overflow: "hidden",
      }}
    />
  ),
} satisfies Meta<PalmierEditingWorkflowProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ProductionVariant: Story = {
  args: {
    headline: "ナレーションから完成動画まで、\n見せる順番を整える",
    stages: [
      { label: "ナレーション", detail: "話す順番を並べる", tone: "pink" },
      { label: "テンポ", detail: "間を短く整える", tone: "yellow" },
      { label: "ポイント", detail: "字幕で意味を補う", tone: "sky" },
      { label: "視覚", detail: "素材と図解を重ねる", tone: "mint" },
    ],
    outcomeLabel: "話の意図が、迷わず伝わる流れへ",
    summary: "音声 × テンポ × 字幕 × 視覚素材を編集でまとめる",
  },
};

export const LongJapaneseCopy: Story = {
  args: {
    eyebrow: "EDITING HUB FOR EXPLAINER VIDEO",
    headline: "ナレーションのカット、字幕、Bロール、図解を\nひとつのタイムラインで整理して仕上げる",
    stages: [
      { label: "話す順番", detail: "音声を見やすく並べる", tone: "pink" },
      { label: "テンポ調整", detail: "不要な無音を取り除く", tone: "yellow" },
      { label: "字幕設計", detail: "要点を読み取りやすくする", tone: "sky" },
      { label: "画面づくり", detail: "Bロールと図解を組み合わせる", tone: "mint" },
    ],
    outcomeLabel: "視聴者が理解しやすい、完成した動画の流れへ",
    summary: "編集できる要素を一箇所で整えて、伝わる体験にまとめる",
  },
};
