import { JwtPayload } from 'jsonwebtoken';

export interface MyTokenPayload extends JwtPayload {
  sub: number;
  username: string;
}