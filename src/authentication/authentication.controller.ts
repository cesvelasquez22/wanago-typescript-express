import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import config from "../config";
const { JWT_SECRET } = config;

import AppDataSource from "../data-source";
import validationMiddleware from "../middleware/validation.middleware";
import EmailAlreadyExistsException from "../exceptions/EmailAlreadyExistsException";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";

import LogInDto from "./login.dto";
import CreateUserDto from "../users/user.dto";
import { DataStoredInToken, TokenData } from "../interfaces/token.interface";

import User from "../users/user.entity";
import Blacklist from "./blacklist.entity";

class AuthenticationController implements Controller {
    public path = '/auth';
    public router = Router();

    private user = AppDataSource.getRepository(User);
    private blacklist = AppDataSource.getRepository(Blacklist);

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
        this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
    }

    private registration = async (request: Request, response: Response, next: NextFunction) => {
        const userData: CreateUserDto = request.body;
        const foundUser = await this.user.findOneBy({ email: userData.email });
        if (foundUser) {
            next(new EmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = this.user.create({
                ...userData,
                password: hashedPassword,
            });
            await this.user.save(newUser);
            // user.password = undefined;
            const tokenData = this.createToken(newUser);
            response.cookie('Authorization', tokenData.token, {
                maxAge: tokenData.expiresIn * 1000, // would expire after 1 hour
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
            });
            const { password, ...result } = newUser;
            response.status(201).send(result);
        }
    }

    private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOneBy({ email: logInData.email });
        if (user && user.password) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                // user.password = undefined;
                const tokenData = this.createToken(user);
                response.cookie('Authorization', tokenData.token, {
                    maxAge: tokenData.expiresIn * 1000, // would expire after 1 hour
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'none',
                });
                const {password, ...result} = user;
                response.send(result);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    }

    private loggingOut = async (request: Request, response: Response, next: NextFunction) => {
        const token = request.cookies.Authorization;
        if (!token) {
            response.sendStatus(204);
            return;
        }
        const exists = await this.blacklist.findOneBy({ token });
        if (exists) {
            response.sendStatus(204)
            return;
        }
        const newBlacklist = this.blacklist.create({ token });
        await this.blacklist.save(newBlacklist);
        response.setHeader('Clear-Site-Data', '"cookies"');

        response.sendStatus(200);
    }

    private createToken(user: User): TokenData {
        const expiresIn = 60 * 60; // an hour
        const secret = JWT_SECRET || 'MY_SUPER_SECRET_KEY';
        const dataStoredInToken: DataStoredInToken = {
            id: user.id,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }
}

export default AuthenticationController;