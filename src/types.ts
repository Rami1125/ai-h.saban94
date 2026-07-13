export interface StylePreset {
  id: string;
  name: string;
  description: string;
  unsplashUrl: string;
  keywords: string[];
}

export interface RoomPreset {
  id: string;
  name: string;
  category: 'living_room' | 'bedroom' | 'dining_room' | 'office';
  description: string;
  originalUrl: string;
  styles: Record<string, string>; // Maps styleId -> Unsplash image URL
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  products?: ShoppableItem[];
  isRefining?: boolean;
}

export interface ShoppableItem {
  id: string;
  name: string;
  price: string;
  matchPercentage: number;
  imageUrl: string;
  buyUrl: string;
  category: string;
}

export interface RedesignRequest {
  image: string; // base64 representation of the room
  styleId: string;
  styleName: string;
  prompt?: string;
}

export interface RedesignResponse {
  success: boolean;
  imageUrl: string;
  description: string;
  products?: ShoppableItem[];
  error?: string;
}
