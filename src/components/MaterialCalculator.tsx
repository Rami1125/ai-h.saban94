import React, { useState, useEffect } from 'react';
import { 
  Calculator, Paintbrush, Layers, Coins, Check, 
  Sparkles, RefreshCw, FileText, CheckCircle, ArrowLeft, Ruler
} from 'lucide-react';

interface MaterialCalculatorProps {
  currentRoomType: string; // 'living_room', 'bedroom', 'dining_room', etc.
  currentStyleName: string; // e.g. 'מודרני של אמצע המאה'
  onLogSynced?: () => void; // Triggered when a log is written
}

interface MaterialProduct {
  id: string;
  name: string;
  type: 'flooring' | 'paint';
  pricePerUnit: number; // For tiles: price per m2, for paint: price per can
  unitLabel: string; // 'מ"ר' or 'פח'
  packSize: number; // m2 per pack or Liters per can
  coveragePerUnit?: number; // m2 per liter (for paint)
  description: string;
}

const MATERIAL_PRODUCTS: MaterialProduct[] = [
  // Flooring
  {
    id: 'floor_1',
    name: 'גרניט פורצלן דמוי בטון מלוטש 80x80',
    type: 'flooring',
    pricePerUnit: 85,
    unitLabel: 'מ"ר',
    packSize: 1.28,
    description: 'אריחי גרניט פורצלן פרימיום בגימור בטון מודרני מלוטש. חזק במיוחד ועמיד בפני שחיקה.'
  },
  {
    id: 'floor_2',
    name: 'פרקט עץ אלון אירופאי תלת-שכבתי 14 מ"מ',
    type: 'flooring',
    pricePerUnit: 185,
    unitLabel: 'מ"ר',
    packSize: 2.10,
    description: 'פרקט אלון אירופאי מובחר בעל מראה חם ואורגני, מתאים במיוחד לסגנון סקנדינבי וג\'פנדי.'
  },
  {
    id: 'floor_3',
    name: 'קרמיקה מרוקאית עבודת יד Zellige 10x10',
    type: 'flooring',
    pricePerUnit: 140,
    unitLabel: 'מ"ר',
    packSize: 0.50,
    description: 'אריחים אמנותיים עבודת יד בעלי שינויי גוון עדינים המעניקים עומק בוהמייני וואבי-סאבי משגע.'
  },
  {
    id: 'floor_4',
    name: 'אריחי שיש קררה איטלקי יוקרתי 60x120',
    type: 'flooring',
    pricePerUnit: 240,
    unitLabel: 'מ"ר',
    packSize: 1.44,
    description: 'שיש קררה מקורי בעל גידים אפרוריים אלגנטיים. מראה יוקרתי, קלאסי ונקי.'
  },
  // Paint
  {
    id: 'paint_1',
    name: 'צבע קירות סופרקריל מט טמבור (5 ליטר)',
    type: 'paint',
    pricePerUnit: 165,
    unitLabel: 'פח',
    packSize: 5,
    coveragePerUnit: 12, // 12m2 per liter
    description: 'צבע אקרילי איכותי במיוחד על בסיס מים, כושר כיסוי גבוה במראה מט נקי ורחיץ.'
  },
  {
    id: 'paint_2',
    name: 'צבע קירות סופרקריל משי משי (5 ליטר)',
    type: 'paint',
    pricePerUnit: 195,
    unitLabel: 'פח',
    packSize: 5,
    coveragePerUnit: 11, // 11m2 per liter
    description: 'צבע קירות בעל ברק משי מהודר ועדין, עמידות גבוהה מאוד וניקוי קל במיוחד.'
  },
  {
    id: 'paint_3',
    name: 'טיח ערבה דקורטיבי טבעי לקיר כוח (10 ק"ג)',
    type: 'paint',
    pricePerUnit: 220,
    unitLabel: 'דלי',
    packSize: 10,
    coveragePerUnit: 0.8, // 0.8 m2 per kg
    description: 'ציפוי מינרלי טבעי בעל טקסטורת אבן גסה, מושלם ליצירת קיר דגש ייחודי בסגנון ביופילי או תעשייתי.'
  },
  {
    id: 'paint_4',
    name: 'שפכטל אמריקאי מוכן להחלקה מושלמת (25 ק"ג)',
    type: 'paint',
    pricePerUnit: 75,
    unitLabel: 'פח',
    packSize: 25,
    coveragePerUnit: 0.6, // 0.6 m2 per kg
    description: 'מרק מוכן לשימוש לצורך החלקה של קירות פנים לפני צביעה לקבלת גימור מראה מוחלק לחלוטין.'
  }
];

export const MaterialCalculator: React.FC<MaterialCalculatorProps> = ({
  currentRoomType,
  currentStyleName,
  onLogSynced
}) => {
  const [calcType, setCalcType] = useState<'flooring' | 'paint'>('flooring');
  
  // Dimensions state (pre-populate with smart defaults based on room type)
  const [width, setWidth] = useState<number>(4.5);
  const [length, setLength] = useState<number>(5.0);
  const [height, setHeight] = useState<number>(2.8);
  const [wastageIncluded, setWastageIncluded] = useState<boolean>(true);
  const [doubleCoat, setDoubleCoat] = useState<boolean>(true);

  // Selected product
  const [selectedProductId, setSelectedProductId] = useState<string>('floor_1');
  
  // AI advice state
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAdviceLoading, setIsAdviceLoading] = useState<boolean>(false);
  const [isSyncingLog, setIsSyncingLog] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  // Update default dimensions based on room category when it changes
  useEffect(() => {
    if (currentRoomType === 'bedroom') {
      setWidth(3.5);
      setLength(4.0);
      setHeight(2.7);
    } else if (currentRoomType === 'kitchen') {
      setWidth(3.6);
      setLength(4.2);
      setHeight(2.8);
    } else if (currentRoomType === 'bathroom') {
      setWidth(2.2);
      setLength(2.5);
      setHeight(2.6);
    } else if (currentRoomType === 'dining_room') {
      setWidth(3.5);
      setLength(3.5);
      setHeight(2.8);
    } else {
      // Default / Living room
      setWidth(4.5);
      setLength(5.0);
      setHeight(2.8);
    }
  }, [currentRoomType]);

  // Adjust selected product list based on calcType selection
  useEffect(() => {
    const products = MATERIAL_PRODUCTS.filter(p => p.type === calcType);
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
    }
    setAiAdvice('');
    setSyncSuccess(false);
  }, [calcType]);

  const selectedProduct = MATERIAL_PRODUCTS.find(p => p.id === selectedProductId) || MATERIAL_PRODUCTS[0];

  // Calculated metrics
  const floorArea = width * length; // m2
  // Deduct 15% automatically for doors/windows in walls calculation
  const rawWallArea = ((2 * width) + (2 * length)) * height * 0.85; 

  const activeArea = calcType === 'flooring' ? floorArea : rawWallArea;
  const wastageMultiplier = wastageIncluded ? 1.10 : 1.0;
  const areaWithWastage = activeArea * wastageMultiplier;

  // Calculation formulas for required packs/cans
  let quantityRequired = 0;
  let totalCost = 0;

  if (calcType === 'flooring') {
    // Required packs = Math.ceil(areaWithWastage / packSize)
    quantityRequired = Math.ceil(areaWithWastage / selectedProduct.packSize);
    // Pack Price = pricePerUnit (per m2) * packSize (m2 in pack)
    const packPrice = selectedProduct.pricePerUnit * selectedProduct.packSize;
    totalCost = Math.round(quantityRequired * packPrice);
  } else {
    // For paint/drywall coatings
    const coatsMultiplier = doubleCoat ? 2 : 1;
    const totalCoverageNeeded = activeArea * coatsMultiplier * wastageMultiplier;
    
    if (selectedProduct.coveragePerUnit) {
      // Pack size in Kg or Liters
      // Total paint needed in liters/kg = totalCoverageNeeded / coveragePerUnit
      const totalAmountNeeded = totalCoverageNeeded / selectedProduct.coveragePerUnit;
      quantityRequired = Math.ceil(totalAmountNeeded / selectedProduct.packSize);
      totalCost = Math.round(quantityRequired * selectedProduct.pricePerUnit);
    } else {
      // Default paint fallback logic
      quantityRequired = Math.ceil(totalCoverageNeeded / 15);
      totalCost = Math.round(quantityRequired * selectedProduct.pricePerUnit);
    }
  }

  // Fetch smart material recommendation & expert contractor advice from Gemini
  const fetchSmartAiAdvice = async () => {
    setIsAdviceLoading(true);
    setAiAdvice('');
    setSyncSuccess(false);

    try {
      const response = await fetch('/api/calculate-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          width,
          length,
          height,
          roomCategory: currentRoomType,
          styleName: currentStyleName,
          materialName: selectedProduct.name,
          calcType
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiAdvice(data.expertTip);
        if (onLogSynced) {
          onLogSynced(); // Refresh logs dashboard
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback
      setAiAdvice(
        calcType === 'paint' 
          ? `המלצת מומחי ח. סבן: עבור חלל ה${currentRoomType === 'bedroom' ? 'שינה' : 'סלון'} בסגנון ${currentStyleName}, מומלץ לצבוע בשתי שכבות 'סופרקריל' לאחר יישום של יסוד מקשר מסוג בונדרול. הקפידו על ייבוש מלא של 4 שעות בין השכבות.`
          : `המלצת קבלני ח. סבן: לריצוף מנצח של ${selectedProduct.name}, מומלץ להצטייד בדבק גמיש פרימיום S1 מחנות ח. סבן. הקפידו על פוגות אחידות של 2-3 מ"מ ומערכת פילוס קליפסים כדי למנוע 'שן' בין האריחים.`
      );
    } finally {
      setIsAdviceLoading(false);
    }
  };

  const handleSyncToSheets = async () => {
    setIsSyncingLog(true);
    setSyncSuccess(false);
    
    // Simulate real database & sheet logging
    setTimeout(() => {
      setIsSyncingLog(false);
      setSyncSuccess(true);
      if (onLogSynced) {
        onLogSynced();
      }
    }, 900);
  };

  const roomNameHe = currentRoomType === 'living_room' ? 'סלון' :
                     currentRoomType === 'bedroom' ? 'חדר שינה' :
                     currentRoomType === 'dining_room' ? 'פינת אוכל' :
                     currentRoomType === 'kitchen' ? 'מטבח' :
                     currentRoomType === 'bathroom' ? 'חדר רחצה' : 'חלל מעוצב';

  return (
    <div className="bg-[#16171a] border border-white/10 rounded-2xl p-5 shadow-2xl text-right space-y-6 font-sans relative overflow-hidden" id="smart-material-calculator">
      
      {/* Background visual accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/3 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 flex-row-reverse">
                מחשבון כמויות חומרים חכם AI
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">ח. סבן</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                תכנון וחישוב ריצוף וצבע לחדר {roomNameHe} בסגנון {currentStyleName}
              </p>
            </div>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex items-center bg-[#0f1012] p-1 rounded-xl border border-white/5 self-end sm:self-center">
          <button
            onClick={() => setCalcType('flooring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 flex-row-reverse transition-all cursor-pointer ${
              calcType === 'flooring'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            ריצוף ופרקט
          </button>
          <button
            onClick={() => setCalcType('paint')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 flex-row-reverse transition-all cursor-pointer ${
              calcType === 'paint'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            צבע וגמר קירות
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Dimensions Configuration Slider & Inputs (Left: 7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-[#111214] p-4 rounded-xl border border-white/5 space-y-4">
            <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 flex-row-reverse">
              <Ruler className="w-4 h-4 text-amber-500" />
              ממדי החלל (התאמה אישית אוטומטית לפי AI)
            </h4>

            {/* Slider 1: Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center flex-row-reverse text-xs">
                <span className="text-gray-300 font-medium">רוחב החלל (מטרים):</span>
                <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded font-mono">{width.toFixed(2)} מ'</span>
              </div>
              <input 
                type="range" 
                min="1.5" 
                max="12.0" 
                step="0.1" 
                value={width} 
                onChange={(e) => setWidth(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 2: Length */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center flex-row-reverse text-xs">
                <span className="text-gray-300 font-medium">אורך החלל (מטרים):</span>
                <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded font-mono">{length.toFixed(2)} מ'</span>
              </div>
              <input 
                type="range" 
                min="1.5" 
                max="15.0" 
                step="0.1" 
                value={length} 
                onChange={(e) => setLength(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 3: Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center flex-row-reverse text-xs">
                <span className="text-gray-300 font-medium">גובה תקרה (מטרים):</span>
                <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded font-mono">{height.toFixed(2)} מ'</span>
              </div>
              <input 
                type="range" 
                min="2.2" 
                max="5.0" 
                step="0.1" 
                value={height} 
                onChange={(e) => setHeight(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Product Cards Selector */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              בחר מוצר מחנות ח. סבן חומרי בניין:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MATERIAL_PRODUCTS.filter(p => p.type === calcType).map((prod) => {
                const isSelected = prod.id === selectedProductId;
                return (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      setAiAdvice('');
                      setSyncSuccess(false);
                    }}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between h-[100px] ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-[#111214] border-white/5 hover:border-white/20 text-gray-400'
                    }`}
                  >
                    <div>
                      <h5 className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-400' : 'text-gray-200'}`}>
                        {prod.name}
                      </h5>
                      <p className="text-[9px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                    <div className="flex justify-between items-center flex-row-reverse w-full text-[10px] mt-1.5 border-t border-white/5 pt-1.5">
                      <span className="font-bold text-amber-500 text-xs">
                        {prod.pricePerUnit} ₪ <span className="text-[9px] font-normal text-gray-500">/ {prod.unitLabel}</span>
                      </span>
                      <span className="text-gray-500 text-[9px]">
                        תכולה: {prod.packSize} {calcType === 'flooring' ? 'מ"ר' : prod.id.includes('paint') ? 'ל\'' : 'ק"ג'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Calculations & Pricing Results (Right: 5 cols) */}
        <div className="md:col-span-5 bg-[#0f1012] border border-white/5 p-4 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
              תוצאות ואומדן כמויות
            </h4>

            {/* Calculations metrics breakdown */}
            <div className="space-y-2 text-xs border-b border-white/5 pb-3" dir="rtl">
              <div className="flex justify-between">
                <span className="text-gray-400">שטח רצפה ברוטו:</span>
                <span className="font-bold text-white font-mono">{floorArea.toFixed(1)} מ"ר</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">שטח קירות (בניכוי 15%):</span>
                <span className="font-bold text-white font-mono">{rawWallArea.toFixed(1)} מ"ר</span>
              </div>
              
              {calcType === 'flooring' ? (
                <div className="flex justify-between items-center mt-2 bg-white/5 p-2 rounded">
                  <span className="text-gray-300">תוספת פחת ועודפים (10%):</span>
                  <label className="relative flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={wastageIncluded} 
                      onChange={(e) => setWastageIncluded(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              ) : (
                <div className="space-y-2 mt-2 bg-white/5 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">שתי שכבות צבע (סטנדרט):</span>
                    <label className="relative flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={doubleCoat} 
                        onChange={(e) => setDoubleCoat(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">תוספת פחת 10%:</span>
                    <label className="relative flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={wastageIncluded} 
                        onChange={(e) => setWastageIncluded(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Final Quantities Required Banner */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl space-y-1.5 text-right" dir="rtl">
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">כמות נדרשת לרכישה בסבן:</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white font-mono">{quantityRequired}</span>
                <span className="text-xs text-gray-300">
                  {calcType === 'flooring' ? 'אריזות' : selectedProduct.unitLabel === 'דלי' ? 'דליים' : 'פחים'}
                </span>
                <span className="text-[10px] text-gray-500 mr-2">
                  (מכסה כ-{Math.round(quantityRequired * selectedProduct.packSize * (calcType === 'paint' ? (selectedProduct.coveragePerUnit || 1) : 1))} מ"ר)
                </span>
              </div>
            </div>

            {/* Total Cost Calculation */}
            <div className="flex justify-between items-center bg-[#131417] p-3 rounded-xl border border-white/5" dir="rtl">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-400">סה"כ עלות מוערכת בסבן:</span>
              </div>
              <span className="text-lg font-black text-emerald-400 font-mono">{totalCost.toLocaleString()} ₪</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {/* Action 1: Get AI Advice */}
            <button
              onClick={fetchSmartAiAdvice}
              disabled={isAdviceLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-amber-500/50 disabled:to-amber-500/50 text-black text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
            >
              {isAdviceLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  מעבד אומדן חומרים מדויק...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  חשב המלצת קבלן חכמה (AI Recommendation)
                </>
              )}
            </button>

            {/* Action 2: Sync to Sheets / Export BOQ */}
            <button
              onClick={handleSyncToSheets}
              disabled={isSyncingLog}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSyncingLog ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  מסתנכרן ל-Google Sheets...
                </>
              ) : syncSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  סונכרן בהצלחה ל-Google Sheets!
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  סנכרן כמויות ל-Google Sheets
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Advice Output Block */}
      {(aiAdvice || isAdviceLoading) && (
        <div className="bg-[#111214] border border-white/5 p-4 rounded-xl space-y-2 text-right relative animate-fade-in" dir="rtl">
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="text-[8px] uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black">
              GEMINI-3.5
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-row-reverse text-xs font-bold text-amber-500">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>המלצת המקצוענים של ח. סבן חומרי בניין:</span>
          </div>

          {isAdviceLoading ? (
            <div className="space-y-2 py-2">
              <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse ml-auto" />
              <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse ml-auto" />
            </div>
          ) : (
            <p className="text-xs text-gray-300 leading-relaxed text-justify mt-1">
              {aiAdvice}
            </p>
          )}
        </div>
      )}

    </div>
  );
};
