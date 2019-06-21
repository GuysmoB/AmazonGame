import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';


@Injectable()
export class AuthService {

  constructor(public afAuth: AngularFireAuth) { }

  /**
   * Permet de créer un nouvel utilisateur avec email/mot de passe
   * @param email 
   * @param password 
   */
  createUserWithEmailAndPassword(email: string, password: string) {
    return new Promise((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(email, password).then(
        () => {
          resolve();
        },(error) => {
          reject(error);
        });
      });
    }

  /**
   * Connecte un utilisateur avec email/mot de passe.
   * @param email 
   * @param password 
   */
  signInWithEmailPassword(email: string, password: string) {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password).then(
        () => {
          resolve();
        },(error) => {
          reject(error);
        });
    });
  }

  signInGoogle() {
    return new Promise((resolve, reject) => {
      const provider = new firebase.auth.GoogleAuthProvider();
      this.afAuth.auth.signInWithPopup(provider).then(
        () => {
          resolve();
        },(error) => {
          reject(error);
        }
      );
    });
  }

  signInFacebook() {
    return new Promise((resolve, reject) => {
      const provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.auth.signInWithPopup(provider).then(
        () => {
          resolve();
        },(error) => {
          reject(error);
        }
      );
    });
  }

  sendResetPassword(email: string) {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }
  
  async signOut() {
    return this.afAuth.auth.signOut();
  }

}
