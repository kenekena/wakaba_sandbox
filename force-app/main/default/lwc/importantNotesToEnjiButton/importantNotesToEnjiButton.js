import { LightningElement,api } from 'lwc';

import EnjiUpdate from '@salesforce/apex/ImportantNotesToEnjiController.EnjiUpdate';

/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class ImportantNotesToEnjiButton extends LightningElement {
    @api recordId;

    affregate2(){
        // eslint-disable-next-line no-console
        console.log("反映ボタンを押した");
        
        EnjiUpdate({ImportantNotesid : this.recordId})
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
                        title: '反映できませんでした。',
                        message: '',
                        variant: 'error'
                    })
                );
            });
        
    }
}