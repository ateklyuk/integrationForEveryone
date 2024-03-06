import express from "express";
import {config} from "./config";
import router from "./Routes/authRoutes";
import Api from "./Api/api";
import { connect } from "mongoose";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/", router);
const start = async (): Promise<void> => {
    try {
        await connect(config.DB_URI)
        app.listen(config.PORT, () => console.log("Server started on ", config.PORT));

    } catch (e) {

    }
}

start()



