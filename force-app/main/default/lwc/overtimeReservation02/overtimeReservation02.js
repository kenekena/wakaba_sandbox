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
import UpsertKindergartenDiary from '@salesforce/apex/ImportantNotesV2Controller.UpsertKindergartenDiary';


/* 日報アップデート */
import { createRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import KindergartenDiary_OBJECT from '@salesforce/schema/KindergartenDiary__c';              //園児日誌obj
import ID_FIELD from '@salesforce/schema/KindergartenDiary__c.Id';                           //園児日誌obj:園児日誌ID
import ENGJIID_FIELD from '@salesforce/schema/KindergartenDiary__c.Contact__c';              //園児日誌obj:園児名
import DATE_FIELD from '@salesforce/schema/KindergartenDiary__c.Date__c';                    //園児日誌obj:日付
import ABSENT_FIELD from '@salesforce/schema/KindergartenDiary__c.AbsentSchedule__c';                    
import OUTSIDEFAST_FIELD from '@salesforce/schema/KindergartenDiary__c.OutsideFast__c';
import OUTSIDE_FIELD from '@salesforce/schema/KindergartenDiary__c.Outside__c'; 
import GONOTUSE_FIELD from '@salesforce/schema/KindergartenDiary__c.BusGoingNotUse__c';      //園児日誌obj:行き利用しない
import BACKNOTUSE_FIELD from '@salesforce/schema/KindergartenDiary__c.BusBackNotUse__c';     //園児日誌obj:帰り使用しない
import ABSENCEREASON_FIELD from '@salesforce/schema/KindergartenDiary__c.AbsenceReason__c';  //園児日誌obj:欠席理由
import STAFFID_FIELD from '@salesforce/schema/KindergartenDiary__c.StaffId__c';


const Week = ["日","月","火","水","木","金","土"];
const Today = new Date();
const DefaultValueBase = "-- なし --";

export default class OvertimeReservation02 extends LightningElement {
    TodayYear;
    @api ThisKindergarten = "";
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

    /* 更新用 */
    @track processing = false;

    /* 合計表示 */
    @track AttendanceDays = 0;
    @track ChildcareDays = 0;
    @track AbsenceDays = 0;
    @track ShowSelectMonth = String(Today.getMonth()+1);

    /* 表示系 */
    @track mainmenu = false;
    @track ShowCommand = false;
    @track ListShow = false;


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
        this.SelectMonth = String(Today.getMonth()+1);
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
        this.ShowCommand = false;
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
        
        console.log("SearchDate："+this.SearchDate);
        //年度に合わせる
        if(this.SearchDate.getMonth() < 3 ){
            this.SearchDate.setFullYear(this.ThisYear + 1);
        }else{
            this.SearchDate.setFullYear(this.ThisYear);
        }
        this.SelectYear = String(this.SearchDate.getFullYear());
        this.SelectMonth = String(event.target.value);
        this.ShowSelectMonth = String(event.target.value);

        

        this.SearchKindergartenDiary();
    }

    /* 園児日誌検索 */
    SearchKindergartenDiary(){
        this.ListShow = false;
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
            this.KindergartenDiaryList = [];
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
            if(result.length){
                if(result[0].AttendanceDays__c === undefined){this.AttendanceDays = 0;}else{this.AttendanceDays = result[0].AttendanceDays__c;}
                if(result[0].ChildcareDays__c === undefined){this.ChildcareDays = 0;}else{this.ChildcareDays = result[0].ChildcareDays__c;}
                if(result[0].AbsenceDays__c === undefined){this.AbsenceDays = 0;}else{this.AbsenceDays = result[0].AbsenceDays__c;}
            }else{
                this.AttendanceDays = 0;this.ChildcareDays = 0;this.AbsenceDays = 0;
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
        let OutsideClass;
        let OutsideFastClass;
        let AbsenceReasonClass;
        let AbsentScheduleClass;
        let BusGoingNotUseClass;
        let BusBackNotUseClass;

        ToMonthStart = new Date(this.SearchDate.getFullYear(), this.SearchDate.getMonth(), 1);
        ToMonthEnd   = new Date(this.SearchDate.getFullYear(), this.SearchDate.getMonth()+ 1, 0);
        /* 日付リストを作成 */
        this.ShowKindergartenDiaryList =[];
        for(i=0;ToMonthStart <= ToMonthEnd; ToMonthStart.setDate(ToMonthStart.getDate() + 1),i++){
            ToMonthStartProcess = ChangeProcess(ToMonthStart);
            ToMonthStartText = ChangeText2(ToMonthStart);
            /* 初期化 */
            OutsideListNow =[];
            OutsideNow = DefaultValueBase;
            OutsideFastListNow =[];
            OutsideFastNow = DefaultValueBase;
            AbsenceReasonListNow =[];
            AbsenceReasonNow = DefaultValueBase;
            OutsideClass = 'slds-select selecttype02';
            OutsideFastClass = 'slds-select selecttype02';
            AbsenceReasonClass ='slds-select selecttype02';
            AbsentScheduleClass ='btn-square gray';
            BusGoingNotUseClass ='btn-square gray';
            BusBackNotUseClass ='btn-square gray';



            if(this.KindergartenDiaryList[ToMonthStartProcess]){
                /* 選択項目のセット */
                if(this.KindergartenDiaryList[ToMonthStartProcess].Outside__c){
                    OutsideNow = this.KindergartenDiaryList[ToMonthStartProcess].Outside__c;
                    OutsideClass='slds-select selecttype02 selecttype02 blue';
                }
                OutsideListNow = SetListValue(this.OutsideList,true,DefaultValueBase,DefaultValueBase,OutsideNow);

                if(this.KindergartenDiaryList[ToMonthStartProcess].OutsideFast__c){
                    OutsideFastNow = this.KindergartenDiaryList[ToMonthStartProcess].OutsideFast__c;
                    OutsideFastClass='slds-select selecttype02 selecttype02 blue';
                }
                OutsideFastListNow = SetListValue(this.OutsideFastList,true,DefaultValueBase,DefaultValueBase,OutsideFastNow);

                if(this.KindergartenDiaryList[ToMonthStartProcess].AbsenceReason__c){
                    AbsenceReasonNow = this.KindergartenDiaryList[ToMonthStartProcess].AbsenceReason__c;
                }
                AbsenceReasonListNow = SetListValue(this.AbsenceReasonList,true,DefaultValueBase,DefaultValueBase,AbsenceReasonNow);
                /* END:選択項目のセット */
                if(this.KindergartenDiaryList[ToMonthStartProcess].AbsentSchedule__c){AbsentScheduleClass ='btn-square yellow'}
                if(this.KindergartenDiaryList[ToMonthStartProcess].BusBackNotUse__c){BusBackNotUseClass ='btn-square yellow'}
                if(this.KindergartenDiaryList[ToMonthStartProcess].BusGoingNotUse__c){BusGoingNotUseClass ='btn-square yellow'}

                if(this.KindergartenDiaryList[ToMonthStartProcess].AbsentSchedule__c === true && AbsenceReasonNow === DefaultValueBase ){
                    AbsenceReasonClass = 'border_Red selecttype02 slds-select';
                }


                this.ShowKindergartenDiaryList[i] = {
                    Date : (ToMonthStart.getMonth() + 1) + "月"+ ToMonthStart.getDate() + "日",
                    Weeknum : ToMonthStart.getDay(),
                    DateProcess : ToMonthStartProcess,
                    DateText : ToMonthStartText,
                    i : i,
                    KdID : this.KindergartenDiaryList[ToMonthStartProcess].Id,
                    Contact__c : this.SelectEnjiId,
                    OutsideList : OutsideListNow,
                    Outside__c : OutsideNow,
                    OutsideFastList : OutsideFastListNow,
                    OutsideFast__c : OutsideFastNow,
                    AbsenceReasonList : AbsenceReasonListNow,
                    AbsenceReason__c : AbsenceReasonNow,
                    AbsentSchedule__c : this.KindergartenDiaryList[ToMonthStartProcess].AbsentSchedule__c,
                    BusGoingNotUse__c : this.KindergartenDiaryList[ToMonthStartProcess].BusGoingNotUse__c,
                    BusBackNotUse__c  : this.KindergartenDiaryList[ToMonthStartProcess].BusBackNotUse__c,
                    OutsideClass : OutsideClass,
                    OutsideFastClass : OutsideFastClass,
                    AbsenceReasonClass : AbsenceReasonClass,
                    AbsentScheduleClass : AbsentScheduleClass,
                    BusGoingNotUseClass : BusGoingNotUseClass,
                    BusBackNotUseClass : BusBackNotUseClass,
                }
            }else{
                OutsideListNow = SetListValue(this.OutsideList,true,DefaultValueBase,DefaultValueBase,DefaultValueBase);
                OutsideFastListNow = SetListValue(this.OutsideFastList,true,DefaultValueBase,DefaultValueBase,DefaultValueBase);
                AbsenceReasonListNow = SetListValue(this.AbsenceReasonList,true,DefaultValueBase,DefaultValueBase,DefaultValueBase);

                this.ShowKindergartenDiaryList[i] = {
                    Date : (ToMonthStart.getMonth() + 1) + "月"+ ToMonthStart.getDate() + "日",
                    Weeknum : ToMonthStart.getDay(),
                    DateProcess : ToMonthStartProcess,
                    DateText : ToMonthStartText,
                    i : i,
                    KdID : undefined,
                    Contact__c : this.SelectEnjiId,
                    OutsideList : OutsideListNow,
                    Outside__c : OutsideNow,
                    OutsideFastList : OutsideFastListNow,
                    OutsideFast__c : OutsideFastNow,
                    AbsenceReasonList : AbsenceReasonListNow,
                    AbsenceReason__c : AbsenceReasonNow,
                    AbsentSchedule__c : false,
                    BusGoingNotUse__c : false,
                    BusBackNotUse__c  : false,
                    OutsideClass : OutsideClass,
                    OutsideFastClass : OutsideFastClass,
                    AbsenceReasonClass : AbsenceReasonClass,
                    AbsentScheduleClass : AbsentScheduleClass,
                    BusGoingNotUseClass : BusGoingNotUseClass,
                    BusBackNotUseClass : BusBackNotUseClass,
                }
            }
        }
        console.log("this.ShowKindergartenDiaryList");
        console.log(this.ShowKindergartenDiaryList);
        this.ListShow = true;

    }

    /********************************
       園児日誌を作成・更新する
    ********************************/
    UpsertEvent(event){
        let choiseType = event.target.dataset.type;
        let indexs = event.target.dataset.i;
        let recordInput = [];
        /* 項目の仮保存 */
        let OutsideFastNow;let OutsideFastClassNow;
        let OutsideNow;let OutsideClassNow;
        let AbsenceReasonNow;let AbsenceReasonClassNow;
        let AbsentScheduleNow;let AbsentScheduleClassNow;
        let BusGoingNotUseNow;let BusGoingNotUseClassNow;
        let BusBackNotUseNow;let BusBackNotUseClassNow;


        /* 連打禁止 */
        if(this.processing){return}
        /* 処理中フラグ */
        this.processing =true;

        /* 項目の値をセット */
        const fields = {};
        
        /* 共通 */
            fields[ID_FIELD.fieldApiName] = this.ShowKindergartenDiaryList[indexs].KdID;           //日報ID
            fields[DATE_FIELD.fieldApiName] = this.ShowKindergartenDiaryList[indexs].DateProcess;  //今日の日付
            fields[ENGJIID_FIELD.fieldApiName] = this.ShowKindergartenDiaryList[indexs].Contact__c;//関連園児ID
            fields[STAFFID_FIELD.fieldApiName] = this.StaffId;

        /* 
            項目ごと 
        */
        /* 時間外保育：早朝 */
        if(choiseType === 'OutsideFast'){
            console.log("OutsideFast：" +event.target.value);
            if(event.target.value === DefaultValueBase){
                fields[OUTSIDEFAST_FIELD.fieldApiName] = "";
                OutsideFastNow = DefaultValueBase;
                OutsideFastClassNow = 'slds-select selecttype02';
            }else{
                fields[OUTSIDEFAST_FIELD.fieldApiName] = event.target.value;
                OutsideFastNow = event.target.value;
                OutsideFastClassNow = 'blue slds-select selecttype02';
            }
        }
        /* 時間外保育 */
        if(choiseType === 'Outside'){
            console.log("Outside：" +event.target.value);
            if(event.target.value === DefaultValueBase){
                fields[OUTSIDE_FIELD.fieldApiName] = "";
                OutsideNow = DefaultValueBase;
                OutsideClassNow = 'slds-select selecttype02';
            }else{
                fields[OUTSIDE_FIELD.fieldApiName] = event.target.value;
                OutsideNow = event.target.value;
                OutsideClassNow = 'blue slds-select selecttype02';
            }
        }
        /* 欠席理由ボタン */
        if(choiseType === "Reason"){
            if(event.target.value === DefaultValueBase){
                fields[ABSENCEREASON_FIELD.fieldApiName] = "";
                AbsenceReasonNow = DefaultValueBase;
                if(this.ShowKindergartenDiaryList[indexs].AbsentSchedule__c){
                    AbsenceReasonClassNow="border_Red selecttype02 slds-select";
                }else{
                    AbsenceReasonClassNow="selecttype02 slds-select";
                }
            }else{
                fields[ABSENCEREASON_FIELD.fieldApiName] = event.target.value;
                AbsenceReasonNow = event.target.value;
                AbsenceReasonClassNow="selecttype02 slds-select";
                
            }
        }

        /* 欠席ボタン */
        if(choiseType === "Absent"){
            if(this.ShowKindergartenDiaryList[indexs].AbsentSchedule__c){
                fields[ABSENT_FIELD.fieldApiName] = false;
                AbsentScheduleNow = false;
                AbsentScheduleClassNow = "btn-square gray";
                AbsenceReasonClassNow="selecttype02 slds-select";
            }else{
                fields[ABSENT_FIELD.fieldApiName] = true;
                AbsentScheduleNow = true;
                AbsentScheduleClassNow = "btn-square yellow";
                //欠席理由がなしなら赤枠に切り替える
                if(this.ShowKindergartenDiaryList[indexs].AbsenceReason__c===DefaultValueBase){
                    AbsenceReasonClassNow="border_Red selecttype02 slds-select";
                }else{
                    AbsenceReasonClassNow="selecttype02 slds-select";
                }
            }
        }
        /* バス行きボタン */
        if(choiseType === "BusGo"){
            if(this.ShowKindergartenDiaryList[indexs].BusGoingNotUse__c){
                fields[GONOTUSE_FIELD.fieldApiName] = false;
                BusGoingNotUseNow = false;
                BusGoingNotUseClassNow = "btn-square gray";
            }else{
                fields[GONOTUSE_FIELD.fieldApiName] = true;
                BusGoingNotUseNow = true;
                BusGoingNotUseClassNow = "btn-square yellow";
            }
        }
        /* バス帰りボタン */
        if(choiseType === "BasBack"){
            if(this.ShowKindergartenDiaryList[indexs].BusBackNotUse__c){
                fields[BACKNOTUSE_FIELD.fieldApiName] = false;
                BusBackNotUseNow = false;
                BusBackNotUseClassNow = "btn-square gray";
            }else{
                fields[BACKNOTUSE_FIELD.fieldApiName] = true;
                BusBackNotUseNow = true;
                BusBackNotUseClassNow = "btn-square yellow";
            }
        }
        
        /* IDを見て、新規作成か更新か */
        if(fields[ID_FIELD.fieldApiName] === undefined){
            /* 新規作成 */
            recordInput = {apiName: KindergartenDiary_OBJECT.objectApiName, fields };   //作成する情報をセット
            createRecord(recordInput)  
            .then(result => {   //レコード作成に成功したら
                this.ShowKindergartenDiaryList[indexs].KdID = result.id; 
                if(choiseType === "OutsideFast"){
                    this.ShowKindergartenDiaryList[indexs].OutsideFastClass = OutsideFastClassNow;
                    this.ShowKindergartenDiaryList[indexs].OutsideFast__c = OutsideFastNow;
                }
                if(choiseType === "Outside"){
                    this.ShowKindergartenDiaryList[indexs].OutsideClass = OutsideClassNow;
                    this.ShowKindergartenDiaryList[indexs].Outside__c = OutsideNow;
                }
                if(choiseType === "Reason"){
                    this.ShowKindergartenDiaryList[indexs].AbsenceReasonClass = AbsenceReasonClassNow;
                    this.ShowKindergartenDiaryList[indexs].AbsenceReason__c = AbsenceReasonNow;
                }
                if(choiseType === "Absent"){
                    this.ShowKindergartenDiaryList[indexs].AbsentSchedule__c = AbsentScheduleNow;
                    this.ShowKindergartenDiaryList[indexs].AbsentScheduleClass = AbsentScheduleClassNow;
                    this.ShowKindergartenDiaryList[indexs].AbsenceReasonClass = AbsenceReasonClassNow;
                }
                if(choiseType === "BusGo"){
                    this.ShowKindergartenDiaryList[indexs].AbsentSchedule__c = BusGoingNotUseNow;
                    this.ShowKindergartenDiaryList[indexs].BusGoingNotUseClass = BusGoingNotUseClassNow;
                }
                if(choiseType === "BasBack"){
                    this.ShowKindergartenDiaryList[indexs].BusGoingNotUse__c = BusBackNotUseNow;
                    this.ShowKindergartenDiaryList[indexs].BusBackNotUseClass = BusBackNotUseClassNow;
                }

                console.log("作成成功");
                console.log(result);
            })
            .catch(() => {   //レコード作成に失敗したら
                //ポップアップでエラーメッセージを出す
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'レコードクリエイト：エラー',
                        message: '園児日誌を作成できませんでした。',
                        variant: 'error'
                    })
                );
            });
        }else{
            recordInput = { fields };
            updateRecord(recordInput)
            .then(result => {   //レコード作成に成功したら
                this.ShowKindergartenDiaryList[indexs].KdID = result.id; 
                if(choiseType === "OutsideFast"){
                    this.ShowKindergartenDiaryList[indexs].OutsideFastClass = OutsideFastClassNow;
                    this.ShowKindergartenDiaryList[indexs].OutsideFast__c = OutsideFastNow;
                }
                if(choiseType === "Outside"){
                    this.ShowKindergartenDiaryList[indexs].OutsideClass = OutsideClassNow;
                    this.ShowKindergartenDiaryList[indexs].Outside__c = OutsideNow;
                }
                if(choiseType === "Reason"){
                    this.ShowKindergartenDiaryList[indexs].AbsenceReasonClass = AbsenceReasonClassNow;
                    this.ShowKindergartenDiaryList[indexs].AbsenceReason__c = AbsenceReasonNow;
                }
                if(choiseType === "Absent"){
                    this.ShowKindergartenDiaryList[indexs].AbsentSchedule__c = AbsentScheduleNow;
                    this.ShowKindergartenDiaryList[indexs].AbsentScheduleClass = AbsentScheduleClassNow;
                    this.ShowKindergartenDiaryList[indexs].AbsenceReasonClass = AbsenceReasonClassNow;
                }
                if(choiseType === "BusGo"){
                    this.ShowKindergartenDiaryList[indexs].AbsentSchedule__c = BusGoingNotUseNow;
                    this.ShowKindergartenDiaryList[indexs].BusGoingNotUseClass = BusGoingNotUseClassNow;
                }
                if(choiseType === "BasBack"){
                    this.ShowKindergartenDiaryList[indexs].BusGoingNotUse__c = BusBackNotUseNow;
                    this.ShowKindergartenDiaryList[indexs].BusBackNotUseClass = BusBackNotUseClassNow;
                }
                console.log("更新成功");
                console.log(result);
            })
            .catch(() => {   //レコード作成に失敗したら
                //ポップアップでエラーメッセージを出す
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'レコードクリエイト：エラー',
                        message: '園児日誌を更新できませんでした。',
                        variant: 'error'
                    })
                );
            });
        }
        this.processing =false;
    }

    /********************************
       園児日誌を一括登録する
    ********************************/
     @track iikatuOutsideFast = DefaultValueBase;
     @track iikatuOutside = DefaultValueBase;
    IikatuOutsideFastChange(event){
        this.iikatuOutsideFast = event.target.value;
    }
    IikatuOutsideChange(event){
        this.iikatuOutside = event.target.value;
    }

    AllCreate(){
        let result1;
        let List = [];let i2 =0;
        // eslint-disable-next-line no-alert
        result1 = confirm('一括登録しますか？\n※一度登録すると取り消しはできません');
        if(result1) {
            const p = new Promise((resolve) => {
            for(let i=0; i < this.ShowKindergartenDiaryList.length; i++) {
                if(!(this.ShowKindergartenDiaryList[i].Weeknum === 0 || this.ShowKindergartenDiaryList[i].Weeknum === 6 )){
                    /* すでに時間外早朝/時間外/欠席予定が設定されいるものは省く */
                    if(
                        !(this.ShowKindergartenDiaryList[i].AbsentSchedule__c) && 
                        (this.ShowKindergartenDiaryList[i].Outside__c === undefined || this.ShowKindergartenDiaryList[i].Outside__c === DefaultValueBase) &&
                        (this.ShowKindergartenDiaryList[i].OutsideFast__c === undefined || this.ShowKindergartenDiaryList[i].OutsideFast__c === DefaultValueBase)
                    ){
                        List[i2] ={
                            Id :  this.ShowKindergartenDiaryList[i].KdID,
                            Date__c : this.ShowKindergartenDiaryList[i].DateProcess,
                            Contact__c : this.ShowKindergartenDiaryList[i].Contact__c,
                            StaffId__c : this.StaffId,
                            OutsideFast__c : this.iikatuOutsideFast,
                            Outside__c : this.iikatuOutside
                        }
                        i2 ++;
                    }
                }
                
            }
            console.log("List");
            console.log(List);
            resolve(List);
            });

            p.then(list => {
                console.log(list);
                UpsertKindergartenDiary({UpsertList:list})
                .then(result => {
                    console.log("成功");
                    this.SearchKindergartenDiary();
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: '成功',
                            message: '一括登録に成功しました。',
                            variant: 'success'
                        })
                    )
                    
                })
                .catch(error => {
                    console.log("失敗");
                    console.log(error);
                    this.error = error;
                });
            })
        }
    }






}