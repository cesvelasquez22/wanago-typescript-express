import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import userModel from "../users/user.model";
import validationMiddleware from "../middleware/validation.middleware";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import LogInDto from "./login.dto";
import CreateUserDto from "../users/user.dto";
import EmailAlreadyExistsException from "../exceptions/EmailAlreadyExistsException";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import { DataStoredInToken, TokenData } from "../interfaces/token.interface";
import User from "../users/user.interface";

import config from "../config";
const { JWT_SECRET } = config;

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

    private registration = async (request: Request, response: Response, next: NextFunction) => {
        const userData: CreateUserDto = request.body;
        const foundUser = await this.user.findOne({ email: userData.email });
        if (foundUser) {
            next(new EmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.user.create({
                ...userData,
                password: hashedPassword,
            });
            user.password = undefined;
            const tokenData = this.createToken(user);
            response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
            response.status(201).send(user);
        }
    }

    private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOne({ email: logInData.email });
        if (user && user.password) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                user.password = undefined;
                const tokenData = this.createToken(user);
                response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    }

    private createToken(user: User): TokenData {
        const expiresIn = 60 * 60; // an hour
        const secret = JWT_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
    }
}

export default AuthenticationController;