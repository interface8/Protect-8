import { OAuth2Client } from "google-auth-library";

let googleClient: OAuth2Client | null = null;
let googleClientId: string | null = null;

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    throw new Error("Google sign-in is not configured");
  }

  if (!googleClient || googleClientId !== clientId) {
    googleClient = new OAuth2Client(clientId);
    googleClientId = clientId;
  }

  return { client: googleClient, clientId };
}

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

  const { client, clientId } = getGoogleClient();

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
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