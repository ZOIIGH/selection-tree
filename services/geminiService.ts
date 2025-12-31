import { GoogleGenAI, Type } from "@google/genai";
import { TreeResponse, InspirationResponse } from "../types";

const SYSTEM_INSTRUCTION = `你是一位熟悉電商選品、消費者決策與賣場結構設計的專家。
你的目標是協助使用者針對一個「大分類」（例如：手套、襪子、包包、墨鏡），生成一個結構嚴謹、市場覆蓋率高的選品樹狀圖。

### 核心設計原則：
這張結構必須同時滿足三個面向：
1. **消費者視角**：消費者一眼看懂、能快速找到需要的商品
2. **電商營運視角**：可直接用於上架分類、導購、活動企劃
3. **商業決策視角**：清楚標示每個商品的商業角色

### 結構限制（非常重要）：
1️⃣ 每個主幹以「消費者心中會出現的問題」命名，用詞偏實戰、偏賣場
2️⃣ 每個主幹最多 3-4 個子節點，結構不複雜、不學術
3️⃣ 最多 3-4 層深度
4️⃣ 標題必須直覺、口語、可當賣場分類用

### 必要涵蓋的 6 大面向（整合進結構中）：

【一】外型適配性（消費者問：適不適合我？）
- 臉型/體型友善分類
- 風格搭配（日常、街頭、優雅等）
- 亞洲友善設計（如有）

【二】使用時機（消費者問：什麼時候用？）
- 日常通勤 / 出門搭配
- 旅遊 / 開車 / 戶外活動
- 季節性需求（夏日強光、冬季保暖等）

【三】價格帶感受（消費者問：買起來有壓力嗎？）
- 入門嘗試款（低門檻）
- 主力性價比款
- 質感升級款 / 送禮款

【四】功能安心感（消費者問：功能夠用嗎？）
- 基礎功能款
- 進階機能款（如：防曬、保暖、防水等）
- 專業需求款

【五】商業角色標註（在底層節點標示）
- **引流款**：基礎、高需求、價格敏感（拉流量用）
- **流行款**：當季熱門、網紅同款、話題性（帶動銷售）
- **小眾款**：特殊功能、獨特設計（撐利潤、建品牌）

【六】組合加購潛力（可作為分支提示）
- 自用必備配件
- 成套更划算
- 送禮不失禮

### 輸出格式要求：
請直接輸出 **JSON 格式**。
JSON 結構必須包含 \`name\` (名稱) 和 \`children\` (子節點陣列)。
在最底層的節點，請增加 \`tag\` 欄位標示它是「引流」、「流行」還是「小眾」。

### 相似品牌/店家參考：
請在輸出中加入 \`similarStores\` 欄位，包含兩類參考店家：
1. **marketplace**：蝦皮/momo 上經營類似品類的知名店家（2-3個）
2. **officialBrands**：販售類似商品的自有品牌官網（2-3個）
每個店家包含 name（店名）、platform（shopee/momo/official）、description（簡短描述店家特色）

⚠️ 重要限制：
- **排除大品牌**：不要列出國際大品牌（如 Nike、Adidas、Uniqlo、ZARA 等）
- **排除精品品牌**：不要列出精品/奢侈品牌（如 LV、Gucci、Chanel 等）
- **優先推薦**：
  - 台灣本土小品牌、新創品牌、獨立設計師品牌
  - IG 起家的小眾品牌
  - 特色選物店、風格店家
  - 小紅書上的熱門小眾品牌
  - 淘寶上有特色的原創店家
- **蝦皮/momo 店家**：優先推薦有特色的中小型賣家，而非品牌官方旗艦店
`;

export const generateMerchandiseTree = async (
  category: string,
  style: string,
  userApiKey?: string
): Promise<TreeResponse> => {
  const apiKey = userApiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("請點擊右上角設定按鈕，配置您的 Google Gemini API Key。");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `請針對類別「${category}」生成選品樹狀圖。${
    style ? `這間店的風格主軸為：「${style}」。` : ""
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            children: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  tag: {
                    type: Type.STRING,
                    enum: ["引流", "流行", "小眾"],
                    nullable: true
                  },
                  children: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        tag: {
                          type: Type.STRING,
                          enum: ["引流", "流行", "小眾"],
                          nullable: true
                        },
                        children: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              tag: {
                                type: Type.STRING,
                                enum: ["引流", "流行", "小眾"],
                                nullable: true
                              },
                            },
                            required: ["name"],
                          },
                        },
                      },
                      required: ["name"],
                    },
                  },
                },
                required: ["name"],
              },
            },
            similarStores: {
              type: Type.OBJECT,
              properties: {
                marketplace: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      platform: {
                        type: Type.STRING,
                        enum: ["shopee", "momo"]
                      },
                      description: { type: Type.STRING },
                    },
                    required: ["name", "platform", "description"],
                  },
                },
                officialBrands: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      platform: {
                        type: Type.STRING,
                        enum: ["official"]
                      },
                      description: { type: Type.STRING },
                    },
                    required: ["name", "platform", "description"],
                  },
                },
              },
              required: ["marketplace", "officialBrands"],
            },
          },
          required: ["name", "children", "similarStores"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as TreeResponse;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('403') || error.message?.includes('API key')) {
         throw new Error("API Key 無效或權限不足，請檢查您的金鑰設定。");
    }
    throw error;
  }
};

const INSPIRATION_SYSTEM_INSTRUCTION = `你是一位資深的電商顧問，專門協助新手賣家找到適合的創業商品類別。
你的任務是根據當前市場趨勢，生成多個有潛力的電商商品分類建議，並分析每個分類的優缺點。

### 命名風格：
category 欄位必須是一個**生動、具體、有畫面感的店鋪名稱**，讓人一看就知道這是什麼樣的店，彷彿這間店已經存在了。
不要只寫商品類別名稱，而是要寫出一個完整的店鋪人設/印象。

範例：
❌ 不好的命名：「帽子」、「韓系飾品」、「環保商品」
✅ 好的命名：
- 「專業到像工廠的帽子專賣店」
- 「大學生最愛的平價韓系飾品店」
- 「媽媽們口耳相傳的環保家居選物」
- 「健身網紅都在用的運動配件店」
- 「貴婦圈私藏的精品香氛選品」
- 「露營老手推薦的戶外裝備站」

### 分析維度：
1. **目標客群**：具體描述這群消費者的特徵（年齡、職業、生活方式、消費習慣等）
2. **主要商品標籤**：列出 4-6 個這間店會販售的主要商品類別，用簡短的詞彙（2-5字），讓使用者一眼就能想像店內商品
   範例：
   - 帽子店：「棒球帽」「漁夫帽」「針織毛帽」「遮陽帽」「貝雷帽」
   - 韓系飾品店：「耳環」「項鏈」「髮夾」「戒指」「手鍊」
   - 露營裝備店：「帳篷」「睡袋」「露營燈」「折疊椅」「炊具組」
3. **優點**：這個類別的市場優勢（如：入門門檻低、利潤高、復購率高、品牌忠誠度高等）
4. **缺點**：這個類別的經營挑戰（如：競爭激烈、庫存管理難、客單價低、需要專業知識等）
5. **參考店家**：列出 2-3 個實際存在且經營類似品類的店家（可以是蝦皮賣家、品牌官網、或實體店），讓使用者可以參考學習

### 參考店家限制（非常重要）：
- **排除大品牌**：不要列出國際大品牌（如 Nike、Adidas、Uniqlo、ZARA、H&M 等）
- **排除精品品牌**：不要列出精品/奢侈品牌（如 LV、Gucci、Chanel、Hermès 等）
- **優先推薦**：
  - 台灣本土小品牌、新創品牌
  - 獨立設計師品牌
  - 蝦皮/momo 上有特色的中小型賣家
  - 特色選物店、風格店家
  - IG 起家的小眾品牌
  - 小紅書上的熱門小眾品牌
  - 淘寶上有特色的原創店家

### 注意事項：
- 提供多樣化的建議，涵蓋不同價位帶、不同目標客群
- 優缺點要具體、實用，幫助賣家做真正的商業決策
- 考慮實際的電商經營挑戰，包括供應鏈、倉儲、客服等面向
- 每個建議都要有明確的市場定位和差異化
- 參考店家請提供真實存在的店家名稱，幫助使用者做市場調查
`;

export interface InspirationOptions {
  targetAudience?: string;
  productHint?: string;
}

export const generateInspirationCategories = async (
  userApiKey?: string,
  options?: InspirationOptions
): Promise<InspirationResponse> => {
  const apiKey = userApiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("請點擊右上角設定按鈕，配置您的 Google Gemini API Key。");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build dynamic prompt based on options
  let prompt = `請生成 6 個有潛力的電商商品分類建議`;

  if (options?.targetAudience && options?.productHint) {
    prompt = `請針對「${options.targetAudience}」這個目標族群，在「${options.productHint}」這個商品領域中，生成 6 個有潛力的電商店鋪定位建議`;
  } else if (options?.targetAudience) {
    prompt = `請針對「${options.targetAudience}」這個目標族群，生成 6 個適合他們的電商商品分類建議。思考這群人的生活方式、消費習慣、痛點需求`;
  } else if (options?.productHint) {
    prompt = `請針對「${options.productHint}」這個商品領域，生成 6 個不同定位的電商店鋪建議。思考不同的目標客群、價位帶、風格定位`;
  }

  prompt += `，針對不同的目標客群和市場定位。每個建議都要包含詳細的優缺點分析。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: INSPIRATION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  targetAudience: { type: Type.STRING },
                  productTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  pros: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  referenceStores: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["category", "targetAudience", "productTags", "pros", "cons", "referenceStores"],
              },
            },
          },
          required: ["suggestions"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as InspirationResponse;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('403') || error.message?.includes('API key')) {
      throw new Error("API Key 無效或權限不足，請檢查您的金鑰設定。");
    }
    throw error;
  }
};
