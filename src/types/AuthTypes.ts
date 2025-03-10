import { User } from "./UserTypes";

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}


export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextType {
  authState: AuthState;
  signin: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (
    fullName: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  getUser: (id: string, providedToken?: string) => Promise<User>;
  updateUser: (
    id: string,
    fullName: string,
    email: string,
    phone: string,
    role: "user" | "admin",
    providedToken?: string,
  ) => Promise<User>;
  deleteUser: (id: string, providedToken?: string) => Promise<void>;
  refreshToken: (refresh_token: string) => Promise<string>;
  listUsers: (providedToken?: string) => Promise<User[]>;
  createUser: (
    fullName: string,
    email: string,
    phone: string,
    password: string,
    role: "user" | "admin",
    providedToken?: string
  ) => Promise<User>;
}
