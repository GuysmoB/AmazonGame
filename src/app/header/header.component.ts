import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SigninComponent } from '../auth/signin/signin.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { AuthService } from '../services/auth.service';
import * as firebase from 'firebase';
import { UserService } from '../services/user.service';
import { BackService } from '../services/back.service';
import { User } from '../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Output() isReady = new EventEmitter<boolean>();
  private modalConfig = { backdrop: true, ignoreBackdropClick: true };
  public user: User;
  private subscriptions: Subscription[] = [];
  
  constructor(private bsModalService: BsModalService,
              private authService: AuthService,
              private backService: BackService,
              private userService: UserService) { }

  /**
   * A l'initialisation du component.
   */
  async ngOnInit() {
    try {
      console.log('ngOnInit - Header');
      this.subscribeToUser();
      await this.updateAuthState();
      this.isReady.emit(true);
    } catch (error) {
      console.error('ngOnInit - error');
    }
  }

  /**
   * Lors de la destruction du component.
   */
  ngOnDestroy(){
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  /**
   * Mets à jour le statut de l'authentification.
   */
  updateAuthState() {
    return new Promise<number>((resolve, reject) => {
      firebase.auth().onAuthStateChanged(
       async (user) => {
          if (user) {
            const userBdd = await this.backService.getUserById(user.uid);
            this.userService.user.isAuth = true;
            this.userService.user.uid = user.uid;
            this.userService.user.balance = userBdd.balance;
            this.userService.user.paypalEmail = userBdd.paypalEmail;
          } else {
            this.userService.user.isAuth = false;
            this.userService.user.uid = '';
            this.userService.user.balance = 0;
            this.userService.user.paypalEmail = '';
          }
          this.userService.emitUser();
          resolve();
        },(error: any) => {
          reject(error);
      });
    });
  }

  /**
   * Ouvre la modale de connexion
   */
  openSignInModal() {
    this.bsModalService.show(SigninComponent, this.modalConfig);
  }

  /**
   * Ouvre la modale de création de compte
   */
  openSignUpModal() {
   this.bsModalService.show(SignupComponent, this.modalConfig);
  }

  /**
   * Permet de se déconnecter.
   */
  async signOut() {
      this.authService.signOut();
  }
   
  /**
   * Listener du user courant.
   */
  subscribeToUser(){
    this.subscriptions.push(
      this.userService.userSubject.subscribe(async (user: User) => {
        this.user = user;
      })
    );
    this.userService.emitUser();
  }
}
