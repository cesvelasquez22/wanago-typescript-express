import { NextFunction, Request, Response, Router } from 'express';
import {isValidObjectId} from 'mongoose';

import Post from './post.interface';
import Controller from '../interfaces/controller.interface';

import postModel from './post.model';
import NotFoundException from '../exceptions/NotFoundException';
import InvalidObjectIdException from '../exceptions/InvalidObjectIdException';
import validationMiddleware from '../middleware/validation.middleware';
import CreatePostDto from './post.dto';

class PostsController implements Controller {
  public path = '/posts';
  public router = Router();
  private post = postModel;
 
  constructor() {
    this.initializeRoutes();
  }
 
  public initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.post(this.path, validationMiddleware(CreatePostDto), this.createAPost);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router.patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, { skipMissingProperties: true }),this.modifyPost);
    this.router.delete(`${this.path}/:id`, this.deletePost);
  }
 
  getAllPosts = (request: Request, response: Response) => {
    this.post.find().then(posts => {
      response.send(posts);
    });
  }
 
  createAPost = (request: Request, response: Response) => {
    const post: Post = request.body;
    const createdPost = new postModel(post);
    createdPost.save().then(savedPost => {
      response.status(201).send(savedPost);
    });
  }

  getPostById = (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;
    if (!isValidObjectId(id)) {
      next(new InvalidObjectIdException(id));
      return;
    }
    this.post.findById(id).then((post) => {
      if (post) {
        response.send(post);
      } else {
        next(new NotFoundException(id));
      }
    });
  }

  modifyPost = (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;
    if (!isValidObjectId(id)) {
      next(new InvalidObjectIdException(id));
      return;
    }
    const postData: Post = request.body;
    this.post.findByIdAndUpdate(id, postData, { new: true })
      .then(updatedPost => {
        if (updatedPost) {
          response.send(updatedPost);
        } else {
          next(new NotFoundException(id));
        }
      });
    }

  deletePost = (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;
    if (!isValidObjectId(id)) {
      next(new InvalidObjectIdException(id));
      return;
    }
    this.post.findByIdAndDelete(id).then(hasDeleted => {
      if (hasDeleted) {
        response.sendStatus(200);
      } else {
        next(new NotFoundException(id));
      }
    });
  }
}
 
export default PostsController;