import { LightningElement,wire,track } from 'lwc';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TYPE_Class from '@salesforce/schema/ImportantNotes__c.Class__c';
import TYPE_OUTSIDEFAST from '@salesforce/schema/KindergartenDiary__c.OutsideFast__c';
import TYPE_OUTSIDE from '@salesforce/schema/KindergartenDiary__c.Outside__c';
import ABSENCE_REASON from '@salesforce/schema/KindergartenDiary__c.AbsenceReason__c';


/* APEX Class呼び出し */
import findImportantNotes from '@salesforce/apex/ImportantNotesController.findImportantNotes2';
import findKindergartenDiary from '@salesforce/apex/ImportantNotesController.findKindergartenDiary_OrList';
import findStaff from '@salesforce/apex/ImportantNotesController.findStaff';
import upsertKindergartenDiary from '@salesforce/apex/ImportantNotesController.upsertKindergartenDiary';

/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

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

export default class OvertimeReservation extends LightningElement {
    processing = false;
    today = new Date();
    valuenone = '-- なし --';
    todayDate = this.today.getFullYear() + this.padZero((this.today.getMonth() + 1)) + this.padZero(this.today.getDate());
    @track mainmenu = false;                    /* 職員選択用 */
    @track searchDate = this.today.getFullYear() + "-" + (this.today.getMonth() + 1) + "-"+ this.today.getDate(); /* 要録の年度取得に使用 */
    @track searchMonth = this.today;            /* どの月の情報を見るかの初期値 */
    @track monthnow;                            /* 今開いている月 */
    @track Nend;
    @track EnjiListValue = [];                  /* 園児リストの値を収納 */
    @track overtimeReservationList = [];        /* 日毎リスト */
    @track listDisplay = false;                 /* 日毎の一覧画面は最初は非表示 */
    @track placeholder = "クラスを選択してください";/* 園児リストの初期メッセージ */
    @track EnjiID;                              /* 日毎リスト検索用に使用 */
    @track OutsideFast;                         /* 園児日誌の時間外保育：早朝の選択リストの値を保有 */
    @track Outside;                             /* 園児日誌の時間外保育の選択リストの値を保有 */
    @track nameValue;   
    @track StaffList;                           /* 職員選択用 */
    @track mainmenu = false;                    /* 職員選択用 */
    @track errorSfattMenu;                      /* 職員選択用 */
    StaffId;                                    /* 職員選択用：ID保持 */


    /* onload初回の処理 */
    connectedCallback() {
        //今日の年度を設定 1~3月なら年度は-1
        if(this.searchMonth.getMonth() < 3 ){
             this.Nend = this.today.getFullYear()-1;
        }else{
            this.Nend = this.today.getFullYear();
        }

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
        職員一覧を取得：初回のみ
    ------------------------ */
    @wire(findStaff)
    findStaffs({ error, data }) {
        var i;var karilist = [];
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

    /* ------------------------
        欠席理由の値を取得：初回のみ
    ------------------------ */
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: ABSENCE_REASON
    })
    AbsenceReasonList;

    //要録obj クラスの値を取得
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_Class
    })
    picklistValues;

    //園児日誌obj 時間外保育:早朝の値を取得
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_OUTSIDEFAST
    })
    OutsideFast;

    //園児日誌obj 時間外保育の値を取得
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_OUTSIDE
    })
    Outside;
    /* END:学級一覧を取得 */


    /* ------------------------
        クラス選択で 園児一覧を取得
    ------------------------ */
    selectStaff(event){
        this.StaffId = event.target.value;
        this.mainmenu = true;
    }


    /* ------------------------
        クラス選択で 園児一覧を取得
    ------------------------ */
    links(event){
        /* 変数をセット */
        var ImportantNoteList;                      //要録一覧を一旦格納
        var value = event.target.dataset.value;
        var TemporarilyEnjiList = [];               //園児一覧を一時保存
        var i;                                      //forループ用1

        /* 初期化 */
        this.EnjiListValue = [];                    //@track EnjiListValue を初期化
        this.placeholder = value + '一覧';
        this.nameValue = '';
        
        /* 並列処理?的な */
        async function merge(searchDate){
            ImportantNoteList = await (
            /* 
                要録一覧を取得 
            */
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

        /* 要録一覧取得後の処理 */
        merge(this.searchDate).then(
            () => {
                /* 要録一覧から園児名と園児IDを取得する */
                for(i = 0; i< ImportantNoteList.length; i++){
                    TemporarilyEnjiList[i] = { 
                        label: ImportantNoteList[i].Contact__r.kana__c, 
                        value: ImportantNoteList[i].Contact__r.Id 
                    };
 
                    //if(i =1){this.placeholder = value + '一覧';}      //選択リストの初期メッセージを変更
                    /*
                        直接  this.EnjiListValue[i] ={*****};はできない
                    */

                    
                }
                //園児リストを更新
                this.EnjiListValue = TemporarilyEnjiList;

            }
        )

    }
    /* END:クラス選択で 園児一覧を取得 */


    /* ------------------------------------------------
        園児リスト選択 OR 月変更で1ヶ月分の予定をだす
    ------------------------------------------------ */
    handleChange(event,Redes){
        /* 変数をセット */
        var toMonthStart;                             //月初めjsループ用
        var toMonthStartText;                         //月初め表示用：「YYYY年M月D日」
        var toMonthStartText2;                        //月初め検索用：「YYYY-MM-DD」
        var toMonthStartText3;                        //月初め検索用：「YYYYMMDD」
        var ThisDate;
        var StartDate;                                //月初めSOQL検索用
        var ToMonthEnd;                               //月末jsループ用
        var EndDate;                                  //月末SOQL検索用
        var week = ["日","月","火","水","木","金","土"];//曜日
        var i;var i2;var i3;                          //ループ用1、2、3
        var changetype ;                              //園児リストを選択した場合は、園児IDが入る
        var KindergartenDiaryList;                    //園児日誌主著区
        var TemporarilyOvertimeReservationList =[];   //日毎リストの一時格納
        var OnedayBox =[];                            //一日ごとの情報を一時格納
        var OutsideFastListNow = [];                  //時間外保育：早朝の値とselected情報を一時格納
        var OutsideListNow = [];                      //時間外保育の値とselected情報を一時格納
        var AbsenceReasonListNow = [];                //欠席理由の値とselected情報を一時格納
        var AbsenceReasonListClass;                   //欠席理由のスタイル
        var AbsenceReasonNow;                         //欠席理由のselectされている値
        var events;
        if(Redes === undefined){
            events = event.target.dataset.value;
            changetype = event.target.name;
        }else{
            events = Redes;
            changetype = '';
        }
        // eslint-disable-next-line no-console
        console.log('events'+events);
        // eslint-disable-next-line no-console
        console.log('changetype'+changetype);
        
        
        /* 初期化 */
        this.listDisplay = true;                      //初回のみ、一覧リストエリアを表示にする
        this.overtimeReservationList =[];             //日毎リストを初期化

        /* 
            年度に表示月をあわせる
            月変更ボタンを押したらthis.searchMonthの月を変更する
        */
        if(!(events === undefined)){
            if(events === 'ToMonth'){
                this.searchMonth = new Date();
            }else{
                this.searchMonth.setMonth(events -1);
            }
            
            //年度に合わせる
            if(this.searchMonth.getMonth() < 3 ){
                this.searchMonth.setFullYear(this.Nend + 1);
            }else{
                this.searchMonth.setFullYear(this.Nend);
            }
        }

        this.monthnow = events;
        
        /* this.searchMonthを元に月初めと月末を取得 */
        toMonthStart = new Date(this.searchMonth.getFullYear(), this.searchMonth.getMonth(), 1);
        ToMonthEnd = new Date(this.searchMonth.getFullYear(), this.searchMonth.getMonth()+ 1, 0);

        /* 園児日誌検索に必要な情報をセット */
        StartDate = toMonthStart.getFullYear() + "-" + (toMonthStart.getMonth() + 1) + "-"+ toMonthStart.getDate();
        EndDate = ToMonthEnd.getFullYear() + "-" + (ToMonthEnd.getMonth() + 1) + "-"+ ToMonthEnd.getDate();
        if(changetype === 'changeName'){ this.EnjiID = event.target.value}

        /* 並列処理?的な */
        async function merge2(StartDate2,EndDate2,EnjiID2){
            /* 日付で条件を絞り園児日報一覧を取得 */
            KindergartenDiaryList = await (
            findKindergartenDiary({
                    StartDate : StartDate2,
                    EndDate : EndDate2,
                    EnjiID : EnjiID2

                })//日付を送り込む
                .then(result => {
                    return result;
                })
                .catch(error => {
                    return error;//考えてあげなきゃいけない
                })
            )
        }

        /* 園児日誌一覧取得後の処理 */
        merge2(StartDate,EndDate,this.EnjiID).then(
            () => {
                
                /* toMonthStartText2をループ用に形成 */
                toMonthStartText2= toMonthStart.getFullYear() + '-' + this.padZero((toMonthStart.getMonth() + 1)) + '-' + this.padZero(toMonthStart.getDate());


                /* 1日~末日まで一日ごとにループ */
                for(i=0;toMonthStart <= ToMonthEnd; toMonthStart.setDate(toMonthStart.getDate() + 1),i++){
                    /* 初期化*/
                    OnedayBox=[];             //一日ごとの一時格納情報を初期化
                    OutsideListNow =[];       //時間外保育の値を初期化
                    OutsideFastListNow =[];   //時間外保育：早朝の値を初期化
                    AbsenceReasonListNow=[]; /* 欠席理由を初期化 */
                    AbsenceReasonListClass ='';
                    AbsenceReasonNow = '';

                    /* 時間外保育の選択リストの値を再取得 */
                    OutsideListNow[0] = {value: this.valuenone ,selected: ''};
                    for(i3 = 0; i3< this.Outside.data.values.length; i3++){
                        OutsideListNow[i3+1] = {
                            value : this.Outside.data.values[i3].value,
                            selected: ''
                        }
                    }
                    /* 時間外保育早朝の選択リストを再取得 */
                    OutsideFastListNow[0] = {value: this.valuenone,selected: ''};
                    for(i3 = 0; i3< this.OutsideFast.data.values.length; i3++){
                        OutsideFastListNow[i3+1] = {
                            value : this.OutsideFast.data.values[i3].value,
                            selected: ''
                        }
                    }

                    /* 欠席理由の選択リストの値を再取得 */
                    AbsenceReasonListNow[0] = {value: this.valuenone ,selected: ''};
                    for(i3 = 0; i3< this.AbsenceReasonList.data.values.length; i3++){
                        AbsenceReasonListNow[i3+1] = {
                            value : this.AbsenceReasonList.data.values[i3].value,
                            selected: ''
                        }
                    }

                    /* 日付と検索用の日付をセット */
                    ThisDate = toMonthStart.getFullYear() + this.padZero((toMonthStart.getMonth() + 1)) + this.padZero(toMonthStart.getDate());
                    toMonthStartText = toMonthStart.getFullYear() + '年' + (toMonthStart.getMonth() + 1) + '月'+ toMonthStart.getDate()+ '日' ;
                    toMonthStartText2= toMonthStart.getFullYear() + '-' + this.padZero((toMonthStart.getMonth() + 1)) + '-' + this.padZero(toMonthStart.getDate());
                    toMonthStartText3= toMonthStart.getFullYear() + this.padZero((toMonthStart.getMonth() + 1)) + this.padZero(toMonthStart.getDate());

                    
                    /* 園児日誌をループ */
                    for(i2 = 0; i2< KindergartenDiaryList.length; i2++){
                        
                        /* 園児日誌のDate__CとtoMonthStartText2が一致した場合、情報をセット */
                        if(KindergartenDiaryList[i2].Date__c === toMonthStartText2 ){
                            OnedayBox.Id = KindergartenDiaryList[i2].Id;
                            OnedayBox.OutsideFast  = KindergartenDiaryList[i2].OutsideFast__c;
                            OnedayBox.Outside = KindergartenDiaryList[i2].Outside__c;
                            OnedayBox.AbsentSchedule = KindergartenDiaryList[i2].AbsentSchedule__c;
                            OnedayBox.NoAttendingSchool = KindergartenDiaryList[i2].BusGoingNotUse__c;
                            OnedayBox.NoGoingBack = KindergartenDiaryList[i2].BusBackNotUse__c;

                            /* 時間外保育：早朝の値の数だけループ */  
                            for(i3 = 0; i3< OutsideFastListNow.length; i3++){
                                /* 園児日誌の時間外保育：早朝の情報と値の情報が一致したらseletedにして、CSSも追加する */
                                if(OutsideFastListNow[i3].value === KindergartenDiaryList[i2].OutsideFast__c){
                                    OutsideFastListNow[i3].selected = 'selected';
                                    OnedayBox.OutsideFastClass='blue';
                                }
                            }

                            /* 時間外保育の値の数だけループ */
                            for(i3 = 0; i3< OutsideListNow.length; i3++){

                                /* 園児日誌の時間外保育の情報と値の情報が一致したらseletedにして、CSSも追加する */
                                if(OutsideListNow[i3].value === KindergartenDiaryList[i2].Outside__c){
                                    OutsideListNow[i3].selected = 'selected';
                                    OnedayBox.OutsideClass='blue';
                                }
                            }

                            /*  欠席理由の値の数だけループ */  
                            for(i3 = 0; i3< AbsenceReasonListNow.length; i3++){
                                /* 園児日誌の欠席理由：欠席理由の値と値の情報が一致したらseletedにして、CSSも追加する */
                                if(AbsenceReasonListNow[i3].value === KindergartenDiaryList[i2].AbsenceReason__c){
                                    AbsenceReasonListNow[i3].selected = 'selected';
                                    AbsenceReasonNow = AbsenceReasonListNow[i3].value;
                                    OnedayBox.selectedValue = AbsenceReasonListNow[i3].value;
                                    //AbsenceReasonListClass='blue';
                                }
                            }

                            
                        }
                    
                    }/* 園児日誌をループ END */
                    

                    /* その日に園児日誌レコードが登録されてない場合の初期値をセット */
                    if(!OnedayBox.Id){OnedayBox.Id = undefined}
                    if(!OnedayBox.AbsentSchedule){
                        OnedayBox.AbsentSchedule = false;
                        OnedayBox.AbsentScheduleClass ='btn-square gray'
                    }else{
                        OnedayBox.AbsentScheduleClass ='btn-square yellow'
                    }
                    if(!OnedayBox.OutsideFastClass){
                        OnedayBox.OutsideFastClass = 'slds-select';
                    }else{
                        OnedayBox.OutsideFastClass += ' slds-select';
                    }
                    if(!OnedayBox.OutsideClass){
                        OnedayBox.OutsideClass = 'slds-select';
                    }else{
                        OnedayBox.OutsideClass += ' slds-select';
                    }
                    if(OnedayBox.NoAttendingSchool){
                        OnedayBox.NoAttendingSchoolClass ='btn-square yellow'
                    }else{
                        OnedayBox.NoAttendingSchoolClass ='btn-square gray'
                    }
                    if(OnedayBox.NoGoingBack){
                        OnedayBox.NoGoingBackClass ='btn-square yellow'
                    }else{
                        OnedayBox.NoGoingBackClass ='btn-square gray'
                    }
                    /* 欠席理由 */ 
                    if(OnedayBox.AbsentSchedule ===true && AbsenceReasonNow === '' ){
                        OnedayBox.AbsenceReasonListClass = 'border_Red';
                    }else{
                        OnedayBox.AbsenceReasonListClass = AbsenceReasonListClass;
                    }
                    OnedayBox.AbsenceReasonList = AbsenceReasonListNow;




                    //過去だったらdisabled
                    if( ThisDate < this.todayDate ){
                        OnedayBox.OutsideFastDisabled = 'disabled';
                        OnedayBox.OutsideDisabled = 'disabled';
                        OnedayBox.AbsentDisabled = 'disabled';
                        OnedayBox.AbsenceReasonDisabled = 'disabled';
                        OnedayBox.NoAttendingSchoolDisabled = 'disabled';
                        OnedayBox.NoGoingBackDisabled = 'disabled';
                        
                    }

                    /* 一日の情報を取りまとめる */
                    TemporarilyOvertimeReservationList[i] = {
                        date : toMonthStartText,
                        date2 : toMonthStartText2,
                        date3 : toMonthStartText3,
                        week : '（' + week[toMonthStart.getDay()] + '）',
                        weeknum : toMonthStart.getDay(),
                        KdID : OnedayBox.Id,
                        OutsideClass :OnedayBox.OutsideClass,
                        OutsideFastClass : OnedayBox.OutsideFastClass,
                        Outside : OnedayBox.Outside,
                        OutsideFast : OnedayBox.OutsideFast,
                        AbsentSchedule : OnedayBox.AbsentSchedule,
                        AbsentScheduleClass :OnedayBox.AbsentScheduleClass,
                        OutsideListValue : OutsideListNow,
                        OutsideFastListValue : OutsideFastListNow,
                        OutsideFastDisabled : OnedayBox.OutsideFastDisabled,
                        OutsideDisabled : OnedayBox.OutsideDisabled,
                        AbsentDisabled : OnedayBox.AbsentDisabled,
                        AbsenceReasonDisabled : OnedayBox.AbsenceReasonDisabled,
                        NoAttendingSchoolDisabled : OnedayBox.NoAttendingSchoolDisabled,
                        NoGoingBackDisabled : OnedayBox.NoGoingBackDisabled,
                        selectedValue :OnedayBox.selectedValue,
                        AbsenceReasonList : AbsenceReasonListNow,
                        NoAttendingSchool : OnedayBox.NoAttendingSchool,
                        NoGoingBack : OnedayBox.NoGoingBack,
                        NoAttendingSchoolClass : OnedayBox.NoAttendingSchoolClass,
                        NoGoingBackClass : OnedayBox.NoGoingBackClass,
                        AbsenceReasonListClass : OnedayBox.AbsenceReasonListClass,
                    };
                    
                    

                }/* 1日~末日まで一日ごとにループ END */
                
                /* 最後に表示用のリストに情報をセットする */
                this.overtimeReservationList = TemporarilyOvertimeReservationList;

            }
        )
    }
    /* END:園児リスト選択 OR 月変更で1ヶ月分の予定をだす */


    /* ------------------------
        園児日誌を作成 OR 更新：選択リストを変更・欠席ボタンを押す
    ------------------------ */
    upsertEvent(event){
        /* 日付で条件を絞り園児日報一覧を取得 */
        /* 変数をセット */
        var indexs;             //何番目をクリックしたか把握
        var i ;                 //ループ用
        var recordInput = {};   //レコード作成・更新用
        var choiseType;
        var AbsentSchedule;
        var AbsentScheduleClassNow;
        var OutsideFastClassNow;
        var OutsideClassNow;
        var NoAttendingSchoolClass;
        var NoGoingBackClass;
        var NoAttendingSchool;
        var NoGoingBack;
        var AbsenceReason;
        var AbsenceReasonListClass;
        

        /* 連打禁止 */
        if(this.processing){return}
        /* 処理中フラグ */
        this.processing =true;

        /* 条件をセット */        
        
        choiseType = event.target.dataset.type;

        for(i = 0; i < this.overtimeReservationList.length; i++) {
            if(this.overtimeReservationList[i].date2 === event.target.dataset.date2) {
                indexs = i;
            }
        }

        /* 初期値セット */
        AbsentSchedule = this.overtimeReservationList[indexs].AbsentSchedule;
        AbsentScheduleClassNow = this.overtimeReservationList[indexs].AbsentScheduleClass;
        OutsideClassNow = this.overtimeReservationList[indexs].OutsideClass;
        OutsideFastClassNow = this.overtimeReservationList[indexs].OutsideFastClass;
        NoAttendingSchool = this.overtimeReservationList[indexs].NoAttendingSchool;
        NoGoingBack = this.overtimeReservationList[indexs].NoGoingBack;
        NoAttendingSchoolClass = this.overtimeReservationList[indexs].NoAttendingSchoolClass;
        NoGoingBackClass = this.overtimeReservationList[indexs].NoGoingBackClass;
        AbsenceReason = this.overtimeReservationList[indexs].AbsenceReason;
        AbsenceReasonListClass = this.overtimeReservationList[indexs].AbsenceReasonListClass;

        /* 項目の値をセット */
        const fields = {};
        
        /* 共通 */
            fields[ID_FIELD.fieldApiName] = event.target.dataset.kdid;      //日報ID
            fields[DATE_FIELD.fieldApiName] = event.target.dataset.date2;   //今日の日付
            fields[ENGJIID_FIELD.fieldApiName] = this.EnjiID;               //関連園児ID
            fields[STAFFID_FIELD.fieldApiName] = this.StaffId;

        /* 時間外保育：早朝 */
        if(choiseType === 'OutsideFast'){
            if(event.target.value === this.valuenone){
                fields[OUTSIDEFAST_FIELD.fieldApiName] = '';
                OutsideFastClassNow = 'slds-select';
            }else{
                fields[OUTSIDEFAST_FIELD.fieldApiName] = event.target.value;
                OutsideFastClassNow = 'blue slds-select';
            }
            
        }

        /* 時間外保育 */
        if(choiseType === 'Outside'){
            if(event.target.value===this.valuenone){
                fields[OUTSIDE_FIELD.fieldApiName] = '';
                OutsideClassNow = 'slds-select';
            }else{
                fields[OUTSIDE_FIELD.fieldApiName] = event.target.value;
                OutsideClassNow = 'blue slds-select';
            }
        }

        /* 欠席ボタン */
        if(choiseType === 'Absent'){
            if(event.target.value==='true'){
                fields[ABSENT_FIELD.fieldApiName] = false;
                AbsentSchedule = false;
                AbsentScheduleClassNow = 'btn-square gray';
                AbsenceReasonListClass='';
            }else{
                fields[ABSENT_FIELD.fieldApiName] = true;
                AbsentSchedule = true;
                AbsentScheduleClassNow = 'btn-square yellow';
                //欠席理由がなしなら赤枠に切り替える
                if(AbsenceReason===undefined || AbsenceReason===''){
                    AbsenceReasonListClass='border_Red';
                }
            }
        }

        /* 欠席理由ボタン */
        if(choiseType === 'reason'){
            if(event.target.value===this.valuenone || event.target.value==='' || event.target.value===undefined){
                fields[ABSENCEREASON_FIELD.fieldApiName] = '';
                AbsenceReason = '';

                if(AbsentSchedule){
                    AbsenceReasonListClass='border_Red';
                }else{
                    AbsenceReasonListClass='';
                }
            }else{
                fields[ABSENCEREASON_FIELD.fieldApiName] = event.target.value;
                AbsenceReasonListClass='';
                AbsenceReason = event.target.value;
                //AbsenceReasonListClass='blue';
            }
        }

        /* バス行き帰り */
        if(choiseType === 'bus'){
            if(event.target.dataset.value==='行き利用しない'){
                if(NoAttendingSchool){
                    fields[GONOTUSE_FIELD.fieldApiName] = false;
                    NoAttendingSchool = false;
                    NoAttendingSchoolClass = 'btn-square gray';
                }else{
                    fields[GONOTUSE_FIELD.fieldApiName] = true;
                    NoAttendingSchool = true;
                    NoAttendingSchoolClass = 'btn-square yellow';
                }         
            }else if(event.target.dataset.value==='帰り利用しない'){
                if(NoGoingBack){
                    fields[BACKNOTUSE_FIELD.fieldApiName] = false;
                    NoGoingBack = false;
                    NoGoingBackClass = 'btn-square gray';
                }else{
                    fields[BACKNOTUSE_FIELD.fieldApiName] = true;
                    NoGoingBack = true;
                    NoGoingBackClass = 'btn-square yellow';
                }

            }  
        }




        /* IDを見て、新規作成か更新か */
        if(fields[ID_FIELD.fieldApiName] === 'false' || fields[ID_FIELD.fieldApiName] === undefined){
            
            /* 新規作成 */
            recordInput = {apiName: KindergartenDiary_OBJECT.objectApiName, fields };   //作成する情報をセット
            createRecord(recordInput)  
            .then(result => {   //レコード作成に成功したら
                //表示用の配列情報を更新する
                this.overtimeReservationList[indexs].KdID = result.id;
                this.overtimeReservationList[indexs].AbsentSchedule = fields[ABSENT_FIELD.fieldApiName];
                this.overtimeReservationList[indexs].AbsentScheduleClass = AbsentScheduleClassNow;
                this.overtimeReservationList[indexs].OutsideFastClass = OutsideFastClassNow;
                this.overtimeReservationList[indexs].OutsideClass = OutsideClassNow;
                this.overtimeReservationList[indexs].NoAttendingSchoolClass = NoAttendingSchoolClass;
                this.overtimeReservationList[indexs].NoGoingBackClass = NoGoingBackClass;
                this.overtimeReservationList[indexs].NoAttendingSchool = NoAttendingSchool;
                this.overtimeReservationList[indexs].NoGoingBack = NoGoingBack;
                this.overtimeReservationList[indexs].AbsenceReason = AbsenceReason;
                this.overtimeReservationList[indexs].AbsenceReasonListClass = AbsenceReasonListClass;
                this.processing =false;
                // eslint-disable-next-line no-console
                console.log('作成OK');


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
            .then(() => {
                this.overtimeReservationList[indexs].AbsentSchedule = AbsentSchedule;
                this.overtimeReservationList[indexs].AbsentScheduleClass = AbsentScheduleClassNow;
                this.overtimeReservationList[indexs].OutsideFastClass = OutsideFastClassNow;
                this.overtimeReservationList[indexs].OutsideClass = OutsideClassNow;
                this.overtimeReservationList[indexs].NoAttendingSchoolClass = NoAttendingSchoolClass;
                this.overtimeReservationList[indexs].NoGoingBackClass = NoGoingBackClass;
                this.overtimeReservationList[indexs].AbsenceReason = AbsenceReason;
                this.overtimeReservationList[indexs].AbsenceReasonListClass = AbsenceReasonListClass;
                this.processing =false;
                // eslint-disable-next-line no-console
                console.log('更新OK');
                
            })
            .catch(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'レコードアップデート：エラー',
                        message: '園児日誌を更新できませんでした。',
                        variant: 'error'
                    })
                );
            });
        }
       
        

    }
    /* END:園児日誌を作成 OR 更新 */

    /* ------------------------
        一括登録
    ------------------------ */
    @track iikatuOutsideFast;
    @track iikatuOutside;

    iikatuOutsideFastChange(event) {
        this.iikatuOutsideFast = event.target.value;
    }
    iikatuOutsideChange(event) {
        this.iikatuOutside = event.target.value;
    }

    AllCreate(){
        var result1;
        var insertList = [];
        var updateList = [];
        var i;var insertNum =0;var updateNum =0;
        var ikkatu;
        var Id;

        
        // eslint-disable-next-line no-alert
        //result1 = confirm('一括登録しますか？\n※一度登録すると取り消しはできません');
        result1 = true;
        if( result1 ) {
            // eslint-disable-next-line no-console
            console.log('日付一覧をループ');

            


            const p = new Promise((resolve, reject) => {
            
            for(i=0; i < this.overtimeReservationList.length; i++) {
                
                /* 日曜日以外 */
                if(!(this.overtimeReservationList[i].weeknum === 0)){
                    /* 今日以降 */
                    if(this.todayDate <= this.overtimeReservationList[i].date3){

                        /* すでに時間外早朝/時間外/欠席予定が設定されいるものは省く */
                        if(
                            !(this.overtimeReservationList[i].AbsentSchedule) && 
                            (this.overtimeReservationList[i].Outside === undefined || this.overtimeReservationList[i].Outside === '') &&
                            (this.overtimeReservationList[i].OutsideFast === undefined || this.overtimeReservationList[i].OutsideFast === '')
                        ){

                            
                            if(this.iikatuOutsideFast === undefined){this.iikatuOutsideFast = '';}
                            if(this.iikatuOutside === undefined){this.iikatuOutside = '';}
                            if(this.overtimeReservationList[i].KdID === undefined){
                                insertList[insertNum] ={ 
                                    Date__c : this.overtimeReservationList[i].date2,
                                    Contact__c : this.EnjiID,
                                    Outside__c : this.iikatuOutside,
                                    OutsideFast__c : this.iikatuOutsideFast,
                                }
                                insertNum ++;

                            }else{
                                updateList[updateNum] ={ 
                                    Id : this.overtimeReservationList[i].KdID,
                                    Date__c : this.overtimeReservationList[i].date2,
                                    Contact__c : this.EnjiID,
                                    Outside__c : this.iikatuOutside,
                                    OutsideFast__c : this.iikatuOutsideFast,
                                }
                                updateNum ++;
                            }


                        }

                    }
                }
            }
                resolve(insertList,updateList);
            });
            
            p.then(() => {
                // eslint-disable-next-line no-console
                upsertKindergartenDiary({insertList:insertList ,updateList : updateList})
                .then(result => {
                    this.contacts = result;
                    if(this.monthnow === undefined){
                        ikkatu = 'ToMonth';
                    }else{
                        ikkatu = this.monthnow;
                    }
                    this.handleChange(0,ikkatu);
                })
                .catch(error => {
                    this.error = error;
                });
                
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.log(error);
            })

        
        }
        else {
            // eslint-disable-next-line no-console
            console.log('しませんでした。');
        
        }
    }


}


