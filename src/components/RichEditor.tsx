import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, Quote, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const exec = (cmd: string, val?: string) => {
  document.execCommand(cmd, false, val);
};

export function RichEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [toolbar, setToolbar] = useState<{ x: number; y: number } | null>(null);

  // Initialize content only once / when switching pages
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder]);

  // also set when value changes from outside (e.g. page switch)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const handleSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !ref.current) {
      setToolbar(null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) {
      setToolbar(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    setToolbar({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const run = (cmd: string, val?: string) => {
    ref.current?.focus();
    exec(cmd, val);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const isEmpty = !value || value === "<br>" || value === "<p></p>";

  return (
    <div className="relative w-full">
      {toolbar && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full flex items-center gap-0.5 rounded-md border border-border bg-popover shadow-lg px-1 py-1"
          style={{ left: toolbar.x, top: toolbar.y }}
        >
          <TbBtn onClick={() => run("bold")} icon={Bold} />
          <TbBtn onClick={() => run("italic")} icon={Italic} />
          <TbBtn onClick={() => run("underline")} icon={Underline} />
          <TbBtn onClick={() => run("strikeThrough")} icon={Strikethrough} />
          <div className="w-px h-5 bg-border mx-1" />
          <TbBtn onClick={() => run("formatBlock", "H1")} icon={Heading1} />
          <TbBtn onClick={() => run("formatBlock", "H2")} icon={Heading2} />
          <TbBtn onClick={() => run("formatBlock", "H3")} icon={Heading3} />
          <TbBtn onClick={() => run("formatBlock", "BLOCKQUOTE")} icon={Quote} />
          <div className="w-px h-5 bg-border mx-1" />
          <TbBtn onClick={() => run("insertUnorderedList")} icon={List} />
          <TbBtn onClick={() => run("insertOrderedList")} icon={ListOrdered} />
        </div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        data-empty={isEmpty}
        className={cn(
          "prose-mythos font-mono text-[15px] leading-[1.85] min-h-[60vh] max-w-3xl mx-auto px-2 py-8 text-foreground",
        )}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
      />
    </div>
  );
}

function TbBtn({ onClick, icon: Icon }: { onClick: () => void; icon: React.ElementType }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="h-8 w-8 grid place-items-center rounded text-foreground/80 hover:bg-surface-elevated hover:text-gold transition-colors"
    >
      <Icon size={14} />
    </button>
  );
}

export function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}
