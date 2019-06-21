import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Amazon } from '../enum';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { BackService } from '../services/back.service';
import { AbstractToaster } from '../abstract/AbstractToaster';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-paypal-modale',
  templateUrl: './paypal-modale.component.html',
  styleUrls: ['./paypal-modale.component.scss']
})
export class PaypalModaleComponent extends AbstractToaster implements OnInit, AfterViewInit, OnDestroy {
  
  constructor(public bsModalRef: BsModalRef, 
              public backService: BackService,
              private userService: UserService) {
    super();
  }

  public workflow: string;
  public STEP_PAYPAL: string = 'STEP_PAYPAL';
  public STEP_TERMS: string = 'STEP_TERMS';
  private form: FormGroup;
  private minAmount: number = 1;
  private coinsToAdd: number;
  private payPalConfig: IPayPalConfig;
  private user: User;
  private subscriptions: Subscription[] = [];
  private isSubmitted: boolean = false;

  /**
   * A l'initialisation du template.
   */
  ngAfterViewInit() {
    console.log('ngAfterViewInit - Paypal modale');
    this.initPaypalConfig(this.amount.value);
  }
 
  /**
   * A l'initialisation du component.
   */
  ngOnInit() {
    console.log('ngOnInit - Paypal modale');
    this.subscribeToUser();
    this.workflow = this.STEP_PAYPAL;
    this.form = new FormGroup({
      'amount': new FormControl('', { validators: [ Validators.required,
                                                    Validators.min(this.minAmount),
                                                    Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$') ],
                                      updateOn: "blur"}),
      'checkbox': new FormControl(false, { validators: [ Validators.requiredTrue ] })
    });
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
   * Initialise la configuration Paypal.
   */
  initPaypalConfig(amount: string): void {
    this.backService.paiementState = '';
    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AXtSh3IMa8SrJRaYbw_rrrxKVL7PXZkOEFGQpTL3la7GRVZqkq2yRBz68Rv3_ICINlanqqrjwzRyoSzn',
      createOrderOnClient: (data) => <ICreateOrderRequest> {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: amount
          }
        }]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('On approve');
      },
      onClientAuthorization: async (data) => {
        console.log('Paiement completed', data);
        await this.backService.insertOrUpdateUser(this.user.uid, this.amount.value, data.payer.email_address);
        this.bsModalRef.hide();
      },
      onCancel: async (data, actions) => {
        console.log('OnCancel', data, actions);
        this.bsModalRef.hide();
      },
      onError: err => {
        console.log('OnError', err); 
        this.bsModalRef.hide();
      },
      onClick: async () => {
        console.log('onClick');
        //await this.backService.insertOrUpdateUser(this.user.uid, this.amount.value, 'fake');
      },
    };
  }

  /**
   * Instructions lors d'une entrée utilisateur.
   */
  async onSubmit() {
    this.initPaypalConfig(this.amount.value);
    await this.backService.delay(1000);
    this.isSubmitted = true;
    this.form.disable();
  } 

  /**
   * Set le workflow 
   */
  showTerms() {
    this.workflow = this.STEP_TERMS;
  }

  /**
   * Set le workflow 
   */
  showPaypal() {
    this.workflow = this.STEP_PAYPAL;
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
   * Style appliqué au bouton Paypal
   */
  ngStylePaypal() {
    if (!this.isSubmitted) {
      return {
        'opacity': 0.4,
        'pointer-events': 'none' 
      };
    }
  }

 /**
  * Getter
  */
  get amount() { return this.form.get('amount'); }
  get checkbox() { return this.form.get('checkbox'); }
  get amazon() { return Amazon }
}
