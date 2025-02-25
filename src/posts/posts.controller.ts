import { NextFunction, Request, Response, Router } from 'express';
import {isValidObjectId} from 'mongoose';

import Post from './post.interface';
import Controller from '../interfaces/controller.interface';

import postModel from './post.model';
import NotFoundException from '../exceptions/NotFoundException';
import InvalidObjectIdException from '../exceptions/InvalidObjectIdException';
import validationMiddleware from '../middleware/validation.middleware';
import CreatePostDto from './post.dto';
import authMiddleware from '../middleware/auth.middleware';
import RequestWithUser from 'interfaces/requestWithUser.interface';

class PostsController implements Controller {
  public path = '/posts';
  public router = Router();
  private post = postModel;
 
  constructor() {
    this.initializeRoutes();
  }
 
  public async initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);

    this.router.all(`${this.path}/*`, authMiddleware)
               .patch(`${this.path}/:id`, authMiddleware, validationMiddleware(CreatePostDto, { skipMissingProperties: true }), this.modifyPost)
               .delete(`${this.path}/:id`, authMiddleware, this.deletePost)
               .post(this.path, authMiddleware, validationMiddleware(CreatePostDto), this.createPost);
  }
 
  getAllPosts = (request: Request, response: Response) => {
    this.post.find().populate(
      'author',
      '-password'
    ).then(posts => {
      response.send(posts);
    });
  }
 
  createPost = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const postData: Post = request.body;
    const createdPost = new this.post({
      ...postData,
      author: request.user?._id,
    });
    const savedPost = await createdPost.save();
    await savedPost.populate('author', '-password');
    response.status(201).send(savedPost);
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