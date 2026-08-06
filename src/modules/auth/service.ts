import { compare, hash } from "bcryptjs";
import type {
  AuthSessionDto,
  LoginInput,
  RefreshInput,
  RegisterInput,
  SendMfaInput,
  VerifyMfaInput,
  ProviderProfile,
} from "./types";
import * as authRepo from "./repository";
import {
  generateMfaCode,
  generateRefreshToken,
  hashMfaCode,
  hashToken,
  signAccessToken,
} from "@/lib/auth/session";
import {
  MFA_CODE_TTL_MINUTES,
  MFA_MAX_ATTEMPTS,
  SUPPORTED_ROLES,
  type AuthProvider,
  type SupportedRole,
} from "@/lib/auth/constants";
import { verifyGoogleIdToken } from "./providers/google";

function assertSupportedRole(role: string): SupportedRole {
  if (!SUPPORTED_ROLES.includes(role as SupportedRole)) {
    throw new Error("Invalid role");
  }

  return role as SupportedRole;
}

function toAuthUser(user: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: { name: string };
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: assertSupportedRole(user.role.name),
  };
}

async function createSession(user: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: { name: string };
}): Promise<AuthSessionDto> {
  const role = assertSupportedRole(user.role.name);

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    phone: user.phone,
    role,
  });

  const refreshToken = generateRefreshToken().token;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await authRepo.createRefreshToken({
    userId: user.id,
    refreshToken,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
    user: toAuthUser(user),
  };
}

async function verifyProviderToken(
  provider: AuthProvider,
  oauthToken: string,
): Promise<ProviderProfile> {
  if (provider === "google") {
    const profile = await verifyGoogleIdToken(oauthToken);

    return {
      provider: "google",
      providerId: profile.providerId,
      name: profile.name || "Google User",
      // Only trust the email if Google says it's verified —
      // otherwise an attacker could claim someone else's email
      // and get auto-matched to their existing account.
      email: profile.emailVerified ? profile.email : null,
      phone: null,
    };
  }

  if (provider === "apple") {
    throw new Error("Apple sign-in is not yet available");
  }

  throw new Error("Unsupported provider");
}

export async function register(input: RegisterInput): Promise<AuthSessionDto> {
  const role = await authRepo.findRoleByName(input.role);
  if (!role) {
    throw new Error("Role not found");
  }

  const existing = await authRepo.findUserByEmailOrPhone({
    email: input.email,
    phone: input.phone,
  });

  if (existing) {
    throw new Error("Account already exists");
  }

  let passwordHash: string | null = null;
  let authProvider: string | null = null;
  let providerId: string | null = null;

  if (input.password) {
    passwordHash = await hash(input.password, 12);
  } else if (input.oauthToken && input.provider) {
    const profile = await verifyProviderToken(input.provider, input.oauthToken);
    authProvider = profile.provider;
    providerId = profile.providerId;
  } else {
    throw new Error("Provide password or OAuth token");
  }

  const user = await authRepo.createUser({
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    password: passwordHash,
    roleId: role.id,
    authProvider,
    providerId,
  });

  return createSession(user);
}

export async function login(input: LoginInput): Promise<AuthSessionDto> {
  if (input.oauthToken && input.provider) {
    const profile = await verifyProviderToken(input.provider, input.oauthToken);

    const user =
      (profile.email ? await authRepo.findUserByEmail(profile.email) : null) ??
      (profile.phone ? await authRepo.findUserByPhone(profile.phone) : null) ??
      (await authRepo.findUserByProvider(profile.provider, profile.providerId));

    if (!user || !user.isActive) {
      throw new Error("Invalid credentials");
    }

    return createSession(user);
  }

  const user = await authRepo.findUserByEmailOrPhone({
    email: input.email,
    phone: input.phone,
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid credentials");
  }

  if (!user.password) {
    throw new Error("Password login not enabled for this account");
  }

  if (!input.password) {
    throw new Error("Password is required");
  }

  const valid = await compare(input.password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  return createSession(user);
}

export async function refresh(input: RefreshInput): Promise<AuthSessionDto> {
  const tokenRecord = await authRepo.findRefreshToken(input.refreshToken);

  if (!tokenRecord || tokenRecord.revokedAt) {
    throw new Error("Invalid refresh token");
  }

  if (tokenRecord.expiresAt.getTime() < Date.now()) {
    throw new Error("Refresh token expired");
  }

  const user = tokenRecord.user;
  if (!user.isActive) {
    throw new Error("Account is inactive");
  }

  const nextRefresh = generateRefreshToken().token;
  const nextRefreshHash = hashToken(nextRefresh);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await authRepo.revokeRefreshToken({
    refreshToken: input.refreshToken,
    replacedByTokenHash: nextRefreshHash,
  });

  await authRepo.createRefreshToken({
    userId: user.id,
    refreshToken: nextRefresh,
    expiresAt,
  });

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    phone: user.phone,
    role: assertSupportedRole(user.role.name),
  });

  return {
    accessToken,
    refreshToken: nextRefresh,
    user: toAuthUser(user),
  };
}

export async function sendMfa(input: SendMfaInput) {
  let user = null;

  if (input.purpose === "login") {
    if (input.email) {
      user = await authRepo.findUserByEmail(input.email);
    } else if (input.phone) {
      user = await authRepo.findUserByPhone(input.phone);
    }
  } else if (input.userId) {
    user = await authRepo.findUserById(input.userId);
  }

  if (!user || !user.isActive) {
    throw new Error("User not found");
  }

  const code = generateMfaCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + MFA_CODE_TTL_MINUTES);

  const challenge = await authRepo.createMfaChallenge({
    userId: user.id,
    purpose: input.purpose,
    channel: input.channel,
    code,
    expiresAt,
    maxAttempts: MFA_MAX_ATTEMPTS,
  });

  if (input.channel === "email") {
    console.log(`Send MFA code ${code} to ${user.email}`);
  } else {
    console.log(`Send MFA code ${code} to ${user.phone}`);
  }

  return {
    challengeId: challenge.id,
    expiresAt,
  };
}

export async function verifyMfa(input: VerifyMfaInput) {
  const challenge = await authRepo.findMfaChallenge(input.challengeId);

  if (!challenge) {
    throw new Error("Invalid MFA challenge");
  }

  if (challenge.usedAt) {
    throw new Error("MFA code already used");
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    throw new Error("MFA code expired");
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    throw new Error("MFA attempts exceeded");
  }

  const submittedHash = hashMfaCode(input.code);

  if (submittedHash !== challenge.codeHash) {
    await authRepo.incrementMfaAttempts(challenge.id);
    throw new Error("Invalid MFA code");
  }

  await authRepo.markMfaUsed(challenge.id);

  return { verified: true };
}