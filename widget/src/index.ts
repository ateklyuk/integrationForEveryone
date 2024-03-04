import express from "express";
import {config} from "./config";
import router from "./Routes/authRoutes";
import Api from "./Api/api";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/", router);
app.listen(config.PORT, () => console.log("Server started on ", config.PORT));





