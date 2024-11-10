import { Request, Response, Router } from 'express';
import Post from './post.interface';
import Controller from '../types/controller';

import postModel from './post.entity';

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
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router.patch(`${this.path}/:id`, this.modifyPost);
    this.router.delete(`${this.path}/:id`, this.deletePost);
  }
 
  getAllPosts = (request: Request, response: Response) => {
    postModel.find().then(posts => {
      response.send(posts);
    });
  }
 
  createAPost = (request: Request, response: Response) => {
    const post: Post = request.body;
    const createdPost = new postModel(post);
    createdPost.save().then(savedPost => {
      response.send(savedPost);
    });
  }

  getPostById = (request: Request, response: Response) => {
    const id = request.params.id;
    postModel.findById(id).then(post => {
      response.send(post);
    });
  }

  modifyPost = (request: Request, response: Response) => {
    const id = request.params.id;
    const postData: Post = request.body;
    postModel.findByIdAndUpdate(id, postData, { new: true })
      .then(updatedPost => {
        response.send(updatedPost);
      });
    }

  deletePost = (request: Request, response: Response) => {
    const id = request.params.id;
    postModel.findByIdAndDelete(id).then(hasDeleted => {
      if (hasDeleted) {
        response.sendStatus(200);
      } else {
        response.sendStatus(404);
      }
    });
  }
}
 
export default PostsController;