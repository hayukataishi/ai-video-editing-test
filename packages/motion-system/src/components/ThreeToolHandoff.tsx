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

type Props = {
  frame: number;
  beats: readonly number[];
  tools: readonly [string, string, string];
  steps: readonly [string, string, string];
};

const progress = (frame: number, at: number, duration = 20) =>
  interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

const Wave = ({x, y, width, height = 48}: {x: number; y: number; width: number; height?: number}) => (
  <g fill={c.ink}>
    {Array.from({length: 24}, (_, i) => {
      const h = 8 + ((i * 17 + 11) % 33) * height / 42;
      return <rect key={i} x={x + i * width / 24} y={y + (height - h) / 2} width={4} height={h} rx={2}/>;
    })}
  </g>
);

const Arrow = ({x, y, p = 1}: {x: number; y: number; p?: number}) => (
  <svg width={70} height={42} viewBox="0 0 70 42" style={{position: "absolute", left: x, top: y, opacity: p}} fill="none" stroke={c.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h49m-12-12 12 12-12 12"/>
  </svg>
);

/** The removed span lifts away, then the right speech closes the gap. */
const EditingDemo = ({cut}: {cut: number}) => (
  <svg width="100%" height="100%" viewBox="0 0 620 210">
    <rect x={25} y={45} width={570} height={102} rx={20} fill={c.sky}/>
    <g opacity={1 - cut} transform={"translate(0 " + -cut * 32 + ")"}>
      <rect x={249} y={42} width={116} height={108} rx={15} fill={c.pink} stroke={c.ink} strokeWidth={2} strokeDasharray="6 5"/>
      <path d="M274 96h66" stroke={c.ink} strokeWidth={3} strokeLinecap="round"/>
      <text x={307} y={30} textAnchor="middle" fontSize={24} fontWeight={800} fill={c.ink}>不要な部分</text>
    </g>
    <Wave x={43 + cut * 63} y={70} width={194}/>
    <Wave x={377 - cut * 63} y={70} width={194}/>
    <path d="M304 66v60" stroke={c.ink} strokeWidth={2} strokeDasharray="4 5" opacity={cut}/>
    <text x={310} y={193} textAnchor="middle" fontSize={25} fontWeight={800} fill={c.ink} opacity={cut}>必要な音声がつながる</text>
  </svg>
);

/** Code is visibly transformed into an animated graph, not merely an app logo. */
const CodeToDiagram = ({draw}: {draw: number}) => (
  <svg width="100%" height="100%" viewBox="0 0 620 210" fill="none" stroke={c.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    <rect x={25} y={25} width={200} height={140} rx={20} fill={c.lavender} stroke="none"/>
    <path d="m76 57-17 17 17 17m33-34 17 17-17 17M96 50 84 98"/>
    <path d="M61 119h126M61 139h83" opacity={.45}/>
    <path d="M257 94h46m-12-12 12 12-12 12" opacity={draw}/>
    <rect x={342} y={25} width={253} height={140} rx={20} fill={c.pink} stroke="none" opacity={draw}/>
    <g opacity={draw}>
      <path d="M374 49v88h190" stroke={c.line}/>
      <path d="M387 122C437 122 437 100 469 93S522 76 557 46" strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}/>
      <path d="m542 46 16-1-2 16"/>
    </g>
    <g fill={c.ink} stroke="none" fontSize={24} fontWeight={800} textAnchor="middle">
      <text x={125} y={197}>AIが書いたコード</text>
      <text x={468} y={197} opacity={draw}>説明アニメーション</text>
    </g>
  </svg>
);

const PlacedDiagram = ({place}: {place: number}) => (
  <svg width="100%" height="100%" viewBox="0 0 420 155">
    <rect x={12} y={9} width={396} height={48} rx={12} fill={c.sky}/>
    <Wave x={26} y={14} width={373} height={36}/>
    {[0, 1, 2].map((i) => <g key={i}>
      <rect x={12 + i * 135} y={83} width={126} height={62} rx={10} fill="none" stroke={c.line} strokeWidth={2} strokeDasharray="5 4"/>
      <g opacity={place} transform={"translate(" + (12 + i * 135) + " " + (64 + place * 19) + ")"}>
        <rect width={126} height={62} rx={10} fill={[c.pink, c.mint, c.lavender][i]}/>
        <path d={i === 0 ? "M31 43 52 27 69 33 95 15" : i === 1 ? "M31 31H60M60 31 90 15M60 31 90 47" : "M34 43V30M61 43V20M88 43V11"} fill="none" stroke={c.ink} strokeWidth={4} strokeLinecap="round"/>
      </g>
      <path d={"M" + (75 + i * 135) + " 59v18"} stroke={c.ink} strokeWidth={2} strokeDasharray="3 3" opacity={place}/>
    </g>)}
  </svg>
);

const RecordStrip = ({frame, at, steps}: {frame: number; at: number; steps: Props["steps"]}) => {
  const script = progress(frame, at, 12);
  const voice = progress(frame, at + 17, 16);
  const recorded = progress(frame, at + 35, 18);
  return <div style={{position: "absolute", left: 172, top: 329, width: 1576, height: 164, borderRadius: 30, background: "rgba(255,255,255,.92)", border: "2px solid " + c.line, boxSizing: "border-box"}}>
    <div style={{position: "absolute", left: 28, top: 22, fontSize: 22, fontWeight: 800, opacity: script}}>まず、あなたが</div>
    <div style={{position: "absolute", left: 28, top: 67, fontSize: 32, fontWeight: 900, opacity: script}}>{steps[0]}</div>
    <svg width={98} height={114} viewBox="0 0 98 114" style={{position: "absolute", left: 339, top: 24, opacity: script}} fill={c.sky} stroke={c.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 8h43l18 18v78H19zM62 8v21h18"/>
      <path d="M32 48h34M32 65h34M32 82h25"/>
    </svg>
    <Arrow x={458} y={62} p={voice}/>
    <svg width={94} height={110} viewBox="0 0 94 110" style={{position: "absolute", left: 572, top: 25, opacity: voice}} fill={c.pink} stroke={c.ink} strokeWidth={4} strokeLinecap="round">
      <rect x={34} y={11} width={26} height={51} rx={13}/>
      <path d="M20 48v7a27 27 0 0 0 54 0v-7M47 82v17M31 99h32" fill="none"/>
    </svg>
    <div style={{position: "absolute", left: 691, top: 64, fontSize: 32, fontWeight: 900, opacity: voice}}>{steps[1]}</div>
    <Arrow x={930} y={62} p={recorded}/>
    <div style={{position: "absolute", left: 1060, top: 28, width: 479, height: 103, borderRadius: 22, background: c.sky, opacity: recorded}}>
      <div style={{position: "absolute", left: 23, top: 12, fontSize: 23, fontWeight: 800}}>収録した音声</div>
      <svg width={433} height={42} style={{position: "absolute", left: 23, top: 49}}><Wave x={0} y={0} width={426} height={40}/></svg>
    </div>
  </div>;
};

/**
 * First demonstrate each tool's job; then summarize the spoken production flow.
 * The wrapper supplies the current frame, preserving the stable public composition.
 */
export const ThreeToolHandoff = ({frame, beats, tools, steps}: Props) => {
  const [palmierAt = 0, remotionAt = 151, codexAt = 298, connectAt = 343, recordAt = 418, editAt = 488, placeAt = 545, commandAt = 587] = beats;
  const rolesOut = progress(frame, recordAt - 20, 12);
  const recapIn = progress(frame, recordAt - 8, 14);
  const palmier = progress(frame, palmierAt + 8, 18);
  const remotion = progress(frame, remotionAt, 18);
  const codex = progress(frame, codexAt, 18);
  const connect = progress(frame, connectAt, 30);
  const edited = progress(frame, palmierAt + 80, 30);
  const generated = progress(frame, remotionAt + 86, 32);
  const editing = progress(frame, editAt, 16);
  const diagram = progress(frame, editAt + 24, 18);
  const placement = progress(frame, placeAt, 26);
  const command = progress(frame, commandAt, 20);
  return <div style={{fontFamily: motionSystemTheme.fontFamilyRounded}}>
    <div style={{position: "absolute", inset: 0, opacity: 1 - rolesOut}}>
      <div style={{position: "absolute", left: 172, top: 344, fontSize: 33, fontWeight: 900, opacity: 1 - codex}}>
        {frame < remotionAt ? "Palmier Proは、指示を受けて編集を実行" : "Remotionは、コードから説明アニメーションを作る"}
      </div>
      <div style={{position: "absolute", left: 571, top: 320, width: 778, height: 110, borderRadius: 30, background: c.lavender, opacity: codex, display: "flex", alignItems: "center", justifyContent: "center", gap: 30}}>
        <svg width={57} height={57} viewBox="0 0 64 64" fill="none" stroke={c.ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><path d="M8 8h48v34H29L14 55V42H8zM19 21h26M19 31h19"/></svg>
        <div style={{fontSize: 37, fontWeight: 900}}>{tools[2]}</div>
        <div style={{fontSize: 28, fontWeight: 800}}>チャットから2つを操作</div>
      </div>
      <svg width={1920} height={1080} style={{position: "absolute", inset: 0}} fill="none" stroke={c.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M725 430v14H536v24m-9-10 9 10 9-10M1195 430v14h189v24m-9-10 9 10 9-10" opacity={connect}/>
      </svg>
      {[{x: 172, show: palmier, tone: c.sky, label: tools[0], role: "動画を編集する", i: 0}, {x: 1020, show: remotion, tone: c.pink, label: tools[1], role: "図解を作る", i: 1}].map(({x, show, tone, label, role, i}) => (
        <div key={label} style={{position: "absolute", left: x, top: 475, width: 728, height: 399, borderRadius: 32, border: "2px solid " + c.line, boxSizing: "border-box", background: "rgba(255,255,255,.94)", opacity: show, boxShadow: connect > 0 ? "0 0 0 " + (connect * 5) + "px " + c.lavender : undefined}}>
          <div style={{position: "absolute", left: 29, top: 22, padding: "8px 20px", borderRadius: 17, background: tone, fontSize: 34, fontWeight: 900}}>{label}</div>
          <div style={{position: "absolute", right: 29, top: 33, fontSize: 27, fontWeight: 800}}>{role}</div>
          <div style={{position: "absolute", left: 27, top: 120, width: 674, height: 228}}>
            {i === 0 ? <EditingDemo cut={edited}/> : <CodeToDiagram draw={generated}/>}
          </div>
        </div>
      ))}
      <div style={{position: "absolute", left: 172, top: 914, width: 1576, textAlign: "center", fontSize: 30, fontWeight: 900, opacity: connect}}>編集も、図解づくりも、同じチャットが窓口</div>
    </div>

    <div style={{position: "absolute", inset: 0, opacity: recapIn}}>
      <RecordStrip frame={frame} at={recordAt} steps={steps}/>
      <div style={{position: "absolute", left: 762, top: 509, fontSize: 23, fontWeight: 800, opacity: progress(frame, recordAt + 47, 12)}}>収録した音声を渡す</div>
      <svg width={1920} height={1080} style={{position: "absolute", inset: 0}} fill="none" stroke={c.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1472 494v56H408v20" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(frame, recordAt + 47, 18)}/>
        <path d="m399 560 9 10 9-10" opacity={progress(frame, recordAt + 61, 4)}/>
      </svg>
      {[{x: 172, p: editing, title: "編集", tool: tools[0], tone: c.sky, i: 0}, {x: 724, p: diagram, title: "図解づくり", tool: tools[1], tone: c.pink, i: 1}, {x: 1276, p: placement, title: "タイムライン配置", tool: tools[0], tone: c.mint, i: 2}].map(({x, p, title, tool, tone, i}) => (
        <div key={title} style={{position: "absolute", left: x, top: 581, width: 472, height: 258, borderRadius: 30, background: "rgba(255,255,255,.96)", border: "2px solid " + c.line, boxSizing: "border-box", opacity: p}}>
          <div style={{position: "absolute", left: 27, top: 18, fontSize: 31, fontWeight: 900}}>{title}</div>
          <div style={{position: "absolute", left: 27, top: 63, background: tone, borderRadius: 12, padding: "4px 12px", fontSize: 21, fontWeight: 800}}>{tool}</div>
          <div style={{position: "absolute", left: 24, top: 115, width: 424, height: 125}}>
            {i === 0 ? <EditingDemo cut={progress(frame, editAt + 4, 22)}/> : i === 1 ? <CodeToDiagram draw={progress(frame, editAt + 24, 24)}/> : <PlacedDiagram place={placement}/>}
          </div>
        </div>
      ))}
      <Arrow x={647} y={699} p={diagram}/><Arrow x={1199} y={699} p={placement}/>
      <svg width={1920} height={1080} style={{position: "absolute", inset: 0}} fill="none" stroke={c.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={command}>
        <path d="M960 889v-28H408v-16m-8 9 8-9 8 9M960 861v-16m-8 9 8-9 8 9M960 861h552v-16m-8 9 8-9 8 9"/>
      </svg>
      <div style={{position: "absolute", left: 172, top: 889, width: 1576, height: 84, borderRadius: 26, background: c.lavender, display: "flex", alignItems: "center", justifyContent: "center", gap: 28, opacity: command}}>
        <div style={{fontSize: 33, fontWeight: 900}}>{tools[2]}</div>
        <svg width={42} height={42} viewBox="0 0 64 64" fill="none" stroke={c.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d="M8 8h48v34H29L14 55V42H8zM19 21h26M19 31h19"/></svg>
        <div style={{fontSize: 31, fontWeight: 900}}>{steps[2]}</div>
      </div>
    </div>
  </div>;
};
