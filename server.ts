import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.example" });
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

let ai: OpenAI | null = null;
function getAI() {
  if (!ai) {
    const apiKey = process.env.VOLC_ARK_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("VOLC_ARK_API_KEY is not set.");
    }
    ai = new OpenAI({ 
      apiKey: apiKey,
      baseURL: "https://ark.cn-beijing.volces.com/api/v3"
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/process-intent", async (req, res) => {
    try {
      const { transcript, currentRatio, historyPrompt } = req.body;

      if (!transcript) {
        return res.status(400).json({ error: "No transcript provided" });
      }

      const prompt = `你是一个纯语音控制的AI绘图助理逻辑中枢。
用户发出的原始语音转换文本如下：
"${transcript}"

当前的画布比例是：${currentRatio || '1:1'}
历史画面描述（英文）为："${historyPrompt || ''}"

请你判断用户的意图，并返回严格的JSON结构：
{
  "action": "SYSTEM_CLEAR" | "SYSTEM_SAVE" | "SYSTEM_RATIO" | "CLARIFY" | "GENERATE" | "NOISE",
  "ratio": "当前的画布比例（如 '1:1', '16:9', '9:16'），如果意图是修改比例，请输出新的比例",
  "clarification_text": "如果意图是CLARIFY，这里写需要追问的简短中文话术（比如'请问具体想画什么小狗？'）；其他传空字符串",
  "new_prompt": "如果意图是GENERATE，结合历史描述和用户新要求，输出一张完整画面的全新英文提示词（Prompt）。要求画面细节丰富，体现出材质光影等。"
}

判定规则：
1. 若文本明显包含“系统清空画布”、“重新开始”、“全部删掉” -> action:"SYSTEM_CLEAR"
2. 若包含"保存图片"、"系统保存作品"、"系统导出图片"、"把图存下来"、"下载图片" -> action:"SYSTEM_SAVE"
3. 若包含“系统切换比例”或“换成十六比九”、“设置成一比一” -> action:"SYSTEM_RATIO" 并更新 ratio
4. 若用户仅说了单字、噪音或仅说了唤醒词却无后文 -> action:"NOISE"
5. 若用户的绘图指令极度模糊，缺失主体信息（例如只说“画一个”、“加一点东西”、“换个风格”） -> action:"CLARIFY"，并生成语气自然亲切的追问话术。
6. 若用户指令清晰，提取其中的绘图意图，合并历史描述，生成全新的场景描述（new_prompt）。例如历史是"a black cat"，用户说"加上帽子"，则生成"a black cat wearing a trendy hat..."。

注意：返回纯JSON结构，不要包含任何Markdown标记（勿使用 \`\`\`json ）。`;

      let aiClient;
      try {
        aiClient = getAI();
      } catch (err: any) {
        if (err.message.includes("VOLC_ARK_API_KEY")) {
          return res.status(500).json({ error: "Missing API Key", message: "您需要配置 VOLC_ARK_API_KEY" });
        }
        throw err;
      }
      
      const endpoint = process.env.VOLC_ENDPOINT_TEXT;
      if (!endpoint) {
          return res.status(500).json({ error: "Missing Endpoint", message: "您需要配置 VOLC_ENDPOINT_TEXT" });
      }

      const response = await aiClient.chat.completions.create({
        model: endpoint,
        messages: [
          { role: "system", content: "你是一个决策助手，务必只输出合法的JSON格式。" },
          { role: "user", content: prompt }
        ],
      });

      const responseText = response.choices[0]?.message?.content;
      let text = responseText || "{}";
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON from AI response. Raw text:", text);
        return res.status(500).json({ error: "Invalid AI response format" });
      }

      console.log("Parsed Intent:", parsed);
      res.json(parsed);

    } catch (err) {
      console.error("Error processing intent:", err);
      res.status(500).json({ error: "Failed to process intent", message: "调用火山引擎文本大模型出错" });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectR } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
      }

      // 根据宽高比调整提示词并计算图片尺寸
      // 豆包 API 要求图片总像素 ≥ 3,686,400，因此各比例尺寸需满足此下限
      // 16:9 → 2560×1440 = 3,686,400  9:16 → 1440×2560  1:1 → 1920×1920
      const ratio = aspectR || "1:1";
      let ratioPrompt = "";
      let imageSize = "1920x1920";  // 默认 1:1 正方形（满足最低像素要求）

      if (ratio === "16:9") {
        ratioPrompt = " (wide landscape format, 16:9 aspect ratio, cinematic composition)";
        imageSize = "2560x1440";      // 16:9 横屏，像素 = 3,686,400
      } else if (ratio === "9:16") {
        ratioPrompt = " (vertical portrait format, 9:16 aspect ratio, mobile-friendly composition)";
        imageSize = "1440x2560";      // 9:16 竖屏，像素 = 3,686,400
      } else {
        ratioPrompt = " (square format, 1:1 aspect ratio, balanced composition)";
        imageSize = "1920x1920";      // 1:1 正方形，像素 = 3,686,400
      }

      const enhancedPrompt = prompt + ratioPrompt;
      console.log(`[Image Gen] 请求参数: prompt="${prompt.slice(0,50)}...", aspectR=${aspectR}, size=${imageSize}`);

      let aiClient;
      try {
        aiClient = getAI();
      } catch (err: any) {
         return res.status(500).json({ error: "Missing API Key", message: "您需要配置 VOLC_ARK_API_KEY" });
      }

      const endpoint = process.env.VOLC_ENDPOINT_IMAGE;
      if (!endpoint) {
          return res.status(500).json({ error: "Missing Endpoint", message: "您需要配置 VOLC_ENDPOINT_IMAGE" });
      }

      const response = await aiClient.images.generate({
          model: endpoint,
          prompt: enhancedPrompt,
          n: 1,
          size: imageSize,  // 关键修复：传递 size 参数控制输出图片尺寸
      });

      const imageUrl = response.data[0].url;
      res.json({ url: imageUrl });

    } catch (err: any) {
      console.error("Error generating image:", err);
      // 如果主API失败，使用备用的 pollinations.ai 服务
      console.log("Falling back to pollination");
      const randomSeed = Math.floor(Math.random() * 1000000);

      // 注意：aspectR 和 prompt 在 try 块内声明，catch 中需从 req.body 重新读取
      const fallbackRatio = req.body?.aspectR || "1:1";
      const fallbackPrompt = req.body?.prompt || "";

      // 根据宽高比设置图片尺寸（备用路径 pollinations）
      let width = 1024, height = 1024;
      if (fallbackRatio === "16:9") {
        width = 1792; height = 1024;
      } else if (fallbackRatio === "9:16") {
        width = 1024; height = 1792;
      }
      console.log(`[Image Gen] 主API失败，使用备用路径: ${width}x${height}`);

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(String(fallbackPrompt))}?width=${width}&height=${height}&nologo=true&seed=${randomSeed}`;
      res.json({ url });
    }
  });

  // Vite middleware

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
