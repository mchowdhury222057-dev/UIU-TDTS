import type { User } from "../../types";

export function Avatar({ user, size = "md" }: { user: Pick<User, "name" | "initials" | "avatarColor">; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-14 w-14 text-lg",
  }[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-heading font-semibold text-white ${sizeClasses}`}
      style={{ backgroundColor: user.avatarColor }}
      title={user.name}
    >
      {user.initials}
    </div>
  );
}

export function AvatarStack({ users, max = 4 }: { users: Pick<User, "id" | "name" | "initials" | "avatarColor">[]; max?: number }) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((u) => (
        <div key={u.id} className="rounded-full ring-2 ring-white">
          <Avatar user={u} size="sm" />
        </div>
      ))}
      {rest > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-2 ring-white">
          +{rest}
        </div>
      )}
    </div>
  );
}
