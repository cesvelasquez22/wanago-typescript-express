import HttpException from "./HttpException";

class SessionExpiredException extends HttpException {
  constructor() {
    super(401, "This session has expired. Please login");
  }
}

export default SessionExpiredException;