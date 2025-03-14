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
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  signin: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (
    fullName: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  refreshToken: (refresh_token: string) => Promise<string>;
}
