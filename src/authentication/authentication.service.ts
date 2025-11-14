import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
const { JWT_SECRET } = config;

import EmailAlreadyExistsException from "../exceptions/EmailAlreadyExistsException";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import CreateUserDto from "users/user.dto";
import AppDataSource from "../data-source";
import { DataStoredInToken, TokenData } from "../interfaces/token.interface";

import User from "../users/user.entity";
import { CookieOptions } from "express";
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

export default AuthenticationService;