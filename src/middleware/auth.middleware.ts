import { NextFunction, Response } from "express";

import RequestWithUser from "../interfaces/requestWithUser.interface";

import jwt from "jsonwebtoken";

import config from "../config";
import { DataStoredInToken } from "../interfaces/token.interface";
const { JWT_SECRET } = config;

import userModel from "../users/user.model";
import blacklistModel from "../authentication/blacklist.model";
import WrongAuthTokenException from "../exceptions/WrongAuthTokenException";
import AuthTokenMissingException from "../exceptions/AuthTokenMissingException";
import SessionExpiredException from "../exceptions/SessionExpiredException";

  async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
    const token = request.cookies.Authorization;
    if (token) {
      const blacklist = await blacklistModel.findOne({ token });
      if (blacklist) {
        next(new SessionExpiredException());
      }
      const secret = JWT_SECRET;
      try {
        const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;
        const id = verificationResponse._id;
        const user = await userModel.findById(id);
        if (user) {
          request.user = user;
          next();
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

export default authMiddleware;