import App from './app';
import PostsController from './posts/posts.controller';

import 'dotenv/config';
import config from './config';
const {PORT} = config;

 
const app = new App(
  [
    new PostsController(),
  ],
  PORT || 5000,
);
 
app.listen();