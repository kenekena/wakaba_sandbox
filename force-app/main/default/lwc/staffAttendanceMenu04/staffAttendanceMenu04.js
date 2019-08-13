/* eslint-disable no-console */
import { LightningElement,track,wire } from 'lwc';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import LIST_FiscalYear from '@salesforce/schema/ImportantNotes__c.FiscalYear__c';

/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

/* APEX Class呼び出し */
import findImportantNotes from '@salesforce/apex/ImportantNotesV2Controller.findImportantNotes';

const Week = ["日","月","火","水","木","金","土"];
const Today = new Date();


export default class StaffAttendanceMenu04 extends LightningElement {
    @track ThisYear = "2019";
    ThisKindergarten = "北広島わかば";
    @track FiscalYearList  = [];
    @track classList = [];
    @track BusList = [];

    TodayText = this.ChangeText(Today);
    TodayProcess = this.ChangeProcess(Today);
    TodayWeek = "(" + Week[Today.getDay()] + ")";
    @track SearchDay = new Date();
    @track SearchDayText = this.ChangeText(this.SearchDay);
    @track SearchDayProcess = this.ChangeProcess(this.SearchDay);
    @track SearchDayWeek = "(" + Week[this.SearchDay.getDay()] + ")";



    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: LIST_FiscalYear
    })
    ListDefault_FiscalYear({error, data}) {
        if (data) {
          this.FiscalYearList = this.SetListValue(data,false);
          console.log(this.FiscalYearList);

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
    /* END:wire ListDefault_FiscalYear  */

    /********************************
      初回処理
    ********************************/
    connectedCallback() {
        this.GetImportantNotes();
    }


    /********************************
      選択リストを変更したら 
      this.ThisYearを書き換え
    ********************************/
    ChangeFiscalYear(event){
        this.ThisYear = event.target.value;
        this.GetImportantNotes();
    }

    /********************************
      要録を取得 
    ********************************/
    GetImportantNotes(){
        findImportantNotes({
            Year :this.ThisYear,
            Kindergarten : this.ThisKindergarten
        })
        .then(result => {
            console.log(result);
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
      くみリストとバスリストを生成 
    ********************************/
    ListCreate(result){
        /* 配列リセット */
        this.classList = [];
        this.BusList = [];
        let classListCheck = [];//リストチェック用
        let BusListListCheck = [];//リストチェック用
        let count1 = 0;let count2 = 0;

        /* 要録リストをループ */
        for(let v of result) {
            /* くみリストを生成 */
            if (classListCheck.indexOf(v.Class__c) === -1){
                if(!(v.Class__c === undefined)){
                    classListCheck.push(v.Class__c);
                    this.classList[count1] ={
                        value : v.Class__c,
                        label : v.Class__c
                    }
                    count1 ++;
                }
            }
            /* バスリストを生成 */
            if (BusListListCheck.indexOf(v.PassageRoute__c) === -1){
                if(!(v.PassageRoute__c === undefined)){
                    BusListListCheck.push(v.PassageRoute__c);
                    this.BusList[count2] ={
                        value : v.PassageRoute__c,
                        label : v.PassageRoute__c
                    }
                    count2 ++;
                }
            }
        }
        console.log(this.classList);
        console.log(this.BusList);
    }

    /********************************
      日付変更 
    ********************************/
    ChangeSelectDate(event){
        let num =0;

        if(event.target.dataset.type === "DateButton"){
            num = Number(event.target.value);
            if(num === 0 ){
                this.SelectDate = new Date(Today.getTime());
            }else{
                this.SelectDate.setDate(this.SelectDate.getDate() + num);
            }
        }else if(event.target.dataset.type === "DateSelect"){
            this.SelectDate = new Date( event.target.value.substr(0,4),event.target.value.substr(5,2) -1,event.target.value.substr(8,2));
        }
        this.SearchDayProcess = this.ChangeProcess(this.SelectDate);
    }


    /********************************
        選択リストを作成SetListValue
            DafaultList     :@wire getPicklistValuesで取得した入れる
            HeadValue       :bloon 先頭にデフォルトの値を追加
            DefaultValue    :HeadValueがtrueのときの先頭のvalue
            DefaultLabel    :HeadValueがtrueのときの先頭のlabel
        return >>> 配列
    ********************************/
    SetListValue(DefaultList,HeadValue,DefaultValue,DefultLabel){
        let i;let Head = 0;let SetList = [];
        if(HeadValue){
            Head = 1;
            SetList[0] = {
                value : DefaultValue,
                label : DefultLabel,
                selected: ""
            }
        }
        for(i = 0; i< DefaultList.values.length; i++){
            SetList[i + Head] = {
                value : DefaultList.values[i].value,
                label : DefaultList.values[i].value,
                selected: ""
            }
        }
        return SetList;
        }
     /* END:選択リストを作成SetListValue */

     /* ------------------------
        先頭ゼロ付加
    ------------------------ */
    padZero(num) {
        var result;
        if (num < 10) {
            result = "0" + num;
        } else {
            result = "" + num;
        }
        return result;
    }
    /* END:先頭ゼロ付加 */

    /* ------------------------
        日付を文字列に変換
    ------------------------ */
    ChangeText(TargeDate) {
        return TargeDate.getFullYear() + "年" + (TargeDate.getMonth() + 1) + "月"+ TargeDate.getDate() + "日(" + Week[TargeDate.getDay()] + ")";
    }
    /* END:日付を文字列に変換 */

    /* ------------------------
        日付を処理用に変換
    ------------------------ */
    ChangeProcess(TargeDate) {
        return TargeDate.getFullYear() + "-" + this.padZero((TargeDate.getMonth() + 1)) + "-"+ this.padZero(TargeDate.getDate());
    }
    /* END:日付を処理用に変換 */





}