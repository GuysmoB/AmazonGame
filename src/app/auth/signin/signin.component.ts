import { AuthService } from '../../services/auth.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AbstractToaster } from 'src/app/abstract/AbstractToaster';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent extends AbstractToaster implements OnInit, AfterViewInit {
  
  public signInForm: FormGroup;
  
  constructor(public authService: AuthService, 
              public bsModalRef: BsModalRef, 
              private toastrService: ToastrService) { 
    super();
  }
 
  ngOnInit() {
    console.log('ngOnInit - SignIn');
    this.initForm();
  }

  ngAfterViewInit() {}

  /**
   * Initialise le formulaire de connexion.
   */
  initForm() {
    this.signInForm = new FormGroup({
      'email': new FormControl('', {  validators: [Validators.required, Validators.email],
                                      updateOn: 'submit'}),
      'password': new FormControl('', { validators: [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)],
                                        updateOn: 'submit'})
    });
  }

  /**
   * Méthode déclenchée lors de la validation des infos de connexion.
   */
  onSignInSubmit() {
    let msg: string;
    const email = this.email.value;
    const password = this.password.value;
    
    if (this.signInForm.valid) {
      this.authService.signInWithEmailPassword(email, password).then(
        () => {     
          window.setTimeout(this.bsModalRef.hide, this.timeOutModal);
          this.toastrService.success('Logged with success !', '', this.toastrSuccessConfig);
        },
        (error) => {
          if (error.code === 'auth/invalid-email') {
            msg = 'Please provide a valid email adress';
          } else if (error.code === 'auth/user-not-found') {
            msg = 'Sorry this user doesn\'t exist';
          } else if (error.code === 'auth/wrong-password') {
            msg = 'The couple email/password doesn\'t match';
          } else {
            msg = error.message;
          }
          this.toastrService.error(msg, '', this.toastrErrorConfig);
          this.password.reset();
        }
      );
    }
  }

  /**
   * Permet de se connecter avec Facebook
   */
  async signInFacebook() {
    let msg: string;
    await this.authService.signInFacebook().then(
      (res) => {
        window.setTimeout(this.bsModalRef.hide, this.timeOutModal);
        this.toastrService.success('Logged with success !', '', this.toastrSuccessConfig);
    }).catch(
      async (error) => { 
        if (error.code === 'auth/account-exists-with-different-credential') {
          msg = 'An account already exists with the same email address but with a different provider (Facebook, Google or email/password). Please sign in using the provider associated with this email address.';
        } else {
          msg = 'An error occurs with code : ' +error.code;  
        }
        this.toastrService.error(msg, '', this.toastrErrorConfig);
    });
  }

  /**
   * Permet de se connecter avec Google
   */
  async signInGoogle() {
    let msg: string;
    await this.authService.signInGoogle().then(
      (res) => {
        window.setTimeout(this.bsModalRef.hide, this.timeOutModal);
        this.toastrService.success('Logged with success !', '', this.toastrSuccessConfig);
    }).catch(
      (error) => {
        if (error.code === 'auth/account-exists-with-different-credential') {
          msg = 'An account already exists with the same email address but with a different provider (Facebook, Google or email/password). Please sign in using the provider associated with this email address.';
        } else {
          msg = 'An error occurs with code : ' +error.code;  
        }
        this.toastrService.error(msg, '', this.toastrErrorConfig);
    });
  }

  /**
   * Envoi un mail afin de reset le mot de passe
   */
  async sendResetPassword() {
    let msg: string;
    const email = this.email.value;
      if (this.email.valid) {
        await this.authService.sendResetPassword(email).then(
          (res) => {
            this.toastrService.success('Password reset email sent, check your inbox', '', this.toastrSuccessConfig);
        }).catch(
          (error) => {
            if (error.code === 'auth/invalid-email') {
              msg = 'Please provide a valid email adress';
            } else if (error.code === 'auth/user-not-found') {
              msg = 'Sorry this user doesn\'t exist';
            } else {
              msg = error.message;
            }
            this.toastrService.error(msg, '', this.toastrErrorConfig);
          } 
        );
      }
  }

  /**
   * Getter
   */
  get email() { return this.signInForm.get('email'); }
  get password() { return this.signInForm.get('password'); }
}
