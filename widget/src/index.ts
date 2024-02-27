import express from "express";
import {config} from "./config";
import router from "./Routes/authRoutes";
import api from "./Api/api";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/", api.getTokens, router);
app.listen(config.PORT, () => console.log("Server started on ", config.PORT));





