import { NextFunction, Request, Response, Router } from 'express';

import Controller from '../interfaces/controller.interface';

import AppDataSource from '../data-source';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import NotFoundException from '../exceptions/NotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';

import Post from './post.entity';
import CreatePostDto from './post.dto';

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

    this.router.all(`${this.path}/*`, authMiddleware)
               .patch(`${this.path}/:id`, authMiddleware, validationMiddleware(CreatePostDto, { skipMissingProperties: true }), this.modifyPost)
               .delete(`${this.path}/:id`, authMiddleware, this.deletePost)
               .post(this.path, authMiddleware, validationMiddleware(CreatePostDto), this.createPost);
  }
 
  getAllPosts = async (request: Request, response: Response) => {
    const posts = await this.postRepository.find({ relations: ['categories'] });
    const sanitizedPosts = posts.map(post => {
      if (post.author) {
        const { password, ...userWithoutPassword } = post.author;
        return { ...post, author: userWithoutPassword };
      }
      return post;
    });
    response.send(sanitizedPosts);
  }
 
  createPost = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const postData: Post = request.body;
    const newPost = this.postRepository.create({...postData, author: request.user});
    await this.postRepository.save(newPost);
    const {author, ...result} = newPost;
    // const {password, ...user} = author;
    response.status(201).send(result);
  }

  getPostById = async (request: Request, response: Response, next: NextFunction) => {
    const id = Number(request.params.id);
    const post = await this.postRepository.findOne({ where: {id}, relations: ["categories"] });
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