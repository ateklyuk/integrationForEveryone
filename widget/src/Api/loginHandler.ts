import {FileData, LoginRequest, Token} from "../types";
import {Response} from "express";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {logger} from "../logger";
import Api from "./api";
import User from "../Schemas/User";

export const loginHandler = async (req: LoginRequest, res: Response): Promise<Response> => {
    try {
        const api = new Api()
        const ROOT_PATH = `https://${req.query.referer}`
        const token: Token = await axios.post(`${ROOT_PATH}/oauth2/access_token`, api.createData("authorization_code", req.query.code));
        const {account_id} = jwtDecode<{account_id: number}>(token.data.access_token)
        const data: FileData = token.data
        data.authorization_code = req.query.code
        data.id = account_id
        data.subdomain = req.query.referer.split(".")[0]
        const newUser = new User(data)
        await newUser.save()
        logger.debug("токен получен")
        return res.status(200).json({message: "Токен получен"})
    } catch (error) {
        logger.error(error)
        return res.status(400).json({message: "Ошибка в запросе"})
    }
}