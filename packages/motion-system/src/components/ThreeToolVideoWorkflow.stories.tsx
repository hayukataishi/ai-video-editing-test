import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player } from "@remotion/player";

import {
  ThreeToolVideoWorkflow,
  threeToolVideoWorkflowDefaultProps,
  type ThreeToolVideoWorkflowProps,
} from "./ThreeToolVideoWorkflow";

const meta = {
  title: "Remotion/Explainers/ThreeToolVideoWorkflow",
  component: ThreeToolVideoWorkflow,
  args: threeToolVideoWorkflowDefaultProps,
  argTypes: {
    eyebrow: { control: "text" },
    headline: { control: "text" },
    tools: { control: "object" },
    outputLabel: { control: "text" },
    summary: { control: "text" },
    showOutro: { control: "boolean" },
    palette: { control: "object" },
  },
  render: (args: ThreeToolVideoWorkflowProps) => (
    <Player
      component={ThreeToolVideoWorkflow}
      inputProps={args}
      durationInFrames={226}
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
} satisfies Meta<ThreeToolVideoWorkflowProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ProductionVariant: Story = {
  args: {
    headline: "編集・AI・アニメーションを\nひとつの流れにする",
    tools: [
      { label: "Palmier Pro", role: "音声と編集を仕上げる", tone: "sky", kind: "editing" },
      { label: "Codex", role: "AIで構成と図解を設計", tone: "mint", kind: "ai" },
      { label: "Remotion", role: "図解を動きに変える", tone: "pink", kind: "animation" },
    ],
    outputLabel: "伝わる解説コンテンツ",
    summary: "編集 × AI設計 × モーション",
  },
};

export const LongJapaneseCopy: Story = {
  args: {
    eyebrow: "AI-ASSISTED EXPLAINER PRODUCTION",
    headline: "Palmier Pro・Remotion・Codexを組み合わせて、\n企画から仕上げまでをわかりやすい流れにする",
    tools: [
      { label: "Palmier Pro", role: "ナレーション・字幕・素材を整理する", tone: "sky", kind: "editing" },
      { label: "Remotion", role: "複数の要素が連動する図解を作る", tone: "pink", kind: "animation" },
      { label: "Codex", role: "AIで台本と画面設計を組み立てる", tone: "mint", kind: "ai" },
    ],
    outputLabel: "視聴者に伝わる解説動画",
    summary: "編集 × AI支援 × アニメーションの連携",
  },
};
