import { JwtPayload } from "jsonwebtoken";

interface TokenData {
  token: string;
  expiresIn: number;
}

interface DataStoredInToken {
  id: string;
  twoFactorAuthenticated: boolean;
}

export {TokenData, DataStoredInToken};
