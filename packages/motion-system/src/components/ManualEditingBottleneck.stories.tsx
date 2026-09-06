import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player } from "@remotion/player";

import {
  ManualEditingBottleneck,
  manualEditingBottleneckDefaultProps,
  type ManualEditingBottleneckProps,
} from "./ManualEditingBottleneck";

const meta = {
  title: "Remotion/Explainers/ManualEditingBottleneck",
  component: ManualEditingBottleneck,
  args: manualEditingBottleneckDefaultProps,
  argTypes: {
    headline: { control: "text" },
    softwareLabel: { control: "text" },
    tasks: { control: "object" },
    conclusion: { control: "text" },
    showOutro: { control: "boolean" },
    palette: { control: "object" },
  },
  render: (args: ManualEditingBottleneckProps) => (
    <Player
      component={ManualEditingBottleneck}
      inputProps={args}
      durationInFrames={202}
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
} satisfies Meta<ManualEditingBottleneckProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThreeStepVariant: Story = {
  args: {
    headline: "人力の制作フローは\n作業が連鎖しやすい",
    softwareLabel: "編集ソフト",
    tasks: ["素材を選ぶ", "画面をつくる", "修正を反映する"],
    conclusion: "手作業が増えるほど、\n完成までの時間が伸びていく",
  },
};

export const LongJapaneseCopy: Story = {
  args: {
    headline: "解説動画をひとつの動画編集ソフトだけで、\n最初から最後まで人力で組み立てようとすると…",
    softwareLabel: "動画編集ソフトでの手作業",
    tasks: ["話す順番を整理する", "必要な素材を探し直す", "図解を画面に組み立てる", "細かな尺を何度も調整する", "変更のたびに修正する"],
    conclusion: "見せ方の調整が積み上がるほど、\n完成までにかなり時間がかかる",
  },
};
