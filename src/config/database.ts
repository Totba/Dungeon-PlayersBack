import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "password",
  database: "donjon",
  entities: ["src/entities/*.ts"],
  synchronize: true,
  logging: true,
});
