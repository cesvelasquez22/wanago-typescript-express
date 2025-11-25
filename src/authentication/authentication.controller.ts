import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";

import { AppDataSource } from "../data-source";
import validationMiddleware from "../middleware/validation.middleware";

import LogInDto from "./login.dto";
import CreateUserDto from "../users/user.dto";

import Blacklist from "./blacklist.entity";
import AuthenticationService from "./authentication.service";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import TwoFactorAuthenticationDto from "./two-factor-auth.dto";

class AuthenticationController implements Controller {
    public path = '/auth';
    public router = Router();

    private authenticationService = new AuthenticationService()

    private blacklist = AppDataSource.getRepository(Blacklist);

    constructor() {
        this.initializeRoutes();
    }

    public async initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
        this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
        this.router.post(`${this.path}/2fa/generate`, authMiddleware({omitTwoFactorCheck: true}), this.generateTwoFactorAuthenticationSecret);
        this.router.post(`${this.path}/2fa/turn-on`, authMiddleware({omitTwoFactorCheck: true}), validationMiddleware(TwoFactorAuthenticationDto), this.turnOnTwoFactorAuthentication);
        this.router.post(`${this.path}/2fa/authenticate`, authMiddleware({omitTwoFactorCheck: true}), validationMiddleware(TwoFactorAuthenticationDto), this.secondFactorAuthentication);
    }

    private generateTwoFactorAuthenticationSecret = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        try {
            const user = request.user;
            const {
                otpauthUrl,
                secret
            } = await this.authenticationService.generateTwoFactorAuthenticationSecret(user?.id);
            this.authenticationService.generateQRCode(otpauthUrl, response);
        } catch (error) {
            next(error);
        }
    }

    private turnOnTwoFactorAuthentication = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        try {
            const user = request.user;
            const { twoFactorAuthenticationCode } = request.body;
            await this.authenticationService.turnOnTwoFactorAuthentication(user?.id, twoFactorAuthenticationCode);
            response.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    private secondFactorAuthentication = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        try {
            const { twoFactorAuthenticationCode } = request.body;
            const user = request.user;
            const {
                tokenData,
                // cookie
                cookieOptions
            } = await this.authenticationService.secondFactorAuthenticate(user?.id, twoFactorAuthenticationCode);
            response.cookie('Authorization', tokenData.token, cookieOptions);
            // response.setHeader('Set-Cookie', [cookie]);
            response.sendStatus(200); 
        } catch (error) {
            next(error);
        }
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
            const {password, twoFactorAuthenticationSecret, ...result} = user;
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