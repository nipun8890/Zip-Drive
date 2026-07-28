export interface UserRegister {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role: "guest" | "host";
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    avatar: any;
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    role: "guest" | "host";
  };
}

export interface User {
  id: number;
  email: string;
  name?: string;
  role: "admin" | "host" | "guest";
  token: string;
  avatar?: string;
}
