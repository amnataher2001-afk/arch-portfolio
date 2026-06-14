// Font pairs and color themes for the StylePanel. Applied live via App.jsx,
// which writes these into CSS variables on <html>.

export const HEADING_FONTS = [
  { label: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Libre Baskerville', value: "'Libre Baskerville', serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
]

export const BODY_FONTS = [
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
]

export const FONT_SCALES = [
  { label: 'Small', value: 0.92 },
  { label: 'Medium', value: 1 },
  { label: 'Large', value: 1.08 },
]

// Each theme declares `isDark` so the app can toggle the `.dark` class and keep
// the light/dark switch in sync with the chosen palette.
export const COLOR_THEMES = {
  charcoal: {
    label: 'Dark + Gold',
    isDark: true,
    swatch: '#1a1a1a',
    bg: '#1a1a1a',
    surface: '#232320',
    surfaceAlt: '#2c2b27',
    text: '#f5f0eb',
    muted: '#9a958c',
    accent: '#c9a96e',
    border: '#353430',
  },
  olive: {
    label: 'Olive Green + Gold',
    isDark: true,
    swatch: '#556B2F',
    bg: '#2b2f22',
    surface: '#343a29',
    surfaceAlt: '#3d4430',
    text: '#efede2',
    muted: '#a8ab97',
    accent: '#c9a96e',
    border: '#474d38',
  },
  navy: {
    label: 'Navy Blue + Silver',
    isDark: true,
    swatch: '#1B2A4A',
    bg: '#131a2b',
    surface: '#1b2336',
    surfaceAlt: '#232c42',
    text: '#eef1f6',
    muted: '#9aa6bd',
    accent: '#c2c8d2',
    border: '#2c3650',
  },
  burgundy: {
    label: 'Deep Burgundy + Cream',
    isDark: true,
    swatch: '#5C1A1A',
    bg: '#3a1f25',
    surface: '#46272e',
    surfaceAlt: '#522e36',
    text: '#f3e9e0',
    muted: '#c2a59d',
    accent: '#e8d6bf',
    border: '#5a343c',
  },
  forest: {
    label: 'Forest Green + White',
    isDark: false,
    swatch: '#228B22',
    bg: '#ffffff',
    surface: '#ffffff',
    surfaceAlt: '#eef2ee',
    text: '#15241b',
    muted: '#5d6f63',
    accent: '#2f5d3a',
    border: '#dde6e0',
  },
  copper: {
    label: 'Charcoal + Copper',
    isDark: true,
    swatch: '#36454F',
    bg: '#1c1b1a',
    surface: '#262422',
    surfaceAlt: '#302d2a',
    text: '#f1ece6',
    muted: '#a39a90',
    accent: '#b87333',
    border: '#38342f',
  },
  cream: {
    label: 'Warm Cream',
    isDark: false,
    swatch: '#F5E6C8',
    bg: '#f5f0eb',
    surface: '#ffffff',
    surfaceAlt: '#efe8df',
    text: '#1a1a1a',
    muted: '#6b6862',
    accent: '#c9a96e',
    border: '#e3dace',
  },
  bluegrey: {
    label: 'Blue-Grey',
    isDark: false,
    swatch: '#6B7F9E',
    bg: '#eceff2',
    surface: '#ffffff',
    surfaceAlt: '#dfe4ea',
    text: '#1f2a33',
    muted: '#5d6b78',
    accent: '#5b7c99',
    border: '#d3dae1',
  },
  white: {
    label: 'Pure White',
    isDark: false,
    swatch: '#F5F5F5',
    bg: '#ffffff',
    surface: '#ffffff',
    surfaceAlt: '#f4f4f4',
    text: '#111111',
    muted: '#666666',
    accent: '#1a1a1a',
    border: '#e6e6e6',
  },
}

// Resolve the active palette directly from the chosen color theme.
export function resolvePalette(settings) {
  return COLOR_THEMES[settings.colorTheme] || COLOR_THEMES.charcoal
}

// Convert "#c9a96e" → "201 169 110" so colors can be stored as RGB channels.
// This lets Tailwind opacity modifiers (bg-accent/10) work via
// rgb(var(--color-accent) / <alpha-value>).
export function hexToChannels(hex) {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h.split('').map((c) => c + c).join('')
      : h
  const n = parseInt(full, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}
