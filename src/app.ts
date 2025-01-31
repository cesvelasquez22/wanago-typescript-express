import express, { Application } from "express";
import bodyParser from "body-parser";
import Controller from "./types/controller";

import config from "./config";
const { MONGO_URI, HOST } = config;

import mongoose from "mongoose";
import errorMiddleware from "./middleware/error.middleware";

class App {
  public app: Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/api", controller.router);
    });
  }

  private connectToDatabase() {
    mongoose.connect(MONGO_URI);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${HOST}/${this.port}`);
    });
  }
}

export default App;
