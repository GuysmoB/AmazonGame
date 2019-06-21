import { Injectable } from "@angular/core";
import { User } from "../models/user.model";
import { Subject } from "rxjs";


@Injectable()
export class UserService {

    public user: User;
    public userSubject = new Subject<User>();
    
    constructor() {
        this.user = new User();
    }
  
    /**
     * Propage l'utilisateur courant.
     */
    emitUser() {
      this.userSubject.next(this.user);
    }
}