import { Injectable, Output, EventEmitter } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from './user.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Constante } from '../constante/constante'

@Injectable()
export class BackService {

    constructor(private userService: UserService, private toastrService: ToastrService) {}

    public INCREMENT_VALUE: number = 0.05;
    public currentStepReward: number;
    public allParticipants: any[] = [];
    public allParticipantsSubject = new Subject<any[]>();
    public paiementState: string;
    public paiementStateSubject = new Subject<string>();
    public nextStepReward: number;
    public nextStepRewardSubject = new Subject<number>();
    public increment: number;
    public incrementSubject = new Subject<number>();

    /**
     * Permet de propager l'incrément.
     */
    emitIncrement() {
        this.incrementSubject.next(this.increment);
    }

    /**
     * Permet de propager le next step reward.
     */
    emitNextStepReward() {
        this.nextStepRewardSubject.next(this.nextStepReward);
    }
    
    /**
     * Permet de propager l'état de paiement.
     */
    emitPaypal() {
        this.paiementStateSubject.next(this.paiementState);
    }

    /**
     * Permet de propager la liste des participants.
     */
    emitAllParticipants() {
        this.allParticipantsSubject.next(this.allParticipants);
    }

    /**
     * Delay le thread par une promise.
     * @param ms
     */
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Permet de vérifier le token Google recaptcha.
     * @param token 
     * @param url 
     */
    async getTokenVerification(token: string, url: string) {
        try {
            url = url +'?token=' +token;
            const response = await fetch(url);
            const json = await response.json();
            return json;
        } catch (error) { 
            console.error(error);
        }
    }

    /**
     * Effectue un appel à une API.
     */
    async fetchData(url: string) {
        try {
            const response = await fetch(url);
            const json = await response.json();
            return json;
        } catch (error) { 
            console.error(error);
        }
    }

    /**
     * Récupère le captcha image depuis le back.
     * @param url 
     */
    async getCaptchaImageBlob(url: string) {
        const response = await fetch(url);
        const json = await response.json();
        const blob = new Blob([json]);
        return URL.createObjectURL(blob);
    }

    /**
     * Récupère l'adresse email paypal du User.
     * @param userId 
     */
    async getUserById(userId: string) {
        if (userId !== undefined) {
            try {
                let snapshot = await firebase.database().ref('/user').orderByChild('userId').equalTo(userId).once('value');
                if (snapshot.exists()) {
                    const id = Object.keys(snapshot.val())[0];
                    return snapshot.child(id).val();
                } else {
                    throw new Error('User ' +userId +' doesn\'t exist');
                }
            } catch (error) {
                console.error(error);
            }           
        }
        return '';
    }

    /**
     * Insert un utilisateur s'il n'existe pas sinon le mets à jour.
     * @param userId 
     * @param coinsToAdd 
     */
    async insertOrUpdateUser(userId: string, coinsToAdd: number, paypalEmail: string) {
        try {
            if (coinsToAdd === undefined || userId === undefined || paypalEmail === undefined) {
                throw new Error('Arguments are undefined');
            }

            let snapshot = await firebase.database().ref('/user').orderByChild('userId').equalTo(userId).once('value');   
            if (snapshot.exists()) {
                const userKey = Object.keys(snapshot.val())[0];
                const newBalance = snapshot.child(userKey).val().balance + coinsToAdd; 
                await this.updateUser(userKey, newBalance, paypalEmail);
            } else {
                await this.saveUser(coinsToAdd, userId, paypalEmail);
            }    
        } catch (error) {
            console.error(error);
        }  
    }

    /**
     * Mets à jour le montant d'un utilisateur
     * @param userKey 
     * @param balance 
     */
    async updateUser(userKey: string, balance: number, paypalEmail: string) {
        try {
            await firebase.database().ref('/user/' + userKey).update({ 
                'balance': balance,
                'paypalEmail': paypalEmail 
            });
            this.userService.user.balance = balance;
            this.userService.user.paypalEmail = paypalEmail;
            this.userService.emitUser();
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Récupère la valeur de l'incrémenent depuis Firebase.
     */
    async getIncrement() {
        return new Promise<number>((resolve, reject) => {
            firebase.database().ref('/increment').on('value', 
                (data) => {
                    this.increment = data.val().increment;
                    this.emitIncrement();
                    resolve();
                }, (error: any) => {
                    reject(error);
                }
            );
        });
    }

    /**
     * Mets à jour la valeur de l'incrément.
     */
    async setIncrement(value: number) {
        try {
            await firebase.database().ref('/increment').set({ 'increment': value });
            this.increment = value;
            this.emitIncrement();
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Sauvegarde l'utilisateur dans Firebase.
     * @param balance 
     * @param userId 
     */
    saveUser(balance: number, userId: string, paypalEmail: string) {
        const ref = firebase.database().ref('/user').push({ 
            balance: balance,
            userId: userId,
            paypalEmail: paypalEmail
        });
        this.userService.user.balance = balance;
        this.userService.user.paypalEmail = paypalEmail;
        this.userService.emitUser();

        return ref.key;
    }

    /**
     * Permet de sauvegarder un participant sur Firebase.
     * @param userId 
     * @param name 
     * @param amount 
     */
    saveParticipant(userId: string, name: string, amount: number) {
        if (userId !== undefined && name !== undefined && amount !== undefined) {
            const ref = firebase.database().ref('/participant').push({  
                userId : userId,
                name : name,
                amount : amount 
            });
            return ref.key;
        }
    }

    /**
     * Défini le montant minimal en fonction de la présence d'utilisateurs ou on.
     * @param allParticipants Tous les users de Firebase.
     */
    getMinAmount(allParticipants: any[]) {
        if (allParticipants.length > 0) {
            return this.round(allParticipants[0].val().amount + this.increment, 2);
        } else {
            return 0.01;
        }
    }

    /**
     * Récupère tous les step reward depuis Firebase.
     */
    async getNextStepReward() {
        return new Promise<number>((resolve, reject) => {
            firebase.database().ref('/nextStepReward').on('value', 
                (data) => {
                    this.nextStepReward = data.val().nextStepReward;
                    this.emitNextStepReward();
                    resolve();
                }, (error: any) => {
                    reject(error);
                });
        });
    }

    /**
     * Sauvegarde le nouveau next step reward en base.
     * @param value 
     */
    async setNextStepReward(allParticipants: number, step: number) {
        let value: number;
        for (let i = 1; i <= 1000; i++) {
            if ((allParticipants + i) % step === 0) {
                value = allParticipants + i;
                break;
            }
        }
        await firebase.database().ref('/nextStepReward').set({ nextStepReward: value });
    }

  /**
   * Permet de récupérer les utilisateurs depuis Firebase.
   */
    async getAllParticipants() {
        return new Promise<any[]>((resolve, reject) => {
        firebase.database().ref('/participant').orderByChild('amount').on('value', 
            (data) => {
                const bddParticipants = [];
                data.forEach((child) => { bddParticipants.push(child); });
                this.allParticipants = bddParticipants.reverse();
                this.emitAllParticipants();
                resolve();
            }, (error: any) => {
                reject(error);
            });
        });
    }

    /**
     * Détermine si le user est le gagnant ou non.
     * @param refKey 
     */
    isWinner(refKey: string): boolean {
        for (let i = 0; i < this.allParticipants.length; i++) {
            const userPosition = this.allParticipants.length - i;

            if (this.allParticipants[i].key === refKey && userPosition === this.currentStepReward) { // On a bien retrouver ce participant parmis tous les autres.
                //const roundInc = this.round(this.allParticipants[i].val().amount * Constante.INCREMENT_POURCENTAGE, 2);
                //this.setIncrement(roundInc);
                console.log('Gagné !');
                return true;
            }
        }
        return false;
    }

    /**
     * Arrondi un nombre avec une certaine précision.
     * @param value 
     * @param precision 
     */
    round(value: number, precision: number) {
        const multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }
  
}

