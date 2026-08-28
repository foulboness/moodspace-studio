import React, { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Sparkles,
  Sliders,
  Type,
  Square,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Palette,
  Droplet,
  Maximize2,
  RotateCw,
  Sun,
  Grid,
} from 'lucide-react';
import {
  Moodboard,
  BoardItem,
  ImageItem,
  TextItem,
  ColorItem,
  PaletteItem,
  NoteItem,
  LinkItem,
  ShapeItem,
} from '../types';
import { extractPaletteFromImage } from '../utils/colors';

interface PropertiesPanelProps {
  board: Moodboard;
  selectedItems: BoardItem[];
  onUpdateItem: (itemId: string, patch: Partial<BoardItem>) => void;
  onUpdateItems: (patches: Record<string, Partial<BoardItem>>) => void;
  onUpdateBoard: (patch: Partial<Moodboard>) => void;
  onDuplicateItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteItems: (itemIds: string[]) => void;
  onBringForward: (itemId: string) => void;
  onSendBackward: (itemId: string) => void;
  onAddItem: (itemData: Omit<BoardItem, 'id' | 'zIndex'>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  board,
  selectedItems,
  onUpdateItem,
  onUpdateItems,
  onUpdateBoard,
  onDuplicateItem,
  onDeleteItem,
  onDeleteItems,
  onBringForward,
  onSendBackward,
  onAddItem,
}) => {
  const [isExtractingColors, setIsExtractingColors] = useState(false);

  const selectedItem = selectedItems.length === 1 ? selectedItems[0] : null;

  // Alignment helpers for multiple items
  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedItems.length < 2) return;

    let targetVal = 0;
    const patches: Record<string, Partial<BoardItem>> = {};

    switch (alignment) {
      case 'left':
        targetVal = Math.min(...selectedItems.map(it => it.x));
        selectedItems.forEach(it => { patches[it.id] = { x: targetVal }; });
        break;
      case 'center': {
        const minX = Math.min(...selectedItems.map(it => it.x));
        const maxX = Math.max(...selectedItems.map(it => it.x + it.width));
        const midX = (minX + maxX) / 2;
        selectedItems.forEach(it => { patches[it.id] = { x: midX - it.width / 2 }; });
        break;
      }
      case 'right':
        targetVal = Math.max(...selectedItems.map(it => it.x + it.width));
        selectedItems.forEach(it => { patches[it.id] = { x: targetVal - it.width }; });
        break;
      case 'top':
        targetVal = Math.min(...selectedItems.map(it => it.y));
        selectedItems.forEach(it => { patches[it.id] = { y: targetVal }; });
        break;
      case 'middle': {
        const minY = Math.min(...selectedItems.map(it => it.y));
        const maxY = Math.max(...selectedItems.map(it => it.y + it.height));
        const midY = (minY + maxY) / 2;
        selectedItems.forEach(it => { patches[it.id] = { y: midY - it.height / 2 }; });
        break;
      }
      case 'bottom':
        targetVal = Math.max(...selectedItems.map(it => it.y + it.height));
        selectedItems.forEach(it => { patches[it.id] = { y: targetVal - it.height }; });
        break;
    }
    onUpdateItems(patches);
  };

  // Extract color palette from image and add as a palette item on canvas
  const handleExtractPaletteFromSelectedImage = async (imgSrc: string) => {
    if (!selectedItem) return;
    try {
      setIsExtractingColors(true);
      const paletteColors = await extractPaletteFromImage(imgSrc, 5);
      onAddItem({
        type: 'palette',
        x: selectedItem.x,
        y: selectedItem.y + selectedItem.height + 25,
        width: 360,
        height: 120,
        name: `${(selectedItem as ImageItem).caption || 'IMAGE'} PALETTE`,
        colors: paletteColors,
        layout: 'horizontal-strip',
        showHexLabels: true,
        borderRadius: 8,
        shadow: 'subtle',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtractingColors(false);
    }
  };

  return (
    <aside id="right-properties-panel" className="w-72 bg-[#FCFCFA] border-l border-[#EAE8E3] h-full flex flex-col justify-between overflow-y-auto select-none no-print z-20 shadow-2xs">
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE8E3]">
          <span className="text-xs font-semibold text-[#181816] uppercase tracking-wider">
            {selectedItems.length === 0 && 'Canvas Settings'}
            {selectedItems.length === 1 && `${selectedItem?.type.toUpperCase()} Properties`}
            {selectedItems.length > 1 && `Selection (${selectedItems.length} items)`}
          </span>

          {selectedItem && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onUpdateItem(selectedItem.id, { locked: !selectedItem.locked })}
                className={`p-1 rounded text-xs transition-colors ${
                  selectedItem.locked
                    ? 'bg-[#181816] text-[#FAF8F5]'
                    : 'text-[#736F66] hover:text-[#181816] hover:bg-[#F2EFE9]'
                }`}
                title={selectedItem.locked ? 'Unlock item' : 'Lock item'}
              >
                {selectedItem.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onDuplicateItem(selectedItem.id)}
                className="p-1 text-[#736F66] hover:text-[#181816] hover:bg-[#F2EFE9] rounded"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteItem(selectedItem.id)}
                className="p-1 text-[#736F66] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {selectedItems.length > 1 && (
            <button
              onClick={() => onDeleteItems(selectedItems.map(it => it.id))}
              className="p-1 text-[#736F66] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded text-xs flex items-center space-x-1"
              title="Delete all selected"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All</span>
            </button>
          )}
        </div>

        {/* 1. NO ITEM SELECTED: Canvas Settings */}
        {selectedItems.length === 0 && (
          <div className="space-y-4">
            {/* Background Color Presets */}
            <div>
              <label className="text-[11px] font-semibold text-[#736F66] uppercase tracking-wider block mb-2">
                Canvas Tone
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { hex: '#FBFBFA', name: 'Off-White' },
                  { hex: '#F5F3ED', name: 'Alabaster' },
                  { hex: '#EFECE5', name: 'Sand' },
                  { hex: '#F0F3F4', name: 'Mist' },
                  { hex: '#1C1B18', name: 'Charcoal' },
                ].map(tone => (
                  <button
                    key={tone.hex}
                    onClick={() => onUpdateBoard({ backgroundColor: tone.hex })}
                    className={`h-8 rounded-md border transition-all ${
                      board.backgroundColor === tone.hex
                        ? 'ring-2 ring-[#181816] border-transparent scale-105'
                        : 'border-[#DCD8CF] hover:scale-105'
                    }`}
                    style={{ backgroundColor: tone.hex }}
                    title={tone.name}
                  />
                ))}
              </div>
            </div>

            {/* Grid Pattern */}
            <div>
              <label className="text-[11px] font-semibold text-[#736F66] uppercase tracking-wider block mb-2">
                Grid Overlay
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'dots', label: 'Dot Grid' },
                  { id: 'grid', label: 'Linear Grid' },
                  { id: 'cross', label: 'Crosses' },
                  { id: 'none', label: 'Clean Blank' },
                ].map(pattern => (
                  <button
                    key={pattern.id}
                    onClick={() => onUpdateBoard({ gridPattern: pattern.id as any })}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                      board.gridPattern === pattern.id
                        ? 'bg-[#181816] text-[#FAF8F5] border-[#181816]'
                        : 'bg-white text-[#4A4740] border-[#E2DFD8] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    {pattern.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Snap & Grid Sizing */}
            <div className="pt-2 border-t border-[#EAE8E3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#4A4740]">Snap to Grid</span>
                <input
                  type="checkbox"
                  checked={board.snapToGrid}
                  onChange={(e) => onUpdateBoard({ snapToGrid: e.target.checked })}
                  className="rounded border-[#D5D0C5] text-[#181816] focus:ring-0"
                />
              </div>

              {board.snapToGrid && (
                <div>
                  <div className="flex justify-between text-[11px] text-[#736F66] mb-1">
                    <span>Grid Spacing</span>
                    <span className="font-mono">{board.gridSize || 20}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    step="4"
                    value={board.gridSize || 20}
                    onChange={(e) => onUpdateBoard({ gridSize: parseInt(e.target.value) })}
                    className="w-full accent-[#181816]"
                  />
                </div>
              )}
            </div>

            {/* Board Info */}
            <div className="pt-2 border-t border-[#EAE8E3]">
              <div className="text-[11px] text-[#8C887E] space-y-1">
                <div>Items on board: <span className="font-semibold text-[#181816]">{board.items.length}</span></div>
                <div>Last edited: <span className="font-semibold text-[#181816]">{new Date(board.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MULTIPLE ITEMS SELECTED */}
        {selectedItems.length > 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-[#736F66] uppercase tracking-wider block mb-2">
                Alignment
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#F2EFE9] p-1 rounded-md">
                <button
                  onClick={() => handleAlign('left')}
                  className="p-1.5 bg-white text-[#181816] hover:bg-[#FAF8F5] rounded text-xs flex justify-center"
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAlign('center')}
                  className="p-1.5 bg-white text-[#181816] hover:bg-[#FAF8F5] rounded text-xs flex justify-center"
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAlign('right')}
                  className="p-1.5 bg-white text-[#181816] hover:bg-[#FAF8F5] rounded text-xs flex justify-center"
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAlign('top')}
                  className="p-1.5 bg-white text-[#181816] hover:bg-[#FAF8F5] rounded text-xs flex justify-center"
                  title="Align Top"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAlign('middle')}
                  className="p-1.5 bg-white text-[#181816] hover:bg-[#FAF8F5] rounded text-xs flex justify-center"
                  title="Align Middle"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAlign('bottom')}
                  className="p-1.5 bg-white text-[#181816] hover:bg-[#FAF8F5] rounded text-xs flex justify-center"
                  title="Align Bottom"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. SINGLE ITEM SELECTED: Comprehensive Inspector */}
        {selectedItem && (
          <div className="space-y-4">
            {/* Dimensions & Spatial Coordinates */}
            <div>
              <label className="text-[11px] font-semibold text-[#736F66] uppercase tracking-wider block mb-2">
                Transform & Geometry
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1.5 bg-[#F7F5F0] px-2 py-1 rounded border border-[#E5E2DA]">
                  <span className="text-[#8C887E] font-mono">W</span>
                  <input
                    type="number"
                    value={Math.round(selectedItem.width)}
                    onChange={(e) => onUpdateItem(selectedItem.id, { width: Math.max(20, parseInt(e.target.value) || 20) })}
                    className="w-full bg-transparent focus:outline-none font-mono text-[#181816]"
                  />
                </div>
                <div className="flex items-center space-x-1.5 bg-[#F7F5F0] px-2 py-1 rounded border border-[#E5E2DA]">
                  <span className="text-[#8C887E] font-mono">H</span>
                  <input
                    type="number"
                    value={Math.round(selectedItem.height)}
                    onChange={(e) => onUpdateItem(selectedItem.id, { height: Math.max(20, parseInt(e.target.value) || 20) })}
                    className="w-full bg-transparent focus:outline-none font-mono text-[#181816]"
                  />
                </div>
                <div className="flex items-center space-x-1.5 bg-[#F7F5F0] px-2 py-1 rounded border border-[#E5E2DA]">
                  <span className="text-[#8C887E] font-mono">X</span>
                  <input
                    type="number"
                    value={Math.round(selectedItem.x)}
                    onChange={(e) => onUpdateItem(selectedItem.id, { x: parseInt(e.target.value) || 0 })}
                    className="w-full bg-transparent focus:outline-none font-mono text-[#181816]"
                  />
                </div>
                <div className="flex items-center space-x-1.5 bg-[#F7F5F0] px-2 py-1 rounded border border-[#E5E2DA]">
                  <span className="text-[#8C887E] font-mono">Y</span>
                  <input
                    type="number"
                    value={Math.round(selectedItem.y)}
                    onChange={(e) => onUpdateItem(selectedItem.id, { y: parseInt(e.target.value) || 0 })}
                    className="w-full bg-transparent focus:outline-none font-mono text-[#181816]"
                  />
                </div>
              </div>

              {/* Rotation quick steps */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-[#66635C]">Rotation</span>
                <div className="flex items-center space-x-1">
                  {[0, 90, 180, 270].map(deg => (
                    <button
                      key={deg}
                      onClick={() => onUpdateItem(selectedItem.id, { rotation: deg })}
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                        (selectedItem.rotation || 0) === deg
                          ? 'bg-[#181816] text-white'
                          : 'bg-[#F2EFE9] text-[#615D54] hover:text-[#181816]'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Opacity & Shadow */}
            <div className="space-y-3 pt-2 border-t border-[#EAE8E3]">
              <div>
                <div className="flex justify-between text-[11px] text-[#736F66] mb-1">
                  <span>Opacity</span>
                  <span className="font-mono">{Math.round((selectedItem.opacity !== undefined ? selectedItem.opacity : 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={selectedItem.opacity !== undefined ? selectedItem.opacity : 1}
                  onChange={(e) => onUpdateItem(selectedItem.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#181816]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#736F66] uppercase tracking-wider block mb-1.5">
                  Drop Shadow
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {['none', 'subtle', 'medium', 'editorial'].map(shadowType => (
                    <button
                      key={shadowType}
                      onClick={() => onUpdateItem(selectedItem.id, { shadow: shadowType as any })}
                      className={`py-1 text-[11px] capitalize rounded border transition-colors ${
                        (selectedItem.shadow || 'none') === shadowType
                          ? 'bg-[#181816] text-white border-[#181816]'
                          : 'bg-white text-[#4A4740] border-[#E2DFD8] hover:bg-[#F7F5F0]'
                      }`}
                    >
                      {shadowType}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer ordering */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#66635C]">Layer Order</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onBringForward(selectedItem.id)}
                    className="p-1 hover:bg-[#F2EFE9] rounded text-xs text-[#4A4740] border border-[#E2DFD8]"
                    title="Bring Forward"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSendBackward(selectedItem.id)}
                    className="p-1 hover:bg-[#F2EFE9] rounded text-xs text-[#4A4740] border border-[#E2DFD8]"
                    title="Send Backward"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ITEM-SPECIFIC PROPS: IMAGE */}
            {selectedItem.type === 'image' && (() => {
              const img = selectedItem as ImageItem;
              return (
                <div className="space-y-3 pt-2 border-t border-[#EAE8E3]">
                  <label className="text-[11px] font-semibold text-[#736F66] uppercase tracking-wider block">
                    Image Styling & Effects
                  </label>

                  {/* Filter presets */}
                  <div>
                    <span className="text-[11px] text-[#66635C] block mb-1">Color Grade Filter</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'none', label: 'Natural' },
                        { id: 'grayscale', label: 'Mono B&W' },
                        { id: 'warmth', label: 'Warm Glow' },
                        { id: 'sepia', label: 'Vintage' },
                        { id: 'cool', label: 'Cool Slate' },
                        { id: 'high-contrast', label: 'Contrast' },
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => onUpdateItem(img.id, { filter: f.id as any })}
                          className={`py-1 px-1.5 text-[10px] rounded border transition-colors ${
                            (img.filter || 'none') === f.id
                              ? 'bg-[#181816] text-white border-[#181816]'
                              : 'bg-white text-[#4A4740] border-[#E2DFD8] hover:bg-[#F7F5F0]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#4A4740]">Display Caption</span>
                      <input
                        type="checkbox"
                        checked={img.showCaption || false}
                        onChange={(e) => onUpdateItem(img.id, { showCaption: e.target.checked })}
                        className="rounded border-[#D5D0C5] text-[#181816] focus:ring-0"
                      />
                    </div>
                    {img.showCaption && (
                      <input
                        type="text"
                        value={img.caption || ''}
                        onChange={(e) => onUpdateItem(img.id, { caption: e.target.value })}
                        placeholder="Image reference title..."
                        className="w-full text-xs p-1.5 bg-white border border-[#DCD8CF] rounded"
                      />
                    )}
                  </div>

                  {/* Extract palette button */}
                  <button
                    onClick={() => handleExtractPaletteFromSelectedImage(img.src)}
                    disabled={isExtractingColors}
                    className="w-full flex items-center justify-center space-x-1.5 p-2 bg-[#EFECE6] hover:bg-[#E5E0D4] text-xs font-medium text-[#181816] rounded-md transition-colors border border-[#DDD8CD]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#B58A38]" />
                    <span>{isExtractingColors ? 'Extracting...' : 'Generate Palette from Image'}</span>
                  </button>
                </div>
              );
            })()}

            {/* ITEM-SPECIFIC PROPS: TEXT */}
            {selectedItem.type === 'text' && (() => {
              const txt = selectedItem as TextItem;
              return (
                <div className="space-y-3 pt-2 border-t border-[#EAE8E3]">
                  <label className="text-[11px] font-semibold text-[#736F66] uppercase tracking-wider block">
                    Typography
                  </label>

                  {/* Font Family */}
                  <div>
                    <span className="text-[11px] text-[#66635C] block mb-1">Font Family</span>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { id: 'serif', label: 'Instrument Serif' },
                        { id: 'editorial', label: 'Playfair Display' },
                        { id: 'sans', label: 'Jakarta Sans' },
                        { id: 'mono', label: 'JetBrains Mono' },
                      ].map(font => (
                        <button
                          key={font.id}
                          onClick={() => onUpdateItem(txt.id, { fontFamily: font.id as any })}
                          className={`py-1.5 px-2 text-xs rounded border text-left transition-colors ${
                            txt.fontFamily === font.id
                              ? 'bg-[#181816] text-white border-[#181816]'
                              : 'bg-white text-[#4A4740] border-[#E2DFD8] hover:bg-[#F7F5F0]'
                          }`}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <div className="flex justify-between text-[11px] text-[#736F66] mb-1">
                      <span>Font Size</span>
                      <span className="font-mono">{txt.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="72"
                      value={txt.fontSize}
                      onChange={(e) => onUpdateItem(txt.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full accent-[#181816]"
                    />
                  </div>

                  {/* Text Align & Style toggles */}
                  <div className="flex items-center justify-between bg-[#F2EFE9] p-1 rounded-md">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onUpdateItem(txt.id, { textAlign: 'left' })}
                        className={`p-1 rounded ${txt.textAlign === 'left' ? 'bg-white text-black shadow-2xs' : 'text-[#615D54]'}`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onUpdateItem(txt.id, { textAlign: 'center' })}
                        className={`p-1 rounded ${txt.textAlign === 'center' ? 'bg-white text-black shadow-2xs' : 'text-[#615D54]'}`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onUpdateItem(txt.id, { textAlign: 'right' })}
                        className={`p-1 rounded ${txt.textAlign === 'right' ? 'bg-white text-black shadow-2xs' : 'text-[#615D54]'}`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => onUpdateItem(txt.id, { italic: !txt.italic })}
                        className={`px-2 py-0.5 text-xs font-serif italic rounded ${txt.italic ? 'bg-white text-black shadow-2xs' : 'text-[#615D54]'}`}
                      >
                        I
                      </button>
                      <button
                        onClick={() => onUpdateItem(txt.id, { uppercase: !txt.uppercase })}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${txt.uppercase ? 'bg-white text-black shadow-2xs' : 'text-[#615D54]'}`}
                      >
                        TT
                      </button>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <span className="text-[11px] text-[#66635C] block mb-1">Text Tone</span>
                    <div className="flex space-x-1.5">
                      {['#181816', '#4A4740', '#736F66', '#B58A38', '#A25946', '#4A5B49'].map(c => (
                        <button
                          key={c}
                          onClick={() => onUpdateItem(txt.id, { textColor: c })}
                          className={`w-6 h-6 rounded-full border ${txt.textColor === c ? 'ring-2 ring-black' : 'border-[#D5D0C5]'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ITEM-SPECIFIC PROPS: COLOR SWATCH */}
            {selectedItem.type === 'color' && (() => {
              const col = selectedItem as ColorItem;
              return (
                <div className="space-y-3 pt-2 border-t border-[#EAE8E3]">
                  <label className="text-[11px] font-semibold text-[#736F66] uppercase tracking-wider block">
                    Swatch Color
                  </label>

                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={col.hex}
                      onChange={(e) => onUpdateItem(col.id, { hex: e.target.value.toUpperCase() })}
                      className="w-8 h-8 rounded border border-[#D5D0C5] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={col.hex}
                      onChange={(e) => onUpdateItem(col.id, { hex: e.target.value.toUpperCase() })}
                      className="flex-1 text-xs font-mono p-1.5 bg-white border border-[#DCD8CF] rounded"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#66635C] block mb-1">Swatch Title</label>
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => onUpdateItem(col.id, { name: e.target.value })}
                      className="w-full text-xs p-1.5 bg-white border border-[#DCD8CF] rounded font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#66635C] block mb-1">Subtitle / Material Tag</label>
                    <input
                      type="text"
                      value={col.subtitle || ''}
                      onChange={(e) => onUpdateItem(col.id, { subtitle: e.target.value })}
                      placeholder="e.g. Matte Finish, Velvet Dye"
                      className="w-full text-xs p-1.5 bg-white border border-[#DCD8CF] rounded"
                    />
                  </div>

                  {/* Format */}
                  <div>
                    <label className="text-[11px] text-[#66635C] block mb-1">Display Shape</label>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      {[
                        { id: 'pantone-card', label: 'Pantone' },
                        { id: 'circle', label: 'Circle' },
                        { id: 'pill', label: 'Pill' },
                      ].map(fmt => (
                        <button
                          key={fmt.id}
                          onClick={() => onUpdateItem(col.id, { format: fmt.id as any })}
                          className={`py-1 px-1 rounded border transition-colors ${
                            col.format === fmt.id
                              ? 'bg-[#181816] text-white border-[#181816]'
                              : 'bg-white text-[#4A4740] border-[#E2DFD8]'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ITEM-SPECIFIC PROPS: NOTE */}
            {selectedItem.type === 'note' && (() => {
              const note = selectedItem as NoteItem;
              return (
                <div className="space-y-3 pt-2 border-t border-[#EAE8E3]">
                  <label className="text-[11px] font-semibold text-[#736F66] uppercase tracking-wider block">
                    Paper Tone & Pinning
                  </label>

                  <div className="grid grid-cols-3 gap-1.5">
                    {(['linen', 'sand', 'sage', 'terracotta', 'mist', 'charcoal'] as const).map(color => (
                      <button
                        key={color}
                        onClick={() => onUpdateItem(note.id, { noteColor: color })}
                        className={`py-1 text-[11px] capitalize rounded border transition-all ${
                          note.noteColor === color
                            ? 'ring-2 ring-[#181816] border-transparent font-semibold'
                            : 'border-[#D5D0C5] hover:bg-[#F2EFE9]'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] text-[#66635C] block mb-1">Author Stamp</label>
                    <input
                      type="text"
                      value={note.author || ''}
                      onChange={(e) => onUpdateItem(note.id, { author: e.target.value })}
                      placeholder="e.g. Lead Designer"
                      className="w-full text-xs p-1.5 bg-white border border-[#DCD8CF] rounded"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-3 border-t border-[#EAE8E3] bg-[#F7F5F0] text-[10px] text-[#8C887E] flex justify-between items-center">
        <span>Moodboard Studio</span>
        <span className="font-mono">v1.0</span>
      </div>
    </aside>
  );
};
