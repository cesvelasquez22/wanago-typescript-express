
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import Controller from './types/controller';

import config from './config';
const {MONGO_URI, PORT} = config;

import mongoose from 'mongoose';

class App {
  public app: Application;
  public port: number;
 
  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;
 
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
 
  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
  }
 
  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use('/api', controller.router);
    });
  }

  private connectToDatabase() {
    mongoose.connect(MONGO_URI);
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}
 
export default App;