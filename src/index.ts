import express from "express"
import {config} from "./config";
import router from "./Routes/clientRoutes";
import { connect } from "mongoose";
import {logger} from "./logger";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/", router);

const start = async (): Promise<void> => {
    try {
        await connect(config.DB_URI)
            .then(() => logger.debug("Connecting to the database has been successful"))
            .catch((err) => logger.debug("Error connecting to the database, error data:", err));
        app.listen(config.PORT, () => console.log("Server started on ", config.PORT));
    } catch (err) {
        logger.debug("Error connecting to the server, error data:", err);
    }
}
start()



