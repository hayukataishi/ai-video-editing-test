import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player } from "@remotion/player";

import {
  PopShowTitle,
  popShowTitleDefaultProps,
  type PopShowTitleProps,
} from "./PopShowTitle";

const meta = {
  title: "Remotion/Titles/PopShowTitle",
  component: PopShowTitle,
  args: popShowTitleDefaultProps,
  argTypes: {
    lines: { control: "object" },
    variant: { control: "radio", options: ["corner-bug", "title-card"] },
    anchor: { control: "radio", options: ["top-left", "top-right"] },
    palette: { control: "object" },
  },
  render: (args: PopShowTitleProps) => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: 16,
        background:
          "radial-gradient(circle at 78% 22%, rgba(29, 54, 89, 0.58), transparent 34%), linear-gradient(135deg, #2d3b59 0%, #12162a 100%)",
      }}
    >
      <Player
        component={PopShowTitle}
        inputProps={args}
        durationInFrames={300}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        controls
        style={{
          width: "100%",
          maxWidth: 960,
          aspectRatio: "16 / 9",
          display: "block",
        }}
      />
    </div>
  ),
} satisfies Meta<PopShowTitleProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullFrame: Story = {
  args: {
    variant: "title-card",
    showIntro: true,
  },
};

export const LongJapaneseCopy: Story = {
  args: {
    lines: ["日本全国のみんなに!", "がんばる勇気を届けるチャンネル!"],
    showIntro: true,
  },
};
