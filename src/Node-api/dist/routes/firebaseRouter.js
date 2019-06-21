"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class firebaseRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    init() {
        /* this.router.get('/', this.getAll);
        this.router.get('/:id', this.getOne); */
    }
    getAllUsers(req, res, next) {
    }
}
exports.firebaseRouter = firebaseRouter;
