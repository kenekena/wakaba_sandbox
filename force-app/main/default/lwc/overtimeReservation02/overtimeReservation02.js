/* eslint-disable no-else-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { LightningElement,track,wire,api } from 'lwc';

/* 共通jsの読み込み */
import { SetListValue,ChangeText2,ChangeProcess } from 'c/commonJs';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import LIST_FiscalYear from '@salesforce/schema/ImportantNotes__c.FiscalYear__c';
import TYPE_OUTSIDEFAST from '@salesforce/schema/KindergartenDiary__c.OutsideFast__c';
import TYPE_OUTSIDE from '@salesforce/schema/KindergartenDiary__c.Outside__c';
import ABSENCE_REASON from '@salesforce/schema/KindergartenDiary__c.AbsenceReason__c';

/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';



/* APEX Class呼び出し */
import findStaff from '@salesforce/apex/ImportantNotesV2Controller.findStaff';
import findImportantNotes from '@salesforce/apex/ImportantNotesV2Controller.findImportantNotes';
import findKindergartenDiary from '@salesforce/apex/ImportantNotesV2Controller.findKindergartenDiary_OrList';
import findChildcareFee from '@salesforce/apex/ImportantNotesV2Controller.findChildcareFee';


const Week = ["日","月","火","水","木","金","土"];
const Today = new Date();
const DefaultValueBase = "-- なし --";

export default class OvertimeReservation02 extends LightningElement {
    TodayYear;
    @api ThisKindergarten = "北広島わかば";
    @track StaffList = [];

    @track placeholder = "クラスを選択してください";
    /* 年度 */
    @track FiscalYearList  = [];
    @track ThisYear;
    @track SearchDate = new Date();

    @track ClassList = [];
    @track ImportantNoteList = [];
    @track ImportantNoteList2 = [];
    @track EnjiList = [];
    @track EnjiList2 = [];
    @track ImportantNoteList = [];
    @track KindergartenDiaryList = [];
    @track ShowKindergartenDiaryList = [];

    /* 園児日誌検索用 */
    @track SelectEnjiId;
    @track ShowList = [];
    @track SelectYear;
    @track SelectMonth;

    /* 合計表示 */
    @track AttendanceDays = 0;
    @track ChildcareDays = 0;
    @track AbsenceDays = 0;

    /* 表示系 */
    @track mainmenu = false;
    @track ShowCommand = false;


    @wire(findStaff,{ThisKindergarten : '$ThisKindergarten'})
    findStaffs({ error, data }) {
        let i;let karilist = [];
        if (data) {
            for(i = 0 ;i<data.length;i++){
                karilist[i] = {
                    label : data[i].Name,
                    value : data[i].Id,
                }
            }
            this.StaffList = karilist;
        } else if (error) {
            this.errorSfattMenu = error;
        }   
    }
    /* END:wire findStaffs  */

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

    /* 園児日誌obj:欠席理由の値を取得 */
    @track AbsenceReasonList = [];
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: ABSENCE_REASON
    })
    AbsenceReasons({error, data}) {
        if (data) {
          this.AbsenceReasonList = data;
          console.log(data);
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "欠席理由の値取得エラー",
                    message: error,
                    variant: 'error'
                })
            );
        }
    }
    /* END:園児日誌obj:欠席理由の値を取得 */

    /* 園児日誌obj:時間外保育:早朝の値を取得 */
    @track OutsideFastList = [];
    @track LumpOutsideFastList = [];
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_OUTSIDEFAST
    })
    OutsideFasts({error, data}) {
        if (data) {
          this.OutsideFastList = data;
          this.LumpOutsideFastList = SetListValue(data,true,DefaultValueBase,DefaultValueBase,DefaultValueBase);
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "時間外保育:早朝の値取得エラー",
                    message: error,
                    variant: 'error'
                })
            );
        }
    }
    /* END:園児日誌obj:時間外保育:早朝の値を取得 */

    /* 園児日誌obj:時間外保育の値を取得*/
    @track OutsideList = [];
    @track LumpOutsideList = [];
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_OUTSIDE
    })
    Outsides({error, data}) {
        if (data) {
          this.OutsideList = data;
          this.LumpOutsideList = SetListValue(data,true,DefaultValueBase,DefaultValueBase,DefaultValueBase);
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "時間外保育の値取得エラー",
                    message: error,
                    variant: 'error'
                })
            );
        }
    }
    /* END:園児日誌obj:時間外保育の値を取得*/



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
        this.SelectYear = String(this.ThisYear);
        this.SelectMonth = String(Today.getMonth());
        this.GetImportantNotes();
    }

    /********************************
        クラス選択で 園児一覧を取得
    ********************************/
    selectStaff(event){
        this.StaffId = event.target.value;
        this.mainmenu = true;
    }

    /********************************
      選択リストを変更したら 
      this.ThisYearを書き換え
    ********************************/
    ChangeFiscalYear(event){
        this.placeholder = "クラスを選択してください";
        this.EnjiList = [];
        this.EnjiList2 = [];
        this.ThisYear = Number(event.target.value);
        this.ShowCommand = false;
        this.GetImportantNotes();
    }


    /********************************
      要録を取得 
    ********************************/
    GetImportantNotes(){
        let i =0;
        /* 年度をみて要録取得 */
        /* 要録検索Apex呼び出し */
        findImportantNotes({
            Year :this.ThisYear,
            Kindergarten : this.ThisKindergarten
        })
        .then(result => {
            this.ImportantNoteList =[];
            this.ImportantNoteList2 =[];
            console.log("ImportantNoteList：result");
            console.log(result);
            this.ImportantNoteList = result;
            for(i = 0; i< result.length; i++){
                this.ImportantNoteList2[result[i].Contact__c] = result[i];
            }
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
        console.log(this.ClassList.length);

    }
    /* END:くみリストを生成 */

    /********************************
      クラス選択で 園児一覧を取得
    ********************************/
    SelectClass(event){
        let i = 0;
        this.EnjiList =[];
        this.placeholder = event.target.value + '一覧';
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
        for(i = 0; i< this.EnjiList.length; i++){
            this.EnjiList2[this.EnjiList[i].Contact__c] = this.EnjiList[i];
        }
    }
    /* END:クラス選択で 園児一覧を取得 */

    /********************************
      園児選択 OR 月変更で1ヶ月分の予定をだす
    ********************************/
   
    /* 園児情報をセット */
    SetEnjiId(event){
        if(event.target.value === "Noarea") {
            this.ShowCommand = false;
            return;
        }
        this.SelectEnjiId = event.target.value;
        this.ShowCommand = true;
        this.SearchKindergartenDiary();

    }

    /* 月をセット */
    SetMonth(event){
        if(event.target.value === 'ToMonth'){
            this.SearchDate = new Date();
        }else{
            this.SearchDate.setMonth(event.target.value -1);
        }
        
        //年度に合わせる
        if(this.SearchDate.getMonth() < 3 ){
            this.SearchDate.setFullYear(this.ThisYear + 1);
        }else{
            this.SearchDate.setFullYear(this.ThisYear);
        }
        this.SelectYear = String(this.SearchDate.getFullYear());
        this.SelectMonth = String(event.target.value -1);

        this.SearchKindergartenDiary();
    }

    /* 園児日誌検索 */
    SearchKindergartenDiary(){
        let i;
        let ToMonthStart;let ToMonthEnd;
        ToMonthStart = ChangeProcess(new Date(this.SearchDate.getFullYear(), this.SearchDate.getMonth(), 1));
        ToMonthEnd   = ChangeProcess(new Date(this.SearchDate.getFullYear(), this.SearchDate.getMonth()+ 1, 0));
        
        findKindergartenDiary({
            StartDate : ToMonthStart,
            EndDate : ToMonthEnd,
            EnjiID : this.SelectEnjiId
        })
        .then(result => {
            console.log("園児日誌取得");
            for(i = 0; i< result.length; i++){
                this.KindergartenDiaryList[result[i].Date__c] = result[i];
            }
            console.log(result);
            this.SearchChildcareFee();
            this.ShowKindergartenDiary();

        })
        .catch(error => {
            console.log("園児日誌取得error");
            console.log(error);
        })

    }

    /* 保育料検索 */
    SearchChildcareFee(){
        findChildcareFee({
            Year : this.SelectYear,
            Month : this.SelectMonth,
            EnjiID : this.SelectEnjiId
        })
        .then(result => {
            console.log("保育料取得");
            if(result){
                if(result[0].AttendanceDays__c === undefined){this.AttendanceDays = 0;}else{this.AttendanceDays = result[0].AttendanceDays__c;}
                if(result[0].ChildcareDays__c === undefined){this.ChildcareDays = 0;}else{this.ChildcareDays = result[0].ChildcareDays__c;}
                if(result[0].AbsenceDays__c === undefined){this.AbsenceDays = 0;}else{this.AbsenceDays = result[0].AbsenceDays__c;}
            }
        })
        .catch(error => {
            console.log("保育料取得error");
            console.log(error);
        })

    }

    /********************************
       園児日誌を整理して表示する
    ********************************/
    ShowKindergartenDiary(){
        let i;let ToMonthStart;let ToMonthEnd;let ToMonthStartProcess;let ToMonthStartText;
        let OutsideListNow =[];let OutsideNow;
        let OutsideFastListNow =[];let OutsideFastNow;
        let AbsenceReasonListNow =[];let AbsenceReasonNow;
        ToMonthStart = new Date(this.SearchDate.getFullYear(), this.SearchDate.getMonth(), 1);
        ToMonthEnd   = new Date(this.SearchDate.getFullYear(), this.SearchDate.getMonth()+ 1, 0);
        /* 日付リストを作成 */
        this.DateList =[];
        for(i=0;ToMonthStart <= ToMonthEnd; ToMonthStart.setDate(ToMonthStart.getDate() + 1),i++){
            ToMonthStartProcess = ChangeProcess(ToMonthStart);
            ToMonthStartText = ChangeText2(ToMonthStart);
            console.log(this.KindergartenDiaryList[ToMonthStartProcess]);
            OutsideListNow =[];
            OutsideNow = DefaultValueBase;
            OutsideFastListNow =[];
            OutsideFastNow = DefaultValueBase;
            AbsenceReasonListNow =[];
            AbsenceReasonNow = DefaultValueBase;


            if(this.KindergartenDiaryList[ToMonthStartProcess]){
                if(this.KindergartenDiaryList[ToMonthStartProcess].Outside__c){
                    OutsideNow = this.KindergartenDiaryList[ToMonthStartProcess].Outside__c;
                }
                OutsideListNow = SetListValue(this.OutsideList,true,DefaultValueBase,DefaultValueBase,OutsideNow);

                if(this.KindergartenDiaryList[ToMonthStartProcess].OutsideFast__c){
                    OutsideFastNow = this.KindergartenDiaryList[ToMonthStartProcess].OutsideFast__c;
                }
                OutsideFastListNow = SetListValue(this.OutsideFastList,true,DefaultValueBase,DefaultValueBase,OutsideFastNow);

                if(this.KindergartenDiaryList[ToMonthStartProcess].AbsenceReason__c){
                    AbsenceReasonNow = this.KindergartenDiaryList[ToMonthStartProcess].AbsenceReason__c;
                }
                AbsenceReasonListNow = SetListValue(this.AbsenceReasonList,true,DefaultValueBase,DefaultValueBase,AbsenceReasonNow);

                this.DateList[i] = {
                    Date : (ToMonthStart.getMonth() + 1) + "月"+ ToMonthStart.getDate() + "日",
                    DateProcess : ToMonthStartProcess,
                    DateText : ToMonthStartText,
                    i : i,
                    KdID : this.KindergartenDiaryList[ToMonthStartProcess].Id,
                    OutsideList : OutsideListNow,
                    Outside__c : OutsideNow,
                    OutsideFastList : OutsideFastListNow,
                    OutsideFast__c : OutsideFastNow,
                    AbsenceReasonList : AbsenceReasonListNow,
                    AbsenceReason__c : AbsenceReasonNow,
                    AbsentSchedule__c : this.KindergartenDiaryList[ToMonthStartProcess].AbsentSchedule__c,
                    BusGoingNotUse__c : this.KindergartenDiaryList[ToMonthStartProcess].BusGoingNotUse__c,
                    BusBackNotUse__c  : this.KindergartenDiaryList[ToMonthStartProcess].BusBackNotUse__c
                }
            }else{
                this.DateList[i] = {
                    Date : (ToMonthStart.getMonth() + 1) + "月"+ ToMonthStart.getDate() + "日",
                    DateProcess : ToMonthStartProcess,
                    DateText : ToMonthStartText,
                    i : i,
                    KdID : undefined,
                    OutsideList : OutsideListNow,
                    Outside__c : OutsideNow,
                    OutsideFastList : OutsideFastListNow,
                    OutsideFast__c : OutsideFastNow,
                    AbsenceReasonList : AbsenceReasonListNow,
                    AbsenceReason__c : AbsenceReasonNow,
                    AbsentSchedule__c : false,
                    BusGoingNotUse__c : false,
                    BusBackNotUse__c  : false
                }
            }
        }
        console.log("this.DateList");
        console.log(this.DateList);

    }




}