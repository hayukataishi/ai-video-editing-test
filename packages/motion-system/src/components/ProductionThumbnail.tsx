import {AbsoluteFill, useVideoConfig} from "remotion";
import {z} from "zod";
import {motionSystemTheme as theme} from "../theme";

export const productionThumbnailSchema = z.object({
  eyebrow: z.string().min(1).max(30),
  firstLine: z.string().min(1).max(8),
  secondLine: z.string().min(1).max(6),
  lastLine: z.string().min(1).max(8),
  inputLabel: z.string().min(1).max(8),
  outputLabel: z.string().min(1).max(10),
  tools: z.array(z.string().min(1).max(14)).length(3),
  accent: z.enum(["pink", "mint"]).default("pink"),
});
export type ProductionThumbnailProps = z.output<typeof productionThumbnailSchema>;
export const productionThumbnailDefaultProps: ProductionThumbnailProps = {
  eyebrow: "この動画も、3ツールだけで制作",
  firstLine: "動画編集も",
  secondLine: "図解も、",
  lastLine: "チャットで。",
  inputLabel: "音声",
  outputLabel: "図解つき動画",
  tools: ["Palmier Pro", "Remotion", "Codex"],
  accent: "pink",
};

const textUnits = (text: string) => [...text].reduce((n, char) => n + (char.charCodeAt(0) > 255 ? 1 : .6), 0);
const fit = (text: string, max: number, width: number) => Math.min(max, width / Math.max(1, textUnits(text)));

/**
 * Stable ProductionThumbnail composition: opaque 16:9 artwork, no audio.
 * Canonical canvas 1920×1080; responsive uniform scaling supports 4K and 720p.
 * One frame, deliberately static: there is no entrance state to accidentally export.
 * Important content stays inside the 8% safe area; lower-right corner is decoration only.
 */
export const ProductionThumbnail = (p: ProductionThumbnailProps) => {
  const {width, height} = useVideoConfig();
  const c = theme.colors;
  const scale = Math.min(width / 1920, height / 1080);
  const accent = p.accent === "mint" ? c.watercolorMint : c.pastelPink;
  return <AbsoluteFill style={{background: c.pastelPaper, overflow: "hidden"}}>
    <div style={{position: "absolute", left: (width-1920*scale)/2, top: (height-1080*scale)/2, width: 1920, height: 1080, scale, transformOrigin: "top left", color: c.pastelInk, fontFamily: theme.fontFamilyRounded}}>
      <div style={{position:"absolute",left:1280,top:-130,width:840,height:1030,borderRadius:"50%",background:c.pastelSky,opacity:.55,rotate:"-15deg"}}/>
      <div style={{position:"absolute",left:-205,top:843,width:640,height:400,borderRadius:"50%",background:c.watercolorYellow,opacity:.6}}/>
      <div style={{position:"absolute",left:160,top:105,padding:"15px 28px",borderRadius:24,background:c.pastelInk,color:c.pastelPaper,fontWeight:900,fontSize:fit(p.eyebrow,40,1100),whiteSpace:"nowrap"}}>{p.eyebrow}</div>

      <div style={{position:"absolute",left:154,top:236,width:930,fontFamily:theme.fontFamily,fontWeight:900,fontSize:fit(p.firstLine,140,915),lineHeight:1.1,letterSpacing:-5,WebkitTextStroke:`1.3px ${c.pastelInk}`}}>{p.firstLine}</div>
      <div style={{position:"absolute",left:152,top:431,width:Math.min(888,fit(p.secondLine,162,845)*textUnits(p.secondLine)+24),height:182,borderRadius:22,background:accent,rotate:"-1.5deg"}}/>
      <div style={{position:"absolute",left:160,top:424,width:905,fontFamily:theme.fontFamily,fontWeight:900,fontSize:fit(p.secondLine,162,870),lineHeight:1.08,letterSpacing:-5,WebkitTextStroke:`1.3px ${c.pastelInk}`}}>{p.secondLine}</div>
      <div style={{position:"absolute",left:159,top:669,width:915,fontFamily:theme.fontFamily,fontWeight:900,fontSize:fit(p.lastLine,130,900),lineHeight:1.12,letterSpacing:-4,WebkitTextStroke:`1.2px ${c.pastelInk}`}}>{p.lastLine}</div>

      <div style={{position:"absolute",left:1125,top:246,width:640,height:158,border:`5px solid ${c.pastelInk}`,borderRadius:36,background:c.pastelSky,boxShadow:`12px 13px 0 ${c.pastelInk}`}}>
        <div style={{position:"absolute",left:28,top:52,width:185,fontSize:fit(p.inputLabel,45,180),fontWeight:900,lineHeight:1}}>{p.inputLabel}</div>
        <svg width={364} height={99} viewBox="0 0 364 99" style={{position:"absolute",left:234,top:31}} fill={c.pastelInk}>
          {Array.from({length:29},(_,i)=>{const h=22+(i*17+13)%67;return <rect key={i} x={i*12} y={(99-h)/2} width={7} height={h} rx={3.5}/>;})}
        </svg>
      </div>
      <svg width={220} height={138} viewBox="0 0 220 138" style={{position:"absolute",left:1340,top:426}} fill={accent} stroke={c.pastelInk} strokeWidth={6} strokeLinejoin="round">
        <path d="M80 5h60v55h50l-80 65-80-65h50z"/>
      </svg>
      <div style={{position:"absolute",left:1105,top:574,width:660,height:288,border:`6px solid ${c.pastelInk}`,borderRadius:34,background:c.pastelPaper,boxShadow:`12px 13px 0 ${c.pastelInk}`}}>
        <div style={{position:"absolute",left:28,top:22,width:552,fontSize:fit(p.outputLabel,43,535),fontWeight:900,lineHeight:1}}>{p.outputLabel}</div>
        <svg width={554} height={151} viewBox="0 0 554 151" style={{position:"absolute",left:49,top:83}} fill="none" stroke={c.pastelInk} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M120 75h100m0 0 107-44M220 75h107M220 75l107 44"/>
          <circle cx={84} cy={75} r={35} fill={c.pastelSky}/>
          {[31,75,119].map(y=><circle key={y} cx={354} cy={y} r={20} fill={accent}/>)}
          <path d="m424 116 31-25 33 9 33-54" strokeWidth={11}/>
          <path d="m498 49 25-6 3 26"/>
        </svg>
        <div style={{position:"absolute",left:26,right:26,bottom:18,height:14,display:"flex",gap:12}}>{[c.pastelSky,accent,c.watercolorMint].map(color=><div key={color} style={{flex:1,background:color,borderRadius:7,border:`2px solid ${c.pastelInk}`}}/>)}</div>
      </div>

      <div style={{position:"absolute",left:160,top:924,width:1598,display:"flex",alignItems:"center",justifyContent:"center",gap:31,fontWeight:900,fontSize:45,whiteSpace:"nowrap"}}>
        {p.tools.map((tool,i)=><div key={`${tool}-${i}`} style={{display:"flex",alignItems:"center",gap:31}}>{i>0?<span style={{fontSize:35,opacity:.55}}>×</span>:null}<span style={{fontSize:fit(tool,45,410)}}>{tool}</span></div>)}
      </div>
    </div>
  </AbsoluteFill>;
};
