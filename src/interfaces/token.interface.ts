import { JwtPayload } from "jsonwebtoken";

interface TokenData {
  token: string;
  expiresIn: number;
}

interface DataStoredInToken {
  id: string;
}

export {TokenData, DataStoredInToken};
