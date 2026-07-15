export interface User {
  id: number;
  name: string;
  email: string;
  pictureUrl?: string;
  currency: string;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  isProfileCompleted: boolean;
  createdAt: string;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
  profile_completed: string;
  auth_provider: string;
  exp: number;
}
