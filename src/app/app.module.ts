import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxPayPalModule } from 'ngx-paypal';
import { MainComponent } from './main/main.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { NgxCaptchaModule } from 'ngx-captcha';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastContainerModule } from 'ngx-toastr';

// ngx-bootstrap
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ModalModule } from 'ngx-bootstrap/modal' ;
 
// Interne files
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from './services/auth.service';
import { BackService } from './services/back.service';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { PaypalModaleComponent } from './paypal-modale/paypal-modale.component';
import { MessageService } from './services/message.service';
import { UserService } from './services/user.service';
import { WinModaleComponent } from './win-modale/win-modale.component';

const toastGlobalConfig = {
  maxOpened: 1,
  autoDismiss: true,
  resetTimeoutOnDuplicate: true
}

const configFirebase = {
  apiKey: 'AIzaSyC2kOi7JfdBfX73WWA2a63ZUloYIqg_k6U',
  authDomain: 'firstwebsite-998f7.firebaseapp.com',
  databaseURL: 'https://firstwebsite-998f7.firebaseio.com',
  projectId: 'firstwebsite-998f7',
  storageBucket: 'firstwebsite-998f7.appspot.com',
  messagingSenderId: '692887605797'
};

@NgModule({
  declarations: [ 
    MainComponent,  
    AppComponent,
    HeaderComponent, 
    FooterComponent, 
    SignupComponent,
    SigninComponent,
    PaypalModaleComponent,
    WinModaleComponent
  ], 
  imports: [
    NgxPayPalModule, 
    FormsModule,
    NgxCaptchaModule,  
    NgbModule,
    HttpClientModule, 
    ReactiveFormsModule, 
    AngularFireAuthModule,  
    AngularFireDatabaseModule, 
    BrowserModule,
    BrowserAnimationsModule,  
    ToastContainerModule,  
    ModalModule.forRoot(),
    ToastrModule.forRoot(toastGlobalConfig),
    MDBBootstrapModule.forRoot(),
    PopoverModule.forRoot(),
    AngularFireModule.initializeApp(configFirebase)
  ],
  schemas: [ 
    NO_ERRORS_SCHEMA 
  ],
  providers:  [ 
    AuthService, 
    BackService,
    MessageService,
    UserService
  ],
  bootstrap: [ 
    AppComponent 
  ],
  entryComponents: [  
    PaypalModaleComponent,
    WinModaleComponent,
    SignupComponent,
    SigninComponent 
  ]
})
export class AppModule { }
