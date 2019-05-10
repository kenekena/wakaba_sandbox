import { LightningElement } from 'lwc';

/* 商談レコード情報を作成 */
import { createRecord } from 'lightning/uiRecordApi';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import AccountId_FIELD from '@salesforce/schema/Opportunity.AccountId';
import StageName_FIELD from '@salesforce/schema/Opportunity.StageName';
import CloseDate_FIELD from '@salesforce/schema/Opportunity.CloseDate';

/* メッセージを表示 */
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Sample_CreateOpportunity extends LightningElement {

    /* 商談レコード情報を手打ち */
    Opportunitys = [
        {
            Name: '商談１',
            AccountId : '0010p00000CU3hUAAT',
            StageName: 'Proposal',
            CloseDate: '2019-04-04',
        },
        {
            Name: '商談２',
            AccountId : '0010p00000CU3hUAAT',
            StageName: 'Proposal',
            CloseDate: '2019-04-05',
        },
        {
            Name: '商談３',
            AccountId : '0010p00000CU3hUAAT',
            StageName: 'Proposal',
            CloseDate: '2019-04-06',
        }
    ];

    /* 商談レコード情報を作成 */
    createOpportunity() {
        const fields = [
            {
                "NAME_FIELD.fieldApiName": '商談１',
                "AccountId_FIELD.fieldApiName" : '0010p00000CU3hUAAT',
                "StageName_FIELD.fieldApiName": 'Proposal',
                "CloseDate_FIELD.fieldApiName": '2019-04-04',
            },
            {
                "NAME_FIELD.fieldApiName": '商談２',
                "AccountId_FIELD.fieldApiName" : '0010p00000CU3hUAAT',
                "StageName_FIELD.fieldApiName": 'Proposal',
                "CloseDate_FIELD.fieldApiName": '2019-04-05',
            },
            {
                "NAME_FIELD.fieldApiName": '商談３',
                "AccountId_FIELD.fieldApiName" : '0010p00000CU3hUAAT',
                "StageName_FIELD.fieldApiName": 'Proposal',
                "CloseDate_FIELD.fieldApiName": '2019-04-06',
            }
        ];
        
        
        
        /*
        const fields = {};
        fields[NAME_FIELD.fieldApiName] = '商談３';
        fields[AccountId_FIELD.fieldApiName] = '0010p00000CU3hUAAT';
        fields[StageName_FIELD.fieldApiName] = 'Proposal';
        fields[CloseDate_FIELD.fieldApiName] = '2019-04-06';
        */
        
        const recordInput = { apiName: OPPORTUNITY_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: '成功',
                        message: '商談が作成されました',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'レコード作成エラー',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }


}