import { NextFunction, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

import config from "../config";
const { JWT_SECRET } = config;
import { DataStoredInToken } from "../interfaces/token.interface";

import WrongAuthTokenException from "../exceptions/WrongAuthTokenException";
import AuthTokenMissingException from "../exceptions/AuthTokenMissingException";
import SessionExpiredException from "../exceptions/SessionExpiredException";

import { AppDataSource } from "../data-source";

import RequestWithUser from "../interfaces/requestWithUser.interface";
import Blacklist from "../authentication/blacklist.entity";
import User from "../users/user.entity";

const blacklistModel = AppDataSource.getRepository(Blacklist);
const userModel = AppDataSource.getRepository(User);

function authMiddleware(options: { omitTwoFactorCheck: boolean } = {omitTwoFactorCheck: false}): RequestHandler {
  return async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const token = request.cookies.Authorization;
    if (token) {
      const blacklist = await blacklistModel.findOneBy({ token });
      if (blacklist) {
        next(new SessionExpiredException());
      }
      const secret = JWT_SECRET || '';
      try {
        const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;
        const { id, twoFactorAuthenticated } = verificationResponse;
        const user = await userModel.findOneBy({id});
        if (user) {
          if (!options.omitTwoFactorCheck && user.isTwoFactorAuthenticationEnabled && !twoFactorAuthenticated) {
            return next(new WrongAuthTokenException());
          } else {
            request.user = user;
            next();
          }
        } else {
          next(new WrongAuthTokenException());
        }
      } catch (error) {
        next(new WrongAuthTokenException());
      }
    } else {
      next(new AuthTokenMissingException());
    }
  }
}

export default authMiddleware;