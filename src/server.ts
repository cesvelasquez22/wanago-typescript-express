import App from './app';

import 'dotenv/config';
import config from './config';

const {PORT} = config;

import PostsController from './posts/posts.controller';

const app = new App(
  [
    new PostsController()
  ],
  PORT || 5000,
);
 
app.listen();

export default app;