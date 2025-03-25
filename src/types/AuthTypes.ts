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
  ) => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<{token: string, newRefreshToken: string}>;
}
