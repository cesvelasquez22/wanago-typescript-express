import { Router, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import RequestWithUser from "../interfaces/requestWithUser.interface";
// import postModel from "../posts/post.model";
import NotAuthorizedException from "../exceptions/NotAuthorizedException";
import authMiddleware from "../middleware/auth.middleware";

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    // private post = postModel;

    constructor() {
        this.initializeRoutes();
    }

    public async initializeRoutes() {
        this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsByUser);
    }

    private getAllPostsByUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        // const id = request.params.id;
        // if (request.user && id && id === request.user._id.toString()) {
        //     const posts = await this.post.find({ author: id });
        //     response.send(posts);
        // }
        // next(new NotAuthorizedException())
    }
}

export default UserController;