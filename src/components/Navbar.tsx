import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  FolderOpen,
  ChevronDown,
  Copy,
  Trash2,
  Edit2,
  Check,
  Undo2,
  Redo2,
  Download,
  Printer,
  FileJson,
  Upload,
  LayoutGrid,
  Maximize2,
  Eye,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Moodboard } from '../types';
import { exportBoardAsImage, printMoodboard, exportBoardAsJson, importBoardFromJson } from '../utils/export';

interface NavbarProps {
  activeBoard: Moodboard;
  boards: Moodboard[];
  onSelectBoard: (id: string) => void;
  onCreateBoard: (title?: string, templateId?: string) => void;
  onDuplicateBoard: (id: string) => void;
  onDeleteBoard: (id: string) => void;
  onRenameBoard: (id: string, newTitle: string) => void;
  onImportBoard: (board: Moodboard) => void;
  onToggleLayout: () => void;
  onOrganizeGrid: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenPaletteGenerator: () => void;
  onOpenShortcuts: () => void;
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeBoard,
  boards,
  onSelectBoard,
  onCreateBoard,
  onDuplicateBoard,
  onDeleteBoard,
  onRenameBoard,
  onImportBoard,
  onToggleLayout,
  onOrganizeGrid,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenPaletteGenerator,
  onOpenShortcuts,
  isPreviewMode,
  onTogglePreviewMode,
  canvasRef,
}) => {
  const [isBoardsMenuOpen, setIsBoardsMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isNewBoardMenuOpen, setIsNewBoardMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(activeBoard.title);
  const [isExporting, setIsExporting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const boardsDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempTitle(activeBoard.title);
  }, [activeBoard.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boardsDropdownRef.current && !boardsDropdownRef.current.contains(e.target as Node)) {
        setIsBoardsMenuOpen(false);
        setIsNewBoardMenuOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onRenameBoard(activeBoard.id, tempTitle.trim());
    } else {
      setTempTitle(activeBoard.title);
    }
    setIsEditingTitle(false);
  };

  const handleExportPng = async () => {
    try {
      setIsExporting(true);
      setIsExportMenuOpen(false);
      await exportBoardAsImage(activeBoard, 'png', 2);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJpeg = async () => {
    try {
      setIsExporting(true);
      setIsExportMenuOpen(false);
      await exportBoardAsImage(activeBoard, 'jpeg', 2);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const board = await importBoardFromJson(file);
        onImportBoard(board);
        setIsExportMenuOpen(false);
      } catch (err) {
        alert('Invalid moodboard JSON file format.');
      }
    }
    e.target.value = '';
  };

  return (
    <header id="app-navbar" className="h-14 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#EAE8E3] px-4 flex items-center justify-between z-30 select-none no-print">
      {/* Left: Brand + Board Switcher */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-[#181816] text-[#FAF8F5] flex items-center justify-center font-serif-title text-base font-medium shadow-xs">
            M
          </div>
          <span className="font-medium text-sm tracking-tight text-[#181816] hidden sm:inline-block">
            Moodspace Studio
          </span>
        </div>

        <div className="h-4 w-px bg-[#E2DFD8]" />

        {/* Board selector */}
        <div className="relative" ref={boardsDropdownRef}>
          <div className="flex items-center space-x-1.5">
            {isEditingTitle ? (
              <div className="flex items-center space-x-1">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setTempTitle(activeBoard.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  onBlur={handleSaveTitle}
                  className="px-2 py-0.5 text-sm font-medium text-[#181816] bg-white border border-[#181816] rounded shadow-2xs focus:outline-none max-w-[200px]"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-[#181816] hover:bg-[#EFECE6] rounded"
                  title="Save title"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center group">
                <button
                  id="board-selector-btn"
                  onClick={() => setIsBoardsMenuOpen(!isBoardsMenuOpen)}
                  className="flex items-center space-x-2 px-2.5 py-1 text-sm font-medium text-[#181816] hover:bg-[#F2EFE9] rounded-md transition-colors border border-transparent hover:border-[#E2DFD8]"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#736F66]" />
                  <span className="truncate max-w-[160px] sm:max-w-[220px] text-left">
                    {activeBoard.title}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C887E]" />
                </button>

                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#8C887E] hover:text-[#181816] hover:bg-[#F2EFE9] rounded transition-opacity"
                  title="Rename moodboard"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Boards dropdown list */}
          {isBoardsMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-[#FCFCFA] rounded-lg shadow-xl border border-[#E2DFD8] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-[#EAE8E3] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8C887E] uppercase tracking-wider">
                  Your Moodboards ({boards.length})
                </span>
                <button
                  id="new-board-btn"
                  onClick={() => {
                    onCreateBoard('Untitled Concept');
                    setIsBoardsMenuOpen(false);
                  }}
                  className="flex items-center space-x-1 text-xs font-medium text-[#181816] hover:bg-[#EFECE6] px-2 py-0.5 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Board</span>
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {boards.map((b) => (
                  <div
                    key={b.id}
                    className={`px-3 py-2 text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                      b.id === activeBoard.id
                        ? 'bg-[#F2EFE9] text-[#181816] font-semibold'
                        : 'text-[#4A4740] hover:bg-[#F7F5F0]'
                    }`}
                    onClick={() => {
                      onSelectBoard(b.id);
                      setIsBoardsMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-[#D5D0C5]"
                        style={{ backgroundColor: b.backgroundColor || '#FBFBFA' }}
                      />
                      <span className="truncate">{b.title}</span>
                      <span className="text-[10px] text-[#A09C91] font-normal shrink-0">
                        ({b.items.length} items)
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateBoard(b.id);
                        }}
                        className="p-1 hover:bg-[#E5E2DA] rounded text-[#736F66] hover:text-[#181816]"
                        title="Duplicate board"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {boards.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete moodboard "${b.title}"?`)) {
                              onDeleteBoard(b.id);
                            }
                          }}
                          className="p-1 hover:bg-[#FEE2E2] rounded text-[#736F66] hover:text-[#DC2626]"
                          title="Delete board"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Starter templates sub-action */}
              <div className="pt-1.5 border-t border-[#EAE8E3] px-2">
                <button
                  onClick={() => setIsNewBoardMenuOpen(!isNewBoardMenuOpen)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-[#524E46] hover:bg-[#F2EFE9] rounded transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B58A38]" />
                    <span>Explore Aesthetic Templates</span>
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8C887E]" />
                </button>

                {isNewBoardMenuOpen && (
                  <div className="mt-1 pb-1 space-y-1">
                    <button
                      onClick={() => {
                        onCreateBoard('Nordic Architectural Living', 'board-nordic-minimal');
                        setIsBoardsMenuOpen(false);
                        setIsNewBoardMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-[11px] text-[#4A4740] hover:bg-[#F0EDE6] rounded"
                    >
                      • Nordic Architectural Minimal
                    </button>
                    <button
                      onClick={() => {
                        onCreateBoard('Editorial Haute & Warm Neutrals', 'board-editorial-fashion');
                        setIsBoardsMenuOpen(false);
                        setIsNewBoardMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-[11px] text-[#4A4740] hover:bg-[#F0EDE6] rounded"
                    >
                      • Editorial Haute & Warm Neutrals
                    </button>
                    <button
                      onClick={() => {
                        onCreateBoard('Kyoto Botanical & Wabi-Sabi', 'board-kyoto-botanical');
                        setIsBoardsMenuOpen(false);
                        setIsNewBoardMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-[11px] text-[#4A4740] hover:bg-[#F0EDE6] rounded"
                    >
                      • Kyoto Botanical & Wabi-Sabi
                    </button>
                    <button
                      onClick={() => {
                        onCreateBoard('Raw Brutalism & Monolithic Concrete', 'board-raw-brutalism');
                        setIsBoardsMenuOpen(false);
                        setIsNewBoardMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-[11px] text-[#4A4740] hover:bg-[#F0EDE6] rounded"
                    >
                      • Raw Brutalism & Monolithic Concrete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Quick Canvas Actions & Layout Toggle */}
      <div className="hidden md:flex items-center space-x-1 bg-[#F2EFE9] p-1 rounded-lg border border-[#E2DFD8]">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded text-[#524E46] hover:text-[#181816] hover:bg-[#FCFCFA] disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded text-[#524E46] hover:text-[#181816] hover:bg-[#FCFCFA] disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-px bg-[#DCD9D0] mx-0.5" />

        <button
          onClick={onToggleLayout}
          className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            activeBoard.layoutMode === 'freeform'
              ? 'bg-[#FCFCFA] text-[#181816] shadow-2xs'
              : 'text-[#615D54] hover:text-[#181816]'
          }`}
          title="Switch between Freeform & Masonry Grid Layout"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{activeBoard.layoutMode === 'freeform' ? 'Freeform' : 'Grid Mode'}</span>
        </button>

        <button
          onClick={onOrganizeGrid}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-[#615D54] hover:text-[#181816] hover:bg-[#FCFCFA] rounded transition-colors"
          title="Auto-organize items into an aesthetic Masonry column grid"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Snap Grid</span>
        </button>
      </div>

      {/* Right: Palette Generator, Export, Preview, Help */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenPaletteGenerator}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-[#181816] bg-[#EFECE6] hover:bg-[#E6E2D8] border border-[#DDD8CD] rounded-md transition-colors"
          title="Open Color Palette Generator"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#B58A38]" />
          <span>Palette Lab</span>
        </button>

        {/* Export dropdown */}
        <div className="relative" ref={exportDropdownRef}>
          <button
            id="export-menu-btn"
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-[#181816] text-[#FAF8F5] hover:bg-[#2A2A26] rounded-md shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            <ChevronDown className="w-3 h-3 text-[#A8A49C]" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#FCFCFA] rounded-lg shadow-xl border border-[#E2DFD8] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#8C887E] uppercase tracking-wider">
                Export Artwork
              </div>
              <button
                onClick={handleExportPng}
                className="w-full text-left px-3 py-2 text-xs text-[#2A2924] hover:bg-[#F2EFE9] flex items-center justify-between"
              >
                <span>Export High-Res PNG</span>
                <span className="text-[10px] text-[#8C887E]">2x Retina</span>
              </button>
              <button
                onClick={handleExportJpeg}
                className="w-full text-left px-3 py-2 text-xs text-[#2A2924] hover:bg-[#F2EFE9] flex items-center justify-between"
              >
                <span>Export JPEG Image</span>
                <span className="text-[10px] text-[#8C887E]">High Quality</span>
              </button>
              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  printMoodboard();
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#2A2924] hover:bg-[#F2EFE9] flex items-center space-x-2"
              >
                <Printer className="w-3.5 h-3.5 text-[#736F66]" />
                <span>Print Moodboard / PDF</span>
              </button>

              <div className="my-1 border-t border-[#EAE8E3]" />

              <div className="px-3 py-1 text-[11px] font-semibold text-[#8C887E] uppercase tracking-wider">
                Backup & Share
              </div>
              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  exportBoardAsJson(activeBoard);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#2A2924] hover:bg-[#F2EFE9] flex items-center space-x-2"
              >
                <FileJson className="w-3.5 h-3.5 text-[#736F66]" />
                <span>Save Board as JSON</span>
              </button>
              <label className="w-full text-left px-3 py-2 text-xs text-[#2A2924] hover:bg-[#F2EFE9] flex items-center space-x-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#736F66]" />
                <span>Import JSON Moodboard</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJsonFile}
                />
              </label>
            </div>
          )}
        </div>

        {/* Preview / Presentation mode */}
        <button
          onClick={onTogglePreviewMode}
          className={`p-1.5 rounded-md border transition-colors ${
            isPreviewMode
              ? 'bg-[#181816] text-[#FAF8F5] border-[#181816]'
              : 'text-[#524E46] hover:text-[#181816] hover:bg-[#F2EFE9] border-[#E2DFD8]'
          }`}
          title={isPreviewMode ? 'Exit Presentation Mode (Esc)' : 'Presentation / View Mode'}
        >
          {isPreviewMode ? <Maximize2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Shortcuts modal trigger */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 text-[#736F66] hover:text-[#181816] hover:bg-[#F2EFE9] rounded-md transition-colors"
          title="Keyboard shortcuts & guides"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
