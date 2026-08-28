import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space + Drag', desc: 'Pan around the infinite canvas' },
    { key: 'Ctrl / Cmd + Wheel', desc: 'Smooth zoom in / out at cursor' },
    { key: 'Del / Backspace', desc: 'Delete selected element(s)' },
    { key: 'Ctrl / Cmd + Z', desc: 'Undo previous canvas action' },
    { key: 'Ctrl / Cmd + Y', desc: 'Redo previously undone action' },
    { key: 'Ctrl / Cmd + D', desc: 'Duplicate selected element' },
    { key: 'Shift + Click', desc: 'Multi-select multiple elements' },
    { key: 'Arrow Keys', desc: 'Nudge element by 1px (Shift for 10px)' },
    { key: 'Shift + Rotate', desc: 'Snap rotation to 15° increments' },
    { key: 'Space (in Palette Lab)', desc: 'Roll new harmonious color palette' },
    { key: 'Double Click Item', desc: 'Edit text, note, or caption inline' },
    { key: 'Esc', desc: 'Exit presentation mode / close modal' },
  ];

  return (
    <div className="fixed inset-0 bg-[#181816]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#FCFCFA] rounded-2xl shadow-2xl border border-[#E2DFD8] w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE8E3] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-4 h-4 text-[#736F66]" />
            <h2 className="text-sm font-semibold text-[#181816] tracking-tight">
              Keyboard Shortcuts & Gestures
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C887E] hover:text-[#181816] hover:bg-[#F2EFE9] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-6 divide-y divide-[#EAE8E3] max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-[#524E46]">{sc.desc}</span>
              <kbd className="px-2 py-1 bg-[#F2EFE9] border border-[#DDD8CD] rounded-md font-mono text-[11px] text-[#181816] shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F7F5F0] border-t border-[#EAE8E3] flex justify-between items-center text-[11px] text-[#8C887E]">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-[#B58A38]" />
            <span>Moodboard Studio — Minimalist Creative Canvas</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#181816] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#2E2D29] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
