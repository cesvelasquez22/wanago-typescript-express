import App from './app';
import PostsController from './posts/posts.controller';

import 'dotenv/config';
import config from '../config';
const {MONGO_URI, PORT} = config;

import mongoose from 'mongoose';
 
const app = new App(
  [
    new PostsController(),
  ],
  PORT || 5000,
);

mongoose.connect(MONGO_URI);
 
app.listen();