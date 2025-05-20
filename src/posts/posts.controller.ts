import { NextFunction, Request, Response, Router } from 'express';

import Controller from '../interfaces/controller.interface';

import NotFoundException from '../exceptions/NotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import CreatePostDto from './post.dto';
import Post from './post.entity';
import AppDataSource from '../data-source';

class PostsController implements Controller {
  public path = '/posts';
  public router = Router();
  private postRepository = AppDataSource.getRepository(Post);
 
  constructor() {
    this.initializeRoutes();
  }
 
  public async initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);

    this.router.all(`${this.path}/*`)
               .patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, { skipMissingProperties: true }), this.modifyPost)
               .delete(`${this.path}/:id`, this.deletePost)
               .post(this.path, validationMiddleware(CreatePostDto), this.createPost);
  }
 
  getAllPosts = async (request: Request, response: Response) => {
    const posts = await this.postRepository.find();
    response.send(posts);
  }
 
  createPost = async (request: Request, response: Response, next: NextFunction) => {
    const postData: Post = request.body;
    const newPost = this.postRepository.create(postData);
    await this.postRepository.save(newPost);
    response.status(201).send(newPost);
  }

  getPostById = async (request: Request, response: Response, next: NextFunction) => {
    const id = Number(request.params.id);
    const post = await this.postRepository.findOne({ where: {id} });
    if (post) {
      response.status(200).send(post);
    } else {
      next(new NotFoundException(id));
    }
  }

  modifyPost = async (request: Request, response: Response, next: NextFunction) => {
    const id = Number(request.params.id);
    const postData: Post = request.body;
    await this.postRepository.update(id, postData);
    const updatedPost = await this.postRepository.findOneBy({ id });
    if (updatedPost) {
      response.status(200).send(updatedPost);
    } else {
      next(new NotFoundException(id));
    }
  }

  deletePost = async (request: Request, response: Response, next: NextFunction) => {
    const id = Number(request.params.id);
    const deleteResponse = await this.postRepository.delete(id);
    if (deleteResponse.raw[1]) {
      response.sendStatus(204)
    } else {
      next(new NotFoundException(id));
    }
  }
}
 
export default PostsController;