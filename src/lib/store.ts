import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Page = { id: string; title: string; content: string };
export type Chapter = { id: string; title: string; pages: Page[] };

export type CharacterEntry = {
  id: string;
  name: string;
  tagline: string;
  role: string;
  physical: string;
  personality: string;
  backstory: string;
  motivations: string;
  relationships: string;
  notes: string;
};

export type ItemEntry = {
  id: string;
  name: string;
  tagline: string;
  type: string;
  physical: string;
  origin: string;
  powers: string;
  owner: string;
  notes: string;
};

export type SettingEntry = {
  id: string;
  name: string;
  location: string;
  description: string;
  atmosphere: string;
  inhabitants: string;
  features: string;
};

export type SystemEntry = {
  id: string;
  name: string;
  tagline: string;
  type: string;
  rules: string;
  limitations: string;
  access: string;
  notes: string;
};

export type ConceptEntry = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export type WorldOverview = {
  name: string;
  cosmology: string;
  history: string;
  tone: string;
  rules: string;
};

export type Scene = {
  id: string;
  title: string;
  chapterId: string | null;
  pageId: string | null;
  description: string;
  type: string;
  emotionalBeat: string;
};

type State = {
  chapters: Chapter[];
  activeChapterId: string | null;
  activePageId: string | null;

  characters: CharacterEntry[];
  items: ItemEntry[];
  world: WorldOverview;
  settings: SettingEntry[];
  systems: SystemEntry[];
  concepts: ConceptEntry[];

  scenes: Scene[];
  activeSceneId: string | null;

  // actions
  addChapter: () => void;
  renameChapter: (id: string, title: string) => void;
  deleteChapter: (id: string) => void;
  reorderChapters: (from: number, to: number) => void;
  addPage: (chapterId: string) => void;
  renamePage: (chapterId: string, pageId: string, title: string) => void;
  deletePage: (chapterId: string, pageId: string) => void;
  updatePageContent: (chapterId: string, pageId: string, content: string) => void;
  setActive: (chapterId: string | null, pageId: string | null) => void;

  upsertCharacter: (c: CharacterEntry) => void;
  deleteCharacter: (id: string) => void;
  addCharacter: () => string;

  upsertItem: (i: ItemEntry) => void;
  deleteItem: (id: string) => void;
  addItem: () => string;

  updateWorld: (w: Partial<WorldOverview>) => void;
  upsertSetting: (s: SettingEntry) => void;
  deleteSetting: (id: string) => void;
  addSetting: () => string;

  upsertSystem: (s: SystemEntry) => void;
  deleteSystem: (id: string) => void;
  addSystem: () => string;

  upsertConcept: (c: ConceptEntry) => void;
  deleteConcept: (id: string) => void;
  addConcept: () => string;

  addScene: () => string;
  upsertScene: (s: Scene) => void;
  deleteScene: (id: string) => void;
  setActiveScene: (id: string | null) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const seedChapter = (): Chapter => ({
  id: uid(),
  title: "Chapter One",
  pages: [{ id: uid(), title: "Page 1", content: "" }],
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      chapters: [seedChapter()],
      activeChapterId: null,
      activePageId: null,

      characters: [],
      items: [],
      world: { name: "", cosmology: "", history: "", tone: "", rules: "" },
      settings: [],
      systems: [],
      concepts: [],

      scenes: [],
      activeSceneId: null,

      addChapter: () => {
        const ch: Chapter = {
          id: uid(),
          title: `Chapter ${get().chapters.length + 1}`,
          pages: [{ id: uid(), title: "Page 1", content: "" }],
        };
        set({ chapters: [...get().chapters, ch] });
      },
      renameChapter: (id, title) =>
        set({ chapters: get().chapters.map((c) => (c.id === id ? { ...c, title } : c)) }),
      deleteChapter: (id) =>
        set({ chapters: get().chapters.filter((c) => c.id !== id) }),
      reorderChapters: (from, to) => {
        const arr = [...get().chapters];
        const [m] = arr.splice(from, 1);
        arr.splice(to, 0, m);
        set({ chapters: arr });
      },
      addPage: (chapterId) =>
        set({
          chapters: get().chapters.map((c) =>
            c.id === chapterId
              ? { ...c, pages: [...c.pages, { id: uid(), title: `Page ${c.pages.length + 1}`, content: "" }] }
              : c,
          ),
        }),
      renamePage: (chapterId, pageId, title) =>
        set({
          chapters: get().chapters.map((c) =>
            c.id === chapterId
              ? { ...c, pages: c.pages.map((p) => (p.id === pageId ? { ...p, title } : p)) }
              : c,
          ),
        }),
      deletePage: (chapterId, pageId) =>
        set({
          chapters: get().chapters.map((c) =>
            c.id === chapterId ? { ...c, pages: c.pages.filter((p) => p.id !== pageId) } : c,
          ),
        }),
      updatePageContent: (chapterId, pageId, content) =>
        set({
          chapters: get().chapters.map((c) =>
            c.id === chapterId
              ? { ...c, pages: c.pages.map((p) => (p.id === pageId ? { ...p, content } : p)) }
              : c,
          ),
        }),
      setActive: (chapterId, pageId) => set({ activeChapterId: chapterId, activePageId: pageId }),

      addCharacter: () => {
        const c: CharacterEntry = {
          id: uid(), name: "New Character", tagline: "", role: "", physical: "",
          personality: "", backstory: "", motivations: "", relationships: "", notes: "",
        };
        set({ characters: [...get().characters, c] });
        return c.id;
      },
      upsertCharacter: (c) =>
        set({ characters: get().characters.map((x) => (x.id === c.id ? c : x)) }),
      deleteCharacter: (id) => set({ characters: get().characters.filter((x) => x.id !== id) }),

      addItem: () => {
        const i: ItemEntry = {
          id: uid(), name: "New Item", tagline: "", type: "", physical: "",
          origin: "", powers: "", owner: "", notes: "",
        };
        set({ items: [...get().items, i] });
        return i.id;
      },
      upsertItem: (i) => set({ items: get().items.map((x) => (x.id === i.id ? i : x)) }),
      deleteItem: (id) => set({ items: get().items.filter((x) => x.id !== id) }),

      updateWorld: (w) => set({ world: { ...get().world, ...w } }),
      addSetting: () => {
        const s: SettingEntry = {
          id: uid(), name: "New Setting", location: "", description: "",
          atmosphere: "", inhabitants: "", features: "",
        };
        set({ settings: [...get().settings, s] });
        return s.id;
      },
      upsertSetting: (s) => set({ settings: get().settings.map((x) => (x.id === s.id ? s : x)) }),
      deleteSetting: (id) => set({ settings: get().settings.filter((x) => x.id !== id) }),

      addSystem: () => {
        const s: SystemEntry = {
          id: uid(), name: "New System", tagline: "", type: "", rules: "",
          limitations: "", access: "", notes: "",
        };
        set({ systems: [...get().systems, s] });
        return s.id;
      },
      upsertSystem: (s) => set({ systems: get().systems.map((x) => (x.id === s.id ? s : x)) }),
      deleteSystem: (id) => set({ systems: get().systems.filter((x) => x.id !== id) }),

      addConcept: () => {
        const c: ConceptEntry = { id: uid(), name: "New Concept", category: "", description: "" };
        set({ concepts: [...get().concepts, c] });
        return c.id;
      },
      upsertConcept: (c) => set({ concepts: get().concepts.map((x) => (x.id === c.id ? c : x)) }),
      deleteConcept: (id) => set({ concepts: get().concepts.filter((x) => x.id !== id) }),

      addScene: () => {
        const s: Scene = {
          id: uid(), title: "New Scene", chapterId: null, pageId: null,
          description: "", type: "Dialogue", emotionalBeat: "",
        };
        set({ scenes: [...get().scenes, s], activeSceneId: s.id });
        return s.id;
      },
      upsertScene: (s) => set({ scenes: get().scenes.map((x) => (x.id === s.id ? s : x)) }),
      deleteScene: (id) =>
        set({
          scenes: get().scenes.filter((x) => x.id !== id),
          activeSceneId: get().activeSceneId === id ? null : get().activeSceneId,
        }),
      setActiveScene: (id) => set({ activeSceneId: id }),
    }),
    { name: "mythos-store-v1" },
  ),
);

export const SCENE_TYPES = ["Action", "Dialogue", "Exposition", "Confrontation", "Transition"];
