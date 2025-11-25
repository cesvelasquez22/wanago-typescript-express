import HttpException from "./HttpException";

class UserNotFoundException extends HttpException {
    constructor(userId?: string) {
        super(404, userId ? `User with ID ${userId} not found`: 'User not found');
    }
}

export default UserNotFoundException;