export interface CuratedImageCategory {
  id: string;
  name: string;
  images: Array<{
    title: string;
    url: string;
    caption: string;
    tags: string[];
  }>;
}

export const CURATED_IMAGE_CATEGORIES: CuratedImageCategory[] = [
  {
    id: 'brutalism',
    name: 'Brutalism & Monolithic Form',
    images: [
      {
        title: 'Barbican Ribbed Concrete',
        url: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1000&q=80',
        caption: 'Barbican Complex • Ribbed Board-Marked Concrete',
        tags: ['Brutalism', 'Barbican', 'Concrete', 'Monochrome'],
      },
      {
        title: 'Cast Stone Cantilever',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
        caption: 'Cantilevered Flight • Angular Geometry',
        tags: ['Stairs', 'Raw', 'Concrete', 'Angles'],
      },
      {
        title: 'Monolithic Arch Geometry',
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Monolithic Beam & Structural Rhythm',
        tags: ['Arch', 'Monumental', 'Chiaroscuro'],
      },
      {
        title: 'Modular Facade Grid',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
        caption: 'Precast Concrete & Modular Grid',
        tags: ['Grid', 'Facade', 'Precast'],
      },
      {
        title: 'Raw Concrete Cantilever',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Heavy Cantilever & Linear Shadow',
        tags: ['Modern', 'Concrete', 'Shadow'],
      },
    ],
  },
  {
    id: 'architecture',
    name: 'Architecture & Spaces',
    images: [
      {
        title: 'Concrete Cantilever',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Cantilevered Concrete & Light Study',
        tags: ['Architecture', 'Concrete', 'Minimalism'],
      },
      {
        title: 'Scandinavian Birch Interior',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Bent Birch Lounge Chair & Daylight',
        tags: ['Interior', 'Wood', 'Nordic'],
      },
      {
        title: 'Travertine Staircase',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
        caption: 'Minimalist Stone Architecture',
        tags: ['Stone', 'Travertine', 'Stairs'],
      },
      {
        title: 'Gallery Courtyard Arch',
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Monolithic Arch & Sunlight Geometry',
        tags: ['Arch', 'Gallery', 'Monochrome'],
      },
      {
        title: 'Brutalist Window Frame',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
        caption: 'Glass Facade & Linear Structure',
        tags: ['Glass', 'Modern', 'Lines'],
      },
    ],
  },
  {
    id: 'fashion',
    name: 'Editorial & Textiles',
    images: [
      {
        title: 'Ochre Knitwear',
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Pigment Ochre Knitwear Study',
        tags: ['Fashion', 'Ochre', 'Knit'],
      },
      {
        title: 'Silk Drape & Movement',
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
        caption: 'Sand Dune Silk Drape',
        tags: ['Silk', 'Fabric', 'Fluid'],
      },
      {
        title: 'Handcrafted Brass Jewelry',
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
        caption: 'Brass Hardware & Texture',
        tags: ['Jewelry', 'Accessories', 'Gold'],
      },
      {
        title: 'Linen Weave Close-up',
        url: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1000&q=80',
        caption: 'Unbleached Organic Linen Fibers',
        tags: ['Linen', 'Texture', 'Neutral'],
      },
    ],
  },
  {
    id: 'ceramics',
    name: 'Ceramics & Materials',
    images: [
      {
        title: 'Unglazed Stoneware Bowl',
        url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
        caption: 'Raw Ash Stoneware Bowl',
        tags: ['Ceramic', 'Craft', 'Pottery'],
      },
      {
        title: 'Linen Draped Ceramics',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
        caption: 'Wabi-Sabi Still Life & Linen',
        tags: ['Vase', 'Still Life', 'Warm'],
      },
      {
        title: 'Terra Cotta Tile Stack',
        url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80',
        caption: 'Handmade Clay Floor Tiles',
        tags: ['Terracotta', 'Tile', 'Earth'],
      },
      {
        title: 'Raw Travertine Slab',
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
        caption: 'Porous Travertine Stone Texture',
        tags: ['Stone', 'Travertine', 'Minimal'],
      },
    ],
  },
  {
    id: 'botanicals',
    name: 'Botanical & Natural',
    images: [
      {
        title: 'Kyoto Moss Garden',
        url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80',
        caption: 'Damp Moss & Stone Geometry',
        tags: ['Botanical', 'Moss', 'Japan'],
      },
      {
        title: 'Eucalyptus Leaves & Sun',
        url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
        caption: 'Silver Dollar Eucalyptus',
        tags: ['Eucalyptus', 'Sage', 'Nature'],
      },
      {
        title: 'Dried Palm Fronds',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        caption: 'Sun-bleached Botanical Texture',
        tags: ['Flora', 'Dried', 'Sand'],
      },
    ],
  },
];
