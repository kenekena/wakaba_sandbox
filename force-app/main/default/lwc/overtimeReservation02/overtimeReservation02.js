/* eslint-disable no-else-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { LightningElement,track,wire,api } from 'lwc';

/* 共通jsの読み込み */
import { SetListValue,ChangeText,ChangeProcess,padZero } from 'c/commonJs';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import LIST_FiscalYear from '@salesforce/schema/ImportantNotes__c.FiscalYear__c';

/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';



/* APEX Class呼び出し */
import findStaff from '@salesforce/apex/ImportantNotesV2Controller.findStaff';
import findImportantNotes from '@salesforce/apex/ImportantNotesV2Controller.findImportantNotes';
import findKindergartenDiary from '@salesforce/apex/ImportantNotesV2Controller.findKindergartenDiary';

const Week = ["日","月","火","水","木","金","土"];
const Today = new Date();
const DefaultValueBase = "-- なし --";

export default class OvertimeReservation02 extends LightningElement {
    TodayYear;
    @track placeholder = "クラスを選択してください";
    @api ThisKindergarten = "北広島わかば";

    /* 年度 */
    @track FiscalYearList  = [];
    @track ThisYear;
    @track SearchDate = new Date();
    @track ClassList = [];
    @track ImportantNoteList = [];
    @track EnjiList = [];


    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: LIST_FiscalYear
    })
    ListDefault_FiscalYear({error, data}) {
        if (data) {
          this.FiscalYearList = SetListValue(data,false,false,false,this.TodayYear);
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: '年度取得エラー',
                    message: error,
                    variant: 'error'
                })
            );
        }
    }
    /* END:wire ListDefault_FiscalYear */

    /********************************
      初回処理
    ********************************/
    connectedCallback() {
        /* 今日の日付の年度を取得 */
        let ThisMouth = Today.getMonth();
        if(ThisMouth < 3){
            this.ThisYear = Today.getFullYear() -1;
        }else{
            this.ThisYear = Today.getFullYear();
        }
        this.GetImportantNotes();
    }

    /********************************
      選択リストを変更したら 
      this.ThisYearを書き換え
    ********************************/
    ChangeFiscalYear(event){
        this.placeholder = "クラスを選択してください";
        this.EnjiList = [];
        this.ThisYear = event.target.value;
        this.GetImportantNotes();
    }


    /********************************
      要録を取得 
    ********************************/
    GetImportantNotes(){
        /* 年度をみて要録取得 */
        /* 要録検索Apex呼び出し */
        findImportantNotes({
            Year :this.ThisYear,
            Kindergarten : this.ThisKindergarten
        })
        .then(result => {
            console.log("ImportantNoteList：result");
            console.log(result);
            this.ImportantNoteList = result;
            this.ListCreate(result);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: '要録取得エラー',
                    message: error,
                    variant: 'error'
                })
            );
        })

    }

    /********************************
      くみリストを生成 
    ********************************/
    ListCreate(result){
        /* 配列リセット */
        this.ClassList = [];
        let classListCheck = [];//リストチェック用
        let count1 = 0;

        /* 要録リストをループ */
        for(let v of result) {
            /* くみリストを生成 */
            if (classListCheck.indexOf(v.Class__c) === -1){
                if(!(v.Class__c === undefined)){
                    classListCheck.push(v.Class__c);
                    this.ClassList[count1] ={
                        value : v.Class__c,
                        label : v.Class__c
                    }
                    count1 ++;
                }
            }
        }

    }
    /* END:くみリストを生成 */

    /********************************
      クラス選択で 園児一覧を取得
    ********************************/
    SelectEnji(event){
        let i = 0;
        this.EnjiList =[];
        for(let v of this.ImportantNoteList){
            if(v.Class__c === event.target.value){
                this.EnjiList[i] = {
                    i : i,
                    Id : v.Id,
                    Contact__c : v.Contact__c,
                    kana__c : v.Contact__r.kana__c
                }
                i++;
            } 
        }
    }




}