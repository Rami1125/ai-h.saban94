import React from 'react';
import { ROOM_PRESETS } from '../presets';
import { RoomPreset } from '../types';
import { LayoutGrid, Bed, Utensils, Sofa } from 'lucide-react';

interface PresetSelectorProps {
  selectedRoomId: string;
  onSelectRoom: (room: RoomPreset) => void;
}

export default function PresetSelector({
  selectedRoomId,
  onSelectRoom
}: PresetSelectorProps) {
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'living_room': return <Sofa className="w-4 h-4" />;
      case 'bedroom': return <Bed className="w-4 h-4" />;
      case 'dining_room': return <Utensils className="w-4 h-4" />;
      default: return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <div id="preset-selector-section" className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        או נסו חדרים מוכנים מראש
      </h3>

      <div id="preset-rooms-tabs" className="flex flex-col sm:flex-row gap-2">
        {ROOM_PRESETS.map((room) => {
          const isSelected = room.id === selectedRoomId;
          return (
            <button
              key={room.id}
              id={`preset-room-tab-${room.id}`}
              onClick={() => onSelectRoom(room)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 text-start rounded-xl border text-xs font-medium transition-all duration-300 outline-none w-full sm:w-auto cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500/30 text-amber-400' : 'bg-white/5 text-gray-400'}`}>
                {getCategoryIcon(room.category)}
              </div>
              <div className="flex flex-col text-start">
                <span className="font-bold">{room.name}</span>
                <span className={`text-[10px] leading-none mt-0.5 ${isSelected ? 'text-amber-200/60' : 'text-gray-500'}`}>
                  {room.description.split('.')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
