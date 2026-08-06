import type {
  AuthProvider,
  MfaChannel,
  MfaPurpose,
  SupportedRole,
} from "@/lib/auth/constants";

export interface AuthUserDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: SupportedRole;
}

export interface AuthSessionDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}

export interface RegisterInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  oauthToken?: string;
  provider?: AuthProvider;
  role: SupportedRole;
}

export interface LoginInput {
  email?: string;
  phone?: string;
  password?: string;
  oauthToken?: string;
  provider?: AuthProvider;
}

export interface RefreshInput {
  refreshToken: string;
}

export interface SendMfaInput {
  purpose: MfaPurpose;
  channel: MfaChannel;
  userId?: string;
  email?: string;
  phone?: string;
}

export interface VerifyMfaInput {
  challengeId: string;
  code: string;
}

export interface ProviderProfile {
  provider: AuthProvider;
  providerId: string;
  email?: string | null;
  phone?: string | null;
  name: string;
}