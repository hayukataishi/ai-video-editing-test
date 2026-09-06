import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player } from "@remotion/player";

import {
  ToolRoleShowcase,
  toolRoleShowcaseDefaultProps,
  type ToolRoleShowcaseProps,
} from "./ToolRoleShowcase";

const meta = {
  title: "Remotion/Explainers/ToolRoleShowcase",
  component: ToolRoleShowcase,
  args: toolRoleShowcaseDefaultProps,
  argTypes: {
    eyebrow: { control: "text" },
    toolName: { control: "text" },
    role: { control: "text" },
    description: { control: "text" },
    visual: { control: "radio", options: ["timeline", "network", "pipeline"] },
    steps: { control: "object" },
    beatFrames: { control: "object" },
    backgroundColor: { control: "color" },
    accentColor: { control: "color" },
    secondaryColor: { control: "color" },
    textColor: { control: "color" },
  },
  render: (args: ToolRoleShowcaseProps) => (
    <Player
      component={ToolRoleShowcase}
      inputProps={args}
      durationInFrames={360}
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
} satisfies Meta<ToolRoleShowcaseProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Network: Story = {
  args: {
    eyebrow: "REMOTION",
    toolName: "Remotion",
    role: "複雑な関係を、動く図解にする",
    description: "データのつながりや複数の要素の連動を、再利用できるフレーム駆動のアニメーションとして実装します。",
    visual: "network",
    steps: [
      { label: "ユーザー", detail: "利用が増える" },
      { label: "紹介", detail: "次の人へ広がる" },
      { label: "成長", detail: "循環が加速する" },
    ],
    beatFrames: [0, 78, 166],
    accentColor: "#8BA7FF",
    secondaryColor: "#55D6BE",
  },
};

export const Pipeline: Story = {
  args: {
    eyebrow: "CODEX",
    toolName: "Codex",
    role: "意図を設計して、実装へつなぐ",
    description: "台本と音声から視覚化すべき部分を整理し、図解の構成とRemotionの部品を実装します。",
    visual: "pipeline",
    steps: [
      { label: "台本・音声", detail: "伝える順番を読む" },
      { label: "図解案", detail: "見せ方を決める" },
      { label: "Remotion", detail: "動きを実装する" },
      { label: "タイムライン", detail: "尺に合わせて配置する" },
    ],
    beatFrames: [0, 68, 142, 226],
    accentColor: "#55D6BE",
    secondaryColor: "#8BA7FF",
  },
};

export const LongJapaneseCopy: Story = {
  args: {
    toolName: "Palmier Pro",
    role: "編集の創造的な判断を、あとから調整できる形で残す",
    description:
      "音声のカット、字幕の文言、Bロールの選択、図解の見せる長さをひとつのタイムラインで調整し、完成した動画の理解しやすさを高めます。",
    steps: [
      { label: "音声", detail: "カットとテンポ" },
      { label: "字幕", detail: "文言と改行" },
      { label: "素材", detail: "Bロールと画像" },
      { label: "仕上げ", detail: "視聴者が見る流れ" },
    ],
  },
};
