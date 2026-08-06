import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not configured");
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface VerifiedGoogleUser {
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}

export async function verifyGoogleIdToken(
  idToken: string,
): Promise<VerifiedGoogleUser> {
  if (!idToken) {
    throw new Error("Invalid Google token");
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
  } catch {
    throw new Error("Invalid Google token");
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.sub) {
    throw new Error("Invalid Google token");
  }

  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (!payload.iss || !validIssuers.includes(payload.iss)) {
    throw new Error("Invalid Google token");
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error("Invalid Google token");
  }

  return {
    providerId: payload.sub,
    email: payload.email ?? null,
    emailVerified: payload.email_verified ?? false,
    name: payload.name ?? null,
  };
}