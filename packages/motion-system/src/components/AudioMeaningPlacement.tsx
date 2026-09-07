import {Easing, interpolate} from "remotion";
import {motionSystemTheme} from "../theme";

const c = {
  ink: motionSystemTheme.colors.pastelInk,
  sky: motionSystemTheme.colors.pastelSky,
  pink: motionSystemTheme.colors.pastelPink,
  mint: motionSystemTheme.colors.watercolorMint,
  lavender: motionSystemTheme.colors.pastelLavender,
  line: motionSystemTheme.colors.pastelLine,
};
const progress = (frame: number, at: number, length = 20) => interpolate(frame, [at, at + length], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic)});

type Props = {
  frame: number;
  beats: readonly number[];
  audioLabel: string;
  visualLabel: string;
  placementLabel: string;
  examples: readonly [string, string, string];
};

const Wave = ({width, color = c.ink}: {width: number; color?: string}) => (
  <svg width={width} height={36} viewBox={`0 0 ${width} 36`}>
    {Array.from({length: 48}, (_, i) => {
      const h = 7 + ((i * 17 + 13) % 27);
      return <rect key={i} x={i * width / 48} y={(36 - h) / 2} width={4} height={h} rx={2} fill={color}/>;
    })}
  </svg>
);

/** Three concrete meanings, reused in the request preview and in the placed clips. */
const Meaning = ({kind, draw = 1}: {kind: number; draw?: number}) => {
  const person = (x: number, y: number, opacity: number) => <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} opacity={opacity}><circle cy={-13} r={8}/><path d="M-15 17v-7a15 15 0 0 1 30 0v7"/></g>;
  return <svg width="100%" height="100%" viewBox="0 0 300 110" fill="none" stroke={c.ink} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
    {kind === 0 ? <>
      {person(43, 60, 1)}
      <path d="M83 57h56m-11-10 11 10-11 10" opacity={draw}/>
      {person(185, 69, draw)}{person(231, 39, draw)}{person(269, 74, draw)}
    </> : kind === 1 ? <>
      <g strokeDasharray={1} pathLength={1}>
        {[25, 55, 85].map((y) => <path key={y} d={`M70 55H132Q151 55 170 ${y}H219`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}/>)}
      </g>
      {person(54, 57, 1)}
      {[25, 55, 85].map((y) => <g key={y} opacity={draw}><circle cx={239} cy={y} r={14} fill={c.pink}/><circle cx={239} cy={y - 4} r={3.2} strokeWidth={2}/><path d={`M233 ${y + 7}v-2a6 6 0 0 1 12 0v2`} strokeWidth={2}/></g>)}
    </> : <>
      <path d="M36 16v78h230" stroke={c.line}/>
      <path d="M48 82C107 84 135 72 166 55S221 33 256 15" strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}/>
      <path d="m239 15 18-1-3 18" opacity={draw}/>
    </>}
  </svg>;
};

const Arrow = ({x, y, opacity = 1}: {x: number; y: number; opacity?: number}) => <svg width={70} height={40} style={{position: "absolute", left: x, top: y, opacity}} viewBox="0 0 70 40" fill="none" stroke={c.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d="M8 20h49m-12-12 12 12-12 12"/></svg>;

/** A spoken request becomes concrete pictures that land under the matching speech. */
export const AudioMeaningPlacement = ({frame, beats, audioLabel, visualLabel, placementLabel, examples}: Props) => {
  const [requestAt = 0, audioAt = 75, makeAt = 165, placeAt = 224, basisAt = 319, readAt = 400, renderAt = 458, snapAt = 512] = beats;
  const change = progress(frame, basisAt - 16, 16);
  const source = progress(frame, audioAt);
  const make = progress(frame, makeAt, 30);
  const place = progress(frame, placeAt, 30);
  const tones = [c.sky, c.pink, c.mint];
  const columns = [384, 816, 1248];
  const landed = progress(frame, snapAt + 12, 34);
  const labels = ["人数が増える図", "紹介が広がる図", "成長を示すグラフ"];
  return <div style={{fontFamily: motionSystemTheme.fontFamilyRounded}}>
    <div style={{position: "absolute", inset: 0, opacity: (1 - change) * progress(frame, requestAt, 14), transform: `translateY(${-change * 20}px)`}}>
      <div style={{position: "absolute", left: 172, top: 322, width: 1576, height: 211, borderRadius: 34, background: c.lavender, padding: "25px 36px", boxSizing: "border-box"}}>
        <div style={{fontSize: 25, fontWeight: 800}}>Codexへの依頼</div>
        <div style={{marginTop: 19, fontSize: 39, fontWeight: 800, lineHeight: 1.4}}>
          <span style={{opacity: .25 + .75 * source}}>「この音声をもとに、</span><span style={{opacity: .25 + .75 * make}}>説明に合うアニメーションを作って、</span><br/>
          <span style={{opacity: .25 + .75 * place}}>{"\u3000"}話している場所に配置して」</span>
        </div>
      </div>
      {[0, 1, 2].map((i) => {
        const p = [source, make, place][i] ?? 0;
        return <div key={i} style={{position: "absolute", left: 172 + i * 552, top: 589, width: 472, height: 285, borderRadius: 32, border: `2px solid ${c.line}`, background: "rgba(255,255,255,.92)", opacity: .22 + p * .78}}>
          <div style={{position: "absolute", left: 28, top: 24, fontSize: 30, fontWeight: 900}}>{["① 音声を読む", "② Remotionで図解", "③ Palmierに配置"][i]}</div>
          {i === 0 ? <div style={{position: "absolute", left: 28, top: 96, width: 416, height: 128, borderRadius: 20, background: c.sky, padding: 22, boxSizing: "border-box"}}><div style={{fontSize: 26, fontWeight: 800, marginBottom: 15}}>「紹介が広がる」</div><Wave width={365}/></div> : i === 1 ? <div style={{position: "absolute", left: 35, top: 94, width: 402, height: 130, background: c.pink, borderRadius: 20}}><Meaning kind={1} draw={make}/></div> : <>
            <div style={{position: "absolute", left: 30, top: 98, width: 412, height: 54, borderRadius: 12, background: c.sky, display: "grid", placeItems: "center"}}><Wave width={377}/></div>
            <div style={{position: "absolute", left: 135, top: 167, width: 200, height: 65, border: `2px dashed ${c.line}`, borderRadius: 12}}/>
            <div style={{position: "absolute", left: 135, top: 157 + place * 10, width: 200, height: 65, borderRadius: 12, background: c.pink, opacity: place}}><Meaning kind={1}/></div>
            <div style={{position: "absolute", left: 135, top: 90, width: 200, height: 151, borderLeft: `2px dashed ${c.ink}`, borderRight: `2px dashed ${c.ink}`, opacity: place * .65}}/>
          </>}
        </div>;
      })}
      <Arrow x={647} y={713} opacity={make}/><Arrow x={1199} y={713} opacity={place}/>
    </div>

    <div style={{position: "absolute", inset: 0, opacity: change, transform: `translateY(${(1 - change) * 20}px)`}}>
      <div style={{position: "absolute", left: 172, top: 318, fontSize: 33, fontWeight: 900}}>{frame < readAt ? "基準は、カット後の音声" : frame < renderAt ? "AIが、何を説明しているかを読む" : frame < snapAt ? "Remotionで、内容に合う図解を生成" : placementLabel}</div>
      <div style={{position: "absolute", right: 172, top: 323, fontSize: 23, fontWeight: 800, color: c.ink, opacity: .7}}>配置の例：ユーザー・紹介・成長</div>
      <div style={{position: "absolute", left: 366, top: 413, width: 1280, height: 2, background: c.line}}/>
      <div style={{position: "absolute", left: 172, top: 449, fontSize: 25, fontWeight: 900, lineHeight: 1.5}}>Palmier<br/>{audioLabel}</div>
      <div style={{position: "absolute", left: 172, top: 767, fontSize: 25, fontWeight: 900, lineHeight: 1.5}}>Palmier<br/>{visualLabel}</div>
      {columns.map((x, i) => {
        const tone = tones[i];
        const understand = progress(frame, readAt + i * 12, 14);
        const generate = progress(frame, renderAt + i * 8, 20);
        const drop = progress(frame, snapAt + i * 6, 34);
        const cardTop = interpolate(drop, [0, 1], [583, 737]);
        return <div key={x}>
          <div style={{position: "absolute", left: x, top: 389, fontSize: 21, fontWeight: 800, opacity: .7}}>説明 {i + 1}</div>
          <div style={{position: "absolute", left: x, top: 438, width: 380, height: 113, borderRadius: 20, background: tone, boxShadow: `inset 0 0 0 ${2 + understand * 2}px ${c.ink}${understand > .1 ? "99" : "00"}`, padding: "17px 22px", boxSizing: "border-box"}}>
            <div style={{fontSize: 29, fontWeight: 900, marginBottom: 11}}>{examples[i]}</div><Wave width={336}/>
          </div>
          <div style={{position: "absolute", left: x, top: 737, width: 380, height: 143, border: `2px dashed ${c.line}`, boxSizing: "border-box", borderRadius: 22, opacity: 1 - drop * .5}}/>
          <svg width={380} height={186} style={{position: "absolute", left: x, top: 551, opacity: drop}}><path d="M2 4v173m376-173v173" fill="none" stroke={c.ink} strokeWidth={2} strokeDasharray="7 7"/><path d="m180 154 10 12 10-12" fill="none" stroke={c.ink} strokeWidth={3}/></svg>
          <div style={{position: "absolute", left: x, top: cardTop, width: 380, height: 143, borderRadius: 22, background: tone, boxShadow: `0 ${8 * (1 - drop)}px 18px ${c.ink}12`, opacity: generate, overflow: "hidden"}}>
            <div style={{position: "absolute", left: 31, top: 0, width: 318, height: 101}}><Meaning kind={i} draw={generate}/></div>
            <div style={{position: "absolute", left: 18, bottom: 12, width: 344, textAlign: "center", fontSize: 24, fontWeight: 900}}>{labels[i]}</div>
          </div>
          <div style={{position: "absolute", left: x, top: 893, width: 380, textAlign: "center", fontSize: 24, fontWeight: 900, opacity: drop}}>✓ 説明 {i + 1} と一致</div>
        </div>;
      })}
      <div style={{position: "absolute", left: 385, top: 940, fontSize: 28, fontWeight: 900, opacity: landed}}>同じ色・同じ番号の「発話」と「図解」を、同じ区間にそろえる</div>
    </div>
  </div>;
};
