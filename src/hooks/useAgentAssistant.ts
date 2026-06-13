import { useState, useEffect, useRef, useCallback } from "react";

export type AssistantState = "IDLE" | "LISTENING" | "PROCESSING" | "GENERATING" | "CLARIFYING";

interface AgentResponse {
  action: "SYSTEM_CLEAR" | "SYSTEM_SAVE" | "SYSTEM_RATIO" | "CLARIFY" | "GENERATE" | "NOISE";
  ratio?: string;
  clarification_text?: string;
  new_prompt?: string;
}

export function useAgentAssistant() {
  const [state, setState] = useState<AssistantState>("IDLE");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState<string>("1:1");
  const [transcriptDisplay, setTranscriptDisplay] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // Refs to prevent acoustic feedback loop and handle state safely across closures
  const stateRef = useRef<AssistantState>("IDLE");
  const processingRef = useRef<boolean>(false);
  const speakingRef = useRef<boolean>(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onstart = () => {
        // Only state change to Listening if we were Idle 
        setState((prev) => (prev === "IDLE" ? "LISTENING" : prev));
      };

      recognition.onresult = async (event: any) => {
        // Guard against acoustic loopback when browser TTS is speaking or system is busy
        const isCurrentlySpeaking = speakingRef.current || (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending));
        const isSystemBusy = processingRef.current || stateRef.current === "PROCESSING" || stateRef.current === "GENERATING" || stateRef.current === "CLARIFYING";

        if (isCurrentlySpeaking || isSystemBusy) {
          console.log("Speech recognition ignored: speak =", isCurrentlySpeaking, "busy =", isSystemBusy, "state =", stateRef.current);
          return;
        }

        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          setTranscriptDisplay(interimTranscript);
          setState("LISTENING");
        }

        if (finalTranscript) {
          setTranscriptDisplay(finalTranscript);
          // Process final transcript
          await processTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        // 处理各种错误类型
        if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
           setState("IDLE");
        } else if (event.error === 'network') {
           // 网络错误：可能是断网或防火墙阻止
           console.warn("网络错误：语音识别服务无法连接，请检查网络连接");
           setState("IDLE");
           // 可选：延迟后自动重试
           setTimeout(() => {
             if (stateRef.current === "IDLE" && recognitionRef.current) {
               console.log("尝试重新启动语音识别...");
               try {
                 recognitionRef.current.start();
               } catch(e) {
                 console.warn("重启失败:", e);
               }
             }
           }, 3000);
        }
      };

      recognition.onend = () => {
        // Continuous mode might end, try to restart if it drops and we want it still active
        // But for safety, let's keep it simple:
        if (state === "LISTENING" || state === "IDLE") {
             // Let the user manually start it, or auto restart
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, []);

  const processTranscript = async (transcript: string) => {
    processingRef.current = true;
    setState("PROCESSING");
    
    try {
      const res = await fetch("/api/process-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          currentRatio: ratio,
          historyPrompt: currentPrompt,
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("API Error returned from server:", errData);
        if (errData.message) {
            speakClarification(errData.message);
        } else {
            speakClarification("抱歉，我没有理解您的指令，服务器出现错误。");
        }
        processingRef.current = false;
        setState("IDLE");
        return;
      }

      const data: AgentResponse = await res.json();
      console.log("Agent Intent Response:", data);
      
      switch (data.action) {
        case "SYSTEM_CLEAR":
          setCurrentPrompt("");
          setCurrentImageUrl(null);
          speakClarification("已清空画布");
          break;
        case "SYSTEM_SAVE":
          downloadImage();
          speakClarification("正在为您保存画作");
          break;
        case "SYSTEM_RATIO":
          if (data.ratio) setRatio(data.ratio);
          speakClarification(`已切换比例到${data.ratio}`);
          break;
        case "CLARIFY":
          setState("CLARIFYING");
          speakClarification(data.clarification_text || "请问您具体想画什么？");
          break;
        case "NOISE":
          setState("IDLE");
          setTranscriptDisplay("");
          break;
        case "GENERATE":
          setState("GENERATING");
          setCurrentPrompt(data.new_prompt || "");
          await generateImage(data.new_prompt || "", data.ratio || "1:1");
          break;
        default:
          setState("IDLE");
          break;
      }
    } catch (err) {
      console.error(err);
      speakClarification("网络出现了一点问题");
      setState("IDLE");
    } finally {
      processingRef.current = false;
    }
  };

  const speakClarification = (text: string) => {
    if (!text) {
      speakingRef.current = false;
      setState("IDLE");
      return;
    }
    speakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    
    const resetSpeak = () => {
      speakingRef.current = false;
      setState("IDLE");
      setTranscriptDisplay("");
    };

    utterance.onend = resetSpeak;
    utterance.onerror = resetSpeak;
    synthRef.current.speak(utterance);
  };

  const generateImage = async (prompt: string, aspectR: string) => {
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectR })
      });
      const data = await res.json();
      if (data.url) {
        const img = new Image();
        img.src = data.url;
        img.onload = () => {
          setCurrentImageUrl(data.url);
          setState("IDLE");
          setTranscriptDisplay("");
        };
        img.onerror = () => {
          speakClarification("图片加载失败，请重试");
          setState("IDLE");
        };
      } else {
        throw new Error(data.error || "No URL returned");
      }
    } catch (err) {
      console.error("Error calling image API:", err);
      speakClarification("图片生成失败，请重试");
      setState("IDLE");
    }
  };

  const downloadImage = () => {
    if (!currentImageUrl) return;
    fetch(currentImageUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `xiaodou_art_${Date.now()}.png`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
        try {
            recognitionRef.current.start();
            console.log("语音识别已启动，请说话...");
        } catch(e) {
            console.warn("语音识别已在运行中");
        }
    } else {
      console.warn("浏览器不支持语音识别");
      speakClarification("您的浏览器不支持语音识别");
    }
  }, []);

  return {
    state,
    currentImageUrl,
    ratio,
    transcriptDisplay,
    startListening,
    processTranscript, // Exposed for manual dev triggering
  };
}
