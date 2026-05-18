import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Boxes,
  CheckCircle2,
  Clipboard,
  Code2,
  FileText,
  GraduationCap,
  Lightbulb,
  PlayCircle,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  TestTube2,
  Trash2,
  Wand2,
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const defaultForm = {
  name: "paper-review-assistant",
  description:
    "Use when the user provides an academic paper, abstract, or research notes and wants a structured academic summary, critique, or discussion guide. Do not use for casual news summaries or pure translation tasks.",
  purpose: "協助使用者把論文整理成可討論、可報告、可追蹤的結構化摘要。",
  useWhen: `- 使用者提供論文全文、摘要或研究筆記
- 使用者想萃取研究問題、方法、資料、發現與限制
- 使用者想產生課堂討論問題`,
  doNotUse: `- 一般新聞摘要
- 單純翻譯
- 沒有學術文本或研究資料的閒聊問題`,
  inputs: `- 論文全文、摘要或 PDF
- 課程主題或指定的分析重點
- 需要的輸出語言與長度`,
  workflow: `1. 判斷文本是否為學術研究或研究型資料。
2. 找出研究主題、研究問題與研究目的。
3. 辨識理論、方法、資料來源與分析策略。
4. 摘要主要發現，並標示哪些是作者主張、哪些是推論。
5. 指出限制、假設與可討論之處。
6. 依固定格式輸出摘要、批判與討論題。`,
  output: `### 1. 基本資訊
- 題名：
- 領域：
- 主題：

### 2. 研究問題

### 3. 方法與資料

### 4. 主要發現

### 5. 限制與批判

### 6. 課堂討論題`,
  quality: `- 不得捏造文本中不存在的資訊
- 不確定處必須明確標示
- 摘要與批判必須分開
- 格式必須一致
- 若輸入不足，先提出最少必要追問`,
};

const lessonPlan = [
  ["0–15 分鐘", "先看 Codex 能幫你做什麼", "用活動成果報告、備課資料整理、教材網頁三個案例，看懂 Codex Desktop 可協助的實際操作。", "你能說出 Codex 可以讀檔、改檔、跑指令、檢查結果，也知道哪些事需要你授權。"],
  ["15–35 分鐘", "認識 Codex Desktop 介面", "用擬真畫面找出 Project、Threads、Composer、Review / diff 與權限提示的位置。", "你能安全地建立練習專案並下第一個小任務。"],
  ["35–60 分鐘", "第一個新手操作任務", "請 Codex 建立活動成果報告練習資料夾、檢查清單與範本，不碰程式碼與技術設定。", "你完成第一組可打開檢查的練習檔。"],
  ["60–95 分鐘", "把行政工作拆成流程", "挑一個常做任務，填寫輸入、處理步驟、輸出、人工確認點與缺資料時的做法。", "你完成 workflow canvas。"],
  ["95–125 分鐘", "讓 Codex 依流程產出初稿", "用成果報告案例，把活動資料、照片清單、Padlet 匯出資料整理成報告初稿與待補清單。", "你完成一份可人工檢查的報告初稿。"],
  ["125–160 分鐘", "看 diff、提修正、存版本", "練習不直接接受結果，先看 Codex 改了哪些檔案，再要求它依老師意見修正。", "你完成 v1、v2、final 的版本流程。"],
  ["160–180 分鐘", "什麼時候才轉成 Skill", "只用操作語言理解 Skill：把常用流程保存成下次可重複使用的工作包。", "你知道哪些流程值得保存，並完成自評。"],
];

const challengeCards = [
  ["論文摘要 Skill", "入門", "把論文轉成研究問題、方法、資料、發現、限制、討論題。"],
  ["作業回饋 Skill", "入門", "依固定 rubric 給學生建設性回饋，避免語氣不一致。"],
  ["CSV 初步分析 Skill", "進階", "描述欄位、找遺漏值、產生摘要統計與視覺化建議，可加入 scripts。"],
  ["簡報診斷 Skill", "中階", "檢查簡報目標、邏輯、頁面負荷、圖表說明與結尾行動。"],
  ["研究問題改寫 Skill", "中階", "把模糊題目轉成可研究、可蒐集資料、可分析的研究問題。"],
  ["活動企劃檢核 Skill", "入門", "依目標、受眾、流程、風險、預算、宣傳與評估指標檢查企劃。"],
];

const quizItems = [
  {
    q: "使用 Codex Desktop 前，最重要的第一件事是什麼？",
    options: ["先選整個下載資料夾", "先選乾淨的專案資料夾", "先把所有私密資料放進去", "先關掉所有檢查"],
    answer: 1,
    why: "Project 資料夾就是 Codex 的工作範圍。新手應該先建立乾淨、安全、只放練習資料的資料夾。",
  },
  {
    q: "Codex 新增或修改檔案後，學員應該先做什麼？",
    options: ["直接接受全部", "先看 Review / diff", "立刻上傳雲端", "關掉 thread"],
    answer: 1,
    why: "Review / diff 會顯示 Codex 改了哪些內容。新手要養成先檢查、再接受的習慣。",
  },
  {
    q: "下列哪一種任務最適合交給 Codex 練習？",
    options: ["偶爾問一次天氣", "每次格式都差不多的活動成果報告", "需要本人輸入密碼的操作", "完全沒有資料的猜測任務"],
    answer: 1,
    why: "Codex 很適合協助固定格式、可檢查、可反覆修正的工作，例如成果報告、備課資料、檢查清單。",
  },
  {
    q: "遇到登入、二階段驗證、上傳或刪除檔案時，正確做法是？",
    options: ["讓 Codex 自己處理所有驗證", "由本人確認後再繼續", "忽略提示", "把密碼貼進對話"],
    answer: 1,
    why: "涉及帳號、授權、上傳、刪除與敏感資料時，必須由使用者本人確認，不能把密碼或驗證資訊交給 AI。",
  },
  {
    q: "什麼時候才適合把流程保存成 Skill？",
    options: ["第一次想到任務就立刻保存", "流程已跑過、修正過、下次還會用", "還不知道輸入資料是什麼", "只想閒聊一次"],
    answer: 1,
    why: "Skill 是成熟流程的保存方式。先把操作跑通，再把成功做法保存下來，學員比較不會被格式細節干擾。",
  },
];

const rubric = [
  ["操作安全", "20%", "是否選對資料夾、避開敏感資料，遇到授權能停下來確認。"],
  ["任務描述", "20%", "能否把要 Codex 做的事說清楚，包含輸入、輸出與格式。"],
  ["成果檢查", "25%", "是否會看 Review / diff，並確認檔名、內容、格式與缺資料清單。"],
  ["修正流程", "20%", "是否能提出具體修正意見，產生 v1、v2、final 的版本感。"],
  ["流程保存", "15%", "是否能說明哪些步驟下次還會用，適合之後保存成 Skill。"],
];

const narrationScripts = {
  overview:
    "歡迎來到解放你的雙手，Codex Desktop 新手操作工作坊。這堂課不談技術架構，也不要求你寫程式。你要學的是：怎麼把一件常常重複的工作，交給 Codex 協助整理、建立檔案、修改內容、檢查結果，最後變成下次也能重複使用的流程。請先記住三件事：第一，Codex 可以在你指定的資料夾裡工作；第二，Codex 會提出修改，你要先檢查再接受；第三，遇到登入、上傳、敏感資料或高風險操作時，必須由你本人確認。完成本頁後，你要能說出 Codex Desktop 能幫你做哪些操作，以及這堂課最後會完成什麼成果。",
  desktop:
    "這一頁先回答新手最重要的問題：Codex Desktop 到底能做什麼？它可以讀你指定資料夾中的檔案，幫你建立或修改教材、報告、網頁與檢查清單；也可以依你的要求啟動本機網頁、跑檢查、整理錯誤訊息，並在需要時打開瀏覽器協助確認畫面。接著才認識介面：Project 是工作資料夾，Threads 是不同任務，Composer 是輸入任務的地方，Review 或 diff 是檢查修改結果的位置。請記住基本口訣：先選乾淨資料夾，再下小任務，先看修改，再決定是否接受。",
  basics:
    "這一頁是延伸內容：當一套操作流程已經跑順、修正過，而且下次還會再用，就可以請 Codex 幫你把它保存成 Skill。新手不需要背格式，也不需要手寫技術細節；你只要看懂三件事：這個流程叫什麼名字，什麼時候該用，實際操作步驟是什麼。課堂上老師可以示範一次，學員先以看懂與會檢查為主。",
  workflow:
    "這一頁是流程設計器。先不要急著寫 Skill，請先描述你自己原本如何完成這個任務。好的 Skill 來自清楚的人工流程。每個步驟最好用動詞開頭，例如檢查、萃取、比較、驗證、輸出。你新增每個流程步驟時，都要回答三個問題：這一步需要什麼輸入？這一步會產生什麼輸出？如果資料不足、格式錯誤或任務不適合，應該怎麼處理？完成本頁後，你應該有一個可操作、可檢查、可轉寫成 SKILL.md 的 workflow。",
  generator:
    "這一頁是流程保存範本。你可以把已經跑順的工作流程填進左側表單，右側會產生可以交給 Codex 使用的 Skill 草稿。新手不用背英文欄位，只要檢查內容是否說清楚：什麼時候使用、需要哪些資料、照哪些步驟做、最後輸出什麼、資料不足時要怎麼提醒。這一頁可以當作老師示範或進階自學，不必在第一堂課全部講完。",
  testing:
    "這一頁是成果檢查。請不要把 Codex 的第一版結果直接當完成品。你要檢查四件事：檔案是否建立在正確資料夾，內容是否符合任務，缺資料有沒有列出來，修正後版本是否清楚。若你已經把流程保存成 Skill，再用幾個真實情境測試它是否會在適合的任務中被使用。",
  quiz:
    "這一頁是自我檢核測驗。請先自己作答，不要急著看解析。題目檢查的是操作觀念：是否會選乾淨資料夾，是否知道要看 Review 或 diff，是否知道登入與上傳要本人確認，是否能分辨適合 Codex 的重複任務，以及什麼時候才值得保存成 Skill。",
  rubric:
    "這一頁是成果自評規準。請不要只看 Codex 有沒有產生內容，也要看自己是否完成安全操作、清楚描述任務、檢查成果、提出修正、保存版本。最後如果這套流程下次還會再用，才把它視為 Skill 候選流程。",
};

const pageGuides = {
  overview: {
    duration: "建議 6 分鐘",
    voiceGoal: "先知道 Codex Desktop 的操作能耐，以及本課不講技術架構。",
    teacherMoves: [
      "先播放本頁語音稿，確認你知道本課是操作工作坊，不是技術課。",
      "閱讀三張核心卡，用自己的話說出 Codex 能協助哪些日常工作。",
      "掃過 180 分鐘流程，確認每一階段的交付物。",
    ],
    learnerActions: [
      "寫下一個你常常重複做、想交給 AI 協助的任務。",
      "判斷這個任務需要 Codex 讀哪些檔案、建立哪些檔案、由誰最後檢查。",
    ],
    checkpoints: [
      "你能說出 Codex Desktop 可以在指定資料夾裡讀檔與改檔。",
      "你知道本課最後要完成練習檔、流程圖、報告初稿與檢查清單。",
    ],
    transition: "下一頁先看 Codex Desktop 的能耐，再認識它的操作介面。",
  },
  desktop: {
    duration: "建議 18 分鐘",
    voiceGoal: "先看 Codex Desktop 能做的實際操作，再認識介面與安全邊界。",
    teacherMoves: [
      "先閱讀六張能力卡，確認 Codex 可以協助的操作範圍。",
      "依序點選下載、安裝、專案、UI、操作五步。",
      "在動圖式 UI 導覽中依序點 Project sidebar、Threads、Composer、Review / diff。",
      "執行第一個練習 prompt 前，先確認你的資料夾不含敏感資料。",
    ],
    learnerActions: [
      "建立或確認自己的練習資料夾名稱與位置。",
      "指出 Project、Threads、Composer、Review / diff 分別在哪裡。",
      "複製第一個練習任務；Codex 產生練習檔後，先看 diff，不要直接接受。",
    ],
    checkpoints: [
      "你知道 project 是 Codex 的工作範圍。",
      "你知道要先看 diff 再接受變更。",
      "你知道登入、上傳、刪除、網路與敏感資料牽涉權限與風險。",
    ],
    transition: "你已經知道 Codex Desktop 能做什麼，下一步再把可重複任務整理成流程。",
  },
  basics: {
    duration: "建議 14 分鐘",
    voiceGoal: "把 Skill 定位成成熟流程的保存方式，不要求新手背格式。",
    teacherMoves: [
      "先說明：Skill 是之後保存流程用，第一輪操作不必急著做。",
      "對照範例，只看懂名稱、使用時機、操作步驟三件事。",
      "提醒學員：格式可以請 Codex 產生，老師只要能檢查內容是否合理。",
    ],
    learnerActions: [
      "寫下自己哪一個流程下次還會再用。",
      "用一句話說明這個流程何時使用、何時不使用。",
      "標出流程中最需要人工確認的地方。",
    ],
    checkpoints: [
      "你知道 Skill 不是第一步，而是成熟流程的保存方式。",
      "你能看懂一個 Skill 草稿是否把任務說清楚。",
      "你知道新手不需要手寫技術格式，可以請 Codex 協助產生。",
    ],
    transition: "知道 Skill 的位置後，下一步回到操作本身：先把人的流程拆清楚。",
  },
  workflow: {
    duration: "建議 22 分鐘",
    voiceGoal: "把模糊任務拆成可執行、可檢查、可轉寫的 workflow。",
    teacherMoves: [
      "先選一個你每週或每月會重複出現的任務。",
      "新增至少一個用動詞開頭的步驟，例如：檢查輸入、萃取重點、輸出清單。",
      "每新增一步就檢查輸入、輸出、失敗處理三個問題。",
    ],
    learnerActions: [
      "在流程設計器新增至少 5 個步驟。",
      "把每個步驟改成可執行的動詞句。",
      "標出哪一步最容易出錯、哪一步需要人工確認。",
    ],
    checkpoints: [
      "你已選定一個可重複任務。",
      "你的 workflow 至少包含輸入、處理、輸出、品質標準。",
      "你能說明缺資料時要追問什麼。",
    ],
    transition: "流程已經成形，接下來可以先請 Codex 依流程產出初稿；跑順後再保存。",
  },
  generator: {
    duration: "建議 26 分鐘",
    voiceGoal: "把已跑順的 workflow 轉成可保存的流程草稿。",
    teacherMoves: [
      "提醒學員：這是進階保存，不是第一輪操作必備。",
      "先填中文目的、使用情境、需要資料、操作步驟與輸出格式。",
      "檢查右側草稿是否能讓下次的 Codex 照流程工作。",
    ],
    learnerActions: [
      "填入名稱、使用情境、何時不用、必要輸入。",
      "把剛才的 workflow 貼入流程欄位。",
      "把右側草稿交給 Codex 建立檔案，自己負責檢查內容。",
    ],
    checkpoints: [
      "使用情境同時包含何時用與何時不用。",
      "workflow 不是抽象口號，而是可執行步驟。",
      "輸出格式與品質標準足夠明確。",
    ],
    transition: "流程保存只是第一版，真正能不能用，要靠下一輪操作檢查。",
  },
  testing: {
    duration: "建議 18 分鐘",
    voiceGoal: "理解 Codex 產出後要檢查、修正與保存版本。",
    teacherMoves: [
      "依序切換四個檢查情境，示範怎麼看結果是否合格。",
      "每一種檢查都自問：檔案在哪裡？內容對不對？哪裡要修？",
      "特別停在不適合的情境，確認 Codex 不會被要求亂猜或處理敏感資料。",
    ],
    learnerActions: [
      "為自己的流程寫四個檢查任務。",
      "記錄每個檢查的預期結果與實際結果。",
      "決定下一版要改任務描述、流程步驟或輸出格式。",
    ],
    checkpoints: [
      "你至少完成四種檢查任務。",
      "你能說明哪些情況不適合交給 Codex 處理。",
      "你能根據檢查結果提出修正版方向。",
    ],
    transition: "檢查觀念確認後，用小測驗快速檢查你是否掌握核心操作。",
  },
  quiz: {
    duration: "建議 8 分鐘",
    voiceGoal: "用 5 題快速測驗確認核心操作觀念，並即時補救迷思。",
    teacherMoves: [
      "先獨立作答，不要急著看解析。",
      "每題選完後閱讀解析，特別注意資料夾、diff、授權與版本。",
      "如果某題答錯，回到對應頁面重新檢查自己的操作流程。",
    ],
    learnerActions: [
      "完成 5 題測驗。",
      "把答錯題目的解析記到自己的操作檢查清單。",
    ],
    checkpoints: [
      "你能答對資料夾邊界、diff、授權三個核心題。",
      "你能用解析修正自己的操作流程。",
    ],
    transition: "最後用 rubric 對齊交付標準，確認你的成果是否可以展示。",
  },
  rubric: {
    duration: "建議 12 分鐘",
    voiceGoal: "確認成果不是只看有沒有檔案，而是看安全、流程、檢查與修正。",
    teacherMoves: [
      "逐項閱讀五個評分指標，不要只看產出的文字漂亮不漂亮。",
      "用 rubric 自評自己的 Codex 操作成果。",
      "挑一張挑戰卡，作為課後延伸或展示題目。",
    ],
    learnerActions: [
      "用 rubric 勾選自己的弱項。",
      "準備三分鐘展示：任務、流程、Codex 產出、修正結果、下一版改進。",
    ],
    checkpoints: [
      "你能說明 Codex 協助了哪一步，以及哪一步仍需人工確認。",
      "你能展示至少一個修正前後的結果。",
      "你能提出下一版改進方向。",
    ],
    transition: "完成自評後，把成熟流程當成可持續修改的工作方法，而不是一次交完的作業。",
  },
};

function SectionTitle({ icon: Icon, eyebrow, title, children }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-700">
        <Icon className="h-4 w-4" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{title}</h2>
      {children ? <p className="mt-3 max-w-3xl text-slate-600">{children}</p> : null}
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}>{children}</div>;
}

function MiniLabel({ children }) {
  return <label className="mb-1 block text-sm font-semibold text-slate-700">{children}</label>;
}

function TextField({ label, value, onChange, rows = 4, placeholder = "" }) {
  return (
    <div>
      <MiniLabel>{label}</MiniLabel>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}

function CodeBlock({ code, title = "SKILL.md" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-300">
        <span>{title}</span>
        <button onClick={copy} className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20">
          <Clipboard className="h-3.5 w-3.5" /> {copied ? "已複製" : "複製"}
        </button>
      </div>
      <pre className="max-h-[560px] overflow-auto p-4 text-sm leading-6 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function NarrationBox({ id }) {
  const text = narrationScripts[id] || "";
  const guide = pageGuides[id];
  const [copied, setCopied] = useState(false);
  const [guideCopied, setGuideCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const play = () => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const stop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const copyGuide = async () => {
    if (!guide) return;
    const guideText = [
      `【${guide.duration}】`,
      `語音目標：${guide.voiceGoal}`,
      "",
      "自學步驟：",
      ...guide.teacherMoves.map((item, idx) => `${idx + 1}. ${item}`),
      "",
      "動手任務：",
      ...guide.learnerActions.map((item, idx) => `${idx + 1}. ${item}`),
      "",
      "完成檢查：",
      ...guide.checkpoints.map((item, idx) => `${idx + 1}. ${item}`),
      "",
      `轉場句：${guide.transition}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(guideText);
      setGuideCopied(true);
      setTimeout(() => setGuideCopied(false), 1200);
    } catch {
      setGuideCopied(false);
    }
  };

  return (
    <Card className="mb-6 border-indigo-100 bg-indigo-50/70">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">
            <PlayCircle className="h-4 w-4" /> 本頁自學語音
          </div>
          <p className="text-sm leading-7 text-slate-700">{text}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button onClick={play} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">
            <PlayCircle className="h-4 w-4" /> {speaking ? "重新播放" : "播放"}
          </button>
          <button onClick={stop} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            停止
          </button>
          <button onClick={copy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <Clipboard className="h-4 w-4" /> {copied ? "已複製" : "複製講稿"}
          </button>
          {guide ? (
            <button onClick={copyGuide} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Clipboard className="h-4 w-4" /> {guideCopied ? "已複製" : "複製自學指引"}
            </button>
          ) : null}
        </div>
      </div>
      {guide ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-indigo-100">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h4 className="font-bold text-slate-950">本頁指引</h4>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">{guide.duration}</span>
            </div>
            <p className="text-sm leading-6 text-slate-700">
              <strong>語音目標：</strong>{guide.voiceGoal}
            </p>
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
              <strong>轉場句：</strong>{guide.transition}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-indigo-100">
              <h4 className="mb-3 font-bold text-slate-950">自學步驟</h4>
              <ul className="space-y-2 text-sm leading-6 text-slate-700">
                {guide.teacherMoves.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-indigo-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-indigo-100">
              <h4 className="mb-3 font-bold text-slate-950">動手任務</h4>
              <ul className="space-y-2 text-sm leading-6 text-slate-700">
                {guide.learnerActions.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-indigo-100">
              <h4 className="mb-3 font-bold text-slate-950">完成檢查</h4>
              <ul className="space-y-2 text-sm leading-6 text-slate-700">
                {guide.checkpoints.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-amber-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-slate-500">播放功能使用瀏覽器內建語音合成；不同瀏覽器的中文聲音品質可能不同。你也可以複製講稿，貼到自己習慣的語音工具產生固定音檔。</p>
    </Card>
  );
}

function OverviewTab() {
  return (
    <div>
      <SectionTitle icon={GraduationCap} eyebrow="學生自學教材" title="Codex Desktop 新手操作自學總覽">
        這份教材先講操作，不講技術架構。你會從日常任務出發，學會讓 Codex 在指定資料夾裡協助建立檔案、整理資料、修改內容、檢查結果，最後再判斷哪些流程值得保存成 Skill。
      </SectionTitle>
      <NarrationBox id="overview" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <Target className="mb-3 h-7 w-7 text-indigo-600" />
          <h3 className="font-bold text-slate-950">學習目標</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">你能用自己的真實任務，請 Codex 建立練習檔、整理資料、產出初稿，並知道如何檢查與要求修正。</p>
        </Card>
        <Card>
          <Boxes className="mb-3 h-7 w-7 text-indigo-600" />
          <h3 className="font-bold text-slate-950">本課定位</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">這不是程式課，也不是模型原理課。重點是：選資料夾、下任務、看修改、試成果、再保存流程。</p>
        </Card>
        <Card>
          <TestTube2 className="mb-3 h-7 w-7 text-indigo-600" />
          <h3 className="font-bold text-slate-950">評量方式</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">你能不能自己完成一輪：給任務、看 Codex 產出、檢查檔案、提出修正、存成 final。</p>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-xl font-bold text-slate-950">180 分鐘課程流程</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {lessonPlan.map(([time, title, activity, output], idx) => (
            <motion.div key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Card className="h-full">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">{time}</div>
                  <div>
                    <h4 className="font-bold text-slate-950">{title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{activity}</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">產出：{output}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BasicsTab() {
  return (
    <div>
      <SectionTitle icon={BookOpen} eyebrow="流程保存" title="Skill 延伸：把成熟流程保存下來">
        這一頁只做概念認識。新手不需要背格式或手寫檔案；等流程跑順後，可以請 Codex 把成功做法整理成可重複使用的 Skill。
      </SectionTitle>
      <NarrationBox id="basics" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-950">
            <FileText className="h-5 w-5 text-indigo-600" /> 老師示範用資料夾
          </h3>
          <CodeBlock
            title="folder"
            code={`my-skill/
├── SKILL.md        # 保存流程的說明檔
├── references/     # 選用：規範、範例、檢查清單
└── assets/         # 選用：模板、表格、素材`}
          />
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-950">
            <Code2 className="h-5 w-5 text-indigo-600" /> Codex 產生的保存草稿
          </h3>
          <CodeBlock code={`---
name: skill-name
description: Use when the user needs a specific, repeatable workflow. Say when to use and when not to use this skill.
---

# Skill Instructions

Write clear steps, expected inputs, output format, quality standards, and what to do when information is missing.`} />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <h4 className="font-bold text-slate-950">1. 名稱</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">讓自己下次看得懂這個流程在做什麼。例如：成果報告整理、論文摘要檢查。</p>
        </Card>
        <Card>
          <h4 className="font-bold text-slate-950">2. 使用時機</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">說清楚什麼任務適合用、什麼情況不該用，避免 Codex 把流程用錯地方。</p>
        </Card>
        <Card>
          <h4 className="font-bold text-slate-950">3. 操作步驟</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">放輸入資料、處理步驟、輸出格式、品質標準，以及缺資料時要怎麼提醒。</p>
        </Card>
      </div>
    </div>
  );
}

function DesktopIntroTab() {
  const [activeStep, setActiveStep] = useState("download");
  const [checked, setChecked] = useState({});
  const [activeZone, setActiveZone] = useState("project");

  const steps = {
    download: {
      title: "1. 下載 Codex Desktop",
      subtitle: "先確認你使用的是 Mac 或 Windows，再到官方頁面下載。",
      points: [
        "macOS：可從官方 Codex app 頁面選擇 Apple Silicon 或 Intel 版本。",
        "Windows：官方文件指向 Microsoft Store 下載與更新。",
        "課堂以 Codex Desktop 操作為主；新手先不要處理 CLI 或開發者設定。",
      ],
      action: "自學任務：先判斷自己的系統與晶片，再選擇對應下載方式。",
    },
    install: {
      title: "2. 安裝與登入",
      subtitle: "安裝後開啟 Codex，使用自己的 ChatGPT 帳號登入。",
      points: [
        "ChatGPT 帳號登入較適合課堂示範與一般工作流程。",
        "如果跳出授權、登入或二階段驗證，必須由你本人完成。",
        "第一次練習前，建議先完成登入，避免後面卡在帳號與權限。",
      ],
      action: "自學任務：完成登入後，不要立即選整個桌面或下載資料夾當專案。",
    },
    project: {
      title: "3. 選擇專案資料夾",
      subtitle: "Codex 是專案導向工具，第一個重要動作是選對工作範圍。",
      points: [
        "建立乾淨資料夾，例如 codex-skill-workshop。",
        "只放本次練習需要的範本、照片、Padlet 匯出檔或示範文件。",
        "不要選含有成績、個資、研究資料、金鑰或私人檔案的資料夾。",
      ],
      action: "自學任務：建立自己的 codex-practice 資料夾，之後所有操作都在這裡進行。",
    },
    ui: {
      title: "4. 認識 UI 區域",
      subtitle: "先看懂畫面，再開始給任務。",
      points: [
        "Project sidebar：目前 Codex 正在處理哪個資料夾。",
        "Threads：每一個任務或討論可以分開放。",
        "Composer：輸入你要 Codex 做的事情。",
        "Review pane / diff：檢查 Codex 新增或修改了哪些內容。",
      ],
      action: "自學任務：指出哪裡看專案、哪裡下指令、哪裡看修改結果。",
    },
    operation: {
      title: "5. 基本操作流程",
      subtitle: "用一個不用寫程式的任務示範 Codex Desktop 的完整循環。",
      points: [
        "建立任務：請 Codex 建立成果報告練習資料夾與檢查清單。",
        "審查計畫：看 Codex 打算新增或修改哪些檔案。",
        "檢查 diff：確認檔名、內容、格式與說明是否符合你的需求。",
        "要求修正：讓 Codex 改善語氣、順序、表格或缺資料提醒。",
        "測試成果：打開檔案或網頁，確認學生或老師看得懂。",
      ],
      action: "自學任務：你必須先看 diff，再決定是否接受變更。",
    },
  };

  const capabilityCards = [
    {
      icon: FileText,
      title: "讀懂指定資料夾",
      body: "在你選定的 project 裡讀取文字、教材、範本、表格或網頁檔，協助整理重點。",
    },
    {
      icon: Clipboard,
      title: "建立與修改檔案",
      body: "幫你新增講義、檢查清單、成果報告初稿、網頁內容，並留下可審查的修改紀錄。",
    },
    {
      icon: PlayCircle,
      title: "啟動與檢查成果",
      body: "可以依需求執行本機指令，例如啟動網頁、跑檢查、回報錯誤或成功訊息。",
    },
    {
      icon: Wand2,
      title: "整理資料成流程",
      body: "把 Email、照片清單、Padlet 匯出檔、活動文件整理成待辦、索引、初稿與待補清單。",
    },
    {
      icon: CheckCircle2,
      title: "依回饋反覆修正",
      body: "你提出修正意見後，Codex 可以改內容、重排段落、補檢查項目並保留版本。",
    },
    {
      icon: Target,
      title: "需要授權會停下來",
      body: "登入、二階段驗證、上傳、刪除、推送到雲端等動作，仍需要你本人確認。",
    },
  ];

  const uiZones = [
    { key: "project", label: "Project sidebar", desc: "專案與資料夾邊界", pos: "left-4 top-16 h-56 w-24" },
    { key: "threads", label: "Threads", desc: "任務清單與平行工作", pos: "left-32 top-16 h-56 w-32" },
    { key: "composer", label: "Composer", desc: "輸入任務與設定", pos: "left-72 bottom-5 h-16 right-8" },
    { key: "review", label: "Review / diff", desc: "審查修改內容", pos: "right-8 top-16 h-44 w-56" },
  ];

  const checklist = [
    "已下載正確版本的 Codex app",
    "已完成登入",
    "已建立乾淨練習資料夾",
    "知道 Project / Threads / Composer / Review pane 的位置",
    "知道必須先審查 diff 再接受變更",
    "能用 Codex 建立一組練習檔並要求修正",
  ];

  const current = steps[activeStep];
  const currentZone = uiZones.find((zone) => zone.key === activeZone) || uiZones[0];

  return (
    <div>
      <SectionTitle icon={PlayCircle} eyebrow="Codex Desktop 入門" title="先知道它能做什麼，再學介面怎麼用">
        這一頁用新手語言介紹 Codex Desktop 的操作能耐，再用互動步驟與擬真 UI 讓你熟悉基本操作。
      </SectionTitle>
      <NarrationBox id="desktop" />

      <div className="mb-8">
        <h3 className="mb-4 text-xl font-bold text-slate-950">Codex Desktop 可以幫你做的操作</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {capabilityCards.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <Icon className="mb-3 h-6 w-6 text-indigo-600" />
              <h4 className="font-bold text-slate-950">{title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card>
          <h3 className="mb-4 font-bold text-slate-950">入門流程</h3>
          <div className="space-y-2">
            {Object.entries(steps).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveStep(key)}
                className={cn("w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition", activeStep === key ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-700 hover:bg-slate-100")}
              >
                {value.title}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-200">
            <p className="font-bold text-white">官方入口</p>
            <a href="https://developers.openai.com/codex/app" target="_blank" rel="noreferrer" className="mt-2 block rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20">Codex app 下載與快速開始</a>
            <a href="https://developers.openai.com/codex/app/windows" target="_blank" rel="noreferrer" className="mt-2 block rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20">Windows 下載與更新說明</a>
          </div>
        </Card>

        <Card>
          <div className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{current.subtitle}</div>
          <h3 className="text-2xl font-bold text-slate-950">{current.title}</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {current.points.map((point, idx) => (
              <div key={point} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{idx + 1}</div>
                {point}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong>互動任務：</strong>{current.action}
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-950">
            <Sparkles className="h-5 w-5 text-indigo-600" /> 動圖式 UI 導覽
          </h3>
          <div className="relative h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
            <div className="absolute left-4 right-4 top-4 flex items-center gap-2 border-b border-white/10 pb-3 text-xs text-slate-300">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3">Codex Desktop mock UI</span>
            </div>
	            <div className="absolute left-4 top-16 h-56 w-24 rounded-xl bg-white/10 p-3 text-xs">Projects<br /><span className="text-slate-400">codex-practice</span></div>
	            <div className="absolute left-32 top-16 h-56 w-32 rounded-xl bg-white/10 p-3 text-xs">Threads<br /><span className="text-slate-400">成果報告練習</span><br /><span className="text-slate-400">教材修正</span></div>
	            <div className="absolute right-8 top-16 h-44 w-56 rounded-xl bg-white/10 p-3 text-xs">Review / diff<br /><span className="text-emerald-300">+ 報告檢查清單.md</span><br /><span className="text-indigo-300">+ 操作流程.md</span></div>
	            <div className="absolute bottom-5 left-72 right-8 h-16 rounded-xl bg-white/10 p-3 text-xs">Composer：請建立成果報告練習資料夾...</div>
            <motion.div className={cn("absolute rounded-2xl border-2 border-indigo-300 bg-indigo-400/20 shadow-[0_0_40px_rgba(129,140,248,0.45)]", currentZone.pos)} layout transition={{ type: "spring", stiffness: 180, damping: 22 }} />
            <motion.div className="absolute bottom-24 left-1/2 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-950 shadow-lg" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
              {currentZone.label}
            </motion.div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {uiZones.map((zone) => (
              <button
                key={zone.key}
                onClick={() => setActiveZone(zone.key)}
                className={cn("rounded-xl px-3 py-2 text-sm font-bold", activeZone === zone.key ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100")}
              >
                {zone.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-950">目前聚焦：{currentZone.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{currentZone.desc}</p>
          <div className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">
            <strong>自我檢查：</strong>如果你要請 Codex 建立成果報告練習檔，應該先在哪裡選專案？在哪裡輸入任務？在哪裡審查 Codex 的修改？
          </div>
          <div className="mt-5 space-y-2 text-sm leading-6 text-slate-700">
            <h4 className="mb-3 font-bold text-slate-950">基本操作口訣</h4>
            <div className="rounded-xl bg-slate-50 p-3">1. 選乾淨專案資料夾</div>
            <div className="rounded-xl bg-slate-50 p-3">2. 下小而明確的任務</div>
            <div className="rounded-xl bg-slate-50 p-3">3. 看計畫與 diff</div>
            <div className="rounded-xl bg-slate-50 p-3">4. 要求修正</div>
            <div className="rounded-xl bg-slate-50 p-3">5. 測試後再接受成果</div>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h3 className="mb-4 font-bold text-slate-950">課前安裝檢核</h3>
          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <button
                key={item}
                onClick={() => setChecked({ ...checked, [idx]: !checked[idx] })}
                className={cn("flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition", checked[idx] ? "bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-700 hover:bg-slate-100")}
              >
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold", checked[idx] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300")}>{checked[idx] ? "✓" : idx + 1}</span>
                {item}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-slate-950">第一個 Codex Desktop 練習任務</h3>
          <CodeBlock
            title="prompt"
            code={`請在這個專案中建立一組「活動成果報告練習」檔案。

需求：
1. 建立一個資料夾：activity-report-practice。
2. 在資料夾中建立 README.md，說明這個練習資料夾怎麼用。
3. 建立「活動成果報告檢查清單.md」。
4. 建立「待補資料清單.md」。
5. 建立「成果報告初稿模板.md」。
6. 內容請用新手看得懂的繁體中文，不要寫程式碼。

完成後請列出你新增或修改的檔案，讓我先審查 diff，再決定是否接受。`}
          />
        </Card>
      </div>
    </div>
  );
}

function WorkflowTab() {
  const [steps, setSteps] = useState([
    "選一個每週會重複出現的任務",
    "寫下使用者會提供的輸入資料",
    "拆解人工完成任務時的判斷與步驟",
    "定義固定輸出格式與品質標準",
    "設計正常、資料不足、邊界與不該觸發案例",
  ]);
  const [newStep, setNewStep] = useState("");

  const addStep = () => {
    if (!newStep.trim()) return;
    setSteps([...steps, newStep.trim()]);
    setNewStep("");
  };

  return (
    <div>
      <SectionTitle icon={Wand2} eyebrow="互動活動" title="流程設計器：先做 workflow，再寫 Skill">
        先把「人原本怎麼做」寫清楚。若人工流程都說不清楚，Skill 通常也不會穩定。
      </SectionTitle>
      <NarrationBox id="workflow" />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Card>
          <h3 className="font-bold text-slate-950">新增流程步驟</h3>
          <p className="mt-2 text-sm text-slate-600">用動詞開頭，例如：檢查、萃取、比較、驗證、輸出。</p>
          <div className="mt-4 flex gap-2">
            <input
              value={newStep}
              onChange={(event) => setNewStep(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addStep()}
              placeholder="例如：檢查輸入是否包含評分規準"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
            <button onClick={addStep} className="rounded-xl bg-indigo-600 px-3 py-2 text-white shadow-sm hover:bg-indigo-700">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong>自學提醒：</strong>每個步驟都要能回答：「這一步的輸入是什麼？輸出是什麼？失敗時怎麼辦？」
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-slate-950">目前流程</h3>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={`${step}-${idx}`} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{idx + 1}</div>
                <div className="flex-1 text-sm leading-6 text-slate-700">{step}</div>
                <button onClick={() => setSteps(steps.filter((_, itemIdx) => itemIdx !== idx))} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function GeneratorTab() {
  const [form, setForm] = useState(defaultForm);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const descriptionChecks = useMemo(() => {
    const d = form.description.toLowerCase();
    return [
      { label: "包含明確使用情境", ok: /(use when|when|用於|當|適用)/i.test(d) },
      { label: "包含不適用或邊界描述", ok: /(do not|don't|not use|不要|不適用|不應)/i.test(d) },
      { label: "長度足以辨識任務", ok: form.description.trim().length >= 80 },
      { label: "沒有過度廣泛字眼", ok: !/(anything|everything|所有事情|任何任務|萬用)/i.test(d) },
    ];
  }, [form.description]);

  const generated = useMemo(() => {
    return [
      "---",
      `name: ${form.name || "my-skill"}`,
      `description: ${form.description || "Use when the user needs this repeatable workflow."}`,
      "---",
      "",
      `# ${form.name || "My Skill"}`,
      "",
      "## Purpose",
      form.purpose,
      "",
      "## When to use this skill",
      form.useWhen,
      "",
      "## Do not use this skill when",
      form.doNotUse,
      "",
      "## Required input",
      form.inputs,
      "",
      "## Workflow",
      form.workflow,
      "",
      "## Output format",
      form.output,
      "",
      "## Quality standards",
      form.quality,
      "",
      "## If information is missing",
      "Ask the smallest number of clarifying questions needed before producing the final output. Do not invent missing facts.",
    ].join("\n");
  }, [form]);

  return (
    <div>
      <SectionTitle icon={Sparkles} eyebrow="流程保存範本" title="把跑順的流程保存成下次可重複使用">
        左側填寫任務流程，右側即時產生保存草稿。這是進階頁；新手只要看懂內容是否說清楚，不需要背格式。
      </SectionTitle>
      <NarrationBox id="generator" />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <Card>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <MiniLabel>流程名稱</MiniLabel>
                <input value={form.name} onChange={(event) => update("name", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <MiniLabel>流程目的</MiniLabel>
                <input value={form.purpose} onChange={(event) => update("purpose", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
            </div>
            <div className="mt-4">
              <TextField label="使用時機：什麼時候該用、什麼時候不該用" value={form.description} onChange={(value) => update("description", value)} rows={4} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {descriptionChecks.map((check) => (
                <div key={check.label} className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-sm", check.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}>
                  <CheckCircle2 className="h-4 w-4" /> {check.label}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="何時使用" value={form.useWhen} onChange={(value) => update("useWhen", value)} />
            <TextField label="何時不要使用" value={form.doNotUse} onChange={(value) => update("doNotUse", value)} />
            <TextField label="需要哪些資料" value={form.inputs} onChange={(value) => update("inputs", value)} />
            <TextField label="品質標準" value={form.quality} onChange={(value) => update("quality", value)} />
          </div>
          <TextField label="操作流程" value={form.workflow} onChange={(value) => update("workflow", value)} rows={7} />
          <TextField label="輸出格式" value={form.output} onChange={(value) => update("output", value)} rows={7} />
          <button onClick={() => setForm(defaultForm)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RotateCcw className="h-4 w-4" /> 還原範例
          </button>
        </div>
        <div className="sticky top-6 self-start">
          <CodeBlock code={generated} />
        </div>
      </div>
    </div>
  );
}

function TestingTab() {
  const [scenario, setScenario] = useState("implicit");
  const scenarios = {
    explicit: ["檔案位置檢查", "請列出你剛才新增或修改的檔案，並說明每個檔案用途。", "確認 Codex 的成果真的放在正確資料夾，且檔案用途清楚。"],
    implicit: ["內容品質檢查", "請檢查成果報告初稿是否有活動名稱、日期、目的、過程、成果、照片說明與待補資料。", "確認內容是否符合工作要求，而不是只有文字看起來完整。"],
    contextual: ["修正意見檢查", "請依照老師意見，把照片說明改得更具體，並保留 v2 版本。", "測試學員能否提出具體修正，並讓 Codex 保留版本。"],
    negative: ["不適合情境檢查", "這些照片裡有哪些學生？請直接幫我補上所有名字。", "提醒 Codex 不應亂猜人名、個資或缺少證據的內容。"],
  };
  const current = scenarios[scenario];

  return (
    <div>
      <SectionTitle icon={TestTube2} eyebrow="成果檢查" title="四種檢查：讓 Codex 產出可交付、可修正">
        常見錯誤是看到第一版就接受。新手要練習檢查位置、內容、修正與不適合交給 AI 的情境。
      </SectionTitle>
      <NarrationBox id="testing" />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <div className="space-y-2">
            {Object.entries(scenarios).map(([key, value]) => (
              <button key={key} onClick={() => setScenario(key)} className={cn("w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition", scenario === key ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-700 hover:bg-slate-100")}>
                {value[0]}
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-3 flex items-center gap-2 text-indigo-700">
            <PlayCircle className="h-5 w-5" />
            <h3 className="font-bold">{current[0]}</h3>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-500">檢查任務</p>
            <p className="text-lg font-medium leading-8 text-slate-900">「{current[1]}」</p>
          </div>
          <div className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">
            <strong>檢查重點：</strong>{current[2]}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-3 text-sm"><strong>位置正確？</strong><br />資料夾 / 檔名 / 版本</div>
            <div className="rounded-xl border border-slate-200 p-3 text-sm"><strong>內容符合？</strong><br />格式 / 品質 / 待補</div>
            <div className="rounded-xl border border-slate-200 p-3 text-sm"><strong>修正清楚？</strong><br />修改點 / 版本 / final</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuizTab() {
  const [answers, setAnswers] = useState({});
  const score = quizItems.reduce((sum, item, idx) => sum + (answers[idx] === item.answer ? 1 : 0), 0);

  return (
    <div>
      <SectionTitle icon={Lightbulb} eyebrow="形成性評量" title="5 題操作測驗">
        用這 5 題確認自己是否理解 Codex Desktop 的新手操作、安全與檢查觀念。
      </SectionTitle>
      <NarrationBox id="quiz" />

      <Card className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-950">目前得分：{score} / {quizItems.length}</h3>
          <p className="mt-1 text-sm text-slate-600">答完後請用解析修正自己的操作檢查清單。</p>
        </div>
        <button onClick={() => setAnswers({})} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">重答</button>
      </Card>

      <div className="space-y-4">
        {quizItems.map((item, idx) => {
          const chosen = answers[idx];
          return (
            <Card key={item.q}>
              <h3 className="font-bold text-slate-950">{idx + 1}. {item.q}</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {item.options.map((opt, optIdx) => {
                  const selected = chosen === optIdx;
                  const correct = item.answer === optIdx;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, [idx]: optIdx })}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left text-sm transition",
                        selected && correct && "border-emerald-300 bg-emerald-50 text-emerald-900",
                        selected && !correct && "border-rose-300 bg-rose-50 text-rose-900",
                        !selected && "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {chosen !== undefined ? <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">解析：{item.why}</p> : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function RubricTab() {
  return (
    <div>
      <SectionTitle icon={CheckCircle2} eyebrow="評分規準" title="Skill 成果評量 Rubric">
        這份 rubric 可讓你在提交前自我檢查，也可用來準備三分鐘成果展示。
      </SectionTitle>
      <NarrationBox id="rubric" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="p-4 font-bold">指標</th>
              <th className="p-4 font-bold">比重</th>
              <th className="p-4 font-bold">評分重點</th>
            </tr>
          </thead>
          <tbody>
            {rubric.map(([name, weight, desc]) => (
              <tr key={name} className="border-t border-slate-200">
                <td className="p-4 font-semibold text-slate-950">{name}</td>
                <td className="p-4 text-indigo-700 font-bold">{weight}</td>
                <td className="p-4 text-slate-600">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challengeCards.map(([title, level, brief]) => (
          <Card key={title}>
            <div className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{level}</div>
            <h3 className="font-bold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{brief}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function CodexSkillWorkshopSite() {
  const tabs = [
    { key: "overview", label: "自學總覽", icon: GraduationCap, comp: <OverviewTab /> },
    { key: "desktop", label: "Codex Desktop", icon: PlayCircle, comp: <DesktopIntroTab /> },
    { key: "basics", label: "流程保存", icon: BookOpen, comp: <BasicsTab /> },
    { key: "workflow", label: "流程設計", icon: Wand2, comp: <WorkflowTab /> },
    { key: "generator", label: "保存範本", icon: Sparkles, comp: <GeneratorTab /> },
    { key: "testing", label: "成果檢查", icon: TestTube2, comp: <TestingTab /> },
    { key: "quiz", label: "操作小測", icon: Lightbulb, comp: <QuizTab /> },
    { key: "rubric", label: "自評規準", icon: CheckCircle2, comp: <RubricTab /> },
  ];

  const [active, setActive] = useState("overview");
  const activeTab = tabs.find((tab) => tab.key === active) || tabs[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_28rem),linear-gradient(180deg,#f8fafc,#eef2ff)] text-slate-900">
      <header className="border-b border-white/70 bg-white/75 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100">
                <Sparkles className="h-4 w-4" /> Codex Desktop 新手操作工作坊
              </div>
              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                用 Codex Desktop 把重複工作變成可檢查流程
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                這是一份可自學的互動式教材，先帶你認識 Codex Desktop 能做哪些操作，再用成果報告與備課案例練習：選資料夾、下任務、看修改、要求修正、保存版本。Skill 只放在最後，作為把成熟流程保存下來的延伸。
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4 text-sm text-white shadow-xl md:w-80">
	              <p className="font-bold">課程產出</p>
	              <ul className="mt-2 space-y-1 text-slate-300">
	                <li>✓ 一份 workflow canvas</li>
	                <li>✓ Codex Desktop 基礎操作檢核</li>
	                <li>✓ 一組成果報告練習檔</li>
	                <li>✓ 一份報告初稿與待補清單</li>
	                <li>✓ 三分鐘成果展示</li>
	              </ul>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <nav className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-white/80 bg-white/70 p-2 shadow-sm backdrop-blur">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition",
                  isActive ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950"
                )}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </nav>

        <motion.div
          key={activeTab.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab.comp}
        </motion.div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 text-sm text-slate-500 md:px-8">
        自學提醒：這堂課先把 Codex Desktop 當作可操作的工作助理。等你把一套流程跑順、檢查過、修正過，再考慮把它保存成 Skill。
      </footer>
    </div>
  );
}
