import React from 'react';
import { STYLE_PRESETS } from '../presets';
import { StylePreset } from '../types';
import { Sparkles, Check } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyleId: string;
  onSelectStyle: (style: StylePreset) => void;
}

export default function StyleSelector({
  selectedStyleId,
  onSelectStyle
}: StyleSelectorProps) {
  return (
    <div id="style-selector-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> בחר סגנון עיצוב AI
        </h3>
        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
          6 סגנונות זמינים
        </span>
      </div>

      <div id="style-presets-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {STYLE_PRESETS.map((style) => {
          const isSelected = style.id === selectedStyleId;
          return (
            <button
              key={style.id}
              id={`style-preset-btn-${style.id}`}
              onClick={() => onSelectStyle(style)}
              className={`relative flex flex-col items-center justify-between text-left overflow-hidden rounded-xl border p-3 transition-all duration-300 group outline-none cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/20 shadow-lg ring-2 ring-amber-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-md'
              }`}
            >
              {/* Image Preview */}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2">
                <img
                  src={style.unsplashUrl}
                  alt={style.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-amber-500 text-black p-1 rounded-full shadow-lg">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Title & Specs */}
              <div className="w-full space-y-0.5 text-center">
                <h4 className={`text-xs font-bold truncate transition-colors ${
                  isSelected ? 'text-amber-400' : 'text-gray-300 group-hover:text-white'
                }`}>
                  {style.name}
                </h4>
                <p className={`text-[9px] line-clamp-1 leading-tight uppercase tracking-wider font-semibold transition-colors ${
                  isSelected ? 'text-amber-200/60' : 'text-gray-500 group-hover:text-gray-400'
                }`}>
                  {isSelected ? 'נבחר' : style.keywords[0]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
