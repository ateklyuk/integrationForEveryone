import axios from "axios";
import {DataType, ErrData, FileData, GetQuery, Token} from "../types";
import {config} from "../config";
import {logger} from "../logger";
import User from "../Schemas/User";

export default class Api {

    private defaultParams: object = {}
    private defaultTimeout: number = 10000
    private accountId: number | null | undefined = null
    private root_path: string | null | undefined = null
    private access_token: string | null | undefined = null
    private getConfig = (params?: object, timeout?: number) => {

        return {
            params: params ?? this.defaultParams,
            headers: {
                Authorization: `Bearer ${this.access_token}`,
            },
            timeout: timeout ?? this.defaultTimeout
        }
    }
    public createData = (grant_type: string, optionCode?: any): DataType => {
        const data: DataType = {
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            redirect_uri: config.REDIRECT_URI,
            grant_type: grant_type
        }
        if (grant_type === "refresh_token") {
            data.refresh_token = optionCode
        } else data.code = optionCode
        return data
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
    public getTokens = async (req: GetQuery): Promise<string | null | undefined | unknown> => {
        try {
            const {id, subdomain} = req.body.account
            const currentUser = await User.findOne({id: id})
            this.root_path = `https://${subdomain}.amocrm.ru`
            this.accountId = currentUser?.id
            this.access_token = currentUser?.access_token
            const code = currentUser?.authorization_code
            if (currentUser){
                logger.debug("Токен успешно получен")
                return currentUser?.access_token
            }
            logger.debug("Токен не обнаружен")
            logger.debug("Попытка заново получить токен")
            const token: Token = await axios.post(`${this.root_path}/oauth2/access_token`, this.createData("authorization_code", code));
            const data: FileData = token.data;
            await User.updateOne(
                {
                    id: id
                },
                {
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    subdomain: subdomain
                })
        } catch (error) {
            return error
        }
    }
    public refreshToken = async (): Promise<Token | unknown> => {
        try {
            const currentUser = await User.findOne({id: this.accountId})
            const code = currentUser?.refresh_token
            console.log(this.createData("refresh_token", code))
            const token: Token = await axios.post(`${this.root_path}/oauth2/access_token`, this.createData("refresh_token", code));
            this.access_token = token.data.access_token
            const data: FileData = token.data

            await User.updateOne(
                {
                    id: this.accountId
                },
                {
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                })
            logger.debug("токен успешно обновлен и записан")

            return token
        } catch (error) {
            return error
        }
    }
    public test = this.authChecker((): Promise<object> => {
        logger.debug("test")
        return axios.get(`${this.root_path}/api/v4/contacts/${4975899}?`, this.getConfig()
        )
    })
}