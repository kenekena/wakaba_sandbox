import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import findContacts from '@salesforce/apex/ContactController.findContacts';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';

export default class EnjiList extends LightningElement {
    searchKey ="北爪";

    @wire(CurrentPageReference) pageRef;

    @wire(findContacts, { searchKey: '$searchKey' })
    contacts;

    connectedCallback() {
        // subscribe to searchKeyChange event
        registerListener('searchKeyChange', this.handleSearchKeyChange, this);
    }

    disconnectedCallback() {
        // unsubscribe from searchKeyChange event
        unregisterAllListeners(this);
    }

    handleSearchKeyChange(searchKey) {
        this.searchKey = searchKey;
    }
    
    handleContactSelect(event) {
        // fire contactSelected event
        fireEvent(this.pageRef, 'contactSelected', event.target.contact.Id);
    }
    
}