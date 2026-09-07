import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player, type PlayerRef } from "@remotion/player";
import { useRef } from "react";

import {
  SemanticExplainer,
  semanticExplainerDefaultProps,
  type SemanticExplainerProps,
} from "./SemanticExplainer";

const Preview = ({
  props,
  durationInFrames,
}: {
  props: SemanticExplainerProps;
  durationInFrames: number;
}) => {
  const player = useRef<PlayerRef>(null);
  const stops = [0, 30, Math.floor(durationInFrames / 2), durationInFrames - 1];

  return (
    <div style={{ width: "100%", maxWidth: 1280 }}>
      <Player
        ref={player}
        component={SemanticExplainer}
        inputProps={props}
        durationInFrames={durationInFrames}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        controls
        style={{ width: "100%", aspectRatio: "16 / 9" }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingTop: 12 }}>
        {stops.map((frame) => (
          <button
            key={frame}
            onClick={() => {
              player.current?.pause();
              player.current?.seekTo(frame);
            }}
          >
            f{frame}
          </button>
        ))}
      </div>
    </div>
  );
};

const renderAt = (durationInFrames: number) => (args: SemanticExplainerProps) => (
  <Preview props={args} durationInFrames={durationInFrames} />
);

const meta = {
  title: "Remotion/Explainers/SemanticExplainer",
  component: SemanticExplainer,
  args: semanticExplainerDefaultProps,
  render: renderAt(360),
} satisfies Meta<SemanticExplainerProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AudioMeaningPlacement: Story = {
  args: {
    eyebrow: "04 / AUDIO AS SOURCE",
    title: "カット後の音声から、\n説明に合う図を作って配置する",
    diagram: {
      kind: "audio-is-the-timing-ruler",
      beats: [0, 75, 165, 224, 319, 400, 458, 512],
      audioLabel: "カット後の音声",
      visualLabel: "図解のトラック",
      placementLabel: "その説明をしている区間へ配置",
      examples: ["ユーザーが増える", "紹介が広がる", "成長が加速する"],
    },
    note: "",
  },
  render: renderAt(587),
};

export const AudioSurgery: Story = {
  args: {
    eyebrow: "Palmier Pro / 音声編集",
    title: "言い直しと長い無音を切ると、\n話の流れがつながる",
    diagram: {
      kind: "waveform-surgery",
      beats: [30, 76, 108, 140, 196, 244],
      retakeLabel: "言い直し",
      silenceLabel: "長い無音",
      resultLabel: "必要な話だけを残す",
    },
    note: "不要な部分を消し、前後の音声を自然につなぐ",
  },
  render: renderAt(308),
};

export const GrowthFlywheel: Story = {
  args: {
    eyebrow: "Remotion / 関係を見せる",
    title: "ユーザーの増加が、\n次の成長を生む",
    diagram: {
      kind: "referral-growth-flywheel",
      beats: [22, 64, 105, 219, 244, 269, 278, 291],
      entities: ["ユーザー", "紹介", "成長"],
    },
    note: "人数の増加 → 紹介 → 成長加速の循環",
  },
  render: renderAt(408),
};

export const LongFinishEdge: Story = {
  args: {
    eyebrow: "まとめ / 3つの役割",
    title: "3つの役割がつながると、\n収録後の制作が進む",
    diagram: {
      kind: "three-role-finish",
      beats: [0, 151, 298, 343, 418, 488, 545, 587],
      tools: ["Palmier Pro", "Remotion", "Codex"],
      steps: ["台本を読む", "音声を収録", "チャットで、収録後の作業を進める"],
    },
    note: "",
  },
  render: renderAt(641),
};
