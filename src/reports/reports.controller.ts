import { NextFunction, Router, Request, Response } from "express";
import Controller from "interfaces/controller.interface";
import userModel from "../users/user.model";

class ReportsController implements Controller {
    public path = '/reports';
    public router = Router();
    private user = userModel;
     
    constructor() {
        this.initializeRoutes();
    }
     
    public initializeRoutes() {
        this.router.get(this.path, this.generateReport);
    }

    private generateReport = async (request: Request, response: Response, next: NextFunction) => {
        const usersByCountry = await this.user.aggregate([
            {
                $match: {
                    'address.country': {
                        $exists: true
                    }
                }
            },
            {
                $group: {
                    _id: {
                        country: '$address.country'
                    },
                    users: {
                        $push: {
                            _id: '$_id',
                            name: '$name'
                        }
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'users._id',
                    foreignField: 'author',
                    as: 'articles'
                }
            },
            {
                $addFields: {
                    amountOfArticles: {
                        $size: '$articles'
                    }
                }
            },
            {
                $sort: {
                    'amountOfArticles': -1
                }
            }
        ]);

        response.send({usersByCountry});
    }
}

export default ReportsController;