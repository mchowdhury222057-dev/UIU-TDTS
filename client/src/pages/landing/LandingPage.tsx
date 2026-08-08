import {
  CalendarRange,
  ClipboardCheck,
  Download,
  Gauge,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  Shield,
  Users,
  X,
  FolderKanban,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DEMO_ACCOUNTS } from "../../lib/constants";
import { roleLabel } from "../../lib/roleLabels";

const FEATURES = [
  { icon: LayoutDashboard, title: "Dashboard", desc: "Role-aware overview of everything that matters to you." },
  { icon: FolderKanban, title: "Project Management", desc: "Track courses, deadlines, and progress in one place." },
  { icon: KanbanSquare, title: "Kanban", desc: "Drag-and-drop task boards across 8 workflow stages." },
  { icon: CalendarRange, title: "Gantt Timeline", desc: "Visualize schedules across the whole semester." },
  { icon: Gauge, title: "Performance Analytics", desc: "Scorecards, ratings, and productivity insights." },
  { icon: ClipboardCheck, title: "Review & Feedback", desc: "Structured submission review and approval flow." },
  { icon: Download, title: "Reports & Export", desc: "Export PDF, Excel, and CSV reports on demand." },
  { icon: Shield, title: "Role Management", desc: "Fine-grained, backend-enforced access control." },
  { icon: Users, title: "Team Collaboration", desc: "Teams, comments, and shared task ownership." },
];

const ROLES = ["Super Admin", "Faculty", "Teaching Assistant", "Team Leader", "Member"];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-white">
              T
            </div>
            <span className="font-heading text-base font-bold text-foreground">UIU TDTS</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Roles
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="text-sm font-medium text-foreground hover:text-primary">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-95"
            >
              Get Started
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen((o) => !o)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-foreground">
                Features
              </a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-foreground">
                Roles
              </a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-foreground">
                About
              </a>
              <Link to="/login" className="text-sm font-medium text-foreground">
                Sign In
              </Link>
              <Link to="/signup" className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
        <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-primary">
          Summer 2026 · University of Innovation and Upliftment
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-heading text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
          The Modern Way to Manage University Projects
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          UIU TDTS brings task delegation, team collaboration, and academic project tracking into a single,
          role-aware workspace built for every stakeholder — from members to supervisors.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-95 sm:w-auto"
          >
            Start Free
          </Link>
          <Link
            to="/login"
            className="w-full rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted sm:w-auto"
          >
            Try Demo
          </Link>
        </div>

        {/* Dashboard mockup */}
        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="grid grid-cols-4 gap-3 p-5 text-left sm:grid-cols-4">
            {["Projects", "Teams", "Tasks", "Rating"].map((label, i) => (
              <div key={label} className="rounded-xl border border-border bg-white p-3">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="mt-1 font-heading text-xl font-bold text-foreground">
                  {[48, 12, 320, "4.8★"][i]}
                </p>
              </div>
            ))}
            <div className="col-span-4 mt-1 h-28 rounded-xl bg-gradient-to-r from-amber-100 to-orange-50" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 text-center sm:grid-cols-4 sm:px-6">
          {[
            ["500+", "Members"],
            ["48", "Active Projects"],
            ["3,200+", "Tasks Tracked"],
            ["4.8★", "Average Rating"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-heading text-3xl font-extrabold text-primary">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">Everything your team needs</h2>
          <p className="mt-2 text-muted-foreground">A complete toolkit for delegating and tracking academic project work.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-secondary py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-foreground">Built for Every Role</h2>
          <p className="mt-2 text-muted-foreground">Each role sees exactly what's relevant to them — nothing more.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {ROLES.map((role) => (
              <span key={role} className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground">
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Demo accounts */}
      <section id="about" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">Explore with a demo account</h2>
          <p className="mt-2 text-muted-foreground">Log in instantly as any role to see UIU TDTS in action.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_ACCOUNTS.slice(0, 6).map((account) => (
            <div key={account.email} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{account.name}</p>
                <p className="truncate text-xs text-muted-foreground">{account.email}</p>
              </div>
              <span className="ml-2 shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-primary">
                {roleLabel(account.role)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
            View all demo accounts on the sign-in page →
          </Link>
        </div>
      </section>

      {/* Dark CTA */}
      <section className="bg-gray-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-white">Ready to bring order to your projects?</h2>
          <p className="mt-3 text-gray-400">Join UIU TDTS and start tracking your academic work today.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white sm:w-auto">
              Start Free
            </Link>
            <Link to="/login" className="w-full rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold text-white sm:w-auto">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <p className="text-center text-sm text-muted-foreground">© 2026 UIU TDTS</p>
      </footer>
    </div>
  );
}
