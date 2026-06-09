import { useEffect, useRef, useState } from "react";
import { X, Plus, GripVertical } from "lucide-react";
import { useStore, SCENE_TYPES } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onClose: () => void; floating?: boolean };

export function ScenePanel({ open, onClose, floating = true }: Props) {
  const { scenes, activeSceneId, setActiveScene, addScene, upsertScene, deleteScene, chapters } =
    useStore();
  const active = scenes.find((s) => s.id === activeSceneId) || null;
  const [width, setWidth] = useState(360);
  const resizing = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const w = window.innerWidth - e.clientX;
      setWidth(Math.max(300, Math.min(640, w)));
    };
    const onUp = () => (resizing.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const activeChapter = chapters.find((c) => c.id === active?.chapterId);

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-screen z-40 flex transition-transform duration-300",
        floating ? "shadow-2xl" : "",
      )}
      style={{ width }}
    >
      {/* resize handle */}
      <div
        onMouseDown={() => (resizing.current = true)}
        className="w-1 cursor-col-resize hover:bg-gold/40 transition-colors"
      >
        <div className="h-full flex items-center justify-center text-muted-foreground/40">
          <GripVertical size={14} />
        </div>
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col border-l border-border h-full",
          floating ? "bg-surface/95 backdrop-blur-md" : "bg-surface",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Scene Framework</div>
            <div className="font-display text-lg text-gold">Floating Notepad</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Scene list */}
          <div className="w-32 shrink-0 border-r border-border overflow-y-auto p-2 flex flex-col gap-1">
            <button
              onClick={() => addScene()}
              className="flex items-center gap-1 text-xs text-gold hover:bg-gold/10 rounded px-2 py-2"
            >
              <Plus size={12} /> New
            </button>
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScene(s.id)}
                className={cn(
                  "text-left text-xs px-2 py-2 rounded truncate transition-colors",
                  s.id === activeSceneId
                    ? "bg-gold/15 text-gold"
                    : "text-foreground/80 hover:bg-surface-elevated",
                )}
              >
                {s.title || "Untitled"}
              </button>
            ))}
            {scenes.length === 0 && (
              <div className="text-[11px] text-muted-foreground p-2 italic">No scenes yet.</div>
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!active ? (
              <div className="h-full grid place-items-center text-center text-sm text-muted-foreground">
                <div className="space-y-3">
                  <p className="font-display text-base">Select or create a scene.</p>
                  <button
                    onClick={() => addScene()}
                    className="text-xs px-3 py-1.5 rounded bg-gold text-background hover:bg-gold/90"
                  >
                    + New Scene
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Field label="Scene Title">
                  <input
                    value={active.title}
                    onChange={(e) => upsertScene({ ...active, title: e.target.value })}
                    className="w-full bg-transparent border-b border-border focus:border-gold outline-none font-display text-lg py-1"
                  />
                </Field>

                <Field label="Linked To">
                  <div className="flex gap-2">
                    <select
                      value={active.chapterId || ""}
                      onChange={(e) =>
                        upsertScene({ ...active, chapterId: e.target.value || null, pageId: null })
                      }
                      className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm"
                    >
                      <option value="">— Chapter —</option>
                      {chapters.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <select
                      value={active.pageId || ""}
                      onChange={(e) => upsertScene({ ...active, pageId: e.target.value || null })}
                      className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm"
                      disabled={!activeChapter}
                    >
                      <option value="">— Page —</option>
                      {activeChapter?.pages.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </Field>

                <Field label="Description">
                  <textarea
                    value={active.description}
                    onChange={(e) => upsertScene({ ...active, description: e.target.value })}
                    rows={8}
                    placeholder="What's happening, the mood, the goal of the scene..."
                    className="w-full bg-input border border-border rounded p-2 text-sm font-mono resize-y focus:border-gold outline-none"
                  />
                </Field>

                <Field label="Scene Type">
                  <div className="flex flex-wrap gap-1.5">
                    {SCENE_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => upsertScene({ ...active, type: t })}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full border transition-colors",
                          active.type === t
                            ? "bg-gold text-background border-gold"
                            : "border-border text-muted-foreground hover:border-gold/50",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Emotional Beat">
                  <input
                    value={active.emotionalBeat}
                    onChange={(e) => upsertScene({ ...active, emotionalBeat: e.target.value })}
                    placeholder="The feeling to leave the reader with..."
                    className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm italic focus:border-gold outline-none"
                  />
                </Field>

                <button
                  onClick={() => deleteScene(active.id)}
                  className="text-xs text-destructive hover:underline mt-4"
                >
                  Delete Scene
                </button>
              </>
            )}
          </div>
        </div>
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
