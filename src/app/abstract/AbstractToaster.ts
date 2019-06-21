export abstract class AbstractToaster {

    protected timeOutModal: number = 3000;
    protected toastrSuccessConfig = { timeOut: 2000 /*disableTimeOut: true*/ };
    protected toastrErrorConfig = { timeOut: 7000, extendedTimeOut: 3000 };

    constructor() {}
}