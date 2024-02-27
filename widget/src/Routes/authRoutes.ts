import Router from "express";
import api from "../Api/api"

const router = Router()


router.get("/login", api.loginHandler)
router.get("/logout", api.logoutHandler)


export default router