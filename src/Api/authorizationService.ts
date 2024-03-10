import axios from "axios";
import {FileData, LoginRequest, LogoutRequest, Token} from "../types";
import {config} from "../config";
import {logger} from "../logger";
import User from "../Schemas/User";
import {jwtDecode} from "jwt-decode";

export default new class AuthorizationService {
    public loginHandler = async (code: string, referer: string): Promise<void> => {
        try {
            const ROOT_PATH = `https://${referer}`
            console.log(code)
            console.log(referer)
            const token: Token = await axios.post(`${ROOT_PATH}/oauth2/access_token`, {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                redirect_uri: config.REDIRECT_URI,
                grant_type: "authorization_code",
                code: code
            });
            const {account_id} = jwtDecode<{ account_id: number }>(token.data.access_token)
            const data: FileData = token.data
            data.authorization_code = code
            data.id = account_id
            data.subdomain = referer.split(".")[0]
            data.is_installed = true
            await User.findOneAndUpdate({id: account_id}, data, {upsert: true})
            logger.debug("токен получен")
        } catch (error) {
            logger.error(error)
            throw error
        }
    }
    public logoutHandler = async (account_id: number): Promise<void> => {
        try {
            await User.updateOne(
                {
                    id: account_id
                },
                {
                    is_installed: false,
                    access_token: null,
                    refresh_token: null
                })
            logger.debug("Токен удален")
        } catch (error) {
            logger.error("Нет токена у пользователя", error)
            throw error
        }
    }
}