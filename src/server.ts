import App from './app';
import PostsController from './posts/posts.controller';
 
const app = new App(
  [
    new PostsController(),
  ],
  5001,
);
 
app.listen();