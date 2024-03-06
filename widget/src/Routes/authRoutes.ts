import Router from "express";
import Api from "../Api/api";
import {loginHandler} from "../Api/loginHandler";
import {logoutHandler} from "../Api/logoutHandler";

const router = Router()

router.get("/login", loginHandler)
router.get("/logout", logoutHandler)
router.post("/changedeal",(req, res) => {
    const api = new Api()
    api.getTokens(req).then(api.test)
})
export default router