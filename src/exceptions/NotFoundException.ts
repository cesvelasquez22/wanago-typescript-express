import HttpException from "./HttpException";

class NotFoundException extends HttpException {
  constructor(id: string) {
    super(404, `Post with id ${id} not found`);
  }
}

export default NotFoundException;
