import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { reduceErrors } from 'c/ldsUtils';

import NAME_FIELD from '@salesforce/schema/Contact.Name';
import MEMO_FIELD from '@salesforce/schema/Contact.Memo__c';
import PICTURE_FIELD from '@salesforce/schema/Contact.PhotoURL__c';

const fields = [
    NAME_FIELD,
    MEMO_FIELD,
    PICTURE_FIELD
];

export default class PubsubContactDetails extends LightningElement {
    recordId;

    @track name;
    @track memo;
    @track picture;

    @wire(CurrentPageReference) pageRef;

    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading contact',
                    message: reduceErrors(error).join(', '),
                    variant: 'error'
                })
            );
        } else if (data) {
            this.name = getFieldValue(data, NAME_FIELD);
            this.memo = getFieldValue(data, MEMO_FIELD);
            this.picture = getFieldValue(data, PICTURE_FIELD);
        }
    }

    connectedCallback() {
        registerListener('contactSelected', this.handleContactSelected, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleContactSelected(contactId) {
        this.recordId = contactId;
    }
}