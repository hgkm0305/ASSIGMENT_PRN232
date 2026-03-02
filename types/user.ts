export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

export interface PublicUser {
  id: number;
  email: string;
}

