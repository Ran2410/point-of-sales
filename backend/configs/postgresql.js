import "dotenv/config";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME     || "app_pos",
    process.env.DB_USER     || "postgres",
    process.env.DB_PASSWORD || "",
    {
        host   : process.env.DB_HOST || "localhost",
        dialect: "postgres",
        logging: false,
    }
);

export default sequelize;
