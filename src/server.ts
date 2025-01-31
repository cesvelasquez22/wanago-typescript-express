import App from './app';
import PostsController from './posts/posts.controller';

import 'dotenv/config';
import config from './config';
import AuthenticationController from './authentication/authentication.controller';
const {PORT} = config;

 
const app = new App(
  [
    new AuthenticationController(),
    new PostsController(),
  ],
  PORT || 5000,
);
 
app.listen();