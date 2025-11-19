import { Router, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import Post from "../posts/post.entity";
import NotAuthorizedException from "../exceptions/NotAuthorizedException";
import authMiddleware from "../middleware/auth.middleware";
import { AppDataSource } from "../data-source";

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private postRepository = AppDataSource.getRepository(Post);

    constructor() {
        this.initializeRoutes();
    }

    public async initializeRoutes() {
        // this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsByUser);
        this.router.get(`${this.path}/posts`, authMiddleware, this.getAllPostsByUser);
    }

    private getAllPostsByUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        // const id = request.params.id;
        if (request.user) {
            const posts = await this.postRepository.find({
                where: {
                    author: { id: request.user.id }
                },
                relations: ['categories', 'author'],
            });
            const sanitizedPosts = posts.map(post => {
                if (post.author) {
                    const { password, ...userWithoutPassword } = post.author;
                    return { ...post, author: userWithoutPassword };
                }
                return post;
            });
            response.send(sanitizedPosts);
        }
        next(new NotAuthorizedException())
    }
}

export default UserController;