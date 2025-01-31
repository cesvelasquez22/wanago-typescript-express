import HttpException from "./HttpException";

class InvalidObjectIdException extends HttpException {
    constructor(id: string) {
        super(400, `Invalid id: ${id}`);
    }
}

export default InvalidObjectIdException;