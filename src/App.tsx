import React, { useState, useRef, useEffect } from 'react';
import { useMoodboardStorage } from './hooks/useMoodboardStorage';
import { Navbar } from './components/Navbar';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { PaletteGeneratorModal } from './components/PaletteGeneratorModal';
import { ImagePickerModal } from './components/ImagePickerModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ViewportState, BoardItem } from './types';

export default function App() {
  const {
    boards,
    activeBoardId,
    activeBoard,
    setActiveBoardId,
    createBoard,
    updateBoard,
    renameBoard,
    duplicateBoard,
    deleteBoard,
    addItem,
    updateItem,
    updateItems,
    deleteItem,
    deleteItems,
    duplicateItem,
    bringForward,
    sendBackward,
    organizeAsGrid,
    undo,
    redo,
    canUndo,
    canRedo,
    importBoard,
  } = useMoodboardStorage();

  // Selection state
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Viewport (Pan & Zoom) state
  const [viewport, setViewport] = useState<ViewportState>({
    x: 40,
    y: 40,
    zoom: 0.9,
  });

  // Modal states
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Clear selection when board changes
  useEffect(() => {
    setSelectedItemIds([]);
  }, [activeBoardId]);

  // Escape key to exit preview mode or close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPreviewMode) setIsPreviewMode(false);
        if (isPaletteModalOpen) setIsPaletteModalOpen(false);
        if (isImagePickerOpen) setIsImagePickerOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewMode, isPaletteModalOpen, isImagePickerOpen, isShortcutsOpen]);

  // Compute center of current visible canvas in canvas space
  const getCanvasViewportCenter = () => {
    const centerX = (-viewport.x + (window.innerWidth / 2)) / viewport.zoom;
    const centerY = (-viewport.y + (window.innerHeight / 2)) / viewport.zoom;
    return {
      x: Math.max(100, Math.round(centerX)),
      y: Math.max(100, Math.round(centerY)),
    };
  };

  // Item selection handler
  const handleSelectItem = (id: string, multiSelect: boolean) => {
    if (multiSelect) {
      setSelectedItemIds(prev =>
        prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
      );
    } else {
      setSelectedItemIds([id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedItemIds([]);
  };

  // Layout mode toggle (freeform vs grid)
  const handleToggleLayout = () => {
    const nextMode = activeBoard.layoutMode === 'freeform' ? 'grid' : 'freeform';
    updateBoard({ layoutMode: nextMode });
    if (nextMode === 'grid') {
      organizeAsGrid(3, 30);
    }
  };

  // Selected items list for properties inspector
  const selectedItems = activeBoard.items.filter(it => selectedItemIds.includes(it.id));

  return (
    <div id="moodboard-studio-app" className="w-screen h-screen flex flex-col bg-[#FBFBFA] text-[#181816] overflow-hidden">
      {/* Top Navigation Bar */}
      {!isPreviewMode && (
        <Navbar
          activeBoard={activeBoard}
          boards={boards}
          onSelectBoard={setActiveBoardId}
          onCreateBoard={createBoard}
          onDuplicateBoard={duplicateBoard}
          onDeleteBoard={deleteBoard}
          onRenameBoard={renameBoard}
          onImportBoard={importBoard}
          onToggleLayout={handleToggleLayout}
          onOrganizeGrid={() => organizeAsGrid(3, 30)}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onOpenPaletteGenerator={() => setIsPaletteModalOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          isPreviewMode={isPreviewMode}
          onTogglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
          canvasRef={canvasRef}
        />
      )}

      {/* Main Workspace Area (Toolbar + Canvas + Properties Panel) */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Toolbar */}
        {!isPreviewMode && (
          <Toolbar
            onAddItem={addItem}
            onOpenImagePicker={() => setIsImagePickerOpen(true)}
            onOpenPaletteGenerator={() => setIsPaletteModalOpen(true)}
            canvasViewportCenter={getCanvasViewportCenter()}
          />
        )}

        {/* Center Canvas */}
        <Canvas
          board={activeBoard}
          selectedItemIds={selectedItemIds}
          onSelectItem={handleSelectItem}
          onClearSelection={handleClearSelection}
          onUpdateItem={updateItem}
          onUpdateItems={updateItems}
          onDeleteItem={deleteItem}
          onDeleteItems={deleteItems}
          onDuplicateItem={duplicateItem}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          onAddItem={addItem}
          viewport={viewport}
          setViewport={setViewport}
          canvasRef={canvasRef}
          isPreviewMode={isPreviewMode}
          onUpdateBoard={updateBoard}
        />

        {/* Right Properties Panel */}
        {!isPreviewMode && (
          <PropertiesPanel
            board={activeBoard}
            selectedItems={selectedItems}
            onUpdateItem={updateItem}
            onUpdateItems={updateItems}
            onUpdateBoard={updateBoard}
            onDuplicateItem={duplicateItem}
            onDeleteItem={deleteItem}
            onDeleteItems={deleteItems}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            onAddItem={addItem}
          />
        )}
      </div>

      {/* Palette Generator Laboratory Modal */}
      <PaletteGeneratorModal
        isOpen={isPaletteModalOpen}
        onClose={() => setIsPaletteModalOpen(false)}
        onAddPaletteToCanvas={addItem}
        onAddSwatchesToCanvas={(swatches) => swatches.forEach(swatch => addItem(swatch))}
        canvasViewportCenter={getCanvasViewportCenter()}
      />

      {/* Curated Image Picker Modal */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onAddImage={addItem}
        canvasViewportCenter={getCanvasViewportCenter()}
      />

      {/* Shortcuts & Gestures Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
