import App from './app';

import 'dotenv/config';
import config from './config';
const {PORT} = config;

import PostsController from './posts/posts.controller';
import AuthenticationController from './authentication/authentication.controller';
import UserController from './users/user.controller';
import AddressController from './address/address.controller';
import CategoriesController from './categories/categories.controller';

const app = new App(
  [
    new PostsController(),
    new AuthenticationController(),
    new UserController(),
    new AddressController(),
    new CategoriesController()
  ],
  PORT || 5000,
);
 
app.listen();

export default app;