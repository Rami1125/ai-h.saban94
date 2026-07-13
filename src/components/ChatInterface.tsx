import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ShoppableItem } from '../types';
import { Send, Sparkles, ShoppingBag, Eye, User, Brush, ArrowRight, ExternalLink } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  currentStyle: string;
  onRefineVisuals: (prompt: string) => void;
  refineLoading: boolean;
  refinePromptAvailable: string | null;
  onClearRefinePrompt: () => void;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isTyping,
  currentStyle,
  onRefineVisuals,
  refineLoading,
  refinePromptAvailable,
  onClearRefinePrompt
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<ShoppableItem | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div id="chat-interface-panel" className="flex flex-col h-[550px] bg-[#16171a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden" dir="rtl">
      
      {/* Panel Header */}
      <div className="px-4 py-3.5 border-b border-white/10 bg-[#16171a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse ml-1" />
          <div className="text-right">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">יועץ עיצוב AI - ח. סבן</h3>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">סגנון פעיל: {currentStyle}</p>
          </div>
        </div>
        <span className="text-[9px] font-bold tracking-wider uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
          Gemini 3.5 Flash
        </span>
      </div>

      {/* Message History Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Welcome Message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold text-xs flex-shrink-0 ml-1">
            AI
          </div>
          <div className="space-y-1 max-w-[85%] text-right">
            <div className="p-3 bg-white/5 border border-white/5 rounded-tl-xl rounded-bl-xl rounded-br-xl text-xs text-gray-300 leading-relaxed shadow-md">
              <p>ברוכים הבאים לסטודיו המהפך העיצובי האינטראקטיבי של **ח. סבן חומרי בניין**! ✨</p>
              <p className="mt-2">אני יכול לעזור לכם לנתח את פריסת החדר, להציע פריטי ריהוט ועיצוב משלימים מחנות ח. סבן, או לעצב מחדש אלמנטים בחלל.</p>
              <p className="mt-1">נסו לשאול: *"שמור על הפריסה הזו אבל שנה את השטיח לכחול"* או *"אילו גופי תאורה מתאימים לעיצוב סקנדינבי?"*</p>
            </div>
            <span className="text-[9px] text-gray-500 block px-1">עוזר עיצוב דיגיטלי</span>
          </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
              msg.sender === 'user' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-amber-500 text-black'
            } ${msg.sender === 'user' ? 'mr-1' : 'ml-1'}`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : 'AI'}
            </div>

            <div className={`space-y-1 max-w-[82%] ${msg.sender === 'user' ? 'text-right' : 'text-right'}`}>
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-amber-500/10 text-amber-100 border border-amber-500/20 rounded-tr-xl rounded-bl-xl rounded-br-xl text-right whitespace-pre-line'
                  : 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-xl rounded-bl-xl rounded-br-xl text-right whitespace-pre-line'
              }`}>
                {msg.text && (msg.text.trim().startsWith('<') || msg.text.includes('<p>') || msg.text.includes('</div>') || msg.text.includes('</h4>')) ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                  msg.text
                )}

                {/* Inline Refine trigger inside bubble if helper message */}
                {msg.isRefining && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-500 italic">עדכון חזותי בתהליך...</span>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-amber-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[9px] text-gray-500 block px-1">
                {msg.sender === 'user' ? 'אתה' : 'מעצב פנים'} • {msg.timestamp}
              </span>

              {/* Shoppable Products Attachments */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 space-y-2 text-right">
                  <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500 ml-1" /> פריטי עיצוב תואמים מחנות ח. סבן
                  </div>
                  <div className="flex flex-col gap-2">
                    {msg.products.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedProduct(item)}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 p-3 rounded-xl text-right flex items-center gap-3 transition-all group shadow-sm focus:outline-none cursor-pointer w-full"
                      >
                        <div className="w-10 h-10 rounded-md bg-gray-800 overflow-hidden flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                        <div className="flex-1 min-w-0 text-right">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {item.category} • {item.matchPercentage}% התאמה
                          </p>
                        </div>
                        <span className="text-xs font-mono text-amber-500 font-bold whitespace-nowrap">{item.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-xs text-black ml-1">
              AI
            </div>
            <div className="p-3 bg-white/5 border border-white/5 rounded-tl-xl rounded-bl-xl rounded-br-xl text-xs text-gray-400 flex items-center gap-1.5 shadow-md">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
              <span className="text-[10px] text-gray-500 font-medium mr-1">מנתח את אלמנטי העיצוב...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Redesign Refinement Banner (Triggers image generation!) */}
      {refinePromptAvailable && (
        <div id="redesign-refine-banner" className="bg-amber-500/10 border-t border-b border-amber-500/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in" dir="rtl">
          <div className="flex items-start gap-2.5">
            <Brush className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 ml-2" />
            <div className="text-right">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1">
                התבקש עדכון מהפך עיצובי
              </h4>
              <p className="text-[10px] text-gray-400 leading-snug mt-0.5">
                עדכן את הדמיית ה-AI לפי בקשתך: <strong className="text-gray-200">"{refinePromptAvailable}"</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRefineVisuals(refinePromptAvailable);
              }}
              disabled={refineLoading}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-300 text-black text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0 cursor-pointer"
            >
              {refineLoading ? (
                <>
                  <span className="animate-spin h-3 w-3 border-2 border-black border-t-transparent rounded-full ml-1" />
                  מייצר...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 ml-1" />
                  עדכן עיצוב
                </>
              )}
            </button>
            <button 
              onClick={onClearRefinePrompt}
              className="text-[11px] text-gray-400 hover:text-white px-1 py-1 cursor-pointer"
            >
              התעלם
            </button>
          </div>
        </div>
      )}

      {/* Chat Form Entry */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#1e2024] border-t border-white/5 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`תאר שינויים מבוקשים (למשל: ספה אפורה, שטיח כחול)...`}
          className="flex-1 bg-transparent text-xs text-white outline-none px-2 placeholder-gray-500 text-right"
        />
        <button
          type="submit"
          className="w-8 h-8 bg-amber-500 text-black rounded-lg flex items-center justify-center hover:bg-amber-600 transition-colors shadow-lg cursor-pointer flex-shrink-0"
        >
          <Send className="w-4 h-4 transform rotate-180" />
        </button>
      </form>

      {/* Shoppable Item Drawer / Modal */}
      {selectedProduct && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#16171a] border border-white/10 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-right">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 left-4 text-gray-400 hover:text-white rounded-lg p-1 bg-white/5 border border-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-950 border border-white/5 shadow-md">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block">
                {selectedProduct.matchPercentage}% התאמת סגנון
              </span>
              <h3 className="text-sm font-bold text-white pt-1">
                {selectedProduct.name}
              </h3>
              <p className="text-xs text-gray-400">
                קטגוריה: {selectedProduct.category}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div>
                <span className="text-[10px] text-gray-400 block leading-none uppercase tracking-wider">מחיר מוערך</span>
                <span className="text-base font-bold text-amber-500 font-mono mt-1 block">{selectedProduct.price}</span>
              </div>
              <a
                href={selectedProduct.buyUrl}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`תודה רבה! פריט זה זמין לרכישה אונליין או ישירות בסניף ח. סבן חומרי בניין (1994) בע"מ.`);
                  setSelectedProduct(null);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                רכישה מחנות ח. סבן <ExternalLink className="w-3.5 h-3.5 mr-1" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple absolute close SVG fallback
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
