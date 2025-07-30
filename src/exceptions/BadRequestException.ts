import HttpException from "./HttpException";

class BadRequestException extends HttpException {
    constructor(message: string = "Bad Request: Some data mismatch") {
        super(400, message);
    }
}

export default BadRequestException;