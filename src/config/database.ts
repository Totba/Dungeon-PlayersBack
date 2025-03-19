import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: 'localhost',
  port: 3306,
  username: 'database',
  password: 'password',
  database: 'database',
  entities: ["src/entities/*.ts"],
  synchronize: true,
  logging: true,
});