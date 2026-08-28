import { useState, useEffect, useCallback, useRef } from 'react';
import { Moodboard, BoardItem } from '../types';
import { STARTER_BOARDS } from '../data/starterBoards';

const STORAGE_KEY = 'moodboard_studio_boards_v1';
const ACTIVE_BOARD_KEY = 'moodboard_studio_active_id_v1';

export function useMoodboardStorage() {
  // Load initial boards from localStorage or fall back to STARTER_BOARDS
  const [boards, setBoards] = useState<Moodboard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge any missing starter board templates (e.g. brutalism)
          const existingIds = new Set(parsed.map((b: Moodboard) => b.id));
          const missingStarters = STARTER_BOARDS.filter(sb => !existingIds.has(sb.id));
          return [...parsed, ...missingStarters];
        }
      }
    } catch (e) {
      console.warn('Failed to load boards from localStorage:', e);
    }
    return STARTER_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_BOARD_KEY);
      if (savedId && boards.some(b => b.id === savedId)) {
        return savedId;
      }
    } catch (e) {
      // ignore
    }
    return boards[0]?.id || STARTER_BOARDS[0].id;
  });

  // Undo/Redo history stacks for active board items
  const [history, setHistory] = useState<BoardItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isInternalHistoryChange = useRef(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    } catch (e) {
      console.warn('Failed to save boards to localStorage:', e);
    }
  }, [boards]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_BOARD_KEY, activeBoardId);
    } catch (e) {
      // ignore
    }
  }, [activeBoardId]);

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0] || STARTER_BOARDS[0];

  // Initialize history when active board changes
  useEffect(() => {
    if (activeBoard) {
      setHistory([activeBoard.items]);
      setHistoryIndex(0);
    }
  }, [activeBoardId]);

  // Push new state to history
  const pushHistory = useCallback((items: BoardItem[]) => {
    if (isInternalHistoryChange.current) {
      isInternalHistoryChange.current = false;
      return;
    }
    setHistory(prev => {
      const current = prev.slice(0, historyIndex + 1);
      const next = [...current, items];
      // Limit history to 30 steps
      if (next.length > 30) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 29));
  }, [historyIndex]);

  // Update active board items with history tracking
  const updateActiveBoardItems = useCallback((
    updater: (currentItems: BoardItem[]) => BoardItem[],
    skipHistory = false
  ) => {
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        if (board.id === activeBoardId) {
          const nextItems = updater(board.items);
          if (!skipHistory) {
            pushHistory(nextItems);
          }
          return {
            ...board,
            items: nextItems,
            updatedAt: Date.now(),
          };
        }
        return board;
      });
    });
  }, [activeBoardId, pushHistory]);

  // Undo action
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetItems = history[targetIndex];
      if (targetItems) {
        isInternalHistoryChange.current = true;
        setHistoryIndex(targetIndex);
        setBoards(prev => prev.map(b => b.id === activeBoardId ? { ...b, items: targetItems, updatedAt: Date.now() } : b));
      }
    }
  }, [historyIndex, history, activeBoardId]);

  // Redo action
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetItems = history[targetIndex];
      if (targetItems) {
        isInternalHistoryChange.current = true;
        setHistoryIndex(targetIndex);
        setBoards(prev => prev.map(b => b.id === activeBoardId ? { ...b, items: targetItems, updatedAt: Date.now() } : b));
      }
    }
  }, [historyIndex, history, activeBoardId]);

  // Create a new board
  const createBoard = useCallback((title = 'Untitled Concept', templateId?: string): Moodboard => {
    let baseItems: BoardItem[] = [];
    let bg = '#FBFBFA';
    let pattern: Moodboard['gridPattern'] = 'dots';

    if (templateId) {
      const template = STARTER_BOARDS.find(t => t.id === templateId);
      if (template) {
        baseItems = JSON.parse(JSON.stringify(template.items));
        bg = template.backgroundColor;
        pattern = template.gridPattern;
      }
    }

    const newBoard: Moodboard = {
      id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      layoutMode: 'freeform',
      backgroundColor: bg,
      gridPattern: pattern,
      snapToGrid: false,
      gridSize: 20,
      items: baseItems,
      tags: ['Creative'],
    };

    setBoards(prev => [newBoard, ...prev]);
    setActiveBoardId(newBoard.id);
    return newBoard;
  }, []);

  // Update board properties (title, bg, layoutMode, etc.)
  const updateBoard = useCallback((patch: Partial<Moodboard>) => {
    setBoards(prev => prev.map(b => b.id === activeBoardId ? { ...b, ...patch, updatedAt: Date.now() } : b));
  }, [activeBoardId]);

  // Rename board
  const renameBoard = useCallback((id: string, newTitle: string) => {
    setBoards(prev => prev.map(b => b.id === id ? { ...b, title: newTitle.trim() || 'Untitled Board', updatedAt: Date.now() } : b));
  }, []);

  // Duplicate board
  const duplicateBoard = useCallback((id: string): Moodboard | null => {
    const source = boards.find(b => b.id === id);
    if (!source) return null;

    const clonedItems: BoardItem[] = source.items.map(item => ({
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      x: item.x + 30,
      y: item.y + 30,
    }));

    const duplicated: Moodboard = {
      ...source,
      id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${source.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: clonedItems,
    };

    setBoards(prev => [duplicated, ...prev]);
    setActiveBoardId(duplicated.id);
    return duplicated;
  }, [boards]);

  // Delete board
  const deleteBoard = useCallback((id: string) => {
    setBoards(prev => {
      const remaining = prev.filter(b => b.id !== id);
      if (remaining.length === 0) {
        // Always keep at least one board
        const fresh = {
          ...STARTER_BOARDS[0],
          id: `board-${Date.now()}`,
          title: 'New Blank Board',
          items: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setActiveBoardId(fresh.id);
        return [fresh];
      }
      if (activeBoardId === id) {
        setActiveBoardId(remaining[0].id);
      }
      return remaining;
    });
  }, [activeBoardId]);

  // Add Item to current board
  const addItem = useCallback((itemData: Omit<BoardItem, 'id' | 'zIndex'>): BoardItem => {
    const nextZ = activeBoard.items.reduce((max, it) => Math.max(max, it.zIndex || 0), 0) + 1;
    const newItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      zIndex: nextZ,
    } as BoardItem;

    updateActiveBoardItems(items => [...items, newItem]);
    return newItem;
  }, [activeBoard.items, updateActiveBoardItems]);

  // Update a single item
  const updateItem = useCallback((itemId: string, patch: Partial<BoardItem>, skipHistory = false) => {
    updateActiveBoardItems(items => items.map(it => it.id === itemId ? ({ ...it, ...patch } as BoardItem) : it), skipHistory);
  }, [updateActiveBoardItems]);

  // Batch update items (useful during multi-drag or bulk alignment)
  const updateItems = useCallback((patches: Record<string, Partial<BoardItem>>, skipHistory = false) => {
    updateActiveBoardItems(items => items.map(it => {
      if (patches[it.id]) {
        return { ...it, ...patches[it.id] } as BoardItem;
      }
      return it;
    }), skipHistory);
  }, [updateActiveBoardItems]);

  // Delete single item
  const deleteItem = useCallback((itemId: string) => {
    updateActiveBoardItems(items => items.filter(it => it.id !== itemId));
  }, [updateActiveBoardItems]);

  // Delete multiple items
  const deleteItems = useCallback((itemIds: string[]) => {
    const set = new Set(itemIds);
    updateActiveBoardItems(items => items.filter(it => !set.has(it.id)));
  }, [updateActiveBoardItems]);

  // Duplicate item
  const duplicateItem = useCallback((itemId: string) => {
    const source = activeBoard.items.find(it => it.id === itemId);
    if (!source) return;
    const maxZ = activeBoard.items.reduce((max, it) => Math.max(max, it.zIndex || 0), 0) + 1;
    const clone: BoardItem = {
      ...source,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      x: source.x + 30,
      y: source.y + 30,
      zIndex: maxZ,
    };
    updateActiveBoardItems(items => [...items, clone]);
  }, [activeBoard.items, updateActiveBoardItems]);

  // Layer ordering
  const bringForward = useCallback((itemId: string) => {
    updateActiveBoardItems(items => {
      const idx = items.findIndex(it => it.id === itemId);
      if (idx === -1) return items;
      const curItem = items[idx];
      return items.map(it => it.id === itemId ? { ...it, zIndex: (curItem.zIndex || 1) + 1 } : it);
    });
  }, [updateActiveBoardItems]);

  const sendBackward = useCallback((itemId: string) => {
    updateActiveBoardItems(items => {
      const idx = items.findIndex(it => it.id === itemId);
      if (idx === -1) return items;
      const curItem = items[idx];
      const newZ = Math.max(1, (curItem.zIndex || 1) - 1);
      return items.map(it => it.id === itemId ? { ...it, zIndex: newZ } : it);
    });
  }, [updateActiveBoardItems]);

  const bringToFront = useCallback((itemId: string) => {
    updateActiveBoardItems(items => {
      const maxZ = items.reduce((max, it) => Math.max(max, it.zIndex || 0), 0) + 1;
      return items.map(it => it.id === itemId ? { ...it, zIndex: maxZ } : it);
    });
  }, [updateActiveBoardItems]);

  const sendToBack = useCallback((itemId: string) => {
    updateActiveBoardItems(items => {
      return items.map(it => it.id === itemId ? { ...it, zIndex: 1 } : { ...it, zIndex: (it.zIndex || 1) + 1 });
    });
  }, [updateActiveBoardItems]);

  // Auto Organize items in an Editorial Masonry Grid
  const organizeAsGrid = useCallback((columns = 3, gap = 30) => {
    updateActiveBoardItems(items => {
      if (items.length === 0) return items;
      const startX = 60;
      const startY = 80;
      const colWidth = 340;
      const colHeights = new Array(columns).fill(startY);

      const sorted = [...items].sort((a, b) => (a.y || 0) - (b.y || 0));

      return sorted.map(item => {
        // Find shortest column
        let shortestCol = 0;
        for (let c = 1; c < columns; c++) {
          if (colHeights[c] < colHeights[shortestCol]) {
            shortestCol = c;
          }
        }

        const newX = startX + shortestCol * (colWidth + gap);
        const newY = colHeights[shortestCol];
        const itemH = item.height || 260;

        colHeights[shortestCol] += itemH + gap;

        return {
          ...item,
          x: newX,
          y: newY,
          rotation: 0,
        };
      });
    });
  }, [updateActiveBoardItems]);

  // Import board
  const importBoard = useCallback((newBoard: Moodboard) => {
    setBoards(prev => [newBoard, ...prev]);
    setActiveBoardId(newBoard.id);
  }, []);

  return {
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
    bringToFront,
    sendToBack,
    organizeAsGrid,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    importBoard,
  };
}
