import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { useStore, SCENE_TYPES } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scenes")({
  head: () => ({
    meta: [
      { title: "Scene Framework — Mythos" },
      { name: "description", content: "All your scenes, organized and ready to weave." },
    ],
  }),
  component: ScenesPage,
});

function ScenesPage() {
  const { scenes, addScene, upsertScene, deleteScene, chapters } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const active = scenes.find((s) => s.id === openId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center px-6 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">All Scenes</div>
            <div className="font-display text-2xl text-gold">Scene Framework</div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setOpenId(addScene())}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gold text-background font-display hover:bg-gold/90"
            >
              <Plus size={16} /> New Scene
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {scenes.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <h3 className="font-display text-2xl">No scenes drafted yet.</h3>
              <p className="text-muted-foreground">Sketch the bones before you write the flesh.</p>
              <button onClick={() => setOpenId(addScene())} className="px-4 py-2 rounded-md bg-gold text-background font-display hover:bg-gold/90">
                + Create First Scene
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-w-6xl mx-auto">
              {scenes.map((s) => {
                const ch = chapters.find((c) => c.id === s.chapterId);
                const pg = ch?.pages.find((p) => p.id === s.pageId);
                return (
                  <button
                    key={s.id}
                    onClick={() => setOpenId(s.id)}
                    className="text-left bg-card border border-border rounded-lg p-5 hover:border-gold/60 transition-all min-h-[180px] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-gold border border-gold/40 rounded-full px-2 py-0.5">{s.type}</span>
                      {ch && <span className="text-[10px] text-muted-foreground font-mono">{ch.title}{pg && ` · ${pg.title}`}</span>}
                    </div>
                    <h3 className="font-display text-lg text-foreground">{s.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{s.description || <span className="italic">No description yet.</span>}</p>
                    {s.emotionalBeat && (
                      <p className="text-xs italic text-gold/80 border-t border-border pt-2 mt-auto">"{s.emotionalBeat}"</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setOpenId(null)}>
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-xl h-full bg-surface border-l border-border overflow-y-auto">
            <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="font-display text-xl text-gold">Edit Scene</div>
              <button onClick={() => setOpenId(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Scene Title">
                <input className={inputCls} value={active.title} onChange={(e) => upsertScene({ ...active, title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Chapter">
                  <select className={inputCls} value={active.chapterId || ""} onChange={(e) => upsertScene({ ...active, chapterId: e.target.value || null, pageId: null })}>
                    <option value="">— None —</option>
                    {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </Field>
                <Field label="Page">
                  <select className={inputCls} value={active.pageId || ""} onChange={(e) => upsertScene({ ...active, pageId: e.target.value || null })} disabled={!active.chapterId}>
                    <option value="">— None —</option>
                    {chapters.find((c) => c.id === active.chapterId)?.pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Description">
                <textarea rows={8} className={inputCls + " resize-y font-mono"} value={active.description} onChange={(e) => upsertScene({ ...active, description: e.target.value })} />
              </Field>
              <Field label="Scene Type">
                <div className="flex flex-wrap gap-1.5">
                  {SCENE_TYPES.map((t) => (
                    <button key={t} onClick={() => upsertScene({ ...active, type: t })}
                      className={cn("text-xs px-3 py-1 rounded-full border transition-colors",
                        active.type === t ? "bg-gold text-background border-gold" : "border-border text-muted-foreground hover:border-gold/50")}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Emotional Beat">
                <input className={inputCls + " italic"} value={active.emotionalBeat} onChange={(e) => upsertScene({ ...active, emotionalBeat: e.target.value })} />
              </Field>
              <button onClick={() => { deleteScene(active.id); setOpenId(null); }} className="text-xs text-destructive hover:underline">
                Delete Scene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full bg-input border border-border rounded px-3 py-2 text-sm focus:border-gold outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
