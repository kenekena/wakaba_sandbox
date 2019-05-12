import { LightningElement,wire,track } from 'lwc';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TYPE_Class from '@salesforce/schema/ImportantNotes__c.Class__c';
import BUSTYPE_Class from '@salesforce/schema/Contact.PassageRoute__c';

import findImportantNotes from '@salesforce/apex/ImportantNotesController.findImportantNotes2';
import findKindergartenDiary from '@salesforce/apex/ImportantNotesController.findKindergartenDiary';

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
import TOUENTIME_FIELD from '@salesforce/schema/KindergartenDiary__c.attendingSchoolTime__c';//園児日誌obj:登園時間
import KOUEN_FIELD from '@salesforce/schema/KindergartenDiary__c.GoingBack__c';              //園児日誌obj:降園
import KOUENTIME_FIELD from '@salesforce/schema/KindergartenDiary__c.GoingBackTime__c';      //園児日誌obj:降園時間





export default class StaffAttendanceMenu03 extends LightningElement {
    today = new Date();
    @track ClassList;
    @track BusList;
    @track firstDisplay = true;
    @track searchDate = this.today.getFullYear() + "-" + (this.today.getMonth() + 1) + "-"+ this.today.getDate();
    @track titleDate = this.today.getFullYear() + "年" + (this.today.getMonth() + 1) + "月"+ this.today.getDate() + "日の出席簿";
    @track searchYear = this.today.getFullYear();
    @track importantNotes;
    @track error = false;

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

    //現在時刻取得（yyyy/mm/dd hh:mm:ss）
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
        園児リストを取得
    ------------------------ */
    links(event){ 
        var ImportantNoteList;      //要録一覧を一旦格納
        var KindergartenDiaryList;  //園児日報一覧を一旦格納
        var i;                      //forループ用1
        var i2;                     //forループ用2
        //var setsCheck;              //forループで要録と日報がマッチしたかどうかをチェック
        var group =event.target.dataset.group;//クラス選択かバス選択か
        //並列処理?的な
        async function merge(searchYear,searchDate){
            //クラスで条件を絞り要録一覧を取得
            ImportantNoteList = await (
                //Apexを呼び出し
                findImportantNotes({
                        searchValue: event.target.dataset.value,
                        searchYear: searchYear,
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
        merge(this.searchYear,this.searchDate).then(
            () => {
                //merge()の処理が終わった後に開始する
                //console.log(ImportantNoteList);       //要録一覧確認
                //console.log(KindergartenDiaryList);   //園児日報一覧確認

                //要録を一覧をループ、その中で園児日報一覧をループさせ、
                //お互いの園児ID（Contact.ID）がマッチしたらImportantNoteList側に日報情報（日報IDと現在の出席情報）を追記する
                for(i = 0; i< ImportantNoteList.length; i++){
                    
                    //setsCheck =false;   //マッチ情報を初期化

                    for(i2 = 0; i2< KindergartenDiaryList.length; i2++){
                        if(ImportantNoteList[i].Contact__r.Id === KindergartenDiaryList[i2].Contact__r.Id){
                            ImportantNoteList[i].kindergartenDiaryId = KindergartenDiaryList[i2].Id;
                            ImportantNoteList[i].AttendanceSchedule = KindergartenDiaryList[i2].AttendanceSchedule__c;
                            if(KindergartenDiaryList[i2].AttendingSchool__c){ImportantNoteList[i].AttendingSchool='登園'}
                            if(KindergartenDiaryList[i2].GoingBack__c){ImportantNoteList[i].GoingBack='降園'}
                            //setsCheck =true;//マッチしたらtrue
                        }
                    }
                    
                    if(!(ImportantNoteList[i].AttendanceSchedule)){ImportantNoteList[i].AttendanceSchedule='未定'}
                    if(!(ImportantNoteList[i].AttendingSchool)){ImportantNoteList[i].AttendingSchool='ーー'}
                    if(!(ImportantNoteList[i].GoingBack)){ImportantNoteList[i].GoingBack='ーー'}
                    
                    
                }

                this.importantNotes = ImportantNoteList;    //表示用の配列にImportantNoteListを入れる
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
        var AttendingSchool = 'ーー';var GoingBack = 'ーー';
        event.preventDefault();

        //  this.importantNotes.data.Id -> クリックした要素のカスタム要素 data-Idのこと
        //  this.importantNotes.dataをループさせてthis.importantNotes[i].Idとマッチしたものが選んだ順番
        //  this.importantNotes[indexs]で表示される
        for(i = 0; i < this.importantNotes.length; i++) {
            if(this.importantNotes[i].Id === event.target.dataset.id) {
                indexs = i;
            }
        }

        /* 日報レコード作成や更新に必要な項目を代入  */
        /* バス（登園）かバス（降園）かクラスかでセットする項目を変える */
        const fields = {};
        /* 共通 */
            fields[ID_FIELD.fieldApiName] = event.target.dataset.kindergartendiaryid;       //日報ID
            fields[DATE_FIELD.fieldApiName] = this.searchDate;                              //今日の日付
            fields[ENGJIID_FIELD.fieldApiName] = this.importantNotes[indexs].Contact__r.Id; //関連園児ID
        /* 出席簿の場合 */
        if(event.target.dataset.group === 'class'){
            fields[AS_FIELD.fieldApiName] = event.target.dataset.value;                     //出席予定
            fields[ASTIME_FIELD.fieldApiName] = timesstump;                                 //出席欠席した時間
        }
        /* バス：登園の場合 */
        if(event.target.dataset.group === 'bus' && event.target.dataset.value === '登園'){
            fields[TOUEN_FIELD.fieldApiName] = true;                                        //登園チェック
            fields[TOUENTIME_FIELD.fieldApiName] = timesstump;                              //登園時間
            AttendingSchool= '登園';
        }
        /* バス：降園の場合 */
        if(event.target.dataset.group === 'bus' && event.target.dataset.value === '降園'){
            fields[KOUEN_FIELD.fieldApiName] = true;                                        //降園チェック
            fields[KOUENTIME_FIELD.fieldApiName] = timesstump;                              //降園時間 
            GoingBack= '降園';
        }
        if(this.importantNotes[indexs].AttendingSchool === '登園'){AttendingSchool= '登園'}
        if(this.importantNotes[indexs].GoingBack === '降園'){GoingBack= '降園'}

        
        //console.log(fields[ID_FIELD.fieldApiName]);
        //もし選んだ要録に日報IDがセットされてなかったら日報を作成し、セットされてたら日報を更新
        if(fields[ID_FIELD.fieldApiName]=== undefined){

            recordInput = {apiName: KindergartenDiary_OBJECT.objectApiName, fields };   //作成する情報をセット

            createRecord(recordInput)  
            .then(result => {   //レコード作成に成功したら
                //表示用の配列情報を更新する
                this.importantNotes[indexs].kindergartenDiaryId = result.id;                   //作成したレコードIDを表示用の変数に戻してあげる：再描写
                this.importantNotes[indexs].AttendanceSchedule = fields[AS_FIELD.fieldApiName];//作成した出席情報を表示用の変数に戻してあげる：再描写
                this.importantNotes[indexs].AttendingSchool = AttendingSchool;
                this.importantNotes[indexs].GoingBack = GoingBack;
                // eslint-disable-next-line no-console
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
                this.importantNotes[indexs].AttendanceSchedule = fields[AS_FIELD.fieldApiName];
                this.importantNotes[indexs].AttendingSchool = AttendingSchool;
                this.importantNotes[indexs].GoingBack = GoingBack;
                // eslint-disable-next-line no-console
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