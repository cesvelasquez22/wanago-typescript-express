import { Request, Response, Router } from "express";

import { AppDataSource } from "../data-source";
import Controller from "../interfaces/controller.interface";

import Address from "./address.entity";

class AddressController implements Controller {
    public path = '/addresses';
    public router = Router();
    private addressRepository = AppDataSource.getRepository(Address);

    constructor() {
        this.initializeRoutes();
    }

    public async initializeRoutes() {
        this.router.get(this.path, this.getAllAddresses);
    }

    private getAllAddresses = async (request: Request, response: Response) => {
        const addresses = await this.addressRepository.find({ relations: ["user"] });
        const sanitizedAddresses = addresses.map(address => {
            if (address.user) {
                const { password, ...userWithoutPassword } = address.user;
                return { ...address, user: userWithoutPassword };
            }
            return address;
        });
        response.send(sanitizedAddresses);
    }
}

export default AddressController;