import { LightningElement,track,wire } from 'lwc';
/* Apexでcontacリストを持ってきて、インライン編集でデータテーブルを作成する */
import getContactList from '@salesforce/apex/ContactController.getContactList';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import TITLE_FIELD  from '@salesforce/schema/Contact.Title';
import ID_FIELD from '@salesforce/schema/Contact.Id';
const cols = [
    { label: 'せい', fieldName: 'FirstName', editable: true },
    { label: 'めい', fieldName: 'LastName', editable: true },
    { label: 'Title', fieldName: 'Title' , editable: true},
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Email', fieldName: 'Email', type: 'email' }
];

/* getListUiを使ってリストビューを呼び出す 
import { getListUi } from 'lightning/uiListApi';
import OBJECT_ImportantNotes from '@salesforce/schema/ImportantNotes__c';
*/

export default class Sample_listViewDatatable extends LightningElement {
    /* Apexでcontacリストを持ってきて、インライン編集でデータテーブルを作成する */
    @track error;
    @track columns = cols;
    @track draftValues = [];
    @wire(getContactList) contact;

    handleSave(event) {

        const fields = {};
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[FIRSTNAME_FIELD.fieldApiName] = event.detail.draftValues[0].FirstName;
        fields[LASTNAME_FIELD.fieldApiName] = event.detail.draftValues[0].LastName;
        fields[TITLE_FIELD.fieldApiName] = event.detail.draftValues[0].Title;
        
        const recordInput = {fields};

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Contact updated',
                    variant: 'success'
                })
            );
            // Clear all draft values
            this.draftValues = [];

            // Display fresh data in the datatable
            return refreshApex(this.contact);
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    /* getListUiを使ってリストビューを呼び出す 
    @wire(getListUi, { objectApiName: OBJECT_ImportantNotes, listViewApiName: 'All' })
    propertyOrFunction;
    */
}