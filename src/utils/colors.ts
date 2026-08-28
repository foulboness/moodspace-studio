// Color utilities for Moodboard Studio

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(char => char + char).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return '#' + [clamp(r), clamp(g), clamp(b)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h = (h % 360) / 360;
  s = s / 100;
  l = l / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

export function hexToHsl(hex: string): HSL {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// Generate creative harmonious palettes
export type HarmonyMode = 'analogous' | 'monochromatic' | 'triadic' | 'complementary' | 'editorial-warm' | 'earth-tones' | 'mineral-slate' | 'nordic-minimal';

export function generateHarmony(baseHex: string, mode: HarmonyMode, count = 5): Array<{ hex: string; name: string }> {
  const { h, s, l } = hexToHsl(baseHex);
  const result: Array<{ hex: string; name: string }> = [];

  switch (mode) {
    case 'editorial-warm': {
      const shades = [
        { h: 36, s: 22, l: 94, name: 'Warm Alabaster' },
        { h: 32, s: 25, l: 82, name: 'Sand Dune' },
        { h: 28, s: 30, l: 65, name: 'Raw Ochre' },
        { h: 22, s: 35, l: 38, name: 'Roasted Sienna' },
        { h: 20, s: 20, l: 15, name: 'Deep Espresso' },
      ];
      return shades.map(col => ({ hex: hslToHex(col.h, col.s, col.l), name: col.name }));
    }
    case 'earth-tones': {
      const shades = [
        { h: 42, s: 30, l: 88, name: 'Oatmeal' },
        { h: 68, s: 20, l: 64, name: 'Dried Sage' },
        { h: 90, s: 18, l: 45, name: 'Olive Grove' },
        { h: 30, s: 38, l: 52, name: 'Terracotta' },
        { h: 24, s: 22, l: 24, name: 'Clay Loam' },
      ];
      return shades.map(col => ({ hex: hslToHex(col.h, col.s, col.l), name: col.name }));
    }
    case 'mineral-slate': {
      const shades = [
        { h: 200, s: 15, l: 92, name: 'Mist White' },
        { h: 205, s: 18, l: 74, name: 'Nordic Sky' },
        { h: 215, s: 15, l: 55, name: 'Glacier Blue' },
        { h: 220, s: 18, l: 36, name: 'Slate Granite' },
        { h: 225, s: 20, l: 18, name: 'Midnight Basalt' },
      ];
      return shades.map(col => ({ hex: hslToHex(col.h, col.s, col.l), name: col.name }));
    }
    case 'nordic-minimal': {
      const shades = [
        { h: 40, s: 15, l: 96, name: 'Cotton Linen' },
        { h: 38, s: 12, l: 86, name: 'Birch Plywood' },
        { h: 35, s: 8, l: 68, name: 'Limestone' },
        { h: 0, s: 0, l: 42, name: 'Brutalist Concrete' },
        { h: 0, s: 0, l: 12, name: 'Carbon Black' },
      ];
      return shades.map(col => ({ hex: hslToHex(col.h, col.s, col.l), name: col.name }));
    }
    case 'monochromatic': {
      const lightSteps = [92, 78, 60, 42, 22];
      return lightSteps.map((lum, idx) => {
        const hex = hslToHex(h, Math.max(10, s - idx * 2), lum);
        return { hex, name: getDescriptiveColorName(hex) };
      });
    }
    case 'analogous': {
      const step = 25;
      const hues = [h - step * 2, h - step, h, h + step, h + step * 2];
      return hues.map(hue => {
        const normH = (hue + 360) % 360;
        const hex = hslToHex(normH, s, l);
        return { hex, name: getDescriptiveColorName(hex) };
      });
    }
    case 'complementary': {
      const compH = (h + 180) % 360;
      const hues = [
        { h, s: Math.max(10, s - 10), l: 88 },
        { h, s, l },
        { h, s: Math.min(100, s + 10), l: 30 },
        { h: compH, s, l },
        { h: compH, s: Math.max(15, s - 15), l: 85 },
      ];
      return hues.map(c => {
        const hex = hslToHex(c.h, c.s, c.l);
        return { hex, name: getDescriptiveColorName(hex) };
      });
    }
    case 'triadic': {
      const tri1 = (h + 120) % 360;
      const tri2 = (h + 240) % 360;
      const colors = [
        { h, s, l: 85 },
        { h, s, l },
        { h: tri1, s, l },
        { h: tri2, s, l },
        { h: tri2, s: Math.max(10, s - 15), l: 25 },
      ];
      return colors.map(c => {
        const hex = hslToHex(c.h, c.s, c.l);
        return { hex, name: getDescriptiveColorName(hex) };
      });
    }
    default: {
      return [
        { hex: '#F4F1EA', name: 'Alabaster' },
        { hex: '#DED6C9', name: 'Oatmeal' },
        { hex: '#A89F91', name: 'Pumice' },
        { hex: '#635B52', name: 'Raw Umber' },
        { hex: '#1C1B18', name: 'Charcoal' },
      ];
    }
  }
}

// Generate a random cohesive aesthetic color
export function getRandomAestheticColor(): string {
  const aestheticPalettes = [
    '#EAE5DC', '#DFD7CA', '#C8BCAC', '#8D8171', '#3D3831',
    '#E7EBE8', '#C5D1C9', '#8FA498', '#4F6156', '#222B26',
    '#F2EBE5', '#DECBC1', '#B89786', '#6E4E3D', '#2E1E16',
    '#EBEBF0', '#CBD0DC', '#909DB5', '#4A556B', '#1B212D',
    '#F5EFE6', '#E4D5C3', '#C0A080', '#735738', '#261C12'
  ];
  return aestheticPalettes[Math.floor(Math.random() * aestheticPalettes.length)];
}

// Extract dominant color palette from an image element or URL
export async function extractPaletteFromImage(imgSrc: string, colorCount = 5): Promise<Array<{ hex: string; name: string }>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(generateHarmony('#E0D8CC', 'editorial-warm', colorCount));
          return;
        }

        // Downsample for speed and smooth average color extraction
        const width = 100;
        const height = 100;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height).data;
        const colorBuckets: Record<string, { r: number; g: number; b: number; count: number }> = {};

        // Sample pixels with slight quantization
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // skip transparent

          // Quantize to bucket (step 32)
          const qr = Math.floor(r / 32) * 32;
          const qg = Math.floor(g / 32) * 32;
          const qb = Math.floor(b / 32) * 32;
          const key = `${qr}-${qg}-${qb}`;

          if (!colorBuckets[key]) {
            colorBuckets[key] = { r, g, b, count: 0 };
          }
          colorBuckets[key].count++;
        }

        // Sort buckets by frequency
        const sorted = Object.values(colorBuckets)
          .sort((a, b) => b.count - a.count)
          .slice(0, colorCount * 2);

        // Filter and deduplicate distinct colors
        const extracted: Array<{ hex: string; name: string }> = [];
        for (const item of sorted) {
          const hex = rgbToHex(item.r, item.g, item.b);
          // Check if not too close to existing
          const isTooClose = extracted.some(existing => {
            const rgb1 = hexToRgb(existing.hex);
            const rgb2 = hexToRgb(hex);
            const dist = Math.sqrt(
              Math.pow(rgb1.r - rgb2.r, 2) +
              Math.pow(rgb1.g - rgb2.g, 2) +
              Math.pow(rgb1.b - rgb2.b, 2)
            );
            return dist < 45;
          });

          if (!isTooClose) {
            extracted.push({
              hex,
              name: getDescriptiveColorName(hex),
            });
          }
          if (extracted.length >= colorCount) break;
        }

        if (extracted.length < colorCount) {
          const fillHarmony = generateHarmony(extracted[0]?.hex || '#D9D2C5', 'editorial-warm', colorCount);
          resolve(fillHarmony);
        } else {
          resolve(extracted);
        }
      } catch (err) {
        console.warn('Could not extract image colors due to CORS/canvas error:', err);
        resolve(generateHarmony('#D9D2C5', 'editorial-warm', colorCount));
      }
    };

    img.onerror = () => {
      resolve(generateHarmony('#D9D2C5', 'editorial-warm', colorCount));
    };

    img.src = imgSrc;
  });
}

// Sophisticated aesthetic color name dictionary lookup / generator
export function getDescriptiveColorName(hex: string): string {
  const { h, s, l } = hexToHsl(hex);

  if (l > 94) return 'Off White';
  if (l < 10) return 'Noir';
  if (s < 12) {
    if (l > 80) return 'Limestone';
    if (l > 60) return 'Mineral Gray';
    if (l > 40) return 'Concrete';
    if (l > 25) return 'Basalt';
    return 'Charcoal';
  }

  // Hue based naming
  if (h >= 0 && h < 20) {
    if (l > 75) return 'Blush Powder';
    if (l > 50) return 'Terracotta';
    if (l > 30) return 'Rust Sienna';
    return 'Espresso';
  }
  if (h >= 20 && h < 45) {
    if (l > 85) return 'Warm Linen';
    if (l > 70) return 'Oatmeal';
    if (l > 50) return 'Camel Sand';
    if (l > 30) return 'Raw Umber';
    return 'Dark Walnut';
  }
  if (h >= 45 && h < 70) {
    if (l > 80) return 'Soft Butter';
    if (l > 55) return 'Golden Ochre';
    if (l > 35) return 'Dijon';
    return 'Olive Drab';
  }
  if (h >= 70 && h < 160) {
    if (l > 80) return 'Celadon Mist';
    if (l > 55) return 'Sage Herb';
    if (l > 35) return 'Forest Moss';
    return 'Deep Pine';
  }
  if (h >= 160 && h < 260) {
    if (l > 80) return 'Glacier Frost';
    if (l > 55) return 'Nordic Slate';
    if (l > 35) return 'Aegean Teal';
    return 'Midnight Ink';
  }
  if (h >= 260 && h < 320) {
    if (l > 80) return 'Lavender Ash';
    if (l > 55) return 'Dusky Mauve';
    if (l > 35) return 'Plum Velvet';
    return 'Blackberry';
  }
  // 320 - 360
  if (l > 80) return 'Rose Clay';
  if (l > 55) return 'Dusty Rose';
  return 'Crimson Noir';
}

// Contrast ratio check for readability
export function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    const a = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getOptimalTextColor(bgColorHex: string): '#141413' | '#FFFFFF' {
  const { l } = hexToHsl(bgColorHex);
  return l > 58 ? '#141413' : '#FFFFFF';
}
