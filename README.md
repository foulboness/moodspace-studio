# moodspace studio

> A minimalist visual workspace for collecting, arranging, and exploring ideas.

** A frontend-only moodboard studio designed for creatives, designers, photographers, students, and anyone who wants to turn scattered inspiration into organized visual collections.

Create moodboards using images, colors, text, notes, and links — then arrange everything freely on a visual canvas.

---

## Features

* **Visual Canvas** — Arrange and position content freely
* **Image Collections** — Add images and create visual references
* **Color Palettes** — Build and experiment with custom palettes
* **Text & Notes** — Add ideas, descriptions, and annotations
* **Drag & Drop** — Move and organize elements across the canvas
* **Resizable Elements** — Adjust images and content to fit your composition
* **Multiple Moodboards** — Create separate boards for different projects
* **Templates** — Start with predefined layouts
* **Zoom & Canvas Controls** — Navigate large compositions easily
* **Local Storage** — Keep boards saved directly in the browser
* **Responsive Preview** — View your creations across different screen sizes
* **Export / Print** — Turn your moodboard into a shareable composition

---

## What You Can Create

**Design Inspiration**
Collect UI references, typography, layouts, and color palettes.

**Photography**
Build visual references for shoots, locations, lighting, and composition.

**Branding**
Combine logos, colors, fonts, imagery, and brand direction.

**Fashion**
Create style boards using clothing, textures, photography, and color.

**Interior Design**
Collect furniture, materials, architecture, and room inspiration.

**Creative Projects**
Organize ideas and references before starting a new project.

---

## Interface

```text
┌──────────────────────────────────────────────────────────────┐
│  COLLECTED                         Save   Export   Preview    │
├──────────────┬───────────────────────────────────┬───────────┤
│              │                                   │           │
│  + Image     │                                   │ Properties│
│  + Text      │          MOODBOARD CANVAS         │           │
│  + Color     │                                   │ Position  │
│  + Note      │      ┌──────┐       ┌──────┐      │ Size      │
│              │      │ IMAGE│       │ TEXT │      │ Rotation  │
│  Templates   │      └──────┘       └──────┘      │           │
│              │                                   │           │
│  Layers      │          ┌──────────┐             │           │
│              │          │  PALETTE │             │           │
│              │          └──────────┘             │           │
└──────────────┴───────────────────────────────────┴───────────┘
```

---

## Design Direction

Moodspace Studio follows a **minimalist editorial aesthetic**:

* Off-white backgrounds
* Black typography
* Soft grey borders
* Subtle beige accents
* Generous whitespace
* Clean geometric layouts
* Minimal interface chrome
* Smooth micro-interactions

---

## Tech Stack

* **React**
* **TypeScript**
* **Vite**
* **CSS / Tailwind CSS**
* **LocalStorage**
* **HTML Canvas / DOM-based canvas interactions**

No backend or database is required.

---

## Project Structure

```text
collected/
├── src/
│   ├── components/
│   ├── pages/
│   ├── data/
│   ├── hooks/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── README.md
```

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/foulboness/moodspace-studio.git
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## ✦ License

This project is available for personal and educational use.
