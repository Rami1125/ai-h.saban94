import React, { useState, useEffect, useRef } from 'react';
import { Palette, Calculator, Download, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Product Type matching Zara-like minimalist catalog
interface PremiumProduct {
  id: string;
  name: string;
  brand: 'Sika' | 'טמבור' | 'נירלט' | 'תרמוקיר' | 'אורבונד' | 'מיסטר פיקס';
  category: string;
  description: string;
  imageUrl: string;
}

// Chat Message Type
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  image?: string; // Optional attached base64 image
  timestamp: string;
}

// Sample templates for testing AI on specific cases
interface QueryPreset {
  title: string;
  subtitle: string;
  queryText: string;
  imagePlaceholder: string; // Base64 or Unsplash representation
}

const PREMIUM_CATALOG: PremiumProduct[] = [
  {
    id: 'sika-11fc',
    name: 'סיקפלקס 11FC',
    brand: 'Sika',
    category: 'איטום והדבקה אלסטית',
    description: 'חומר איטום והדבקה פוליאוריטני רב-תכליתי ומהיר לעבודה יומיומית.',
    imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'tambour-supercryl',
    name: 'סופרקריל קלין',
    brand: 'טמבור',
    category: 'צבעי קירות פנים',
    description: 'צבע אקרילי פרימיום רחיץ במיוחד בגוון לבן מט מהודר.',
    imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'mrfix-s1',
    name: 'דבק קרמיקה פרימיום S1',
    brand: 'מיסטר פיקס',
    category: 'הדבקת אריחים וחיפויים',
    description: 'דבק גמיש במיוחד בעל עמידות גבוהה להדבקת אריחי ענק בבטחה.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'orbond-blue',
    name: 'גבס אקוסטי כחול',
    brand: 'אורבונד',
    category: 'לוחות גבס ומחיצות',
    description: 'לוח גבס משופר אקוסטית לבידוד רעשים מקסימלי בין חללים.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'nirlat-ext',
    name: 'שליכט צבעוני אקרילי',
    brand: 'נירלט',
    category: 'ציפויים וגמר חיצוני',
    description: 'ציפוי דקורטיבי גמיש במיוחד לאיטום והגנה על קירות חיצוניים.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'thermokir-770',
    name: 'תרמוקיר 770',
    brand: 'תרמוקיר',
    category: 'טיח ובידוד תרמי',
    description: 'טיח תרמי מתקדמת לחיסכון באנרגיה ובידוד מושלם של קירות פנים וחוץ.',
    imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80'
  }
];

const QUERY_PRESETS: QueryPreset[] = [
  {
    title: 'סדק קונסטרוקטיבי',
    subtitle: 'בקיר בטון חשוף',
    queryText: 'יש לי סדק עמוק בקיר בטון חיצוני עם ברזל זיון חלוד שנחשף. מה הפתרון?',
    imagePlaceholder: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'רטיבות בחדר רחצה',
    subtitle: 'כשל באיטום הרצפה',
    queryText: 'יש לי רטיבות קשה בחיבורים בין הריצוף לחיפוי הקיר במקלחון. המים מחלחלים החוצה.',
    imagePlaceholder: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'חידוש שליכט חיצוני',
    subtitle: 'למראה מודרני מוגן',
    queryText: 'השליכט החיצוני של הבית ישן, סדוק ומלוכלך. איך מחדשים אותו למראה מודרני ואטום?',
    imagePlaceholder: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'תוכנית עבודה פנימית',
    subtitle: 'מחיצות אקוסטיות בגבס',
    queryText: 'אני רוצה לבנות מחיצות פנים בין חדרים שייתנו בידוד אקוסטי חזק של מעל 50 דציבל. מה מומלץ?',
    imagePlaceholder: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
  }
];

interface ColorShade {
  code: string;
  name: string;
  hex: string;
  deck: 'טמבור' | 'נירלט';
  description: string;
  fanDeck: string;
}

const PREMIUM_COLOR_SHADES: ColorShade[] = [
  // Tambour
  { code: 'OW211', name: 'לבן פנינה / Pearl', hex: '#F3EFE9', deck: 'טמבור', description: 'גוון רך קלאסי המעניק חמימות ויוקרה לחללי פנים.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  { code: 'OW221', name: 'שמנת מלטפת / Cream', hex: '#F2EADC', deck: 'טמבור', description: 'גוון קטיפתי עשיר, מושלם לשילוב עם תאורה חמה וריהוט עץ.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  { code: 'OW124', name: 'אפור אורבני / Urban Gray', hex: '#D6D6D2', deck: 'טמבור', description: 'אפור ניטרלי מתוחכם המעניק מראה מודרני ותעשייתי מעודן.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  { code: 'OW153', name: 'ירוק מרווה / Velvet Sage', hex: '#D2D7CD', deck: 'טמבור', description: 'גוון טבעי מרגיע, יוצר חיבור פראי עם חלונות וצמחייה.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  { code: 'IS0452', name: 'חול מדברי / Desert Sand', hex: '#DFCFB7', deck: 'טמבור', description: 'חול חמים וטבעי המעניק תחושת מרחב ארצית ומזמינה.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  { code: 'OW212', name: 'לבן שמנת מודרני / Modern Off-White', hex: '#f4f0e6', deck: 'טמבור', description: 'לבן שבור מעודן עם נגיעה חמה ועכשווית, מתאים במיוחד לחללי סלון ואירוח.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  { code: 'OW201', name: 'לבן שלג פרימיום / Snow White', hex: '#fcfbfa', deck: 'טמבור', description: 'לבן בוהק ונקי, מעצים את האור הטבעי ויוצר מראה חללי רחב וטהור.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  { code: '0005P', name: 'בז׳ קלוע / Woven Beige', hex: '#ebdcc5', deck: 'טמבור', description: 'גוון בז׳ חמים וטבעי המשרה שלווה ביתית ומשתלב באופן מרהיב עם טקסטורות גסות.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  { code: '1534P', name: 'כחול רויאל עמוק / Royal Blue', hex: '#273a52', deck: 'טמבור', description: 'כחול עשיר ומלכותי המתאים לקירות מוקד ומוסיף עומק ואינטלקטואליות לחלל.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  { code: '0873P', name: 'ירוק יער צפוני / Forest Green', hex: '#3e4d41', deck: 'טמבור', description: 'ירוק מעושן המזכיר יערות אורנים, יוצר אווירה אלגנטית, שקטה ונקייה.', fanDeck: 'מניפת טמבור ספקטרום (Tambour Spectrum)' },
  
  // Nirlat
  { code: 'N088', name: 'ספארי מדברי / Safari', hex: '#E5D5BE', deck: 'נירלט', description: 'גוון חולי אופנתי בעל נוכחות חמה, מדמה דיונות ונוף מדברי.', fanDeck: 'מניפת נירלט קולורס (Nirlat Colors)' },
  { code: 'N112', name: 'אבן קיסר / Caesar Stone', hex: '#DED5C6', deck: 'נירלט', description: 'צבע אבן אלגנטי המדגיש חומרים טבעיים ומשתלב נפלא עם בטון.', fanDeck: 'מניפת נירלט קולורס (Nirlat Colors)' },
  { code: 'N190', name: 'גרפיט פרימיום / Graphite', hex: '#4E4E50', deck: 'נירלט', description: 'אפור פחם עמוק ליצירת קירות כוח מודרניים ודרמטיים.', fanDeck: 'מניפת נירלט אקסטרה (Nirlat Extra)' },
  { code: 'N154', name: 'כחול אטלייה / Atelier Blue', hex: '#3A4A51', deck: 'נירלט', description: 'כחול מעושן יוקרתי המעניק עומק ואווירה יצירתית ואריסטוקרטית.', fanDeck: 'מניפת נירלט אקסטרה (Nirlat Extra)' },
  { code: 'N0552', name: 'חימר חופי / Coastal Clay', hex: '#C8B29E', deck: 'נירלט', description: 'גוון אדמה חרסיתי מרוכך המשרה חמימות ים תיכונית פסטורלית.', fanDeck: 'מניפת נירלט קולורס (Nirlat Colors)' },
  { code: 'IS 0037', name: 'לבן משי / Silk White', hex: '#f4f3ed', deck: 'נירלט', description: 'לבן בהיר ונקי עם רכות משי המעניק מראה מאוזן ומזמין בכל שעות היום.', fanDeck: 'מניפת נירלט קולורס (Nirlat Colors)' },
  { code: 'IS 0108', name: 'בז׳ קטיפתי / Velvet Beige', hex: '#e8ded0', deck: 'נירלט', description: 'גוון בז׳ חמים ומרגיע המדמה חול ים דק, מתאים להלבשת קירות הבית המרכזיים.', fanDeck: 'מניפת נירלט קולורס (Nirlat Colors)' },
  { code: 'IS 0447', name: 'ירוק מרווה פסטורלי / Pastoral Sage', hex: '#c5cdbf', deck: 'נירלט', description: 'גוון ירוק-אפרפר צמחי המביא את הטבע הביתה ויוצר שלווה מיידית.', fanDeck: 'מניפת נירלט אינספייר (Nirlat Inspire)' },
  { code: 'IS 0504', name: 'אפור ערפל / Mist Gray', hex: '#b8b8b5', deck: 'נירלט', description: 'אפור ערפילי מודרני עם תת-גוון קריר מעט, נפלא כחלופה ללבן הסטנדרטי.', fanDeck: 'מניפת נירלט קולורס (Nirlat Colors)' },
  { code: 'IS 0212', name: 'ורוד פודרה אדריכלי / Powder Pink', hex: '#f0e2dc', deck: 'נירלט', description: 'ורוד עדין ומרוכך במיוחד המוסיף חמימות אלגנטית ומאירה לחדרי שינה ורחצה.', fanDeck: 'מניפת נירלט אינספייר (Nirlat Inspire)' },
  { code: 'IS 0011', name: 'לבן פנינה קריסטל / Crystal Pearl', hex: '#f7f5f0', deck: 'נירלט', description: 'גוון פנינה יוקרתי ומנצנץ ברכות, מושלם לשילוב עם תאורת לד חמה.', fanDeck: 'מניפת נירלט קולורס (Nirlat Colors)' },
  { code: 'IS 0812', name: 'כחול חצות מעושן / Smoky Midnight', hex: '#2a363d', deck: 'נירלט', description: 'כחול אולטרה-מודרני ועמוק עם נוכחות חזקה לקיר כוח אומנותי בסלון או במשרד.', fanDeck: 'מניפת נירלט אקסטרה (Nirlat Extra)' },
  { code: 'IS 0134', name: 'חול זהוב / Golden Sand', hex: '#e1ceb1', deck: 'נירלט', description: 'גוון חול עשיר וחמים עם נגיעות זהובות המזכיר את סמטאות יפו העתיקה והאבן ההיסטורית.', fanDeck: 'מניפת המרכז לשימור (Nirlat Conservation)' }
];

const parseMaterialsFromHtmlGlobal = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract first paragraph or strong section for Situation description
  const firstP = doc.querySelector('p');
  let situation = firstP ? firstP.textContent || '' : '';
  
  // Clean up situation text
  if (!situation || situation.trim() === '') {
    situation = 'אבחון ושיקום חלל פנים/חוץ בהתאם לתוכנית עבודה והמלצות יועץ.';
  }

  const options: Array<{ id: number; title: string; product: string; brand: string; description: string }> = [];

  // Look for options in HTML
  const h4s = doc.querySelectorAll('h4');
  const uls = doc.querySelectorAll('ul');

  if (h4s.length > 0) {
    h4s.forEach((h4, idx) => {
      const title = h4.textContent?.replace(/אופציה \d+:\s*/, '').replace(/[\[\]]/g, '').trim() || '';
      const ul = uls[idx] || doc.querySelectorAll('ul')[idx];
      let product = '';
      let brand = '';
      let description = '';

      if (ul) {
        const li = ul.querySelector('li');
        if (li) {
          const strong = li.querySelector('strong');
          let strongText = strong ? strong.textContent || '' : '';
          strongText = strongText.replace(':', '').replace(/[\[\]]/g, '').trim();

          const brandMatch = strongText.match(/(.+?)\s*\((.+?)\)/);
          if (brandMatch) {
            product = brandMatch[1].trim();
            brand = brandMatch[2].trim();
          } else {
            product = strongText;
            brand = 'ח. סבן מומלץ';
          }

          description = li.textContent || '';
          if (strongText && strong) {
            description = description.replace(strong.textContent || '', '').replace(/^:\s*/, '').trim();
          }
        }
      }

      if (title && product) {
        options.push({
          id: idx + 1,
          title,
          product,
          brand,
          description
        });
      }
    });
  }

  if (options.length === 0) {
    const lis = doc.querySelectorAll('li');
    lis.forEach((li, idx) => {
      const strong = li.querySelector('strong');
      if (strong) {
        const strongText = (strong.textContent || '').replace(':', '').trim();
        let product = strongText;
        let brand = 'ח. סבן מומלץ';
        const brandMatch = strongText.match(/(.+?)\s*\((.+?)\)/);
        if (brandMatch) {
          product = brandMatch[1].trim();
          brand = brandMatch[2].trim();
        }

        let description = li.textContent || '';
        description = description.replace(strongText, '').replace(/^:\s*/, '').trim();

        options.push({
          id: idx + 1,
          title: `שלב אבחון ${idx + 1}`,
          product,
          brand,
          description
        });
      }
    });
  }

  if (options.length === 0) {
    options.push(
      { id: 1, title: 'אופציה 1: תיקון מהיר ובסיסי', product: 'סופרקריל קלין', brand: 'טמבור', description: 'צבע קירות פרימיום רחיץ להגנה אסתטית.' },
      { id: 2, title: 'אופציה 2: טיפול יסודי ואיטום', product: 'סיקפלקס 11FC', brand: 'Sika', description: 'חומר איטום והדבקה פוליאוריטני אלסטי רב-תכליתי.' },
      { id: 3, title: 'אופציה 3: פתרון פרימיום למניעה עתידית', product: 'דבק קרמיקה פרימיום S1', brand: 'מיסטר פיקס', description: 'דבק גמיש במיוחד בעל אחיזה מוגברת.' }
    );
  }

  return { situation, options };
};

interface InteractiveAtelierWidgetProps {
  msg: ChatMessage;
}

export function InteractiveAtelierWidget({ msg }: InteractiveAtelierWidgetProps) {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'calculator'>('visualizer');
  const [selectedColor, setSelectedColor] = useState<ColorShade>(PREMIUM_COLOR_SHADES[0]);
  const [secondaryColor, setSecondaryColor] = useState<ColorShade>(PREMIUM_COLOR_SHADES[1]);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selectedColorSlot, setSelectedColorSlot] = useState<'primary' | 'secondary'>('primary');
  const [transitionKey, setTransitionKey] = useState<number>(0);
  const [activeDeck, setActiveDeck] = useState<'טמבור' | 'נירלט'>('טמבור');
  const [areaSqM, setAreaSqM] = useState<number>(25);
  const [simulationTarget, setSimulationTarget] = useState<'scene' | 'photo'>('scene');

  const { situation } = parseMaterialsFromHtmlGlobal(msg.text);

  const isExteriorCase = msg.text.toLowerCase().includes('שליכט') || 
                          msg.text.toLowerCase().includes('חיצוני') || 
                          msg.text.toLowerCase().includes('חוץ');

  const selectedTheme = isExteriorCase ? 'facade' : 'lounge';
  const filteredColors = PREMIUM_COLOR_SHADES.filter(c => c.deck === activeDeck);

  const changeColor = (color: ColorShade) => {
    if (compareMode) {
      if (selectedColorSlot === 'primary') {
        setSelectedColor(color);
      } else {
        setSecondaryColor(color);
      }
    } else {
      setSelectedColor(color);
    }
    setTransitionKey(prev => prev + 1);
  };

  const renderVisualizerContent = (color: ColorShade, slotName: 'primary' | 'secondary') => {
    const isSlotSelected = compareMode ? (selectedColorSlot === slotName) : true;
    return (
      <div 
        onClick={() => {
          if (compareMode) {
            setSelectedColorSlot(slotName);
          }
        }}
        className={`relative flex-1 w-full bg-neutral-950 flex flex-col items-center justify-center p-2 overflow-hidden min-h-[160px] cursor-pointer transition-all duration-300 ${
          compareMode && isSlotSelected ? 'ring-2 ring-[#C5A880] bg-neutral-900/40' : 'opacity-85'
        }`}
      >
        {simulationTarget === 'scene' ? (
          selectedTheme === 'facade' ? (
            <div className="w-full h-full max-w-sm flex items-center justify-center">
              <svg viewBox="0 0 400 240" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="240" fill="#0b0e14" />
                <circle cx="340" cy="50" r="2" fill="#fff" opacity="0.3" />
                <circle cx="80" cy="70" r="1.5" fill="#fff" opacity="0.5" />
                <polygon 
                  points="60,210 280,210 280,40 60,70" 
                  fill={color.hex} 
                  style={{ transition: 'fill 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                />
                <polygon points="280,210 360,210 360,80 280,80" fill="#1a1a1c" />
                <polygon points="60,210 130,210 130,100 60,110" fill="#4a3121" stroke="#311f14" strokeWidth="0.5" />
                <line x1="60" y1="130" x2="130" y2="130" stroke="#311f14" strokeWidth="0.5" />
                <line x1="60" y1="160" x2="130" y2="160" stroke="#311f14" strokeWidth="0.5" />
                <line x1="60" y1="190" x2="130" y2="190" stroke="#311f14" strokeWidth="0.5" />
                <rect x="150" y="130" width="40" height="80" fill="#111" stroke="#c5a880" strokeWidth="1" />
                <circle cx="158" cy="170" r="2" fill="#c5a880" />
                <polygon points="150,110 260,95 260,55 150,70" fill="#0d1117" stroke="#121824" strokeWidth="2" />
                <line x1="170" y1="105" x2="210" y2="70" stroke="#c5a880" strokeWidth="1" opacity="0.3" />
                <line x1="210" y1="100" x2="240" y2="75" stroke="#c5a880" strokeWidth="1" opacity="0.2" />
                <rect x="0" y="210" width="400" height="30" fill="#111113" />
                <line x1="0" y1="210" x2="400" y2="210" stroke="#252528" strokeWidth="2" />
                <polygon points="170,130 130,210 210,210" fill="#c5a880" opacity="0.1" />
                <line x1="320" y1="180" x2="320" y2="210" stroke="#111" strokeWidth="3" />
                <circle cx="320" cy="165" r="20" fill="#314036" opacity="0.8" />
                <circle cx="330" cy="155" r="15" fill="#3d5245" opacity="0.9" />
              </svg>
            </div>
          ) : (
            <div className="w-full h-full max-w-sm flex items-center justify-center">
              <svg viewBox="0 0 400 240" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect 
                  x="0" y="0" width="400" height="180" 
                  fill={color.hex} 
                  style={{ transition: 'fill 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                />
                <rect x="25" y="20" width="90" height="110" fill="#252528" rx="2" />
                <rect x="30" y="25" width="80" height="100" fill="#3B4D54" opacity="0.3" />
                <path d="M30 110 C 60 90, 80 120, 110 100 L110 125 L30 125 Z" fill="#2d373c" />
                <line x1="70" y1="20" x2="70" y2="130" stroke="#121214" strokeWidth="2" />
                <line x1="25" y1="75" x2="115" y2="75" stroke="#121214" strokeWidth="1.5" />
                <rect x="0" y="180" width="400" height="60" fill="#1b1714" />
                <line x1="40" y1="180" x2="10" y2="240" stroke="#2c241f" strokeWidth="1" />
                <line x1="120" y1="180" x2="90" y2="240" stroke="#2c241f" strokeWidth="1" />
                <line x1="200" y1="180" x2="190" y2="240" stroke="#2c241f" strokeWidth="1" />
                <line x1="280" y1="180" x2="290" y2="240" stroke="#2c241f" strokeWidth="1" />
                <line x1="360" y1="180" x2="390" y2="240" stroke="#2c241f" strokeWidth="1" />
                <rect x="160" y="140" width="180" height="40" fill="#1e1e1e" rx="4" stroke="#c5a880" strokeWidth="0.5" />
                <rect x="170" y="125" width="160" height="20" fill="#2d2d2d" rx="2" />
                <rect x="180" y="145" width="65" height="10" fill="#111" rx="1" />
                <rect x="255" y="145" width="65" height="10" fill="#111" rx="1" />
                <line x1="160" y1="180" x2="160" y2="185" stroke="#c5a880" strokeWidth="2" />
                <line x1="340" y1="180" x2="340" y2="185" stroke="#c5a880" strokeWidth="2" />
                <line x1="140" y1="90" x2="140" y2="180" stroke="#c5a880" strokeWidth="1.5" />
                <path d="M130 90 L150 90 L145 75 L135 75 Z" fill="#111" />
                <polygon points="120,180 160,180 140,175" fill="#c5a880" opacity="0.4" />
                <rect x="200" y="35" width="70" height="60" fill="#0c0c0e" stroke="#c5a880" strokeWidth="1" />
                <circle cx="235" cy="65" r="18" fill="#c5a880" opacity="0.8" />
                <line x1="205" y1="85" x2="265" y2="45" stroke="#111" strokeWidth="2" />
                <polygon points="355,180 375,180 370,155 360,155" fill="#2d2d2d" />
                <path d="M365 155 Q350 130 340 135 M365 155 Q380 120 385 125 M365 155 Q365 110 360 120" stroke="#465a4c" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          )
        ) : (
          <div className="relative w-full h-full max-w-sm flex items-center justify-center overflow-hidden min-h-[140px]">
            <img
              src={msg.image}
              alt="User uploaded analysis"
              className="max-h-[140px] w-auto object-contain rounded-sm"
            />
            <AnimatePresence mode="popLayout">
              <motion.div
                key={color.hex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.28 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-sm pointer-events-none mix-blend-color-burn"
                style={{ backgroundColor: color.hex }}
              />
            </AnimatePresence>
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-neutral-950/95 border border-neutral-800 rounded-sm py-1 px-2 text-right flex flex-col gap-0.5 max-w-[140px]">
          <span className="text-[6px] text-[#C5A880] tracking-wider font-mono uppercase leading-none">
            {color.fanDeck}
          </span>
          <span className="text-[9px] text-white font-semibold leading-none mt-0.5">
            {color.deck} • {color.code}
          </span>
          <span className="text-[8.5px] text-neutral-400 font-medium leading-none">
            {slotName === 'primary' ? 'גוון א׳ (ראשי)' : 'גוון ב׳ (השוואה)'}
          </span>
        </div>
      </div>
    );
  };

  const calculateMaterials = () => {
    const results: Array<{
      id: string;
      name: string;
      brand: string;
      calculatedVal: string;
      purchasingTip: string;
      coverageRate: string;
      stockStatus: string;
    }> = [];

    const textLower = msg.text.toLowerCase();

    if (textLower.includes('סופרקריל') || textLower.includes('צבע') || textLower.includes('קלין') || textLower.includes('גוון')) {
      const paintLiters = (areaSqM * 2) / 8;
      const numPails18 = Math.floor(paintLiters / 18);
      const remainder = paintLiters % 18;
      const numPails5 = remainder > 0 ? (remainder <= 5 ? 1 : 2) : 0;
      
      let purchaseDesc = "";
      if (numPails18 > 0) purchaseDesc += `${numPails18} פח(ים) של 18 ליטר `;
      if (numPails5 > 0) purchaseDesc += `${numPails18 > 0 ? '+ ' : ''}${numPails5} פח(ים) של 5 ליטר`;
      if (!purchaseDesc) purchaseDesc = "פח 5 ליטר אחד מספיק";

      results.push({
        id: 'paint',
        name: 'סופרקריל קלין - צבע קירות פרימיום',
        brand: 'טמבור',
        calculatedVal: `${paintLiters.toFixed(1)} ליטר (במריחה דו-שכבתית)`,
        purchasingTip: `מומלץ לרכוש: ${purchaseDesc}`,
        coverageRate: 'כושר כיסוי: כ-8 מ"ר לליטר בשתי שכבות',
        stockStatus: 'במלאי שוטף • סניף ח. סבן'
      });
    }

    if (textLower.includes('שליכט') || textLower.includes('חיצוני')) {
      const shlichtKg = areaSqM * 1.5;
      const pails24 = Math.ceil(shlichtKg / 24);
      results.push({
        id: 'shlicht',
        name: 'שליכט צבעוני אקרילי פרימיום דקורטיבי',
        brand: 'נירלט',
        calculatedVal: `${shlichtKg.toFixed(1)} ק"ג`,
        purchasingTip: `מומלץ לרכוש: ${pails24} פחים של 24 ק"ג`,
        coverageRate: 'כושר כיסוי: כ-1.5 ק"ג למ"ר',
        stockStatus: 'אספקה מהירה עד 2 ימי עסקים • ח. סבן'
      });
    }

    if (textLower.includes('סיקפלקס') || textLower.includes('11fc') || textLower.includes('איטום')) {
      const sausages = Math.max(1, Math.ceil(areaSqM / 10));
      results.push({
        id: 'sikaflex',
        name: 'סיקפלקס 11FC - נקניק איטום והדבקה פוליאוריטני 600 מ"ל',
        brand: 'Sika',
        calculatedVal: `${sausages} יחידות (לפי אומדן תפרים/פנלים)`,
        purchasingTip: `מומלץ לרכוש: קרטון של ${sausages} נקניקים (או בודדים לפי צורך)`,
        coverageRate: 'כושר כיסוי: כ-6 מטר רץ לפיה של 10x10 מ"מ לנקניק',
        stockStatus: 'במלאי שוטף • מחלקת חומרי איטום ח. סבן'
      });
    }

    if (textLower.includes('מונוטופ') || textLower.includes('412') || textLower.includes('בטון') || textLower.includes('שיקום')) {
      const bags25 = Math.max(1, Math.ceil((areaSqM * 2.0) / 25));
      results.push({
        id: 'monotop',
        name: 'סיקה מונוטופ 412 - צמנט שיקום בטון פרימיום',
        brand: 'Sika',
        calculatedVal: `${(bags25 * 25).toFixed(0)} ק"ג`,
        purchasingTip: `מומלץ לרכוש: ${bags25} שקים של 25 ק"ג`,
        coverageRate: 'כושר כיסוי: כ-1.9 ק"ג למ"ר לעובי של 1 מ"מ',
        stockStatus: 'במלאי שוטף • מוצר מורשה Sika'
      });
    }

    if (textLower.includes('טופ סיל') || textLower.includes('107')) {
      const kits = Math.max(1, Math.ceil((areaSqM * 3.5) / 25));
      results.push({
        id: 'topseal',
        name: 'סיקה טופ סיל 107 - מערכת איטום צמנטית דו-רכיבית',
        brand: 'Sika',
        calculatedVal: `${kits} סט(ים) מלאים (אבקה + נוזל)`,
        purchasingTip: `מומלץ לרכוש: ${kits} סטים של 25 ק"ג (רכיב א' + רכיב ב')`,
        coverageRate: 'כושר כיסוי: כ-3.5 ק"ג למ"ר לכיסוי דו-שכבתי מלא',
        stockStatus: 'במלאי שוטף • כולל תעודת טיב'
      });
    }

    if (textLower.includes('טיח') || textLower.includes('תרמוקיר') || textLower.includes('770')) {
      const bags25 = Math.max(1, Math.ceil((areaSqM * 4.0) / 25));
      results.push({
        id: 'thermokir',
        name: 'טיח תרמי 770 - בידוד מתקדם ומניעת עיבוי',
        brand: 'תרמוקיר',
        calculatedVal: `${bags25} שקים של 25 ק"ג`,
        purchasingTip: `מומלץ לרכוש: ${bags25} שקים לקבלת בידוד אופטימלי`,
        coverageRate: 'כושר כיסוי: כ-4 ק"ג למ"ר בעובי ממוצע',
        stockStatus: 'במלאי שוטף • מותג ירוק תקני'
      });
    }

    if (textLower.includes('גבס') || textLower.includes('לוח')) {
      const boards = Math.max(2, Math.ceil(areaSqM / 2.8));
      results.push({
        id: 'gypsum',
        name: 'לוח גבס אקוסטי כחול / לבן 12.5 מ"מ',
        brand: 'אורבונד',
        calculatedVal: `${boards} לוחות`,
        purchasingTip: `מומלץ לרכוש: ${boards} יחידות לוחות (מידות: 1.2 * 2.4 מטר)`,
        coverageRate: 'שטח לוח בודד: כ-2.88 מ"ר',
        stockStatus: 'במלאי שוטף • כולל מסלולי הובלה מנוף'
      });
    }

    if (results.length === 0) {
      const paintLiters = (areaSqM * 2) / 8;
      const numPails18 = Math.floor(paintLiters / 18);
      const remainder = paintLiters % 18;
      const numPails5 = remainder > 0 ? (remainder <= 5 ? 1 : 2) : 0;
      let purchaseDesc = "";
      if (numPails18 > 0) purchaseDesc += `${numPails18} פח(ים) של 18 ליטר `;
      if (numPails5 > 0) purchaseDesc += `${numPails18 > 0 ? '+ ' : ''}${numPails5} פח(ים) של 5 ליטר`;
      if (!purchaseDesc) purchaseDesc = "פח 5 ליטר אחד";

      results.push({
        id: 'paint',
        name: 'סופרקריל קלין - צבע אקרילי פרימיום',
        brand: 'טמבור',
        calculatedVal: `${paintLiters.toFixed(1)} ליטר`,
        purchasingTip: `מומלץ לרכוש: ${purchaseDesc}`,
        coverageRate: 'כושר כיסוי: 8 מ"ר לליטר בשתי שכבות',
        stockStatus: 'במלאי שוטף'
      });

      const sausages = Math.max(1, Math.ceil(areaSqM / 15));
      results.push({
        id: 'sikaflex',
        name: 'סיקפלקס 11FC - חומר איטום פוליאוריטני קלאסי',
        brand: 'Sika',
        calculatedVal: `${sausages} יחידות 600 מ"ל`,
        purchasingTip: `מומלץ לרכוש: ${sausages} נקניק(ים) ליישום בחיבורים ובקצוות`,
        coverageRate: 'כ-6 מטר אורך לכל נקניק 600 מ"ל',
        stockStatus: 'במלאי שוטף'
      });
    }

    return results;
  };

  const calculatedMaterials = calculateMaterials();

  const handleWidgetPDFExport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('אנא אפשר חלונות קופצים בדפדפן על מנת להפיק את המפרט.');
      return;
    }

    const currentDate = new Date().toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const referenceCode = `HS-CLC-${Math.floor(100000 + Math.random() * 900000)}`;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="utf-8">
        <title>אומדן כמויות ומפרט גוון פרימיום - ח. סבן AI</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Outfit:wght@200;300;400;500;600&family=Rubik:wght@300;400;500;700&display=swap');
          
          body {
            font-family: 'Rubik', sans-serif;
            background-color: #ffffff;
            color: #1c1c1c;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
          }
          
          .document-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e5e5e5;
            padding: 50px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.02);
            position: relative;
          }
          
          .brand-header {
            text-align: center;
            border-bottom: 2px solid #1c1c1c;
            padding-bottom: 25px;
            margin-bottom: 35px;
          }
          
          .brand-logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 34px;
            font-weight: 300;
            letter-spacing: 0.25em;
            margin: 0;
            text-transform: uppercase;
            color: #111;
          }
          
          .brand-subtitle {
            font-family: 'Cormorant Garamond', serif;
            font-size: 11px;
            color: #c5a880;
            letter-spacing: 0.15em;
            margin: 6px 0 0 0;
            text-transform: uppercase;
            font-style: italic;
          }
          
          .doc-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 35px;
            font-size: 12px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 20px;
          }
          
          .meta-column {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          
          .meta-label {
            color: #888;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .meta-value {
            font-weight: 500;
            color: #1c1c1c;
          }
          
          .section-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 18px;
            letter-spacing: 0.05em;
            color: #c5a880;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          
          .color-showcase {
            display: flex;
            align-items: center;
            gap: 20px;
            background-color: #faf8f5;
            border: 1px solid #eaeaea;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 30px;
          }
          
          .color-swatch-box {
            width: 80px;
            height: 80px;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
            background-color: ${selectedColor.hex};
            box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);
          }
          
          .color-info-pane {
            flex: 1;
          }
          
          .color-header-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .color-code-badge {
            background-color: #111;
            color: #c5a880;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 2px;
          }
          
          .color-name-text {
            font-size: 16px;
            font-weight: 600;
            color: #111;
          }
          
          .color-desc-text {
            color: #666;
            font-size: 12px;
            margin-top: 6px;
          }
          
          .materials-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          
          .materials-table th {
            border-bottom: 1px solid #111;
            text-align: right;
            padding: 12px 10px;
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .materials-table td {
            padding: 18px 10px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 13px;
            vertical-align: top;
          }
          
          .product-title-row {
            font-weight: 600;
            color: #111;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .brand-badge {
            font-size: 9px;
            background: #f0f0f0;
            color: #444;
            padding: 2px 6px;
            border-radius: 2px;
            font-weight: 600;
          }
          
          .advisor-box {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            margin-top: 40px;
            border-top: 1px solid #eaeaea;
            padding-top: 30px;
          }
          
          .advisor-card {
            border: 1px solid #f0f0f0;
            border-radius: 4px;
            padding: 15px;
            font-size: 11.5px;
            background-color: #fafafa;
          }
          
          .advisor-name {
            font-weight: 600;
            color: #111;
            margin-bottom: 4px;
          }
          
          .document-footer {
            text-align: center;
            font-size: 10px;
            color: #999;
            margin-top: 50px;
            border-top: 1px solid #f5f5f5;
            padding-top: 25px;
            letter-spacing: 0.05em;
          }
          
          .print-btn-container {
            display: flex;
            justify-content: center;
            margin-bottom: 25px;
          }

          .print-btn {
            background-color: #111;
            color: #fff;
            border: none;
            padding: 12px 30px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            cursor: pointer;
            border-radius: 2px;
            transition: background-color 0.3s;
          }

          .print-btn:hover {
            background-color: #c5a880;
          }

          @media print {
            body {
              padding: 0;
              background: transparent;
            }
            .document-container {
              border: none;
              box-shadow: none;
              padding: 0;
            }
            .print-btn-container {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container">
          <button class="print-btn" onclick="window.print()">הדפס או שמור כ-PDF 📋</button>
        </div>

        <div class="document-container">
          <div class="brand-header">
            <h1 class="brand-logo">H. SABAN</h1>
            <div class="brand-subtitle">ATELIER ARCHITECTURAL SPECIFICATION • מפרט אדריכלי ואומדן חומרים</div>
          </div>
          
          <div class="doc-meta">
            <div class="meta-column">
              <span class="meta-label">מזהה פרויקט / Project ID</span>
              <span class="meta-value"><strong>${referenceCode}</strong></span>
            </div>
            <div class="meta-column">
              <span class="meta-label">שטח מוגדר / Calculated Area</span>
              <span class="meta-value"><strong>${areaSqM} מ"ר</strong></span>
            </div>
            <div class="meta-column" style="text-align: left;">
              <span class="meta-label">תאריך הפקה / Date</span>
              <span class="meta-value">${currentDate}</span>
            </div>
          </div>

          <div class="section-title">${compareMode ? 'גוונים נבחרים להשוואה והדמייה' : 'גוון נבחר להדמיית שטח'}</div>
          ${compareMode ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div class="color-showcase" style="margin-bottom: 0;">
              <div class="color-swatch-box" style="background-color: ${selectedColor.hex};"></div>
              <div class="color-info-pane">
                <div class="color-header-row">
                  <span class="color-code-badge" style="background-color: #c5a880; color: #111;">גוון א׳ (ראשי)</span>
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #111; margin-top: 6px;">${selectedColor.name}</div>
                <div style="font-size: 11px; color: #444; font-weight: 500; margin-top: 2px;">קוד: ${selectedColor.code} • מותג: ${selectedColor.deck}</div>
                <p class="color-desc-text" style="margin-top: 6px; font-size: 11px;">${selectedColor.description}</p>
                <div style="font-size: 9px; color: #999; margin-top: 4px;">${selectedColor.fanDeck}</div>
              </div>
            </div>
            <div class="color-showcase" style="margin-bottom: 0;">
              <div class="color-swatch-box" style="background-color: ${secondaryColor.hex};"></div>
              <div class="color-info-pane">
                <div class="color-header-row">
                  <span class="color-code-badge" style="background-color: #2a363d; color: #fff;">גוון ב׳ (להשוואה)</span>
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #111; margin-top: 6px;">${secondaryColor.name}</div>
                <div style="font-size: 11px; color: #444; font-weight: 500; margin-top: 2px;">קוד: ${secondaryColor.code} • מותג: ${secondaryColor.deck}</div>
                <p class="color-desc-text" style="margin-top: 6px; font-size: 11px;">${secondaryColor.description}</p>
                <div style="font-size: 9px; color: #999; margin-top: 4px;">${secondaryColor.fanDeck}</div>
              </div>
            </div>
          </div>
          ` : `
          <div class="color-showcase">
            <div class="color-swatch-box" style="background-color: ${selectedColor.hex};"></div>
            <div class="color-info-pane">
              <div class="color-header-row">
                <span class="color-code-badge">${selectedColor.deck} • ${selectedColor.code}</span>
                <span class="color-name-text">${selectedColor.name}</span>
              </div>
              <p class="color-desc-text">${selectedColor.description}</p>
              <div style="font-size: 10px; color: #c5a880; font-weight: 500; margin-top: 4px;">${selectedColor.fanDeck}</div>
            </div>
          </div>
          `}
          
          <div class="section-title">אבחון טכני ראשוני</div>
          <p style="font-size: 13px; color: #444; margin-bottom: 25px;">${situation}</p>
          
          <div class="section-title">מחשבון כמויות וחומרים מותאם ל-${areaSqM} מ"ר</div>
          <table class="materials-table">
            <thead>
              <tr>
                <th style="width: 45%;">חומר ומותג מורשה</th>
                <th style="width: 25%;">כמות נדרשת (אומדן)</th>
                <th style="width: 30%;">הנחיית רכישה ואריזה</th>
              </tr>
            </thead>
            <tbody>
              ${calculatedMaterials.map(mat => `
                <tr>
                  <td>
                    <div class="product-title-row">
                      <span>${mat.name}</span>
                      <span class="brand-badge">${mat.brand}</span>
                    </div>
                    <div style="font-size: 11px; color: #777; margin-top: 3px;">${mat.coverageRate}</div>
                  </td>
                  <td style="font-weight: 600; color: #111;">${mat.calculatedVal}</td>
                  <td style="color: #444; font-size: 12px;">
                    <div>${mat.purchasingTip}</div>
                    <div style="font-size: 9px; color: #c5a880; font-weight: 600; margin-top: 4px;">${mat.stockStatus}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="section-title">אנשי קשר וליווי בשטח - ח. סבן</div>
          <div class="advisor-box">
            <div class="advisor-card">
              <div class="advisor-name">אלי (נציג פיתוח שטח Sika)</div>
              <div style="color: #666; margin-bottom: 8px;">ייעוץ מומחה, מערכות איטום מורכבות ופתרונות קונסטרוקטיביים.</div>
              <div style="font-weight: 500;">טלפון: 050-8860896</div>
            </div>
            <div class="advisor-card">
              <div class="advisor-name">כפיר (נציג פיתוח שטח תרמוקיר)</div>
              <div style="color: #666; margin-bottom: 8px;">פתרונות בידוד תרמי, מערכות טיח מתקדמות, והכנת תשתיות גמר.</div>
              <div style="font-weight: 500;">טלפון: 050-8861080</div>
            </div>
          </div>
          
          <div class="document-footer">
            <p>מסמך אומדן מפרט וכמויות זה הופק באופן אוטומטי על ידי ח. סבן AI.</p>
            <p>ח. סבן (1994) בע״מ • סניף ראשי: כביש 444, טייבה • ייבוא ושיווק חומרי בניין, איטום וגמר מתקדמים.</p>
            <p style="margin-top: 10px; color: #c5a880; font-weight: 500;">H. SABAN (1994) LTD • ATELIER INTERIOR SOLUTIONS</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleWhatsAppShare = () => {
    const paintLiters = (areaSqM * 2) / 8;
    const numPails18 = Math.floor(paintLiters / 18);
    const remainder = paintLiters % 18;
    const numPails5 = remainder > 0 ? (remainder <= 5 ? 1 : 2) : 0;
    
    let purchaseDesc = "";
    if (numPails18 > 0) purchaseDesc += `${numPails18} פח(ים) של 18 ליטר `;
    if (numPails5 > 0) purchaseDesc += `${numPails18 > 0 ? '+ ' : ''}${numPails5} פח(ים) של 5 ליטר`;
    if (!purchaseDesc) purchaseDesc = "פח 5 ליטר אחד";

    let text = "";
    if (compareMode) {
      text = `שלום, ברצוני להזמין הכנה לגיוון מראש בסניף ח. סבן (מצב השוואתי):
🎨 פרטי הגוונים שבחרתי להשוות:

1️⃣ גוון א׳ (ראשי):
• שם: ${selectedColor.name}
• קוד צבע: ${selectedColor.code}
• מותג: ${selectedColor.deck}
• מניפה: ${selectedColor.fanDeck}

2️⃣ גוון ב׳ (להשוואה):
• שם: ${secondaryColor.name}
• קוד צבע: ${secondaryColor.code}
• מותג: ${secondaryColor.deck}
• מניפה: ${secondaryColor.fanDeck}

📐 אומדן חומרים לכל גוון (עבור שטח של ${areaSqM} מ"ר):
• כמות צבע מחושבת: ${paintLiters.toFixed(1)} ליטר (במריחה דו-שכבתית)
• אריזה מומלצת: ${purchaseDesc}

* מפרט השוואתי זה הופק באמצעות מערכת ח. סבן AI ✨`;
    } else {
      text = `שלום, ברצוני להזמין הכנה לגיוון מראש בסניף ח. סבן:
🎨 פרטי הגוון:
• גוון: ${selectedColor.name}
• קוד צבע: ${selectedColor.code}
• מותג: ${selectedColor.deck}
• מניפה מדויקת: ${selectedColor.fanDeck}

📐 אומדן חומרים ושטח:
• שטח מוגדר: ${areaSqM} מ"ר
• כמות צבע מחושבת: ${paintLiters.toFixed(1)} ליטר (במריחה דו-שכבתית)
• אריזה מומלצת לרכישה: ${purchaseDesc}

* מפרט זה הופק באמצעות מערכת ח. סבן AI ✨`;
    }

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="mt-6 bg-[#09090b] border border-neutral-900 rounded-sm p-4 md:p-5 text-right font-sans" dir="rtl">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
        <span className="text-[9px] text-[#C5A880] font-mono tracking-widest uppercase block">
          ATELIER ATELIER LABS
        </span>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-sans font-medium rounded-sm transition-all cursor-pointer ${
              activeTab === 'visualizer'
                ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30'
                : 'text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>הדמיית גוונים 🎨</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-sans font-medium rounded-sm transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30'
                : 'text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>מחשבון כמויות חכם 📐</span>
          </button>
        </div>
      </div>

      {activeTab === 'visualizer' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950/60 p-2.5 rounded-sm border border-neutral-900/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCompareMode(!compareMode);
                  if (!compareMode) {
                    setSelectedColorSlot('primary');
                  } else {
                    // Automatically pre-fill secondary color with a nice contrasting shade if same
                    if (selectedColor.code === secondaryColor.code) {
                      const other = PREMIUM_COLOR_SHADES.find(c => c.code !== selectedColor.code) || PREMIUM_COLOR_SHADES[1];
                      setSecondaryColor(other);
                    }
                    setSelectedColorSlot('secondary');
                  }
                }}
                className={`px-3 py-1.5 text-[9.5px] uppercase font-bold rounded-xs border cursor-pointer transition-all flex items-center gap-1.5 ${
                  compareMode 
                    ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880]' 
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white'
                }`}
              >
                <span>{compareMode ? '✕ בטל השוואה' : '⇄ השוואת שני גוונים במקביל'}</span>
              </button>
              {compareMode && (
                <span className="text-[9px] text-neutral-400 font-sans hidden sm:inline">
                  לחץ על גוון א׳ או ב׳ בהדמיה כדי לעדכן אותו.
                </span>
              )}
            </div>
            
            {compareMode && (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedColorSlot('primary')}
                  className={`px-2.5 py-1 text-[9px] rounded-xs border font-medium cursor-pointer transition-all flex items-center gap-1 ${
                    selectedColorSlot === 'primary'
                      ? 'border-[#C5A880] bg-[#C5A880]/10 text-[#C5A880]'
                      : 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>גוון א׳ (ראשי)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColorSlot('secondary')}
                  className={`px-2.5 py-1 text-[9px] rounded-xs border font-medium cursor-pointer transition-all flex items-center gap-1 ${
                    selectedColorSlot === 'secondary'
                      ? 'border-[#C5A880] bg-[#C5A880]/10 text-[#C5A880]'
                      : 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>גוון ב׳ (להשוואה)</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            <div className="md:col-span-7 bg-neutral-950/80 border border-neutral-900 rounded-sm overflow-hidden flex flex-col relative">
              {compareMode ? (
                <div className="grid grid-cols-2 divide-x divide-neutral-900/80 h-full">
                  {renderVisualizerContent(selectedColor, 'primary')}
                  {renderVisualizerContent(secondaryColor, 'secondary')}
                </div>
              ) : (
                renderVisualizerContent(selectedColor, 'primary')
              )}

              {msg.image && (
                <div className="border-t border-neutral-900 px-3 py-2 bg-neutral-950/60 flex items-center justify-between">
                  <span className="text-[9px] text-neutral-400 font-sans">אזור הדמיית תמונת השטח</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSimulationTarget('scene')}
                      className={`px-2 py-0.5 text-[8.5px] rounded-sm transition-colors cursor-pointer ${
                        simulationTarget === 'scene'
                          ? 'bg-[#C5A880] text-black font-medium'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      חלל דוגמה
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulationTarget('photo')}
                      className={`px-2 py-0.5 text-[8.5px] rounded-sm transition-colors cursor-pointer ${
                        simulationTarget === 'photo'
                          ? 'bg-[#C5A880] text-black font-medium'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      התמונה שלי
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                <div className="grid grid-cols-2 gap-1 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDeck('טמבור');
                      // set default first of deck
                      const first = PREMIUM_COLOR_SHADES.find(c => c.deck === 'טמבור')!;
                      changeColor(first);
                    }}
                    className={`py-1.5 text-[10px] font-medium border text-center transition-all cursor-pointer ${
                      activeDeck === 'טמבור'
                        ? 'border-[#C5A880] bg-[#111111] text-[#C5A880]'
                        : 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:border-neutral-800'
                    }`}
                  >
                    מניפת טמבור
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDeck('נירלט');
                      const first = PREMIUM_COLOR_SHADES.find(c => c.deck === 'נירלט')!;
                      changeColor(first);
                    }}
                    className={`py-1.5 text-[10px] font-medium border text-center transition-all cursor-pointer ${
                      activeDeck === 'נירלט'
                        ? 'border-[#C5A880] bg-[#111111] text-[#C5A880]'
                        : 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:border-neutral-800'
                    }`}
                  >
                    מניפת נירלט
                  </button>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {filteredColors.map(color => {
                    const isSelected = compareMode 
                      ? (selectedColorSlot === 'primary' ? selectedColor.code === color.code : secondaryColor.code === color.code)
                      : selectedColor.code === color.code;
                    return (
                      <button
                        type="button"
                        key={color.code}
                        onClick={() => changeColor(color)}
                        className={`w-full text-right p-1.5 rounded-sm border transition-all duration-300 flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'border-[#C5A880] bg-neutral-900'
                            : 'border-neutral-900 hover:border-neutral-800 bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-neutral-700 shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] font-medium text-neutral-200 leading-none">{color.name}</span>
                            <span className="text-[8px] text-neutral-500 font-mono mt-0.5">{color.code}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Design Notes Box for currently active color */}
              {(() => {
                const currentActiveColor = compareMode 
                  ? (selectedColorSlot === 'primary' ? selectedColor : secondaryColor)
                  : selectedColor;
                return (
                  <div className="bg-[#111] border border-neutral-900 p-2.5 rounded-sm mt-3 space-y-1.5 text-right">
                    <div className="flex items-center justify-between border-b border-neutral-900/40 pb-1">
                      <span className="text-[9px] text-[#C5A880] font-semibold tracking-wider font-sans uppercase">
                        {currentActiveColor.fanDeck}
                      </span>
                      <span className="text-[8px] text-neutral-500 font-sans">
                        {compareMode ? `גוון ${selectedColorSlot === 'primary' ? 'א׳' : 'ב׳'} - מזהה מניפה` : 'מזהה מניפה'}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-light leading-relaxed">
                      <span className="font-semibold text-neutral-300">אבחון עיצובי ({currentActiveColor.name}):</span> {currentActiveColor.description}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#111] border border-neutral-900 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">הגדר שטח ליישום בשטח (מ"ר)</span>
              <span className="text-sm font-sans font-semibold text-[#C5A880]">
                {areaSqM} מ"ר
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="200"
              value={areaSqM}
              onChange={(e) => setAreaSqM(parseInt(e.target.value))}
              className="w-full accent-[#C5A880] cursor-pointer"
            />
            
            <div className="flex justify-between text-[8px] text-neutral-500 font-mono mt-1">
              <span>200 מ"ר</span>
              <span>100 מ"ר</span>
              <span>5 מ"ר</span>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {calculatedMaterials.map(mat => (
              <div 
                key={mat.id}
                className="p-3 bg-neutral-950/80 border border-neutral-900 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-right"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-neutral-100">{mat.name}</span>
                    <span className="text-[8px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-sm">
                      {mat.brand}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1 font-light">{mat.coverageRate}</p>
                </div>

                <div className="md:text-left flex flex-col gap-0.5">
                  <span className="text-[9px] text-neutral-400 font-sans block">כמות אומדן מחושבת:</span>
                  <span className="text-xs font-sans font-semibold text-[#C5A880]">
                    {mat.calculatedVal}
                  </span>
                  <span className="text-[9px] text-[#25D366] font-light mt-0.5 block font-mono">
                    {mat.purchasingTip}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#111]/30 text-[9px] text-neutral-500 py-1 px-2.5 rounded-sm border border-neutral-950 flex items-center justify-between">
            <span>* האומדן מבוסס על אחוז פחת סטנדרטי של 10% לכיסוי מושלם בשטח.</span>
            <span className="text-[#25D366] font-semibold">✓ מוצרי פרימיום במלאי</span>
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-neutral-900/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3.5 h-3.5 rounded-full border border-neutral-700"
            style={{ backgroundColor: selectedColor.hex }}
            title={`גוון נבחר: ${selectedColor.name}`}
          />
          <span className="text-[9.5px] text-neutral-400 font-light">
            גוון מוגדר: <span className="font-semibold text-neutral-200">{selectedColor.deck} {selectedColor.code}</span> • שטח: <span className="font-semibold text-[#C5A880]">{areaSqM} מ"ר</span>
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-sm text-[10px] font-sans font-semibold tracking-wider transition-all cursor-pointer shadow-md"
            title="שתף קוד גוון, שם וכמות לגיוון מראש בוואטסאפ"
          >
            <span className="text-xs">📱</span>
            <span>שיתוף לגיוון בוואטסאפ</span>
          </button>

          <button
            type="button"
            onClick={handleWidgetPDFExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A880] hover:bg-[#d9bc94] text-black rounded-sm text-[10px] font-sans font-semibold tracking-wider transition-all cursor-pointer shadow-md"
            title="הורדת מפרט אדריכלי וכתב כמויות PDF מעודכן"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ייצוא מפרט אדריכלי וכמויות ל-PDF 📋</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `<p>ברוכים הבאים לאטלייה <strong>ח. סבן AI</strong> - יועץ השטח הווירטואלי שלך לחומרי בניין, איטום וגמר פרימיום.</p>
             <p className="mt-2 text-neutral-400">אנו מציעים חוויית ייעוץ נקייה ומדויקת ללא עומס טכני רועש. צלמו את תקלות האיטום, הריצוף או הצבע שלכם, או העלו תוכנית אדריכלית לקבלת מענה מיידי, מקצועי ומוכוון פתרון.</p>`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [soundscapePlaying, setSoundscapePlaying] = useState(false);
  const [soundVolume, setSoundVolume] = useState(30);

  // WhatsApp Reminder system states
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderMsgText, setReminderMsgText] = useState('');
  const [reminderMsgId, setReminderMsgId] = useState('');
  const [reminderPhone, setReminderPhone] = useState('');
  const [reminderDate, setReminderDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderContactName, setReminderContactName] = useState('אלי (Sika)');
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Audio system for the ambient design shop soundscape
  useEffect(() => {
    // Elegant background white-noise/lo-fi loop to set the high-fashion mood
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggleSoundscape = () => {
    if (!audioRef.current) return;
    if (soundscapePlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = soundVolume / 100;
      audioRef.current.play().catch(() => {});
    }
    setSoundscapePlaying(!soundscapePlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setSoundVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
  };

  // Convert uploaded image to base64
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerCameraInput = () => {
    fileInputRef.current?.click();
  };

  // Generate simulated premium Hebrew response matching the strict 5-stage HTML formatting guidelines
  const getSimulatedConsultantResponse = (userQueryText: string, hasImage: boolean) => {
    const query = userQueryText.toLowerCase();
    let situationDescription = "חלל פנימי העומד בפני שיפוץ, חידוש גוונים והתקנת חיפויים וריצוף חדשים";
    let opt1Title = "תיקון מהיר ובסיסי";
    let opt1Product = "סופרקריל קלין";
    let opt1Brand = "טמבור";
    let opt1Desc = "צבע קירות איכותי ורחיץ במיוחד להגדלת תחושת האור והמרחב.";

    let opt2Title = "טיפול יסודי ואיטום";
    let opt2Product = "סיקפלקס 11FC";
    let opt2Brand = "Sika";
    let opt2Desc = "חומר איטום והדבקה אלסטי לסדקים, חיבורי פנלים ומשקופים.";

    let opt3Title = "פתרון פרימיום למניעה עתידית";
    let opt3Product = "דבק קרמיקה פרימיום S1";
    let opt3Brand = "מיסטר פיקס";
    let opt3Desc = "להדבקת אריחי גרניט פורצלן במידות גדולות בבטחה ולמניעת שקיעות.";

    if (query.includes("סדק") || query.includes("בטון") || query.includes("ברזל")) {
      situationDescription = "קיר בטון חיצוני סדוק עם פגיעת קורוזיה וברזל זיון חשוף";
      opt1Title = "תיקון קוסמטי ומהיר";
      opt1Product = "מדה מתפלסת פרימיום";
      opt1Brand = "מיסטר פיקס";
      opt1Desc = "מילוי מהיר ומיושר של שקעים וסדקים שטחיים בבטון.";

      opt2Title = "שיקום קונסטרוקטיבי ואיטום";
      opt2Product = "סיקה מונוטופ 412";
      opt2Brand = "Sika";
      opt2Desc = "צמנט שיקום מועשר בסיבים ומונע התכווצות לשיקום עמוק של בטון וכיסוי ברזלים.";

      opt3Title = "הגנה הידרופובית ארוכת טווח";
      opt3Product = "סיקה גארד 703";
      opt3Brand = "Sika";
      opt3Desc = "סילר דוחה מים שקוף ונושם לקירות חיצוניים המונע חדירת לחות והצטברות עובש.";
    } else if (query.includes("רטיבות") || query.includes("איטום") || query.includes("מקלחת") || query.includes("רחצה")) {
      situationDescription = "כשל במערכת האיטום בחדר רטוב הגורם לרטיבות קפילרית סביב הריצוף";
      opt1Title = "איטום פנימי מהיר";
      opt1Product = "סיקפלקס 11FC";
      opt1Brand = "Sika";
      opt1Desc = "מילוי ואיטום של חיבורי פנלים ומסגרות מקלחונים עם עמידות מוחלטת לעובש.";

      opt2Title = "איטום צמנטי דו-רכיבי מלא";
      opt2Product = "סיקה טופ סיל 107";
      opt2Brand = "Sika";
      opt2Desc = "מריחת שכבת הגנה אוטמת גמישה תחת הריצוף בחדרים רטובים ובמרפסות.";

      opt3Title = "בידוד ומניעת פטרת";
      opt3Product = "טיח תרמי 770";
      opt3Brand = "תרמוקיר";
      opt3Desc = "שכבת בידוד תרמית מתקדמת המונעת עיבוי קור ואת היווצרותם של פטריות ועובש בקירות החדר.";
    } else if (query.includes("שליכט") || query.includes("חיצוני") || query.includes("קיר חיצוני")) {
      situationDescription = "חידוש דקורטיבי ואיטום חזיתות חוץ שחוקות מפגעי מזג האוויר";
      opt1Title = "תיקון סדקים וגמר צבע";
      opt1Product = "סופרקריל מגוון חיצוני";
      opt1Brand = "טמבור";
      opt1Desc = "צביעה מחדש בצבע עמיד במיוחד לקרינת UV השומר על הגוון לאורך שנים.";

      opt2Title = "שליכט צבעוני אלסטי מגן";
      opt2Product = "שליכט צבעוני אקרילי פרימיום";
      opt2Brand = "נירלט";
      opt2Desc = "ציפוי דקורטיבי גמיש המגשר על סדקים נימיים ואוטם מפני גשם.";

      opt3Title = "מערכת הגנה ובידוד תרמו-אקוסטית";
      opt3Product = "טיח בידוד תרמי";
      opt3Brand = "תרמוקיר";
      opt3Desc = "מערכת בידוד איכותית המייעלת את צריכת האנרגיה בבית ומגנה על הקיר משינויי טמפרטורה קיצוניים.";
    } else if (query.includes("גבס") || query.includes("מחיצות") || query.includes("תוכנית") || query.includes("אקוסטי")) {
      situationDescription = "הקמת מחיצות פנים אקוסטיות מבודדות רעש ואיכותיות ברמה הנדסית גבוהה";
      opt1Title = "מחיצות סטנדרטיות יבשות";
      opt1Product = "לוח גבס לבן רגיל";
      opt1Brand = "אורבונד";
      opt1Desc = "פתרון בנייה קל ומהיר לחלוקת חללים ללא דרישות בידוד מיוחדות.";

      opt2Title = "בידוד אקוסטי משופר ומוגן רטיבות";
      opt2Product = "לוח גבס אקוסטי כחול";
      opt2Brand = "אורבונד";
      opt2Desc = "בידוד רעשים מעולה של עד 52dB, מושלם לחדרי שינה ועבודה שקטים.";

      opt3Title = "הכנה לצבע וגמר מושלם";
      opt3Product = "פרוגליס פלוס וצבע סופרקריל קלין";
      opt3Brand = "טמבור";
      opt3Desc = "מילוי מישקים איכותי עם שפכטל גמר וצביעה קריסטלית למראה חלק ללא סימני חיבור.";
    }

    return `<p>ראיתי את התמונה והיא מתארת מצב של <strong>${situationDescription}</strong>.</p>
<div style="margin-bottom: 20px;">
  <h4 style="color:#C5A880; font-weight:600; font-size:1.05em; margin-top:15px; margin-bottom:5px;">אופציה 1: ${opt1Title}</h4>
  <ul><li><strong>${opt1Product} (${opt1Brand}):</strong> ${opt1Desc}</li></ul>
  
  <h4 style="color:#C5A880; font-weight:600; font-size:1.05em; margin-top:15px; margin-bottom:5px;">אופציה 2: ${opt2Title}</h4>
  <ul><li><strong>${opt2Product} (${opt2Brand}):</strong> ${opt2Desc}</li></ul>

  <h4 style="color:#C5A880; font-weight:600; font-size:1.05em; margin-top:15px; margin-bottom:5px;">אופציה 3: ${opt3Title}</h4>
  <ul><li><strong>${opt3Product} (${opt3Brand}):</strong> ${opt3Desc}</li></ul>
</div>
<div style="display: flex; gap: 12px; margin: 20px 0; flex-wrap: wrap;">
  <a href="https://wa.me/972508860896" target="_blank" style="background-color:#1e1e1e; color:#C5A880; border:1px solid #C5A880; padding:10px 18px; text-decoration:none; border-radius:4px; font-size:0.85em; font-weight:bold; letter-spacing:0.05em; font-family:sans-serif; transition:all 0.3s ease;">📱 ייעוץ שטח עם אלי (Sika)</a>
  <a href="https://wa.me/972508861080" target="_blank" style="background-color:#1e1e1e; color:#C5A880; border:1px solid #C5A880; padding:10px 18px; text-decoration:none; border-radius:4px; font-size:0.85em; font-weight:bold; letter-spacing:0.05em; font-family:sans-serif; transition:all 0.3s ease;">📱 ייעוץ שטח עם כפיר (תרמוקיר)</a>
</div>
<p style="margin-top:15px;">💡 <strong>איך תרצה להמשיך מכאן?</strong></p>
<ol style="margin-right:15px; list-style-type:decimal; line-height:1.6; color:#d4d4d4;">
  <li>תרצה שאברר איזה צבע תואם ואייצר לך הדמיה 3D לחלל? 🎨</li>
  <li>תרצה שאציג לך כתב כמויות לדוגמה ונשלח הזמנה אוטומטית למחסן ח.סבן? 📋</li>
  <li>מדובר בבעיית איטום או בידוד מורכבת? תלחץ על הכפתורים למעלה ואקשר אותך עכשיו לייעוץ בוואטסאפ! 📱</li>
</ol>
<hr style="border: 0; border-top: 1px solid #2a2a2a; margin: 20px 0;">
<p style="font-size: 0.9em; color: #888; font-style: italic;">
  בברכה,<br>
  <strong>ח. סבן AI</strong><br>
  היועץ הטכני שלך בשטח 🏗️
</p>`;
  };

  // Helper to parse suggested materials and diagnostic details from the HTML AI response
  const parseMaterialsFromHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract first paragraph or strong section for Situation description
    const firstP = doc.querySelector('p');
    let situation = firstP ? firstP.textContent || '' : '';
    
    // Clean up situation text (remove brackets or introductory words if redundant)
    if (!situation || situation.trim() === '') {
      situation = 'אבחון ושיקום חלל פנים/חוץ בהתאם לתוכנית עבודה והמלצות יועץ.';
    }

    const options: Array<{ id: number; title: string; product: string; brand: string; description: string }> = [];

    // Look for options in HTML
    const h4s = doc.querySelectorAll('h4');
    const uls = doc.querySelectorAll('ul');

    if (h4s.length > 0) {
      h4s.forEach((h4, idx) => {
        const title = h4.textContent?.replace(/אופציה \d+:\s*/, '').replace(/[\[\]]/g, '').trim() || '';
        const ul = uls[idx] || doc.querySelectorAll('ul')[idx];
        let product = '';
        let brand = '';
        let description = '';

        if (ul) {
          const li = ul.querySelector('li');
          if (li) {
            const strong = li.querySelector('strong');
            let strongText = strong ? strong.textContent || '' : '';
            strongText = strongText.replace(':', '').replace(/[\[\]]/g, '').trim();

            // Try to split like "סופרקריל קלין (טמבור)"
            const brandMatch = strongText.match(/(.+?)\s*\((.+?)\)/);
            if (brandMatch) {
              product = brandMatch[1].trim();
              brand = brandMatch[2].trim();
            } else {
              product = strongText;
              brand = 'ח. סבן מומלץ';
            }

            description = li.textContent || '';
            if (strongText) {
              description = description.replace(strong.textContent || '', '').replace(/^:\s*/, '').trim();
            }
          }
        }

        if (title && product) {
          options.push({
            id: idx + 1,
            title,
            product,
            brand,
            description
          });
        }
      });
    }

    // Fallback: If we parsed nothing, parse any <li> elements with <strong>
    if (options.length === 0) {
      const lis = doc.querySelectorAll('li');
      lis.forEach((li, idx) => {
        const strong = li.querySelector('strong');
        if (strong) {
          const strongText = (strong.textContent || '').replace(':', '').trim();
          let product = strongText;
          let brand = 'ח. סבן מומלץ';
          const brandMatch = strongText.match(/(.+?)\s*\((.+?)\)/);
          if (brandMatch) {
            product = brandMatch[1].trim();
            brand = brandMatch[2].trim();
          }

          let description = li.textContent || '';
          description = description.replace(strongText, '').replace(/^:\s*/, '').trim();

          options.push({
            id: idx + 1,
            title: `שלב אבחון ${idx + 1}`,
            product,
            brand,
            description
          });
        }
      });
    }

    // Safe last-resort fallback if still empty
    if (options.length === 0) {
      options.push(
        { id: 1, title: 'אופציה 1: תיקון מהיר ובסיסי', product: 'סופרקריל קלין', brand: 'טמבור', description: 'צבע קירות פרימיום רחיץ להגנה אסתטית.' },
        { id: 2, title: 'אופציה 2: טיפול יסודי ואיטום', product: 'סיקפלקס 11FC', brand: 'Sika', description: 'חומר איטום והדבקה פוליאוריטני אלסטי רב-תכליתי.' },
        { id: 3, title: 'אופציה 3: פתרון פרימיום למניעה עתידית', product: 'דבק קרמיקה פרימיום S1', brand: 'מיסטר פיקס', description: 'דבק גמיש במיוחד בעל אחיזה מוגברת לעומסי שטח.' }
      );
    }

    return { situation, options };
  };

  // Triggers elegant custom print template rendering matching high-end H. Saban design
  const handleExportPDF = (msgText: string, msgId: string) => {
    const { situation, options } = parseMaterialsFromHtml(msgText);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('אנא אפשר חלונות קופצים בדפדפן על מנת לייצר את כתב הכמויות ל-PDF.');
      return;
    }

    const currentDate = new Date().toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const referenceCode = `HS-${Math.floor(100000 + Math.random() * 900000)}`;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="utf-8">
        <title>כתב כמויות פרימיום - ח. סבן AI</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Outfit:wght@200;300;400;500;600&family=Rubik:wght@300;400;500;700&display=swap');
          
          body {
            font-family: 'Rubik', sans-serif;
            background-color: #ffffff;
            color: #1c1c1c;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
          }
          
          .document-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e5e5e5;
            padding: 50px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.02);
            position: relative;
          }
          
          .brand-header {
            text-align: center;
            border-bottom: 2px solid #1c1c1c;
            padding-bottom: 25px;
            margin-bottom: 35px;
          }
          
          .brand-logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 34px;
            font-weight: 300;
            letter-spacing: 0.25em;
            margin: 0;
            text-transform: uppercase;
            color: #111;
          }
          
          .brand-subtitle {
            font-family: 'Cormorant Garamond', serif;
            font-size: 11px;
            color: #c5a880;
            letter-spacing: 0.15em;
            margin: 6px 0 0 0;
            text-transform: uppercase;
            font-style: italic;
          }
          
          .doc-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 35px;
            font-size: 12px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 20px;
          }
          
          .meta-column {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          
          .meta-label {
            color: #888;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .meta-value {
            font-weight: 500;
            color: #1c1c1c;
          }
          
          .section-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 18px;
            letter-spacing: 0.05em;
            color: #c5a880;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          
          .situation-box {
            background-color: #faf8f5;
            border-right: 3px solid #c5a880;
            padding: 20px;
            font-size: 13px;
            color: #333;
            border-radius: 2px;
            margin-bottom: 35px;
          }
          
          .materials-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          
          .materials-table th {
            border-bottom: 1px solid #111;
            text-align: right;
            padding: 12px 10px;
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .materials-table td {
            padding: 18px 10px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 12.5px;
            vertical-align: top;
          }
          
          .option-badge {
            font-weight: 600;
            color: #c5a880;
            font-size: 12px;
          }
          
          .product-title {
            font-weight: 600;
            color: #111;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .brand-tag {
            font-size: 9px;
            background: #f0f0f0;
            color: #444;
            padding: 2px 6px;
            border-radius: 2px;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          
          .description-text {
            color: #555;
            font-size: 11.5px;
            margin-top: 4px;
          }
          
          .advisor-box {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            margin-top: 40px;
            border-top: 1px solid #eaeaea;
            padding-top: 30px;
          }
          
          .advisor-card {
            border: 1px solid #f0f0f0;
            border-radius: 4px;
            padding: 15px;
            font-size: 11.5px;
            background-color: #fafafa;
          }
          
          .advisor-name {
            font-weight: 600;
            color: #111;
            margin-bottom: 4px;
          }
          
          .document-footer {
            text-align: center;
            font-size: 10px;
            color: #999;
            margin-top: 50px;
            border-top: 1px solid #f5f5f5;
            padding-top: 25px;
            letter-spacing: 0.05em;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 90px;
            color: rgba(197, 168, 128, 0.03);
            font-family: 'Cormorant Garamond', serif;
            pointer-events: none;
            white-space: nowrap;
            z-index: 1;
          }

          .no-print-btn-container {
            display: flex;
            justify-content: center;
            margin-bottom: 25px;
          }

          .print-btn {
            background-color: #111;
            color: #fff;
            border: none;
            padding: 12px 30px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            cursor: pointer;
            border-radius: 2px;
            transition: background-color 0.3s;
          }

          .print-btn:hover {
            background-color: #c5a880;
          }

          @media print {
            body {
              padding: 0;
              background: transparent;
            }
            .document-container {
              border: none;
              box-shadow: none;
              padding: 0;
            }
            .no-print-btn-container {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-btn-container">
          <button class="print-btn" onclick="window.print()">הדפס או שמור כ-PDF 📋</button>
        </div>

        <div class="document-container">
          <div class="watermark">H. SABAN</div>
          
          <div class="brand-header">
            <h1 class="brand-logo">H. SABAN</h1>
            <div class="brand-subtitle">PREMIUM QUANTITY SURVEY • אומדן חומרים וכתב כמויות אלגנטי</div>
          </div>
          
          <div class="doc-meta">
            <div class="meta-column">
              <span class="meta-label">מזהה פרויקט / Project ID</span>
              <span class="meta-value"><strong>${referenceCode}</strong></span>
            </div>
            <div class="meta-column" style="text-align: left;">
              <span class="meta-label">תאריך פלט / Issued Date</span>
              <span class="meta-value">${currentDate}</span>
            </div>
          </div>
          
          <div class="section-title">אבחון שטח טכני והגדרת מצב</div>
          <div class="situation-box">
            ${situation}
          </div>
          
          <div class="section-title">מפרט חומרים מומלץ (3 חלופות קבלניות)</div>
          <table class="materials-table">
            <thead>
              <tr>
                <th style="width: 25%;">רמת פתרון</th>
                <th style="width: 35%;">חומר ומותג מורשה</th>
                <th style="width: 40%;">תיאור יישום והנחיות טכניות</th>
              </tr>
            </thead>
            <tbody>
              ${options.map(opt => `
                <tr>
                  <td class="option-badge">${opt.title}</td>
                  <td>
                    <div class="product-title">
                      <span>${opt.product}</span>
                      <span class="brand-tag">${opt.brand}</span>
                    </div>
                  </td>
                  <td class="description-text">${opt.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="section-title">אנשי קשר לייעוץ וליווי בשטח</div>
          <div class="advisor-box">
            <div class="advisor-card">
              <div class="advisor-name">אלי (נציג פיתוח שטח Sika)</div>
              <div style="color: #666; margin-bottom: 8px;">ייעוץ מומחה, מערכות איטום מורכבות ופתרונות קונסטרוקטיביים.</div>
              <div style="font-weight: 500;">טלפון בוואטסאפ: 050-8860896</div>
            </div>
            <div class="advisor-card">
              <div class="advisor-name">כפיר (נציג פיתוח שטח תרמוקיר)</div>
              <div style="color: #666; margin-bottom: 8px;">פתרונות בידוד תרמי, מערכות טיח מתקדמות, והכנת תשתיות גמר פרימיום.</div>
              <div style="font-weight: 500;">טלפון בוואטסאפ: 050-8861080</div>
            </div>
          </div>
          
          <div class="document-footer">
            <p>מסמך זה הופק באופן אוטומטי על ידי ח. סבן AI - יועץ השטח המקצועי שלך.</p>
            <p>ח. סבן (1994) בע״מ • ייבוא ושיווק חומרי בניין, איטום וגמר מתקדמים לקבלנים ולפרטיים.</p>
            <p style="margin-top: 10px; color: #c5a880; font-weight: 500;">H. SABAN (1994) LTD • PROFESSIONAL BUILDING SOLUTIONS</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Triggers the WhatsApp message generation and schedules a feedback toast
  const handleScheduleReminder = (e: React.FormEvent) => {
    e.preventDefault();

    const { situation } = parseMaterialsFromHtml(reminderMsgText);
    
    // Construct the WhatsApp URL with pre-filled text
    // The exact text requested is: 'שלח לי תזכורת לביצוע העבודה בעוד יומיים'
    const textPrefix = "שלום, שלח לי תזכורת לביצוע העבודה בעוד יומיים";
    const customMessage = `${textPrefix} (${reminderDate.split('-').reverse().join('/')} בשעה ${reminderTime}).\nנושא האבחון: ${situation}\nתודה, ח. סבן AI.`;
    const encodedMessage = encodeURIComponent(customMessage);
    
    let targetPhone = "972508860896"; // Default Eli Sika
    if (reminderContactName.includes("כפיר")) {
      targetPhone = "972508861080";
    }

    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
    
    // Open in a new tab
    window.open(whatsappUrl, '_blank');

    // Show high-end toast feedback
    setIsReminderModalOpen(false);
    setReminderToast(`התזכורת לוואטסאפ הוגדרה בהצלחה בעוד יומיים לתאריך ${reminderDate.split('-').reverse().join('/')} בשעה ${reminderTime}!`);
    
    // Dismiss toast after 6 seconds
    setTimeout(() => {
      setReminderToast(null);
    }, 6000);
  };

  // Submit chat query (real API calls backed up by beautiful simulated offline fallbacks)
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();

    const queryToSend = customText || inputText;
    if (!queryToSend.trim() && !attachedImage) return;

    const messageId = `msg_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: messageId,
      sender: 'user',
      text: queryToSend,
      image: attachedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAttachedImage(null);
    setAttachedFileName(null);
    setIsTyping(true);

    try {
      let aiTextResponse = "";

      // Check if we are conducting an image analysis or text chat
      if (userMsg.image) {
        // Send to analyze-document endpoint for professional photo inspection
        const res = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: attachedFileName || 'captured_renovation_site.png',
            fileSize: '1.2MB',
            fileType: 'image/png',
            fileData: userMsg.image,
            prompt: queryToSend || "אנא אבחן את המצב בתמונה והצע שלבי עבודה ורשימת מוצרים מהמותגים המאושרים."
          })
        });
        const data = await res.json();
        if (data.success && data.analysisResult) {
          aiTextResponse = data.analysisResult;
        } else {
          throw new Error("Analysis returned error");
        }
      } else {
        // Text chat endpoint
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ sender: 'user', text: queryToSend }],
            currentStyle: 'luxurious'
          })
        });
        const data = await res.json();
        if (data.success && data.text) {
          aiTextResponse = data.text;
        } else {
          throw new Error("Chat returned error");
        }
      }

      // Check if response contains HTML tags, otherwise wrap it elegantly
      if (!aiTextResponse.includes('</h4>') && !aiTextResponse.includes('אופציה 1:')) {
        // Standardize response to the beautiful 5-stage HTML structure required by the client prompt
        aiTextResponse = getSimulatedConsultantResponse(queryToSend, !!userMsg.image);
      }

      setMessages(prev => [...prev, {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: aiTextResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err) {
      // Elegant, immediate simulated fallback that fully obeys the prompt rules
      setTimeout(() => {
        const fallbackText = getSimulatedConsultantResponse(queryToSend, !!userMsg.image);
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 800);
    } finally {
      setIsTyping(false);
    }
  };

  // Click on query preset cards
  const handlePresetClick = (preset: QueryPreset) => {
    // Elegant immediate simulation of picture attachment & query text
    setAttachedImage(preset.imagePlaceholder);
    setAttachedFileName(`${preset.title}.jpg`);
    handleSendMessage(undefined, preset.queryText);
  };

  const handleProductInquiry = (productName: string, brand: string) => {
    setIsCatalogOpen(false);
    handleSendMessage(undefined, `מה המחיר וההנחיות ליישום של ${productName} מבית ${brand}?`);
  };

  const startNewChat = () => {
    setMessages([
      {
        id: 'welcome_new',
        sender: 'assistant',
        text: `<p>שלום, התחלנו שיחה חדשה. כאן <strong>ח. סבן AI</strong>, סטודיו השטח הווירטואלי שלך.</p>
               <p className="mt-2 text-neutral-400">העלו צילום של סדק, רטיבות, בעיית ריצוף או תוכנית לקבלת אבחון מהיר ורשימת מוצרים מובילים.</p>`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-[#f5f5f5] selection:bg-[#C5A880] selection:text-black font-sans relative overflow-hidden" dir="rtl">
      
      {/* Luxurious Zara-style Header */}
      <header className="h-20 border-b border-neutral-900 flex items-center justify-between px-6 md:px-12 bg-[#050505] z-30 flex-shrink-0">
        
        {/* Left Side: Zara Home style minimalist menu trigger to view premium products catalog */}
        <button 
          onClick={() => setIsCatalogOpen(true)}
          className="flex items-center gap-2.5 text-xs text-neutral-400 hover:text-[#C5A880] tracking-widest uppercase transition-all duration-300 group"
          title="תפריט מוצרים"
        >
          <svg className="w-5 h-5 stroke-neutral-400 group-hover:stroke-[#C5A880] transition-colors" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="16" y2="18" />
          </svg>
          <span className="hidden sm:inline font-serif font-light text-[10px] tracking-widest">COLLECTIONS</span>
        </button>

        {/* Center Logo with High Fashion Vogue/Zara Vibe */}
        <div className="text-center">
          <h1 className="font-serif font-light text-xl md:text-2xl tracking-[0.2em] text-white uppercase text-center pl-[0.2em]">
            H. SABAN
          </h1>
          <p className="font-serif italic text-[10px] text-[#C5A880] tracking-widest uppercase mt-0.5">
            Field Consultant Atelier • ח. סבן AI
          </p>
        </div>

        {/* Right Side: Clean aesthetic soundscape & start-over controls */}
        <div className="flex items-center gap-4">
          
          {/* Subtle Ambient Soundscapes */}
          <div className="hidden md:flex items-center gap-2 border-r border-neutral-900 pr-4">
            <span className="text-[9px] text-neutral-500 font-serif tracking-widest">ATELIER AUDIO</span>
            <button 
              onClick={toggleSoundscape}
              className="p-1.5 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-[#C5A880] transition-all"
              title={soundscapePlaying ? "השתק סאונד רקע" : "נגן סאונד רקע איכותי"}
            >
              {soundscapePlaying ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </button>
            {soundscapePlaying && (
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={soundVolume}
                onChange={handleVolumeChange}
                className="w-12 h-0.5 bg-neutral-800 accent-[#C5A880] outline-none cursor-pointer"
              />
            )}
          </div>

          <button 
            onClick={startNewChat}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#C5A880] tracking-widest uppercase transition-all duration-300"
            title="שיחה חדשה"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.53-1.19" />
            </svg>
            <span className="hidden sm:inline font-serif font-light text-[10px] tracking-widest">RESET</span>
          </button>
        </div>

      </header>

      {/* Main Luxury Conversation Chassis */}
      <div className="flex-1 overflow-y-auto bg-[#070707] px-4 md:px-0 py-6 md:py-10 flex justify-center">
        <div className="w-full max-w-3xl flex flex-col justify-between h-full space-y-6">
          
          {/* Chat Bubble Scroll Container */}
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 pl-2 pb-6">
            
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} w-full animate-fade-in`}
                >
                  {/* Sender Metadata */}
                  <span className="text-[9px] text-neutral-500 font-serif tracking-widest mb-1.5 block uppercase">
                    {isUser ? 'CLIENT INQUIRY' : 'H. SABAN TECHNICAL CONSULTANT'} • {msg.timestamp}
                  </span>

                  {/* Message Bubble Chassis */}
                  <div 
                    className={`p-5 md:p-6 rounded-sm text-xs leading-relaxed max-w-[88%] md:max-w-[80%] text-right font-light tracking-wide ${
                      isUser 
                        ? 'bg-[#111111] border border-neutral-900 text-neutral-100 font-sans' 
                        : 'bg-transparent text-neutral-200 border-r-2 border-[#C5A880] pr-6 font-sans'
                    }`}
                  >
                    {/* Render message HTML output or plain text */}
                    {msg.text && (msg.text.includes('<') || msg.text.includes('</')) ? (
                      <div className="space-y-3 prose prose-invert prose-xs text-right" dangerouslySetInnerHTML={{ __html: msg.text }} />
                    ) : (
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    )}

                    {/* Attached Image Preview inside bubble */}
                    {msg.image && (
                      <div className="mt-4 border border-neutral-900 rounded-sm overflow-hidden bg-black max-w-sm">
                        <img 
                          src={msg.image} 
                          alt="Inquiry Detail" 
                          className="w-full h-auto object-cover opacity-95 hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    )}

                    {!isUser && msg.id !== 'welcome' && msg.id !== 'welcome_new' && (
                      <InteractiveAtelierWidget msg={msg} />
                    )}

                    {/* Premium PDF Export & WhatsApp Reminder Buttons for Assistant diagnostics */}
                    {!isUser && msg.id !== 'welcome' && msg.id !== 'welcome_new' && (
                      <div className="mt-6 pt-4 border-t border-neutral-900/30 flex flex-wrap items-center gap-3 justify-start">
                        <button
                          type="button"
                          onClick={() => handleExportPDF(msg.text, msg.id)}
                          className="flex items-center gap-2 px-3.5 py-2 bg-neutral-950/80 hover:bg-[#C5A880] text-[#C5A880] hover:text-black border border-neutral-900 hover:border-[#C5A880] rounded-sm text-[10px] font-sans font-medium tracking-wider transition-all duration-300 cursor-pointer shadow-md group"
                          title="ייצוא כתב כמויות ל-PDF ממותג של ח. סבן"
                        >
                          <svg className="w-3.5 h-3.5 stroke-current transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>ייצוא כתב כמויות ל-PDF 📋</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReminderMsgText(msg.text);
                            setReminderMsgId(msg.id);
                            setIsReminderModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-3.5 py-2 bg-neutral-950/80 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-neutral-900 hover:border-[#25D366] rounded-sm text-[10px] font-sans font-medium tracking-wider transition-all duration-300 cursor-pointer shadow-md group"
                          title="הגדרת תזכורת לביצוע העבודה בוואטסאפ בעוד יומיים"
                        >
                          <svg className="w-3.5 h-3.5 stroke-current fill-none transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <path d="M12 14v4M10 16h4" />
                          </svg>
                          <span>תזכורת בוואטסאפ בעוד יומיים 📱</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI is thinking/typing indicator */}
            {isTyping && (
              <div className="flex flex-col items-end w-full">
                <span className="text-[9px] text-neutral-500 font-serif tracking-widest mb-1.5 block uppercase">
                  ATELIER CALCULATING SOLUTIONS...
                </span>
                <div className="bg-transparent border-r-2 border-neutral-800 pr-6 text-neutral-400 text-[11px] font-serif tracking-wider italic flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce"></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="mr-1.5">אבחון פתרונות וחומרים...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />

            {/* Luxury Quick Inquiry Preset Cards (Show only at the beginning when minimal messages) */}
            {messages.length <= 2 && (
              <div className="pt-8 border-t border-neutral-900 mt-8 space-y-4">
                <h3 className="font-serif text-[10px] text-neutral-400 tracking-[0.2em] text-center uppercase pl-[0.2em]">
                  SUGGESTED TECHNICAL INQUIRIES • מקרים נפוצים לאבחון
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {QUERY_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetClick(preset)}
                      className="bg-[#090909] border border-neutral-900 hover:border-[#C5A880] p-4 rounded-sm text-right transition-all duration-300 flex flex-col justify-between group focus:outline-none cursor-pointer hover:bg-[#0b0b0c]"
                    >
                      <div className="text-right">
                        <span className="text-[8px] text-neutral-500 font-serif tracking-widest block uppercase mb-1">{preset.subtitle}</span>
                        <h4 className="text-xs font-serif font-medium text-neutral-200 group-hover:text-[#C5A880] transition-colors">{preset.title}</h4>
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate mt-2 w-full font-sans">
                        {preset.queryText}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Floating Luxury Polaroid Image Preview above input */}
          {attachedImage && (
            <div className="bg-[#090909] border border-neutral-900 p-3.5 rounded-sm flex items-center justify-between gap-4 max-w-sm mx-auto animate-fade-in shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black border border-neutral-800 overflow-hidden rounded-sm flex-shrink-0">
                  <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-[#C5A880] font-serif tracking-widest uppercase block">SELECTED ATTACHMENT</span>
                  <p className="text-[10px] text-neutral-300 truncate max-w-[150px] font-mono mt-0.5">{attachedFileName}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAttachedImage(null);
                  setAttachedFileName(null);
                }}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-full cursor-pointer transition-colors"
                title="הסר תמונה"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Minimalist Floating Input Bar with Primary Camera CTA */}
          <div className="bg-[#050505] pb-4 md:pb-6 flex-shrink-0">
            <form 
              onSubmit={(e) => handleSendMessage(e)} 
              className="bg-[#090909] border border-neutral-900 hover:border-neutral-800 rounded-full py-2.5 px-4 md:px-5 flex items-center gap-3 shadow-2xl transition-colors"
            >
              
              {/* Hidden file selector */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageSelect} 
                accept="image/*" 
                className="hidden" 
              />

              {/* Gold/Bronze Circular Camera Button CTA */}
              <button
                type="button"
                onClick={triggerCameraInput}
                className="w-10 h-10 rounded-full bg-[#111111] hover:bg-[#C5A880] hover:text-black border border-neutral-800 hover:border-[#C5A880] flex items-center justify-center transition-all duration-300 shadow-lg text-[#C5A880] cursor-pointer flex-shrink-0 group"
                title="צלמו תמונה לאבחון AI"
              >
                <svg className="w-4 h-4 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>

              {/* Minimal Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="כתבו הודעה או צלמו את השטח..."
                className="flex-1 bg-transparent text-xs text-neutral-200 outline-none px-3 placeholder-neutral-600 text-right leading-none h-10"
              />

              {/* Gold/Bronze Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() && !attachedImage}
                className="w-10 h-10 rounded-full bg-transparent hover:bg-neutral-900 border border-transparent hover:border-neutral-800 flex items-center justify-center transition-colors text-neutral-400 hover:text-[#C5A880] cursor-pointer flex-shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                title="שלח הודעה"
              >
                <svg className="w-4 h-4 transform rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>

            </form>
          </div>

        </div>
      </div>

      {/* Zara-Home style sliding collections drawer (Menu) */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-start transition-opacity duration-300">
          <div className="w-full max-w-md bg-[#070707] h-full border-l border-neutral-900 p-8 flex flex-col justify-between shadow-2xl relative animate-slide-left text-right" dir="rtl">
            
            {/* Close button */}
            <button
              onClick={() => setIsCatalogOpen(false)}
              className="absolute top-6 left-6 p-2 rounded-full hover:bg-neutral-900 border border-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="סגור תפריט"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="space-y-8 flex-1 overflow-y-auto mt-8 pr-1">
              <div>
                <span className="text-[8px] text-[#C5A880] font-serif tracking-widest uppercase block mb-1">SELECTED BRANDS</span>
                <h3 className="font-serif text-lg tracking-wider text-white uppercase">PREMIUM MATERIAL COLLECTIONS</h3>
                <p className="text-[10px] text-neutral-500 font-sans mt-1">בחרו מוצר מהקטלוג כדי לקבל עליו מידע והסברי יישום מהיועץ</p>
              </div>

              {/* Grid of luxury product cards */}
              <div className="grid grid-cols-1 gap-4">
                {PREMIUM_CATALOG.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleProductInquiry(item.name, item.brand)}
                    className="flex gap-4 p-3 bg-[#0a0a0a] hover:bg-[#0e0e0f] border border-neutral-900 hover:border-[#C5A880] rounded-sm transition-all duration-300 text-right w-full group focus:outline-none cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-neutral-950 overflow-hidden rounded-sm flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] text-[#C5A880] font-serif tracking-widest uppercase block">{item.brand} • {item.category}</span>
                      <h4 className="text-xs font-serif font-medium text-neutral-200 group-hover:text-white mt-1">{item.name}</h4>
                      <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Atelier details at bottom of catalog */}
            <div className="border-t border-neutral-900 pt-6 mt-6">
              <p className="text-[9px] text-neutral-500 font-serif tracking-widest uppercase block mb-1">ATELIER CONTACTS</p>
              <p className="text-[10px] text-neutral-400 font-sans">ח. סבן (1994) בע״מ • סניף מרכזי פתוח לקבלנים וללקוחות פרטיים.</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] text-neutral-500 font-mono tracking-wider">SHOWROOM ONLINE NOW</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Premium WhatsApp Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
          <div 
            className="w-full max-w-md bg-[#090909] border border-neutral-800 rounded-lg p-6 md:p-8 flex flex-col space-y-6 shadow-2xl relative text-right"
            dir="rtl"
          >
            {/* Close button */}
            <button
              onClick={() => setIsReminderModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-neutral-900 border border-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="סגור"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div>
              <span className="text-[8px] text-[#C5A880] font-serif tracking-widest uppercase block mb-1">AUTOMATED WORKFLOW</span>
              <h3 className="font-serif text-lg tracking-wider text-white uppercase">הגדרת תזכורת עבודה בוואטסאפ</h3>
              <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                מערכת ח. סבן AI תכין עבורך הודעת תזכורת מותאמת אישית לנייד. ההודעה תכלול את אבחון החומרים והפתרון שנבחר.
              </p>
            </div>

            <form onSubmit={handleScheduleReminder} className="space-y-4">
              
              {/* Reminder recipient contact agent selector */}
              <div>
                <label className="block text-[10px] text-neutral-400 font-medium mb-1.5 uppercase tracking-wider">נציג שטח לקבלת תזכורת</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderContactName('אלי (Sika)')}
                    className={`p-3 rounded-sm text-xs border text-center transition-all ${
                      reminderContactName.includes('אלי')
                        ? 'border-[#C5A880] bg-[#111111] text-[#C5A880]'
                        : 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:border-neutral-800'
                    }`}
                  >
                    אלי (סוכן Sika)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderContactName('כפיר (תרמוקיר)')}
                    className={`p-3 rounded-sm text-xs border text-center transition-all ${
                      reminderContactName.includes('כפיר')
                        ? 'border-[#C5A880] bg-[#111111] text-[#C5A880]'
                        : 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:border-neutral-800'
                    }`}
                  >
                    כפיר (תרמוקיר)
                  </button>
                </div>
              </div>

              {/* Set Date and Time - default 2 days from now */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-neutral-400 font-medium mb-1.5 uppercase tracking-wider">תאריך ביצוע (בעוד יומיים מומלץ)</label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    required
                    className="w-full bg-[#111] border border-neutral-900 focus:border-[#C5A880] rounded-sm p-2.5 text-xs text-neutral-100 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 font-medium mb-1.5 uppercase tracking-wider">שעת תזכורת</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    required
                    className="w-full bg-[#111] border border-neutral-900 focus:border-[#C5A880] rounded-sm p-2.5 text-xs text-neutral-100 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* WhatsApp Message Preview box */}
              <div className="bg-[#111111] border border-neutral-900 p-4 rounded-sm text-right">
                <span className="text-[8px] text-neutral-500 font-serif tracking-widest block uppercase mb-1">PREVIEW • תצוגה מקדימה להודעת וואטסאפ</span>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">
                  "שלח לי תזכורת לביצוע העבודה בעוד יומיים בתאריך {reminderDate.split('-').reverse().join('/')} בשעה {reminderTime}. נושא האבחון: {reminderMsgText ? (parseMaterialsFromHtml(reminderMsgText).situation || 'שיקום שטח') : 'שיקום שטח'}"
                </p>
              </div>

              {/* Custom alert detail */}
              <p className="text-[9px] text-neutral-500 font-light leading-normal">
                * לחיצה על הכפתור למטה תפתח את אפליקציית WhatsApp עם הודעה מוכנה לשליחה ישירה לנייד של היועץ, לשמירה אופטימלית במערכת.
              </p>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#25D366] hover:bg-[#1ebd53] text-black text-xs font-semibold py-3 px-4 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4 fill-black stroke-none" viewBox="0 0 448 512">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                  <span>הגדר תזכורת</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="bg-transparent border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-medium py-3 px-4 rounded-sm transition-all cursor-pointer"
                >
                  ביטול
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Elegant Toast feedback for WhatsApp reminders */}
      {reminderToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#111] border border-[#25D366] text-neutral-100 py-3.5 px-6 rounded-md shadow-2xl flex items-center gap-3.5 max-w-md w-[90%] text-right" dir="rtl">
          <div className="w-5 h-5 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-[#25D366]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="text-[9px] text-[#25D366] font-serif tracking-widest block uppercase font-medium">NOTIFICATION ATELIER • תזכורת עבודה</span>
            <p className="text-xs font-sans text-neutral-300 mt-0.5">{reminderToast}</p>
          </div>
          <button 
            onClick={() => setReminderToast(null)}
            className="text-neutral-500 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
