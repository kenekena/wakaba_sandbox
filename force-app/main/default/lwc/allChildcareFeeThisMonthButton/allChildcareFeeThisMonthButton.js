import { LightningElement,api } from 'lwc';

import ChildcareCalculation from '@salesforce/apex/AllChildcareFeeThisMonthController.ChildcareCalculation';

/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class allChildcareFeeThisMonthButton extends LightningElement {
    @api recordId;

    affregate(){
        // eslint-disable-next-line no-console
        console.log("集計ボタンを押した");
        
        ChildcareCalculation({ChildcareFeeid : this.recordId})
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