export interface VerifiedAppleUser {
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}

export async function verifyAppleIdentityToken(
  identityToken: string,
): Promise<VerifiedAppleUser> {
  void identityToken;
  throw new Error("Apple sign-in is not yet available");
}