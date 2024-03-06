import {LogoutRequest} from "../types";
import {Response} from "express";
import fs from "fs";
import {logger} from "../logger";
import User from "../Schemas/User";

export const logoutHandler = async (req: LogoutRequest, res: Response): Promise<Response> => {
    try {
        await User.deleteOne({id: req.query.account_id})
        logger.debug("Токен удален")
        return res.status(200).json({message: "Токен удален"})
    } catch (error) {
        logger.error("Нет токена у пользователя", error)
        return res.status(400).json({message: "У этого аккаунта нет токена"})
    }
}