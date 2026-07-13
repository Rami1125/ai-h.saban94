import React, { useState, useEffect } from 'react';
import CompareSlider from './components/CompareSlider';
import StyleSelector from './components/StyleSelector';
import PresetSelector from './components/PresetSelector';
import ImageUploader from './components/ImageUploader';
import ChatInterface from './components/ChatInterface';
import { ROOM_PRESETS, STYLE_PRESETS } from './presets';
import { RoomPreset, StylePreset, ChatMessage, ShoppableItem } from './types';
import { Sparkles, Palette, RefreshCw, Layers, ShoppingBag, Eye, HelpCircle, Flame, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function App() {
  // Preset & style selection state
  const [selectedRoom, setSelectedRoom] = useState<RoomPreset>(ROOM_PRESETS[0]);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);

  // Active visualized sources
  const [originalSrc, setOriginalSrc] = useState<string>(ROOM_PRESETS[0].originalUrl);
  const [redesignedSrc, setRedesignedSrc] = useState<string>(ROOM_PRESETS[0].styles[STYLE_PRESETS[0].id]);

  // Redesign state managers
  const [isRedesigning, setIsRedesigning] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Chat interface state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);
  const [refinePromptAvailable, setRefinePromptAvailable] = useState<string | null>(null);

  // Toasts / Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Auto trigger toast dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Synchronize sources when selected room preset or style preset changes (for standard non-custom flow)
  useEffect(() => {
    if (!customImage) {
      setOriginalSrc(selectedRoom.originalUrl);
      const styledImg = selectedRoom.styles[selectedStyle.id] || selectedRoom.originalUrl;
      setRedesignedSrc(styledImg);
      setIsDemoMode(true);
      setGenerationError(null);
    }
  }, [selectedRoom, selectedStyle, customImage]);

  // Handle preset room change
  const handleSelectRoom = (room: RoomPreset) => {
    setCustomImage(null); // Clear uploaded image
    setSelectedRoom(room);
    setToast({
      type: 'info',
      text: `נטען חדר מוכן מראש: ${room.name}. נסו לגרור את ידית ההשוואה!`
    });
  };

  // Handle uploaded room image
  const handleImageUploaded = (base64Data: string) => {
    setCustomImage(base64Data);
    setOriginalSrc(base64Data);
    // Clear current redesigned source or show standard style Unsplash as placeholder until they click Generate!
    setRedesignedSrc(selectedStyle.unsplashUrl);
    setIsDemoMode(true);
    setToast({
      type: 'success',
      text: "תמונת החדר הועלתה בהצלחה! בחרו סגנון עיצוב למעלה ולחצו 'חולל מהפך AI'."
    });
  };

  // Clear custom upload and revert to standard room
  const handleClearCustomImage = () => {
    setCustomImage(null);
    setSelectedRoom(ROOM_PRESETS[0]);
    setOriginalSrc(ROOM_PRESETS[0].originalUrl);
    setRedesignedSrc(ROOM_PRESETS[0].styles[selectedStyle.id]);
    setIsDemoMode(true);
    setToast({
      type: 'info',
      text: "חזרנו לקולקציית החדרים המוכנים מראש."
    });
  };

  // ⚡ Run visual redesign (Express Backend to Gemini SDK)
  const handleGenerateRedesign = async (refinementPrompt?: string) => {
    setIsRedesigning(true);
    setGenerationError(null);
    
    setToast({
      type: 'info',
      text: refinementPrompt 
        ? "מתחבר ל-Gemini Vision... מעבד את סגנון החדר החדש." 
        : `מייצר עיצוב חדש בסגנון ${selectedStyle.name}...`
    });

    try {
      const requestPayload = {
        image: originalSrc,
        styleId: selectedStyle.id,
        styleName: selectedStyle.name,
        prompt: refinementPrompt || `A complete interior design makeover in ${selectedStyle.name} style. Clean, pristine, luxurious layout.`
      };

      const response = await fetch('/api/redesign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      const data = await response.json();

      if (data.success) {
        if (data.isDemoMode) {
          // If server is in Demo Mode (e.g. no Gemini API Key defined), set standard mockup style and notify user
          if (customImage) {
            // For custom image, fall back to standard design style representation
            setRedesignedSrc(selectedStyle.unsplashUrl);
          } else {
            setRedesignedSrc(selectedRoom.styles[selectedStyle.id]);
          }
          setIsDemoMode(true);
          setToast({
            type: 'info',
            text: "האפליקציה פועלת במצב הדמיה. הגדירו מפתח GEMINI_API_KEY ב-Secrets לקבלת עדכוני AI בזמן אמת!"
          });
        } else {
          // Real live image successfully generated!
          setRedesignedSrc(data.imageUrl);
          setIsDemoMode(false);
          setToast({
            type: 'success',
            text: refinementPrompt ? "עדכון ה-AI הושלם בהצלחה!" : "מהפך ה-AI בוצע בהצלחה!"
          });

          // Inject products if returned by generation
          if (data.products && data.products.length > 0) {
            const botMessage: ChatMessage = {
              id: `refine_msg_${Date.now()}`,
              sender: 'assistant',
              text: refinementPrompt 
                ? `עדכנתי את הדמיית החדר לפי בקשתך: **"${refinementPrompt}"**. להלן פריטי העיצוב החדשים התואמים לעדכון זה!`
                : `עיצבתי מחדש את החלל שלך בסגנון **${selectedStyle.name}**! להלן הפריטים המרכזיים המוצגים במהפך זה.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              products: data.products
            };
            setChatMessages(prev => [...prev, botMessage]);
          }
        }
      } else {
        throw new Error(data.error || "Failed to render redesign image");
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "שגיאה בלתי צפויה התרחשה במהלך עיבוד התמונה.");
      setToast({
        type: 'error',
        text: "יצירת ה-AI נכשלה. מציג הדמיית סגנון חלופית."
      });
      // Fallback display
      if (customImage) {
        setRedesignedSrc(selectedStyle.unsplashUrl);
      } else {
        setRedesignedSrc(selectedRoom.styles[selectedStyle.id]);
      }
      setIsDemoMode(true);
    } finally {
      setIsRedesigning(false);
    }
  };

  // 💬 Chat conversation flow
  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user_msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsChatTyping(true);

    try {
      const payload = {
        messages: [...chatMessages, userMsg],
        currentStyle: selectedStyle.name,
        roomDescription: customImage ? "User uploaded custom room photo" : selectedRoom.description,
        originalImage: originalSrc,
        redesignedImage: redesignedSrc
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `bot_msg_${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          products: data.shoppableItems
        };

        setChatMessages(prev => [...prev, assistantMsg]);

        // If the AI flagged a visual update request, show the refinement button banner
        if (data.refineRequired && data.refinementPrompt) {
          setRefinePromptAvailable(data.refinementPrompt);
        } else {
          setRefinePromptAvailable(null);
        }
      } else {
        throw new Error(data.error || "Failed to get chat response");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err_msg_${Date.now()}`,
        sender: 'assistant',
        text: `אני כאן כדי לעזור לכם במסע העיצוב! נתקלתי בקושי קל בעיבוד הבקשה, אך באופן כללי, עבור סגנון **${selectedStyle.name}**, מומלץ להתמקד בקווים נקיים, ריהוט בגוונים בהירים ושילוב שטיח ניגודי להגדרת החלל. ספרו לי אילו שאלות נוספות יש לכם על הסגנון.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Apply the dynamic visual refinement requested inside chat
  const handleRefineVisuals = async (prompt: string) => {
    setRefinePromptAvailable(null); // Clear banner
    await handleGenerateRedesign(prompt);
  };

  return (
    <div className="min-h-screen bg-[#0f1012] text-gray-100 font-sans selection:bg-amber-500 selection:text-black transition-colors duration-300" dir="rtl">
      
      {/* Premium Header Nav with Saban Logo & Brand */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-8 bg-[#16171a] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Stylized Saban Logo */}
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center font-black text-black text-sm shadow-md ml-1">
            סבן
          </div>
          <div className="text-right">
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              ח. סבן AI <span className="text-amber-500/80">עיצוב פנים</span>
            </h1>
            <span className="text-[9px] text-gray-400 font-semibold tracking-wider mt-0.5 block">
              חומרי בניין (1994) בע"מ
            </span>
          </div>
        </div>
        
        <div className="flex gap-6 text-xs font-semibold text-gray-400 hidden md:flex">
          <span className="text-white border-b-2 border-amber-500 pb-2 cursor-pointer">עיצוב מחדש</span>
          <span className="hover:text-white cursor-pointer transition-colors pb-2">לוחות השראה</span>
          <span className="hover:text-white cursor-pointer transition-colors pb-2">היסטוריית פרויקטים</span>
        </div>

        <div className="flex items-center gap-3">
          {isDemoMode ? (
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
              <Info className="w-3.5 h-3.5" /> מצב הדמיה (תיק עבודות)
            </span>
          ) : (
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5 shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> מצב AI חי פעיל
            </span>
          )}
          <button 
            onClick={() => {
              alert("עיצוב החדר ורשימת האביזרים מחנות ח. סבן מוכנים לייצוא!");
            }}
            className="bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full text-[11px] border border-white/10 transition-colors cursor-pointer text-white font-medium"
          >
            ייצוא עיצוב
          </button>
        </div>
      </header>

      {/* Main Studio Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Toast Alerts Container */}
        {toast && (
          <div id="toast-notification" className="fixed top-20 left-6 z-50 animate-fade-in max-w-sm" dir="rtl">
            <div className={`p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-3 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : toast.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-neutral-900 text-white border-neutral-700/50'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-1" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 ml-1" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-neutral-300 flex-shrink-0 ml-1" />}
              <p className="text-xs font-semibold leading-relaxed text-right">{toast.text}</p>
            </div>
          </div>
        )}

        {/* Outer Bento Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* RIGHT PANEL (In RTL this is visually first on the right): Interactive Visualizer & Styling Carousels */}
          {/* We will swap the columns so they look awesome: 1-7 for Canvas (on the right) and 8-12 for Chat (on the left) */}
          <div className="lg:col-span-7 space-y-6 text-right order-1 lg:order-2">
            
            {/* Visualizer Compare Slider & Progress indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="text-right">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    קנבס שינוי ומהפך סגנונות
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    גררו את הידית המרכזית כדי לראות את החלל לפני ואחרי העיצוב.
                  </p>
                </div>

                {customImage && (
                  <button
                    onClick={() => handleGenerateRedesign()}
                    disabled={isRedesigning}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-white/5 text-black disabled:text-gray-500 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer border-none"
                  >
                    {isRedesigning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin ml-1" /> מייצר הדמיה...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-black ml-1" /> חולל מהפך AI
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Compare Slider Box */}
              <div className="relative">
                <CompareSlider
                  originalSrc={originalSrc}
                  redesignedSrc={redesignedSrc}
                  originalLabel={customImage ? "חדר מקורי" : `חלל בסיס: ${selectedRoom.name}`}
                  redesignedLabel={`גרסת ${selectedStyle.name}`}
                />

                {/* Redesign Progress Overlay */}
                {isRedesigning && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 z-30 animate-fade-in text-center space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                      <Palette className="w-6 h-6 text-amber-500 absolute animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-white">סטודיו מהפך ועיצוב פנים AI - ח. סבן</h3>
                      <p className="text-xs text-neutral-300">מעריך תאורה, נפחי צבע וטקסטורות...</p>
                      <p className="text-[10px] text-neutral-400 italic">התהליך ייקח כ-3 עד 5 שניות בלבד.</p>
                    </div>
                  </div>
                )}
              </div>

              {generationError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start gap-2 text-right">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 ml-2" />
                  <div>
                    <strong className="font-bold">אזהרת עיבוד: </strong>
                    {generationError}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Uploads & Presets Panel */}
            <div className="bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-5 shadow-2xl text-right">
              <PresetSelector
                selectedRoomId={selectedRoom.id}
                onSelectRoom={handleSelectRoom}
              />

              <div className="border-t border-white/5 pt-4">
                <ImageUploader
                  onImageUploaded={handleImageUploaded}
                  onClearImage={handleClearCustomImage}
                  currentImage={customImage}
                />
              </div>
            </div>

            {/* Style Selector Carousel */}
            <div className="bg-[#16171a] border border-white/10 rounded-2xl p-5 shadow-2xl text-right">
              <StyleSelector
                selectedStyleId={selectedStyle.id}
                onSelectStyle={(style) => {
                  setSelectedStyle(style);
                  setToast({
                    type: 'info',
                    text: `הסגנון הנבחר הוחלף ל: ${style.name}`
                  });
                }}
              />
            </div>

          </div>

          {/* LEFT PANEL (In RTL this is visually second on the left): Context-Aware Design Chat */}
          <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={handleSendChatMessage}
              isTyping={isChatTyping}
              currentStyle={selectedStyle.name}
              onRefineVisuals={handleRefineVisuals}
              refineLoading={isRedesigning}
              refinePromptAvailable={refinePromptAvailable}
              onClearRefinePrompt={() => setRefinePromptAvailable(null)}
            />
          </div>

        </div>
      </main>

      {/* Decorative Minimal Footer */}
      <footer className="border-t border-white/10 py-8 bg-[#16171a] mt-16 text-center text-xs text-gray-500">
        <p>© 2026 ח. סבן חומרי בניין (1994) בע"מ. בשיתוף טכנולוגיית Gemini 3.5 Flash ויועץ AI מתקדם לבית.</p>
      </footer>

    </div>
  );
}
