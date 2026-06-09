import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Globe2, Film, Feather } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: BookOpen, label: "Story Editor", exact: true },
  { to: "/bible", icon: Globe2, label: "World & Character Bible" },
  { to: "/scenes", icon: Film, label: "Scene Framework" },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <TooltipProvider delayDuration={150}>
      <aside className="w-[60px] shrink-0 h-screen border-r border-border bg-surface flex flex-col items-center py-4 gap-2">
        <Link to="/" className="mb-4 grid place-items-center w-10 h-10 rounded-md bg-gold/10 text-gold">
          <Feather size={20} />
        </Link>
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Tooltip key={it.to}>
              <TooltipTrigger asChild>
                <Link
                  to={it.to}
                  className={cn(
                    "w-10 h-10 grid place-items-center rounded-md transition-colors",
                    active
                      ? "bg-gold/15 text-gold"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
                  )}
                >
                  <Icon size={20} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-display">{it.label}</TooltipContent>
            </Tooltip>
          );
        })}
        <div className="mt-auto text-[10px] uppercase tracking-widest text-muted-foreground/60 font-display rotate-180" style={{ writingMode: "vertical-rl" }}>
          Mythos
        </div>
      </aside>
    </TooltipProvider>
  );
}
