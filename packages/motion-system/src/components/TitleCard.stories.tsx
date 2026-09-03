import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player } from "@remotion/player";

import {
  TitleCard,
  titleCardDefaultProps,
  type TitleCardProps,
} from "./TitleCard";

const meta = {
  title: "Remotion/Cards/TitleCard",
  component: TitleCard,
  args: titleCardDefaultProps,
  argTypes: {
    backgroundColor: { control: "color" },
    accentColor: { control: "color" },
    textColor: { control: "color" },
    title: { control: "text" },
    subtitle: { control: "text" },
    eyebrow: { control: "text" },
  },
  render: (args: TitleCardProps) => (
    <Player
      component={TitleCard}
      inputProps={args}
      durationInFrames={150}
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
} satisfies Meta<TitleCardProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    variant: "minimal",
    eyebrow: "EPISODE OPENING",
    title: "制作チームのための\n動画デザインシステム",
    subtitle: "再利用可能なモーションを、必要な時に必要なだけ。",
  },
};

export const LongJapaneseCopy: Story = {
  args: {
    title: "編集の試行錯誤を残したまま、定型モーショングラフィックスを安全に自動化する",
    subtitle:
      "Remotionで部品を構築し、Palmier Proでは人間の判断を尊重した最終編集を行います。",
  },
};
