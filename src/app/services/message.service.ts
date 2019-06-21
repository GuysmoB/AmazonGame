import { Injectable } from "@angular/core";
import { BackService } from "./back.service";


@Injectable()
export class MessageService {
    
    public STEP_SHOW: string = 'STEP_SHOW';
    public INFO: string = 'INFO';
    public SUCCESS: string = 'SUCCESS';
    public msg: string;
    public msgWorkflow: string;
    public msgStatut: string;

    constructor(private backService: BackService) {}

    async showInfo(msg: string, delay?: number) {
        this.msgWorkflow = this.STEP_SHOW;
        this.msgStatut = this.INFO;
        this.msg = msg;

        if (delay !== undefined) {
            console.log('delay is defined')
            await this.backService.delay(delay);
            this.msgWorkflow = '';
            console.log('should be empty')
        }
    }

    async showSuccess(msg: string, delay?: number) {
        this.msgWorkflow = this.STEP_SHOW;
        this.msgStatut = this.SUCCESS;
        this.msg = msg;

        if (delay !== undefined) {
            await this.backService.delay(delay);
            this.msgWorkflow = '';
        }
    }
}