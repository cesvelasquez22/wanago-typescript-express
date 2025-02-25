import App from './app';

import 'dotenv/config';
import config from './config';

const {PORT} = config;

import PostsController from './posts/posts.controller';
import AuthenticationController from './authentication/authentication.controller';
import UserController from './users/user.controller';

const app = new App(
  [
    new AuthenticationController(),
    new UserController(),
    new PostsController()
  ],
  PORT || 5000,
);
 
app.listen();