import { ChevronDown, FolderPlus, Plus, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCreateOptions } from "../../lib/permissions";
import { CreateProjectModal } from "../modals/CreateProjectModal";
import { CreateTaskModal } from "../modals/CreateTaskModal";
import { CreateTeamModal } from "../modals/CreateTeamModal";

export function CreateMenu({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<"project" | "task" | "team" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;
  const options = getCreateOptions(user);

  const optionMeta = {
    project: { label: "New Project", icon: FolderPlus },
    task: { label: "New Task", icon: Plus },
    team: { label: "New Team", icon: UsersRound },
  } as const;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:brightness-95"
      >
        <Plus size={16} />
        Create
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg">
          {options.map((opt) => {
            const meta = optionMeta[opt];
            return (
              <button
                key={opt}
                onClick={() => {
                  setModal(opt);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-foreground hover:bg-muted"
              >
                <meta.icon size={16} className="text-muted-foreground" />
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        isOpen={modal === "project"}
        onClose={() => setModal(null)}
        onCreated={() => onCreated?.()}
      />
      <CreateTeamModal isOpen={modal === "team"} onClose={() => setModal(null)} onCreated={() => onCreated?.()} />
      <CreateTaskModal isOpen={modal === "task"} onClose={() => setModal(null)} onCreated={() => onCreated?.()} />
    </div>
  );
}
