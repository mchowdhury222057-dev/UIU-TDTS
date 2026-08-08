import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types";
import { AccessDenied } from "../../pages/app/AccessDenied";

export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <AccessDenied />;
  }
  return <Outlet />;
}
