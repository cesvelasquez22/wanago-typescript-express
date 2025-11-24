import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
const { JWT_SECRET } = config;

import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

import EmailAlreadyExistsException from "../exceptions/EmailAlreadyExistsException";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import UserNotFoundException from "../exceptions/UserNotFoundException";

import CreateUserDto from "users/user.dto";
import { AppDataSource } from "../data-source";
import { DataStoredInToken, TokenData } from "../interfaces/token.interface";

import User from "../users/user.entity";
import { CookieOptions, Response } from "express";
import LogInDto from "./login.dto";

class AuthenticationService {
    private user = AppDataSource.getRepository(User);

    public async register(userData: CreateUserDto) {
        if (
            await this.user.findOneBy({ email: userData.email })
        ) {
            throw new EmailAlreadyExistsException(userData.email);
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = this.user.create({
            ...userData,
            password: hashedPassword,
        });
        await this.user.save(newUser);
        // user.password = undefined;
        const tokenData = this.createToken(newUser);
        // const cookie = this.createCookie(tokenData);
        const cookieOptions: CookieOptions = {
            maxAge: tokenData.expiresIn * 1000, // would expire after 1 hour
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        };
        // return { user: newUser, tokenData, cookie };
        return { user: newUser, tokenData, cookieOptions };
    }

    public async login(loginData: LogInDto) {
        const user = await this.user.findOneBy({ email: loginData.email });
        if (
            !user || !user.password
        ) {
            throw new WrongCredentialsException();
        }
        const isPasswordMatching = await bcrypt.compare(loginData.password, user.password);
        if (!isPasswordMatching) {
            throw new WrongCredentialsException();
        }
        // user.password = undefined;
        const tokenData = this.createToken(user);
        // const cookie = this.createCookie(tokenData);
        const cookieOptions: CookieOptions = {
            maxAge: tokenData.expiresIn * 1000, // would expire after 1 hour
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        };
        // return { user, tokenData, cookie };
        return { user, tokenData, cookieOptions };
    }

    public createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    public async secondFactorAuthenticate(id: string | undefined, twoFactorAuthenticationCode: string) {
        const user = await this.user.findOneBy({ id });
        if (!user) {
            throw new UserNotFoundException(id);
        }
        const isCodeValid = await this.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, user);
        if (!isCodeValid) {
            throw new WrongCredentialsException();
        }
        const options = { twoFactorAuthenticated: true };
        const tokenData = this.createToken(user, options);
        const cookieOptions: CookieOptions = {
            maxAge: tokenData.expiresIn * 1000, // would expire after 1 hour
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        };
        return { tokenData, cookieOptions };
    }

    // public async generateTwoFactorAuthenticationSecret(user: User) {
    public async generateTwoFactorAuthenticationSecret(userId: string | undefined) {
        const user = await this.user.findOneBy({ id: userId });
        if (!user) {
            throw new UserNotFoundException(userId);
        }
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(
            user.email,
            'MyApp',
            secret,
        );
        user.twoFactorAuthenticationSecret = secret;
        await this.user.save(user);
        return {
            secret,
            otpauthUrl,
        };
    }

    public async turnOnTwoFactorAuthentication(id: string | undefined, twoFactorAuthenticationCode: any) {
        const user = await this.user.findOneBy({ id });
        if (!user) {
            throw new UserNotFoundException(id);
        }
        const isCodeValid = await this.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, user);
        if (!isCodeValid) {
            throw new WrongCredentialsException();
        }
        user.isTwoFactorAuthenticationEnabled = true;
        await this.user.save(user);
    }

    public async generateQRCode(otpauthUrl: string, response: Response) {
        return QRCode.toFileStream(response, otpauthUrl);
    }

    private createToken(
        user: User,
        options: { twoFactorAuthenticated: boolean } = { twoFactorAuthenticated: false },
    ): TokenData {
        const expiresIn = 60 * 60; // an hour
        const secret = JWT_SECRET || 'MY_SUPER_SECRET_KEY';
        const dataStoredInToken: DataStoredInToken = {
            id: user.id,
            twoFactorAuthenticated: options.twoFactorAuthenticated,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }

    private async isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
        return authenticator.verify({
            token: twoFactorAuthenticationCode,
            secret: user.twoFactorAuthenticationSecret,
        });
    }
}

export default AuthenticationService;