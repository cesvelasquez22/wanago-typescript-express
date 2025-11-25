import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";

import { AppDataSource } from "../data-source";
import NotFoundException from "../exceptions/NotFoundException";

import Category from "./category.entity";
import CreateCategoryDto from "./category.dto";

class CategoriesController implements Controller {
    public path = '/categories';
    public router = Router();
    private categoryRepository = AppDataSource.getRepository(Category);

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, this.getAllCategories);
        this.router.get(`${this.path}/:id`, this.getCategoryById);
        this.router.post(this.path, this.createCategory);
    }

    private getAllCategories = async (request: Request, response: Response) => {
        const categories = await this.categoryRepository.find({ relations: ['posts'] });
        response.send(categories);
    }

    private getCategoryById = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const category = await this.categoryRepository.findOne({where: {id}, relations: ['posts']});
        if (category) {
            response.send(category);
        } else {
            next(new NotFoundException(Number(id)));
        }
    }

    private createCategory = async (request: Request, response: Response) => {
        const categoryData: CreateCategoryDto = request.body;
        const newCategory = this.categoryRepository.create(categoryData);
        await this.categoryRepository.save(newCategory);
        response.send(newCategory);
    }
}

export default CategoriesController;