import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";

import { AppDataSource } from "../data-source";
import validationMiddleware from "../middleware/validation.middleware";

import LogInDto from "./login.dto";
import CreateUserDto from "../users/user.dto";

import Blacklist from "./blacklist.entity";
import AuthenticationService from "./authentication.service";

class AuthenticationController implements Controller {
    public path = '/auth';
    public router = Router();

    private authenticationService = new AuthenticationService()

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
        try {
            const userData: CreateUserDto = request.body;
            const {
                user,
                tokenData,
                // cookie
                cookieOptions
            } = await this.authenticationService.register(userData);
            response.cookie('Authorization', tokenData.token, cookieOptions);
            // response.setHeader('Set-Cookie', [cookie]);
            const {password, ...result} = user;
            response.status(201).send(result);
        } catch (error) {
            next(error);
        }
    }

    private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const logInData: LogInDto = request.body;
            const {
                user,
                tokenData,
                // cookie
                cookieOptions
            } = await this.authenticationService.login(logInData);
            response.cookie('Authorization', tokenData.token, cookieOptions);
            // response.setHeader('Set-Cookie', [cookie]);
            const {password, ...result} = user;
            response.send(result);
        } catch (error) {
            next(error);
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
}

export default AuthenticationController;