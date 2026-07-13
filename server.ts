import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI SDK safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized successfully on server-side.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. Using mock presets for live generation.");
}

// Support large payloads for base64 images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Mock products database for styling references (Hebrew localized)
const MOCK_PRODUCTS_DATABASE = [
  { id: 'item_1', name: 'שולחן קפה מעוצב בסגנון נוגוצ\'י', price: '1,199 ₪', matchPercentage: 98, imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=300&q=80', buyUrl: '#buy', category: 'שולחנות' },
  { id: 'item_2', name: 'כורסת מנהלים מעוצבת אימס עם הדום', price: '4,499 ₪', matchPercentage: 95, imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=300&q=80', buyUrl: '#buy', category: 'כיסאות וכורסאות' },
  { id: 'item_3', name: 'שידת עץ אלון בהיר מינימליסטית', price: '2,099 ₪', matchPercentage: 92, imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=300&q=80', buyUrl: '#buy', category: 'שידות ואחסון' },
  { id: 'item_4', name: 'שטיח צמר פלומתי ארוג בעבודת יד', price: '649 ₪', matchPercentage: 89, imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=300&q=80', buyUrl: '#buy', category: 'טקסטיל ושטיחים' },
  { id: 'item_5', name: 'מנורת עמידה תעשייתית מפליז', price: '519 ₪', matchPercentage: 94, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=80', buyUrl: '#buy', category: 'תאורה לבית' },
  { id: 'item_6', name: 'עציץ מונסטרה דליסיוסה בכלי חימר', price: '159 ₪', matchPercentage: 97, imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=300&q=80', buyUrl: '#buy', category: 'צמחייה לעיצוב' },
  { id: 'item_7', name: 'ספת עור יוקרתית בגוון קוניאק', price: '5,190 ₪', matchPercentage: 96, imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=300&q=80', buyUrl: '#buy', category: 'ספות ומערכות ישיבה' },
  { id: 'item_8', name: 'גוף תאורה תלוי במבוק ג\'פנדי', price: '420 ₪', matchPercentage: 91, imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=300&q=80', buyUrl: '#buy', category: 'תאורה לבית' }
];

// Helper to filter items based on keywords
function getRelatedProducts(styleKeywords: string[] = []): typeof MOCK_PRODUCTS_DATABASE {
  if (styleKeywords.length === 0) return MOCK_PRODUCTS_DATABASE.slice(0, 3);
  
  // Rank items based on style keywords match
  const scored = MOCK_PRODUCTS_DATABASE.map(item => {
    let score = 0;
    const lowerName = item.name.toLowerCase();
    const lowerCategory = item.category.toLowerCase();
    
    styleKeywords.forEach(kw => {
      const lkw = kw.toLowerCase();
      if (lowerName.includes(lkw) || lkw.includes(lowerCategory) || lowerCategory.includes(lkw)) {
        score += 3;
      }
    });
    // Add minor random noise to make the product line-up feel dynamic
    score += Math.random() * 0.5;
    return { item, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.item);
}

// 🎨 Image Redesign Endpoint (Dynamic Style Makeover)
app.post("/api/redesign", async (req, res) => {
  const { image, styleId, styleName, prompt } = req.body;

  if (!image) {
    return res.status(400).json({ success: false, error: "Missing room image data" });
  }

  // Base64 clean up (strip data:image/jpeg;base64, if present)
  let base64Data = image;
  let mimeType = "image/jpeg";
  if (image.startsWith("data:")) {
    const parts = image.split(",");
    base64Data = parts[1];
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
  }

  // If no API key or AI client, return mock beautiful makeover images gracefully
  if (!ai) {
    console.log("No AI client configured. Returning styled preset image.");
    return res.json({
      success: true,
      imageUrl: "", // Handled on frontend side by picking preset styled image or picsum
      description: `הדמיית סגנון ${styleName} מבוצעת בהצלחה במצב סגור. הגדירו מפתח Gemini API ב-Secrets כדי לחולל הדמיות מותאמות אישית בזמן אמת.`,
      isDemoMode: true
    });
  }

  try {
    const styleInstruction = `Perform a high-fidelity room makeover in "${styleName}" style. ${prompt || ""}.
Keep the structural dimensions, walls, window placement, door locations, and perspective of the original space identical, but replace all furniture, textures, color schemes, curtains, rugs, wall hangings, lights, and layout contents to align perfectly with the modern, luxurious, photorealistic aesthetic of "${styleName}" style. Keep the visual outcome pristine and elegant. Do not introduce distortion.`;

    console.log(`Sending image makeover request to Gemini... Style: ${styleName}`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: styleInstruction,
          },
        ],
      },
    });

    let generatedBase64 = "";
    let explanationText = `הנה החלל החדש שלכם המעוצב בסגנון המרהיב: ${styleName}.`;

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          generatedBase64 = part.inlineData.data;
        } else if (part.text) {
          explanationText = part.text;
        }
      }
    }

    if (!generatedBase64) {
      throw new Error("No image was returned from the Gemini model.");
    }

    // Retrieve curated shoppable items matching keywords
    const keywords = [styleName, ...(prompt ? prompt.split(" ") : [])];
    const shoppableProducts = getRelatedProducts(keywords);

    return res.json({
      success: true,
      imageUrl: `data:image/png;base64,${generatedBase64}`,
      description: explanationText,
      products: shoppableProducts,
      isDemoMode: false
    });

  } catch (error: any) {
    console.error("Error generating design with Gemini:", error);
    return res.json({
      success: false,
      error: error.message || "Failed to contact Gemini Image Generation API.",
      description: "שגיאה התרחשה במהלך יצירת תמונת ה-AI. מערכת המערך החלופי הופעלה בהצלחה."
    });
  }
});

// 💬 Context-Aware Chat Interface Endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, currentStyle, roomDescription, originalImage, redesignedImage } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, error: "Missing conversation history" });
  }

  const userMessage = messages[messages.length - 1]?.text || "";

  if (!ai) {
    // Elegant fallback if Gemini is not running (Hebrew localized)
    const styleKeywords = currentStyle ? [currentStyle] : [];
    const simulatedResponse = {
      text: `אשמח מאוד לעזור לכם לעצב ולשפר את החלל שלכם בסגנון **${currentStyle || "עיצוב פנים"}**! כדי להפעיל שיחות חיות בזמן אמת והתאמות עיצוב חכמות עם בינה מלאכותית, אנא הזינו מפתח \`GEMINI_API_KEY\` בהגדרות ה-Secrets. \n\nבינתיים, אני ממליץ לשלב גוף תאורה אלגנטי או להחליף את השטיח בגוון ניגודי כדי לחבר את כל חלקי החדר יחד! כל חומרי הגלם והאביזרים המומלצים זמינים ישירות בסניפי ח. סבן חומרי בניין.`,
      refineRequired: userMessage.toLowerCase().includes("שטיח") || userMessage.toLowerCase().includes("צבע") || userMessage.toLowerCase().includes("תאורה") || userMessage.toLowerCase().includes("לשנות") || userMessage.toLowerCase().includes("ספה"),
      refinementPrompt: `שמור על הפריסה הכללית אך בצע שינוי עיצובי לפי הבקשה: "${userMessage}"`,
      shoppableItems: getRelatedProducts(styleKeywords)
    };
    return res.json({ success: true, ...simulatedResponse });
  }

  try {
    // We want the AI to return a structured JSON response
    const systemPrompt = `אתה יועץ עיצוב פנים וחוץ דיגיטלי, מקצועי ומתוחכם מטעם חברת "ח. סבן חומרי בניין (1994) בע"מ".
המשתמש צופה כעת בחדר שלו המעוצב מחדש בסגנון: "${currentStyle || 'הנבחר'}".
תיאור החדר המקורי שהועלה: "${roomDescription || 'חדר רגיל'}".

המשימות שלך הן:
1. נהל שיחה מקצועית, אדיבה ומועילה בעברית בלבד (Hebrew). ענה על שאלות עיצוב, חומרים (כגון ריצוף, צבעים, גבס, מנורות, חומרי גמר) והצע דרכים לשיפור ושינוי החלל.
2. אם המשתמש מבקש לשנות חזותית אלמנט כלשהו בחדר בתמונה (למשל: "תחליף את הספה לכחולה", "תוסיף עציצים", "תעשה תאורה חמה", "שנה את הווילון", "שים ריצוף שיש"), הגדר את השדה "refineRequired" ל-true, וצור הנחיה מפורטת באנגלית בשדה "refinementPrompt" המיועדת למודל עריכת התמונה (למשל: 'A beautiful Scandinavian living room makeover, but with a vibrant blue sofa and added trailing indoor plants').
3. הצע קטגוריות מוצרים רלוונטיות לעיצוב הקיים או המבוקש מתוך הרשימה שלנו: ["שולחנות", "כיסאות וכורסאות", "שידות ואחסון", "טקסטיל ושטיחים", "תאורה לבית", "צמחייה לעיצוב", "ספות ומערכות ישיבה"].

עליך לענות אך ורק בפורמט JSON תקין על פי המבנה הבא:
{
  "text": "תשובת הייעוץ המקצועית והעיצובית שלך למשתמש בעברית (בפורמט Markdown יפה ועשיר)",
  "refineRequired": true/false,
  "refinementPrompt": "הנחיית השינוי באנגלית עבור מודל ה-AI של עריכת התמונה",
  "suggestedProductCategories": ["תאורה לבית", "טקסטיל ושטיחים"]
}

שמור על טון יוקרתי, חם, תמציתי ומקצועי מאוד המייצג את האיכות והמסורת של חברת ח. סבן חומרי בניין (1994) בע"מ.`;

    // Package conversation parts for Gemini 3.5 Flash
    const parts: any[] = [];
    
    if (originalImage) {
      let base64Part = originalImage;
      let mimeType = "image/jpeg";
      if (originalImage.startsWith("data:")) {
        const partsImg = originalImage.split(",");
        base64Part = partsImg[1];
        const mimeMatch = partsImg[0].match(/:(.*?);/);
        if (mimeMatch) mimeType = mimeMatch[1];
      }
      parts.push({
        text: "Original Room Photo for context:"
      });
      parts.push({
        inlineData: { data: base64Part, mimeType }
      });
    }

    if (redesignedImage && redesignedImage.startsWith("data:")) {
      let base64PartRedesign = redesignedImage;
      let mimeTypeRedesign = "image/jpeg";
      const partsImg = redesignedImage.split(",");
      base64PartRedesign = partsImg[1];
      const mimeMatch = partsImg[0].match(/:(.*?);/);
      if (mimeMatch) mimeTypeRedesign = mimeMatch[1];
      parts.push({
        text: "Current AI-Redesigned Room Photo for context:"
      });
      parts.push({
        inlineData: { data: base64PartRedesign, mimeType: mimeTypeRedesign }
      });
    }

    // Add conversation history
    const conversationHistoryText = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join("\n");
    parts.push({
      text: `Conversation History:\n${conversationHistoryText}\n\nLatest user query to answer: "${userMessage}"`
    });

    console.log(`Sending chat analysis to Gemini... Current Style: ${currentStyle}`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Your conversational advice and response to user query in markdown format in Hebrew." },
            refineRequired: { type: Type.BOOLEAN, description: "True if user requests a visual makeover/style/furniture modification to the image." },
            refinementPrompt: { type: Type.STRING, description: "The refined prompt in English to pass to the image-editing model if refineRequired is true." },
            suggestedProductCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of recommended product categories in Hebrew to show shoppable links for."
            }
          },
          required: ["text", "refineRequired", "refinementPrompt"]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    const parsedResult = JSON.parse(resultText);

    // Filter products based on suggested categories
    const categories: string[] = parsedResult.suggestedProductCategories || [];
    let shoppableItems = getRelatedProducts([currentStyle || "", ...categories]);
    if (shoppableItems.length === 0) {
      shoppableItems = getRelatedProducts([currentStyle || ""]);
    }

    return res.json({
      success: true,
      text: parsedResult.text,
      refineRequired: parsedResult.refineRequired,
      refinementPrompt: parsedResult.refinementPrompt,
      shoppableItems: shoppableItems
    });

  } catch (error: any) {
    console.error("Error in AI Interior Design chat:", error);
    return res.json({
      success: false,
      error: error.message || "Failed to process chat with Gemini.",
      text: "אני מתנצל, נתקלתי בקושי קל בעיבוד הבקשה עם שרתי ה-AI שלנו. אשמח להמשיך להציע לכם פתרונות עיצוב מעולים וחומרי גמר איכותיים ישירות מחנות ח. סבן חומרי בניין. מה תרצו לעצב כעת?",
      refineRequired: false,
      shoppableItems: getRelatedProducts([currentStyle || ""])
    });
  }
});

// Vite middleware setup
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
