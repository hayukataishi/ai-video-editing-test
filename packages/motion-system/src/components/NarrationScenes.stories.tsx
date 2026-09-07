import type {Meta, StoryObj} from "@storybook/react-vite";
import {Player, type PlayerRef} from "@remotion/player";
import {useRef, useState} from "react";
import {SemanticExplainer} from "./SemanticExplainer";
import {narrationScenePresets} from "./NarrationScenePresets";

const Review = () => {
  const [index, setIndex] = useState(0);
  const player = useRef<PlayerRef>(null);
  const scene = narrationScenePresets[index] ?? narrationScenePresets[0]!;
  const stops = [0, Math.floor(scene.durationFrames*.35), Math.floor(scene.durationFrames*.7), scene.durationFrames-1];
  return <div style={{maxWidth:1280,width:"100%"}}>
    <label>場面を選択 <select aria-label="場面を選択" value={index} onChange={event=>{player.current?.pause();setIndex(Number(event.target.value));player.current?.seekTo(0);}}>{narrationScenePresets.map((s,i)=><option value={i} key={s.id}>{String(i<13?i+1:15).padStart(2,"0")} / {s.props.title.replace("\n","")}</option>)}</select></label>
    <Player key={scene.id} ref={player} component={SemanticExplainer} inputProps={scene.props} durationInFrames={scene.durationFrames} fps={30} compositionWidth={1920} compositionHeight={1080} controls style={{width:"100%",aspectRatio:"16 / 9",marginTop:16}}/>
    <div style={{display:"flex",gap:12,paddingTop:12}}>{stops.map(frame=><button key={frame} onClick={()=>{player.current?.pause();player.current?.seekTo(frame);}}>f{frame}</button>)}</div>
  </div>;
};

const meta = {title:"Remotion/Explainers/NarrationScenes",component:Review} satisfies Meta<typeof Review>;
export default meta;
type Story=StoryObj<typeof meta>;
export const AllRedesignedScenes:Story={};
