import axios from "axios";
import {logger} from "../logger";
import {ErrData, FileData, TestArgs, Token} from "../types";
import User from "../Schemas/User";
import {config} from "../config";


export default new class ApiService {
    private getConfig = (token: string | null | undefined, params?: object, timeout?: number) => {
        return {
            params: params ?? { },
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: timeout ?? 10000
        }
    }
    public getTokens = async (id: number): Promise<string | null | undefined> => {
        const currentUser = await User.findOne({id: id})
        if (!currentUser) {
            logger.debug("Токен не обнаружен")
            logger.debug("Необходимо установить виджет")
            throw new Error("Token not found")
        }
        logger.debug("Токен успешно получен")
        return currentUser?.access_token
    }
    public refreshToken = async (subdomain: string): Promise<string | unknown> => {
        try {
            const currentUser = await User.findOne({subdomain: subdomain})
            const refresh_token = currentUser?.refresh_token
            const root_path = `https://${subdomain}.amocrm.ru`
            const token: Token = await axios.post(`${root_path}/oauth2/access_token`, {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                redirect_uri: config.REDIRECT_URI,
                grant_type: "refresh_token",
                refresh_token: refresh_token
            });
            const data: FileData = token.data
            await User.updateOne(
                {
                    id: currentUser?.id
                },
                {
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                })
            logger.debug("токен успешно обновлен и записан")
            return token.data.access_token
        } catch (error) {
            return error
        }
    }
    public authChecker = <T, U>(request: (...args: T[]) => Promise<U>): ((...args: T[]) => Promise<U>) => {
        return (...args) => {
            return request(...args).catch((err: ErrData) => {
                console.log(err)
                const data = err.response?.data;
                if (data.status == 401 && data.title === "Unauthorized") {
                    logger.debug("Нужно обновить токен")
                    const subdomain = err.response.request.host.split(".")[0]
                    return this.refreshToken(subdomain).then(() => this.authChecker(request)(...args));
                }
                throw err;
            });
        };
    };
    public test = this.authChecker<TestArgs, void>(async ({accountId, subdomain, userId}): Promise<void> => {
        logger.debug("test")
        const access_token: string | null | undefined = await this.getTokens(accountId)
        const root_path = `https://${subdomain}.amocrm.ru`
        await axios.get(`${root_path}/api/v4/contacts/${userId}?`, this.getConfig(access_token))

    })
}