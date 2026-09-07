import {Area, at, Badge, Box, C, Chat, Code, Line, P, Plot, Recording, Shell, Surgery, Timeline, Txt, Wave, type Scene} from "./NarrationPrimitives";

const RelationChain = () => <svg width="100%" height="100%" viewBox="0 0 880 265" fill="none" stroke={C.ink} strokeWidth={5}>
        <path d="M200 132h180m-14-14 14 14-14 14M499 132h180m-14-14 14 14-14 14"/>
        {[140,440,740].map((x,i)=><g key={x}><circle cx={x} cy={132} r={56} fill={[C.sky,C.pink,C.mint][i]}/><text x={x} y={143} textAnchor="middle" fill={C.ink} stroke="none" fontSize={34} fontWeight={800}>{["A","B","C"][i]}</text></g>)}
      </svg>;

export const CommandRouter = ({d,frame:f}:Scene) => {
  if(d.kind!=="command-router-to-edit")return null;
  const hub=P(f,at(d,0)), pal=P(f,at(d,1)), rem=P(f,at(d,2)), route=P(f,at(d,3)), example=P(f,at(d,4)), imported=P(f,at(d,5)), select=P(f,at(d,6)), cut=P(f,at(d,7),25);
  return <Shell>
    <Box x={172} y={334} w={586} h={599} tone={C.lavender} p={hub} style={{border:"none"}}><Txt x={29} y={25} size={42}>{d.hub}</Txt><Txt x={29} y={92} w={527} size={29}>両方のツールを{"\n"}チャットから動かす窓口</Txt>
      <Box x={26} y={219} w={534} h={254} p={example} style={{border:"none"}}><Txt x={24} y={20} size={23}>例えば、編集を頼む</Txt><Txt x={24} y={76} w={483} size={30}>{d.prompt}</Txt></Box>
      <Badge x={29} y={510} tone={C.mint} p={cut}>Palmier Proへ反映</Badge>
    </Box>
    <Line points={[[771,513],[844,513],[844,438],[930,438]]} p={route}/>
    <Line points={[[771,513],[844,513],[844,770],[930,770]]} p={route*(1-example*.65)} color={C.line}/>
    <Box x={947} y={334} w={801} h={273} p={pal}><Badge x={26} y={22} size={31}>{d.branches[0]}</Badge><Txt x={387} y={34} size={27}>編集を実行</Txt>
      <Box x={28} y={115} w={745} h={112} style={{borderStyle:"dashed",borderRadius:16}}/>
      <Area x={34} y={115} w={733} h={112} p={imported}><Surgery cut={cut} retake={select} silence={select} compact/></Area>
      <Txt x={29} y={235} size={23} p={imported}>{cut>.9?"不要部分をカットして、音声をつなぐ":"音声を読み込み、カットする範囲を選ぶ"}</Txt>
    </Box>
    <Box x={947} y={666} w={801} h={267} p={rem*(1-example*.5)}><Badge x={26} y={22} tone={C.pink} size={31}>{d.branches[1]}</Badge><Txt x={386} y={34} size={27}>図解を生成</Txt><Area x={28} y={93} w={288} h={149}><Code/></Area><Area x={446} y={95} w={319} h={151}><Plot kind="nodes" p={route}/></Area></Box>
    <Line points={[[1279,831],[1378,831]]} p={route*(1-example*.5)}/>
  </Shell>;
};

export const SpokenPlacement = ({d,frame:f}:Scene) => {
  if(d.kind!=="generate-and-place-at-the-spoken-beat")return null;
  const source=P(f,at(d,0)), request=P(f,at(d,1)), understand=P(f,at(d,4)), generated=P(f,at(d,5),28), placed=P(f,at(d,6),33), confirmed=P(f,at(d,7));
  const assetX=1337+(516-1337)*placed;
  return <Shell>
    <Chat x={172} y={319} w={1576} text="カット後の音声に合う図解を作って、話している箇所へ配置して" p={source}/>
    <Box x={172} y={499} w={978} h={391} p={request}><Badge x={24} y={20} size={29}>Palmier Pro</Badge><Txt x={459} y={31} size={24}>例：紹介について話す区間</Txt>
      {["説明の導入","紹介が広がる","次の話題"].map((s,i)=><div key={s}>
        <Txt x={25+i*313} y={89} w={290} align="center" size={25}>{s}</Txt>
        <Box x={25+i*313} y={129} w={290} h={63} tone={i===1?C.pink:C.sky} style={{border:i===1?"3px solid "+C.ink:"none",opacity:i===1?1:.52}}>
          <Area x={13} y={11} w={264} h={41}><Wave/></Area>
        </Box>
      </div>)}
      <Txt x={25} y={219} size={23}>図解のトラック</Txt>
      <Box x={344} y={238} w={278} h={132} style={{borderStyle:"dashed",borderRadius:20}}/>
    </Box>
    <Box x={1228} y={499} w={520} h={391} p={generated}><Badge x={23} y={20} tone={C.pink} size={29}>Remotion</Badge><Area x={239} y={14} w={249} h={137}><Code p={generated}/></Area><Txt x={29} y={160} w={459} align="center" size={24}>「紹介が広がる」を、図にする</Txt></Box>
    <Box x={assetX} y={740} w={278} h={129} p={generated} tone={C.pink} style={{border:"none",borderRadius:20}}><Area x={10} y={5} w={258} h={120}><Plot kind="nodes" p={generated}/></Area></Box>
    <Line points={[[655,696],[655,729]]} p={understand*placed}/>
    <Txt x={174} y={926} w={1574} align="center" size={30} p={confirmed}>発話の内容と、図の内容・表示する区間が一致する</Txt>
  </Shell>;
};

export const ChatRevisions = ({d,frame:f}:Scene) => {
  if(d.kind!=="one-chat-revisions")return null;
  const edit=P(f,at(d,0)), animate=P(f,at(d,1)), same=P(f,at(d,2)), simple=P(f,at(d,3)+12,18), hide=P(f,at(d,3),12), sync=P(f,at(d,4)+14,32), done=P(f,at(d,6));
  return <Shell>
    <Badge x={172} y={323} tone={C.lavender} p={same}>同じCodexチャットで続けて頼む</Badge>
    <Box x={172} y={404} w={511} h={82} tone={C.sky} p={edit} style={{border:"none"}}><Txt x={24} y={21} size={29}>編集の指示も</Txt></Box>
    <Box x={172} y={509} w={511} h={82} tone={C.pink} p={animate} style={{border:"none"}}><Txt x={24} y={21} size={29}>アニメーションの指示も</Txt></Box>
    <Chat x={172} y={629} w={511} text={d.simplifyLabel} p={P(f,at(d,3))}/>
    <Chat x={172} y={809} w={511} text={d.syncLabel} p={P(f,at(d,4))}/>
    <Line points={[[696,703],[750,703]]} p={simple}/><Line points={[[696,885],[750,885]]} p={sync}/>
    <Box x={766} y={324} w={982} h={637}><Txt x={27} y={24} size={32}>{simple>.5?"図を整理して、関係を見やすく":"要素の多い図を、シンプルにする"}</Txt>
      <Area x={28} y={111} w={926} h={272} p={1-hide}><svg width="100%" height="100%" viewBox="0 0 880 265" fill="none" stroke={C.line} strokeWidth={4}>
        <path d="M79 132 254 54 420 135 605 44 801 128 618 222 420 135 263 219 79 132M254 54 263 219 605 44M618 222 254 54M801 128H79"/>
        {[[79,132],[254,54],[420,135],[605,44],[801,128],[618,222],[263,219]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={29} fill={[C.sky,C.pink,C.mint][i%3]} stroke={C.ink}/>)}
      </svg></Area>
      <Area x={28} y={111} w={926} h={272} p={simple}><RelationChain/></Area>
      <Txt x={28} y={424} size={24}>音声の区間</Txt><Box x={226} y={409} w={306} h={59} tone={C.pink} style={{border:"none",borderRadius:13}}><Area x={14} y={10} w={279} h={40}><Wave/></Area></Box>
      <Txt x={28} y={526} size={24}>図解の区間</Txt><Box x={504+(226-504)*sync} y={511} w={306} h={69} tone={C.pink} style={{border:"none",borderRadius:13}}><Area x={39} y={4} w={228} h={60} p={1-hide}><Plot kind="nodes"/></Area><Area x={39} y={4} w={228} h={60} p={simple}><RelationChain/></Area></Box>
    </Box>
    <Line points={[[1145,802],[1145,827]]} p={sync}/>
    <Badge x={1380} y={335} tone={C.mint} p={done} size={24}>会話で修正を反映</Badge>
  </Shell>;
};

export const ProductionSteps = ({d,frame:f}:Scene) => {
  if(d.kind!=="production-steps-one-and-two")return null;
  const overview=P(f,at(d,0)), record=P(f,at(d,1)), voice=P(f,at(d,2)), next=P(f,at(d,3),16), command=P(f,at(d,4)), loaded=P(f,at(d,5)), select=P(f,at(d,6)-39), cut=P(f,at(d,6)+60,22), smooth=P(f,at(d,7),25);
  return <Shell>
    {[{x:172,label:"1  台本から収録",tone:C.sky},{x:711,label:"2  音声を編集",tone:C.pink},{x:1250,label:"3  図解を生成・配置",tone:C.mint}].map(({x,label,tone},i)=><Box key={i} x={x} y={320} w={498} h={76} p={overview*(i===2?.4:1)} tone={tone} style={{border:i===(next>.5?1:0)?"3px solid "+C.ink:"none",borderRadius:22}}><Txt x={20} y={19} w={458} align="center" size={28}>{label}</Txt></Box>)}
    <Box x={172} y={441} w={1576} h={444} p={record*(1-next)}><Txt x={28} y={27} size={33}>まず、台本をもとに音声を収録する</Txt><Area x={133} y={107} w={1310} h={282}><Recording p={voice}/></Area></Box>
    <div style={{opacity:next}}>
      <Box x={172} y={436} w={465} h={361} tone={C.lavender} p={command} style={{border:"none"}}><Txt x={27} y={25} size={25}>次に、Codexへ依頼</Txt><Txt x={27} y={92} w={410} size={30}>「この音声を読み込んで、{"\n"}不要な言い直しや{"\n"}無音部分をカットして」</Txt></Box>
      <Line points={[[650,613],[698,613]]} p={loaded}/>
      <Box x={711} y={436} w={1037} h={449} p={loaded}><Badge x={25} y={22} size={30}>Palmier Proのタイムライン</Badge>
        <Area x={31} y={143} w={975} h={215}><Surgery cut={Math.max(cut*.35,smooth)} retake={select} silence={P(f,at(d,6)-19)}/></Area>
      </Box>
      <Badge x={173} y={830} tone={C.sky} p={cut}>AIが音声編集を実行</Badge>
    </div>
    <Txt x={172} y={936} w={1576} align="center" size={31} p={smooth}>テンポと話の流れが整った音声を、次の図解づくりへ</Txt>
  </Shell>;
};

export const ProductionConveyor = ({d,frame:f}:Scene) => {
  if(d.kind!=="chat-powered-production-conveyor")return null;
  const recording=P(f,at(d,0)), cut=P(f,at(d,1)), generate=P(f,at(d,2)), place=P(f,at(d,3)), chat=P(f,at(d,4)), all=P(f,at(d,6));
  return <Shell>
    <Badge x={172} y={321} tone={C.sky} p={recording}>自分が音声を収録した、その後は</Badge>
    {[{y:400,p:cut,title:d.stations[0],tone:C.sky,i:0},{y:573,p:generate,title:d.stations[1],tone:C.pink,i:1},{y:746,p:place,title:d.stations[2],tone:C.mint,i:2}].map(({y,p,title,tone,i})=><Box key={i} x={172} y={y} w={854} h={150} p={p}>
      <Badge x={20} y={20} tone={tone} size={25}>{i+1}</Badge><Txt x={94} y={27} w={278} size={28}>{title}</Txt>
      <Area x={397} y={20} w={426} h={105}>{i===0?<Surgery cut={P(f,at(d,1)+12)} compact/>:i===1?<Plot kind="nodes" p={generate}/>:<Timeline graphic={place}/>}</Area>
    </Box>)}
    <Line points={[[1038,475],[1082,475],[1082,649],[1111,649]]} p={cut}/>
    <Line points={[[1038,649],[1111,649]]} p={generate}/>
    <Line points={[[1038,821],[1082,821],[1082,649],[1111,649]]} p={place}/>
    <Box x={1125} y={400} w={623} h={496} p={recording}><Txt x={26} y={24} size={31}>説明アニメ付きの動画へ</Txt>
      <Area x={60} y={98} w={503} h={276} p={generate}><Plot kind="nodes" p={generate}/></Area>
      <Box x={27} y={392} w={570} h={69} tone={C.sky} style={{border:"none",borderRadius:14}}><Area x={17} y={13} w={536} h={43}><Wave/></Area></Box>
    </Box>
    <Box x={172} y={928} w={1576} h={59} tone={C.lavender} p={chat} style={{border:"none",borderRadius:20}}><Txt x={24} y={9} w={1528} align="center" size={28}>{all>.5?"収録後の3つの作業を、チャットでAIに頼める":"Codexへのチャットから、制作を進める"}</Txt></Box>
  </Shell>;
};
