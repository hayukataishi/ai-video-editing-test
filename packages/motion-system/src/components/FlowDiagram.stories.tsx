import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player } from "@remotion/player";

import {
  FlowDiagram,
  flowDiagramDefaultProps,
  type FlowDiagramProps,
} from "./FlowDiagram";

const meta = {
  title: "Remotion/Explainers/FlowDiagram",
  component: FlowDiagram,
  args: flowDiagramDefaultProps,
  argTypes: {
    backgroundColor: { control: "color" },
    accentColor: { control: "color" },
    connectorColor: { control: "color" },
    textColor: { control: "color" },
    title: { control: "text" },
    nodes: { control: "object" },
  },
  render: (args: FlowDiagramProps) => (
    <Player
      component={FlowDiagram}
      inputProps={args}
      durationInFrames={240}
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
} satisfies Meta<FlowDiagramProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    variant: "compact",
    title: "コンテンツを公開するまでの流れ",
  },
};

export const FiveStages: Story = {
  args: {
    title: "台本から最終レビューまでをつなぐ",
    nodes: [
      { label: "Brief", caption: "意図をそろえる", tone: "neutral" },
      { label: "Script", caption: "構成と原稿を作る", tone: "accent" },
      { label: "Remotion", caption: "部品をレンダリング", tone: "accent" },
      { label: "Palmier Pro", caption: "編集を仕上げる", tone: "success" },
      { label: "Review", caption: "最終確認して公開", tone: "neutral" },
    ],
  },
};
