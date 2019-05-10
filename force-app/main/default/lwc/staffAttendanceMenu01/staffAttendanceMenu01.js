import { LightningElement,wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TYPE_Class from 'staffAttendanceMenu01/node_modules/@salesforce/schema/ImportantNotes__c.Class__c';

import { CurrentPageReference } from 'staffAttendanceMenu01/node_modules/lightning/navigation';
import { fireEvent } from 'c/pubsub';

export default class StaffAttendanceMenu01 extends LightningElement {
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_Class
    })
    picklistValues;

    /* pubsub */
    @wire(CurrentPageReference) pageRef;

    links(event){

        fireEvent(this.pageRef, 'searchKeyChange', event.target.getAttribute('data-value2'));
      }


}