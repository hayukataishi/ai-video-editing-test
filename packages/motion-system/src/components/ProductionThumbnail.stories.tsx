import type {Meta, StoryObj} from "@storybook/react-vite";
import {Player} from "@remotion/player";
import {ProductionThumbnail, productionThumbnailDefaultProps, type ProductionThumbnailProps} from "./ProductionThumbnail";

const meta = {
  title: "Remotion/Thumbnails/ProductionThumbnail",
  component: ProductionThumbnail,
  args: productionThumbnailDefaultProps,
  render: (args: ProductionThumbnailProps) => <Player component={ProductionThumbnail} inputProps={args} durationInFrames={1} fps={30} compositionWidth={1920} compositionHeight={1080} controls style={{width:"100%",maxWidth:1152,aspectRatio:"16/9"}}/>,
} satisfies Meta<ProductionThumbnailProps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mint: Story = {args:{accent:"mint"}};
export const LongJapaneseCopy: Story = {args:{eyebrow:"音声から図解へ、制作の流れをわかりやすく紹介",firstLine:"アニメづくりも",secondLine:"動画編集も、",lastLine:"言葉で伝える。",inputLabel:"収録した音声",outputLabel:"説明アニメーション",tools:["編集アプリケーション","図解アニメーション","AIチャット"]}};
