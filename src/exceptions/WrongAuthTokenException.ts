import HttpException from './HttpException';

class WrongAuthTokenException extends HttpException {
  constructor() {
    super(401, 'Wrong authentication token');
  }
}

export default WrongAuthTokenException;