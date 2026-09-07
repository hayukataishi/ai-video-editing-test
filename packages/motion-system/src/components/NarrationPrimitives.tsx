import type {CSSProperties, ReactNode} from "react";
import {Easing, interpolate} from "remotion";
import {motionSystemTheme} from "../theme";
import type {SemanticDiagram} from "./SemanticExplainer";

export const C = {
  ink: motionSystemTheme.colors.pastelInk, sky: motionSystemTheme.colors.pastelSky,
  pink: motionSystemTheme.colors.pastelPink, mint: motionSystemTheme.colors.watercolorMint,
  yellow: motionSystemTheme.colors.watercolorYellow, lavender: motionSystemTheme.colors.pastelLavender,
  line: motionSystemTheme.colors.pastelLine, paper: motionSystemTheme.colors.pastelPaper,
};
export type Scene = {d: SemanticDiagram; frame: number};
export const at = (d: SemanticDiagram, i: number, fallback = 0) => d.beats[i] ?? fallback;
export const P = (f: number, start: number, length = 20) => interpolate(f, [start, start + length], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic)});
export const Box = ({x, y, w, h, p = 1, tone = "rgba(255,255,255,.94)", children, style}: {x: number; y: number; w: number; h: number; p?: number; tone?: string; children?: ReactNode; style?: CSSProperties}) => <div style={{position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", border: "2px solid " + C.line, borderRadius: 30, background: tone, opacity: p, ...style}}>{children}</div>;
export const Txt = ({x, y, w, children, size = 30, p = 1, align = "left", color = C.ink}: {x: number; y: number; w?: number; children: ReactNode; size?: number; p?: number; align?: "left" | "center" | "right"; color?: string}) => <div style={{position: "absolute", left: x, top: y, width: w, fontSize: size, fontWeight: 800, lineHeight: 1.35, opacity: p, textAlign: align, color, whiteSpace: "pre-line"}}>{children}</div>;
export const Badge = ({x, y, children, tone = C.sky, p = 1, size = 26}: {x: number; y: number; children: ReactNode; tone?: string; p?: number; size?: number}) => <div style={{position: "absolute", left: x, top: y, padding: "9px 20px", borderRadius: 17, background: tone, fontSize: size, fontWeight: 900, opacity: p, whiteSpace: "pre-line", lineHeight: 1.3}}>{children}</div>;
export const Area = ({x, y, w, h, children, p = 1}: {x: number; y: number; w: number; h: number; children: ReactNode; p?: number}) => <div style={{position: "absolute", left: x, top: y, width: w, height: h, opacity: p}}>{children}</div>;
export const Chat = ({x, y, w, text, p = 1, who = "Codexへの指示"}: {x: number; y: number; w: number; text: string; p?: number; who?: string}) => <Box x={x} y={y} w={w} h={150} p={p} tone={C.lavender} style={{border: "none"}}><Txt x={26} y={18} size={22}>{who}</Txt><Txt x={26} y={58} w={w - 52} size={31}>{text}</Txt></Box>;

export const Line = ({points, p = 1, color = C.ink, arrow = true, dashed = false}: {points: number[][]; p?: number; color?: string; arrow?: boolean; dashed?: boolean}) => {
  const end = points.at(-1) ?? [0, 0], prev = points.at(-2) ?? end;
  const angle = Math.atan2((end[1] ?? 0) - (prev[1] ?? 0), (end[0] ?? 0) - (prev[0] ?? 0));
  const tip = (offset: number) => [(end[0] ?? 0) - 13 * Math.cos(angle + offset), (end[1] ?? 0) - 13 * Math.sin(angle + offset)].join(",");
  return <svg width={1920} height={1080} style={{position: "absolute", inset: 0, pointerEvents: "none"}} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
    <path d={points.map((v, i) => (i === 0 ? "M" : "L") + v.join(" ")).join(" ")} pathLength={1} strokeDasharray={dashed ? ".012 .008" : 1} strokeDashoffset={dashed ? 0 : 1 - p} opacity={dashed ? p : p > 0 ? 1 : 0}/>
    {arrow ? <polyline points={tip(.7) + " " + end.join(",") + " " + tip(-.7)} opacity={Math.max(0, (p - .88) / .12)}/> : null}
  </svg>;
};

export const Wave = ({w = 500, h = 50, color = C.ink, silent = false}: {w?: number; h?: number; color?: string; silent?: boolean}) => <svg width="100%" height="100%" viewBox={"0 0 " + w + " " + h} fill={color}>
  {silent ? <path d={"M5 " + h / 2 + "H" + (w - 5)} stroke={color} strokeWidth={3}/> : Array.from({length: 44}, (_, i) => {
    const height = 8 + ((i * 17 + 11) % 33) / 42 * h;
    return <rect key={i} x={i * w / 44 + 3} y={(h - height) / 2} width={Math.max(3, w / 110)} height={height} rx={2}/>;
  })}
</svg>;

/** Speech blocks, a retake and a silent span have distinct shapes before removal. */
export const Surgery = ({cut = 0, retake = 0, silence = 0, compact = false}: {cut?: number; retake?: number; silence?: number; compact?: boolean}) => {
  const blocks = [{x: 25, w: 240, label: "説明のはじめ", keep: true}, {x: 281, w: 145, label: "言い直し", keep: false}, {x: 442, w: 240, label: "続きの説明", keep: true}, {x: 698, w: 145, label: "長い無音", keep: false}, {x: 859, w: 240, label: "説明のつづき", keep: true}];
  const destinations = [181, 0, 437, 0, 693];
  const removed = Math.min(1, cut / .35);
  const closed = Math.max(0, (cut - .35) / .65);
  return <svg width="100%" height="100%" viewBox={compact ? "0 50 1124 112" : "0 0 1124 204"}>
    {blocks.map((b, i) => {
      const select = i === 1 ? retake : i === 3 ? silence : 0;
      const x = b.keep ? b.x + ((destinations[i] ?? b.x) - b.x) * closed : b.x;
      return <g key={i} opacity={b.keep ? 1 : 1 - removed} transform={"translate(" + x + " " + (b.keep ? 0 : -removed * 25) + ")"}>
        <text opacity={compact ? 0 : 1} x={b.w / 2} y={32} textAnchor="middle" fill={C.ink} fontSize={25} fontWeight={800}>{b.label}</text>
        <rect y={55} width={b.w} height={100} rx={17} fill={b.keep ? C.sky : C.pink} stroke={C.ink} strokeWidth={select * 3} strokeDasharray="7 5"/>
        {i === 3 ? <path d={"M20 105H" + (b.w - 20)} fill="none" stroke={C.ink} strokeWidth={3}/> : <g fill={C.ink}>{Array.from({length: 25}, (_, k) => {const h = 12 + (k * 13 + 7) % 43; return <rect key={k} x={14 + k * (b.w - 30) / 25} y={105 - h / 2} width={4} height={h} rx={2}/>;})}</g>}
      </g>;
    })}
    <text x={562} y={195} textAnchor="middle" fontSize={28} fontWeight={800} fill={C.ink} opacity={compact ? 0 : cut}>必要な話が、自然につながる</text>
  </svg>;
};

export const Plot = ({kind = "growth", p = 1}: {kind?: "growth" | "nodes" | "rank" | "people"; p?: number}) => <svg width="100%" height="100%" viewBox="0 0 400 210" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
  {kind === "growth" ? <><path d="M40 26v151h325" stroke={C.line}/><path d="M62 157C139 159 151 134 199 111S279 70 345 33" strokeWidth={9} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p}/><path d="m323 33 24-2-3 23" opacity={Math.max(0, (p - .85) / .15)}/></> : null}
  {kind === "nodes" ? <><path d="M109 105h78m0 0 94-58m-94 58h94m-94 0 94 58" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p}/><circle cx={78} cy={105} r={30} fill={C.sky}/>{[47,105,163].map(y => <circle key={y} cx={310} cy={y} r={24} fill={C.pink} opacity={p}/>)}</> : null}
  {kind === "people" ? <>{[0,1,2,3,4].map((i) => <g key={i} transform={"translate(" + (67 + (i % 3) * 115) + " " + (i < 3 ? 63 : 145) + ")"} opacity={i === 0 ? 1 : Math.max(0, Math.min(1, p * 4 - (i - 1)))}><circle cy={-17} r={13}/><path d="M-25 36V17a25 25 0 0 1 50 0v19"/></g>)}</> : null}
  {kind === "rank" ? <>{["A","B","C"].map((label, i) => {const y = 18 + i * 63;return <g key={label}><text x={22} y={y + 35} fill={C.ink} stroke="none" fontSize={28} fontWeight={900}>{i + 1}</text><rect x={65} y={y} width={(275 - i * 65) * p} height={46} rx={12} fill={[C.pink,C.sky,C.mint][i]} stroke="none"/><text x={79} y={y + 32} fill={C.ink} stroke="none" fontSize={27} fontWeight={800}>{label}</text></g>;})}</> : null}
</svg>;

export const Code = ({p = 1}: {p?: number}) => <svg width="100%" height="100%" viewBox="0 0 400 230" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
  <rect x={10} y={9} width={380} height={212} rx={25} fill={C.lavender} stroke="none"/>
  <path d="m77 44-22 22 22 22m58-44 22 22-22 22M115 35 96 97"/>
  {[260,210,280,165].map((w,i) => <path key={i} d={"M52 " + (119+i*23) + "h" + w * Math.max(0,Math.min(1,p*4-i))} opacity={.35+i*.1}/>)}
</svg>;

export const Timeline = ({p = 1, caption = false, trim = 0, graphic = 1}: {p?: number; caption?: boolean; trim?: number; graphic?: number}) => <svg width="100%" height="100%" viewBox="0 0 820 220">
  <g fontSize={23} fill={C.ink} fontWeight={800}><text x={0} y={48}>音声</text><text x={0} y={119}>図解</text>{caption ? <text x={0} y={191}>字幕</text> : null}</g>
  {[0,1,2].map(i => <g key={i} opacity={p}><rect x={100+i*236} y={13} width={i===2?218-trim*84:218} height={47} rx={10} fill={C.sky}/>{Array.from({length:19},(_,k)=><rect key={k} x={113+i*236+k*(i===2?10-trim*4:10)} y={26+(k%3)*2} width={4} height={24-(k%3)*4} rx={2} fill={C.ink}/>)}</g>)}
  {[C.pink,C.mint,C.lavender].map((color,i) => <g key={color} opacity={graphic}><rect x={100+i*236} y={82} width={i===2?218-trim*84:218} height={47} rx={10} fill={color}/><path d={"M"+(126+i*236)+" 114l33-18 31 8 38-16"} stroke={C.ink} strokeWidth={3} fill="none"/></g>)}
  {caption ? <><rect x={100} y={153} width={624-trim*68} height={46} rx={10} fill={C.yellow}/><text x={125} y={184} fontSize={25} fill={C.ink} fontWeight={800}>説明に合わせた字幕</text></> : null}
</svg>;

export const Recording = ({p = 1}: {p?: number}) => <svg width="100%" height="100%" viewBox="0 0 900 240" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
  <path d="M34 25h116l36 37v159H34zM150 25v39h36" fill={C.sky}/><path d="M62 103h92M62 139h92M62 176h63"/>
  <path d="M224 122h100m-15-15 15 15-15 15" opacity={p}/>
  <g opacity={p}><rect x={409} y={30} width={53} height={117} rx={26} fill={C.pink}/><path d="M380 117v17a55 55 0 0 0 110 0v-17M435 190v31M405 221h60"/></g>
  <path d="M533 122h98m-15-15 15 15-15 15" opacity={p}/>
  <rect x={665} y={56} width={217} height={140} rx={26} fill={C.sky} stroke="none" opacity={p}/>
  <g opacity={p}>{Array.from({length:23},(_,i)=>{const h=18+(i*13)%71;return <path key={i} d={"M"+(681+i*8)+" "+(126-h/2)+"v"+h} strokeWidth={4}/>;})}</g>
</svg>;

export const Shell = ({children}: {children: ReactNode}) => <div style={{fontFamily: motionSystemTheme.fontFamilyRounded}}>{children}</div>;
