import React, { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  Copy,
  Trash2,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Eye,
  Check,
} from 'lucide-react';
import { BoardItem, ImageItem, TextItem, ColorItem, PaletteItem, NoteItem, LinkItem, ShapeItem } from '../types';

interface CanvasItemProps {
  item: BoardItem;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent, itemId: string) => void;
  onStartDrag: (e: React.MouseEvent, itemId: string) => void;
  onStartResize: (e: React.MouseEvent, itemId: string, handle: 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w') => void;
  onStartRotate: (e: React.MouseEvent, itemId: string) => void;
  onUpdate: (itemId: string, patch: Partial<BoardItem>) => void;
  onDuplicate: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onBringForward: (itemId: string) => void;
  onSendBackward: (itemId: string) => void;
  zoom: number;
}

export const CanvasItem: React.FC<CanvasItemProps> = ({
  item,
  isSelected,
  onSelect,
  onStartDrag,
  onStartResize,
  onStartRotate,
  onUpdate,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
  zoom,
}) => {
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const textEditRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingInline && textEditRef.current) {
      textEditRef.current.focus();
      textEditRef.current.select();
    }
  }, [isEditingInline]);

  // Shadow class mappings
  const getShadowClass = (shadow?: string) => {
    switch (shadow) {
      case 'subtle': return 'shadow-xs';
      case 'medium': return 'shadow-md';
      case 'editorial': return 'shadow-[0_12px_32px_rgba(0,0,0,0.08)]';
      case 'lifted': return 'shadow-[0_16px_36px_rgba(0,0,0,0.12)]';
      case 'none':
      default: return '';
    }
  };

  // Image filter mappings
  const getImageFilterStyle = (filter?: string) => {
    switch (filter) {
      case 'grayscale': return 'grayscale';
      case 'sepia': return 'sepia-[0.35] brightness-[0.95]';
      case 'warmth': return 'sepia-[0.2] saturate-[1.1] hue-rotate-[-10deg]';
      case 'cool': return 'saturate-[0.9] hue-rotate-[15deg]';
      case 'high-contrast': return 'contrast-[1.25] brightness-[0.98]';
      default: return '';
    }
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // Render content based on item type
  const renderItemContent = () => {
    switch (item.type) {
      case 'image': {
        const img = item as ImageItem;
        return (
          <div className="w-full h-full flex flex-col overflow-hidden select-none">
            <div className="relative w-full flex-1 overflow-hidden">
              <img
                src={img.src}
                alt={img.alt || 'Moodboard asset'}
                className={`w-full h-full ${img.objectFit === 'contain' ? 'object-contain' : 'object-cover'} ${getImageFilterStyle(img.filter)} transition-all duration-200`}
                draggable={false}
                loading="eager"
              />
            </div>
            {img.showCaption && (
              <div className="px-2.5 py-1.5 bg-[#FAF8F5]/90 backdrop-blur-xs border-t border-[#EAE8E3] text-[11px] text-[#55524A] font-serif-title truncate">
                {img.caption || 'Image Reference'}
              </div>
            )}
          </div>
        );
      }

      case 'text': {
        const txt = item as TextItem;
        const fontClass =
          txt.fontFamily === 'serif' ? 'font-serif-title' :
          txt.fontFamily === 'editorial' ? 'font-editorial' :
          txt.fontFamily === 'cinzel' ? 'font-cinzel' :
          txt.fontFamily === 'mono' ? 'font-mono-code' : 'font-sans';

        if (isEditingInline) {
          return (
            <textarea
              ref={textEditRef}
              value={txt.content}
              onChange={(e) => onUpdate(item.id, { content: e.target.value })}
              onBlur={() => setIsEditingInline(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsEditingInline(false);
              }}
              style={{
                fontSize: `${txt.fontSize}px`,
                fontWeight: txt.fontWeight,
                color: txt.textColor,
                letterSpacing: `${txt.letterSpacing || 0}em`,
                lineHeight: txt.lineHeight || 1.3,
                textAlign: txt.textAlign,
                fontStyle: txt.italic ? 'italic' : 'normal',
                textTransform: txt.uppercase ? 'uppercase' : 'none',
              }}
              className={`w-full h-full bg-white/90 p-2 border border-[#181816] rounded resize-none focus:outline-none ${fontClass}`}
            />
          );
        }

        return (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingInline(true);
            }}
            style={{
              fontSize: `${txt.fontSize}px`,
              fontWeight: txt.fontWeight,
              color: txt.textColor,
              letterSpacing: `${txt.letterSpacing || 0}em`,
              lineHeight: txt.lineHeight || 1.3,
              textAlign: txt.textAlign,
              fontStyle: txt.italic ? 'italic' : 'normal',
              textTransform: txt.uppercase ? 'uppercase' : 'none',
              backgroundColor: txt.backgroundColor || 'transparent',
              padding: txt.padding ? `${txt.padding}px` : undefined,
            }}
            className={`w-full h-full flex flex-col justify-center select-none whitespace-pre-wrap ${fontClass}`}
          >
            {txt.content}
          </div>
        );
      }

      case 'color': {
        const col = item as ColorItem;
        if (col.format === 'circle') {
          return (
            <div
              onClick={(e) => copyToClipboard(col.hex, e)}
              className="w-full h-full rounded-full flex flex-col items-center justify-center p-3 relative group/color cursor-pointer"
              style={{ backgroundColor: col.hex }}
              title="Click to copy Hex code"
            >
              <div className="opacity-0 group-hover/color:opacity-100 transition-opacity bg-black/75 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                {copiedHex === col.hex ? 'Copied!' : col.hex}
              </div>
            </div>
          );
        }

        if (col.format === 'pill') {
          return (
            <div
              onClick={(e) => copyToClipboard(col.hex, e)}
              className="w-full h-full rounded-full flex items-center justify-between px-4 py-2 cursor-pointer shadow-xs border border-[#181816]/10"
              style={{ backgroundColor: col.hex }}
            >
              <span className="text-xs font-semibold tracking-wide drop-shadow-2xs text-[#FAF8F5]">
                {col.name}
              </span>
              <span className="text-[11px] font-mono bg-black/30 text-white px-2 py-0.5 rounded-full">
                {copiedHex === col.hex ? 'Copied' : col.hex}
              </span>
            </div>
          );
        }

        // Default: Pantone Card
        return (
          <div
            onClick={(e) => copyToClipboard(col.hex, e)}
            className="w-full h-full bg-[#FAF8F5] border border-[#E5E2DA] rounded-md overflow-hidden flex flex-col cursor-pointer shadow-2xs group/pantone"
          >
            <div
              className="w-full flex-1 min-h-[60%] relative"
              style={{ backgroundColor: col.hex }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/pantone:opacity-100 transition-opacity bg-black/20 text-white text-[11px] font-mono font-medium">
                {copiedHex === col.hex ? '✓ Copied Hex' : 'Copy Hex'}
              </div>
            </div>
            <div className="p-2.5 bg-[#FAF8F5] flex flex-col justify-between">
              <div className="text-[11px] font-bold tracking-wider text-[#181816] truncate uppercase font-sans">
                {col.name || 'COLOR SWATCH'}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#736F66] font-mono mt-1">
                <span>{col.hex}</span>
                {col.subtitle && <span className="truncate max-w-[70px] text-[9px]">{col.subtitle}</span>}
              </div>
            </div>
          </div>
        );
      }

      case 'palette': {
        const pal = item as PaletteItem;
        return (
          <div className="w-full h-full bg-[#FAF8F5] border border-[#E5E2DA] rounded-lg p-2.5 flex flex-col justify-between shadow-xs">
            <div className="text-[11px] font-bold text-[#181816] tracking-wider uppercase font-sans mb-1.5 truncate">
              {pal.name}
            </div>
            <div className="w-full flex-1 flex rounded-md overflow-hidden border border-[#E0DCD2]">
              {pal.colors.map((c, i) => (
                <div
                  key={i}
                  onClick={(e) => copyToClipboard(c.hex, e)}
                  style={{ backgroundColor: c.hex }}
                  className="flex-1 h-full relative group/chip cursor-pointer transition-all hover:flex-grow-[1.3]"
                  title={`${c.name || ''} ${c.hex} (Click to copy)`}
                >
                  <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-0 group-hover/chip:opacity-100 transition-opacity">
                    <span className="text-[9px] font-mono bg-black/75 text-white px-1 py-0.5 rounded">
                      {copiedHex === c.hex ? 'Copied' : c.hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {pal.showHexLabels && (
              <div className="flex justify-between items-center mt-1.5 px-0.5">
                {pal.colors.map((c, i) => (
                  <span key={i} className="text-[9px] font-mono text-[#8C887E]">
                    {c.hex}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'note': {
        const note = item as NoteItem;
        const colorStyles = {
          linen: 'bg-[#F7F5F0] border-[#E8E4DA] text-[#2D2A24]',
          sand: 'bg-[#F9EFE6] border-[#EADACD] text-[#3D2C20]',
          sage: 'bg-[#EFF4EC] border-[#DCE4D6] text-[#263322]',
          terracotta: 'bg-[#FAECE3] border-[#EDD5C6] text-[#4A2616]',
          mist: 'bg-[#F0F5F8] border-[#DCE5EB] text-[#222E35]',
          charcoal: 'bg-[#22211E] border-[#383632] text-[#EDEAE3]',
        };

        return (
          <div className={`w-full h-full p-4 rounded-md border flex flex-col justify-between relative shadow-xs ${colorStyles[note.noteColor] || colorStyles.linen}`}>
            {/* Tape style accent */}
            {note.pinStyle === 'tape-top' && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#EAE5D9]/70 backdrop-blur-2xs border-t border-b border-[#D8D2C4]/80 -rotate-1 pointer-events-none shadow-2xs" />
            )}

            {isEditingInline ? (
              <textarea
                ref={textEditRef}
                value={note.text}
                onChange={(e) => onUpdate(item.id, { text: e.target.value })}
                onBlur={() => setIsEditingInline(false)}
                className="w-full flex-1 bg-transparent resize-none focus:outline-none text-xs leading-relaxed"
              />
            ) : (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingInline(true);
                }}
                className="text-xs leading-relaxed select-none whitespace-pre-wrap flex-1"
              >
                {note.text}
              </div>
            )}

            <div className="pt-2 mt-2 border-t border-current/10 flex items-center justify-between text-[10px] opacity-75 font-mono">
              <span>{note.author || 'Studio Note'}</span>
              <span>{note.date}</span>
            </div>
          </div>
        );
      }

      case 'link': {
        const link = item as LinkItem;
        return (
          <div className="w-full h-full bg-[#FAF8F5] border border-[#E5E2DA] rounded-lg p-3 flex flex-col justify-between shadow-2xs hover:border-[#181816] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <div className="text-xs font-semibold text-[#181816] line-clamp-1">{link.title}</div>
                {link.description && (
                  <div className="text-[11px] text-[#66635C] line-clamp-2 mt-1 leading-normal">
                    {link.description}
                  </div>
                )}
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-[#8C887E] hover:text-[#181816] hover:bg-[#EFECE6]"
                title="Open link in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="text-[10px] font-mono text-[#8C887E] pt-2 border-t border-[#EAE8E3] truncate">
              {link.domain || link.url}
            </div>
          </div>
        );
      }

      case 'shape': {
        const shape = item as ShapeItem;
        if (shape.shapeType === 'frame') {
          return (
            <div
              className="w-full h-full"
              style={{
                borderWidth: `${shape.borderWidth || 1}px`,
                borderColor: shape.borderColor || '#181816',
                borderStyle: shape.strokeStyle || 'solid',
                borderRadius: `${shape.borderRadius || 4}px`,
                backgroundColor: shape.fillColor || 'transparent',
              }}
            />
          );
        }
        if (shape.shapeType === 'divider') {
          return (
            <div
              className="w-full h-full flex items-center"
            >
              <div
                className="w-full"
                style={{
                  height: `${shape.borderWidth || 1}px`,
                  backgroundColor: shape.strokeColor || '#DCD8CF',
                }}
              />
            </div>
          );
        }
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: shape.fillColor || '#EFECE6',
              borderRadius: `${shape.borderRadius || 6}px`,
            }}
          />
        );
      }

      default:
        return null;
    }
  };

  const handlePointerDown = (e: React.MouseEvent) => {
    if (item.locked) return;
    onSelect(e, item.id);
    onStartDrag(e, item.id);
  };

  return (
    <div
      id={`canvas-item-${item.id}`}
      style={{
        transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation || 0}deg)`,
        width: `${item.width}px`,
        height: `${item.height}px`,
        zIndex: item.zIndex || 1,
        opacity: item.opacity !== undefined ? item.opacity : 1,
      }}
      className={`absolute top-0 left-0 transition-shadow ${
        isSelected ? 'ring-2 ring-[#181816] ring-offset-2 ring-offset-transparent' : 'hover:ring-1 hover:ring-[#A8A49C]/50'
      } ${getShadowClass(item.shadow)}`}
      onMouseDown={handlePointerDown}
    >
      {/* Element Inner Content */}
      <div className="w-full h-full rounded-[inherit] overflow-hidden">
        {renderItemContent()}
      </div>

      {/* Selected Action Floating Toolbar */}
      {isSelected && !item.locked && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#181816] text-white px-2 py-1 rounded-md shadow-lg flex items-center space-x-1.5 z-50 selection-handle no-print animate-in fade-in zoom-in-95 duration-100"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onDuplicate(item.id)}
            className="p-1 hover:bg-[#33322E] rounded text-white/80 hover:text-white"
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={() => onBringForward(item.id)}
            className="p-1 hover:bg-[#33322E] rounded text-white/80 hover:text-white"
            title="Bring Forward"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onSendBackward(item.id)}
            className="p-1 hover:bg-[#33322E] rounded text-white/80 hover:text-white"
            title="Send Backward"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => onUpdate(item.id, { locked: true })}
            className="p-1 hover:bg-[#33322E] rounded text-white/80 hover:text-white"
            title="Lock Item"
          >
            <Lock className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 hover:bg-[#DC2626] rounded text-white/80 hover:text-white"
            title="Delete (Del / Backspace)"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Locked Badge */}
      {item.locked && isSelected && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#33322E] text-white px-2 py-0.5 rounded text-[10px] flex items-center space-x-1 z-50 selection-handle no-print cursor-pointer"
          onClick={() => onUpdate(item.id, { locked: false })}
          title="Click to unlock"
        >
          <Lock className="w-3 h-3 text-[#E5B54F]" />
          <span>Locked (Click to Unlock)</span>
        </div>
      )}

      {/* Resize handles when selected */}
      {isSelected && !item.locked && (
        <>
          {/* Top Rotation Handle */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#181816] text-white flex items-center justify-center cursor-grab active:cursor-grabbing selection-handle no-print shadow-xs"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartRotate(e, item.id);
            }}
            title="Drag to Rotate"
          >
            <RotateCw className="w-2.5 h-2.5 text-white" />
          </div>

          {/* 8 Bounding Box Resize Points */}
          <div
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#181816] rounded-xs cursor-nwse-resize selection-handle no-print"
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, item.id, 'nw'); }}
          />
          <div
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#181816] rounded-xs cursor-nesw-resize selection-handle no-print"
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, item.id, 'ne'); }}
          />
          <div
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#181816] rounded-xs cursor-nwse-resize selection-handle no-print"
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, item.id, 'se'); }}
          />
          <div
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#181816] rounded-xs cursor-nesw-resize selection-handle no-print"
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, item.id, 'sw'); }}
          />

          {/* Cardinal Edges */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-2 bg-white border border-[#181816] rounded-2xs cursor-ns-resize selection-handle no-print"
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, item.id, 'n'); }}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-2 bg-white border border-[#181816] rounded-2xs cursor-ns-resize selection-handle no-print"
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, item.id, 's'); }}
          />
          <div
            className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-3 bg-white border border-[#181816] rounded-2xs cursor-ew-resize selection-handle no-print"
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, item.id, 'w'); }}
          />
          <div
            className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-3 bg-white border border-[#181816] rounded-2xs cursor-ew-resize selection-handle no-print"
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, item.id, 'e'); }}
          />
        </>
      )}
    </div>
  );
};
