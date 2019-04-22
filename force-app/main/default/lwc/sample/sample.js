import { LightningElement,track, wire } from 'lwc';
import getContactList from '@salesforce/apex/ContactController.getContactList';

export default class sample extends LightningElement {
    @wire(getContactList) contacts;
    @track objectApiName="test";
    @track clickedButtonLabel;
    
    handleClick(event) {
        this.clickedButtonLabel = event.target.label;
    }
}