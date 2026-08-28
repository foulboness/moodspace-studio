import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Grid,
  Hand,
  MousePointer,
  Sparkles,
  Move,
} from 'lucide-react';
import { Moodboard, BoardItem, ViewportState, DragState, ResizeState, RotateState } from '../types';
import { CanvasItem } from './CanvasItem';

interface CanvasProps {
  board: Moodboard;
  selectedItemIds: string[];
  onSelectItem: (id: string, multiSelect: boolean) => void;
  onClearSelection: () => void;
  onUpdateItem: (itemId: string, patch: Partial<BoardItem>, skipHistory?: boolean) => void;
  onUpdateItems: (patches: Record<string, Partial<BoardItem>>, skipHistory?: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteItems: (itemIds: string[]) => void;
  onDuplicateItem: (itemId: string) => void;
  onBringForward: (itemId: string) => void;
  onSendBackward: (itemId: string) => void;
  onAddItem: (itemData: Omit<BoardItem, 'id' | 'zIndex'>) => void;
  viewport: ViewportState;
  setViewport: React.Dispatch<React.SetStateAction<ViewportState>>;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isPreviewMode: boolean;
  onUpdateBoard: (patch: Partial<Moodboard>) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  board,
  selectedItemIds,
  onSelectItem,
  onClearSelection,
  onUpdateItem,
  onUpdateItems,
  onDeleteItem,
  onDeleteItems,
  onDuplicateItem,
  onBringForward,
  onSendBackward,
  onAddItem,
  viewport,
  setViewport,
  canvasRef,
  isPreviewMode,
  onUpdateBoard,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Tool state
  const [isPanToolActive, setIsPanToolActive] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // Marquee selection state
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    itemId: null,
    itemIds: [],
    startX: 0,
    startY: 0,
    initialPositions: {},
  });

  // Resize state
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    itemId: '',
    handle: 'se',
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialWidth: 0,
    initialHeight: 0,
  });

  // Rotate state
  const [rotateState, setRotateState] = useState<RotateState>({
    isRotating: false,
    itemId: '',
    centerX: 0,
    centerY: 0,
    initialAngle: 0,
    currentRotation: 0,
  });

  // Convert screen coordinates to canvas space
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (screenX - rect.left - viewport.x) / viewport.zoom;
    const y = (screenY - rect.top - viewport.y) / viewport.zoom;
    return { x, y };
  }, [viewport]);

  // Spacebar pan listener & keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemIds.length > 0) {
        e.preventDefault();
        onDeleteItems(selectedItemIds);
      }

      // Duplicate selected (Ctrl+D / Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedItemIds.length === 1) {
        e.preventDefault();
        onDuplicateItem(selectedItemIds[0]);
      }

      // Nudge with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedItemIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

        const patches: Record<string, Partial<BoardItem>> = {};
        board.items.forEach(it => {
          if (selectedItemIds.includes(it.id) && !it.locked) {
            patches[it.id] = {
              x: it.x + dx,
              y: it.y + dy,
            };
          }
        });
        onUpdateItems(patches);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedItemIds, onDeleteItems, onDuplicateItem, onUpdateItems, board.items]);

  // Mouse wheel zoom / pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom centered on cursor
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.max(0.2, Math.min(3.0, viewport.zoom * zoomFactor));

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - (mouseX - viewport.x) * (newZoom / viewport.zoom);
        const newY = mouseY - (mouseY - viewport.y) * (newZoom / viewport.zoom);

        setViewport({ x: newX, y: newY, zoom: newZoom });
      }
    } else {
      // Regular pan
      setViewport(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Canvas background mousedown (for Pan or Marquee select)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpacePressed || isPanToolActive) {
      // Middle click or space pan
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        vx: viewport.x,
        vy: viewport.y,
      };
      return;
    }

    if (e.button === 0) {
      // Click on blank canvas -> clear selection and start marquee
      if (!e.shiftKey) {
        onClearSelection();
      }
      const coords = screenToCanvas(e.clientX, e.clientY);
      setMarquee({
        startX: coords.x,
        startY: coords.y,
        currentX: coords.x,
        currentY: coords.y,
      });
    }
  };

  // Start item drag
  const handleStartDrag = (e: React.MouseEvent, itemId: string) => {
    const isMulti = selectedItemIds.includes(itemId) && selectedItemIds.length > 1;
    const targetIds = isMulti ? selectedItemIds : [itemId];

    const initialPos: Record<string, { x: number; y: number }> = {};
    board.items.forEach(it => {
      if (targetIds.includes(it.id)) {
        initialPos[it.id] = { x: it.x, y: it.y };
      }
    });

    setDragState({
      isDragging: true,
      itemId,
      itemIds: targetIds,
      startX: e.clientX,
      startY: e.clientY,
      initialPositions: initialPos,
    });
  };

  // Start item resize
  const handleStartResize = (
    e: React.MouseEvent,
    itemId: string,
    handle: 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w'
  ) => {
    const item = board.items.find(it => it.id === itemId);
    if (!item) return;

    setResizeState({
      isResizing: true,
      itemId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: item.x,
      initialY: item.y,
      initialWidth: item.width,
      initialHeight: item.height,
      aspectRatio: item.width / item.height,
      lockAspectRatio: e.shiftKey || item.type === 'image',
    });
  };

  // Start item rotate
  const handleStartRotate = (e: React.MouseEvent, itemId: string) => {
    const item = board.items.find(it => it.id === itemId);
    if (!item) return;

    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    const coords = screenToCanvas(e.clientX, e.clientY);
    const initialAngle = Math.atan2(coords.y - centerY, coords.x - centerX) * (180 / Math.PI);

    setRotateState({
      isRotating: true,
      itemId,
      centerX,
      centerY,
      initialAngle,
      currentRotation: item.rotation || 0,
    });
  };

  // Global mousemove for panning, dragging, resizing, rotating, and marquee selection
  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Panning
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setViewport(prev => ({
        ...prev,
        x: panStartRef.current.vx + dx,
        y: panStartRef.current.vy + dy,
      }));
      return;
    }

    // 2. Dragging items
    if (dragState.isDragging) {
      const dx = (e.clientX - dragState.startX) / viewport.zoom;
      const dy = (e.clientY - dragState.startY) / viewport.zoom;

      const patches: Record<string, Partial<BoardItem>> = {};
      dragState.itemIds.forEach(id => {
        const init = dragState.initialPositions[id];
        if (init) {
          let newX = init.x + dx;
          let newY = init.y + dy;

          if (board.snapToGrid) {
            const grid = board.gridSize || 20;
            newX = Math.round(newX / grid) * grid;
            newY = Math.round(newY / grid) * grid;
          }

          patches[id] = { x: newX, y: newY };
        }
      });
      onUpdateItems(patches, true);
      return;
    }

    // 3. Resizing item
    if (resizeState.isResizing) {
      const dx = (e.clientX - resizeState.startX) / viewport.zoom;
      const dy = (e.clientY - resizeState.startY) / viewport.zoom;
      const { initialX, initialY, initialWidth, initialHeight, handle, lockAspectRatio, aspectRatio = 1 } = resizeState;

      let newW = initialWidth;
      let newH = initialHeight;
      let newX = initialX;
      let newY = initialY;

      if (handle.includes('e')) newW = Math.max(40, initialWidth + dx);
      if (handle.includes('w')) {
        const potentialW = initialWidth - dx;
        if (potentialW >= 40) {
          newW = potentialW;
          newX = initialX + dx;
        }
      }
      if (handle.includes('s')) newH = Math.max(30, initialHeight + dy);
      if (handle.includes('n')) {
        const potentialH = initialHeight - dy;
        if (potentialH >= 30) {
          newH = potentialH;
          newY = initialY + dy;
        }
      }

      if (lockAspectRatio && (handle === 'se' || handle === 'nw' || handle === 'ne' || handle === 'sw')) {
        if (handle === 'se' || handle === 'nw') {
          newH = Math.round(newW / aspectRatio);
        }
      }

      onUpdateItem(resizeState.itemId, { x: newX, y: newY, width: newW, height: newH }, true);
      return;
    }

    // 4. Rotating item
    if (rotateState.isRotating) {
      const coords = screenToCanvas(e.clientX, e.clientY);
      const angle = Math.atan2(coords.y - rotateState.centerY, coords.x - rotateState.centerX) * (180 / Math.PI);
      let diff = angle - rotateState.initialAngle;
      let newRotation = (rotateState.currentRotation + diff + 360) % 360;

      // Snap to 15-degree increments if Shift is held
      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15;
      }

      onUpdateItem(rotateState.itemId, { rotation: Math.round(newRotation) }, true);
      return;
    }

    // 5. Marquee selection
    if (marquee) {
      const coords = screenToCanvas(e.clientX, e.clientY);
      setMarquee(prev => prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null);

      const minX = Math.min(marquee.startX, coords.x);
      const maxX = Math.max(marquee.startX, coords.x);
      const minY = Math.min(marquee.startY, coords.y);
      const maxY = Math.max(marquee.startY, coords.y);

      const enclosedIds = board.items
        .filter(it => {
          const itRight = it.x + it.width;
          const itBottom = it.y + it.height;
          return it.x < maxX && itRight > minX && it.y < maxY && itBottom > minY;
        })
        .map(it => it.id);

      enclosedIds.forEach(id => {
        if (!selectedItemIds.includes(id)) {
          onSelectItem(id, true);
        }
      });
    }
  };

  // Global mouseup to finish operations
  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (dragState.isDragging) {
      setDragState(prev => ({ ...prev, isDragging: false }));
    }
    if (resizeState.isResizing) {
      setResizeState(prev => ({ ...prev, isResizing: false }));
    }
    if (rotateState.isRotating) {
      setRotateState(prev => ({ ...prev, isRotating: false }));
    }
    if (marquee) setMarquee(null);
  };

  // Drag & drop file directly onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const coords = screenToCanvas(e.clientX, e.clientY);

    Array.from(files).forEach((file: File, idx) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const aspect = img.width / img.height;
          const targetW = 320;
          const targetH = Math.round(targetW / aspect);

          onAddItem({
            type: 'image',
            x: coords.x + idx * 30,
            y: coords.y + idx * 30,
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
  };

  // Zoom control helpers
  const handleZoomIn = () => {
    setViewport(prev => ({ ...prev, zoom: Math.min(3.0, prev.zoom + 0.15) }));
  };

  const handleZoomOut = () => {
    setViewport(prev => ({ ...prev, zoom: Math.max(0.25, prev.zoom - 0.15) }));
  };

  const handleResetZoom = () => {
    setViewport({ x: 40, y: 40, zoom: 1.0 });
  };

  const handleFitToScreen = () => {
    if (board.items.length === 0) {
      handleResetZoom();
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    board.items.forEach(it => {
      minX = Math.min(minX, it.x);
      minY = Math.min(minY, it.y);
      maxX = Math.max(maxX, it.x + it.width);
      maxY = Math.max(maxY, it.y + it.height);
    });

    if (containerRef.current) {
      const padding = 80;
      const boundsW = Math.max(200, maxX - minX + padding * 2);
      const boundsH = Math.max(200, maxY - minY + padding * 2);

      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;

      const scaleX = containerW / boundsW;
      const scaleY = containerH / boundsH;
      const zoom = Math.min(1.5, Math.max(0.3, Math.min(scaleX, scaleY)));

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      setViewport({
        zoom,
        x: containerW / 2 - centerX * zoom,
        y: containerH / 2 - centerY * zoom,
      });
    }
  };

  const getGridPatternClass = () => {
    switch (board.gridPattern) {
      case 'dots': return 'canvas-dots';
      case 'grid': return 'canvas-grid';
      case 'cross': return 'canvas-cross';
      case 'none':
      default: return '';
    }
  };

  const cursorClass = isPanning
    ? 'cursor-grabbing'
    : isSpacePressed || isPanToolActive
    ? 'cursor-grab'
    : 'cursor-default';

  return (
    <div
      id="moodboard-canvas-container"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ backgroundColor: board.backgroundColor || '#FBFBFA' }}
      className={`relative flex-1 h-full overflow-hidden select-none ${cursorClass} ${getGridPatternClass()}`}
    >
      {/* Visual Canvas Viewport Surface */}
      <div
        ref={canvasRef}
        id="moodboard-canvas-surface"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          width: '5000px',
          height: '5000px',
        }}
        className="absolute top-0 left-0 pointer-events-auto moodboard-canvas-viewport"
      >
        {/* Render items */}
        {board.items.map(item => (
          <CanvasItem
            key={item.id}
            item={item}
            isSelected={selectedItemIds.includes(item.id)}
            onSelect={(e, id) => onSelectItem(id, e.shiftKey)}
            onStartDrag={handleStartDrag}
            onStartResize={handleStartResize}
            onStartRotate={handleStartRotate}
            onUpdate={onUpdateItem}
            onDuplicate={onDuplicateItem}
            onDelete={onDeleteItem}
            onBringForward={onBringForward}
            onSendBackward={onSendBackward}
            zoom={viewport.zoom}
          />
        ))}

        {/* Marquee Selection Rectangle */}
        {marquee && (
          <div
            style={{
              left: `${Math.min(marquee.startX, marquee.currentX)}px`,
              top: `${Math.min(marquee.startY, marquee.currentY)}px`,
              width: `${Math.abs(marquee.currentX - marquee.startX)}px`,
              height: `${Math.abs(marquee.currentY - marquee.startY)}px`,
            }}
            className="absolute border border-[#181816] bg-[#181816]/5 pointer-events-none rounded-2xs"
          />
        )}
      </div>

      {/* Floating Canvas Controls Overlay (Bottom Center) */}
      {!isPreviewMode && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#FCFCFA]/90 backdrop-blur-md border border-[#E2DFD8] rounded-xl shadow-lg px-3 py-1.5 flex items-center space-x-2 z-30 select-none canvas-controls-overlay no-print">
          {/* Pan tool toggle */}
          <button
            onClick={() => setIsPanToolActive(!isPanToolActive)}
            className={`p-1.5 rounded-lg transition-colors ${
              isPanToolActive
                ? 'bg-[#181816] text-white shadow-2xs'
                : 'text-[#615D54] hover:text-[#181816] hover:bg-[#F2EFE9]'
            }`}
            title="Pan Hand Tool (or hold Spacebar)"
          >
            <Hand className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPanToolActive(false)}
            className={`p-1.5 rounded-lg transition-colors ${
              !isPanToolActive
                ? 'bg-[#181816] text-white shadow-2xs'
                : 'text-[#615D54] hover:text-[#181816] hover:bg-[#F2EFE9]'
            }`}
            title="Select Tool"
          >
            <MousePointer className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#E2DFD8]" />

          {/* Zoom In/Out */}
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-[#615D54] hover:text-[#181816] hover:bg-[#F2EFE9] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2 py-0.5 text-xs font-mono font-medium text-[#181816] hover:bg-[#F2EFE9] rounded transition-colors"
            title="Click to reset 100%"
          >
            {Math.round(viewport.zoom * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-[#615D54] hover:text-[#181816] hover:bg-[#F2EFE9] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleFitToScreen}
            className="p-1.5 rounded-lg text-[#615D54] hover:text-[#181816] hover:bg-[#F2EFE9] transition-colors"
            title="Fit All Items to Screen"
          >
            <Maximize className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#E2DFD8]" />

          {/* Grid Style Switcher */}
          <button
            onClick={() => {
              const patterns: Array<Moodboard['gridPattern']> = ['dots', 'grid', 'cross', 'none'];
              const nextIdx = (patterns.indexOf(board.gridPattern) + 1) % patterns.length;
              onUpdateBoard({ gridPattern: patterns[nextIdx] });
            }}
            className="p-1.5 rounded-lg text-[#615D54] hover:text-[#181816] hover:bg-[#F2EFE9] transition-colors"
            title={`Toggle Grid Style: ${board.gridPattern}`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Snap toggle */}
          <button
            onClick={() => onUpdateBoard({ snapToGrid: !board.snapToGrid })}
            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
              board.snapToGrid
                ? 'bg-[#181816] text-[#FAF8F5]'
                : 'text-[#736F66] hover:text-[#181816] hover:bg-[#F2EFE9]'
            }`}
            title="Snap to 20px Grid"
          >
            Snap {board.snapToGrid ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* Floating Presentation exit pill */}
      {isPreviewMode && (
        <div className="absolute top-4 right-4 bg-[#181816]/90 backdrop-blur-md text-[#FAF8F5] px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center space-x-2 shadow-lg z-50 select-none animate-in fade-in duration-200">
          <span>Presentation View</span>
          <span className="text-[10px] text-[#A8A49C] bg-white/15 px-1.5 py-0.5 rounded">ESC to exit</span>
        </div>
      )}
    </div>
  );
};
