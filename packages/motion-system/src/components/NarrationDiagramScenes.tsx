import {Area, at, Badge, Box, C, Chat, Code, Line, P, Plot, Shell, Txt, type Scene} from "./NarrationPrimitives";

export const CodeForms = ({d,frame:f}:Scene) => {
  if(d.kind!=="code-becomes-visual-forms")return null;
  const source=P(f,at(d,0)), values=[P(f,at(d,1)),P(f,at(d,2)),P(f,at(d,3))];
  return <Shell>
    <Txt x={172} y={375} w={407} size={32} align="center" p={source}>Remotionのコード</Txt>
    <Box x={172} y={442} w={407} h={383} p={source} tone={C.lavender} style={{border:"none"}}><Area x={23} y={55} w={361} h={225}><Code p={1}/></Area><Txt x={21} y={301} w={365} align="center" size={26}>形・順番・動きを記述</Txt></Box>
    {values.map((p,i)=><Line key={i} points={[[591,632],[646,632],[646,425+i*213],[697,425+i*213]]} p={p}/>)}
    {[{title:d.examples[0],kind:"growth" as const,tone:C.sky},{title:d.examples[1],kind:"nodes" as const,tone:C.pink},{title:d.examples[2],kind:"rank" as const,tone:C.mint}].map(({title,kind,tone},i)=><Box key={kind} x={709} y={335+i*213} w={1039} h={185} p={values[i] ?? 0}>
      <Badge x={23} y={21} tone={tone} size={27}>{["数字","関係","順位"][i]}</Badge>
      <Txt x={25} y={91} w={359} size={29}>{title}</Txt>
      <Area x={435} y={13} w={561} h={153}><Plot kind={kind} p={P(f,at(d,i+1)+6,26)}/></Area>
      {i===2?<Txt x={397} y={144} size={18}>比較例</Txt>:null}
    </Box>)}
    <Txt x={710} y={960} w={1038} align="center" size={25} p={P(f,at(d,4))}>説明に合う形と動きを、コードから作る</Txt>
  </Shell>;
};

export const PromptRender = ({d,frame:f}:Scene) => {
  if(d.kind!=="prompt-to-render")return null;
  const request=P(f,at(d,0)), code=P(f,at(d,1)), ai=P(f,at(d,2)), out=P(f,at(d,3),28), noHand=P(f,at(d,4));
  return <Shell>
    <Chat x={172} y={407} w={544} text={d.prompt} p={request} who="あなたが説明したいこと"/>
    <Box x={172} y={621} w={544} h={207} p={noHand} tone={C.sky} style={{border:"none"}}><Txt x={28} y={28} size={30}>人は、意図を伝えればよい</Txt><Txt x={28} y={99} w={488} size={29}>コードは自分で{"\n"}書く必要がない</Txt></Box>
    <Line points={[[730,482],[794,482]]} p={ai}/>
    <Box x={807} y={331} w={941} h={577} p={code}><Badge x={25} y={22} tone={C.lavender} size={31}>Codexがコードを生成</Badge>
      <Area x={37} y={157} w={366} h={260}><Code p={ai}/></Area>
      <Txt x={37} y={450} w={366} align="center" size={27}>AIがアニメーションを実装</Txt>
      <Box x={512} y={137} w={394} h={335} tone={C.pink} p={out} style={{border:"none"}}><Area x={16} y={39} w={362} h={229}><Plot kind="nodes" p={out}/></Area></Box>
      <Txt x={513} y={499} w={394} align="center" size={27} p={out}>{d.outputLabel}</Txt>
    </Box>
    <Line points={[[1227,632],[1304,632]]} p={out}/>
  </Shell>;
};

const Person = ({x,y,p=1,tone=C.sky}: {x:number;y:number;p?:number;tone?:string}) => <div style={{position:"absolute",left:x-54,top:y-60,opacity:p}}><svg width={108} height={120} viewBox="0 0 108 120" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round"><circle cx={54} cy={31} r={21} fill={tone}/><path d="M18 108V85a36 36 0 0 1 72 0v23" fill={tone}/></svg></div>;

export const ReferralGrowth = ({d,frame:f}:Scene) => {
  if(d.kind!=="referral-growth-flywheel")return null;
  const users=P(f,at(d,0)), referrals=P(f,at(d,1)), growth=P(f,at(d,2),34), ai=P(f,at(d,3)), loop=P(f,at(d,7),38);
  const pulse=(i:number)=>P(f,at(d,4+i),10)*(1-P(f,at(d,4+i)+27,14));
  return <Shell>
    <Badge x={199} y={338} tone={C.sky}>① {d.entities[0]}が増える</Badge><Badge x={747} y={338} tone={C.pink} p={referrals}>② {d.entities[1]}が生まれる</Badge><Badge x={1276} y={338} tone={C.mint} p={growth}>③ {d.entities[2]}が加速</Badge>
    <div style={{position:"absolute",left:203,top:471,width:371,height:342,borderRadius:64,background:C.sky,opacity:pulse(0)*.45}}/>
    <div style={{position:"absolute",left:762,top:427,width:291,height:419,borderRadius:64,background:C.pink,opacity:pulse(1)*.45}}/>
    <Person x={327} y={586}/><Person x={465} y={582} p={users}/><Person x={395} y={731} p={users}/>
    {[481,633,785].map((y,i)=><Line key={y} points={[[541,638],[687,638],[843,y]]} p={P(f,at(d,1)+i*6,24)}/>)}
    {[481,633,785].map((y,i)=><Person key={y} x={912} y={y} p={P(f,at(d,1)+i*6,24)} tone={C.pink}/>)}
    <Line points={[[987,633],[1186,633]]} p={growth}/>
    <Box x={1215} y={458} w={533} h={381} p={growth} tone={C.mint} style={{border:"none",boxShadow:"0 0 0 "+pulse(2)*7+"px "+C.lavender}}>
      <Txt x={27} y={25} size={31}>紹介が、次の成長を生む</Txt><Area x={35} y={102} w={463} h={226}><Plot p={growth}/></Area>
    </Box>
    <Line points={[[1480,850],[1480,901],[394,901],[394,800]]} p={loop}/>
    <Badge x={700} y={874} p={loop} tone={C.yellow} size={25}>さらに、ユーザーが増える</Badge>
    <Txt x={172} y={950} w={1576} align="center" size={26} p={ai}>AIが「ユーザー → 紹介 → 成長」の順番で動きを組み立てる</Txt>
  </Shell>;
};

export const SpeechStoryboard = ({d,frame:f}:Scene) => {
  if(d.kind!=="speech-to-storyboard")return null;
  const content=P(f,at(d,0)), order=P(f,at(d,1)), motion=P(f,at(d,2)), ai=P(f,at(d,3)), visual=P(f,at(d,4)), reader=P(f,at(d,5));
  return <Shell>
    <Box x={172} y={372} w={425} h={486} p={content}><Badge x={25} y={24}>話している内容</Badge><Txt x={28} y={112} w={365} size={31}>「ユーザーが増える」{"\n\n"}「紹介が広がる」{"\n\n"}「成長が加速する」</Txt></Box>
    <Txt x={174} y={883} w={422} align="center" size={23} p={content}>例：紹介による成長の説明</Txt>
    <Line points={[[610,610],[677,610]]} p={order}/>
    <Badge x={699} y={322} tone={C.lavender} p={ai}>AIが、順番と動きを設計する</Badge>
    {["増える","広がる","加速する"].map((s,i)=><Box key={s} x={699+i*356} y={409} w={337} h={449} p={P(f,at(d,1)+i*8)}><Badge x={22} y={24} tone={[C.sky,C.pink,C.mint][i] ?? C.sky} size={27}>{i+1} / {s}</Badge><Area x={20} y={127} w={297} h={210}><Plot kind={i===0?"people":i===1?"nodes":"growth"} p={P(f,at(d,2)+i*20,35)}/></Area><Txt x={20} y={373} w={297} align="center" size={25}>{["人数が増える動き","つながりが伸びる動き","曲線が上がる動き"][i]}</Txt></Box>)}
    <div style={{position:"absolute",left:719,top:890,width:1009,height:7,borderRadius:8,background:C.line,opacity:motion}}/>
    <div style={{position:"absolute",left:719+reader*995,top:877,width:19,height:31,borderRadius:7,background:C.ink,opacity:visual}}/>
    <Txt x={699} y={931} w={1049} align="center" size={30} p={visual}>言葉だけの説明が、目で追える流れになる</Txt>
  </Shell>;
};
