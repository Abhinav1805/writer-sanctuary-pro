import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, X, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bible")({
  head: () => ({
    meta: [
      { title: "World & Character Bible — Mythos" },
      { name: "description", content: "Your story's universe — characters, items, worlds, systems and concepts." },
    ],
  }),
  component: BiblePage,
});

type Section = "characters" | "items" | "world" | "systems" | "concepts";
const SECTIONS: { key: Section; label: string }[] = [
  { key: "characters", label: "Characters" },
  { key: "items", label: "Items" },
  { key: "world", label: "World Building" },
  { key: "systems", label: "Systems" },
  { key: "concepts", label: "Concepts" },
];

function BiblePage() {
  const [section, setSection] = useState<Section>("characters");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center px-6 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">The Bible</div>
            <div className="font-display text-2xl text-gold">World & Character</div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <select
              value={section}
              onChange={(e) => { setSection(e.target.value as Section); setOpenId(null); setQuery(""); }}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm font-display focus:border-gold outline-none"
            >
              {SECTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            {section !== "world" && (
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-input border border-border rounded-md pl-8 pr-3 py-1.5 text-sm w-56 focus:border-gold outline-none"
                />
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {section === "characters" && <CharactersSection query={query} openId={openId} setOpenId={setOpenId} />}
          {section === "items" && <ItemsSection query={query} openId={openId} setOpenId={setOpenId} />}
          {section === "world" && <WorldSection query={query} openId={openId} setOpenId={setOpenId} />}
          {section === "systems" && <SystemsSection query={query} openId={openId} setOpenId={setOpenId} />}
          {section === "concepts" && <ConceptsSection query={query} openId={openId} setOpenId={setOpenId} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function SectionGrid({ children, onAdd, addLabel }: { children: React.ReactNode; onAdd: () => void; addLabel: string }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 max-w-6xl mx-auto">
      {children}
      <button
        onClick={onAdd}
        className="min-h-[160px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-gold hover:text-gold transition-colors"
      >
        <Plus size={20} />
        <span className="text-sm font-display">{addLabel}</span>
      </button>
    </div>
  );
}

function Card({ title, tagline, onClick, avatar }: { title: string; tagline: string; onClick: () => void; avatar?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-card border border-border rounded-lg p-5 hover:border-gold/60 hover:shadow-[0_0_0_1px_var(--gold)] transition-all min-h-[160px] flex flex-col"
    >
      {avatar && (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 mb-3 grid place-items-center font-display text-gold text-lg">
          {title.charAt(0).toUpperCase()}
        </div>
      )}
      <h3 className="font-display text-lg text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-3 flex-1">{tagline || <span className="italic">No tagline yet.</span>}</p>
    </button>
  );
}

function EmptyState({ headline, sub, cta, onCta }: { headline: string; sub: string; cta: string; onCta: () => void }) {
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <h3 className="font-display text-2xl text-foreground">{headline}</h3>
      <p className="text-muted-foreground">{sub}</p>
      <button onClick={onCta} className="px-4 py-2 rounded-md bg-gold text-background font-display hover:bg-gold/90">
        {cta}
      </button>
    </div>
  );
}

function Drawer({ open, onClose, title, children, onDelete }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; onDelete: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl h-full bg-surface border-l border-border overflow-y-auto animate-in slide-in-from-right duration-300"
      >
        <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="font-display text-xl text-gold">{title}</div>
          <div className="flex items-center gap-2">
            <button onClick={onDelete} className="text-muted-foreground hover:text-destructive p-2"><Trash2 size={16} /></button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2"><X size={18} /></button>
          </div>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-input border border-border rounded px-3 py-2 text-sm focus:border-gold outline-none";
const areaCls = inputCls + " resize-y min-h-[90px] font-mono";

/* ---------------- Characters ---------------- */

function CharactersSection({ query, openId, setOpenId }: { query: string; openId: string | null; setOpenId: (id: string | null) => void }) {
  const { characters, addCharacter, upsertCharacter, deleteCharacter } = useStore();
  const list = useMemo(() => characters.filter((c) => (c.name + c.tagline + c.role).toLowerCase().includes(query.toLowerCase())), [characters, query]);
  const active = characters.find((c) => c.id === openId);

  if (characters.length === 0) {
    return <EmptyState headline="No characters yet." sub="Every protagonist starts as a stranger." cta="+ Add Character" onCta={() => setOpenId(addCharacter())} />;
  }

  return (
    <>
      <SectionGrid onAdd={() => setOpenId(addCharacter())} addLabel="Add Character">
        {list.map((c) => <Card key={c.id} title={c.name} tagline={c.tagline} avatar onClick={() => setOpenId(c.id)} />)}
      </SectionGrid>
      <Drawer open={!!active} onClose={() => setOpenId(null)} title={active?.name || ""} onDelete={() => { if (active) { deleteCharacter(active.id); setOpenId(null); }}}>
        {active && (
          <>
            <Field label="Full Name"><input className={inputCls} value={active.name} onChange={(e) => upsertCharacter({ ...active, name: e.target.value })} /></Field>
            <Field label="Tagline"><input className={inputCls} value={active.tagline} onChange={(e) => upsertCharacter({ ...active, tagline: e.target.value })} /></Field>
            <Field label="Role / Archetype"><input className={inputCls} value={active.role} onChange={(e) => upsertCharacter({ ...active, role: e.target.value })} /></Field>
            <Field label="Physical Description"><textarea className={areaCls} value={active.physical} onChange={(e) => upsertCharacter({ ...active, physical: e.target.value })} /></Field>
            <Field label="Personality"><textarea className={areaCls} value={active.personality} onChange={(e) => upsertCharacter({ ...active, personality: e.target.value })} /></Field>
            <Field label="Backstory"><textarea className={areaCls} value={active.backstory} onChange={(e) => upsertCharacter({ ...active, backstory: e.target.value })} /></Field>
            <Field label="Motivations"><textarea className={areaCls} value={active.motivations} onChange={(e) => upsertCharacter({ ...active, motivations: e.target.value })} /></Field>
            <Field label="Relationships"><textarea className={areaCls} value={active.relationships} onChange={(e) => upsertCharacter({ ...active, relationships: e.target.value })} /></Field>
            <Field label="Notes"><textarea className={areaCls} value={active.notes} onChange={(e) => upsertCharacter({ ...active, notes: e.target.value })} /></Field>
          </>
        )}
      </Drawer>
    </>
  );
}

/* ---------------- Items ---------------- */

function ItemsSection({ query, openId, setOpenId }: { query: string; openId: string | null; setOpenId: (id: string | null) => void }) {
  const { items, addItem, upsertItem, deleteItem } = useStore();
  const list = useMemo(() => items.filter((c) => (c.name + c.tagline + c.type).toLowerCase().includes(query.toLowerCase())), [items, query]);
  const active = items.find((c) => c.id === openId);

  if (items.length === 0) {
    return <EmptyState headline="No artifacts in your inventory." sub="A sword. A letter. A key that opens nothing." cta="+ Add Item" onCta={() => setOpenId(addItem())} />;
  }

  return (
    <>
      <SectionGrid onAdd={() => setOpenId(addItem())} addLabel="Add Item">
        {list.map((c) => <Card key={c.id} title={c.name} tagline={c.tagline || c.type} onClick={() => setOpenId(c.id)} />)}
      </SectionGrid>
      <Drawer open={!!active} onClose={() => setOpenId(null)} title={active?.name || ""} onDelete={() => { if (active) { deleteItem(active.id); setOpenId(null); }}}>
        {active && (
          <>
            <Field label="Item Name"><input className={inputCls} value={active.name} onChange={(e) => upsertItem({ ...active, name: e.target.value })} /></Field>
            <Field label="Tagline"><input className={inputCls} value={active.tagline} onChange={(e) => upsertItem({ ...active, tagline: e.target.value })} /></Field>
            <Field label="Type / Category"><input className={inputCls} value={active.type} onChange={(e) => upsertItem({ ...active, type: e.target.value })} /></Field>
            <Field label="Physical Description"><textarea className={areaCls} value={active.physical} onChange={(e) => upsertItem({ ...active, physical: e.target.value })} /></Field>
            <Field label="Origin / History"><textarea className={areaCls} value={active.origin} onChange={(e) => upsertItem({ ...active, origin: e.target.value })} /></Field>
            <Field label="Powers or Properties"><textarea className={areaCls} value={active.powers} onChange={(e) => upsertItem({ ...active, powers: e.target.value })} /></Field>
            <Field label="Current Owner / Location"><input className={inputCls} value={active.owner} onChange={(e) => upsertItem({ ...active, owner: e.target.value })} /></Field>
            <Field label="Notes"><textarea className={areaCls} value={active.notes} onChange={(e) => upsertItem({ ...active, notes: e.target.value })} /></Field>
          </>
        )}
      </Drawer>
    </>
  );
}

/* ---------------- World Building ---------------- */

function WorldSection({ query, openId, setOpenId }: { query: string; openId: string | null; setOpenId: (id: string | null) => void }) {
  const { world, updateWorld, settings, addSetting, upsertSetting, deleteSetting } = useStore();
  const list = useMemo(() => settings.filter((s) => (s.name + s.location).toLowerCase().includes(query.toLowerCase())), [settings, query]);
  const active = settings.find((s) => s.id === openId);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">The World</div>
          <h2 className="font-display text-2xl text-gold">{world.name || "Unnamed World"}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="World Name"><input className={inputCls} value={world.name} onChange={(e) => updateWorld({ name: e.target.value })} placeholder="The realm's name..." /></Field>
          <Field label="Tone"><input className={inputCls} value={world.tone} onChange={(e) => updateWorld({ tone: e.target.value })} placeholder="Grim, lyrical, hopeful..." /></Field>
        </div>
        <Field label="Cosmology"><textarea className={areaCls} value={world.cosmology} onChange={(e) => updateWorld({ cosmology: e.target.value })} placeholder="Stars, gods, planes..." /></Field>
        <Field label="History"><textarea className={areaCls} value={world.history} onChange={(e) => updateWorld({ history: e.target.value })} /></Field>
        <Field label="Rules of Reality"><textarea className={areaCls} value={world.rules} onChange={(e) => updateWorld({ rules: e.target.value })} /></Field>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-display text-xl text-foreground">World Settings</h3>
          <span className="text-xs text-muted-foreground">Locations, regions, places within the world.</span>
        </div>
        {settings.length === 0 ? (
          <EmptyState headline="No settings mapped yet." sub="Every world begins with one door." cta="+ Add Setting" onCta={() => setOpenId(addSetting())} />
        ) : (
          <SectionGrid onAdd={() => setOpenId(addSetting())} addLabel="Add Setting">
            {list.map((s) => <Card key={s.id} title={s.name} tagline={s.location} onClick={() => setOpenId(s.id)} />)}
          </SectionGrid>
        )}
      </section>

      <Drawer open={!!active} onClose={() => setOpenId(null)} title={active?.name || ""} onDelete={() => { if (active) { deleteSetting(active.id); setOpenId(null); }}}>
        {active && (
          <>
            <Field label="Setting Name"><input className={inputCls} value={active.name} onChange={(e) => upsertSetting({ ...active, name: e.target.value })} /></Field>
            <Field label="Location within World"><input className={inputCls} value={active.location} onChange={(e) => upsertSetting({ ...active, location: e.target.value })} /></Field>
            <Field label="Description"><textarea className={areaCls} value={active.description} onChange={(e) => upsertSetting({ ...active, description: e.target.value })} /></Field>
            <Field label="Atmosphere / Mood"><textarea className={areaCls} value={active.atmosphere} onChange={(e) => upsertSetting({ ...active, atmosphere: e.target.value })} /></Field>
            <Field label="Key Inhabitants"><textarea className={areaCls} value={active.inhabitants} onChange={(e) => upsertSetting({ ...active, inhabitants: e.target.value })} /></Field>
            <Field label="Notable Features"><textarea className={areaCls} value={active.features} onChange={(e) => upsertSetting({ ...active, features: e.target.value })} /></Field>
          </>
        )}
      </Drawer>
    </div>
  );
}

/* ---------------- Systems ---------------- */

function SystemsSection({ query, openId, setOpenId }: { query: string; openId: string | null; setOpenId: (id: string | null) => void }) {
  const { systems, addSystem, upsertSystem, deleteSystem } = useStore();
  const list = useMemo(() => systems.filter((c) => (c.name + c.tagline + c.type).toLowerCase().includes(query.toLowerCase())), [systems, query]);
  const active = systems.find((c) => c.id === openId);

  if (systems.length === 0) {
    return <EmptyState headline="No systems defined." sub="Magic, economy, government — the bones of how things work." cta="+ Add System" onCta={() => setOpenId(addSystem())} />;
  }

  return (
    <>
      <SectionGrid onAdd={() => setOpenId(addSystem())} addLabel="Add System">
        {list.map((c) => <Card key={c.id} title={c.name} tagline={c.tagline || c.type} onClick={() => setOpenId(c.id)} />)}
      </SectionGrid>
      <Drawer open={!!active} onClose={() => setOpenId(null)} title={active?.name || ""} onDelete={() => { if (active) { deleteSystem(active.id); setOpenId(null); }}}>
        {active && (
          <>
            <Field label="System Name"><input className={inputCls} value={active.name} onChange={(e) => upsertSystem({ ...active, name: e.target.value })} /></Field>
            <Field label="Tagline"><input className={inputCls} value={active.tagline} onChange={(e) => upsertSystem({ ...active, tagline: e.target.value })} /></Field>
            <Field label="Type"><input className={inputCls} value={active.type} onChange={(e) => upsertSystem({ ...active, type: e.target.value })} placeholder="Magic, Economy, Government..." /></Field>
            <Field label="Core Rules"><textarea className={areaCls} value={active.rules} onChange={(e) => upsertSystem({ ...active, rules: e.target.value })} /></Field>
            <Field label="Limitations"><textarea className={areaCls} value={active.limitations} onChange={(e) => upsertSystem({ ...active, limitations: e.target.value })} /></Field>
            <Field label="Who Can Access It"><textarea className={areaCls} value={active.access} onChange={(e) => upsertSystem({ ...active, access: e.target.value })} /></Field>
            <Field label="Notes"><textarea className={areaCls} value={active.notes} onChange={(e) => upsertSystem({ ...active, notes: e.target.value })} /></Field>
          </>
        )}
      </Drawer>
    </>
  );
}

/* ---------------- Concepts ---------------- */

function ConceptsSection({ query, openId, setOpenId }: { query: string; openId: string | null; setOpenId: (id: string | null) => void }) {
  const { concepts, addConcept, upsertConcept, deleteConcept } = useStore();
  const list = useMemo(() => concepts.filter((c) => (c.name + c.category + c.description).toLowerCase().includes(query.toLowerCase())), [concepts, query]);
  const active = concepts.find((c) => c.id === openId);

  if (concepts.length === 0) {
    return <EmptyState headline="No concepts captured." sub="Themes, prophecies, fragments of lore." cta="+ Add Concept" onCta={() => setOpenId(addConcept())} />;
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 max-w-6xl mx-auto">
        {list.map((c) => (
          <button key={c.id} onClick={() => setOpenId(c.id)}
            className="text-left bg-card border border-border rounded-lg p-5 hover:border-gold/60 transition-all min-h-[140px] flex flex-col gap-2">
            {c.category && <span className="text-[10px] uppercase tracking-widest text-gold border border-gold/40 rounded-full px-2 py-0.5 self-start">{c.category}</span>}
            <h3 className="font-display text-lg text-foreground">{c.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{c.description || <span className="italic">No description yet.</span>}</p>
          </button>
        ))}
        <button onClick={() => setOpenId(addConcept())}
          className={cn("min-h-[140px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-gold hover:text-gold")}>
          <Plus size={20} />
          <span className="text-sm font-display">Add Concept</span>
        </button>
      </div>
      <Drawer open={!!active} onClose={() => setOpenId(null)} title={active?.name || ""} onDelete={() => { if (active) { deleteConcept(active.id); setOpenId(null); }}}>
        {active && (
          <>
            <Field label="Concept Name"><input className={inputCls} value={active.name} onChange={(e) => upsertConcept({ ...active, name: e.target.value })} /></Field>
            <Field label="Category Tag"><input className={inputCls} value={active.category} onChange={(e) => upsertConcept({ ...active, category: e.target.value })} placeholder="Theme, Prophecy, Lore..." /></Field>
            <Field label="Description"><textarea className={areaCls + " min-h-[240px]"} value={active.description} onChange={(e) => upsertConcept({ ...active, description: e.target.value })} /></Field>
          </>
        )}
      </Drawer>
    </>
  );
}
