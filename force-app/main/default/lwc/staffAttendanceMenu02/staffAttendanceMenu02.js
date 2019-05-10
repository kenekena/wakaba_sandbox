/* eslint-disable no-console */
import { LightningElement,track,wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import findImportantNotes from '@salesforce/apex/ImportantNotesController.findImportantNotes';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

import { updateRecord } from 'lightning/uiRecordApi';
import LASTNAME_FIELD from '@salesforce/schema/Contact.kana__c';
import ID_FIELD from '@salesforce/schema/Contact.Id';



export default class StaffAttendanceMenu02 extends LightningElement {
    searchKey;
    @track test =['data'];

    @wire(CurrentPageReference) pageRef;
    
    @wire(findImportantNotes, { searchKey: '$searchKey' })
    importantNotes;

    connectedCallback() {
        // subscribe to searchKeyChange event
        registerListener('searchKeyChange', this.links, this);
    }

    disconnectedCallback() {
        // unsubscribe from searchKeyChange event
        unregisterAllListeners(this);
    }

    links(searchKey) {
        this.searchKey = searchKey;
    }

    @track isSelected = false;

    handleClick() {
        this.isSelected = !this.isSelected;
    }

    getIndex(value, arr, prop) {
        // eslint-disable-next-line vars-on-top
        for(var i = 0; i < arr.length; i++) {
            if(arr[i][prop] === value) {
                return i;
            }
        }
        return -1; //値が存在しなかったとき
    }

    //出席・欠席を押したら変更する
    changeType(event){
        var indexs;var i ;
        //console.log(event.target.dataset.id);
        //console.log(this.test.data);

        //this.test.data[●●]をthis.test.data.Idと撮ってきたIDがイコールの●●を取得
        for(i = 0; i < this.test.data.length; i++) {
            if(this.test.data[i].Id === event.target.dataset.id) {
                indexs = i;
            }
        }
        this.test.data[indexs].now = event.target.dataset.value;

        //リストを再読込
        this.searchKey='ばら';
        /*this.upsertImportantNotes();*/
        
        
        console.log(this.importantNotes.data);

    }

    upsertImportantNotes() {
        this.test.data = [
            {'name':'田中　太郎','test__c':true,'now':'予定','Id':'0001'},
            {'name':'しみず　まこと','now':'　　','Id':'0002'},
            {'name':'おおずぎ　れん','now':'　　','Id':'0003'},
            {'name':'おくむら　しずか','now':'　　','Id':'0004'}];
        // eslint-disable-next-line no-console
        console.log('サーチキー'+this.searchKey);
    }

    ContactNameUpdateTest(){
        const fields = {};
        fields[ID_FIELD.fieldApiName] = '0030p000003JiXsAAK';
        fields[LASTNAME_FIELD.fieldApiName] = 'ZZZ';

        const recordInput = { fields };

        updateRecord(recordInput);
    }


}