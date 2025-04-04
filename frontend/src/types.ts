export type UserType = 'CUSTOMER' | 'RESTAURANT' | 'COURIER' | 'ADMIN' | undefined;

export interface UserInfo {
  id?: string;
  name: string;
  email: string;
  profileImage?: string;
}