import { AngularFireAuthModule } from '@angular/fire/auth';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPayPalModule } from 'ngx-paypal';
import { AuthService } from '../services/auth.service';
import { MainComponent } from './main.component';
import { TestBed, ComponentFixture, inject} from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import * as firebase from 'firebase';
import { BackService } from '../services/back.service';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ReCaptchaV3Service } from 'ngx-captcha';

const configFirebase = {
  apiKey: "AIzaSyBwQ6cLdNGU4ZqG9yZ2pRxryumqbfS09I0",
  authDomain: "biblio-cd056.firebaseapp.com",
  databaseURL: "https://biblio-cd056.firebaseio.com",
  projectId: "biblio-cd056",
  storageBucket: "biblio-cd056.appspot.com",
  messagingSenderId: "211635556695"
};


describe('Component paypal', () => {
  
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>; 
  let testBedBackService: BackService;
  let testBedBsModalService: BsModalService;
  let currentUser: any;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      imports:      [ ReactiveFormsModule,
                      FormsModule,
                      NgxCaptchaModule,
                      NgbModule,
                      ModalModule.forRoot(),
                      NgxPayPalModule,
                      AngularFireAuthModule,
                      AngularFireModule,
                      AngularFireModule.initializeApp(configFirebase) ],
      declarations: [ MainComponent ],
      providers:    [ AuthService, BackService, BsModalService, ReCaptchaV3Service] 
    }).compileComponents(); 

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    testBedBackService = TestBed.get(BackService);
    testBedBsModalService = TestBed.get(BsModalService);
    
    firebase.database().ref().remove();
    await firebase.auth().createUserWithEmailAndPassword('test@gmail.com', '123456')
    currentUser = firebase.auth().currentUser;
  });

  afterEach(async() => {
    await currentUser.delete();
  })

  /* it ('Should save and retrieve user from Firebase', async() => {
    await firebase.auth().createUserWithEmailAndPassword('test@gmail.com', '123456');
    const currentUser = firebase.auth().currentUser;

    testBedBackService.saveUser(10, 'toto', currentUser.email);
    testBedBackService.saveUser(11, 'momo', 'momo@gmail.com');
    const allUsers = await testBedBackService.getAllUsers();
    await currentUser.delete();
    
    expect(2).toBe(allUsers.length); 
    expect('momo').toBe(allUsers[0].val().name);
    expect(currentUser.email).toBe(allUsers[1].val().mail);
    expect(10).toBe(allUsers[1].val().amount);
  }); 

  it ('Should get the next step reward', () => {
    expect(5).toBe(testBedBackService.getNextStepReward(3, 5));
    expect(10).toBe(testBedBackService.getNextStepReward(5, 5));
    expect(10).toBe(testBedBackService.getNextStepReward(8, 10));
  });

  it ('Should save next step reward', async() => {
    let promise1 = firebase.database().ref('/stepReward').push({ stepvalue : 5, winnerMail : '', winnerPrice : '', isSend : false, date : '' });
    let promise2 = firebase.database().ref('/stepReward').push({ stepvalue : 10, winnerMail : '', winnerPrice : '', isSend : false, date : '' });
    let promise3 = firebase.database().ref('/stepReward').push({ stepvalue : 15, winnerMail : '', winnerPrice : '', isSend : false, date : '' });
    await Promise.all([promise1, promise2, promise3]);

    let allSteps = await testBedBackService.getAllStepReward();
    expect(3).toBe(allSteps.length);

    const nextStep = testBedBackService.getNextStepReward(15, 5);
    await testBedBackService.saveNextStepReward(allSteps, nextStep);
    allSteps = await testBedBackService.getAllStepReward();
    expect(4).toBe(allSteps.length);
   
    let insertedStep = firebase.database().ref('stepReward').orderByChild('stepvalue').equalTo(20).on('child_added', 
      (data) => {
        expect(20).toBe(data.val().stepvalue);
    });
  });

  it ('Should not be the same key', async() => {
    const keyToto = testBedBackService.saveUser(10, 'toto', 'toto@gmail.com');
    const keyMomo = testBedBackService.saveUser(11, 'momo', 'momo@gmail.com');
    expect(keyToto).not.toBe(keyMomo);
  });

  it ('Should not find the winner', async() => {
    const key = testBedBackService.saveUser(13, 'popo', 'popo@gmail.com');
    let allUsers = await testBedBackService.getAllUsers();
    let allSteps = await testBedBackService.getAllStepReward();
    expect(0).toBe(allSteps.length);
    expect(1).toBe(allUsers.length);

    const nextStep = testBedBackService.getNextStepReward(0, 5);
    await testBedBackService.saveNextStepReward(allSteps, nextStep);
    const userData = testBedBackService.findWinner(key, allUsers, allSteps);
    expect(userData).toBe(undefined);
  });

  it ('Should update the current user', async() => {
    testBedBackService.saveUser(10, 'toto', 'toto@gmail.com');
    testBedBackService.saveUser(11, 'momo', 'momo@gmail.com');
    testBedBackService.saveUser(12, 'zozo', 'zozo@gmail.com');
    testBedBackService.saveUser(13, 'lolo', 'lolo@gmail.com');
    const key = testBedBackService.saveUser(14, 'popo', 'popo@gmail.com');

    let allUsers = await testBedBackService.getAllUsers();
    let allSteps = await testBedBackService.getAllStepReward();
    expect(0).toBe(allSteps.length);
    expect(5).toBe(allUsers.length);

    const nextStep = testBedBackService.getNextStepReward(0, 5);
    await testBedBackService.saveNextStepReward(allSteps, nextStep);
    const userData = testBedBackService.findWinner(key, allUsers, allSteps);
    expect(userData.user.mail).toBe('popo@gmail.com');

    const resultat = await testBedBackService.updateStepReward(10, userData.stepKey, userData.user);
    expect(resultat).toBe('succes');
  });

  it ('Should not update the current user', async() => {
    testBedBackService.saveUser(10, 'toto', 'toto@gmail.com');
    testBedBackService.saveUser(11, 'momo', 'momo@gmail.com');
    testBedBackService.saveUser(12, 'zozo', 'zozo@gmail.com');
    const key = testBedBackService.saveUser(13, 'popo', 'popo@gmail.com');
    testBedBackService.saveUser(14, 'lolo', 'lolo@gmail.com');

    let allUsers = await testBedBackService.getAllUsers();
    let allSteps = await testBedBackService.getAllStepReward();
    expect(0).toBe(allSteps.length);
    expect(5).toBe(allUsers.length);

    const nextStep = testBedBackService.getNextStepReward(0, 5);
    await testBedBackService.saveNextStepReward(allSteps, nextStep);
    const userData = testBedBackService.findWinner(key, allUsers, allSteps);
    expect(userData).not.toBeTruthy();
  }); */

  it ('End to end', async() => {
    let saveUserSpy = spyOn(testBedBackService, 'saveUser').and.callThrough();
    let getAllUsersSpy = spyOn(testBedBackService, 'getAllUsers').and.callThrough();
    let getAllStepSpy = spyOn(testBedBackService, 'getAllStepReward').and.callThrough();
    let getNextStepRewardSpy = spyOn(testBedBackService, 'getNextStepReward').and.callThrough();
    let saveNextStepRewardSpy = spyOn(testBedBackService, 'saveNextStepReward').and.callThrough();
    let findWinnerSpy = spyOn(testBedBackService, 'findWinner').and.callThrough();
    let updateStepRewardSpy = spyOn(testBedBackService, 'updateStepReward').and.callThrough();
    let modalServiceSpy = spyOn(testBedBsModalService, 'show').and.callThrough();

    testBedBackService.saveUser(10, 'toto', 'toto@gmail.com');
    testBedBackService.saveUser(11, 'momo', 'momo@gmail.com');
    testBedBackService.saveUser(12, 'zozo', 'zozo@gmail.com');
    testBedBackService.saveUser(13, 'popo', 'popo@gmail.com');

    component.step = 5;
    await component.ngOnInit();
    await component.ngAfterViewInit();
    component.userName = 'momo';
    component.userAmount = 42;
    await component.payPalConfig.onClick();
    
    expect(saveUserSpy).toHaveBeenCalled();
    expect(getAllUsersSpy).toHaveBeenCalled();
    expect(getAllStepSpy).toHaveBeenCalled();
    expect(getNextStepRewardSpy).toHaveBeenCalled();
    expect(saveNextStepRewardSpy).toHaveBeenCalled();
    expect(findWinnerSpy).toHaveBeenCalled();
    expect(updateStepRewardSpy).toHaveBeenCalled();
    expect(modalServiceSpy).toHaveBeenCalled();
  });
});
