import React, { useState, useEffect } from "react";
import { 
  Mic, 
  Loader2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Maximize, 
  Orbit, 
  BookOpen, 
  Info, 
  Settings, 
  HelpCircle, 
  ChevronRight, 
  Image as ImageIcon, 
  Volume2, 
  Trash2, 
  Check, 
  Compass, 
  MousePointerClick,
  Monitor
} from "lucide-react";
import { useAgentAssistant } from "./hooks/useAgentAssistant";

export default function App() {
  const { 
    state, 
    currentImageUrl, 
    ratio, 
    transcriptDisplay, 
    startListening, 
    processTranscript 
  } = useAgentAssistant();
  
  const [started, setStarted] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [genStep, setGenStep] = useState(0);

  // Creative loader narrative messages
  const genSteps = [
    "✨ 正在解析并融合您的创意语音意图...",
    "🧠 重建上下文画卷，打磨融合画作主轴...",
    "🎯 正在智能微调豆包文生图的专属 Prompt 关键词...",
    "🚀 正在连线火山引擎 · 种子/豆包文本到图像模型...",
    "🎨 AI大模型绘制中：雕琢画布色彩、光影与材质细节...",
    "⚡ 画面微调高清合成中，请保持麦克风连接，即将呈现..."
  ];

  // Tick the narrative logs during generating
  useEffect(() => {
    let interval: any;
    if (state === "GENERATING") {
      setGenStep(0);
      interval = setInterval(() => {
        setGenStep((prev) => (prev < genSteps.length - 1 ? prev + 1 : prev));
      }, 2600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

  const handleStart = () => {
    setStarted(true);
    startListening();
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processTranscript(manualInput);
      setManualInput("");
    }
  };

  // State indicator visual styling
  let indicatorColor = "bg-slate-800/80 border border-slate-700/60 text-slate-400 shadow-lg";
  let IndicatorIcon = Mic;
  let statusText = "待唤醒状态";

  if (state === "LISTENING") {
    indicatorColor = "bg-indigo-600 border border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] text-white";
    statusText = "正在温柔倾听您的指令...";
  } else if (state === "PROCESSING") {
    indicatorColor = "bg-violet-600 border border-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.5)] text-white";
    statusText = "正在分析您的创意意图...";
  } else if (state === "GENERATING") {
    indicatorColor = "bg-amber-600 border border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.6)] text-white animate-pulse";
    IndicatorIcon = Sparkles;
    statusText = "豆包大模型创意渲染中...";
  } else if (state === "CLARIFYING") {
    indicatorColor = "bg-emerald-600 border border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] text-white";
    statusText = "小豆需要澄清，请补充细节...";
  }

  // Welcome Intro View
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Glowing Background Auras */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>

        <div className="z-10 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-10 md:p-12 rounded-3xl flex flex-col items-center max-w-2xl text-center space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in duration-700">
          
          {/* Neon Logo Indicator */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800">
              <Mic size={36} className="text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 uppercase tracking-widest">
              <Sparkles size={12} /> Powered by Volcengine & Doubao
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent uppercase">
              小豆语音绘图助理
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed max-w-lg mx-auto">
              体验完全免手持的零束缚创意空间。呼唤、描述、切换样式，均可利用对话完美驾驭，享受人机零距离的视觉画布生成。
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 w-full text-left max-w-md border-t border-b border-slate-800/80 py-6 my-2">
            <div className="flex items-start space-x-2">
              <Volume2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">连续语音控制</h4>
                <p className="text-[11px] text-slate-500">直接对话即可渐进式地修改微调画作状态</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Compass size={16} className="text-purple-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">智能记忆合成</h4>
                <p className="text-[11px] text-slate-500">大模型整合上下文，自动理解前后绘图诉求</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 w-full">
            <button 
              onClick={handleStart}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-extrabold rounded-full uppercase tracking-widest hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-600/20 w-fit cursor-pointer"
            >
              开启纯语音绘图体验
            </button>
            <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
              <Info size={11} /> 体验需授权读取浏览器麦克风权限
            </span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans overflow-hidden relative">
      {/* Universal Grid/Glow Mesh */}
      <div className="absolute inset-0 bg-[#070913] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-slate-900 z-20 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Orbit size={20} className="animate-spin-slow duration-[8s]" />
          </div>
          <div>
            <span className="font-display font-bold text-base tracking-tight uppercase bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Hands-Free AI Canvas
            </span>
            <span className="block text-[9px] font-bold text-indigo-400 tracking-widest uppercase">小豆语音工作室</span>
          </div>
        </div>

        {/* Engine and Micro info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
            <Sparkles size={11} className="text-amber-400" />
            <span>集成豆包文生图 Endpoint</span>
          </div>
          
          <div className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5 shadow-sm shadow-emerald-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>麦克风已开启</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* Left Bento Pane: Command Handbook & Context */}
        <aside className="w-full lg:w-80 border-r border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
          
          {/* Dynamic Context Card */}
          <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">画布信息</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                比例：{ratio || "1:1"}
              </span>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-slate-300">当前累计创意 Prompt</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-3 italic">
                {currentImageUrl ? `“${transcriptDisplay || "通过声音迭代当前画卷"}”` : "暂未开始绘画。请在底部点击或说出指令。"}
              </p>
            </div>
          </div>

          {/* Handbook Guide */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <BookOpen size={14} className="text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest">语音控制手册</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850/60 rounded-xl transition-all group duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  绘制创意 (任意词汇)
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  “画一只在月球废墟插旗子的机械小企鹅，油画风格。”
                </p>
              </div>

              <div className="p-3 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850/60 rounded-xl transition-all group duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                  系统快捷操作键
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  说出以下触发词可由系统直接拦截执行，100% 准确：
                </p>
                <div className="mt-2 space-y-1 text-[9px] text-indigo-300 font-semibold">
                  <div className="flex items-center justify-between px-2 py-0.5 bg-slate-950 rounded border border-slate-900">
                    <span>清空画板</span>
                    <span className="text-slate-500">“系统清空画布”</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-0.5 bg-slate-950 rounded border border-slate-900">
                    <span>保存下载</span>
                    <span className="text-slate-500">“把图存下来”</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-0.5 bg-slate-950 rounded border border-slate-900">
                    <span>宽高比 16:9</span>
                    <span className="text-slate-500">“系统切换比例 16比9”</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850/60 rounded-xl transition-all group duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  增量叠代说明
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-normal">
                  无需重复长句。画好第一张后，直接说：“加一个宇航员在它旁边”或“换成3D写实渲染”。
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-600 border-t border-slate-900 pt-4 font-mono flex items-center gap-1">
            <Info size={10} /> Powered via Volcengine v3 SDK
          </div>
        </aside>

        {/* Right Studio Area */}
        <main className="flex-1 bg-slate-950 relative flex flex-col items-center justify-center p-6 md:p-8 overflow-hidden min-h-0">
          
          {/* Center Canvas Background Frame */}
          <div className="w-full max-w-4xl flex-1 flex items-center justify-center relative min-h-0">
            
            {/* Empty Canvas Presenter */}
            {!currentImageUrl && state !== "GENERATING" && (
              <div className="bg-slate-900/30 border border-slate-900 px-8 py-12 rounded-3xl shadow-2xl flex flex-col items-center justify-center max-w-md text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-float">
                  <ImageIcon size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase">数码绘图画布就绪</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-normal">
                    请直接说出画稿名称。大模型听到短语后，便会在云层启动绘图，描绘您不可思议的绝妙视界。
                  </p>
                </div>
                <button 
                  onClick={startListening}
                  className="px-5 py-2 bg-slate-800 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-500/10 active:scale-95 transition-all cursor-pointer"
                >
                  测试激活麦克风
                </button>
              </div>
            )}

            {/* Generated Image Container */}
            {currentImageUrl && (
              <div id="art-canvas-container" className={`relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-900/80 transition-all duration-700 max-h-[64vh] bg-neutral-900 flex items-center justify-center ${state === "GENERATING" ? "scale-95 opacity-20 blur-md" : "scale-100 opacity-100"}`}>
                
                {/* The Masterpiece */}
                <img 
                  id="final-rendered-art"
                  src={currentImageUrl} 
                  className="object-contain max-h-[60vh] max-w-full rounded-2xl select-none" 
                  alt="Speech Generated Art" 
                />

                {/* Info badge overlays */}
                {state !== "GENERATING" && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <span className="bg-slate-950/80 backdrop-blur border border-slate-800/80 text-[10px] uppercase font-bold text-slate-300 px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-md">
                      <Check size={12} className="text-emerald-400" />
                      <span>已渲染成型 ({ratio})</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Waiting for Image Generated Loader Style */}
            {state === "GENERATING" && (
              <div className="absolute inset-0 flex items-center justify-center z-30 animate-in fade-in zoom-in duration-500">
                <div className="relative p-10 md:p-12 rounded-3xl flex flex-col justify-center items-center text-center max-w-lg w-full bg-slate-950/80 backdrop-blur-xl border border-slate-800/60 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-8">
                  
                  {/* High Fidelity Concentric Orbital Rings */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    
                    {/* Ring 1: Outer cyan/indigo slow dotted */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30 animate-rotate-slow"></div>
                    
                    {/* Ring 2: Medium purple inverse quick spinner */}
                    <div className="absolute inset-3 rounded-full border border-double border-purple-500/40 animate-rotate-reverse-slow"></div>
                    
                    {/* Ring 3: Inner pulse orange core container */}
                    <div className="absolute inset-7 bg-gradient-to-tr from-amber-500/10 to-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 [box-shadow:0_0_30px_rgba(99,102,241,0.2)] animate-pulse">
                      <Sparkles size={28} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>

                    {/* Floating orbiting particles */}
                    <span className="absolute top-2 left-6 w-1.5 h-1.5 bg-sky-300 rounded-full animate-ping"></span>
                    <span className="absolute bottom-4 right-6 w-1 h-1 bg-indigo-400 rounded-full"></span>
                    <span className="absolute right-3 top-10 w-2 h-2 bg-purple-400 rounded-full opacity-60"></span>
                  </div>

                  {/* Micro Loading step logs */}
                  <div className="space-y-3 w-full">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/5 px-4 py-1.5 rounded-full border border-amber-500/10 shadow-sm animate-pulse">
                      <Loader2 size={13} className="animate-spin" />
                      <span>火山引擎 · 豆包大模型计算中</span>
                    </div>
                    
                    <h3 className="text-lg font-display font-extrabold tracking-wide text-slate-100 uppercase bg-gradient-to-r from-indigo-200 to-indigo-100 bg-clip-text text-transparent">
                      正在极速构建精美图像
                    </h3>
                    
                    {/* Progress logging steps narrative */}
                    <div className="bg-slate-900/60 border border-slate-850/80 rounded-xl p-3 text-center min-h-[46px] flex items-center justify-center transition-all duration-300">
                      <span className="text-xs text-slate-400 font-medium font-sans italic animate-in fade-in slide-in-from-bottom-2">
                        {genSteps[genStep]}
                      </span>
                    </div>

                    {/* Faux elegant timeline/loader bar */}
                    <div className="w-full bg-slate-900 rounded-full h-1 relative overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(98, ((genStep + 1) / genSteps.length) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Control Footer Panel */}
      <footer className="h-44 border-t border-slate-900 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center relative z-20 gap-4">
        
        {/* Voice Command Bubble Display (Floating indicator) */}
        <div className="absolute top-[-1.5rem] left-1/2 -translate-x-1/2 border border-slate-850 bg-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl px-6 py-2.5 min-h-12 flex items-center justify-center min-w-[280px] max-w-2xl text-center">
          {transcriptDisplay ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-tight font-sans">
                “ {transcriptDisplay} ”
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">等待最新语音指令...</p>
            </div>
          )}
        </div>

        {/* Action Controls Panel */}
        <div className="flex flex-col items-center gap-3 mt-3 w-full max-w-3xl px-6">
          <div className="flex items-center justify-center gap-8 w-full">
            
            {/* Display active state text left */}
            <div className="hidden md:flex flex-col items-end w-48 font-semibold">
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 block">模式与状态</span>
              <span className="text-xs text-indigo-400 font-medium tracking-tight truncate max-w-full">
                {statusText}
              </span>
            </div>

            {/* Glowing Studio Micro Indicator button in the center */}
            <div className="flex flex-col items-center gap-2 relative">
              
              {/* Background breathing pulse ring */}
              {state === "LISTENING" && (
                <div className="absolute inset-0 -m-2 bg-indigo-500/20 rounded-full animate-ping duration-[3s]"></div>
              )}
              {state === "PROCESSING" && (
                <div className="absolute inset-0 -m-2 bg-pink-500/20 rounded-full animate-ping duration-[1.5s]"></div>
              )}

              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out cursor-pointer group select-none border shadow-md active:scale-95 ${indicatorColor}`} 
                onClick={() => state === 'IDLE' && startListening()}
                title="点击说出创意指令"
              >
                {state === "LISTENING" ? (
                  // Custom soundwave visual bars inside the listening button
                  <div className="flex items-end gap-0.5 h-6">
                    <span className="w-1 bg-white rounded-full animate-pulse-bar1" style={{ height: '100%', minHeight: '6px' }}></span>
                    <span className="w-1 bg-white rounded-full animate-pulse-bar3" style={{ height: '70%', minHeight: '6px' }}></span>
                    <span className="w-1 bg-white rounded-full animate-pulse-bar5" style={{ height: '100%', minHeight: '6px' }}></span>
                    <span className="w-1 bg-white rounded-full animate-pulse-bar2" style={{ height: '60%', minHeight: '6px' }}></span>
                  </div>
                ) : state === "PROCESSING" ? (
                  <Loader2 size={24} className="animate-spin text-white" />
                ) : (
                  <IndicatorIcon size={26} className="group-hover:scale-110 group-hover:text-white transition-transform duration-300" />
                )}
              </div>
            </div>

            {/* Animated soundwaves display panel right */}
            <div className="hidden md:flex flex-col items-start w-48">
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 block mb-1">音量响应</span>
              {state === "LISTENING" ? (
                <div className="flex items-center gap-1 h-3">
                  <div className="w-1 bg-indigo-500 rounded-full animate-pulse-bar1 h-2"></div>
                  <div className="w-1 bg-indigo-400 rounded-full animate-pulse-bar2 h-3"></div>
                  <div className="w-1 bg-purple-500 rounded-full animate-pulse-bar3 h-1.5"></div>
                  <div className="w-1 bg-fuchsia-500 rounded-full animate-pulse-bar4 h-3"></div>
                  <div className="w-1 bg-indigo-500 rounded-full animate-pulse-bar5 h-2"></div>
                </div>
              ) : (
                <div className="flex items-center gap-1 h-3 opacity-30">
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  <div className="w-1 h-2.5 bg-slate-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  <div className="w-1 h-1.5 bg-slate-600 rounded-full"></div>
                </div>
              )}
            </div>

          </div>

          <div className="h-4 text-[10px] uppercase font-black tracking-widest text-slate-500">
            {state === "IDLE" ? "点击中圈或直接呼唤小豆助手说出指令" : "双工语音通道激活中"}
          </div>
        </div>

        {/* Fallback Text Input: beautifully designed in dark-mode */}
        <form onSubmit={submitManual} className="absolute right-8 bottom-6 opacity-40 focus-within:opacity-100 hover:opacity-100 transition-opacity">
          <div className="relative">
            <input 
              type="text" 
              placeholder="备测创意文本，回车发送..." 
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 py-1.5 pl-3 pr-8 rounded-lg text-[11px] font-medium tracking-tight focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-52 shadow-inner transition-colors duration-200"
            />
            <button type="submit" className="absolute right-2 top-1.5 text-indigo-400 hover:text-indigo-300">
              <ChevronRight size={13} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
