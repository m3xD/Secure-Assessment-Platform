export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "student" | "teacher";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (
    name: string,
    email: string,
    password: string,
    role: "student" | "teacher"
  ) => Promise<void>;
}
