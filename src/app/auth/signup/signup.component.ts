import { AuthService } from '../../services/auth.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AbstractToaster } from 'src/app/abstract/AbstractToaster';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent extends AbstractToaster implements OnInit, AfterViewInit {

  public signUpForm: FormGroup;

  constructor(public authService: AuthService, 
              public bsModalRef: BsModalRef, 
              private toastrService: ToastrService) { 
    super();
  }

  ngOnInit() {
    console.log('ngOnInit - SignUp');
    this.initForm();
  }

  ngAfterViewInit() { }

  /**
   * initialise le formulaire de création de compte.
   */
  initForm() {
    this.signUpForm = new FormGroup({
      'email': new FormControl('', {  validators: [Validators.required, Validators.email],
                                      updateOn: 'submit'}),
        'password': new FormControl('', { validators: [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)],
                                          updateOn: 'submit'})
    });
  }

  /**
   * Méthode déclenchée lors de la créarion d'un nouvel utilisateur.
   */
  async onSignUpSubmit() {
    let msg: string;
    const email = this.signUpForm.get('email').value;
    const password = this.signUpForm.get('password').value;
    
    if (this.signUpForm.valid) {
      await this.authService.createUserWithEmailAndPassword(email, password).then(
        () => {
          window.setTimeout(this.bsModalRef.hide, this.timeOutModal);
          this.toastrService.success('Logged with success !', '', this.toastrSuccessConfig);
        },
        (error) => {
          console.log('error code', error.code)
          if (error.code === 'auth/email-already-in-use') {
            msg = 'This email is already used !';
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
   * Getter
   */
  get email() { return this.signUpForm.get('email'); }
  get password() { return this.signUpForm.get('password'); }
}
