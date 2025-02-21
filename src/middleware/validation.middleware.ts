
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import HttpException from '../exceptions/HttpException';
 
function validationMiddleware<T>(type: any, options = { skipMissingProperties: false }): RequestHandler {
  return (req, res, next) => {
    validate(plainToInstance(type, req.body), { skipMissingProperties: options.skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          // const message = errors.map((error: ValidationError) => error.constraints ? Object.values(error.constraints) : []).join(', ');
          const message = errors.map(
            (error: ValidationError) => 
              error.children && error.children?.length > 0 
              ? error.children?.map((child: ValidationError) => Object.values(child.constraints || {})).join(', ') 
              : Object.values(error.constraints || {})).join(', ');
          next(new HttpException(400, message));
        } else {
          next();
        }
      });
  };
}
 
export default validationMiddleware;