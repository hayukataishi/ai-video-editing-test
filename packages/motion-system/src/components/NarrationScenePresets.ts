import type {SemanticExplainerProps} from "./SemanticExplainer";

export const narrationScenePresets: Array<{id: string; durationFrames: number; props: SemanticExplainerProps}> = [
  {
    "id": "semantic-post-production-collapse",
    "durationFrames": 348,
    "props": {
      "eyebrow": "INTRO / 収録後の作業",
      "title": "カット・図解・配置を、\nひとつの指示で進める",
      "diagram": {
        "kind": "post-production-collapse",
        "beats": [
          56,
          85,
          115,
          195,
          270,
          302
        ],
        "actions": [
          "カット",
          "図解づくり",
          "タイムラインへ配置"
        ],
        "prompt": "チャットに頼む"
      },
      "note": ""
    }
  },
  {
    "id": "semantic-audio-to-explainer-pipeline",
    "durationFrames": 255,
    "props": {
      "eyebrow": "INTRO / 3つのツール",
      "title": "音声から、\n解説アニメ付きの動画へ",
      "diagram": {
        "kind": "audio-to-explainer-pipeline",
        "beats": [
          26,
          51,
          73,
          119,
          184
        ],
        "tools": [
          "Palmier Pro",
          "Remotion",
          "Codex"
        ],
        "output": "解説アニメ付き動画"
      },
      "note": ""
    }
  },
  {
    "id": "semantic-ai-editor-handoff",
    "durationFrames": 378,
    "props": {
      "eyebrow": "01 / PALMIER PRO",
      "title": "チャットの意図を受け取り、\nAIが編集操作へ変える",
      "diagram": {
        "kind": "ai-editor-handoff",
        "beats": [
          30,
          73,
          160,
          281,
          335
        ],
        "prompt": "音声と素材を並べて、流れを整えて",
        "manualLabel": "これまでの手作業",
        "aiLabel": "AIがタイムラインを操作"
      },
      "note": ""
    }
  },
  {
    "id": "semantic-waveform-surgery",
    "durationFrames": 308,
    "props": {
      "eyebrow": "01 / PALMIER PRO",
      "title": "言い直しと長い無音を切ると、\n話の流れがつながる",
      "diagram": {
        "kind": "waveform-surgery",
        "beats": [
          42,
          94,
          123,
          155,
          211,
          256
        ],
        "retakeLabel": "言い直し",
        "silenceLabel": "長い無音",
        "resultLabel": "必要な話だけを残す"
      },
      "note": ""
    }
  },
  {
    "id": "semantic-conversational-timeline-revision",
    "durationFrames": 514,
    "props": {
      "eyebrow": "01 / PALMIER PRO",
      "title": "字幕も尺も、\n言葉で伝えてタイムラインを直す",
      "diagram": {
        "kind": "conversational-timeline-revision",
        "beats": [
          75,
          127,
          166,
          230,
          268,
          315,
          365
        ],
        "caption": "ここに字幕を入れて",
        "shorten": "この部分を短くして",
        "operations": [
          "音声を読み込む",
          "不要部分を切る",
          "字幕・素材を置く"
        ]
      },
      "note": ""
    }
  },
  {
    "id": "semantic-code-becomes-visual-forms",
    "durationFrames": 294,
    "props": {
      "eyebrow": "02 / REMOTION",
      "title": "コードから、\n数字・関係・順位を動かして伝える",
      "diagram": {
        "kind": "code-becomes-visual-forms",
        "beats": [
          22,
          110,
          159,
          215,
          258
        ],
        "examples": [
          "伸びるグラフ",
          "つながる図解",
          "比較・ランキング"
        ]
      },
      "note": ""
    }
  },
  {
    "id": "semantic-prompt-to-render",
    "durationFrames": 212,
    "props": {
      "eyebrow": "02 / REMOTION",
      "title": "説明に合う図解のコードは、\nAIが生成する",
      "diagram": {
        "kind": "prompt-to-render",
        "beats": [
          12,
          47,
          72,
          116,
          154
        ],
        "prompt": "この説明に合う図解を作って",
        "codeLabel": "AIがコードを生成",
        "outputLabel": "アニメーションが完成"
      },
      "note": ""
    }
  },
  {
    "id": "semantic-referral-growth-flywheel",
    "durationFrames": 408,
    "props": {
      "eyebrow": "02 / REMOTION",
      "title": "ユーザーの増加が紹介を生み、\n成長をさらに加速させる",
      "diagram": {
        "kind": "referral-growth-flywheel",
        "beats": [
          22,
          64,
          105,
          219,
          244,
          269,
          278,
          291
        ],
        "entities": [
          "ユーザー",
          "紹介",
          "成長"
        ]
      },
      "note": ""
    }
  },
  {
    "id": "semantic-speech-to-storyboard",
    "durationFrames": 342,
    "props": {
      "eyebrow": "02 / REMOTION",
      "title": "話す内容を、\n伝わる順番と動きへ変える",
      "diagram": {
        "kind": "speech-to-storyboard",
        "beats": [
          21,
          53,
          94,
          155,
          219,
          285
        ],
        "concepts": [
          "話す内容",
          "見せる順番",
          "動きで説明"
        ]
      },
      "note": ""
    }
  },
  {
    "id": "semantic-command-router-to-edit",
    "durationFrames": 410,
    "props": {
      "eyebrow": "03 / CODEX",
      "title": "ひとつのチャットから、\n編集と図解へ指示を分ける",
      "diagram": {
        "kind": "command-router-to-edit",
        "beats": [
          12,
          30,
          56,
          90,
          198,
          242,
          289,
          372
        ],
        "hub": "Codex",
        "branches": [
          "Palmier Pro",
          "Remotion"
        ],
        "prompt": "音声を読み込んで、不要部分をカット"
      },
      "note": ""
    }
  },
  {
    "id": "semantic-generate-and-place-at-the-spoken-beat",
    "durationFrames": 461,
    "props": {
      "eyebrow": "03 / AUDIO SYNC",
      "title": "話している要点を見つけ、\n対応する図解を同じ位置へ置く",
      "diagram": {
        "kind": "generate-and-place-at-the-spoken-beat",
        "beats": [
          24,
          62,
          147,
          239,
          281,
          314,
          377,
          405
        ],
        "audioLabel": "話している要点",
        "visualLabel": "対応する図解",
        "placementLabel": "同じ位置に配置"
      },
      "note": ""
    }
  },
  {
    "id": "semantic-one-chat-revisions",
    "durationFrames": 424,
    "props": {
      "eyebrow": "03 / ONE CHAT",
      "title": "編集も図解も、\n同じ会話で直していける",
      "diagram": {
        "kind": "one-chat-revisions",
        "beats": [
          8,
          48,
          96,
          152,
          216,
          270,
          331
        ],
        "simplifyLabel": "図をもっとシンプルに",
        "syncLabel": "タイミングを音声に合わせて"
      },
      "note": ""
    }
  },
  {
    "id": "semantic-production-steps-one-and-two",
    "durationFrames": 564,
    "props": {
      "eyebrow": "04 / 制作の流れ",
      "title": "台本から収録し、\n音声を整えるまでの最初の2ステップ",
      "diagram": {
        "kind": "production-steps-one-and-two",
        "beats": [
          34,
          81,
          107,
          148,
          199,
          263,
          345,
          452
        ],
        "steps": [
          "台本",
          "音声を収録",
          "AIが編集"
        ],
        "prompt": "言い直しと無音をカット"
      },
      "note": ""
    }
  },
  {
    "id": "semantic-chat-powered-production-conveyor",
    "durationFrames": 331,
    "props": {
      "eyebrow": "04 / PRODUCTION",
      "title": "カットから図解の配置まで、\nチャットで流れを動かす",
      "diagram": {
        "kind": "chat-powered-production-conveyor",
        "beats": [
          26,
          99,
          134,
          194,
          239,
          253,
          286
        ],
        "stations": [
          "不要部分をカット",
          "説明図を生成",
          "タイムラインへ配置"
        ],
        "prompt": "チャットで頼む"
      },
      "note": ""
    }
  }
];
