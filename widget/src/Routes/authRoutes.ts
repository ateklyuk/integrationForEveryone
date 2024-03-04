import Router from "express";
import Api from "../Api/api";

const router = Router()
const api = new Api()

router.get("/login", api.loginHandler)
router.get("/logout", api.logoutHandler)
router.post("/changedeal", api.getTokens, api.test)

export default router