import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player } from "@remotion/player";

import {
  PaintedLowerThird,
  paintedLowerThirdDefaultProps,
  type PaintedLowerThirdProps,
} from "./PaintedLowerThird";

const meta = {
  title: "Remotion/Lower Thirds/PaintedLowerThird",
  component: PaintedLowerThird,
  args: paintedLowerThirdDefaultProps,
  argTypes: {
    name: { control: "text" },
    role: { control: "text" },
    colors: { control: "object" },
  },
  render: (args: PaintedLowerThirdProps) => (
    <div
      style={{
        overflow: "hidden",
        borderRadius: 16,
        background:
          "radial-gradient(circle at 78% 18%, rgba(85, 214, 190, 0.13), transparent 36%), linear-gradient(135deg, #121113 0%, #09090a 100%)",
      }}
    >
      <Player
        component={PaintedLowerThird}
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
        }}
      />
    </div>
  ),
} satisfies Meta<PaintedLowerThirdProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    name: "佐藤 光",
    role: "映像ディレクター",
    variant: "compact",
  },
};

export const RightAligned: Story = {
  args: {
    name: "中村 結衣",
    role: "ナビゲーター",
    anchor: "bottom-right",
  },
};
