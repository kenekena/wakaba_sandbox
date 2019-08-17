/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { LightningElement,track,wire } from 'lwc';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import LIST_FiscalYear from '@salesforce/schema/ImportantNotes__c.FiscalYear__c';



/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

/* APEX Class呼び出し */
import findStaff from '@salesforce/apex/ImportantNotesV2Controller.findStaff';
import findImportantNotes from '@salesforce/apex/ImportantNotesV2Controller.findImportantNotes';
import findKindergartenDiary from '@salesforce/apex/ImportantNotesV2Controller.findKindergartenDiary';

/* 日報アップデート */
import { createRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import KindergartenDiary_OBJECT from '@salesforce/schema/KindergartenDiary__c';              //園児日誌obj
import ID_FIELD from '@salesforce/schema/KindergartenDiary__c.Id';                           //園児日誌obj:園児日誌ID
import AS_FIELD from '@salesforce/schema/KindergartenDiary__c.AttendanceSchedule__c';        //園児日誌obj:出欠席予定
import ENGJIID_FIELD from '@salesforce/schema/KindergartenDiary__c.Contact__c';              //園児日誌obj:園児名
import DATE_FIELD from '@salesforce/schema/KindergartenDiary__c.Date__c';                    //園児日誌obj:日付
import ASTIME_FIELD from '@salesforce/schema/KindergartenDiary__c.AttendanceTime__c';        //園児日誌obj:出席時間
import TOUEN_FIELD from '@salesforce/schema/KindergartenDiary__c.AttendingSchool__c';        //園児日誌obj:登園
import TOUENTIME_FIELD from '@salesforce/schema/KindergartenDiary__c.attendingSchoolTime__c';//園児日誌obj:登園時間
import KOUEN_FIELD from '@salesforce/schema/KindergartenDiary__c.GoingBack__c';              //園児日誌obj:降園
import KOUENTIME_FIELD from '@salesforce/schema/KindergartenDiary__c.GoingBackTime__c';      //園児日誌obj:降園時間
import GONOTUSE_FIELD from '@salesforce/schema/KindergartenDiary__c.BusGoingNotUse__c';      //園児日誌obj:行き利用しない
import BACKNOTUSE_FIELD from '@salesforce/schema/KindergartenDiary__c.BusBackNotUse__c';     //園児日誌obj:帰り使用しない
import ABSENCEREASON_FIELD from '@salesforce/schema/KindergartenDiary__c.AbsenceReason__c';  //園児日誌obj:欠席理由
import NOTRIDEREASON_FIELD from '@salesforce/schema/KindergartenDiary__c.NotRideReason__c';  //園児日誌obj:バス乗らない理由
import STAFFID_FIELD from '@salesforce/schema/KindergartenDiary__c.StaffId__c';              //職員名簿obj:
import ATTENDANCESTOP_FIELD from '@salesforce/schema/KindergartenDiary__c.AttendanceStop__c';//職員名簿obj:出席停止
import ATTENDANCESTOPREASON_FIELD from '@salesforce/schema/KindergartenDiary__c.AttendanceStopReason__c';//職員名簿obj:出席停止理由





const Week = ["日","月","火","水","木","金","土"];
const Today = new Date();
const DefaultValueBase = "-- なし --";


export default class StaffAttendanceMenu04 extends LightningElement {
    ThisKindergarten = "北広島わかば";
    @track ThisYear;
    @track TodayYear;
    @track FiscalYearList  = [];
    @track ImportantNotesList =[];
    @track ClassList = [];
    @track BusList = [];
    @track EnjiList = [];

    /* 表示・非表示 */
    @track NextButton = false;
    @track PrevButton = false;
    @track TodayButton = false;
    @track ClassShow = false;
    @track BusShow = false;
    /* END:表示・非表示 */

    /* 職員選択用 */
    @track StaffList =[];
    @track mainmenu = false;
    @track errorSfattMenu;
    StaffId;//ID保持    
    /* END:職員選択用 */                           


    TodayText = this.ChangeText(Today);
    TodayProcess = this.ChangeProcess(Today);
    TodayWeek = "(" + Week[Today.getDay()] + ")";
    @track SearchDay = new Date();
    @track SearchDayText = this.ChangeText(this.SearchDay);
    @track SearchDayProcess = this.ChangeProcess(this.SearchDay);
    @track SearchDayWeek = "(" + Week[this.SearchDay.getDay()] + ")";
    @track MinDate;
    @track MaxDate;
    
    /* 園児日誌 */
    @track AbsenceReasonList = [];
    @track NotRideReasonList = [];
    @track AttendanceStopReasonList = [];



    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: LIST_FiscalYear
    })
    ListDefault_FiscalYear({error, data}) {
        if (data) {
          this.FiscalYearList = this.SetListValue(data,false);
          console.log("this.FiscalYearList");
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

    /* 欠席理由の値を取得：初回のみ */
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: ABSENCEREASON_FIELD
    })
    AbsenceReasonListDefault({error, data}) {
        if (data) {
          this.AbsenceReasonList = this.SetListValue(data,true,DefaultValueBase,DefaultValueBase);
          console.log("this.AbsenceReasonList");
          console.log(this.AbsenceReasonList);
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: '欠席理由リスト取得エラー',
                    message: error,
                    variant: 'error'
                })
            );
        }
    }
    /* END:欠席理由の値を取得：初回のみ  */

    /* バス乗らない理由の値を取得：初回のみ */
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: NOTRIDEREASON_FIELD
    })
    NotRideReasonListDefault({error, data}) {
        if (data) {
          this.NotRideReasonList = this.SetListValue(data,true,DefaultValueBase,DefaultValueBase);
          console.log("this.NotRideReasonList");
          console.log(this.NotRideReasonList);
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'バス理由リスト取得エラー',
                    message: error,
                    variant: 'error'
                })
            );
        }
    }
    /* END:バス乗らない理由の値を取得：初回のみ  */

    /* 出席停止理由の値を取得：初回のみ */
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: ATTENDANCESTOPREASON_FIELD
    })
    AttendanceStopListDefault({error, data}) {
        if (data) {
          this.AttendanceStopList = this.SetListValue(data,true,DefaultValueBase,DefaultValueBase);
          console.log("this.AttendanceStopList");
          console.log(this.AttendanceStopList);
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: '出席停止理由リスト取得エラー',
                    message: error,
                    variant: 'error'
                })
            );
        }
    }
    /* END:出席停止理由の値を取得：初回のみ  */


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

    /********************************
      初回処理
    ********************************/
    connectedCallback() {
        /* 今の年度を保存 */
        let ThisMouth = Today.getMonth();
        if(ThisMouth < 3){
            this.TodayYear = String(Today.getFullYear() -1);
        }else{
            this.TodayYear = String(Today.getFullYear());
        }
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
        this.ThisYear = event.target.value;
        this.SearchDay = new Date(this.ThisYear,this.SearchDay.getMonth(),this.SearchDay.getDate());
        this.SearchDayProcess = this.ChangeProcess(this.SearchDay);
        this.SearchDayText = this.ChangeText(this.SearchDay);
        if(this.TodayYear === this.ThisYear){this.TodayButton=false}else{this.TodayButton=true}
        this.GetImportantNotes();
    }

    /********************************
      要録を取得 
    ********************************/
    GetImportantNotes(){
        /* 日付制御の処理 年度内の日付しか選択できたいようにする */
        let ThisMouth = this.SearchDay.getMonth();
        if(ThisMouth < 3){
            this.ThisYear = this.SearchDay.getFullYear() -1;
        }else{
            this.ThisYear = this.SearchDay.getFullYear();
        }
        
        this.MaxDate = ((Number(this.ThisYear) +1)) + "-03-31";
        this.MinDate = this.ThisYear + "-04-01";
        if(this.SearchDayProcess === this.MaxDate){this.NextButton=true;}else{this.NextButton=false}
        if(this.SearchDayProcess === this.MinDate){this.PrevButton=true;}else{this.PrevButton=false}
        /* END:日付制御の処理 年度内の日付しか選択できたいようにする */

        /* 要録検索Apex呼び出し */
        findImportantNotes({
            Year :this.ThisYear,
            Kindergarten : this.ThisKindergarten
        })
        .then(result => {
            this.ImportantNotesList =[];
            
            this.ImportantNotesList = result;
            console.info("this.ListCreate：要録一覧");
            console.table(result);
            console.info(this.ImportantNotesList);
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
        this.ClassList = [];
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
                    this.ClassList[count1] ={
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
        console.info("this.ClassList");
        console.log(this.ClassList);
        console.info("this.BusList");
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
                this.SearchDay = new Date(Today.getTime());
            }else{
                this.SearchDay.setDate(this.SearchDay.getDate() + num);
            }
        }else if(event.target.dataset.type === "DateSelect"){
            this.SearchDay = new Date( event.target.value.substr(0,4),event.target.value.substr(5,2) -1,event.target.value.substr(8,2));
        }
        this.SearchDayProcess = this.ChangeProcess(this.SearchDay);
        this.SearchDayText = this.ChangeText(this.SearchDay);
        if(this.SearchDayProcess === this.MaxDate){this.NextButton=true;}else{this.NextButton=false}
        if(this.SearchDayProcess === this.MinDate){this.PrevButton=true;}else{this.PrevButton=false}
    }


    /********************************
        クラス・バス選択で園児一覧を取得
    ********************************/
    GetKindergartenDiary(event){
        let Group = event.target.dataset.group;//クラス選択：Class or バス選択：Bus
        let GroupValue = event.target.dataset.value;//クラス名 or バス名
        let v;
        this.EnjiList = [];
        if(Group === "Class"){
            for(v of this.ImportantNotesList) {
                if(v.Class__c === GroupValue){
                    this.EnjiList.push(v.Contact__c);
                }
            }
        }
        if(Group === "Bus"){
            for(v of this.ImportantNotesList) {
                if(v.PassageRoute__c === GroupValue){
                    this.EnjiList.push(v.Contact__c);
                }
            }
        }

        /* 園児日誌検索Apex呼び出し */
        findKindergartenDiary({
            SearchDate :this.SearchDayProcess,
            ContactIdList :this.EnjiList
        })
        .then(result => {
            //ShowKindergartenDiary()で集計処理
            this.ShowKindergartenDiary(result);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: '園児日誌取得エラー',
                    message: error,
                    variant: 'error'
                })
            );
        })
    }

    /********************************
        園児日誌を整理して表示する
    ********************************/
    ShowKindergartenDiary(result){
        let KindergartenDiaryB =[];let i =0;let i2 =0;

        /* テスト 要録のNumberを上手にとってきたい。
        let test2 =[];
        for(i = 0; i< this.ImportantNotesList.length; i++){
            test2[this.ImportantNotesList[i].Contact__c] = {
                Number : this.ImportantNotesList[i].Number__c,
                Name : this.ImportantNotesList[i].Contact__r.kana__c
            }
        }
        console.table("要録");
        console.table(test2);
        */


        /* 日報リストをId名で連想配列にする */
        for(i = 0; i< result.length; i++){
            KindergartenDiaryB[result[i].Contact__c] = result[i]
        }
        console.table("KindergartenDiaryB");
        console.table(KindergartenDiaryB);

        /* 園児に対して日報あるかないかチェック */
        for(let v of this.EnjiList) {
            if (KindergartenDiaryB[v]) {
                console.log(v + "の日報はある");
            }else{
                console.log(v + "の日報はない");
            }
        }
        

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
        現在時刻取得（yyyy/mm/ddThh:mm:ss.000Z）
    ------------------------ */
    getCurrentTime() {
        var now = new Date();
        var res;
        now.setHours(now.getHours() - 9);//Salesforceに取り込んだときにずれる
        res = "" + now.getFullYear() + "-" + this.padZero(now.getMonth() + 1) + 
            "-" + this.padZero(now.getDate()) + "T" + this.padZero(now.getHours()) + ":" + 
            this.padZero(now.getMinutes()) + ":" + this.padZero(now.getSeconds()) + ".000Z";
        return res;
    }

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