import { StylePreset, RoomPreset } from './types';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'mid_century',
    name: 'מודרני של אמצע המאה',
    description: 'צורות אורגניות, עץ אגוז, קווים גאומטריים נקיים, וצבעי סתיו חמים כמו חרדל וחלודה.',
    unsplashUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    keywords: ['עץ אגוז', 'קווים מעוגלים', 'רגליים מחודדות', 'צהוב חרדל', 'כתום חלודה', 'שטיח גאומטרי', 'נגיעות פליז']
  },
  {
    id: 'scandinavian',
    name: 'עיצוב סקנדינבי',
    description: 'מינימליזם בהיר ומאוורר. התמקדות בפונקציונליות, עץ אלון בהיר, טקסטיל נעים (היגה) וגוונים ניטרליים של לבן ואפור.',
    unsplashUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    keywords: ['אלון בהיר', 'מינימליסטי', 'קירות לבנים', 'ספת פשתן', 'שטיח צמר', 'עציצים', 'אור טבעי']
  },
  {
    id: 'industrial',
    name: 'לופט תעשייתי',
    description: 'שילוב אלמנטים גולמיים וכפריים עם סגנון אורבני. קירות לבנים חשופים, עור כהה, שילוב מתכת שחורה ובטון.',
    unsplashUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    keywords: ['לבנים חשופות', 'פלדה שחורה', 'עץ ממוחזר', 'ספת צ\'סטרפילד', 'רצפת בטון', 'מסגרת מתכת', 'טקסטורות גולמיות']
  },
  {
    id: 'japandi',
    name: 'סגנון ג\'פנדי (Japandi)',
    description: 'מיזוג של מינימליזם אמנותי יפני ופונקציונליות סקנדינבית חמימה. פשטות וואבי-סאבי, גוונים ניטרליים חמים וחימר גולמי.',
    unsplashUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    keywords: ['במבוק', 'ריהוט נמוך', 'וואבי-סאבי', 'כלי חרס', 'גוונים ניטרליים', 'בדי פשתן', 'מחיצות הזזה']
  },
  {
    id: 'bohemian',
    name: 'בוהו שיק כפרי',
    description: 'שכבות של טקסטורות, דוגמאות תוססות, ריהוט קש טבעי, צמחי בית מטפסים שופעים ואסתטיקה נינוחה בהשראה עולמית.',
    unsplashUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    keywords: ['קש טבעי', 'מקרמה', 'שטיח פרסי', 'צמחים מטפסים', 'טרקוטה', 'כריות צבעוניות', 'טקסטורות מגוונות']
  },
  {
    id: 'biophilic',
    name: 'עיצוב ביופילי (טבעי)',
    description: 'שילוב עמוק של הטבע בתוך הבית. גינות קיר אנכיות, אלמנטים של מים, שפע אור טבעי ופרטי עץ אורגניים.',
    unsplashUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    keywords: ['קיר צמחייה אנכי', 'לוחות עץ גולמי', 'אלמנטים מאבן', 'שפע צמחים', 'אור שמש טבעי', 'ירוק אדמתי', 'פשתן']
  }
];

export const ROOM_PRESETS: RoomPreset[] = [
  {
    id: 'living_room_1',
    name: 'סלון פרברי שטוף שמש',
    category: 'living_room',
    description: 'סלון טיפוסי עמוס עם שטיח מקיר לקיר בגוון בז\', ריהוט בסיסי, וילונות מיושנים וקירות ריקים.',
    originalUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    styles: {
      mid_century: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      scandinavian: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      industrial: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
      japandi: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
      bohemian: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
      biophilic: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id: 'bedroom_1',
    name: 'חדר שינה סטנדרטי רגיל',
    category: 'bedroom',
    description: 'חדר שינה פשוט עם מסגרת מיטה ממתכת בסיסית, מצעים לבנים משעממים, קירות סטריליים ותאורת פלורסנט פשוטה.',
    originalUrl: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=800&q=80',
    styles: {
      mid_century: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      scandinavian: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      industrial: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      japandi: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
      bohemian: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      biophilic: 'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id: 'dining_room_1',
    name: 'פינת אוכל מיושנת מעץ',
    category: 'dining_room',
    description: 'חדר אוכל מיושן עם ריהוט עץ דובדבן כבד, טפט עם דוגמה מיושנת ונברשות מאובקות.',
    originalUrl: 'https://images.unsplash.com/photo-1577156209599-56552f17169c?auto=format&fit=crop&w=800&q=80',
    styles: {
      mid_century: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
      scandinavian: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=800&q=80',
      industrial: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=800&q=80',
      japandi: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      bohemian: 'https://images.unsplash.com/photo-1532372320978-9b4d6a3a854c?auto=format&fit=crop&w=800&q=80',
      biophilic: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
    }
  }
];
