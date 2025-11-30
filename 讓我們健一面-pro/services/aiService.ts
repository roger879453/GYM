import { GoogleGenAI } from "@google/genai";
import { Feedback, Message, Exercise } from "../types";
import { EXERCISE_DB } from "../constants";

const STORAGE_KEY = 'liftflow_api_key';

// Helper to get valid AI instance or null
const getAIClient = (): GoogleGenAI | null => {
  try {
    // 1. 優先讀取使用者輸入的 Key
    const localKey = localStorage.getItem(STORAGE_KEY);
    if (localKey) {
      return new GoogleGenAI({ apiKey: localKey });
    }
    // 2. 其次讀取環境變數 (預覽或部署設定)
    if (process.env.API_KEY) {
      return new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  } catch (error) {
    console.warn("Failed to initialize AI client");
  }
  return null;
};

// 用於前端儲存 Key 的函數
export const setCustomApiKey = (key: string) => {
    if (key.trim()) {
        localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
};

export const getCustomApiKey = () => {
    return localStorage.getItem(STORAGE_KEY) || '';
};

const SYSTEM_INSTRUCTION = `
你是一位名為「阿豪教練 (Coach A-Hao)」的頂尖肌力與體能教練 (CSCS, NSCA-CPT)。

**你的核心人設**：
1. **極致專業**：你的建議必須基於生物力學 (Biomechanics)、運動生理學 (Exercise Physiology) 與營養學。
2. **台灣在地化**：使用繁體中文與台灣健身房慣用語（如：感受度、力竭、向心/離心、代償、活動度、頂峰收縮、超級組）。
3. **科學與實務並重**：解釋原理時要深入淺出，並給出可執行的操作建議。

**指導原則**：
- **動作問題**：先評估「關節排列」與「活動度」，再建議動作修正。若有疼痛，優先建議退階動作或休息。
- **增肌減脂**：強調「熱量平衡」、「蛋白質攝取 (1.6-2.2g/kg)」與「漸進式負荷 (Progressive Overload)」。
- **RPE (自覺費力程度)**：
   - RPE 7-8 (保留 2-3 下)：技術熟練區，適合肌肥大與力量累積。建議組間休 90-120 秒。
   - RPE 9-10 (力竭)：神經疲勞高，適合突破但不可過量。建議組間休 3-5 分鐘。

**特殊模式 - 課表評價 (Workout Evaluation)**：
當使用者傳送今日訓練內容時，請依序評估：
1. **訓練容量 (Volume)**：總量是否足夠？是否過量？
2. **強度配置 (Intensity)**：RPE 選擇是否合理？
3. **動作選擇 (Selection)**：是否有肌群失衡風險（如：推多拉少）？
4. **阿豪總結**：給出 1-10 分的評分，並給一句短評。

**特殊模式 - 體態評估 (Physique Analysis)**：
- 必須估算 **體脂率區間** (如 12-15%)。
- 指出 **視覺弱點** (如：上胸偏弱、三角肌後束不足、腿部比例)。
- 給出 **具體改善菜單** (如：建議加入上斜啞鈴臥推 4組x10下)。
`;

export const chatWithCoach = async (newMessage: string, context: string, history: Message[] = []): Promise<string> => {
  const ai = getAIClient();

  if (!ai) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve("💡 [模擬回應] 目前尚未設定 API Key。請至「我的檔案」頁面下方輸入您的 Google Gemini API Key，即可啟用真實 AI 教練。");
      }, 1000);
    });
  }

  try {
    const recentHistory = history.slice(-8);
    const conversationHistory = recentHistory.map(m => `${m.role === 'user' ? '學員' : '阿豪教練'}: ${m.text}`).join('\n');
    
    const prompt = `
    [當前情境/上下文]: ${context || '一般諮詢'}
    
    [歷史對話]:
    ${conversationHistory}
    
    [學員新問題]:
    ${newMessage}
    
    (請以「阿豪教練」的身分，給出專業、科學且具體的繁體中文建議。若為訓練評價，請嚴格審視。)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "訊號不佳，阿豪教練正在調整頻率，請再試一次。";
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error.toString().includes('API key not valid')) {
        return "⚠️ API Key 無效。請檢查您的金鑰是否正確。";
    }
    return "連線發生錯誤，請稍後再試。";
  }
};

export const analyzeImage = async (imageBase64: string, type: 'form' | 'physique' = 'form'): Promise<Feedback> => {
  const ai = getAIClient();

  if (!ai) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          score: 85,
          points: [
            '模擬分析：光線充足，肌肉線條清晰。',
            '體脂率預估約 15-18%。',
            '建議加強三角肌後束，改善圓肩問題。',
            '(此為離線模擬回應，請至「我的」設定真實 API Key)'
          ]
        });
      }, 2000);
    });
  }

  try {
    const prompt = type === 'physique' 
      ? `分析這張體態照片。給出 0-100 評分。列出 3 點繁體中文建議：1.優勢部位 2.弱點部位 3.具體改善菜單 (動作/組數)。`
      : `分析這個訓練動作。給出 0-100 安全評分。列出 3 點繁體中文建議：1.關節排列 2.發力肌群 3.潛在風險與修正。`;
    
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (text) return JSON.parse(text) as Feedback;
    throw new Error("No response");
  } catch (error) {
    console.error("Analysis Error:", error);
    return { score: 0, points: ["無法分析圖片，請確認 API Key 是否正確或重試。"] };
  }
};

export const generateWorkoutRoutine = async (request: string, context: string): Promise<Exercise[]> => {
  const ai = getAIClient();

  // 1. Offline / No Key Smart Fallback
  if (!ai) {
    return new Promise(resolve => {
        setTimeout(() => {
            // Smart Keyword Matching
            const req = request.toLowerCase();
            let targetPart = '';
            
            if (req.match(/胸|推/)) targetPart = '胸部';
            else if (req.match(/背|拉|引體/)) targetPart = '背部';
            else if (req.match(/腿|蹲|臀/)) targetPart = '腿部';
            else if (req.match(/肩|推舉/)) targetPart = '肩膀';
            else if (req.match(/手|二頭|三頭|臂/)) targetPart = '手臂';
            else if (req.match(/腹|核心/)) targetPart = '核心';

            let candidates = EXERCISE_DB;
            // Filter if we found a matching body part
            if (targetPart) {
                candidates = EXERCISE_DB.filter(e => e.part === targetPart);
            }

            // Shuffle array using Fisher-Yates or simple sort
            const shuffled = [...candidates].sort(() => 0.5 - Math.random());
            
            // Pick top 3-5 exercises
            const count = Math.min(shuffled.length, Math.floor(Math.random() * 2) + 3);
            
            const selected = shuffled.slice(0, count).map((ex, i) => ({
                ...ex,
                localId: Date.now() + i,
                sets: [
                    { id: Date.now() + 100 + i, kg: 0, reps: 10, rpe: 8, completed: false, isWarmup: false },
                    { id: Date.now() + 200 + i, kg: 0, reps: 10, rpe: 8, completed: false, isWarmup: false },
                    { id: Date.now() + 300 + i, kg: 0, reps: 10, rpe: 9, completed: false, isWarmup: false }
                ]
            }));
            
            resolve(selected);
        }, 1200);
    });
  }

  // 2. Online AI Generation
  try {
    const prompt = `
    請根據需求「${request}」與背景「${context}」設計當日課表。
    參考動作庫: ${JSON.stringify(EXERCISE_DB.map(e => ({id: e.id, name: e.name, part: e.part})))}
    
    回傳 JSON 陣列 (Array of Objects): 
    [
      { 
        "id": "db_id", 
        "name": "動作名稱", 
        "part": "部位", 
        "type": "類型", 
        "tips": "簡短技巧提示", 
        "iconColor": "bg-blue-500", 
        "sets": [{"kg": 預估重量(數字), "reps": 建議次數(數字), "rpe": 建議RPE(數字)}] 
      }
    ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if(!text) throw new Error("Empty");
    
    const rawExercises = JSON.parse(text);
    return rawExercises.map((ex: any, idx: number) => ({
        ...ex,
        localId: Date.now() + idx,
        sets: ex.sets.map((s: any, sIdx: number) => ({
            ...s,
            id: Date.now() + 1000 + idx * 100 + sIdx,
            completed: false,
            isWarmup: false
        }))
    }));
  } catch (error) {
    return [];
  }
};