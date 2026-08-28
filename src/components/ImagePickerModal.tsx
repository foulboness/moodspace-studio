import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Search,
  Check,
  Plus,
  Compass,
} from 'lucide-react';
import { CURATED_IMAGE_CATEGORIES } from '../data/curatedImages';
import { BoardItem } from '../types';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImage: (imageData: Omit<BoardItem, 'id' | 'zIndex'>) => void;
  canvasViewportCenter: { x: number; y: number };
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onAddImage,
  canvasViewportCenter,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customCaption, setCustomCaption] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Flatten all images
  const allImages = CURATED_IMAGE_CATEGORIES.flatMap(cat =>
    cat.images.map(img => ({ ...img, category: cat.id }))
  );

  const filteredImages = allImages.filter(img => {
    const matchesCategory = activeCategory === 'all' || img.category === activeCategory;
    const matchesSearch = !searchQuery ||
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectCuratedImage = (img: typeof allImages[0]) => {
    onAddImage({
      type: 'image',
      x: canvasViewportCenter.x - 160,
      y: canvasViewportCenter.y - 180,
      width: 320,
      height: 400,
      src: img.url,
      alt: img.title,
      caption: img.caption,
      showCaption: true,
      borderRadius: 4,
      shadow: 'medium',
      objectFit: 'cover',
    });
    onClose();
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    onAddImage({
      type: 'image',
      x: canvasViewportCenter.x - 160,
      y: canvasViewportCenter.y - 180,
      width: 320,
      height: 380,
      src: customUrl.trim(),
      caption: customCaption.trim() || 'Web Image Reference',
      showCaption: !!customCaption.trim(),
      borderRadius: 4,
      shadow: 'medium',
      objectFit: 'cover',
    });
    setCustomUrl('');
    setCustomCaption('');
    onClose();
  };

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        onAddImage({
          type: 'image',
          x: canvasViewportCenter.x - 160 + index * 30,
          y: canvasViewportCenter.y - 180 + index * 30,
          width: 320,
          height: 380,
          src,
          alt: file.name,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          showCaption: false,
          borderRadius: 4,
          shadow: 'medium',
          objectFit: 'cover',
          originalFileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#181816]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#FCFCFA] rounded-2xl shadow-2xl border border-[#E2DFD8] w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE8E3] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#B58A38]" />
            <h2 className="text-sm font-semibold text-[#181816] tracking-tight">
              Aesthetic Imagery & Photo Library
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C887E] hover:text-[#181816] hover:bg-[#F2EFE9] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="px-6 py-3 border-b border-[#EAE8E3] bg-[#F7F5F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Inspirations' },
              { id: 'architecture', label: 'Architecture & Spaces' },
              { id: 'fashion', label: 'Textiles & Fashion' },
              { id: 'ceramics', label: 'Ceramics & Materials' },
              { id: 'botanicals', label: 'Botanical & Flora' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#181816] text-[#FAF8F5]'
                    : 'bg-white text-[#524E46] border border-[#E2DFD8] hover:bg-[#EFECE6]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C887E] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search aesthetics..."
              className="text-xs pl-8 pr-3 py-1 bg-white border border-[#D5D0C5] rounded-full focus:outline-none w-44"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Upload card slot */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-56 rounded-xl border-2 border-dashed border-[#C8C4BA] bg-[#F9F7F2] hover:bg-[#F0EDE6] transition-colors flex flex-col items-center justify-center p-4 cursor-pointer group text-center"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-[#DDD8CD] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                <Upload className="w-4 h-4 text-[#181816]" />
              </div>
              <div className="text-xs font-semibold text-[#181816]">Upload From Computer</div>
              <div className="text-[10px] text-[#736F66] mt-0.5">Drag & drop or browse</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleLocalUpload}
            />

            {/* Curated Images */}
            {filteredImages.map((img, i) => (
              <div
                key={i}
                onClick={() => handleSelectCuratedImage(img)}
                className="h-56 rounded-xl border border-[#E5E2DA] bg-white overflow-hidden flex flex-col cursor-pointer group hover:shadow-md hover:border-[#181816] transition-all relative"
              >
                <div className="flex-1 overflow-hidden relative">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>Add to Canvas</span>
                  </div>
                </div>
                <div className="p-2.5 bg-[#FAF8F5] border-t border-[#EAE8E3]">
                  <div className="text-xs font-semibold text-[#181816] truncate">{img.title}</div>
                  <div className="text-[10px] text-[#736F66] truncate">{img.caption}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct URL import footer */}
        <div className="px-6 py-3 bg-[#F7F5F0] border-t border-[#EAE8E3]">
          <form onSubmit={handleAddCustomUrl} className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#736F66] font-medium flex items-center space-x-1">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Or Import by URL:</span>
            </span>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 min-w-[200px] text-xs px-3 py-1.5 bg-white border border-[#D5D0C5] rounded-md focus:outline-none"
            />
            <input
              type="text"
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              placeholder="Optional caption..."
              className="w-44 text-xs px-3 py-1.5 bg-white border border-[#D5D0C5] rounded-md focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customUrl.trim()}
              className="px-3.5 py-1.5 bg-[#181816] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#2E2D29] disabled:opacity-40 transition-colors shadow-xs"
            >
              Add URL
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
