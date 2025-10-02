import {User} from './user-main.model';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  redirectTo?: string;
}
