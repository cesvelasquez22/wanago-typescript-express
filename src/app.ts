import express, { Application } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import config from "./config";
const { HOST } = config;

import Controller from "./interfaces/controller.interface";


import { AppDataSource } from "./data-source";

import { DataSource } from "typeorm";
import errorMiddleware from "./middleware/error.middleware";

class App {
  public app: Application;
  public port: number;
  public dataSource: DataSource;

  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;
    this.dataSource = AppDataSource;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  getDataSource() {
    return this.dataSource;
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/api", controller.router);
    });
  }

  private async connectToDatabase() {
    try {
      // this.dataSource = new DataSource(AppDataSource);
      const connection = await this.dataSource.initialize();
      await connection.runMigrations();
      console.log("Connected to the database");
    } catch (error) {
      console.error("Error connecting to the database: ", error);
    }
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${HOST}/${this.port}`);
    });
  }
}

export default App;
