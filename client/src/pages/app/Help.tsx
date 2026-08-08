import { BookOpen, ChevronDown, LifeBuoy, Signal } from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    q: "How do I create a new task?",
    a: "Use the Create button in the top bar, or the + icon on any Kanban column, and select New Task. Fill in the title, priority, assignee, and due date.",
  },
  {
    q: "Who can create projects and teams?",
    a: "Only Super Admin and Faculty accounts can create new projects and teams. Team Leaders and Members can create tasks within projects they're connected to.",
  },
  {
    q: "How does the review process work?",
    a: "Submit a completed task for review from the Reviews & Feedback page. A Faculty member, Teaching Assistant, or Super Admin can then approve, request changes, or reject the submission.",
  },
  {
    q: "Why can't I see certain pages?",
    a: "UIU TDTS uses role-based access control. Pages and actions are shown based on your role — Super Admin, Faculty, Teaching Assistant, Team Leader, or Member.",
  },
  {
    q: "How do I change my password?",
    a: "Go to Settings → Security, enter your current password and a new password, then click Update Password.",
  },
];

export function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="font-heading text-xl font-bold text-foreground">Help & Support</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <BookOpen size={18} />
          </div>
          <p className="mt-3 font-heading text-sm font-semibold text-foreground">Documentation</p>
          <p className="mt-1 text-xs text-muted-foreground">Guides for every role and feature in UIU TDTS.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <LifeBuoy size={18} />
          </div>
          <p className="mt-3 font-heading text-sm font-semibold text-foreground">Contact Support</p>
          <p className="mt-1 text-xs text-muted-foreground">Reach the UIU TDTS team for account or access issues.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <Signal size={18} />
          </div>
          <p className="mt-3 font-heading text-sm font-semibold text-foreground">System Status</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> All systems operational
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-2 font-heading text-sm font-semibold text-foreground">Frequently Asked Questions</h3>
        <div className="divide-y divide-border">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-foreground"
              >
                {faq.q}
                <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && <p className="pb-3 text-sm text-muted-foreground">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
