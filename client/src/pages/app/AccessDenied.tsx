import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ShieldAlert size={28} />
      </div>
      <h1 className="font-heading text-xl font-bold text-foreground">Access Denied</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        You do not have permission to view this page. If you believe this is a mistake, contact your Super Admin.
      </p>
      <Link to="/app/dashboard" className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
        Back to Dashboard
      </Link>
    </div>
  );
}
