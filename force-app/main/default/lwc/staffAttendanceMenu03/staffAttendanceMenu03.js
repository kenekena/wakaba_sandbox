/* eslint-disable no-console */
import { LightningElement,wire,track } from 'lwc';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TYPE_Class from '@salesforce/schema/ImportantNotes__c.Class__c';
import BUSTYPE_Class from '@salesforce/schema/Contact.PassageRoute__c';
import ABSENCE_REASON from '@salesforce/schema/KindergartenDiary__c.AbsenceReason__c';

import findImportantNotes from '@salesforce/apex/ImportantNotesController.findImportantNotes2';
import findKindergartenDiary from '@salesforce/apex/ImportantNotesController.findKindergartenDiary';
import findStaff from '@salesforce/apex/ImportantNotesController.findStaff';

/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

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
import TOUENTIME_FIELD from '@salesforce/schema/KindergartenDiary__c.AttendingSchoolTime__c';//園児日誌obj:登園時間
import KOUEN_FIELD from '@salesforce/schema/KindergartenDiary__c.GoingBack__c';              //園児日誌obj:降園
import KOUENTIME_FIELD from '@salesforce/schema/KindergartenDiary__c.GoingBackTime__c';      //園児日誌obj:降園時間
import GONOTUSE_FIELD from '@salesforce/schema/KindergartenDiary__c.BusGoingNotUse__c';      //園児日誌obj:行き利用しない
import BACKNOTUSE_FIELD from '@salesforce/schema/KindergartenDiary__c.BusBackNotUse__c';     //園児日誌obj:帰り使用しない
import ABSENCEREASON_FIELD from '@salesforce/schema/KindergartenDiary__c.AbsenceReason__c';  //園児日誌obj:欠席理由
import NOTRIDEREASON_FIELD from '@salesforce/schema/KindergartenDiary__c.NotRideReason__c';  //園児日誌obj:バス乗らない理由
import STAFFID_FIELD from '@salesforce/schema/KindergartenDiary__c.StaffId__c';              //職員名簿obj:

export default class StaffAttendanceMenu03 extends LightningElement {
    processing = false;
    today = new Date();
    valuenone = '-- なし --';
    @track ClassList;
    @track BusList;
    @track firstDisplay = true;
    @track searchDate = this.today.getFullYear() + "-" + (this.today.getMonth() + 1) + "-"+ this.today.getDate();
    @track titleDate = this.today.getFullYear() + "年" + (this.today.getMonth() + 1) + "月"+ this.today.getDate() + "日の出席簿";
    @track importantNotes;
    @track error = false;
    @track StaffList;                           /* 職員選択用 */
    @track mainmenu = false;                    /* 職員選択用 */
    @track errorSfattMenu;                      /* 職員選択用 */
    StaffId;                                    /* 職員選択用：ID保持 */

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
        学級一覧を取得：初回のみ
    ------------------------ */
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TYPE_Class
    })
    picklistValues;

    /* ------------------------
        バス通園コースを取得：初回のみ
    ------------------------ */
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: BUSTYPE_Class
    })
    PickBuslist;

    /* ------------------------
        欠席理由の値を取得：初回のみ
    ------------------------ */
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: ABSENCE_REASON
    })
    AbsenceReasonList;

    /* ------------------------
        バス乗らない理由の値を取得：初回のみ
    ------------------------ */
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: NOTRIDEREASON_FIELD
    })
    NotRideReasonList;


    //現在時刻取得（yyyy/mm/ddThh:mm:ss.000Z）
    getCurrentTime() {
        var now = new Date();
        var res;
        now.setHours(now.getHours() - 9);//Salesforceに取り込んだときにずれる
        res = "" + now.getFullYear() + "-" + this.padZero(now.getMonth() + 1) + 
            "-" + this.padZero(now.getDate()) + "T" + this.padZero(now.getHours()) + ":" + 
            this.padZero(now.getMinutes()) + ":" + this.padZero(now.getSeconds()) + ".000Z";
        return res;
    }

    //先頭ゼロ付加
    padZero(num) {
        var result;
        if (num < 10) {
            result = "0" + num;
        } else {
            result = "" + num;
        }
        return result;
    }


    /* ------------------------
        クラス選択で 園児一覧を取得
    ------------------------ */
    selectStaff(event){
        this.StaffId = event.target.value;
        this.mainmenu = true;
    }



    /* ------------------------
        園児リストを取得
    ------------------------ */
    links(event){ 
        var ImportantNoteList;      //要録一覧を一旦格納
        var KindergartenDiaryList;  //園児日報一覧を一旦格納
        var i;                      //forループ用1
        var i2;                     //forループ用2
        var i3;                     //forループ用3
        var AbsenceReasonListNow = [];    //欠席理由の値とselected情報を一時格納
        var AbsenceReasonListClass;  //欠席理由のスタイル
        var AbsenceReasonNow;        //selectされている値
        var NotRideReasonListNow;    //バス理由のスタイル
        // eslint-disable-next-line no-unused-vars
        var NotRideReasonNow;        //selectされている値

        //var setsCheck;              //forループで要録と日報がマッチしたかどうかをチェック
        var group =event.target.dataset.group;//クラス選択かバス選択か
        //並列処理?的な
        async function merge(searchDate){
            //クラスで条件を絞り要録一覧を取得
            ImportantNoteList = await (
                //Apexを呼び出し
                findImportantNotes({
                        searchValue: event.target.dataset.value,
                        searchDate: searchDate,
                        searchGroup: event.target.dataset.group
                    })
                    .then(result => {
                        return result;
                    })
                    .catch(error => {
                        return error;//考えてあげなきゃいけない
                    })
                );

            //日付で条件を絞り園児日報一覧を取得
            KindergartenDiaryList = await (
            findKindergartenDiary({searchDate : searchDate})//日付を送り込む
                .then(result => {
                    return result;
                })
                .catch(error => {
                    return error;//考えてあげなきゃいけない
                })
            );
        }

        //要録一覧と日報一覧を取得した後に処理を開始する
        merge(this.searchDate).then(
            () => {
                //merge()の処理が終わった後に開始する
                //console.log(ImportantNoteList);       //要録一覧確認
                //console.log(KindergartenDiaryList);   //園児日報一覧確認

                //要録を一覧をループ、その中で園児日報一覧をループさせ、
                //お互いの園児ID（Contact.ID）がマッチしたらImportantNoteList側に日報情報（日報IDと現在の出席情報）を追記する
                for(i = 0; i< ImportantNoteList.length; i++){
                    /* 初期化 */
                    AbsenceReasonListNow=[]; /* 欠席理由を初期化 */
                    AbsenceReasonListClass ='selecttype01';
                    AbsenceReasonNow = '';
                    NotRideReasonListNow=[]; /* バス理由を初期化 */
                    NotRideReasonNow = '';

                    /* 欠席理由の選択リストの値を再取得 */
                    AbsenceReasonListNow[0] = {value: this.valuenone ,selected: ''};
                    for(i3 = 0; i3< this.AbsenceReasonList.data.values.length; i3++){
                        AbsenceReasonListNow[i3+1] = {
                            value : this.AbsenceReasonList.data.values[i3].value,
                            selected: ''
                        }
                    }

                    /* バス理由の選択リストの値を再取得 */
                    NotRideReasonListNow[0] = {value: this.valuenone ,selected: ''};
                    for(i3 = 0; i3< this.NotRideReasonList.data.values.length; i3++){
                        NotRideReasonListNow[i3+1] = {
                            value : this.NotRideReasonList.data.values[i3].value,
                            selected: ''
                        }
                    }

                    for(i2 = 0; i2< KindergartenDiaryList.length; i2++){
                        if(ImportantNoteList[i].Contact__r.Id === KindergartenDiaryList[i2].Contact__r.Id){
                            ImportantNoteList[i].kindergartenDiaryId = KindergartenDiaryList[i2].Id;
                            ImportantNoteList[i].AttendanceSchedule = KindergartenDiaryList[i2].AttendanceSchedule__c;
                            ImportantNoteList[i].AttendingSchool = KindergartenDiaryList[i2].AttendingSchool__c;
                            ImportantNoteList[i].GoingBack = KindergartenDiaryList[i2].GoingBack__c;
                            ImportantNoteList[i].AbsentSchedule = KindergartenDiaryList[i2].AbsentSchedule__c;
                            ImportantNoteList[i].NoAttendingSchool = KindergartenDiaryList[i2].BusGoingNotUse__c;
                            ImportantNoteList[i].NoGoingBack = KindergartenDiaryList[i2].BusBackNotUse__c;
                            ImportantNoteList[i].NotRideReason = KindergartenDiaryList[i2].NotRideReason__c;
                            
                            /*  欠席理由の値の数だけループ */  
                            for(i3 = 0; i3< AbsenceReasonListNow.length; i3++){
                                /* 園児日誌の欠席理由：欠席理由の値と値の情報が一致したらseletedにして、CSSも追加する */
                                if(AbsenceReasonListNow[i3].value === KindergartenDiaryList[i2].AbsenceReason__c){
                                    AbsenceReasonListNow[i3].selected = 'selected';
                                    AbsenceReasonNow = AbsenceReasonListNow[i3].value;
                                    ImportantNoteList[i].selectedValue = AbsenceReasonListNow[i3].value;
                                    //AbsenceReasonListClass='blue';
                                }
                            }
                            /*  バス理由の値の数だけループ */  
                            for(i3 = 0; i3< NotRideReasonListNow.length; i3++){
                                /* 園児日誌の欠席理由：欠席理由の値と値の情報が一致したらseletedにして、CSSも追加する */
                                if(NotRideReasonListNow[i3].value === KindergartenDiaryList[i2].NotRideReason__c){
                                    NotRideReasonListNow[i3].selected = 'selected';
                                    NotRideReasonNow = NotRideReasonListNow[i3].value;
                                    ImportantNoteList[i].selectedValue2 = NotRideReasonListNow[i3].value;
                                    //AbsenceReasonListClass='blue';
                                }
                            }
                        }
                    }

                    /* ひとり事の情報を取りまとめる */

                    /* 出席簿の処理 */
                    ImportantNoteList[i].AbsenceClass='btn-square gray';
                    ImportantNoteList[i].AttendanceClass='btn-square gray';
                    if(ImportantNoteList[i].AbsentSchedule){
                        ImportantNoteList[i].AbsenceClass='btn-square blue';
                    }
                    if(ImportantNoteList[i].AttendanceSchedule==='出席'){
                        ImportantNoteList[i].AttendanceClass='btn-square yellow';     
                    }
                    if(ImportantNoteList[i].AttendanceSchedule==='欠席'){
                        ImportantNoteList[i].AbsenceClass='btn-square yellow';
                    }

                    /* バス乗車 */
                    if(ImportantNoteList[i].NoAttendingSchool){
                        ImportantNoteList[i].NoAttendingSchoolClass='btn-square blue';
                    }else{
                        ImportantNoteList[i].NoAttendingSchool=false;
                        ImportantNoteList[i].NoAttendingSchoolClass='btn-square gray';
                    }
                    if(ImportantNoteList[i].NoGoingBack){
                        ImportantNoteList[i].NoGoingBackClass='btn-square blue';
                    }else{
                        ImportantNoteList[i].NoGoingBack=false;
                        ImportantNoteList[i].NoGoingBackClass='btn-square gray';
                    }

                    /* バス乗車：登園ボタン処理 */
                    if(ImportantNoteList[i].AttendingSchool){
                        ImportantNoteList[i].AttendingSchoolClass='btn-square yellow';
                    }else{
                        ImportantNoteList[i].AttendingSchool=false;
                        ImportantNoteList[i].AttendingSchoolClass='btn-square gray';
                    }

                    /* バス乗車：下車ボタン処理 */
                    if(ImportantNoteList[i].GoingBack){
                        ImportantNoteList[i].GoingBackClass='btn-square yellow';
                    }else{
                        ImportantNoteList[i].GoingBack=false;
                        ImportantNoteList[i].GoingBackClass='btn-square gray';
                    }

                    /* 欠席理由 */ 
                    if(ImportantNoteList[i].AttendanceSchedule ==='欠席' && AbsenceReasonNow === '' ){
                        ImportantNoteList[i].AbsenceReasonListClass = AbsenceReasonListClass + 'border_Red ';
                    }else{
                        ImportantNoteList[i].AbsenceReasonListClass = AbsenceReasonListClass;
                    }

                    ImportantNoteList[i].AbsenceReasonList = AbsenceReasonListNow;
                    ImportantNoteList[i].NotRideReasonList = NotRideReasonListNow;


                    
                    


                    
                }

                this.importantNotes = ImportantNoteList;    //表示用の配列にImportantNoteListを入れる
                console.log("this.importantNotes");
                console.log(this.importantNotes);
                this.firstDisplay = false;
                //画面表示・非表示の切り替え
                if(group === 'bus'){
                    this.BusList = true;
                    this.ClassList = false;
                }else{
                    this.BusList = false;
                    this.ClassList = true;
                }            
            }
        )
    }

    /* ------------------------
        要録を更新
    ------------------------ */
    changeType(event){
        var indexs;             //何番目をクリックしたか把握
        var i ;                 //ループ用
        var recordInput = {};   //レコード作成・更新用
        var timesstump = this.getCurrentTime();
        var AttendingSchool;var GoingBack;
        var AttendingSchoolClass;var GoingBackClass;
        var NoAttendingSchool;var NoGoingBack;
        var NoAttendingSchoolClass;var NoGoingBackClass;
        var AttendanceClass;var AbsenceClass;
        var AbsenceReason; var AbsenceReasonListClass;
        var AttendanceSchedule;
        var NotRideReason;
        
        /* 連打禁止 */
        if(this.processing){return}
        /* 処理中フラグ */
        this.processing =true;

        event.preventDefault();
        
        //  this.importantNotes.data.Id -> クリックした要素のカスタム要素 data-Idのこと
        //  this.importantNotes.dataをループさせてthis.importantNotes[i].Idとマッチしたものが選んだ順番
        //  this.importantNotes[indexs]で表示される
        for(i = 0; i < this.importantNotes.length; i++) {
            if(this.importantNotes[i].Id === event.target.dataset.id) {
                indexs = i;
            }
        }
        /* 初期値設定 */
        
        AttendingSchool = this.importantNotes[indexs].AttendingSchool;
        GoingBack = this.importantNotes[indexs].GoingBack;
        AttendingSchoolClass = this.importantNotes[indexs].AttendingSchoolClass;
        GoingBackClass = this.importantNotes[indexs].GoingBackClass;
        NoAttendingSchool = this.importantNotes[indexs].NoAttendingSchool;     
        NoGoingBack = this.importantNotes[indexs].NoGoingBack;
        NoAttendingSchoolClass = this.importantNotes[indexs].NoAttendingSchoolClass;   
        NoGoingBackClass = this.importantNotes[indexs].NoGoingBackClass;
        AttendanceClass = this.importantNotes[indexs].AttendanceClass;
        AbsenceClass = this.importantNotes[indexs].AbsenceClass;
        AbsenceReason = this.importantNotes[indexs].selectedValue;
        AttendanceSchedule = this.importantNotes[indexs].AttendanceSchedule;
        NotRideReason = this.importantNotes[indexs].selectedValue2;
        AbsenceReasonListClass = 'selecttype01';


        /* 日報レコード作成や更新に必要な項目を代入  */
        /* バス（登園）かバス（降園）かクラスかでセットする項目を変える */
        const fields = {};

        

        /* 共通 */
            fields[ID_FIELD.fieldApiName] = event.target.dataset.kindergartendiaryid;       //日報ID
            fields[DATE_FIELD.fieldApiName] = this.searchDate;                              //今日の日付
            fields[ENGJIID_FIELD.fieldApiName] = this.importantNotes[indexs].Contact__r.Id; //関連園児ID
            fields[STAFFID_FIELD.fieldApiName] = this.StaffId;

        

        /* 出席簿の場合 */
        if(event.target.dataset.group === 'class'){
            fields[AS_FIELD.fieldApiName] = event.target.dataset.value;                     //出席予定
            AttendanceSchedule = event.target.dataset.value;
            fields[ASTIME_FIELD.fieldApiName] = timesstump;                                 //出席欠席した時間
            if(event.target.dataset.value ==='出席'){
                //すでに出席だったら
                if(this.importantNotes[indexs].AttendanceSchedule === '出席'){
                    fields[AS_FIELD.fieldApiName] ='';
                    AttendanceSchedule ='';
                    fields[ASTIME_FIELD.fieldApiName] ='';
                    AttendanceClass='btn-square gray';
                    AbsenceReasonListClass='selecttype01';
                //出席
                }else{
                    AttendanceClass='btn-square yellow';
                    AbsenceReasonListClass='selecttype01';
                    if(this.importantNotes[indexs].AbsentSchedule){                             //欠席予定だったら、欠席をblueにしてあげる
                        AbsenceClass='btn-square blue';
                    }else{
                        AbsenceClass='btn-square gray';  
                    }
                }
            }else{
                //すでに欠席だったら
                if(this.importantNotes[indexs].AttendanceSchedule === '欠席'){
                    fields[AS_FIELD.fieldApiName] ='';
                    AttendanceSchedule ='';
                    fields[ASTIME_FIELD.fieldApiName] ='';
                    AbsenceReasonListClass='selecttype01';
                    if(this.importantNotes[indexs].AbsentSchedule){                             //欠席予定だったら、欠席をblueにしてあげる
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


        /* クラス：欠席理由の場合 */
        if(event.target.dataset.group === 'reason'){
            if(event.target.value===this.valuenone || event.target.value==='' || event.target.value===undefined){
                fields[ABSENCEREASON_FIELD.fieldApiName] = '';
                AbsenceReason = '';

                if(this.importantNotes[indexs].AttendanceSchedule ==='欠席'){
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
 
        /* バス：登園の場合 */
        if(event.target.dataset.group === 'bus' && event.target.dataset.value === '登園'){
            /* ON・OFFスイッチ */
            if(this.importantNotes[indexs].AttendingSchool){
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
        /* バス：降園の場合 */
        if(event.target.dataset.group === 'bus' && event.target.dataset.value === '降園'){
             /* ON・OFFスイッチ */
             if(this.importantNotes[indexs].GoingBack){
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

        /* バス：行き利用なし */
        if(event.target.dataset.group === 'bus' && event.target.dataset.value === '行き利用しない'){
            /* ON・OFFスイッチ */
            if(this.importantNotes[indexs].NoAttendingSchool){
               fields[GONOTUSE_FIELD.fieldApiName] = false;                                        //登園チェック
               NoAttendingSchool=false;
               NoAttendingSchoolClass='btn-square gray';
           }else{
               fields[GONOTUSE_FIELD.fieldApiName] = true;                                         //登園チェック
               NoAttendingSchool=true;
               NoAttendingSchoolClass='btn-square blue';
           }
        }
        /* バス：行き利用なし */
        if(event.target.dataset.group === 'bus' && event.target.dataset.value === '帰り利用しない'){
            /* ON・OFFスイッチ */
            if(this.importantNotes[indexs].NoGoingBack){    
                fields[BACKNOTUSE_FIELD.fieldApiName] = false;                                        //登園チェック
                NoGoingBack=false;
                NoGoingBackClass='btn-square gray';
            }else{
                fields[BACKNOTUSE_FIELD.fieldApiName] = true;                                         //登園チェック
                NoGoingBack=true;
                NoGoingBackClass='btn-square blue';
        }


        }
        /* バス：バス理由の場合 */
        if(event.target.dataset.group === 'RideReason'){
            if(event.target.value===this.valuenone || event.target.value==='' || event.target.value===undefined){
                fields[NOTRIDEREASON_FIELD.fieldApiName] = '';
                NotRideReason = '';
            }else{
                fields[NOTRIDEREASON_FIELD.fieldApiName] = event.target.value;
                NotRideReason = event.target.value;
                //AbsenceReasonListClass='blue';
            }
        }  
        //if(this.importantNotes[indexs].AttendingSchool === '登園'){AttendingSchool= '登園'}
        //if(this.importantNotes[indexs].GoingBack === '降園'){GoingBack= '降園'}

        
        //console.log(fields[ID_FIELD.fieldApiName]);
        //もし選んだ要録に日報IDがセットされてなかったら日報を作成し、セットされてたら日報を更新
        if(fields[ID_FIELD.fieldApiName]=== undefined || fields[ID_FIELD.fieldApiName]=== ''){

            recordInput = {apiName: KindergartenDiary_OBJECT.objectApiName, fields };   //作成する情報をセット

            createRecord(recordInput)  
            .then(result => {   //レコード作成に成功したら
                //表示用の配列情報を更新する
                this.importantNotes[indexs].kindergartenDiaryId = result.id;                   //作成したレコードIDを表示用の変数に戻してあげる：再描写
                this.importantNotes[indexs].AttendanceSchedule = AttendanceSchedule;//作成した出席情報を表示用の変数に戻してあげる：再描写
                this.importantNotes[indexs].AttendingSchool = AttendingSchool;
                this.importantNotes[indexs].AttendingSchoolClass = AttendingSchoolClass;
                this.importantNotes[indexs].GoingBack = GoingBack;
                this.importantNotes[indexs].GoingBackClass = GoingBackClass;
                this.importantNotes[indexs].NoAttendingSchool = NoAttendingSchool;
                this.importantNotes[indexs].NoAttendingSchoolClass = NoAttendingSchoolClass;
                this.importantNotes[indexs].NoGoingBack = NoGoingBack;
                this.importantNotes[indexs].NoGoingBackClass = NoGoingBackClass;
                this.importantNotes[indexs].AttendanceClass = AttendanceClass;
                this.importantNotes[indexs].AbsenceClass = AbsenceClass;
                this.importantNotes[indexs].AbsenceReasonListClass = AbsenceReasonListClass;
                this.importantNotes[indexs].selectedValue = AbsenceReason;
                this.importantNotes[indexs].selectedValue2 = NotRideReason;
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
        //にっぽうを更新
        }else{
            recordInput = { fields };
            updateRecord(recordInput)
            .then(() => {
                this.importantNotes[indexs].AttendanceSchedule = AttendanceSchedule;
                this.importantNotes[indexs].AttendingSchool = AttendingSchool;
                this.importantNotes[indexs].AttendingSchoolClass = AttendingSchoolClass;
                this.importantNotes[indexs].GoingBack = GoingBack;
                this.importantNotes[indexs].GoingBackClass = GoingBackClass;
                this.importantNotes[indexs].NoAttendingSchool = NoAttendingSchool;
                this.importantNotes[indexs].NoAttendingSchoolClass = NoAttendingSchoolClass;
                this.importantNotes[indexs].NoGoingBack = NoGoingBack;
                this.importantNotes[indexs].NoGoingBackClass = NoGoingBackClass;
                this.importantNotes[indexs].AttendanceClass = AttendanceClass;
                this.importantNotes[indexs].AbsenceClass = AbsenceClass;
                this.importantNotes[indexs].AbsenceReasonListClass = AbsenceReasonListClass;
                this.importantNotes[indexs].selectedValue = AbsenceReason;
                this.importantNotes[indexs].selectedValue2 = NotRideReason;
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
    


}