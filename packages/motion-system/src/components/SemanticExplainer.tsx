import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";
import { AudioMeaningPlacement } from "./AudioMeaningPlacement";
import { ThreeToolHandoff } from "./ThreeToolHandoff";
import {PostProduction, AudioToVideo, EditorHandoff, WaveformSurgery, ConversationalRevision} from "./NarrationOpeningScenes";
import {CodeForms, PromptRender, ReferralGrowth, SpeechStoryboard} from "./NarrationDiagramScenes";
import {CommandRouter, SpokenPlacement, ChatRevisions, ProductionSteps, ProductionConveyor} from "./NarrationWorkflowScenes";

const colors = {
  paper: motionSystemTheme.colors.pastelPaper,
  ink: motionSystemTheme.colors.pastelInk,
  pink: motionSystemTheme.colors.pastelPink,
  sky: motionSystemTheme.colors.pastelSky,
  mint: motionSystemTheme.colors.watercolorMint,
  yellow: motionSystemTheme.colors.watercolorYellow,
  lavender: motionSystemTheme.colors.pastelLavender,
  line: motionSystemTheme.colors.pastelLine,
} as const;

const textSchema = z.string().trim().min(1).max(48);
const beatSchema = z.number().int().nonnegative();
const threeTexts = z.tuple([textSchema, textSchema, textSchema]);
const twoTexts = z.tuple([textSchema, textSchema]);
const diagramBaseSchema = z.object({
  beats: z.array(beatSchema).min(3).max(8),
});

/**
 * The discriminated union deliberately describes semantic changes rather than a
 * reusable card layout. Each kind owns the visual relationship it explains.
 */
export const semanticDiagramSchema = z.discriminatedUnion("kind", [
  diagramBaseSchema.extend({ kind: z.literal("post-production-collapse"), actions: threeTexts, prompt: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("audio-to-explainer-pipeline"), tools: threeTexts, output: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("ai-editor-handoff"), prompt: textSchema, manualLabel: textSchema, aiLabel: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("waveform-surgery"), retakeLabel: textSchema, silenceLabel: textSchema, resultLabel: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("conversational-timeline-revision"), caption: textSchema, shorten: textSchema, operations: threeTexts }),
  diagramBaseSchema.extend({ kind: z.literal("code-becomes-visual-forms"), examples: threeTexts }),
  diagramBaseSchema.extend({ kind: z.literal("prompt-to-render"), prompt: textSchema, codeLabel: textSchema, outputLabel: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("referral-growth-flywheel"), entities: threeTexts }),
  diagramBaseSchema.extend({ kind: z.literal("speech-to-storyboard"), concepts: threeTexts }),
  diagramBaseSchema.extend({ kind: z.literal("command-router-to-edit"), hub: textSchema, branches: twoTexts, prompt: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("generate-and-place-at-the-spoken-beat"), audioLabel: textSchema, visualLabel: textSchema, placementLabel: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("one-chat-revisions"), simplifyLabel: textSchema, syncLabel: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("production-steps-one-and-two"), steps: threeTexts, prompt: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("audio-is-the-timing-ruler"), audioLabel: textSchema, visualLabel: textSchema, placementLabel: textSchema, examples: threeTexts.default(["ユーザーが増える", "紹介が広がる", "成長が加速する"]) }),
  diagramBaseSchema.extend({ kind: z.literal("chat-powered-production-conveyor"), stations: threeTexts, prompt: textSchema }),
  diagramBaseSchema.extend({ kind: z.literal("three-role-finish"), tools: threeTexts, steps: threeTexts }),
]);

export const semanticExplainerSchema = z.object({
  eyebrow: z.string().trim().max(64).default(""),
  title: z.string().trim().min(1).max(90),
  diagram: semanticDiagramSchema,
  note: z.string().trim().max(96).optional(),
});

export type SemanticDiagram = z.output<typeof semanticDiagramSchema>;
export type SemanticExplainerProps = z.output<typeof semanticExplainerSchema>;

export const semanticExplainerDefaultProps: SemanticExplainerProps = {
  eyebrow: "音声と図解の同期",
  title: "説明している言葉に、\n図解の動きをそろえる",
  diagram: {
    kind: "generate-and-place-at-the-spoken-beat",
    beats: [20, 52, 86, 124, 162, 205, 252, 292],
    audioLabel: "話している要点",
    visualLabel: "対応する図解",
    placementLabel: "同じ位置に配置",
  },
  note: "言葉・図解・タイミングをひとつにする",
};

const clamp = (value: number): number => Math.max(0, Math.min(1, value));
const ease = (frame: number, at: number, duration = 16): number =>
  interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
const pop = (frame: number, at: number, fps: number): number =>
  clamp(spring({ frame: Math.max(0, frame - at), fps, config: { damping: 200, mass: 0.72, stiffness: 126 } }));
const enterStyle = (value: number, fromY = 22) => ({
  opacity: value,
  transform: `translateY(${(1 - value) * fromY}px) scale(${0.94 + value * 0.06})`,
});

const Header = ({ eyebrow, title, frame, fps }: { eyebrow: string; title: string; frame: number; fps: number }) => {
  const p = pop(frame, 0, fps);
  const size = Math.max(...title.split("\n").map((line) => line.length)) > 26 ? 50 : 62;
  return <div style={{ position: "absolute", left: 164, top: 88, width: 1592, ...enterStyle(p, -18) }}>
    {eyebrow ? <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, fontWeight: 900, letterSpacing: "0.1em" }}><span style={{ width: 48, height: 8, borderRadius: 999, background: colors.pink }} />{eyebrow}</div> : null}
    <div style={{ marginTop: eyebrow ? 15 : 0, maxWidth: 1540, color: colors.ink, fontFamily: motionSystemTheme.fontFamilyRounded, fontSize: size, fontWeight: 900, lineHeight: 1.17, letterSpacing: "-0.045em", whiteSpace: "pre-line" }}>{title}</div>
  </div>;
};

type SceneProps = {d: SemanticDiagram; frame: number; fps: number};

const renderScene = ({d, frame}: SceneProps) => {
  switch (d.kind) {
    case "post-production-collapse": return <PostProduction d={d} frame={frame}/>;
    case "audio-to-explainer-pipeline": return <AudioToVideo d={d} frame={frame}/>;
    case "ai-editor-handoff": return <EditorHandoff d={d} frame={frame}/>;
    case "waveform-surgery": return <WaveformSurgery d={d} frame={frame}/>;
    case "conversational-timeline-revision": return <ConversationalRevision d={d} frame={frame}/>;
    case "code-becomes-visual-forms": return <CodeForms d={d} frame={frame}/>;
    case "prompt-to-render": return <PromptRender d={d} frame={frame}/>;
    case "referral-growth-flywheel": return <ReferralGrowth d={d} frame={frame}/>;
    case "speech-to-storyboard": return <SpeechStoryboard d={d} frame={frame}/>;
    case "command-router-to-edit": return <CommandRouter d={d} frame={frame}/>;
    case "generate-and-place-at-the-spoken-beat": return <SpokenPlacement d={d} frame={frame}/>;
    case "one-chat-revisions": return <ChatRevisions d={d} frame={frame}/>;
    case "production-steps-one-and-two": return <ProductionSteps d={d} frame={frame}/>;
    case "chat-powered-production-conveyor": return <ProductionConveyor d={d} frame={frame}/>;
    case "audio-is-the-timing-ruler": return <AudioMeaningPlacement {...d} frame={frame}/>;
    case "three-role-finish": return <ThreeToolHandoff {...d} frame={frame}/>;
  }
};

/**
 * Opaque 1920×1080 narration-synchronised explainer. Each `diagram.kind` is a
 * semantic visual, not a generic layout; `beats` are local integer frames.
 * Recommended duration: 120–700 frames. It has no audio and no alpha output.
 */
export const SemanticExplainer = (props: SemanticExplainerProps) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  return <div style={{width:"100%",height:"100%",overflow:"hidden",background:colors.paper,color:colors.ink,fontFamily:motionSystemTheme.fontFamily}}>
    <div style={{position:"absolute",width:1920,height:1080,left:(width-1920*scale)/2,top:(height-1080*scale)/2,transform:`scale(${scale})`,transformOrigin:"top left"}}>
      {[{x:-135,y:-125,w:420,h:260,c:colors.pink,r:-14},{x:1635,y:-155,w:420,h:305,c:colors.sky,r:19},{x:1645,y:875,w:390,h:280,c:colors.mint,r:-19},{x:-135,y:920,w:360,h:250,c:colors.yellow,r:12}].map((blob,i)=><div key={i} style={{position:"absolute",left:blob.x,top:blob.y,width:blob.w,height:blob.h,borderRadius:"48% 52% 55% 45% / 55% 45% 55% 45%",background:blob.c,opacity:.48,transform:`rotate(${blob.r}deg)`}}/>) }
      <Header eyebrow={props.eyebrow} title={props.title} frame={frame} fps={fps}/>
      {renderScene({d:props.diagram,frame,fps})}
      {props.note ? <div style={{position:"absolute",left:300,top:962,width:1320,textAlign:"center",fontSize:23,fontWeight:800,opacity:ease(frame,Math.max(0,(props.diagram.beats.at(-1) ?? 0)+18)),letterSpacing:".02em"}}>{props.note}</div> : null}
    </div>
  </div>;
};
