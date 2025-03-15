import { z } from "zod";

export const ImageSchema = z.object({
  id: z.string(),
  filename: z.string(),
  size: z.number(),
  tags: z.string().nullable(),
  character: z.string().nullable(),
  aliases: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Image = z.infer<typeof ImageSchema>;

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export const UserRoleEnum = z.nativeEnum(UserRole);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  role: UserRoleEnum,
  banned: z.boolean(),
  banReason: z.string().nullable(),
  banExpires: z.number().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  impersonatedBy: z.string(),
  expiresAt: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;

export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  accessTokenExpiresAt: z.string().nullable(),
  refreshTokenExpiresAt: z.string().nullable(),
  scope: z.string().nullable(),
  idToken: z.string().nullable(),
  password: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Account = z.infer<typeof AccountSchema>;

export const VerificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Verification = z.infer<typeof VerificationSchema>;

export const SettingSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Setting = z.infer<typeof SettingSchema>;

// not need zod schema
export interface Database {
  Image: Image;
  User: User;
  Session: Session;
  Account: Account;
  Verification: Verification;
  Setting: Setting;
}

export type OrderByKeys<TableName extends keyof Database> =
  keyof Database[TableName];
