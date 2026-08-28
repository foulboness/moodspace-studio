export type ItemType = 'image' | 'text' | 'color' | 'palette' | 'note' | 'link' | 'shape';

export type CanvasLayoutMode = 'freeform' | 'grid';
export type GridPattern = 'dots' | 'grid' | 'cross' | 'none';

export interface BaseItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // degrees (0-360)
  zIndex: number;
  opacity?: number; // 0-1
  borderRadius?: number; // px
  borderWidth?: number; // px
  borderColor?: string;
  shadow?: 'none' | 'subtle' | 'medium' | 'editorial' | 'lifted';
  locked?: boolean;
}

export interface ImageItem extends BaseItem {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
  showCaption?: boolean;
  aspectRatio?: number;
  objectFit?: 'cover' | 'contain';
  filter?: 'none' | 'grayscale' | 'sepia' | 'warmth' | 'cool' | 'grain' | 'high-contrast';
  originalFileName?: string;
}

export interface TextItem extends BaseItem {
  type: 'text';
  content: string;
  fontFamily: 'serif' | 'sans' | 'mono' | 'editorial' | 'cinzel';
  fontSize: number; // in px
  fontWeight: '300' | '400' | '500' | '600' | '700';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  lineHeight?: number;
  letterSpacing?: number; // in em
  italic?: boolean;
  uppercase?: boolean;
  backgroundColor?: string; // optional background card
  padding?: number;
}

export interface ColorItem extends BaseItem {
  type: 'color';
  hex: string;
  name: string;
  colorModel?: 'hex' | 'pantone' | 'rgb' | 'cmyk';
  subtitle?: string;
  format: 'pantone-card' | 'circle' | 'pill' | 'minimal-swatch' | 'paint-dab';
  textColor?: string;
}

export interface PaletteItem extends BaseItem {
  type: 'palette';
  name: string;
  colors: Array<{
    hex: string;
    name?: string;
    locked?: boolean;
  }>;
  layout: 'horizontal-strip' | 'cards-stack' | 'vertical-strip' | 'grid';
  showHexLabels?: boolean;
}

export interface NoteItem extends BaseItem {
  type: 'note';
  text: string;
  noteColor: 'cream' | 'linen' | 'sand' | 'sage' | 'terracotta' | 'charcoal' | 'mist';
  pinStyle: 'tape-top' | 'tape-corners' | 'minimal-pin' | 'paperclip' | 'none';
  fontStyle: 'handwriting' | 'sans' | 'mono' | 'serif';
  author?: string;
  date?: string;
}

export interface LinkItem extends BaseItem {
  type: 'link';
  url: string;
  title: string;
  description?: string;
  domain?: string;
  favicon?: string;
  previewImage?: string;
  theme?: 'minimal-card' | 'editorial-pill' | 'dark-badge';
}

export interface ShapeItem extends BaseItem {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line' | 'divider' | 'frame' | 'tag-pill';
  fillColor?: string;
  strokeColor?: string;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  label?: string;
}

export type BoardItem = ImageItem | TextItem | ColorItem | PaletteItem | NoteItem | LinkItem | ShapeItem;

export interface Moodboard {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  layoutMode: CanvasLayoutMode;
  gridColumns?: number;
  gridGap?: number;
  backgroundColor: string; // e.g. '#FBFBFA', '#F3F2EE', '#1A1A1A', '#ECEAE4'
  gridPattern: GridPattern;
  snapToGrid: boolean;
  gridSize: number; // e.g. 16px or 24px
  items: BoardItem[];
  tags?: string[];
  thumbnail?: string;
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number; // 0.25 to 3.0
}

export interface DragState {
  isDragging: boolean;
  itemId: string | null;
  itemIds: string[];
  startX: number;
  startY: number;
  initialPositions: Record<string, { x: number; y: number }>;
}

export interface ResizeState {
  isResizing: boolean;
  itemId: string;
  handle: 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w';
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  aspectRatio?: number;
  lockAspectRatio?: boolean;
}

export interface RotateState {
  isRotating: boolean;
  itemId: string;
  centerX: number;
  centerY: number;
  initialAngle: number;
  currentRotation: number;
}
