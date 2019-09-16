import { LightningElement,api } from 'lwc';

import AttendanceCounting from '@salesforce/apex/AttendanceCountController.AttendanceCounting';

/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class AttendanceCountButton extends LightningElement {
    @api recordId;

    affregate(){
        // eslint-disable-next-line no-console
        console.log("集計ボタンを押した");
        
        AttendanceCounting({ImportantNotesid : this.recordId})
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: '成功しました。',
                        message: '',
                        variant: 'success'
                    })
                );
            })
            .catch(() => {
                //ポップアップでエラーメッセージを出す
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: '集計できませんでした。',
                        message: '',
                        variant: 'error'
                    })
                );
            });
        
    }
}