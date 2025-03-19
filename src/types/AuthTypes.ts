import { User } from "./UserTypes";

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "user" | "admin";
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextType {
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  signin: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (
    name: string,
    email: string,
    password: string,
    role: "user" | "admin"
  ) => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<void>;
}
