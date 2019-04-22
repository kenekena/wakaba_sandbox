import { LightningElement,track, wire } from 'lwc';
import getContactList from '@salesforce/apex/ContactController.getContactList';

export default class sample extends LightningElement {
    @wire(getContactList) contacts;
    @track objectApiName="test";
    @track clickedButtonLabel;
    
    handleClick(event) {
        var clickedButtonLabels=[];
        clickedButtonLabels.push(contacts);

        this.clickedButtonLabel = clickedButtonLabels[0].Name;
    }
}