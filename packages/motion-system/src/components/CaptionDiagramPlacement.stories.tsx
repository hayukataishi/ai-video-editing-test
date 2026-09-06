import type { Meta, StoryObj } from "@storybook/react-vite";
import { Player } from "@remotion/player";

import {
  CaptionDiagramPlacement,
  captionDiagramPlacementDefaultProps,
  type CaptionDiagramPlacementProps,
} from "./CaptionDiagramPlacement";

const meta = {
  title: "Remotion/Explainers/CaptionDiagramPlacement",
  component: CaptionDiagramPlacement,
  args: captionDiagramPlacementDefaultProps,
  argTypes: {
    eyebrow: { control: "text" },
    headline: { control: "text" },
    editorLabel: { control: "text" },
    speakerLabel: { control: "text" },
    spokenQuote: { control: "text" },
    captionText: { control: "text" },
    diagramTitle: { control: "text" },
    diagramItems: { control: "object" },
    insertionLabel: { control: "text" },
    editabilityLabel: { control: "text" },
    showOutro: { control: "boolean" },
    palette: { control: "object" },
  },
  render: (args: CaptionDiagramPlacementProps) => (
    <Player
      component={CaptionDiagramPlacement}
      inputProps={args}
      durationInFrames={433}
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
} satisfies Meta<CaptionDiagramPlacementProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ProductionVariant: Story = {
  args: {
    headline: "発話の直後に、\n伝わる画面を置く",
    speakerLabel: "ナレーションの要点",
    spokenQuote: "「お客さまが選ぶ理由は\n3つあります」",
    captionText: "選ばれる理由は3つ",
    diagramTitle: "3つの理由を、順番に見せる",
    diagramItems: [
      { label: "価値", detail: "最初に要点", tone: "pink" },
      { label: "根拠", detail: "次に理由", tone: "sky" },
      { label: "行動", detail: "最後に次の一歩", tone: "mint" },
    ],
    insertionLabel: "発話の直後に図解を置く",
    editabilityLabel: "細かな文言も、その場で直せる",
  },
};

export const LongJapaneseCopy: Story = {
  args: {
    eyebrow: "EDITABLE EXPLAINER LAYERS",
    headline: "話し手が伝えた大事なポイントを、\n字幕と図解にして視聴者へ届ける",
    editorLabel: "編集タイムライン",
    speakerLabel: "話し手が伝えたポイント",
    spokenQuote: "「売上が伸びた理由を、\n3つのポイントに分けて説明します」",
    captionText: "売上が伸びた理由を、3つのポイントで解説",
    diagramTitle: "説明の順番がひと目でわかる図解",
    diagramItems: [
      { label: "ポイント 1", detail: "最初に結論", tone: "pink" },
      { label: "ポイント 2", detail: "次に根拠", tone: "sky" },
      { label: "ポイント 3", detail: "最後にまとめ", tone: "mint" },
    ],
    insertionLabel: "説明が切り替わる位置に図解を置く",
    editabilityLabel: "短いテロップは、あとから修正しやすい",
  },
};
