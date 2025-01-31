import { Router, Request, Response, NextFunction } from "express";
import Controller from "../types/controller";
import userModel from "../users/user.model";
import validationMiddleware from "../middleware/validation.middleware";

import bcrypt from "bcrypt";

import LogInDto from "./login.dto";
import CreateUserDto from "../users/user.dto";
import EmailAlreadyExistsException from "../exceptions/EmailAlreadyExistsException";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";

class AuthenticationController implements Controller {
    public path = '/auth';
    public router = Router();

    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
        this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
    }

    private registration = async (request: Request, respone: Response, next: NextFunction) => {
        const userData: CreateUserDto = request.body;
        const foundUser = await this.user.findOne({ email: userData.email });
        if (foundUser) {
            next(new EmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = new this.user({
                ...userData,
                password: hashedPassword,
            });
            const newUser = await user.save();
            newUser.password = undefined;
            respone.status(201).send(newUser);
        }
    }

    private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOne({ email: logInData.email });
        if (user && user.password) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                user.password = undefined;
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    }
}

export default AuthenticationController;