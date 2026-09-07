import {Area, at, Badge, Box, C, Chat, Code, Line, P, Plot, Shell, Surgery, Timeline, Txt, Wave, type Scene} from "./NarrationPrimitives";

export const PostProduction = ({d, frame: f}: Scene) => {
  if (d.kind !== "post-production-collapse") return null;
  const cut=P(f,at(d,0)), make=P(f,at(d,1)), place=P(f,at(d,2)), busy=P(f,at(d,3)), chat=P(f,at(d,4)), send=P(f,at(d,5),26);
  return <Shell>
    <Badge x={172} y={327} tone={C.sky}>収録した音声</Badge><Area x={437} y={338} w={490} h={43}><Wave/></Area>
    <Txt x={1110} y={332} w={635} align="right" size={27} p={busy*(1-chat)}>この後にも、3つの作業がある</Txt>
    {[{x:172,p:cut,i:0,t:C.sky,sub:"不要な部分を取り除く"},{x:724,p:make,i:1,t:C.pink,sub:"説明の意味を図にする"},{x:1276,p:place,i:2,t:C.mint,sub:"話している区間へ置く"}].map(({x,p,i,t,sub})=><Box key={i} x={x} y={450} w={472} h={343} p={p}>
      <Badge x={25} y={23} tone={t} size={30}>{d.actions[i]}</Badge>
      <Area x={26} y={108} w={420} h={146}>{i===0?<Surgery cut={P(f,at(d,0)+25)} retake={1} silence={1} compact/>:i===1?<Plot kind="nodes" p={P(f,at(d,1)+20)}/>:<Timeline p={1} graphic={P(f,at(d,2)+20)}/>}</Area>
      <Txt x={20} y={282} w={432} align="center" size={25}>{sub}</Txt>
    </Box>)}
    <Line points={[[658,621],[711,621]]} p={make}/><Line points={[[1210,621],[1264,621]]} p={place}/>
    <Box x={172} y={884} w={1576} h={90} p={chat} tone={C.lavender} style={{border:"none"}}><Txt x={28} y={22} size={30}>Codexへのチャット</Txt><Txt x={405} y={22} size={30}>「カット・図解づくり・配置を進めて」</Txt></Box>
    <Line points={[[960,882],[960,842],[408,842],[408,806]]} p={send}/><Line points={[[960,842],[960,806]]} p={send}/><Line points={[[960,842],[1512,842],[1512,806]]} p={send}/>
  </Shell>;
};

export const AudioToVideo = ({d, frame:f}:Scene) => {
  if(d.kind!=="audio-to-explainer-pipeline")return null;
  const pal=P(f,at(d,0)), rem=P(f,at(d,1)), cod=P(f,at(d,2)), audio=P(f,at(d,3)), done=P(f,at(d,4),28);
  return <Shell>
    <Box x={640} y={322} w={1080} h={87} tone={C.lavender} p={cod} style={{border:"none"}}><Txt x={28} y={22} size={30}>{d.tools[2]}：チャットで編集と図解生成をつなぐ</Txt></Box>
    <Line points={[[943,410],[943,442]]} p={cod}/><Line points={[[1515,410],[1515,442]]} p={cod}/>
    <Box x={172} y={530} w={288} h={247} p={audio} tone={C.sky}><Txt x={20} y={24} w={248} align="center" size={30}>収録した音声</Txt><Area x={26} y={100} w={236} h={72}><Wave/></Area></Box>
    <Line points={[[475,650],[557,650]]} p={audio}/>
    <Box x={574} y={452} w={752} h={480} p={pal}><Badge x={26} y={22} size={31}>{d.tools[0]}</Badge><Txt x={315} y={34} size={24}>編集・タイムライン配置</Txt>
      <Box x={28} y={106} w={696} h={238} tone={C.paper} style={{border:"none"}}><Area x={190} y={18} w={317} h={180} p={done}><Plot kind="nodes" p={done}/></Area><Txt x={17} y={197} w={662} align="center" size={25} p={done}>話している内容を、図でも説明</Txt></Box>
      <Area x={30} y={367} w={690} h={72} p={audio}><Wave/></Area>
    </Box>
    <Box x={1374} y={452} w={374} h={480} p={rem}><Badge x={22} y={22} tone={C.pink} size={31}>{d.tools[1]}</Badge><Txt x={24} y={93} w={326} size={25}>説明アニメーションを作る</Txt><Area x={28} y={165} w={318} h={186}><Code p={audio}/></Area><Txt x={24} y={391} size={25} p={done}>生成した図を渡す</Txt></Box>
    <Line points={[[1370,668],[1335,668]]} p={done} color={C.ink}/>
    <Txt x={590} y={947} w={736} align="center" size={27} p={done}>{d.output}</Txt>
  </Shell>;
};

export const EditorHandoff = ({d,frame:f}:Scene) => {
  if(d.kind!=="ai-editor-handoff")return null;
  const human=P(f,193,14)*(1-P(f,at(d,3),14)), ai=P(f,at(d,3),20), arranged=P(f,at(d,4),28);
  const initial=P(f,at(d,1),24), move=Math.max(initial*.35,arranged);
  return <Shell>
    <Chat x={172} y={359} w={520} text={"音声と素材を並べて、\n流れを整えて"} p={P(f,at(d,0))}/>
    <Box x={172} y={578} w={520} h={290} tone={C.lavender} p={ai} style={{border:"none"}}><Txt x={28} y={27} size={31}>人は、目的を伝える</Txt><Txt x={28} y={99} w={454} size={29}>AIが指示を受けて、{"\n"}編集ソフトを操作する</Txt><Badge x={28} y={209} tone={C.mint}>チャットから編集を実行</Badge></Box>
    <Line points={[[706,432],[777,432]]} p={initial}/>
    <Box x={791} y={342} w={957} h={586}><Badge x={26} y={23} size={31}>Palmier Pro</Badge><Txt x={294} y={37} size={24}>動画編集の概念図</Txt>
      <Box x={29} y={112} w={899} h={219} tone={C.paper} style={{border:"none"}}><Area x={318} y={21} w={270} h={172}><Plot kind="growth" p={initial}/></Area></Box>
      <Txt x={29} y={366} size={24}>素材</Txt><Txt x={29} y={465} size={24}>音声</Txt>
      {[0,1,2].map(i=><Box key={i} x={126+i*245+(1-move)*(i*15)} y={353+(1-move)*(i===1?29:0)} w={220} h={65} tone={[C.pink,C.mint,C.lavender][i] ?? C.pink} style={{border:"none",borderRadius:13}}><Area x={35} y={7} w={150} h={48}><Plot kind={i===1?"nodes":"growth"}/></Area></Box>)}
      <Area x={128} y={452} w={709} h={54}><Wave/></Area>
      <div style={{position:"absolute",left:570-arranged*170,top:440-arranged*44,opacity:Math.max(human,ai)}}><svg width={56} height={62} viewBox="0 0 56 62" fill={ai>.5?C.lavender:C.sky} stroke={C.ink} strokeWidth={3}><path d="M8 4 18 52 28 34 43 49 51 40 36 26 52 19z"/></svg></div>
    </Box>
    <Badge x={1420} y={353} tone={C.sky} p={human}>これまで：人が操作</Badge><Badge x={1500} y={353} tone={C.lavender} p={ai}>AIが操作</Badge>
    <Txt x={805} y={949} w={922} align="center" size={27} p={arranged}>伝えた意図が、タイムラインに反映される</Txt>
  </Shell>;
};

export const WaveformSurgery = ({d,frame:f}:Scene) => {
  if(d.kind!=="waveform-surgery")return null;
  const selected=P(f,at(d,3)), removal=P(f,at(d,4),24), closed=P(f,at(d,5),28);
  return <Shell>
    <Chat x={172} y={319} w={1576} text="この音声を読み込んで、言い直しや長い無音部分をカットして" p={P(f,12)}/>
    <Box x={172} y={508} w={1576} h={363} p={P(f,at(d,0))}><Badge x={27} y={20}>Palmier Pro / 音声</Badge>
      <Area x={48} y={95} w={1480} h={244}><Surgery cut={Math.max(removal*.25,closed)} retake={P(f,at(d,1))} silence={P(f,at(d,2))}/></Area>
    </Box>
    <Txt x={172} y={913} w={1576} align="center" size={31} p={selected}>{closed>.9?d.resultLabel:removal>.1?"AIが選択した部分を取り除く":"言い直し・長い無音を選択"}</Txt>
  </Shell>;
};

export const ConversationalRevision = ({d,frame:f}:Scene) => {
  if(d.kind!=="conversational-timeline-revision")return null;
  const captions=P(f,at(d,0),20), trim=P(f,at(d,1),28), recap=P(f,at(d,3)), cut=P(f,at(d,4)), materials=P(f,at(d,5)), all=P(f,at(d,6));
  return <Shell>
    <Chat x={172} y={336} w={459} text={d.caption} p={captions}/>
    <Chat x={172} y={519} w={459} text={d.shorten} p={trim}/>
    <Badge x={172} y={720} p={recap}>① 音声を読み込む</Badge><Badge x={172} y={796} p={cut} tone={C.pink}>② 不要な部分をカット</Badge><Badge x={172} y={872} p={materials} tone={C.mint}>③ 字幕・素材を配置</Badge>
    <Line points={[[644,411],[680,411]]} p={captions}/><Line points={[[644,595],[680,595]]} p={trim}/>
    <Box x={695} y={329} w={1053} h={604}><Badge x={26} y={22} size={31}>Palmier Pro</Badge>
      <Box x={29} y={100} w={995} h={246} tone={C.paper} style={{border:"none"}}><Area x={346} y={4} w={307} h={179}><Plot kind="nodes" p={Math.max(.5,materials)}/></Area><Badge x={234} y={179} tone={C.yellow} p={captions} size={28}>声の説明に合わせて、字幕が入る</Badge></Box>
      <Area x={29} y={382} w={995} h={198}><Timeline caption={captions>.1} trim={trim} graphic={Math.max(.2,materials)}/></Area>
      <Badge x={760} y={26} tone={C.mint} p={all} size={24}>修正を反映</Badge>
    </Box>
    <Txt x={704} y={951} w={1034} align="center" size={26} p={all}>会話で頼んだ修正が、字幕・尺・素材へ反映される</Txt>
  </Shell>;
};
