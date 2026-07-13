import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, ArrowUpCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageUploaded: (base64Data: string) => void;
  onClearImage: () => void;
  currentImage: string | null;
}

export default function ImageUploader({
  onImageUploaded,
  onClearImage,
  currentImage
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("אנא העלה קובץ תמונה תקין (PNG, JPEG וכדומה).");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageUploaded(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="image-uploader-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Upload className="w-4.5 h-4.5 text-gray-500" /> העלה תמונה של החדר שלך
        </h3>
        {currentImage && (
          <button
            onClick={onClearImage}
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> נקה העלאה
          </button>
        )}
      </div>

      <div
        id="upload-drag-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={currentImage ? undefined : triggerFileSelect}
        className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
          currentImage 
            ? 'border-white/10 bg-white/5 p-4' 
            : isDragging
              ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
              : 'border-white/10 bg-white/5 hover:border-white/20 cursor-pointer'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {currentImage ? (
          <div className="flex items-center gap-4 w-full">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md flex-shrink-0">
              <img
                src={currentImage}
                alt="Uploaded Room Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="text-start flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-amber-500" /> חדר מותאם אישית פעיל
              </h4>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-snug">
                התמונה שהעלית מוגדרת כבסיס. בחר סגנון עיצוב למעלה כדי להתחיל מהפך AI בעיצוב החדר.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shadow-inner text-gray-400">
              <ArrowUpCircle className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-300">
                גרור ושחרר את התמונה כאן, או <span className="text-white underline decoration-white/20">לחץ לבחירה</span>
              </p>
              <p className="text-[10px] text-gray-500">
                תומך ב-PNG, JPG, WEBP (תוצאות מיטביות ביחס גובה-רוחב רוחבי)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
