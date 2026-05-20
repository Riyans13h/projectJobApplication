export interface AuthUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthResponse extends AuthUser {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
