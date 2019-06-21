import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BackService } from '../services/back.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Subject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Amazon } from '../enum';
import * as firebase from 'firebase';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-win-modale',
  templateUrl: './win-modale.component.html',
  styleUrls: ['./win-modale.component.scss']
})
export class WinModaleComponent implements OnInit, OnDestroy {
  
  private emailToSend: string;
  private captchaText: string;
  private captchaResult: string;
  private captchaData: SafeHtml;
  public workflow: string;
  private lastStep: string;
  private form: FormGroup;
  private amazonArray = [this.amazon.CA,this.amazon.COM, this.amazon.DE, this.amazon.FR, this.amazon.IT, this.amazon.IN, this.amazon.JP, this.amazon.ES, this.amazon.UK];

  // constante
  private TIMELEFT: number = 60;
  public STEP_CAPTCHA: string = 'STEP_CAPTCHA';
  public STEP_EMAIL: string = 'STEP_EMAIL';
  public STEP_INFO: string = 'STEP_INFO';
  public STEP_WRONG_CAPTCHA: string = 'STEP_WRONG_CAPTCHA';
  public STEP_EXIT: string = 'STEP_EXIT';

  // Observable
  private isTimeOut: boolean = false;
  private isTimeOutSubject = new Subject<boolean>();
  private nextStepReward: number;
  private user: User;
  private subscriptions: Subscription[] = [];
  
  constructor(public bsModalRef: BsModalRef, 
              public backService: BackService,
              private sanitizer: DomSanitizer,
              private userService: UserService,
              private toastrService: ToastrService) { }

  /**
   * Initialisation du component.
   */
  ngOnInit() {
    this.subscribeToNextStepReward();
    this.subscribeToTimer();
    this.subscribeToUser();
    this.initForm();
    this.setWorkflow(this.STEP_CAPTCHA);
    if (this.workflow === this.STEP_CAPTCHA) {
      this.startTimer();
    }
    this.getCaptcha();
  }

  /**
   * Lors de la destruction du component.
   */
  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  /**
   * Initialisation du formulaire.
   */
  initForm() {
    this.form = new FormGroup({
      'email': new FormControl('', {  validators: [ Validators.required,
                                                    Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')],
                                      updateOn : 'blur'}),
      'amazonSite': new FormControl('', [Validators.required])
    });
  }

  /**
   * Listener du timer.
   */
  emitTimeOut() {
    this.isTimeOutSubject.next(this.isTimeOut);
  }

  /**
   * Confirmation pour quitter la modale.
   */
  confirm() {
    this.bsModalRef.hide();
  }

  /**
   * Déclinaison pour quitter la modale.
   */
  decline() {
    this.workflow = this.lastStep;
  }

  /**
   * Déclenché par la soumission du formulaire.
   */
  onSubmit() {
    try {
      if (this.email.value == null || this.email.value == undefined || this.amazonSite.value == null || this.amazonSite.value == undefined) {
        throw new Error('Form values bad formatted');
      }

      const today = new Date();
      const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

      firebase.database().ref('/winner').push({ 
        stepValue: this.backService.currentStepReward,
        paypalEmail: this.user.paypalEmail,
        email: this.email.value, 
        site: this.amazonSite.value,
        price: 4000, 
        isSend: false, 
        date: date +' ' +time 
      });

      this.setWorkflow(this.STEP_INFO);
    } catch(error) {
      console.error(error);
    }
  }

  /**
   * Déclenche le compteur du captcha.
   */
  startTimer() {
    setInterval(() => {
      if (this.TIMELEFT > 0) {
        this.TIMELEFT--;
      } else {
        this.isTimeOut = true;
        this.emitTimeOut();
      }
    }, 1000);
  }

  /**
   * Appel à l'api captcha svg
   */
  async getCaptcha() {
    const res = await this.backService.fetchData('http://localhost:3000/captcha/svg');
    this.captchaText = res.text; 
    this.captchaData = this.sanitizer.bypassSecurityTrustHtml(res.data); 
  }

  /**
   * encodeURIComponent() est utilisé pour échapper le '+' parfois contenu dans le text.
   */
  async getCaptchaResult() {
    let url = 'http://localhost:3000/captcha/svg/result';
    url +='?text=' +encodeURIComponent(this.captchaText) +'&result=' +this.captchaResult;
    const res = await this.backService.fetchData(url);
    if (!res) {
      this.toastrService.warning('', 'Wrong captcha !');
    } else {
      this.setWorkflow(this.STEP_EMAIL);
    }  
  }

  /**
   * Set le workflow ainsi que le last step.
   * @param step 
   */
  setWorkflow(step: string) {
    this.workflow = step;
    this.lastStep = this.workflow;
  }

  /**
   * Listener pour le nextStepReward.
   */
  subscribeToNextStepReward() {
    this.subscriptions.push(
      this.backService.nextStepRewardSubject.subscribe((nextStepReward: number) => {
        this.nextStepReward = nextStepReward;
      })
    );
    this.backService.emitNextStepReward();
  }

  /**
   * Souscrit au listener du timer. 
   */
  subscribeToTimer() {
    this.subscriptions.push(
      this.isTimeOutSubject.subscribe(async (isTimeOut: boolean) => {
        this.isTimeOut = isTimeOut;
        this.setWorkflow(this.STEP_WRONG_CAPTCHA);
        await this.backService.delay(10000);
        this.bsModalRef.hide();
      })
    );
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

  /**
   * Getter
   */
  get email() { return this.form.get('email'); } 
  get amazonSite() { return this.form.get('amazonSite'); }
  get amazon() { return Amazon }










}
