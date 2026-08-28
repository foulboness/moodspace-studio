import { toPng, toJpeg } from 'html-to-image';
import { Moodboard, ImageItem } from '../types';

/**
 * Converts any image source (URL, Blob, Unsplash, external) to a Base64 data URL.
 * Uses direct fetch -> Canvas draw -> proxy fallbacks to ensure 100% reliability.
 */
async function getBase64FromImageUrl(url: string, liveImgEl?: HTMLImageElement | null): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  // 1. If live DOM already rendered the image, extract directly from natural pixels
  if (liveImgEl && liveImgEl.complete && liveImgEl.naturalWidth > 0) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = liveImgEl.naturalWidth;
      canvas.height = liveImgEl.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(liveImgEl, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        if (dataUrl && dataUrl.startsWith('data:image')) {
          return dataUrl;
        }
      }
    } catch {
      // Tainted canvas, fall through to fetch
    }
  }

  // 2. Fetch with CORS
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Fetch failed, try proxy fallback
  }

  // 3. Fallback to image proxy for external hosts with strict headers
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '');
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&output=png`;
    const res = await fetch(proxyUrl, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Return original url if all fallbacks fail
  }

  return url;
}

export async function exportBoardAsImage(
  board: Moodboard,
  format: 'png' | 'jpeg' = 'png',
  scale = 2
): Promise<void> {
  if (!board.items || board.items.length === 0) {
    alert('Please add items to your moodboard before exporting.');
    return;
  }

  // 1. Calculate the exact bounding box of all items
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  board.items.forEach(item => {
    minX = Math.min(minX, item.x);
    minY = Math.min(minY, item.y);
    maxX = Math.max(maxX, item.x + item.width);
    maxY = Math.max(maxY, item.y + item.height);
  });

  // Generous editorial padding so the layout has breathing room
  const padding = 50;
  const contentWidth = Math.max(300, Math.round(maxX - minX + padding * 2));
  const contentHeight = Math.max(200, Math.round(maxY - minY + padding * 2));

  // 2. Pre-convert all image assets to base64 Data URLs before cloning
  const canvasSurface = document.getElementById('moodboard-canvas-surface');
  const imageItemDataUrlMap = new Map<string, string>();

  await Promise.all(
    board.items.map(async item => {
      if (item.type === 'image') {
        const imgItem = item as ImageItem;
        const liveItemEl = canvasSurface?.querySelector(`#canvas-item-${item.id}`);
        const liveImg = liveItemEl?.querySelector('img') as HTMLImageElement | null;
        const dataUrl = await getBase64FromImageUrl(imgItem.src, liveImg);
        imageItemDataUrlMap.set(item.id, dataUrl);
      }
    })
  );

  // 3. Create export container positioned safely in the background
  const exportContainer = document.createElement('div');
  exportContainer.id = 'moodboard-export-container';
  exportContainer.style.position = 'fixed';
  exportContainer.style.left = '0px';
  exportContainer.style.top = '0px';
  exportContainer.style.width = `${contentWidth}px`;
  exportContainer.style.height = `${contentHeight}px`;
  exportContainer.style.backgroundColor = board.backgroundColor || '#FBFBFA';
  exportContainer.style.overflow = 'hidden';
  exportContainer.style.zIndex = '-99999';
  exportContainer.style.pointerEvents = 'none';

  // Apply board grid pattern if active
  if (board.gridPattern === 'dots') {
    exportContainer.classList.add('canvas-dots');
  } else if (board.gridPattern === 'grid') {
    exportContainer.classList.add('canvas-grid');
  } else if (board.gridPattern === 'cross') {
    exportContainer.classList.add('canvas-cross');
  }

  // 4. Clone each item into the export container
  board.items.forEach(item => {
    const liveEl = canvasSurface?.querySelector(`#canvas-item-${item.id}`);
    if (liveEl) {
      const clonedEl = liveEl.cloneNode(true) as HTMLElement;

      // Clean up selection outline rings & hover rings
      clonedEl.classList.remove(
        'ring-2',
        'ring-[#181816]',
        'ring-offset-2',
        'ring-offset-transparent',
        'hover:ring-1',
        'hover:ring-[#A8A49C]/50'
      );

      // Strip all selection handles, resize handles, floating toolbars
      const handles = clonedEl.querySelectorAll(
        '.selection-handle, .no-print, .no-export'
      );
      handles.forEach(h => h.remove());

      // If it's an image, replace src with converted base64 data url
      if (item.type === 'image') {
        const clonedImg = clonedEl.querySelector('img') as HTMLImageElement | null;
        const convertedSrc = imageItemDataUrlMap.get(item.id);
        if (clonedImg && convertedSrc) {
          clonedImg.src = convertedSrc;
          clonedImg.removeAttribute('crossorigin');
        }
      }

      // Reposition item relative to the tight bounding box
      const relX = item.x - minX + padding;
      const relY = item.y - minY + padding;
      clonedEl.style.transform = `translate(${relX}px, ${relY}px) rotate(${item.rotation || 0}deg)`;
      clonedEl.style.width = `${item.width}px`;
      clonedEl.style.height = `${item.height}px`;
      clonedEl.style.position = 'absolute';
      clonedEl.style.top = '0px';
      clonedEl.style.left = '0px';
      clonedEl.style.zIndex = `${item.zIndex || 1}`;

      exportContainer.appendChild(clonedEl);
    }
  });

  document.body.appendChild(exportContainer);

  try {
    // Wait for fonts to be ready
    if (document.fonts) {
      await document.fonts.ready;
    }

    // Wait for all images inside the export container to be decoded
    const allImages = Array.from(exportContainer.querySelectorAll('img'));
    await Promise.all(
      allImages.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // Brief timeout to ensure layout styles and filters have settled
    await new Promise(resolve => setTimeout(resolve, 100));

    const options = {
      quality: 0.98,
      pixelRatio: scale,
      cacheBust: false,
      skipFonts: true,
      width: contentWidth,
      height: contentHeight,
      backgroundColor: board.backgroundColor || '#FBFBFA',
      filter: (node: HTMLElement) => {
        if (
          node.classList &&
          (node.classList.contains('selection-handle') ||
            node.classList.contains('canvas-controls-overlay') ||
            node.classList.contains('no-export'))
        ) {
          return false;
        }
        return true;
      },
    };

    let dataUrl = '';
    if (format === 'png') {
      dataUrl = await toPng(exportContainer, options);
    } else {
      dataUrl = await toJpeg(exportContainer, options);
    }

    const link = document.createElement('a');
    const cleanTitle = board.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    link.download = `${cleanTitle || 'moodboard'}-${Date.now()}.${format}`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export moodboard image:', error);
    throw error;
  } finally {
    exportContainer.remove();
  }
}

export function printMoodboard(): void {
  window.print();
}

export function exportBoardAsJson(board: Moodboard): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(board, null, 2));
  const downloadAnchor = document.createElement('a');
  const cleanTitle = board.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${cleanTitle || 'moodboard'}-backup.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importBoardFromJson(file: File): Promise<Moodboard> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.id || !parsed.title || !Array.isArray(parsed.items)) {
          throw new Error('Invalid Moodboard JSON format');
        }
        parsed.id = `board-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        parsed.title = `${parsed.title} (Imported)`;
        parsed.updatedAt = Date.now();
        resolve(parsed as Moodboard);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
