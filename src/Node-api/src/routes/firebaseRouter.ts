import {Router, Request, Response, NextFunction} from 'express';

export class firebaseRouter {

    private router: Router;

    constructor() { 
        this.router = Router();
        this.init();
    }

    init() {
        /* this.router.get('/', this.getAll);
        this.router.get('/:id', this.getOne); */
    }

    public getAllUsers(req: Request, res: Response, next: NextFunction) {
    
    
    
    }
}
