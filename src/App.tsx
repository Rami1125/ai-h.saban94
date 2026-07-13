import React, { useState, useEffect } from 'react';
import CompareSlider from './components/CompareSlider';
import StyleSelector from './components/StyleSelector';
import PresetSelector from './components/PresetSelector';
import ImageUploader from './components/ImageUploader';
import ChatInterface from './components/ChatInterface';
import SmartCamera from './components/SmartCamera';
import AmbientMood from './components/AmbientMood';
import { MaterialCalculator } from './components/MaterialCalculator';
import { ROOM_PRESETS, STYLE_PRESETS } from './presets';
import { RoomPreset, StylePreset, ChatMessage, ShoppableItem } from './types';
import { 
  Sparkles, Palette, RefreshCw, Layers, ShoppingBag, Eye, HelpCircle, 
  Flame, CheckCircle, AlertTriangle, Info, FileText, Database, ShieldCheck, 
  FileSpreadsheet, Key, BookOpen, UploadCloud, HardDrive, ExternalLink,
  Video, Film, ArrowLeft, Share2
} from 'lucide-react';

export default function App() {
  // Tabs Navigation State
  const [activeTab, setActiveTab] = useState<'visualizer' | 'document' | 'rules' | 'dashboard'>('visualizer');
  const [documentSubTab, setDocumentSubTab] = useState<'docs' | 'camera'>('docs');
  
  // System Monitor / Google Sheets Logs State
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [keyRotationStatus, setKeyRotationStatus] = useState<any>(null);

  // Document Analyzer State
  const [docFile, setDocFile] = useState<{ name: string; size: number; type: string; data: string } | null>(null);
  const [docAnalysis, setDocAnalysis] = useState<string>('');
  const [docLoading, setDocLoading] = useState<boolean>(false);
  const [docDriveUrl, setDocDriveUrl] = useState<string | null>(null);

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

  // Room Tour Video State
  const [tourVideoUrl, setTourVideoUrl] = useState<string | null>(null);
  const [isGeneratingTour, setIsGeneratingTour] = useState<boolean>(false);
  const [tourSteps, setTourSteps] = useState<string[]>([]);
  const [activeTourStep, setActiveTourStep] = useState<string>('');

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

  // Fetch status helper for the Google Sheets and Key Rotation dashboard
  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/system-status');
      const data = await response.json();
      if (data.success) {
        setSystemLogs(data.logs);
        setKeyRotationStatus(data.status);
      }
    } catch (err) {
      console.error("Failed to fetch system status:", err);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  // Handle document/image selector for the analysis tab
  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocFile({
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result as string
      });
      setDocAnalysis('');
      setDocDriveUrl(null);
    };
    reader.readAsDataURL(file);
  };

  // Submit file for professional AI audit (saves to simulated Google Drive & logs to Sheets)
  const handleAnalyzeDocument = async () => {
    if (!docFile) return;
    setDocLoading(true);
    setDocAnalysis('');
    
    setToast({
      type: 'info',
      text: 'מתחבר למערכת "ח. סבן AI"... מעלה קובץ ומבצע רוטציית מפתחות.'
    });

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: docFile.name,
          fileSize: docFile.size,
          fileType: docFile.type,
          fileData: docFile.data
        })
      });
      const data = await response.json();
      if (data.success) {
        setDocAnalysis(data.analysisResult);
        setDocDriveUrl(data.driveUrl);
        setToast({
          type: 'success',
          text: 'ניתוח המבנה והגמר הושלם! הקובץ גובה בהצלחה בתיקיית Google Drive.'
        });
        // Refresh our transaction table in real-time
        fetchSystemStatus();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        type: 'error',
        text: 'שגיאה בחיבור למודל ה-AI: ' + (err.message || 'שגיאת רשת')
      });
    } finally {
      setDocLoading(false);
    }
  };

  // Synchronize sources when selected room preset or style preset changes (for standard non-custom flow)
  useEffect(() => {
    if (!customImage) {
      setOriginalSrc(selectedRoom.originalUrl);
      const styledImg = selectedRoom.styles[selectedStyle.id] || selectedRoom.originalUrl;
      setRedesignedSrc(styledImg);
      setIsDemoMode(true);
      setGenerationError(null);
      setTourVideoUrl(null); // Reset room tour when switching presets
    }
  }, [selectedRoom, selectedStyle, customImage]);

  // Handle preset room change
  const handleSelectRoom = (room: RoomPreset) => {
    setCustomImage(null); // Clear uploaded image
    setSelectedRoom(room);
    setTourVideoUrl(null); // Reset room tour
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
    setTourVideoUrl(null); // Reset room tour
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
    setTourVideoUrl(null); // Reset room tour
    setToast({
      type: 'info',
      text: "חזרנו לקולקציית החדרים המוכנים מראש."
    });
  };

  // 🎥 Generate Room Tour video with Veo 3.1
  const handleGenerateTour = async () => {
    setIsGeneratingTour(true);
    const steps = [
      "מנתח את עומק השדה (Depth Map) של התמונה המעוצבת...",
      "מחולל קווי תנועה למצלמה תלת-ממדית (Camera Path Calculation)...",
      "מאתחל את מודל הווידאו Veo 3.1 Lite ליצירת סיור מציאותי...",
      "מעבד 120 פריימים של וידאו באיכות HD עם תאורה דינמית...",
      "מבצע רינדור סופי של הסיור ושומר את קובץ ה-MP4 ל-Google Drive של המשרד."
    ];
    setTourSteps(steps);
    setActiveTourStep(steps[0]);

    setToast({
      type: 'info',
      text: 'מאתחל קריאה ל-Veo 3.1 ומבצע סימולציית תנועה תלת-ממדית...'
    });

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Step 1
      setActiveTourStep(steps[0]);
      await delay(1000);
      
      // Step 2
      setActiveTourStep(steps[1]);
      await delay(1200);

      // Step 3
      setActiveTourStep(steps[2]);
      await delay(1000);

      // Step 4
      setActiveTourStep(steps[3]);
      await delay(1500);

      // Step 5
      setActiveTourStep(steps[4]);

      const response = await fetch('/api/generate-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redesignedSrc: redesignedSrc,
          roomCategory: selectedRoom.category || "living_room",
          styleName: selectedStyle.name,
          styleId: selectedStyle.id
        })
      });

      const data = await response.json();
      await delay(800);

      if (data.success) {
        setTourVideoUrl(data.videoUrl);
        setToast({
          type: 'success',
          text: 'סרטון הסיור התלת-ממדי חולל בהצלחה בעזרת Veo 3.1!'
        });
        // Refresh our transaction table in real-time
        fetchSystemStatus();
      } else {
        throw new Error(data.error || "Failed to generate video tour");
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        type: 'error',
        text: 'שגיאה ביצירת סרטון סיור: ' + (err.message || 'שגיאת רשת')
      });
    } finally {
      setIsGeneratingTour(false);
    }
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
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `היי! תראו את הדמיית עיצוב הפנים החדשה שלי ל${selectedRoom.name} בסגנון ${selectedStyle.name} שחוללתי ב-AI של ח. סבן חומרי בניין! 🎨🏠${
                redesignedSrc && !redesignedSrc.startsWith('data:') ? `\n\nצפו בהדמיה: ${redesignedSrc}` : ''
              }`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba5a] text-black px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
          >
            <Share2 className="w-3.5 h-3.5 text-black" />
            שתפו ב-WhatsApp
          </a>
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

      {/* Tabs Sub-Header */}
      <div className="bg-[#131417] border-b border-white/10 sticky top-14 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-white/10" dir="rtl">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'visualizer'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-4 h-4 ml-1" />
              מהפך עיצובי AI
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'document'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 ml-1" />
              ניתוח מסמכים וקבצים (PDF/תמונות)
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4 ml-1" />
              חוקים ומדריכים לעיצוב פנים
            </button>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                fetchSystemStatus();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-4 h-4 ml-1" />
              לוח מעקב ובקרה (Google Sheets & Keys)
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Toast Alerts Container */}
        {toast && (
          <div id="toast-notification" className="fixed top-28 left-6 z-50 animate-fade-in max-w-sm" dir="rtl">
            <div className={`p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-3 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : toast.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-[#16171a] border-white/10 text-white'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-1" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 ml-1" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-neutral-300 flex-shrink-0 ml-1" />}
              <p className="text-xs font-semibold leading-relaxed text-right">{toast.text}</p>
            </div>
          </div>
        )}

        {/* Tab 1: Interactive AI Visualizer & Chat */}
        {activeTab === 'visualizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* RIGHT PANEL (In RTL this is visually first on the right): Interactive Visualizer & Styling Carousels */}
          {/* We will swap the columns so they look awesome: 1-7 for Canvas (on the right) and 8-12 for Chat (on the left) */}
          <div className="lg:col-span-7 space-y-6 text-right order-1 lg:order-2">
            
            {/* Visualizer Compare Slider & Progress indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="text-right">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 font-sans">
                    קנבס שינוי ומהפך סגנונות
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5 font-sans">
                    {tourVideoUrl ? "צפו בסיור המצלמה התלת-ממדי שחולל בעזרת מודל Veo 3.1 של גוגל." : "גררו את הידית המרכזית כדי לראות את החלל לפני ואחרי העיצוב."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Generate Redesign Button (Only if custom upload exists) */}
                  {customImage && (
                    <button
                      onClick={() => handleGenerateRedesign()}
                      disabled={isRedesigning || isGeneratingTour}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-white/5 text-black disabled:text-gray-500 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer border-none font-sans"
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

                  {/* Generate Room Tour Button */}
                  <button
                    onClick={handleGenerateTour}
                    disabled={isRedesigning || isGeneratingTour}
                    className="bg-[#1c1d21] hover:bg-white/10 disabled:bg-white/5 text-amber-500 hover:text-amber-400 disabled:text-gray-500 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-amber-500/30 font-sans"
                  >
                    {isGeneratingTour ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin ml-1" /> מייצר סיור...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 ml-1" /> סיור וידאו 3D ✨
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Compare Slider or Video Box */}
              <div className="relative">
                {tourVideoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/90 shadow-2xl animate-fade-in">
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-md font-sans">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> סיור 3D מוכן (Veo 3.1)
                      </span>
                    </div>

                    <video 
                      src={tourVideoUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[4/3] object-cover rounded-2xl"
                    />

                    <div className="p-4 bg-[#16171a] border-t border-white/5 flex items-center justify-between" dir="rtl">
                      <div className="text-right">
                        <h4 className="text-xs font-bold text-white font-sans">סיור וידאו תלת-ממדי דינמי</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-sans">מעוף מצלמה רציף בחלל המעוצב בסגנון {selectedStyle.name}</p>
                      </div>
                      <button
                        onClick={() => setTourVideoUrl(null)}
                        className="bg-white/5 hover:bg-white/10 text-white hover:text-amber-500 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 ml-1" /> חזור להשוואת תמונה
                      </button>
                    </div>
                  </div>
                ) : (
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
                          <h3 className="text-sm font-extrabold text-white font-sans">סטודיו מהפך ועיצוב פנים AI - ח. סבן</h3>
                          <p className="text-xs text-neutral-300 font-sans">מעריך תאורה, נפחי צבע וטקסטורות...</p>
                          <p className="text-[10px] text-neutral-400 italic font-sans">התהליך ייקח כ-3 עד 5 שניות בלבד.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Video Generation Progress Overlay */}
                {isGeneratingTour && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 z-30 animate-fade-in text-center space-y-6">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
                      <Video className="w-6 h-6 text-amber-500 absolute animate-pulse" />
                    </div>
                    <div className="space-y-3 max-w-sm">
                      <h3 className="text-sm font-extrabold text-white font-sans">מחולל סיור וידאו 3D (Veo 3.1 Lite)</h3>
                      <div className="bg-[#1c1d21]/90 border border-white/5 rounded-xl p-4 text-right space-y-2">
                        {tourSteps.map((step, idx) => {
                          const isActive = step === activeTourStep;
                          const isDone = tourSteps.indexOf(step) < tourSteps.indexOf(activeTourStep);
                          return (
                            <div key={idx} className="flex items-center justify-between text-[11px] transition-opacity duration-300">
                              <span className={isDone ? 'text-emerald-400 line-through' : isActive ? 'text-amber-400 font-bold' : 'text-gray-500'}>
                                {step}
                              </span>
                              <div className="w-4 h-4 rounded-full flex items-center justify-center ml-2">
                                {isDone ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                ) : isActive ? (
                                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-gray-500 italic font-sans">זמן מעבד משוער: כ-4 שניות בקצב רוטציה מועדף.</p>
                    </div>
                  </div>
                )}
              </div>

              {generationError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start gap-2 text-right">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 ml-2" />
                  <div>
                    <strong className="font-bold font-sans">אזהרת עיבוד: </strong>
                    <span className="font-sans">{generationError}</span>
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

            {/* Ambient Mood and Soundscape Player */}
            <AmbientMood selectedStyle={selectedStyle} />

            {/* Smart Material Quantity Calculator */}
            <MaterialCalculator
              currentRoomType={selectedRoom.category}
              currentStyleName={selectedStyle.name}
              onLogSynced={fetchSystemStatus}
            />

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
        )}

        {/* Tab 2: Document & PDF Analysis Q&A */}
        {activeTab === 'document' && (
          <div className="space-y-6 animate-fade-in" dir="rtl">
            {/* Sub-tab selection */}
            <div className="flex items-center gap-2 bg-[#16171a] p-1 rounded-xl border border-white/10 max-w-xs mr-auto lg:mr-0">
              <button
                onClick={() => setDocumentSubTab('docs')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center font-sans ${
                  documentSubTab === 'docs' 
                    ? 'bg-amber-500 text-black shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                ניתוח מסמכים ודוחות
              </button>
              <button
                onClick={() => setDocumentSubTab('camera')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center font-sans flex items-center justify-center gap-1.5 ${
                  documentSubTab === 'camera' 
                    ? 'bg-amber-500 text-black shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                מצלמת AI חכמה 📸
              </button>
            </div>

            {documentSubTab === 'docs' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right" dir="rtl">
                
                {/* Upload File Panel */}
                <div className="lg:col-span-5 bg-[#16171a] border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-sans">יועץ הנדסה ומסמכים - ח. סבן</h3>
                    <p className="text-xs text-gray-400 mt-1 font-sans">העלו קובץ שרטוט, PDF או תמונת חלל לקבלת פירוט חומרים הנדסי ומענה לשאלות עיצוב מקצועיות.</p>
                  </div>

                  <div className="border border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors relative cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleDocFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-gray-500 group-hover:text-amber-500 transition-colors mb-3" />
                    <span className="text-xs font-bold text-white mb-1 font-sans">לחצו לבחירת קובץ או גררו לכאן</span>
                    <span className="text-[10px] text-gray-400 font-medium font-sans">תומך בתמונות (PNG, JPG) או מסמכי PDF (עד 15MB)</span>
                  </div>

                  {docFile && (
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white truncate max-w-[180px] font-sans">{docFile.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {(docFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDocFile(null);
                          setDocAnalysis('');
                          setDocDriveUrl(null);
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md cursor-pointer font-sans"
                      >
                        הסר
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleAnalyzeDocument}
                    disabled={!docFile || docLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-white/5 text-black disabled:text-gray-500 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer font-sans"
                  >
                    {docLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        מנתח קובץ ומעלה ל-Google Drive...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        נתח מסמך והפק דוח חומרי גמר
                      </>
                    )}
                  </button>

                  {docDriveUrl && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-sans">
                        <CheckCircle className="w-4 h-4" />
                        הקובץ נשמר בהצלחה ב-Google Drive
                      </div>
                      <p className="text-[10px] text-gray-300 font-sans">הקובץ תועד בתיקיית הלקוחות המשותפת של ח. סבן לשימוש סוכן המכירות בסניף.</p>
                      <a
                        href={docDriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 underline pt-1 font-sans"
                      >
                        פתח קובץ מקורי ב-Google Drive <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Analysis Results / Q&A Output */}
                <div className="lg:col-span-7 bg-[#16171a] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col min-h-[450px]">
                  <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-sans">תוצאות ניתוח מסמך וייעוץ חומרים</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-sans">דוח מוצר והמלצות מותאמות לתשתית פנים וחוץ</p>
                    </div>
                    <span className="text-[9px] font-bold tracking-wider uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono">
                      {docFile && (docFile.size > 2.5 * 1024 * 1024 || docFile.name.endsWith('.pdf')) ? 'gemini-1.5-pro (קובץ כבד)' : 'gemini-3.5-flash'}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-1">
                    {docAnalysis ? (
                      <div className="text-gray-300 text-xs leading-relaxed space-y-3 whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5 font-sans text-right" dir="rtl">
                        {docAnalysis}
                      </div>
                    ) : docLoading ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        <div className="space-y-1">
                          <p className="text-xs text-white font-bold font-sans">מעבד את מבנה המסמך...</p>
                          <p className="text-[10px] text-gray-400 font-sans">חולץ מידות חדרים, מעריך כמויות ומחשב סוגי חומרים של טמבור וסיקה</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 space-y-3">
                        <FileText className="w-12 h-12 text-gray-600" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 font-sans">אין דוח פעיל להצגה</p>
                          <p className="text-[11px] text-gray-500 font-sans">העלו שרטוט אדריכלי או תמונה ולחצו 'נתח מסמך' כדי להפיק דוח מוצרים מפורט.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[11px] text-gray-400 font-sans">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> אבטחה בסטנדרט ח. סבן</span>
                    <span>מספר זיהוי פרויקט: {docFile ? `SB-${docFile.name.length * 15}` : 'לא הופק'}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="animate-fade-in text-right" dir="rtl">
                <SmartCamera onSuccess={() => {
                  if (typeof fetchSystemStatus === 'function') {
                    fetchSystemStatus();
                  }
                }} />
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Rules & Guides */}
        {activeTab === 'rules' && (
          <div className="space-y-8 animate-fade-in text-right" dir="rtl">
            
            {/* Page Header */}
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2 font-sans">
                <BookOpen className="w-5 h-5 text-amber-500" />
                מדריכים וכללי אצבע לעיצוב פנים ובנייה - ח. סבן
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-sans">מגוון חוקים מקצועיים והנחיות שיעזרו לכם לתכנן ולעצב את הבית בצורה אופטימלית וחסכונית.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl text-right">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 w-10 h-10 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">תורת הצבעים: חוק 60-30-10</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  זהו החוק הקלאסי לעיצוב פנים שיוצר איזון מושלם בכל חדר:
                  <br /><strong className="text-white">60% צבע שליט:</strong> בדרך כלל צבע הקירות והרצפה (למשל: לבן פנינה, גרייז' עדין).
                  <br /><strong className="text-white">30% צבע משני:</strong> מיועד לרהיטים גדולים, וילונות ושטיחים (כמו כחול עמוק, עץ טבעי).
                  <br /><strong className="text-white">10% צבע דגש (Accent):</strong> לאביזרים, כריות, תמונות ותאורה (למשל פליז מוזהב או חרדל).
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl text-right">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 w-10 h-10 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">מדריך חומרי גבס ובידוד אקוסטי</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  תכנון נכון של מחיצות פנים אקוסטיות בסיוע מוצרי הגבס המתקדמים בסניף ח. סבן:
                  <br /><strong className="text-white">גבס אקוסטי כחול:</strong> מומלץ ביותר לחלוקת חדרים עקב צפיפות גבוהה וכושר הפחתת רעש חסר תקדים.
                  <br /><strong className="text-white">גבס ירוק עמיד מים:</strong> חובה לשימוש בחדרי אמבטיה, שירותים ומטבחים למניעת חדירת לחות.
                  <br /><strong className="text-white">גבס ורוד מעכב בעירה:</strong> מיועד למקומות הדורשים עמידות באש (כמו קיר גבס סביב קמין או מטבח מקצועי).
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl text-right">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 w-10 h-10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">חוקי תאורת אווירה פנימית</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  תאורה נכונה יכולה להגדיל או להקטין חלל חזותית בצורה משמעותית:
                  <br /><strong className="text-white">תאורת משימה:</strong> תאורה ממוקדת וחזקה מעל משטחי עבודה (מטבח, שולחן כתיבה).
                  <br /><strong className="text-white">תאורת אווירה:</strong> מומלץ לשלב לד נסתר (Cove lighting) בנישות גבס ליצירת חמימות.
                  <br /><strong className="text-white">טמפרטורת אור:</strong> בחרו 2700K-3000K (אור חם) לחללי מגורים וחדרי שינה, ו-4000K (אור ניטרלי) לאזורי עבודה ומטבחים.
                </p>
              </div>

            </div>

            {/* Local Materials Catalog Banner */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 text-right">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-400 font-sans">צריכים עזרה בחישוב כמויות חומרים לפרויקט?</h4>
                <p className="text-xs text-gray-300 font-sans">כל מגוון הצבעים של טמבור ונירלט, מוצרי האיטום של סיקה, ומערכות הגבס המובילות מחכים לכם בסניף ח. סבן.</p>
              </div>
              <button 
                onClick={() => alert('מחשב הכמויות הדיגיטלי ישולב בקרוב! בינתיים, צוות ח. סבן זמין לעזור לכם בכל שאלה בסניף.')}
                className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all whitespace-nowrap align-self-start font-sans"
              >
                צור קשר לייעוץ כמויות בסניף
              </button>
            </div>

          </div>
        )}

        {/* Tab 4: System Monitor & Google Sheets Logs */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in text-right" dir="rtl">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2 font-sans">
                  <Database className="w-5 h-5 text-amber-500" />
                  לוח בקרה ומעקב אינטגרציות - ח. סבן AI
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-sans">
                  ניהול רוטציית מפתחות מודל ה-AI, בריאות המערכת, ותיעוד פעולות לקוח בגליון Google Sheets.
                </p>
              </div>
              <button
                onClick={fetchSystemStatus}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start transition-colors font-sans"
              >
                <RefreshCw className="w-3.5 h-3.5 ml-1" />
                רענן נתוני מערכת
              </button>
            </div>

            {/* Key Rotation and Status Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* API Key Rotation Status Panel */}
              <div className="lg:col-span-4 bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 font-sans">
                  <Key className="w-4 h-4 text-amber-500 ml-1" />
                  מצב רוטציית מפתחות AI
                </h3>

                {keyRotationStatus ? (
                  <div className="space-y-3.5 text-xs font-sans">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-gray-400">מפתח פעיל לקריאה הבאה:</span>
                      <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                        {keyRotationStatus.activeKeyLabel || 'מפתח 1'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">סטטוס מפתח 1 (GEMINI_API_KEY_1):</span>
                      <span className={`font-bold ${keyRotationStatus.key1Status === 'פעיל' ? 'text-emerald-400' : 'text-amber-500'}`}>
                        ● {keyRotationStatus.key1Status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">סטטוס מפתח 2 (GEMINI_API_KEY_2):</span>
                      <span className={`font-bold ${keyRotationStatus.key2Status === 'פעיל' ? 'text-emerald-400' : 'text-gray-500'}`}>
                        ● {keyRotationStatus.key2Status}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-1.5">
                      <span className="text-[10px] text-gray-400 font-bold">הגדרת רוטציה:</span>
                      <p className="text-[10px] text-gray-300 leading-snug">המערכת מבצעת רוטציה אוטומטית בין המפתחות למניעת חסימת Rate Limits בקריאות מסמכים ארוכים.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex items-center justify-center text-xs text-gray-500 font-sans">
                    טוען נתוני מפתחות...
                  </div>
                )}
              </div>

              {/* Rotation Logs Terminal Panel */}
              <div className="lg:col-span-8 bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 font-sans">
                  <FileText className="w-4 h-4 text-amber-500 ml-1" />
                  יומני פעילות ורוטציית מפתחות
                </h3>
                <div className="bg-[#101114] border border-white/5 rounded-xl p-3 h-36 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-1.5 scrollbar-thin text-left animate-fade-in" dir="ltr">
                  {keyRotationStatus?.rotationLogs?.map((log: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-amber-500/70">[{index+1}]</span>
                      <span className="text-neutral-300 text-right" dir="rtl">{log}</span>
                    </div>
                  )) || <div className="text-gray-600">No logs captured yet</div>}
                </div>
              </div>

            </div>

            {/* Google Sheets Live Database Log Table */}
            <div className="bg-[#16171a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 font-sans">
                    <FileSpreadsheet className="w-4 h-4 text-amber-500 ml-1" />
                    רישום לקוחות ומסמכים בגליון Google Sheets
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 font-sans">כל העלאה וניתוח AI מתועדים אוטומטית בגליון המעקב המרכזי של ח. סבן.</p>
                </div>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-sans">
                  תיעוד מסד נתונים פעיל
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#121316]">
                <table className="w-full text-right border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                      <th className="p-3 text-right">חותמת זמן</th>
                      <th className="p-3 text-right">שם הקובץ</th>
                      <th className="p-3 text-right">גודל וסוג</th>
                      <th className="p-3 text-right">תיקיית Google Drive</th>
                      <th className="p-3 text-right">מפתח AI</th>
                      <th className="p-3 text-right">מודל</th>
                      <th className="p-3 text-right">תוצאת ניתוח</th>
                      <th className="p-3 text-right">סטטוס</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {systemLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors text-gray-300">
                        <td className="p-3 text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3 font-bold text-white max-w-[150px] truncate">{log.fileName}</td>
                        <td className="p-3 text-gray-400 whitespace-nowrap">
                          {log.fileSize} • {log.fileType}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono text-[10px]">
                          <a
                            href={log.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-500 hover:underline flex items-center gap-1"
                          >
                            <HardDrive className="w-3.5 h-3.5" /> drive_link
                          </a>
                        </td>
                        <td className="p-3 text-[10px] font-mono text-gray-400">{log.apiKeyUsed}</td>
                        <td className="p-3 font-mono text-[10px] text-amber-400">{log.modelUsed}</td>
                        <td className="p-3 max-w-[200px] truncate text-gray-400" title={log.analysisResult}>
                          {log.analysisResult}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {log.status === 'success' ? 'הושלם' : 'שגיאה'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {systemLogs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-500 font-bold">
                          אין יומני רישום להצגה. העלו מסמכים כדי ליצור פעילות חדשה.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Decorative Minimal Footer */}
      <footer className="border-t border-white/10 py-8 bg-[#16171a] mt-16 text-center text-xs text-gray-500">
        <p>© 2026 ח. סבן חומרי בניין (1994) בע"מ. בשיתוף טכנולוגיית Gemini 3.5 Flash ויועץ AI מתקדם לבית.</p>
      </footer>

    </div>
  );
}
