import axios from "axios";
import {DataType, ErrData, getQuery, LoginRequest, LogoutRequest, Token} from "../types";
import {Response} from "express";
import {config} from "../config";
import {jwtDecode} from "jwt-decode";
import fs from "fs";
import {logger} from "../logger";

export default class Api {
    private refresh_token: string | null = null
    private AUTH_CODE: string | null = null
    private access_token: null | string = null;
    private user_id: null | number = null
    private AMO_TOKEN_PATH: null | string = null
    private ROOT_PATH: null | string = null
    private defaultParams: object = {}
    private defaultTimeout: number = 10000
    private getConfig = (params?: object, timeout?: number) => {
        return {
            params: params ?? this.defaultParams,
            headers: {
                Authorization: `Bearer ${this.access_token}`,
            },
            timeout: timeout ?? this.defaultTimeout
        }
    }
    private createData = (grant_type: string): DataType => {
        const data: DataType = {
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            redirect_uri: config.REDIRECT_URI,
            grant_type: grant_type
        }
        if (grant_type === "refresh_token") {
            data.refresh_token = this.refresh_token
        } else data.code = this.AUTH_CODE
        return data
    }
    public loginHandler = async (req: LoginRequest, res: Response): Promise<Response> => {
        try {
            this.AUTH_CODE = req.query.code
            const ROOT_PATH = `https://${req.query.referer}`
            const token: Token = await axios.post(`${ROOT_PATH}/oauth2/access_token`, this.createData("authorization_code"));
            const decode: { account_id: number } = jwtDecode(token.data.access_token)
            const {account_id} = decode
            const AMO_TOKEN_PATH = `amo_tokens/${String(account_id)}_token.json`;
            fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token.data));
            logger.debug("токен получен")
            return res.status(200).json({message: "Токен получен"})
        } catch (error) {
            logger.error(error)
            return res.status(400).json({message: "Ошибка в запросе"})
        }
    }
    public logoutHandler = (req: LogoutRequest, res: Response): Response => {
        try {
            fs.unlinkSync(`amo_tokens/${req.query.account_id}_token.json`);
            logger.debug("Токен удален")
            return res.status(200).json({message: "Токен удален"})
        } catch (error) {
            logger.error("Нет токена у пользователя", error)
            return res.status(400).json({message: "У этого аккаунта нет токена"})
        }
    }
    private authChecker = <T, U>(request: (args: T) => Promise<U>): ((args: T) => Promise<U>) => {
        return (...args) => {
            return request(...args).catch((err: ErrData) => {
                console.log(err)
                const data = err.response.data;
                if (data.status == 401 && data.title === "Unauthorized") {
                    logger.debug("Нужно обновить токен")
                    return this.refreshToken().then(() => this.authChecker(request)(...args));
                }
                throw err;
            });
        };
    };
    public getTokens = (req: getQuery, res: Response, next: Function): void | Response => {
        if (this.access_token) {
            next()
        }
        try {
            const {id, subdomain} = req.body.account
            this.user_id = Number(id)
            this.ROOT_PATH = `https://${subdomain}.amocrm.ru`
            this.AMO_TOKEN_PATH = `amo_tokens/${String(this.user_id)}_token.json`;
            const content = fs.readFileSync(this.AMO_TOKEN_PATH);
            const token = JSON.parse(content.toString());
            this.access_token = token.access_token;
            this.refresh_token = token.refresh_token;
            logger.debug("Токен успешно получен")
            next()
        } catch (error) {
            logger.error("Некорректный ID или файл с токеном утерян", error)
            return res.status(400).json({message: "Некорректный ID или файл с токеном утерян"})
        }
    }
    public refreshToken = async (): Promise<Token | unknown> => {
        try {
            const AMO_TOKEN_PATH = `amo_tokens/${String(this.user_id)}_token.json`;
            const refresh_token = this.refresh_token;
            const token: Token = await axios.post(`${this.ROOT_PATH}/oauth2/access_token`,this.createData("refresh_token"));
            fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token.data));
            this.access_token = token.data.access_token
            this.refresh_token = token.data.refresh_token
            logger.debug("токен успешно обновлен и записан")
            return token
        } catch (error) {
            return error
        }
    }
    public test = this.authChecker((): Promise<object> => {
        logger.debug("test")
        return axios.get(`${this.ROOT_PATH}/api/v4/contacts/${4975899}?`, this.getConfig()
        )
    })
}