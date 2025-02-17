import { NextFunction, RequestHandler } from 'express';
import RequestWithUser from './requestWithUser.interface';

interface RequestHandlerWithUser extends RequestHandler {
  (request: RequestWithUser, response: Response, next: NextFunction): any;
}

export default RequestHandlerWithUser;