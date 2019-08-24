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
    @track ImportantNotesList2 =[];
    @track ClassList = [];
    @track BusList = [];
    @track EnjiList = [];
    @track Group;    
    @track ShowEnjiList =[];//表示用のリスト

    /* 表示・非表示 */
    @track processing = false;
    @track NextButton = false;
    @track PrevButton = false;
    @track TodayButton = false;
    @track ClassShow = false;
    @track BusShow = false;
    @track firstDisplay = true;
    @track Loading = false;
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
    @track MinDateProcess;
    @track MaxDateProcess;
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
          //console.log("this.FiscalYearList");
          //console.log(this.FiscalYearList);

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
          this.AbsenceReasonList = data;//this.SetListValue(data,true,DefaultValueBase,DefaultValueBase);
          //console.log("this.AbsenceReasonList");
          //console.log(this.AbsenceReasonList);
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
          this.NotRideReasonList = data;//this.SetListValue(data,true,DefaultValueBase,DefaultValueBase);
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
          this.AttendanceStopList = data;//this.SetListValue(data,true,DefaultValueBase,DefaultValueBase);
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
        this.BusShow = false;
        this.ClassShow = false;
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
        let i =0;
        /* 日付制御の処理 年度内の日付しか選択できたいようにする */
        let ThisMouth = this.SearchDay.getMonth();
        if(ThisMouth < 3){
            this.ThisYear = this.SearchDay.getFullYear() -1;
        }else{
            this.ThisYear = this.SearchDay.getFullYear();
        }
        this.MaxDate = new Date((Number(this.ThisYear) +1), 3 - 1, 31);
        this.MinDate = new Date(this.ThisYear, 4 - 1, 1);
        console.log("this.MaxDate");
        console.log(this.MaxDate);
        console.log("this.MinDate");
        console.log(this.MinDate);
        
        this.MaxDateProcess = ((Number(this.ThisYear) +1)) + "-03-31";
        this.MinDateProcess = this.ThisYear + "-04-01";
        if(this.SearchDayProcess === this.MaxDateProcess){this.NextButton=true;}else{this.NextButton=false}
        if(this.SearchDayProcess === this.MinDateProcess){this.PrevButton=true;}else{this.PrevButton=false}
        /* END:日付制御の処理 年度内の日付しか選択できたいようにする */

        /* 要録検索Apex呼び出し */
        findImportantNotes({
            Year :this.ThisYear,
            Kindergarten : this.ThisKindergarten
        })
        .then(result => {
            this.ImportantNotesList =[];
            this.ImportantNotesList = result;
            /* 要録リストをId名で連想配列にする */
            for(i = 0; i< result.length; i++){
                this.ImportantNotesList2[result[i].Contact__c] = result[i];
            } 
            //console.info("this.ListCreate：要録一覧");
            //console.table(result);
            //console.info(this.ImportantNotesList);
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
        //console.info("this.ClassList");
        //console.log(this.ClassList);
        //console.info("this.BusList");
        //console.log(this.BusList);
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
        if(this.SearchDayProcess === this.MaxDateProcess){this.NextButton=true;}else{this.NextButton=false}
        if(this.SearchDayProcess === this.MinDateProcess){this.PrevButton=true;}else{this.PrevButton=false}
        this.GetKindergartenDiary();
    }


    /********************************
        クラス・バス変更 
    ********************************/
    ChangeClassBus(event){
        let GroupValue = event.target.dataset.value;//クラス名 or バス名
        let v;let i=0;
        this.EnjiList = [];
        this.Group = event.target.dataset.group;//クラス選択：Class or バス選択：Bus
        this.firstDisplay = false;
        if(this.Group === "Class"){
            for(v of this.ImportantNotesList) {
                if(v.Class__c === GroupValue){
                    this.EnjiList.push(v.Contact__c);
                }
            }
        }
        if(this.Group === "Bus"){
            for(v of this.ImportantNotesList) {
                if(v.PassageRoute__c === GroupValue){
                    this.EnjiList.push(v.Contact__c);
                }
            }
        }

        this.GetKindergartenDiary();
    }

    /********************************
        園児日誌を検索
    ********************************/
    GetKindergartenDiary(){
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
        this.Loading = true;

        let SetEnjiList = [];
        let KindergartenDiaryB =[];let i =0;let i2 =0;
        let AbsenceReasonListNow =[];/* 欠席理由を一時的に格納 */
        let AbsenceReasonNow = "";/* Seceltされている欠席理由、空白の場合のClass名を変更する為使う */
        let AbsenceReasonListClass ="";  //欠席理由のスタイル
        let NotRideReasonListNow = [];/* バス理由を一時的に格納 */
        let NotRideReasonNow = "";
        let AttendanceStopListNow = [];
        let AttendanceStopNow = "";

        /* 日報リストをId名で連想配列にする */
        for(i = 0; i< result.length; i++){
            KindergartenDiaryB[result[i].Contact__c] = result[i];
            KindergartenDiaryB[result[i].Contact__c].Number__c = this.ImportantNotesList2[result[i].Contact__c].Number__c;
        }
        console.log("KindergartenDiaryB");
        console.table(KindergartenDiaryB);

        /* 園児に対して日報あるかないか */
        i = 0;
        for(let v of this.EnjiList) {
            
            /* 初期化 */
            AbsenceReasonListNow =[];
            AbsenceReasonListNow = this.SetListValue(this.AbsenceReasonList,true,DefaultValueBase,DefaultValueBase);//JSON.parse(JSON.stringify(this.AbsenceReasonList));
            AbsenceReasonNow = "";
            NotRideReasonListNow =[];
            NotRideReasonListNow = this.SetListValue(this.NotRideReasonList,true,DefaultValueBase,DefaultValueBase);
            NotRideReasonNow = "";
            AttendanceStopListNow = [];
            AttendanceStopListNow = this.SetListValue(this.AttendanceStopList,true,DefaultValueBase,DefaultValueBase);
            AttendanceStopNow = "";
            AbsenceReasonListClass ='selecttype01';
            /* END:初期化 */

            /* 配列であることを宣言 */
            SetEnjiList[i] = [];

            /* 要録情報を表示するリストにセット */
            SetEnjiList[i].Contact__r = [];
            SetEnjiList[i].NotRideReasonList = [];
            SetEnjiList[i].AbsenceReasonList = [];
            SetEnjiList[i].AttendanceStopReasonList = [];
            SetEnjiList[i].Contact__r.kana__c = this.ImportantNotesList2[v].Contact__r.kana__c;
            SetEnjiList[i].Contact__r.PassageRoute__c = this.ImportantNotesList2[v].Contact__r.PassageRoute__c;
            SetEnjiList[i].Contact__c = this.ImportantNotesList2[v].Contact__c;
            SetEnjiList[i].i = i;

            
            /* 日報がある場合 */
            if (KindergartenDiaryB[v]) {
                console.log(v + "の日報はある");
                /* 該当日報の項目をセット */
                SetEnjiList[i].AbsenceReason = KindergartenDiaryB[v].AbsenceReason__c;
                SetEnjiList[i].NotRideReason = KindergartenDiaryB[v].NotRideReason__c;
                SetEnjiList[i].AttendanceStopReason = KindergartenDiaryB[v].AttendanceStopReason__c;
                SetEnjiList[i].kindergartenDiaryId = KindergartenDiaryB[v].Id;
                SetEnjiList[i].AttendanceSchedule = KindergartenDiaryB[v].AttendanceSchedule__c;
                SetEnjiList[i].AttendingSchool = KindergartenDiaryB[v].AttendingSchool__c;
                SetEnjiList[i].GoingBack = KindergartenDiaryB[v].GoingBack__c;
                SetEnjiList[i].AbsentSchedule = KindergartenDiaryB[v].AbsentSchedule__c;
                SetEnjiList[i].NoAttendingSchool = KindergartenDiaryB[v].BusGoingNotUse__c;
                SetEnjiList[i].NoGoingBack = KindergartenDiaryB[v].BusBackNotUse__c;
                console.log("KindergartenDiaryB[v].AbsenceReason");
                console.log(KindergartenDiaryB[v].AbsenceReason);
                
                /* END:該当日報の項目をセット */

                /*  欠席理由の値の数だけループ */  
                for(i2 = 0; i2< AbsenceReasonListNow.length; i2++){
                    /* 園児日誌の欠席理由：欠席理由の値と値の情報が一致したらseletedにして、CSSも追加する */
                    if(AbsenceReasonListNow[i2].value === SetEnjiList[i].AbsenceReason){
                        AbsenceReasonListNow[i2].selected = 'selected';
                        AbsenceReasonNow = AbsenceReasonListNow[i2].value;
                        //後で消す SetEnjiList[i].selectedValue = AbsenceReasonListNow[i2].value;
                        SetEnjiList[i].AbsenceReasonList = AbsenceReasonListNow;
                        break;
                    }
                }
                /* 未選択なら */
                if(SetEnjiList[i].AbsenceReason === undefined || SetEnjiList[i].AbsenceReason ===""){
                    SetEnjiList[i].AbsenceReasonList = AbsenceReasonListNow;
                }
                /*  END:欠席理由の値の数だけループ */  
        

                /*  バス理由の値の数だけループ */  
                for(i2 = 0; i2< NotRideReasonListNow.length; i2++){
                    /* 園児日誌の欠席理由：欠席理由の値と値の情報が一致したらseletedにして、CSSも追加する */
                    if(NotRideReasonListNow[i2].value === SetEnjiList[i].NotRideReason){
                        NotRideReasonListNow[i2].selected = 'selected';
                        NotRideReasonNow = NotRideReasonListNow[i2].value;
                        //後で消す SetEnjiList[i].selectedValue2 = NotRideReasonListNow[i2].value;
                        SetEnjiList[i].NotRideReasonList = NotRideReasonListNow;
                        break;
                    }
                }
                /* 未選択なら */
                if(SetEnjiList[i].NotRideReason === undefined || SetEnjiList[i].NotRideReason ===""){
                    SetEnjiList[i].NotRideReasonList = NotRideReasonListNow;
                }
                /*  END:バス理由の値の数だけループ */  


                /*  出席停止理由の値の数だけループ */  
                for(i2 = 0; i2< AttendanceStopListNow.length; i2++){
                    /* 園児日誌の欠席理由：欠席理由の値と値の情報が一致したらseletedにして、CSSも追加する */
                    if(AttendanceStopListNow[i2].value === SetEnjiList[i].AttendanceStopReason){
                        AttendanceStopListNow[i2].selected = 'selected';
                        AttendanceStopNow = AttendanceStopListNow[i2].value;
                        //後で消す SetEnjiList[i].selectedValue3 = AttendanceStopListNow[i2].value;
                        SetEnjiList[i].AttendanceStopReasonList = AttendanceStopListNow;
                        break;
                    }
                }
                /* 未選択なら */
                if(SetEnjiList[i].AttendanceStopReason === undefined || SetEnjiList[i].AttendanceStopReason ===""){
                    SetEnjiList[i].AttendanceStopReasonList = AttendanceStopListNow;
                }
                /*  END:出席停止理由の値の数だけループ */  
            
            }else{
                /* 園児日誌がない場合 */
                SetEnjiList[i].AbsenceReasonList = AbsenceReasonListNow;
                SetEnjiList[i].NotRideReasonList = NotRideReasonListNow;
                SetEnjiList[i].AttendanceStopReasonList = AttendanceStopListNow;
            }

            /* 
                CSS：Class設定
            */
            /* 出席簿の処理 */
            SetEnjiList[i].AbsenceClass='btn-square gray';
            SetEnjiList[i].AttendanceClass='btn-square gray';
            if(SetEnjiList[i].AbsentSchedule){
                SetEnjiList[i].AbsenceClass='btn-square blue';
            }
            if(SetEnjiList[i].AttendanceSchedule==='出席'){
                SetEnjiList[i].AttendanceClass='btn-square yellow';     
            }
            if(SetEnjiList[i].AttendanceSchedule==='欠席'){
                SetEnjiList[i].AbsenceClass='btn-square yellow';
            }

            /* バス乗車 */
            if(SetEnjiList[i].NoAttendingSchool){
                SetEnjiList[i].NoAttendingSchoolClass='btn-square blue';
            }else{
                SetEnjiList[i].NoAttendingSchool=false;
                SetEnjiList[i].NoAttendingSchoolClass='btn-square gray';
            }
            if(SetEnjiList[i].NoGoingBack){
                SetEnjiList[i].NoGoingBackClass='btn-square blue';
            }else{
                SetEnjiList[i].NoGoingBack=false;
                SetEnjiList[i].NoGoingBackClass='btn-square gray';
            }

            /* バス乗車：登園ボタン処理 */
            if(SetEnjiList[i].AttendingSchool){
                SetEnjiList[i].AttendingSchoolClass='btn-square yellow';
            }else{
                SetEnjiList[i].AttendingSchool=false;
                SetEnjiList[i].AttendingSchoolClass='btn-square gray';
            }

            /* バス乗車：下車ボタン処理 */
            if(SetEnjiList[i].GoingBack){
                SetEnjiList[i].GoingBackClass='btn-square yellow';
            }else{
                SetEnjiList[i].GoingBack=false;
                SetEnjiList[i].GoingBackClass='btn-square gray';
            }

            /* 欠席理由 */ 
            if(SetEnjiList[i].AttendanceSchedule ==='欠席' && AbsenceReasonNow === '' ){
                SetEnjiList[i].AbsenceReasonListClass = AbsenceReasonListClass + 'border_Red ';
            }else{
                SetEnjiList[i].AbsenceReasonListClass = AbsenceReasonListClass;
            }

            /* 出席停止 */ 
                SetEnjiList[i].AttendanceStopListClass = AbsenceReasonListClass;
            /* END:CSS：Class設定 */

            i++;//AttendanceStopListClass
        }
        
        

        console.log("SetEnjiList");
        console.table(SetEnjiList);
        this.ShowEnjiList.length = 0;
        this.ShowEnjiList = [];
        this.ShowEnjiList = SetEnjiList;
        console.log("ShowEnjiList");
        console.log(this.ShowEnjiList);

        //画面表示・非表示の切り替え
        this.Loading = false;

        if(this.Group === 'Bus'){
            this.BusShow = true;
            this.ClassShow = false;
        }
        if(this.Group === 'Class'){
            this.BusShow = false;
            this.ClassShow = true;
        } 
        

    }

    /********************************
        園児日誌を更新する
    ********************************/
    changeType(event){
        let indexs;             //何番目をクリックしたか把握
        let i = 0; 
        let recordInput = {};   //レコード作成・更新用
        let timesstump = this.getCurrentTime();
        let AttendingSchool;let GoingBack;
        let AttendingSchoolClass;let GoingBackClass;
        let NoAttendingSchool;let NoGoingBack;
        let NoAttendingSchoolClass;let NoGoingBackClass;
        let AttendanceClass;let AbsenceClass;
        let AbsenceReason; let AbsenceReasonListClass;
        let AttendanceSchedule;let NotRideReason;
        let AttendanceStopReason;

        /* 連打禁止 */
        if(this.processing){return}
        /* 処理中フラグ */
        this.processing =true;

        event.preventDefault();

        /* 何番目を選択したか */
        indexs = event.target.dataset.i;

        /* 現在の値を仮代入 */
        AttendingSchool = this.ShowEnjiList[indexs].AttendingSchool;
        GoingBack = this.ShowEnjiList[indexs].GoingBack;
        AttendingSchoolClass = this.ShowEnjiList[indexs].AttendingSchoolClass;
        GoingBackClass = this.ShowEnjiList[indexs].GoingBackClass;
        NoAttendingSchool = this.ShowEnjiList[indexs].NoAttendingSchool;     
        NoGoingBack = this.ShowEnjiList[indexs].NoGoingBack;
        NoAttendingSchoolClass = this.ShowEnjiList[indexs].NoAttendingSchoolClass;   
        NoGoingBackClass = this.ShowEnjiList[indexs].NoGoingBackClass;
        AttendanceClass = this.ShowEnjiList[indexs].AttendanceClass;
        AbsenceClass = this.ShowEnjiList[indexs].AbsenceClass;
        AttendanceSchedule = this.ShowEnjiList[indexs].AttendanceSchedule;
        AbsenceReason = this.ShowEnjiList[indexs].AbsenceReason;
        NotRideReason = this.ShowEnjiList[indexs].NotRideReason;
        AttendanceStopReason = this.ShowEnjiList[indexs].AttendanceStopReason;

        AbsenceReasonListClass = 'selecttype01';

        /* 日報レコード作成や更新に必要な項目を代入  */
        /* バス（登園）かバス（降園）かクラスかでセットする項目を変える */
        const fields = {};

        /* 共通 */
        fields[ID_FIELD.fieldApiName] = event.target.dataset.kindergartendiaryid;       //日報ID
        fields[DATE_FIELD.fieldApiName] = this.SearchDayProcess;                              //今日の日付
        fields[ENGJIID_FIELD.fieldApiName] = this.ShowEnjiList[indexs].Contact__c; //関連園児ID
        fields[STAFFID_FIELD.fieldApiName] = this.StaffId;

        /* クラス：出席・欠席の場合 */
        if(event.target.dataset.group === 'Class'){
            fields[AS_FIELD.fieldApiName] = event.target.dataset.value;                     //出席予定
            AttendanceSchedule = event.target.dataset.value;
            fields[ASTIME_FIELD.fieldApiName] = timesstump;                                 //出席欠席した時間
            if(event.target.dataset.value ==='出席'){
                //すでに出席だったら
                if(this.ShowEnjiList[indexs].AttendanceSchedule === '出席'){
                    fields[AS_FIELD.fieldApiName] ='';
                    AttendanceSchedule ='';
                    fields[ASTIME_FIELD.fieldApiName] ='';
                    AttendanceClass='btn-square gray';
                    AbsenceReasonListClass='selecttype01';
                //出席
                }else{
                    AttendanceClass='btn-square yellow';
                    AbsenceReasonListClass='selecttype01';
                    if(this.ShowEnjiList[indexs].AbsentSchedule){                             //欠席予定だったら、欠席をblueにしてあげる
                        AbsenceClass='btn-square blue';
                    }else{
                        AbsenceClass='btn-square gray';  
                    }
                }
            }else{
                //すでに欠席だったら
                if(this.ShowEnjiList[indexs].AttendanceSchedule === '欠席'){
                    fields[AS_FIELD.fieldApiName] ='';
                    AttendanceSchedule ='';
                    fields[ASTIME_FIELD.fieldApiName] ='';
                    AbsenceReasonListClass='selecttype01';
                    if(this.ShowEnjiList[indexs].AbsentSchedule){                             //欠席予定だったら、欠席をblueにしてあげる
                        AbsenceClass='btn-square blue';
                    }else{
                        AbsenceClass='btn-square gray';  
                    }
                    
                //欠席
                }else{
                    AttendanceClass='btn-square gray';  
                    AbsenceClass='btn-square yellow';
                    //欠席理由がなしなら赤枠に切り替える
                    if(AbsenceReason===undefined || AbsenceReason===''){
                        AbsenceReasonListClass='border_Red selecttype01';
                    }
                }
            }
        }
        /* END:クラス：出席・欠席の場合 */

        /* クラス：欠席理由の場合 */
        if(event.target.dataset.group === 'Reason'){
            if(event.target.value===DefaultValueBase || event.target.value==='' || event.target.value===undefined){
                fields[ABSENCEREASON_FIELD.fieldApiName] = '';
                AbsenceReason = '';

                if(this.ShowEnjiList[indexs].AttendanceSchedule ==='欠席'){
                    AbsenceReasonListClass='border_Red selecttype01';
                }else{
                    AbsenceReasonListClass='selecttype01';
                }
            }else{
                fields[ABSENCEREASON_FIELD.fieldApiName] = event.target.value;
                AbsenceReason = event.target.value;
                //AbsenceReasonListClass='blue';
            }
        }  
        /* END:クラス：欠席理由の場合 */

        /* クラス：出席停止理由の場合 */
        if(event.target.dataset.group === 'StopReason'){
            if(event.target.value===DefaultValueBase || event.target.value==='' || event.target.value===undefined){
                fields[ATTENDANCESTOPREASON_FIELD.fieldApiName] = '';
                AttendanceStopReason = '';
            }else{
                fields[ATTENDANCESTOPREASON_FIELD.fieldApiName] = event.target.value;
                AttendanceStopReason = event.target.value;
                //AbsenceReasonListClass='blue';
            }
        }  
        /* END:クラス：出席停止理由の場合 */

        /* バス：登園の場合 */
        if(event.target.dataset.group === 'Bus' && event.target.dataset.value === '登園'){
            /* ON・OFFスイッチ */
            if(this.ShowEnjiList[indexs].AttendingSchool){
                fields[TOUEN_FIELD.fieldApiName] = false;                                       //登園チェック
                fields[TOUENTIME_FIELD.fieldApiName] = '';                                      //登園時間
                AttendingSchool=false;
                AttendingSchoolClass='btn-square gray';
            }else{
                fields[TOUEN_FIELD.fieldApiName] = true;                                         //登園チェック
                fields[TOUENTIME_FIELD.fieldApiName] = timesstump;                               //登園時間
                AttendingSchool=true;
                AttendingSchoolClass='btn-square yellow';
            }
        }
        /* END:バス：登園の場合 */

        /* バス：降園の場合 */
        if(event.target.dataset.group === 'Bus' && event.target.dataset.value === '降園'){
             /* ON・OFFスイッチ */
             if(this.ShowEnjiList[indexs].GoingBack){
                fields[KOUEN_FIELD.fieldApiName] = false;                                        //登園チェック
                fields[KOUENTIME_FIELD.fieldApiName] = '';                                       //登園時間
                GoingBack=false;
                GoingBackClass='btn-square gray';
            }else{
                fields[KOUEN_FIELD.fieldApiName] = true;                                         //登園チェック
                fields[KOUENTIME_FIELD.fieldApiName] = timesstump;                               //登園時間
                GoingBack=true;
                GoingBackClass='btn-square yellow';
            }
        }
        /* END:バス：降園の場合 */


        /* バス：行き利用なし */
        if(event.target.dataset.group === 'Bus' && event.target.dataset.value === '行き利用しない'){
            /* ON・OFFスイッチ */
            if(this.ShowEnjiList[indexs].NoAttendingSchool){
               fields[GONOTUSE_FIELD.fieldApiName] = false;                                        //登園チェック
               NoAttendingSchool=false;
               NoAttendingSchoolClass='btn-square gray';
           }else{
               fields[GONOTUSE_FIELD.fieldApiName] = true;                                         //登園チェック
               NoAttendingSchool=true;
               NoAttendingSchoolClass='btn-square blue';
           }
        }
        /* END:バス：行き利用なし */

        /* バス：帰り利用なし */
        if(event.target.dataset.group === 'Bus' && event.target.dataset.value === '帰り利用しない'){
            /* ON・OFFスイッチ */
            if(this.ShowEnjiList[indexs].NoGoingBack){    
                fields[BACKNOTUSE_FIELD.fieldApiName] = false;                                        //登園チェック
                NoGoingBack=false;
                NoGoingBackClass='btn-square gray';
            }else{
                fields[BACKNOTUSE_FIELD.fieldApiName] = true;                                         //登園チェック
                NoGoingBack=true;
                NoGoingBackClass='btn-square blue';
            }
        }
        /* END:バス：帰り利用なし */

        /* バス：バス理由の場合 */
        if(event.target.dataset.group === 'RideReason'){
            if(event.target.value===DefaultValueBase || event.target.value==='' || event.target.value===undefined){
                fields[NOTRIDEREASON_FIELD.fieldApiName] = '';
                NotRideReason = '';
            }else{
                fields[NOTRIDEREASON_FIELD.fieldApiName] = event.target.value;
                NotRideReason = event.target.value;
                //AbsenceReasonListClass='blue';
            }
        }  
        /* END:バス：バス理由の場合 */

        //もし選んだ要録に日報IDがセットされてなかったら日報を作成し、セットされてたら日報を更新
        if(fields[ID_FIELD.fieldApiName]=== undefined || fields[ID_FIELD.fieldApiName]=== ''){
        
            recordInput = {apiName: KindergartenDiary_OBJECT.objectApiName, fields };   //作成する情報をセット

            createRecord(recordInput)  
            .then(result => {   //レコード作成に成功したら
                //表示用の配列情報を更新する
                this.ShowEnjiList[indexs].kindergartenDiaryId = result.id;                   //作成したレコードIDを表示用の変数に戻してあげる：再描写
                this.ShowEnjiList[indexs].AttendanceSchedule = AttendanceSchedule;//作成した出席情報を表示用の変数に戻してあげる：再描写
                this.ShowEnjiList[indexs].AttendingSchool = AttendingSchool;
                this.ShowEnjiList[indexs].AttendingSchoolClass = AttendingSchoolClass;
                this.ShowEnjiList[indexs].GoingBack = GoingBack;
                this.ShowEnjiList[indexs].GoingBackClass = GoingBackClass;
                this.ShowEnjiList[indexs].NoAttendingSchool = NoAttendingSchool;
                this.ShowEnjiList[indexs].NoAttendingSchoolClass = NoAttendingSchoolClass;
                this.ShowEnjiList[indexs].NoGoingBack = NoGoingBack;
                this.ShowEnjiList[indexs].NoGoingBackClass = NoGoingBackClass;
                this.ShowEnjiList[indexs].AttendanceClass = AttendanceClass;
                this.ShowEnjiList[indexs].AbsenceClass = AbsenceClass;
                this.ShowEnjiList[indexs].AbsenceReasonListClass = AbsenceReasonListClass;
                this.ShowEnjiList[indexs].AbsenceReason = AbsenceReason;
                this.ShowEnjiList[indexs].NotRideReason = NotRideReason;
                this.ShowEnjiList[indexs].AttendanceStopReason = AttendanceStopReason;
                this.processing =false;
                console.log('作成OK');

            })
            .catch(() => {   //レコード作成に失敗したら
                //ポップアップでエラーメッセージを出す
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'レコードクリエイト：エラー',
                        message: '園児日報を作成できませんでした。',
                        variant: 'error'
                    })
                );
            });
        //日報を更新
        }else{
            recordInput = { fields };
            updateRecord(recordInput)
            .then(() => {
                this.ShowEnjiList[indexs].AttendanceSchedule = AttendanceSchedule;
                this.ShowEnjiList[indexs].AttendingSchool = AttendingSchool;
                this.ShowEnjiList[indexs].AttendingSchoolClass = AttendingSchoolClass;
                this.ShowEnjiList[indexs].GoingBack = GoingBack;
                this.ShowEnjiList[indexs].GoingBackClass = GoingBackClass;
                this.ShowEnjiList[indexs].NoAttendingSchool = NoAttendingSchool;
                this.ShowEnjiList[indexs].NoAttendingSchoolClass = NoAttendingSchoolClass;
                this.ShowEnjiList[indexs].NoGoingBack = NoGoingBack;
                this.ShowEnjiList[indexs].NoGoingBackClass = NoGoingBackClass;
                this.ShowEnjiList[indexs].AttendanceClass = AttendanceClass;
                this.ShowEnjiList[indexs].AbsenceClass = AbsenceClass;
                this.ShowEnjiList[indexs].AbsenceReasonListClass = AbsenceReasonListClass;
                this.ShowEnjiList[indexs].AbsenceReason = AbsenceReason;
                this.ShowEnjiList[indexs].NotRideReason = NotRideReason;
                this.ShowEnjiList[indexs].AttendanceStopReason = AttendanceStopReason;
                this.processing =false;
                console.log('更新OK');
            })
            .catch(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'レコードアップデート：エラー',
                        message: '園児日報を更新できませんでした。',
                        variant: 'error'
                    })
                );
            });
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


    /********************************
        現在時刻取得（yyyy/mm/ddThh:mm:ss.000Z）
    ********************************/
    getCurrentTime() {
        let now = new Date();
        let res;
        now.setHours(now.getHours() - 9);//Salesforceに取り込んだときにずれる
        res = "" + now.getFullYear() + "-" + this.padZero(now.getMonth() + 1) + 
            "-" + this.padZero(now.getDate()) + "T" + this.padZero(now.getHours()) + ":" + 
            this.padZero(now.getMinutes()) + ":" + this.padZero(now.getSeconds()) + ".000Z";
        return res;
    }
    
    /********************************
        先頭ゼロ付加
    ********************************/
    padZero(num) {
        let result;
        if (num < 10) {
            result = "0" + num;
        } else {
            result = "" + num;
        }
        return result;
    }
    /* END:先頭ゼロ付加 */

    /********************************
        日付を文字列に変換
    ********************************/
    ChangeText(TargeDate) {
        return TargeDate.getFullYear() + "年" + (TargeDate.getMonth() + 1) + "月"+ TargeDate.getDate() + "日(" + Week[TargeDate.getDay()] + ")";
    }
    /* END:日付を文字列に変換 */

    /********************************
        日付を処理用に変換
    ********************************/
    ChangeProcess(TargeDate) {
        return TargeDate.getFullYear() + "-" + this.padZero((TargeDate.getMonth() + 1)) + "-"+ this.padZero(TargeDate.getDate());
    }
    /* END:日付を処理用に変換 */





}