import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEY, uid } from '../utils/localStorage'
import { COLOR_THEMES } from '../utils/themes'
import { defaultDims } from '../utils/elementGeometry'

/* ------------------------------------------------------------------ *
 * Default shapes. Kept here so every phase extends the same store.
 * ------------------------------------------------------------------ */
const defaultStudentInfo = {
  fullName: '',
  profilePhoto: '', // data URL
  university: '',
  faculty: '',
  supervisor: '',
  graduationYear: '',
  email: '',
  phone: '',
  linkedin: '',
  location: '',
}

const defaultAboutMe = {
  bio: '',
  philosophy: '',
}

const defaultSkills = {
  software: [],
  design: [],
  languages: [],
  other: [],
}

const defaultCV = {
  education: [],
  experience: [],
  awards: [],
  publications: [],
  volunteer: [],
}

const defaultSettings = {
  theme: 'dark', // 'light' | 'dark' — kept in sync with the colorTheme's isDark
  fontDisplay: "'Cormorant Garamond', serif",
  fontBody: "'DM Sans', sans-serif",
  fontScale: 1, // 0.9 | 1 | 1.1
  colorTheme: 'charcoal', // see COLOR_THEMES — defaults to Dark + Gold
}

// Portfolio layout: section order + which sections are hidden from the
// generated portfolio / PDF / book.
const defaultBuilder = {
  order: ['cover', 'about', 'skills', 'cv', 'projects'],
  hidden: [],
}

/* ------------------------------------------------------------------ *
 * Project factory (Phase 3 builds the full UI; shape lives here now). *
 * ------------------------------------------------------------------ */
export function makeProject(name = 'Untitled Project') {
  return {
    id: uid('proj'),
    overview: {
      name,
      type: 'Graduation',
      year: '',
      location: '',
      area: '',
      heroShot: '',
      description: '',
      supervisor: '',
      tags: [],
    },
    concept: {
      title: '',
      description: '',
      images: [], // { id, src, caption }
      diagrams: [], // { id, src, name, kind }
    },
    plans: { description: '', items: [] }, // items: { id, name, description, src, kind }
    elevations: { description: '', items: [] },
    sections: { description: '', items: [] },
    shots: { description: '', items: [] }, // items: { id, name, category, src, kind }
  }
}

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      /* ---------- data ---------- */
      studentInfo: defaultStudentInfo,
      aboutMe: defaultAboutMe,
      skills: defaultSkills,
      cv: defaultCV,
      projects: [],
      settings: defaultSettings,
      builder: defaultBuilder,
      // Design overlays keyed by portfolio page key: { [pageKey]: [element] }
      designElements: {},
      activePage: 'cover', // page new elements are added to
      selectedElementId: null,
      apiKey: '', // legacy/unused — AI features now use GEMINI_API_KEY from env

      /* ---------- student info ---------- */
      updateStudentInfo: (patch) =>
        set((s) => ({ studentInfo: { ...s.studentInfo, ...patch } })),

      /* ---------- about me ---------- */
      updateAboutMe: (patch) =>
        set((s) => ({ aboutMe: { ...s.aboutMe, ...patch } })),

      /* ---------- settings / theme ---------- */
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      // Select a color theme and sync the light/dark flag to it.
      setColorTheme: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            colorTheme: key,
            theme: COLOR_THEMES[key]?.isDark ? 'dark' : 'light',
          },
        })),
      // Toggle between dark and light using sensible default palettes.
      toggleTheme: () =>
        set((s) => {
          const isDark = COLOR_THEMES[s.settings.colorTheme]?.isDark
          const colorTheme = isDark ? 'cream' : 'charcoal'
          return {
            settings: {
              ...s.settings,
              colorTheme,
              theme: isDark ? 'light' : 'dark',
            },
          }
        }),

      /* ---------- skills ---------- */
      addSkill: (category, skill = {}) =>
        set((s) => ({
          skills: {
            ...s.skills,
            [category]: [
              ...s.skills[category],
              { id: uid('skill'), name: '', level: 2, ...skill },
            ],
          },
        })),
      updateSkill: (category, id, patch) =>
        set((s) => ({
          skills: {
            ...s.skills,
            [category]: s.skills[category].map((sk) =>
              sk.id === id ? { ...sk, ...patch } : sk
            ),
          },
        })),
      removeSkill: (category, id) =>
        set((s) => ({
          skills: {
            ...s.skills,
            [category]: s.skills[category].filter((sk) => sk.id !== id),
          },
        })),

      /* ---------- cv / resume ---------- */
      addCVItem: (section, item = {}) =>
        set((s) => ({
          cv: {
            ...s.cv,
            [section]: [...s.cv[section], { id: uid('cv'), ...item }],
          },
        })),
      updateCVItem: (section, id, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            [section]: s.cv[section].map((it) =>
              it.id === id ? { ...it, ...patch } : it
            ),
          },
        })),
      removeCVItem: (section, id) =>
        set((s) => ({
          cv: {
            ...s.cv,
            [section]: s.cv[section].filter((it) => it.id !== id),
          },
        })),

      /* ---------- builder layout ---------- */
      updateBuilder: (patch) =>
        set((s) => ({ builder: { ...s.builder, ...patch } })),
      toggleSection: (key) =>
        set((s) => ({
          builder: {
            ...s.builder,
            hidden: s.builder.hidden.includes(key)
              ? s.builder.hidden.filter((k) => k !== key)
              : [...s.builder.hidden, key],
          },
        })),
      moveSection: (key, dir) =>
        set((s) => {
          const order = [...s.builder.order]
          const i = order.indexOf(key)
          const j = i + dir
          if (i < 0 || j < 0 || j >= order.length) return {}
          ;[order[i], order[j]] = [order[j], order[i]]
          return { builder: { ...s.builder, order } }
        }),
      reorderSections: (order) =>
        set((s) => ({ builder: { ...s.builder, order } })),

      /* ---------- design elements (page overlays) ---------- */
      setActivePage: (key) => set({ activePage: key }),
      selectElement: (id) => set({ selectedElementId: id }),
      addElement: (template = {}) =>
        set((s) => {
          const page = s.activePage
          const kind = template.kind || 'shape'
          const variant = template.variant || 'circle'
          const { w, h } = defaultDims(kind, variant)
          const el = {
            id: uid('el'),
            kind,
            variant,
            x: 50, // % of page width (center)
            y: 50, // % of page height (center)
            w, // px at natural page scale
            h,
            opacity: 1,
            color: '#1a1a1a',
            rotation: 0,
            locked: false, // aspect-ratio lock
            ...template,
          }
          const list = s.designElements[page]
            ? [...s.designElements[page], el]
            : [el]
          return {
            designElements: { ...s.designElements, [page]: list },
            selectedElementId: el.id,
          }
        }),
      updateElement: (id, patch) =>
        set((s) => {
          const next = {}
          for (const [page, list] of Object.entries(s.designElements)) {
            next[page] = list.map((e) => (e.id === id ? { ...e, ...patch } : e))
          }
          return { designElements: next }
        }),
      removeElement: (id) =>
        set((s) => {
          const next = {}
          for (const [page, list] of Object.entries(s.designElements)) {
            next[page] = list.filter((e) => e.id !== id)
          }
          return {
            designElements: next,
            selectedElementId:
              s.selectedElementId === id ? null : s.selectedElementId,
          }
        }),

      /* ---------- api key ---------- */
      setApiKey: (apiKey) => set({ apiKey }),

      /* ---------- projects (used from Phase 3) ---------- */
      addProject: (name) => {
        const p = makeProject(name)
        set((s) => ({ projects: [...s.projects, p] }))
        return p.id
      },
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      updateProjectSection: (id, section, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, [section]: { ...p[section], ...patch } } : p
          ),
        })),

      // Generic helpers for arrays nested inside a project section, e.g.
      // section='plans' listKey='items', or section='concept' listKey='images'.
      addListItem: (id, section, listKey, item = {}) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  [section]: {
                    ...p[section],
                    [listKey]: [
                      ...p[section][listKey],
                      { id: uid('item'), ...item },
                    ],
                  },
                }
              : p
          ),
        })),
      updateListItem: (id, section, listKey, itemId, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  [section]: {
                    ...p[section],
                    [listKey]: p[section][listKey].map((it) =>
                      it.id === itemId ? { ...it, ...patch } : it
                    ),
                  },
                }
              : p
          ),
        })),
      removeListItem: (id, section, listKey, itemId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  [section]: {
                    ...p[section],
                    [listKey]: p[section][listKey].filter(
                      (it) => it.id !== itemId
                    ),
                  },
                }
              : p
          ),
        })),

      /* ---------- danger zone ---------- */
      resetAll: () =>
        set({
          studentInfo: defaultStudentInfo,
          aboutMe: defaultAboutMe,
          skills: defaultSkills,
          cv: defaultCV,
          projects: [],
          designElements: {},
          selectedElementId: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
    }
  )
)
