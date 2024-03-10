import { LoginRequest, LogoutRequest } from "../types";
import { Response } from "express";
import authorizationService from "./authorizationService";

export default new class AuthorizationController {
    public login = async (req: LoginRequest, res: Response): Promise<Response> => {
        try {
            const code = req.query.code
            const referer = req.query.referer
            await authorizationService.loginHandler(code, referer)
            return res.status(200).json({message: "Токен получен"})
        } catch (error) {
            return res.status(400).json({message: "Ошибка в запросе", error: error})
        }
    }
    public logout = async (req: LogoutRequest, res: Response): Promise<Response> => {
        try {
            const account_id = req.query.account_id
            await authorizationService.logoutHandler(account_id)
            return res.status(200).json({message: "Токен удален"})
        } catch (error) {
            return res.status(400).json({message: "У этого аккаунта нет токена", error: error})
        }
    }
}