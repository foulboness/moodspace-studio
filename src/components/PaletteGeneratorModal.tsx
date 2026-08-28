import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  Check,
  Copy,
  Plus,
  Layers,
  X,
} from 'lucide-react';
import {
  generateHarmony,
  HarmonyMode,
  getRandomAestheticColor,
  getDescriptiveColorName,
  getOptimalTextColor,
} from '../utils/colors';
import { BoardItem } from '../types';

interface PaletteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaletteToCanvas: (paletteItem: Omit<BoardItem, 'id' | 'zIndex'>) => void;
  onAddSwatchesToCanvas: (swatches: Array<Omit<BoardItem, 'id' | 'zIndex'>>) => void;
  canvasViewportCenter: { x: number; y: number };
}

interface PaletteColorState {
  hex: string;
  name: string;
  locked: boolean;
}

export const PaletteGeneratorModal: React.FC<PaletteGeneratorModalProps> = ({
  isOpen,
  onClose,
  onAddPaletteToCanvas,
  onAddSwatchesToCanvas,
  canvasViewportCenter,
}) => {
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('editorial-warm');
  const [paletteName, setPaletteName] = useState('EDITORIAL ESSENCE');
  const [colors, setColors] = useState<PaletteColorState[]>([
    { hex: '#F4F1EA', name: 'Warm Alabaster', locked: false },
    { hex: '#DED6C9', name: 'Oatmeal', locked: false },
    { hex: '#A89F91', name: 'Pumice Sand', locked: false },
    { hex: '#635B52', name: 'Raw Umber', locked: false },
    { hex: '#1C1B18', name: 'Noir Charcoal', locked: false },
  ]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Generate new palette respecting locked colors
  const handleGenerate = () => {
    const baseColor = colors.find(c => c.locked)?.hex || getRandomAestheticColor();
    const newHarmony = generateHarmony(baseColor, harmonyMode, 5);

    setColors(prev => {
      return prev.map((col, idx) => {
        if (col.locked) return col;
        const generated = newHarmony[idx] || { hex: getRandomAestheticColor(), name: 'Tonal Accent' };
        return {
          hex: generated.hex,
          name: generated.name || getDescriptiveColorName(generated.hex),
          locked: false,
        };
      });
    });
  };

  // Keyboard shortcut Space to randomize
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, harmonyMode, colors]);

  if (!isOpen) return null;

  const toggleLock = (index: number) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
  };

  const updateColorHex = (index: number, newHex: string) => {
    setColors(prev => prev.map((c, i) => {
      if (i === index) {
        const hex = newHex.toUpperCase();
        return {
          ...c,
          hex,
          name: getDescriptiveColorName(hex),
        };
      }
      return c;
    }));
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // Add as full connected palette strip to canvas
  const handleAddPaletteStrip = () => {
    onAddPaletteToCanvas({
      type: 'palette',
      x: canvasViewportCenter.x - 180,
      y: canvasViewportCenter.y - 60,
      width: 400,
      height: 130,
      name: paletteName.toUpperCase(),
      colors: colors.map(c => ({ hex: c.hex, name: c.name })),
      layout: 'horizontal-strip',
      showHexLabels: true,
      borderRadius: 8,
      shadow: 'subtle',
    });
    onClose();
  };

  // Add individual Pantone cards
  const handleAddIndividualPantoneCards = () => {
    const startX = canvasViewportCenter.x - (colors.length * 150) / 2;
    const swatches = colors.map((col, idx) => ({
      type: 'color' as const,
      x: startX + idx * 145,
      y: canvasViewportCenter.y - 90,
      width: 135,
      height: 180,
      hex: col.hex,
      name: col.name.toUpperCase(),
      colorModel: 'pantone' as const,
      subtitle: `${paletteName}`,
      format: 'pantone-card' as const,
      borderRadius: 6,
      shadow: 'lifted' as const,
    }));
    onAddSwatchesToCanvas(swatches);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#181816]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#FCFCFA] rounded-2xl shadow-2xl border border-[#E2DFD8] w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE8E3] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#B58A38]" />
            <h2 className="text-sm font-semibold text-[#181816] tracking-tight">
              Color Palette Laboratory
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C887E] hover:text-[#181816] hover:bg-[#F2EFE9] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Harmony Mode Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#736F66] font-medium">Harmony:</span>
              <select
                value={harmonyMode}
                onChange={(e) => setHarmonyMode(e.target.value as HarmonyMode)}
                className="text-xs font-medium bg-white border border-[#D5D0C5] text-[#181816] rounded-md px-2.5 py-1.5 focus:outline-none"
              >
                <option value="editorial-warm">Warm Neutrals & Editorial</option>
                <option value="earth-tones">Earth Pigments & Terracotta</option>
                <option value="mineral-slate">Nordic Slate & Minerals</option>
                <option value="nordic-minimal">Nordic Birch & Concrete</option>
                <option value="analogous">Analogous Spectrum</option>
                <option value="monochromatic">Monochromatic Tonal</option>
                <option value="complementary">Complementary Contrast</option>
                <option value="triadic">Triadic Harmonic</option>
              </select>
            </div>

            {/* Re-roll button */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-[#8C887E] hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-[#EAE7E0] text-[#181816] rounded text-[10px] font-mono">Space</kbd> to roll</span>
              <button
                onClick={handleGenerate}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#181816] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#2E2D29] transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate New</span>
              </button>
            </div>
          </div>

          {/* Large Interactive Color Palette Preview Bar */}
          <div className="h-44 rounded-xl overflow-hidden border border-[#E0DCD2] flex shadow-md">
            {colors.map((color, index) => {
              const textColor = getOptimalTextColor(color.hex);
              return (
                <div
                  key={index}
                  style={{ backgroundColor: color.hex }}
                  className="flex-1 flex flex-col justify-between p-3 relative group transition-all"
                >
                  {/* Top Action: Lock */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => toggleLock(index)}
                      style={{ color: textColor }}
                      className="p-1 rounded bg-black/15 hover:bg-black/30 backdrop-blur-2xs transition-colors"
                      title={color.locked ? 'Unlock color' : 'Lock this color'}
                    >
                      {color.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />}
                    </button>
                  </div>

                  {/* Bottom: Hex & Name */}
                  <div style={{ color: textColor }} className="space-y-1">
                    <div
                      onClick={() => handleCopyHex(color.hex)}
                      className="text-xs font-mono font-semibold tracking-wider cursor-pointer hover:underline flex items-center space-x-1"
                      title="Click to copy hex"
                    >
                      <span>{color.hex}</span>
                      {copiedHex === color.hex && <Check className="w-3 h-3 text-green-400" />}
                    </div>
                    <div className="text-[11px] font-medium leading-tight opacity-90 line-clamp-2">
                      {color.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Palette Details & Name */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-[#736F66] font-medium">Palette Title:</span>
            <input
              type="text"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              className="flex-1 text-xs font-semibold text-[#181816] bg-white border border-[#D5D0C5] rounded-md px-3 py-1.5 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#F7F5F0] border-t border-[#EAE8E3] flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-[#8C887E]">
            {colors.filter(c => c.locked).length} of 5 colors locked
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddIndividualPantoneCards}
              className="px-3 py-1.5 bg-white border border-[#D5D0C5] hover:bg-[#F2EFE9] text-[#181816] text-xs font-medium rounded-md transition-colors"
            >
              Add as Individual Swatches
            </button>
            <button
              onClick={handleAddPaletteStrip}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#181816] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#2E2D29] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Palette Card to Board</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
