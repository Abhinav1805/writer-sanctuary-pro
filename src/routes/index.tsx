import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Plus, FileText, ChevronsRight, PanelLeftClose, PanelLeft, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { RichEditor, countWords } from "@/components/RichEditor";
import { ScenePanel } from "@/components/ScenePanel";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Story Editor — Mythos" },
      { name: "description", content: "Write your novel in a distraction-free, editorial workspace." },
    ],
  }),
  component: StoryEditor,
});

function StoryEditor() {
  const {
    chapters, activeChapterId, activePageId, setActive,
    addChapter, addPage, renameChapter, renamePage, deleteChapter, deletePage,
    updatePageContent,
  } = useStore();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [navOpen, setNavOpen] = useState(true);
  const [sceneOpen, setSceneOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Pick a default active page on first load
  useEffect(() => {
    if (!activeChapterId && chapters[0]) {
      setActive(chapters[0].id, chapters[0].pages[0]?.id ?? null);
      setExpanded({ [chapters[0].id]: true });
    }
  }, [activeChapterId, chapters, setActive]);

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) ?? null,
    [chapters, activeChapterId],
  );
  const activePage = useMemo(
    () => activeChapter?.pages.find((p) => p.id === activePageId) ?? null,
    [activeChapter, activePageId],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        toast.success("Saved", { description: "Your work is autosaved locally." });
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        addChapter();
        toast("New chapter added");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addChapter]);

  // Drag and drop reorder
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const reorder = useStore((s) => s.reorderChapters);

  const words = activePage ? countWords(activePage.content) : 0;
  const pageNumber = activeChapter && activePage
    ? activeChapter.pages.findIndex((p) => p.id === activePage.id) + 1
    : 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <AppSidebar />

      {/* Chapter Navigator */}
      <div
        className={cn(
          "transition-all duration-300 border-r border-border bg-surface/40 overflow-hidden shrink-0",
          navOpen ? "w-[240px]" : "w-0",
        )}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-4 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Manuscript</div>
              <div className="font-display text-lg text-foreground">Chapters</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chapters.length === 0 && (
              <div className="text-xs text-muted-foreground italic p-4 text-center">
                A blank manuscript awaits.
              </div>
            )}
            {chapters.map((ch, idx) => {
              const isOpen = expanded[ch.id];
              return (
                <div
                  key={ch.id}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragIdx !== null && dragIdx !== idx) reorder(dragIdx, idx); setDragIdx(null); }}
                  className={cn(
                    "rounded-md group",
                    activeChapterId === ch.id ? "bg-surface-elevated" : "hover:bg-surface-elevated/50",
                  )}
                >
                  <div className="flex items-center gap-1 px-2 py-1.5">
                    <button
                      onClick={() => setExpanded((s) => ({ ...s, [ch.id]: !s[ch.id] }))}
                      className="text-muted-foreground hover:text-gold"
                    >
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {editingId === ch.id ? (
                      <input
                        autoFocus
                        defaultValue={ch.title}
                        onBlur={(e) => { renameChapter(ch.id, e.target.value || ch.title); setEditingId(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        className="flex-1 bg-transparent border-b border-gold outline-none text-sm font-display"
                      />
                    ) : (
                      <button
                        onClick={() => { setActive(ch.id, ch.pages[0]?.id ?? null); setExpanded((s)=>({...s,[ch.id]:true})); }}
                        onDoubleClick={() => setEditingId(ch.id)}
                        className="flex-1 text-left text-sm font-display truncate"
                      >
                        {ch.title}
                      </button>
                    )}
                    <button
                      onClick={() => deleteChapter(ch.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="ml-6 pb-2 space-y-0.5">
                      {ch.pages.map((p, pi) => (
                        <div key={p.id} className="flex items-center gap-1 group/page">
                          {editingId === p.id ? (
                            <input
                              autoFocus
                              defaultValue={p.title}
                              onBlur={(e) => { renamePage(ch.id, p.id, e.target.value || p.title); setEditingId(null); }}
                              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              className="flex-1 bg-transparent border-b border-gold outline-none text-xs font-mono ml-1"
                            />
                          ) : (
                            <button
                              onClick={() => setActive(ch.id, p.id)}
                              onDoubleClick={() => setEditingId(p.id)}
                              className={cn(
                                "flex-1 text-left text-xs font-mono py-1 px-2 rounded flex items-center gap-1.5 truncate",
                                activePageId === p.id ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              <FileText size={10} />
                              <span className="truncate">{pi + 1}. {p.title}</span>
                            </button>
                          )}
                          <button
                            onClick={() => deletePage(ch.id, p.id)}
                            className="opacity-0 group-hover/page:opacity-100 text-muted-foreground hover:text-destructive pr-1"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addPage(ch.id)}
                        className="ml-1 text-[11px] text-muted-foreground hover:text-gold flex items-center gap-1 px-2 py-1"
                      >
                        <Plus size={10} /> Add Page
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-border">
            <button
              onClick={addChapter}
              className="w-full flex items-center justify-center gap-2 text-sm py-2 rounded-md bg-gold text-background hover:bg-gold/90 font-display"
            >
              <Plus size={14} /> New Chapter
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 border-b border-border flex items-center px-4 gap-3">
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground"
            title="Toggle navigator"
          >
            {navOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {activeChapter && (
              <>
                <span className="font-display text-foreground">{activeChapter.title}</span>
                {activePage && (
                  <>
                    <ChevronRight size={12} />
                    <span className="font-mono">Page {pageNumber} · {activePage.title}</span>
                  </>
                )}
              </>
            )}
          </div>
          <div className="ml-auto" />
          <button
            onClick={() => setSceneOpen(true)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border hover:border-gold/50 text-muted-foreground hover:text-gold"
            title="Open Scene Framework"
          >
            Scene Framework <ChevronsRight size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activePage ? (
            <RichEditor
              key={activePage.id}
              value={activePage.content}
              onChange={(html) => activeChapter && updatePageContent(activeChapter.id, activePage.id, html)}
              placeholder="Begin where the world cracks open..."
            />
          ) : (
            <EmptyEditor onAdd={addChapter} />
          )}
        </div>

        {activePage && (
          <div className="border-t border-border px-6 py-2 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
            <div>{words.toLocaleString()} words</div>
            <div>Ch. {chapters.findIndex(c=>c.id===activeChapterId)+1} · Page {pageNumber} of {activeChapter?.pages.length}</div>
          </div>
        )}
      </div>

      <ScenePanel open={sceneOpen} onClose={() => setSceneOpen(false)} floating />
    </div>
  );
}

function EmptyEditor({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="h-full grid place-items-center text-center px-6">
      <div className="max-w-md space-y-4">
        <h2 className="font-display text-3xl text-foreground">Your page is blank.</h2>
        <p className="text-muted-foreground">That's where all stories begin.</p>
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-md bg-gold text-background hover:bg-gold/90 font-display"
        >
          Start your first chapter
        </button>
      </div>
    </div>
  );
}
