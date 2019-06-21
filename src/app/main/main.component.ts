import { OnInit, Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl} from '@angular/forms';
import { BackService } from '../services/back.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { PaypalModaleComponent } from '../paypal-modale/paypal-modale.component';
import { ToastrService } from 'ngx-toastr';
import { AbstractToaster } from '../abstract/AbstractToaster';
import { Subscription, throwError } from 'rxjs';
import { UserService } from '../services/user.service';
import * as firebase from 'firebase';
import { WinModaleComponent } from '../win-modale/win-modale.component';
import { User } from '../models/user.model';
import { Constante } from '../constante/constante'

//declare const Constante: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent extends AbstractToaster implements OnInit, AfterViewInit, OnDestroy {
  
/*
  La gestion des isSend si il y a des centaines d'utilisateur.  
  Le montant gagné à déterminer
  login error code dans une enum
  Le montant mini n'est pas mis à jour quand un user externe ajout un participant.
*/

  constructor(private backService: BackService, 
              private modalService: BsModalService, 
              private reCaptchaV3Service: ReCaptchaV3Service,
              private toastrService: ToastrService,
			  private userService: UserService,
			  private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  private modalConfig = { backdrop: true, ignoreBackdropClick: true, keyboard: false };
  public isDataReceived: boolean = false;
  private form: FormGroup;
  private minAmount: number;
  private subscriptions: Subscription[] = [];
  private nextStepReward: number;
  public allParticipants: any[];
  private paiementState: string;
  private user: User;
  private increment: number;

  /** 
   * Initialisation du template
   */
  async ngAfterViewInit() {
    console.log('ngAfterViewInit - Main');
    //this.googleCaptcha();

  }
    
  /**
   * Initialisation au lancement du component.
   * setNextStepReward() pour démarrer à la valeur du step si aucuns utilisateurs.
   */
  async ngOnInit() {
	console.log('ngOnInit - Main');
	this.initForm();
    this.subscribeToNextStepReward();
	this.subscribeToAllParticipants();
	this.subscribeToIncrement();
    this.subscribeToUser();
   
    await this.backService.getAllParticipants();
	await this.backService.getNextStepReward();
    if (this.allParticipants.length === 0) {
      await this.backService.setNextStepReward(this.allParticipants.length, Constante.STEP);
	}  
	if (this.allParticipants.length <= Constante.STEP) {
		await this.backService.setIncrement(Constante.INCREMENT_DEFAULT);
	}
	await this.backService.getIncrement();
    this.isDataReceived = true;
  }

  /**
   * Lors de la destruction du component.
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  /**
   * Permet d'initialiser le formulaire
   */
  initForm() {
    this.form = new FormGroup({
      'name': new FormControl('', { validators: [ Validators.required,
                                                  Validators.maxLength(40),
                                                  Validators.pattern('^[a-zA-Z0-9]*$')],
                                    updateOn : 'blur'}),
      'amount': new FormControl(this.minAmount)
    });
  }

  /**
  * Méthode de gestion des captcha.
  */
  async googleCaptcha() {
    this.reCaptchaV3Service.execute('6LftnKEUAAAAABgJycS6IiWuwi7tLI-BJfLdUpQ9', 'homepage', async (token) => {
      //console.log('This is your token : ', token);
      const res = await this.backService.getTokenVerification(token, 'http://localhost:3000/captcha/google');
      //console.log('Challenge result : ' +JSON.stringify(res));
    });
}

  /**
   * Permet d'ouvrir la modale Paypal.
   */
  openPaypalModal() {
    this.modalService.show(PaypalModaleComponent, this.modalConfig);
  }

  /**
   * Permet d'ouvrir la modale de win.
   */
  openWinModal() {
    this.modalService.show(WinModaleComponent, this.modalConfig);
  }

  /**
   * Méthode de validation du formulaire de participation. 
   * Insert dans /participant et mets à jour la balance du user.
   * Détermine le gagnant et ouvre la modal.
   */
  async onSubmit() {
    try {
      const amount = this.amount.value;
      const name = this.name.value;
      this.form.reset();

      if (name === null || name === undefined || name.length === 0 || amount === null || amount === undefined || amount.length === 0 ) {
        throw new Error('Form values bad formatted');
      }

      if (this.user.balance >= amount) {
        const refKey = this.backService.saveParticipant(this.user.uid, name, amount);       
		this.backService.currentStepReward = this.nextStepReward;
        this.backService.setNextStepReward(this.allParticipants.length, Constante.STEP); // Apres savePartcipant()
		this.minAmount = this.backService.getMinAmount(this.allParticipants);
		this.amount.setValue(this.minAmount);

        if (refKey !== undefined) {
          this.toastrService.success('', 'Thanks for your participation !');
          let snapshot = await firebase.database().ref('/user').orderByChild('userId').equalTo(this.user.uid).once('value');     
          
          if (snapshot.exists()) {
			const userKey = Object.keys(snapshot.val())[0];
			const balance = this.backService.round(this.user.balance -= amount, 2);
            await this.backService.updateUser(userKey, balance, this.user.paypalEmail);
            if (this.backService.isWinner(refKey)) {
              this.openWinModal();
            }
          }
        }
      } else {
        this.toastrService.warning('', 'You don\'t have enough funds !');
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Listener pour allParticipant. Emis dans le backService. 
   * Le delay evite de mettre le form en erreur pendant une fraction de seconde lors d'une participation.
   */
  subscribeToAllParticipants() {
    this.subscriptions.push(
        this.backService.allParticipantsSubject.subscribe(async (allParticipants: any[]) => {
		this.allParticipants = allParticipants;   
      })
    );
    this.backService.emitAllParticipants();
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
   * Listener du user courant.
   * Pour rafraichir user.balance dans le DOM.
   */
  subscribeToUser(){
    this.subscriptions.push(
        this.userService.userSubject.subscribe(async (user: User) => {
		this.user = user;
		this.changeDetectorRef.detectChanges();
      })
    );
    this.userService.emitUser();
  }

  /**
   * Listener de l'incrément.
   */
  subscribeToIncrement(){
    this.subscriptions.push(
        this.backService.incrementSubject.subscribe(async (increment: number) => {
		this.increment = increment;
		this.minAmount = this.backService.getMinAmount(this.allParticipants);
		this.amount.setValue(this.minAmount);
		console.log('increment', this.increment);
      })
    );
    this.backService.emitIncrement();
  }

  subscribeToPaypal() {
    this.subscriptions.push(
      this.backService.paiementStateSubject.subscribe(async str => {
        this.paiementState = str;
        if (str === 'success') {
          console.log('isuccess fired');
          this.toastrService.success('', 'success');
        } else if (str === 'cancel') {
          this.toastrService.warning('', 'canceled');
        }
      })
    );
  }

  /**
   * Style appliqué si non authentifié
   */
  authStyle() {
    if (!this.user.isAuth) {
     return {
       'opacity': 0.5,
       'pointer-events': 'none' };
   }
   return {};
 }

/**
 * Getter setter pour les champs du formulaire
 */
get name() { return this.form.get('name'); }
get amount() { return this.form.get('amount'); }

}
