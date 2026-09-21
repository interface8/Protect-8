import { compare, hash } from "bcryptjs";
import * as userRepo from "./repository";
import type {
  CreateEmergencyContactInput,
  CreateUserInput,
  EmergencyContactDto,
  UpdateUserInput,
  UserDto,
  UserFilters,
} from "./types";

export async function listUsers(filters: UserFilters) {
  return userRepo.findUsers(filters);
}

export async function getUserById(id: string) {
  const user = await userRepo.findUserById(id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function createUser(input: CreateUserInput) {
  const role = await userRepo.findRoleById(input.roleId);
  if (!role) throw new Error("Role not found");

  const exists = await userRepo.contactExists({
    email: input.email,
    phone: input.phone,
  });
  if (exists) throw new Error("Email or phone already in use");

  const passwordHash = await hash(input.password, 12);

  return userRepo.createUser({
    ...input,
    password: passwordHash,
  });
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const existing = await userRepo.findUserById(id);
  if (!existing) throw new Error("User not found");

  if (input.roleId) {
    const role = await userRepo.findRoleById(input.roleId);
    if (!role) throw new Error("Role not found");
  }

  if (input.email || input.phone) {
    const exists = await userRepo.contactExists(
      {
        email: input.email,
        phone: input.phone,
      },
      id,
    );
    if (exists) throw new Error("Email or phone already in use");
  }

  const data: UpdateUserInput = { ...input };
  if (input.password) {
    data.password = await hash(input.password, 12);
  }

  return userRepo.updateUser(id, data);
}

export async function deleteUser(id: string) {
  const user = await userRepo.findUserById(id);
  if (!user) throw new Error("User not found");
  return userRepo.deleteUser(id);
}

export async function verifyCredentials(
  identifier: string,
  password: string,
): Promise<UserDto | null> {
  const user = await userRepo.findUserByIdentifier(identifier);
  if (!user || !user.isActive || !user.password) return null;

  const valid = await compare(password, user.password);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
    authProvider: user.authProvider,
    providerId: user.providerId,
  };
}

export async function listEmergencyContacts(
  userId: string,
): Promise<EmergencyContactDto[]> {
  return userRepo.listEmergencyContacts(userId);
}

export async function addEmergencyContact(
  userId: string,
  input: CreateEmergencyContactInput,
): Promise<EmergencyContactDto> {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");

  return userRepo.createEmergencyContact(userId, input);
}

export async function removeEmergencyContact(
  userId: string,
  contactId: string,
): Promise<void> {
  const contact = await userRepo.findEmergencyContactById(contactId, userId);
  if (!contact) throw new Error("Emergency contact not found");

  await userRepo.deleteEmergencyContact(contactId, userId);
}

export async function getEmergencyContactsForUser(
  userId: string,
): Promise<EmergencyContactDto[]> {
  return userRepo.listEmergencyContacts(userId);
}

export async function setUserAvatar(
  userId: string,
  avatarUrl: string,
): Promise<UserDto> {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");

  return userRepo.updateUser(userId, { avatarUrl });
}

export const userService = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyCredentials,
  listEmergencyContacts,
  addEmergencyContact,
  removeEmergencyContact,
  getEmergencyContactsForUser,
  setUserAvatar,
};