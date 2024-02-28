import axios from "axios";
import querystring from "querystring";
import {ErrData, getQuery, LoginRequest, LogoutRequest, Token} from "../types";
import {Response} from "express";
import {config} from "../config";
import {jwtDecode} from "jwt-decode";
import fs from "fs";

export default new class api {
    private access_token: null | string = null;
    private refresh_token: null | string = null;
    private user_id: null | number = null
    private AMO_TOKEN_PATH: null | string = null
    private ROOT_PATH: null | string = null
    public loginHandler = async (req: LoginRequest, res: Response): Promise<Response> => {
        try {
            const ROOT_PATH = `https://${req.query.referer}`;
            const data = {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                code: req.query.code,
                redirect_uri: config.REDIRECT_URI,
                grant_type: "authorization_code",
            }
            const token: Token = await axios.post(`${ROOT_PATH}/oauth2/access_token`, data);
            const decode: { account_id: number } = jwtDecode(token.data.access_token)
            const {account_id} = decode
            const AMO_TOKEN_PATH = `amo_tokens/${String(account_id)}_token.json`;
            fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token.data));
            return res.status(200).json({message: "Токен получен"})
        } catch (error) {
            return res.status(400).json({message: "Ошибка в запросе"})
        }
    }
    public logoutHandler = (req: LogoutRequest, res: Response): Response => {
        try {
            fs.unlinkSync(`amo_tokens/${req.query.account_id}_token.json`);
            this.access_token = null
            this.refresh_token = null
            this.user_id = null
            this.AMO_TOKEN_PATH = null
            this.ROOT_PATH = null
            return res.status(200).json({message: "Токен удален"})
        } catch (error) {
            return res.status(400).json({message: "У этого аккаунта нет токена"})
        }
    }
    private authChecker = <T, U>(request: (args: T) => Promise<U>): ((args: T) => Promise<U>) => {
        return (...args) => {
            return request(...args).catch((err: ErrData) => {
                const data = err.response.data;
                if (data.status == 401 && data.title === "Unauthorized") {
                    console.log("Нужно обновить токен");
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
            const {accountId, subdomain} = req.query
            this.user_id = accountId
            this.ROOT_PATH = `https://${subdomain}.amocrm.ru`
            this.AMO_TOKEN_PATH = `amo_tokens/${String(this.user_id)}_token.json`;
            const content = fs.readFileSync(this.AMO_TOKEN_PATH);
            const token = JSON.parse(content.toString());
            this.access_token = token.access_token;
            this.refresh_token = token.refresh_token;
            next()
        } catch (error) {
            return res.status(400).json({message: "Некорректный ID или файл с токеном утерян"})
        }
    }

    public refreshToken = async (): Promise<Token | unknown> => {
        try {
            const AMO_TOKEN_PATH = `amo_tokens/${String(this.user_id)}_token.json`;
            const refresh_token = this.refresh_token;
            const data = {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                refresh_token: refresh_token,
                redirect_uri: config.REDIRECT_URI,
                grant_type: "refresh_token",
            }
            const token: Token = await axios.post(`${this.ROOT_PATH}/oauth2/access_token`, data);
            fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token.data));
            this.access_token = token.data.access_token
            this.refresh_token = token.data.refresh_token
            return token
        } catch (error) {
            return error
        }
    }
    public test = this.authChecker((): Promise<object> => {
        return axios.get(`https://${this.ROOT_PATH}/api/v4/contacts/${35435}?${querystring.stringify({
                with: ["leads"]
            })}`, {
                headers: {
                    Authorization: `Bearer ${this.access_token}`,
                }
            }
        )
    })
}