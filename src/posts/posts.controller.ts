import { Request, Response, Router } from 'express';
import Post from './post.interface';
import Controller from '../types/controller';
 
class PostsController implements Controller {
  public path = '/posts';
  public router = Router();
 
  private posts: Post[] = [
    {
      author: 'Marcin',
      content: 'Dolor sit amet',
      title: 'Lorem Ipsum',
    }
  ];
 
  constructor() {
    this.initializeRoutes();
  }
 
  public initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.post(this.path, this.createAPost);
  }
 
  getAllPosts = (request: Request, response: Response) => {
    response.send(this.posts);
  }
 
  createAPost = (request: Request, response: Response) => {
    const post: Post = request.body;
    this.posts.push(post);
    response.send(post);
  }
}
 
export default PostsController;