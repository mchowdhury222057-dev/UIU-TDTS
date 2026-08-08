import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { computeInitials, randomAvatarColor } from "../utils/user";
import { canRegisterAsRole } from "./permissions";
import { LoginInput, RegisterInput } from "../validators/auth.validator";

const SALT_ROUNDS = 12;

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  return user;
}

export async function register(input: RegisterInput) {
  if (!canRegisterAsRole(input.role)) {
    throw ApiError.forbidden("You cannot register with this role.");
  }

  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name,
      initials: computeInitials(input.name),
      avatarColor: input.avatarColor || randomAvatarColor(),
      role: input.role,
      department: input.department,
      title: input.title,
      bio: input.bio,
      semester: "Summer 2026",
    },
  });

  return user;
}
