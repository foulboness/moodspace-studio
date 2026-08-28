import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Type,
  Palette,
  StickyNote,
  Link2,
  Square,
  Sparkles,
  Upload,
  Plus,
  Compass,
  FileText,
  Sliders,
} from 'lucide-react';
import { BoardItem, ItemType } from '../types';
import { getRandomAestheticColor, getDescriptiveColorName } from '../utils/colors';

interface ToolbarProps {
  onAddItem: (itemData: Omit<BoardItem, 'id' | 'zIndex'>) => void;
  onOpenImagePicker: () => void;
  onOpenPaletteGenerator: () => void;
  canvasViewportCenter: { x: number; y: number };
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddItem,
  onOpenImagePicker,
  onOpenPaletteGenerator,
  canvasViewportCenter,
}) => {
  const [activeMenu, setActiveMenu] = useState<ItemType | 'templates' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to place item near current canvas view center with slight jitter
  const getSpawnCoords = () => {
    const jitter = Math.floor(Math.random() * 60) - 30;
    return {
      x: Math.max(40, canvasViewportCenter.x + jitter - 150),
      y: Math.max(40, canvasViewportCenter.y + jitter - 100),
    };
  };

  // Local image file upload
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const aspect = img.width / img.height;
          const targetW = 320;
          const targetH = Math.round(targetW / aspect);
          const coords = getSpawnCoords();

          onAddItem({
            type: 'image',
            x: coords.x + index * 30,
            y: coords.y + index * 30,
            width: targetW,
            height: targetH,
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
        img.src = src;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
    setActiveMenu(null);
  };

  // Quick Add Text Types
  const handleAddText = (styleType: 'title' | 'subhead' | 'body' | 'quote' | 'label') => {
    const coords = getSpawnCoords();
    switch (styleType) {
      case 'title':
        onAddItem({
          type: 'text',
          x: coords.x,
          y: coords.y,
          width: 380,
          height: 90,
          content: 'EDITORIAL MOOD',
          fontFamily: 'serif',
          fontSize: 36,
          fontWeight: '400',
          textAlign: 'left',
          textColor: '#181816',
          letterSpacing: 0.05,
          lineHeight: 1.15,
        });
        break;
      case 'quote':
        onAddItem({
          type: 'text',
          x: coords.x,
          y: coords.y,
          width: 340,
          height: 100,
          content: '“Simplicity is about subtracting the obvious and adding the meaningful.”',
          fontFamily: 'editorial',
          fontSize: 18,
          fontWeight: '400',
          italic: true,
          textAlign: 'left',
          textColor: '#4A4740',
          letterSpacing: 0.01,
        });
        break;
      case 'subhead':
        onAddItem({
          type: 'text',
          x: coords.x,
          y: coords.y,
          width: 300,
          height: 60,
          content: 'AUTUMN / WINTER DIRECTION',
          fontFamily: 'sans',
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'left',
          textColor: '#2E2C28',
          letterSpacing: 0.08,
          uppercase: true,
        });
        break;
      case 'label':
        onAddItem({
          type: 'text',
          x: coords.x,
          y: coords.y,
          width: 180,
          height: 44,
          content: 'PROJECT SPEC 01',
          fontFamily: 'mono',
          fontSize: 12,
          fontWeight: '500',
          textAlign: 'center',
          textColor: '#66635C',
          backgroundColor: '#EFECE6',
          padding: 8,
          borderRadius: 4,
        });
        break;
      case 'body':
      default:
        onAddItem({
          type: 'text',
          x: coords.x,
          y: coords.y,
          width: 300,
          height: 110,
          content: 'Exploring organic tactile materials, honest textures, warm diffused lighting, and quiet architectural presence.',
          fontFamily: 'sans',
          fontSize: 14,
          fontWeight: '400',
          textAlign: 'left',
          textColor: '#3D3B35',
          lineHeight: 1.6,
        });
        break;
    }
    setActiveMenu(null);
  };

  // Quick Add Color Swatch
  const handleAddColorSwatch = (format: 'pantone-card' | 'circle' | 'pill' | 'minimal-swatch') => {
    const hex = getRandomAestheticColor();
    const name = getDescriptiveColorName(hex);
    const coords = getSpawnCoords();

    onAddItem({
      type: 'color',
      x: coords.x,
      y: coords.y,
      width: format === 'pantone-card' ? 150 : (format === 'circle' ? 110 : 160),
      height: format === 'pantone-card' ? 190 : (format === 'circle' ? 110 : 60),
      hex,
      name: `${name.toUpperCase()} ${hex.replace('#', '')}`,
      colorModel: 'pantone',
      subtitle: 'Mood Accent',
      format,
      borderRadius: format === 'circle' ? 999 : 6,
      shadow: 'lifted',
    });
    setActiveMenu(null);
  };

  // Quick Add Sticky Note
  const handleAddNote = (color: 'linen' | 'sand' | 'sage' | 'terracotta' | 'charcoal' | 'mist') => {
    const coords = getSpawnCoords();
    onAddItem({
      type: 'note',
      x: coords.x,
      y: coords.y,
      width: 230,
      height: 180,
      text: 'Studio Observation:\nFocus on matte unpolished finishes and natural earth pigments.',
      noteColor: color,
      pinStyle: 'tape-top',
      fontStyle: 'sans',
      author: 'Design Log',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      shadow: 'subtle',
    });
    setActiveMenu(null);
  };

  // Quick Add Reference Link Card
  const handleAddLink = () => {
    const coords = getSpawnCoords();
    onAddItem({
      type: 'link',
      x: coords.x,
      y: coords.y,
      width: 260,
      height: 130,
      url: 'https://dezeen.com',
      title: 'Dezeen Architecture Magazine',
      description: 'Contemporary architecture, interiors and design projects around the world.',
      domain: 'dezeen.com',
      theme: 'minimal-card',
      shadow: 'subtle',
    });
    setActiveMenu(null);
  };

  // Quick Add Shape / Frame
  const handleAddShape = (shapeType: 'frame' | 'rectangle' | 'line' | 'divider') => {
    const coords = getSpawnCoords();
    if (shapeType === 'frame') {
      onAddItem({
        type: 'shape',
        x: coords.x,
        y: coords.y,
        width: 320,
        height: 240,
        shapeType: 'frame',
        borderWidth: 1,
        borderColor: '#181816',
        borderRadius: 4,
        fillColor: 'transparent',
        strokeStyle: 'solid',
        shadow: 'none',
      });
    } else if (shapeType === 'divider') {
      onAddItem({
        type: 'shape',
        x: coords.x,
        y: coords.y,
        width: 280,
        height: 2,
        shapeType: 'divider',
        fillColor: '#DCD8CF',
        strokeColor: '#DCD8CF',
        borderWidth: 1,
      });
    } else {
      onAddItem({
        type: 'shape',
        x: coords.x,
        y: coords.y,
        width: 220,
        height: 160,
        shapeType: 'rectangle',
        fillColor: '#EFECE6',
        borderRadius: 8,
        shadow: 'subtle',
      });
    }
    setActiveMenu(null);
  };

  return (
    <aside id="left-toolbar" className="relative z-20 flex no-print">
      {/* Primary Toolbar Icons Column */}
      <div className="w-14 bg-[#FCFCFA] border-r border-[#EAE8E3] py-4 flex flex-col items-center justify-between shadow-2xs select-none">
        <div className="flex flex-col items-center space-y-2 w-full">
          {/* Add Image */}
          <div className="relative group">
            <button
              id="tool-add-image"
              onClick={() => setActiveMenu(activeMenu === 'image' ? null : 'image')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                activeMenu === 'image'
                  ? 'bg-[#181816] text-white shadow-xs'
                  : 'text-[#4A4740] hover:text-[#181816] hover:bg-[#F2EFE9]'
              }`}
              title="Add Images (Upload or Curated Library)"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <span className="absolute left-14 top-2 px-2 py-1 bg-[#181816] text-white text-[11px] font-medium rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md">
              Images & Photos
            </span>
          </div>

          {/* Add Text */}
          <div className="relative group">
            <button
              id="tool-add-text"
              onClick={() => setActiveMenu(activeMenu === 'text' ? null : 'text')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                activeMenu === 'text'
                  ? 'bg-[#181816] text-white shadow-xs'
                  : 'text-[#4A4740] hover:text-[#181816] hover:bg-[#F2EFE9]'
              }`}
              title="Add Typography & Text"
            >
              <Type className="w-4 h-4" />
            </button>
            <span className="absolute left-14 top-2 px-2 py-1 bg-[#181816] text-white text-[11px] font-medium rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md">
              Typography & Quotes
            </span>
          </div>

          {/* Add Color Swatch */}
          <div className="relative group">
            <button
              id="tool-add-color"
              onClick={() => setActiveMenu(activeMenu === 'color' ? null : 'color')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                activeMenu === 'color'
                  ? 'bg-[#181816] text-white shadow-xs'
                  : 'text-[#4A4740] hover:text-[#181816] hover:bg-[#F2EFE9]'
              }`}
              title="Add Color Swatch & Pantone Cards"
            >
              <Palette className="w-4 h-4" />
            </button>
            <span className="absolute left-14 top-2 px-2 py-1 bg-[#181816] text-white text-[11px] font-medium rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md">
              Color Swatches
            </span>
          </div>

          {/* Color Palette Lab */}
          <div className="relative group">
            <button
              id="tool-palette-generator"
              onClick={onOpenPaletteGenerator}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#B58A38] hover:text-[#8F6A22] hover:bg-[#F8F5EE] transition-all"
              title="Color Palette Generator Lab"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <span className="absolute left-14 top-2 px-2 py-1 bg-[#181816] text-white text-[11px] font-medium rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md">
              Palette Generator
            </span>
          </div>

          {/* Add Note */}
          <div className="relative group">
            <button
              id="tool-add-note"
              onClick={() => setActiveMenu(activeMenu === 'note' ? null : 'note')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                activeMenu === 'note'
                  ? 'bg-[#181816] text-white shadow-xs'
                  : 'text-[#4A4740] hover:text-[#181816] hover:bg-[#F2EFE9]'
              }`}
              title="Add Sticky Notes & Studio Labels"
            >
              <StickyNote className="w-4 h-4" />
            </button>
            <span className="absolute left-14 top-2 px-2 py-1 bg-[#181816] text-white text-[11px] font-medium rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md">
              Notes & Labels
            </span>
          </div>

          {/* Add Link */}
          <div className="relative group">
            <button
              id="tool-add-link"
              onClick={() => setActiveMenu(activeMenu === 'link' ? null : 'link')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                activeMenu === 'link'
                  ? 'bg-[#181816] text-white shadow-xs'
                  : 'text-[#4A4740] hover:text-[#181816] hover:bg-[#F2EFE9]'
              }`}
              title="Add Reference Link Card"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <span className="absolute left-14 top-2 px-2 py-1 bg-[#181816] text-white text-[11px] font-medium rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md">
              Reference Links
            </span>
          </div>

          {/* Add Shape / Frame */}
          <div className="relative group">
            <button
              id="tool-add-shape"
              onClick={() => setActiveMenu(activeMenu === 'shape' ? null : 'shape')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                activeMenu === 'shape'
                  ? 'bg-[#181816] text-white shadow-xs'
                  : 'text-[#4A4740] hover:text-[#181816] hover:bg-[#F2EFE9]'
              }`}
              title="Add Frame or Divider"
            >
              <Square className="w-4 h-4" />
            </button>
            <span className="absolute left-14 top-2 px-2 py-1 bg-[#181816] text-white text-[11px] font-medium rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md">
              Frames & Dividers
            </span>
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="text-[10px] text-[#A09C91] tracking-wider font-mono rotate-270 py-4 select-none">
          STUDIO
        </div>
      </div>

      {/* Slide-out Tool Trays */}
      {activeMenu && (
        <div className="w-64 bg-[#FCFCFA] border-r border-[#EAE8E3] shadow-lg p-3 z-10 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-150">
          <div>
            {/* Header with close */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#EAE8E3]">
              <span className="text-xs font-semibold text-[#181816] uppercase tracking-wider">
                {activeMenu === 'image' && 'Add Imagery'}
                {activeMenu === 'text' && 'Add Typography'}
                {activeMenu === 'color' && 'Color Swatches'}
                {activeMenu === 'note' && 'Studio Notes'}
                {activeMenu === 'link' && 'Reference Bookmark'}
                {activeMenu === 'shape' && 'Frames & Shapes'}
              </span>
              <button
                onClick={() => setActiveMenu(null)}
                className="text-xs text-[#8C887E] hover:text-[#181816] px-1.5 py-0.5 rounded hover:bg-[#F0EDE6]"
              >
                ✕
              </button>
            </div>

            {/* Images Tray */}
            {activeMenu === 'image' && (
              <div className="space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center space-x-2.5 p-2.5 rounded-lg border border-dashed border-[#C8C4BA] bg-[#F7F5F0] hover:bg-[#EFECE6] text-xs font-medium text-[#181816] transition-colors"
                >
                  <Upload className="w-4 h-4 text-[#736F66]" />
                  <div className="text-left">
                    <div className="font-semibold">Upload Local Image</div>
                    <div className="text-[10px] text-[#736F66]">PNG, JPG, WebP, SVG</div>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleLocalImageUpload}
                />

                <button
                  onClick={() => {
                    onOpenImagePicker();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center space-x-2.5 p-2.5 rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-xs font-medium text-[#181816] transition-colors text-left"
                >
                  <Compass className="w-4 h-4 text-[#B58A38]" />
                  <div>
                    <div className="font-semibold">Curated Aesthetic Gallery</div>
                    <div className="text-[10px] text-[#736F66]">Architecture, Fashion, Ceramics</div>
                  </div>
                </button>

                <div className="pt-2 text-[11px] text-[#8C887E] leading-relaxed">
                  💡 Tip: You can also drag-and-drop any image file directly onto the canvas area!
                </div>
              </div>
            )}

            {/* Text Tray */}
            {activeMenu === 'text' && (
              <div className="space-y-1.5">
                <button
                  onClick={() => handleAddText('title')}
                  className="w-full text-left p-2.5 rounded-md hover:bg-[#F2EFE9] border border-transparent hover:border-[#E2DFD8] transition-colors group"
                >
                  <div className="font-serif-title text-xl text-[#181816]">Editorial Headline</div>
                  <div className="text-[10px] text-[#8C887E]">Instrument Serif display header</div>
                </button>

                <button
                  onClick={() => handleAddText('quote')}
                  className="w-full text-left p-2.5 rounded-md hover:bg-[#F2EFE9] border border-transparent hover:border-[#E2DFD8] transition-colors group"
                >
                  <div className="font-editorial italic text-sm text-[#3D3B35]">“Poetic Designer Quote”</div>
                  <div className="text-[10px] text-[#8C887E]">Playfair italic thought</div>
                </button>

                <button
                  onClick={() => handleAddText('subhead')}
                  className="w-full text-left p-2.5 rounded-md hover:bg-[#F2EFE9] border border-transparent hover:border-[#E2DFD8] transition-colors group"
                >
                  <div className="font-sans font-semibold text-xs tracking-wider text-[#181816]">SECTION SUBTITLE</div>
                  <div className="text-[10px] text-[#8C887E]">Clean sans uppercase</div>
                </button>

                <button
                  onClick={() => handleAddText('body')}
                  className="w-full text-left p-2.5 rounded-md hover:bg-[#F2EFE9] border border-transparent hover:border-[#E2DFD8] transition-colors group"
                >
                  <div className="font-sans text-xs text-[#4A4740] line-clamp-2">Editorial body paragraph text describing materials and mood.</div>
                  <div className="text-[10px] text-[#8C887E] mt-0.5">Paragraph block</div>
                </button>

                <button
                  onClick={() => handleAddText('label')}
                  className="w-full text-left p-2.5 rounded-md hover:bg-[#F2EFE9] border border-transparent hover:border-[#E2DFD8] transition-colors group"
                >
                  <div className="font-mono text-xs text-[#66635C] bg-[#EFECE6] inline-block px-2 py-0.5 rounded">SPEC CODE // 01</div>
                  <div className="text-[10px] text-[#8C887E] mt-0.5">Monospace tag chip</div>
                </button>
              </div>
            )}

            {/* Color Swatch Tray */}
            {activeMenu === 'color' && (
              <div className="space-y-2">
                <button
                  onClick={() => handleAddColorSwatch('pantone-card')}
                  className="w-full p-2.5 rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-left transition-colors flex items-center space-x-3"
                >
                  <div className="w-8 h-10 rounded border border-[#D5D0C5] bg-[#C8BEB0] flex flex-col justify-end p-0.5">
                    <div className="h-3 bg-white rounded-2xs" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#181816]">Pantone Style Card</div>
                    <div className="text-[10px] text-[#8C887E]">Swatch with name & code</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddColorSwatch('circle')}
                  className="w-full p-2.5 rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-left transition-colors flex items-center space-x-3"
                >
                  <div className="w-8 h-8 rounded-full border border-[#D5D0C5] bg-[#7A8C6C]" />
                  <div>
                    <div className="text-xs font-semibold text-[#181816]">Minimal Circle Chip</div>
                    <div className="text-[10px] text-[#8C887E]">Circular color token</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddColorSwatch('pill')}
                  className="w-full p-2.5 rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-left transition-colors flex items-center space-x-3"
                >
                  <div className="w-10 h-6 rounded-full border border-[#D5D0C5] bg-[#C28461]" />
                  <div>
                    <div className="text-xs font-semibold text-[#181816]">Pill Swatch</div>
                    <div className="text-[10px] text-[#8C887E]">Horizontal pill label</div>
                  </div>
                </button>

                <div className="pt-2 border-t border-[#EAE8E3]">
                  <button
                    onClick={() => {
                      onOpenPaletteGenerator();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 p-2 bg-[#EFECE6] hover:bg-[#E5E0D4] text-xs font-medium text-[#181816] rounded-md transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#B58A38]" />
                    <span>Launch Palette Generator</span>
                  </button>
                </div>
              </div>
            )}

            {/* Note Tray */}
            {activeMenu === 'note' && (
              <div className="space-y-2">
                <div className="text-[11px] font-medium text-[#736F66]">Select Tone Palette:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleAddNote('linen')}
                    className="p-2 rounded border border-[#DDD8CD] bg-[#F7F5F0] text-center hover:scale-105 transition-transform"
                  >
                    <div className="w-full h-4 bg-[#EBE7DF] rounded-2xs mb-1" />
                    <span className="text-[10px] font-medium text-[#4A4740]">Linen</span>
                  </button>
                  <button
                    onClick={() => handleAddNote('sand')}
                    className="p-2 rounded border border-[#DFCBB9] bg-[#F9EDE1] text-center hover:scale-105 transition-transform"
                  >
                    <div className="w-full h-4 bg-[#ECD3C0] rounded-2xs mb-1" />
                    <span className="text-[10px] font-medium text-[#4A4740]">Sand</span>
                  </button>
                  <button
                    onClick={() => handleAddNote('sage')}
                    className="p-2 rounded border border-[#CFD9C8] bg-[#EEF4EB] text-center hover:scale-105 transition-transform"
                  >
                    <div className="w-full h-4 bg-[#DCE6D5] rounded-2xs mb-1" />
                    <span className="text-[10px] font-medium text-[#4A4740]">Sage</span>
                  </button>
                  <button
                    onClick={() => handleAddNote('terracotta')}
                    className="p-2 rounded border border-[#E9C8B5] bg-[#FAECE3] text-center hover:scale-105 transition-transform"
                  >
                    <div className="w-full h-4 bg-[#F2D3BF] rounded-2xs mb-1" />
                    <span className="text-[10px] font-medium text-[#4A4740]">Terra</span>
                  </button>
                  <button
                    onClick={() => handleAddNote('mist')}
                    className="p-2 rounded border border-[#D5DEE5] bg-[#EFF4F8] text-center hover:scale-105 transition-transform"
                  >
                    <div className="w-full h-4 bg-[#DDE7EF] rounded-2xs mb-1" />
                    <span className="text-[10px] font-medium text-[#4A4740]">Mist</span>
                  </button>
                  <button
                    onClick={() => handleAddNote('charcoal')}
                    className="p-2 rounded border border-[#3E3D39] bg-[#22211E] text-center hover:scale-105 transition-transform text-white"
                  >
                    <div className="w-full h-4 bg-[#3E3D39] rounded-2xs mb-1" />
                    <span className="text-[10px] font-medium text-[#EBE7DF]">Charcoal</span>
                  </button>
                </div>
              </div>
            )}

            {/* Link Tray */}
            {activeMenu === 'link' && (
              <div className="space-y-2">
                <button
                  onClick={handleAddLink}
                  className="w-full p-2.5 rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-left transition-colors flex items-center space-x-3"
                >
                  <Link2 className="w-4 h-4 text-[#736F66]" />
                  <div>
                    <div className="text-xs font-semibold text-[#181816]">Reference Bookmark Card</div>
                    <div className="text-[10px] text-[#8C887E]">Link with title, domain & notes</div>
                  </div>
                </button>
              </div>
            )}

            {/* Shapes Tray */}
            {activeMenu === 'shape' && (
              <div className="space-y-2">
                <button
                  onClick={() => handleAddShape('frame')}
                  className="w-full p-2.5 rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-left transition-colors flex items-center space-x-3"
                >
                  <div className="w-6 h-6 border border-[#181816] rounded-xs" />
                  <div>
                    <div className="text-xs font-semibold text-[#181816]">Minimal Outline Frame</div>
                    <div className="text-[10px] text-[#8C887E]">Bounding section border</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddShape('divider')}
                  className="w-full p-2.5 rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-left transition-colors flex items-center space-x-3"
                >
                  <div className="w-6 h-0.5 bg-[#181816]" />
                  <div>
                    <div className="text-xs font-semibold text-[#181816]">Divider Line</div>
                    <div className="text-[10px] text-[#8C887E]">Editorial separator</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddShape('rectangle')}
                  className="w-full p-2.5 rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-left transition-colors flex items-center space-x-3"
                >
                  <div className="w-6 h-6 bg-[#EFECE6] rounded-xs" />
                  <div>
                    <div className="text-xs font-semibold text-[#181816]">Backdrop Card</div>
                    <div className="text-[10px] text-[#8C887E]">Solid color background block</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
