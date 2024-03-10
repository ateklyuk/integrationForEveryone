import {Router} from "express";
import {dealController} from "../Api/dealController";
import authorizationController from "../Api/authorizationController";

const router = Router()

router.get("/login", authorizationController.login)
router.get("/logout", authorizationController.logout)
router.post("/changedeal", dealController)
export default router