import { LightningElement,wire,track } from 'lwc';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TYPE_Class from '@salesforce/schema/ImportantNotes__c.Class__c';
import TYPE_OUTSIDEFAST from '@salesforce/schema/KindergartenDiary__c.OutsideFast__c';
import TYPE_OUTSIDE from '@salesforce/schema/KindergartenDiary__c.Outside__c';

/* APEX呼び出し */
import findImportantNotes from '@salesforce/apex/ImportantNotesController.findImportantNotes2';
import findKindergartenDiary from '@salesforce/apex/ImportantNotesController.findKindergartenDiary_OrList';

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

export default class OvertimeReservation extends LightningElement {
    today = new Date();
    valuenone = '-- なし --';
    @track searchDate = this.today.getFullYear() + "-" + (this.today.getMonth() + 1) + "-"+ this.today.getDate(); /* 要録の年度取得に使用 */
    @track searchMonth = this.today;            /* どの月の情報を見るかの初期値 */
    @track EnjiListValue = [];                  /* 園児リストの値を収納 */
    @track overtimeReservationList = [];        /* 日毎リスト */
    @track listDisplay = false;                 /* 日毎の一覧画面は最初は非表示 */
    @track placeholder = "クラスを選択してください";/* 園児リストの初期メッセージ */
    @track EnjiID;                              /* 日毎リスト検索用に使用 */
    @track OutsideFast;                         /* 園児日誌の時間外保育：早朝の選択リストの値を保有 */
    @track Outside;                             /* 園児日誌の時間外保育の選択リストの値を保有 */
    @track nameValue;



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
        学級一覧を取得：初回のみ
    ------------------------ */
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
    handleChange(event){
        /* 変数をセット */
        var toMonthStart;                             //月初めjsループ用
        var toMonthStartText;                         //月初め表示用：「YYYY年M月D日」
        var toMonthStartText2;                        //月初め検索用：「YYYY-MM-DD」
        var StartDate;                                //月初めSOQL検索用
        var ToMonthEnd;                               //月末jsループ用
        var EndDate;                                  //月末SOQL検索用
        var week = ["日","月","火","水","木","金","土"];//曜日
        var i;var i2;var i3;                          //ループ用1、2、3
        var changetype = event.target.name;           //園児リストを選択した場合は、園児IDが入る
        var KindergartenDiaryList;                    //園児日誌主著区
        var TemporarilyOvertimeReservationList =[];   //日毎リストの一時格納
        var OnedayBox =[];                            //一日ごとの情報を一時格納
        var OutsideFastListNow = [];                  //時間外保育：早朝の値とselected情報を一時格納
        var OutsideListNow = [];                      //時間外保育の値とselected情報を一時格納
        
        /* 初期化 */
        this.listDisplay = true;                      //初回のみ、一覧リストエリアを表示にする
        this.overtimeReservationList =[];             //日毎リストを初期化

        /* 時間外保育早朝の選択リストの値を設定⇒必要かな？
        var OutsideFastList = [];
        OutsideFastList[0] = {value: '-- なし -- ',selected: ''};
        for(i3 = 0; i3< this.OutsideFast.data.values.length; i3++){
            OutsideFastList[i3+1] = {
                value : this.OutsideFast.data.values[i3].value,
                selected: ''
            }
        }
        */

        /* 時間外保育の選択リストの値を設定⇒必要かな？
        var OutsideList = [];   
        OutsideList[0] = {value: '-- なし -- ',selected: ''};
        for(i = 0; i< this.Outside.data.values.length; i++){
            OutsideList[i+1] = {
                value : this.Outside.data.values[i].value,
                selected: ''
            }
        }
        */

        /* 月変更ボタンを押したらthis.searchMonthの月を変更する */
        if(event.target.dataset.value === '先月'){this.searchMonth.setMonth(this.searchMonth.getMonth() -1)}
        if(event.target.dataset.value === '今月'){this.searchMonth = new Date()}
        if(event.target.dataset.value === '翌月'){this.searchMonth.setMonth(this.searchMonth.getMonth() +1)}
        
        /* this.searchMonthを元に月初めと月末を取得 */
        toMonthStart = new Date(this.searchMonth.getFullYear(), this.searchMonth.getMonth(), 1);
        ToMonthEnd = new Date(this.searchMonth.getFullYear(), this.searchMonth.getMonth()+ 1, 0);

        /* 園児日誌検索に必要な情報をセット */
        StartDate = toMonthStart.getFullYear() + "-" + (toMonthStart.getMonth() + 1) + "-"+ toMonthStart.getDate();
        EndDate = ToMonthEnd.getFullYear() + "-" + (ToMonthEnd.getMonth() + 1) + "-"+ ToMonthEnd.getDate();
        if(changetype === 'changeName'){ this.EnjiID = event.target.value }

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
                    /* 日付と検索用の日付をセット */
                    toMonthStartText = toMonthStart.getFullYear() + '年' + (toMonthStart.getMonth() + 1) + '月'+ toMonthStart.getDate()+ '日' ;
                    toMonthStartText2= toMonthStart.getFullYear() + '-' + this.padZero((toMonthStart.getMonth() + 1)) + '-' + this.padZero(toMonthStart.getDate());

                    
                    /* 園児日誌をループ */
                    for(i2 = 0; i2< KindergartenDiaryList.length; i2++){
                        
                        /* 園児日誌のDate__CとtoMonthStartText2が一致した場合、情報をセット */
                        if(KindergartenDiaryList[i2].Date__c === toMonthStartText2 ){
                            OnedayBox.Id = KindergartenDiaryList[i2].Id;
                            OnedayBox.OutsideFast  = KindergartenDiaryList[i2].OutsideFast__c;
                            OnedayBox.Outside = KindergartenDiaryList[i2].Outside__c;
                            OnedayBox.AbsentSchedule = KindergartenDiaryList[i2].AbsentSchedule__c;

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

                    /* 一日の情報を取りまとめる */
                    TemporarilyOvertimeReservationList[i] = {
                        date : toMonthStartText,
                        date2 : toMonthStartText2,
                        week : '（' + week[toMonthStart.getDay()] + '）',
                        KdID : OnedayBox.Id,
                        OutsideClass :OnedayBox.OutsideClass,
                        OutsideFastClass : OnedayBox.OutsideFastClass,
                        Outside : OnedayBox.Outside,
                        OutsideFast : OnedayBox.OutsideFast,
                        AbsentSchedule : OnedayBox.AbsentSchedule,
                        AbsentScheduleClass :OnedayBox.AbsentScheduleClass,
                        OutsideListValue : OutsideListNow,
                        OutsideFastListValue : OutsideFastListNow
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
        var AbsentScheduleClassNow;
        var OutsideFastClassNow;
        var OutsideClassNow;

        /* 条件をセット */        
        choiseType = event.target.dataset.type;

        for(i = 0; i < this.overtimeReservationList.length; i++) {
            if(this.overtimeReservationList[i].date2 === event.target.dataset.date2) {
                indexs = i;
            }
        }


        /* 項目の値をセット */
        const fields = {};
        
        /* 共通 */
            fields[ID_FIELD.fieldApiName] = event.target.dataset.kdid;      //日報ID
            fields[DATE_FIELD.fieldApiName] = event.target.dataset.date2;   //今日の日付
            fields[ENGJIID_FIELD.fieldApiName] = this.EnjiID;               //関連園児ID

        /* 時間外保育：早朝 */
        if(choiseType === 'OutsideFast'){
            AbsentScheduleClassNow = this.overtimeReservationList[indexs].AbsentScheduleClass;
            OutsideClassNow = this.overtimeReservationList[indexs].OutsideClass;

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
            AbsentScheduleClassNow = this.overtimeReservationList[indexs].AbsentScheduleClass;
            OutsideFastClassNow = this.overtimeReservationList[indexs].OutsideFastClass;

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
            OutsideClassNow = this.overtimeReservationList[indexs].OutsideClass;
            OutsideFastClassNow = this.overtimeReservationList[indexs].OutsideFastClass;

            if(event.target.value==='true'){
                fields[ABSENT_FIELD.fieldApiName] = false;
                AbsentScheduleClassNow = 'btn-square gray';
            }else{
                fields[ABSENT_FIELD.fieldApiName] = true;
                AbsentScheduleClassNow = 'btn-square yellow';
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
                this.overtimeReservationList[indexs].AbsentSchedule = fields[ABSENT_FIELD.fieldApiName];
                this.overtimeReservationList[indexs].AbsentScheduleClass = AbsentScheduleClassNow;
                this.overtimeReservationList[indexs].OutsideFastClass = OutsideFastClassNow;
                this.overtimeReservationList[indexs].OutsideClass = OutsideClassNow;
                
                
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

    


}