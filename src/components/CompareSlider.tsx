import React, { useState, useRef, useEffect } from 'react';
import { Sliders, ArrowLeftRight } from 'lucide-react';

interface CompareSliderProps {
  originalSrc: string;
  redesignedSrc: string;
  originalLabel?: string;
  redesignedLabel?: string;
}

export default function CompareSlider({
  originalSrc,
  redesignedSrc,
  originalLabel = "חדר מקורי",
  redesignedLabel = "עיצוב מחדש AI"
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div 
      id="compare-slider-container"
      ref={containerRef}
      className="relative w-full aspect-[4/3] sm:aspect-video select-none overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-gray-900 cursor-ew-resize group"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Original Image (Base Layer) */}
      <img
        id="compare-original-img"
        src={originalSrc}
        alt="Original Space"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        referrerPolicy="no-referrer"
      />
      
      {/* Label for Original */}
      <div className="absolute top-4 left-6 z-10 px-3 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] uppercase font-bold tracking-widest text-white">
        {originalLabel}
      </div>

      {/* Redesigned Image (Top Layer - Width Clipped) */}
      <div 
        className="absolute inset-y-0 left-0 right-0 overflow-hidden pointer-events-none transition-all duration-75"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          id="compare-redesigned-img"
          src={redesignedSrc}
          alt="AI Redesigned Space"
          className="absolute inset-0 w-full h-full object-cover max-w-none pointer-events-none"
          style={{ width: containerRef.current?.getBoundingClientRect().width || '100%', height: containerRef.current?.getBoundingClientRect().height || '100%' }}
          referrerPolicy="no-referrer"
        />
        
        {/* Label for Redesigned */}
        <div className="absolute top-4 right-6 z-10 px-3 py-1 bg-amber-500 rounded-md text-[10px] uppercase font-bold tracking-widest text-black whitespace-nowrap font-bold">
          {redesignedLabel}
        </div>
      </div>

      {/* Slider Divider Line */}
      <div 
        id="compare-slider-bar"
        className="absolute inset-y-0 w-1 bg-white/50 backdrop-blur-sm z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Center Button Handle */}
        <div 
          id="compare-slider-handle"
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-transform duration-200 ease-out group-hover:scale-105 hover:!scale-115 active:scale-95 cursor-grab pointer-events-auto"
        >
          <ArrowLeftRight className="w-5 h-5 text-black" />
        </div>
      </div>
      
      {/* Hint overlay on hover */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white backdrop-blur-md px-4 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium flex items-center gap-1.5">
        <Sliders className="w-3 h-3 text-white" /> גרור את הידית ימינה/שמאלה להשוואה
      </div>
    </div>
  );
}
