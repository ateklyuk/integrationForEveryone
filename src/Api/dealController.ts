import {logger} from "../logger";
import ApiService from "./apiService";
import { GetQuery } from "../types"
import { Response } from "express";

export const dealController = async (req: GetQuery, res: Response): Promise<Response | void>  => {
    try {
        const {id, subdomain} = req.body.account
        await ApiService.test({accountId: Number(id), subdomain, userId: 4975899})
    } catch (error) {
        logger.error(error)
        return res.status(400).json({message: "Ошибка при запросе", error: error})
    }
}