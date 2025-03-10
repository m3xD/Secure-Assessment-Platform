export interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    avatar: string;
    role: "user" | "admin";
  }
  