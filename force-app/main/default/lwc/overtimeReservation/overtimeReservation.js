import { LightningElement,wire,track } from 'lwc';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TYPE_Class from '@salesforce/schema/ImportantNotes__c.Class__c';
import TYPE_OUTSIDEFAST from '@salesforce/schema/KindergartenDiary__c.OutsideFast__c';
import TYPE_OUTSIDE from '@salesforce/schema/KindergartenDiary__c.Outside__c';

import findImportantNotes from '@salesforce/apex/ImportantNotesController.findImportantNotes2';


export default class OvertimeReservation extends LightningElement {
    today = new Date();
    @track ClassList;
    @track BusList;
    @track value = 'inProgress';
    @track searchDate = this.today.getFullYear() + "-" + (this.today.getMonth() + 1) + "-"+ this.today.getDate();
    @track searchMonth = this.today;
    @track options = [];
    @track overtimeReservationList = [];
    @track listDisplay = false;
    @track placeholder = "クラスを選択してください";

    /* ------------------------
        学級一覧を取得：初回のみ
    ------------------------ */
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_Class
    })
    picklistValues;

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_OUTSIDEFAST
    })
    OutsideFast;

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_OUTSIDE
    })
    Outside;





    //クラスを選んだら園児一覧を取得
    links(event){
        var ImportantNoteList;      //要録一覧を一旦格納
        var i;
        var value = event.target.dataset.value;
        var itako = [];
        this.options = [];
        
        async function merge(searchDate){
            ImportantNoteList = await (

            findImportantNotes({
                    searchValue: event.target.dataset.value,
                    searchDate: searchDate,
                    searchGroup: 'class'
                })
                .then(result => {
                    return result;
                })
                .catch(error => {
                    return error;//考えてあげなきゃいけない
                })
            );
        }

        merge(this.searchDate).then(
            () => {
                for(i = 0; i< ImportantNoteList.length; i++){
                    itako[i] = { 
                        label: ImportantNoteList[i].Contact__r.kana__c, 
                        value: ImportantNoteList[i].Contact__r.Id 
                    };
                    if(i ===1){this.placeholder = value + '一覧';}
                    /*
                        直接  this.options[i] ={*****};はできない
                    */

                    
                }
                this.options = itako;

            }
        )

    }

    //園児を選択したら1ヶ月分の予定をだす
    handleChange(event){
        var toMonthStart;
        var toMonthStartText;
        var ToMonthEnd;
        var week = ["日","月","火","水","木","金","土"];
        var i;
        var changetype = event.target.name;
        this.listDisplay = true;
        this.overtimeReservationList =[];


        if(event.target.dataset.value === '先月'){this.searchMonth.setMonth(this.searchMonth.getMonth() -1)}
        if(event.target.dataset.value === '今月'){this.searchMonth = new Date(this.today)}
        if(event.target.dataset.value === '翌月'){this.searchMonth.setMonth(this.searchMonth.getMonth() +1)}
        if(changetype === 'changeName'){ this.value = event.target.value }


        toMonthStart = new Date(this.searchMonth.getFullYear(), this.searchMonth.getMonth(), 1);
        ToMonthEnd = new Date(this.searchMonth.getFullYear(), this.searchMonth.getMonth()+ 1, 0);


        for(i=0;toMonthStart <= ToMonthEnd; toMonthStart.setDate(toMonthStart.getDate() + 1),i++){
            toMonthStartText = toMonthStart.getFullYear() + '年' + (toMonthStart.getMonth() + 1) + '月'+ toMonthStart.getDate()+ '日' ;
            this.overtimeReservationList[i] = {
                date : toMonthStartText,
                week : '（' + week[toMonthStart.getDay()] + '）',
            };
        }
        

    }


    


}