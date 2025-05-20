import express, { Application } from "express";

import bodyParser from "body-parser";

import config from "./config";
const { HOST } = config;

import AppDataSource from "./data-source";

import Controller from "./interfaces/controller.interface";
import { DataSource } from "typeorm";

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
  }

  private initializeErrorHandling() {
    // this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/api", controller.router);
    });
  }

  private async connectToDatabase() {
    try {
      // this.dataSource = new DataSource(AppDataSource);
      await this.dataSource.initialize();
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
