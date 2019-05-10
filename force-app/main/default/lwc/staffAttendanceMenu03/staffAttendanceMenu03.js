/* eslint-disable no-console */
import { LightningElement,wire,track } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TYPE_Class from '@salesforce/schema/ImportantNotes__c.Class__c';
import findImportantNotes from '@salesforce/apex/ImportantNotesController.findImportantNotes2';
import findKindergartenDiary from '@salesforce/apex/ImportantNotesController.findKindergartenDiary';
/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
/* /ポップアップメッセージ表示 */

/* 要録アップデート */
import { createRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import KindergartenDiary_OBJECT from '@salesforce/schema/KindergartenDiary__c';
import ID_FIELD from '@salesforce/schema/KindergartenDiary__c.Id';
import AS_FIELD from '@salesforce/schema/KindergartenDiary__c.AttendanceSchedule__c';
import ENGJIID_FIELD from '@salesforce/schema/KindergartenDiary__c.Contact__c';
import DATE_FIELD from '@salesforce/schema/KindergartenDiary__c.Date__c';
/* 要録アップデート */


export default class StaffAttendanceMenu03 extends LightningElement {
    today = new Date() ;
    todaya = new Date() ;
    @track searchDate = this.today.getFullYear() + "-" + (this.today.getMonth() + 1) + "-"+ this.today.getDate();
    @track titleDate = this.today.getFullYear() + "年" + (this.today.getMonth() + 1) + "月"+ this.today.getDate() + "日の出席簿";
    @track searchYear = this.todaya.getFullYear();
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
        園児リストを取得
    ------------------------ */
    links(event){ 
        var ImportantNoteList;      //要録一覧を一旦格納
        var KindergartenDiaryList;  //園児日報一覧を一旦格納
        var i;                      //forループ用1
        var i2;                     //forループ用2
        var setsCheck;              //forループで要録と日報がマッチしたかどうかをチェック

        //並列処理?的な
        async function merge(searchYear,searchDate){
            //クラスで条件を絞り要録一覧を取得
            ImportantNoteList = await (
                //Apexを呼び出し
                findImportantNotes({
                        searchClass: event.target.dataset.value,
                        searchYear: searchYear
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
                    
                    setsCheck =false;   //マッチ情報を初期化
                    for(i2 = 0; i2< KindergartenDiaryList.length; i2++){
                        if(ImportantNoteList[i].Contact__r.Id === KindergartenDiaryList[i2].Contact__r.Id){
                            ImportantNoteList[i].kindergartenDiaryId = KindergartenDiaryList[i2].Id;
                            ImportantNoteList[i].AttendanceSchedule = KindergartenDiaryList[i2].AttendanceSchedule__c;
                            setsCheck =true;//マッチしたらtrue
                        }
                    }
                    //もし要録に日報がマッチしなかったら出席情報に「未定」といれる
                    if(!(setsCheck)){ImportantNoteList[i].AttendanceSchedule='未定'}
                    
                }
                this.importantNotes = ImportantNoteList;    //表示用の配列にImportantNoteListを入れる
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
        const fields = {};
            fields[ID_FIELD.fieldApiName] = event.target.dataset.kindergartendiaryid;
            fields[AS_FIELD.fieldApiName] = event.target.dataset.value;
            fields[ENGJIID_FIELD.fieldApiName] = this.importantNotes[indexs].Contact__r.Id;
            fields[DATE_FIELD.fieldApiName] = this.searchDate;                              //今日の日付を入れておく
        
        //console.log(fields[ID_FIELD.fieldApiName]);
        
        //もし選んだ要録に日報IDがセットされてなかったら日報を作成し、セットされてたら日報を更新
        if(fields[ID_FIELD.fieldApiName]=== undefined){

            recordInput = {apiName: KindergartenDiary_OBJECT.objectApiName, fields };   //作成する情報をセット 
            createRecord(recordInput)
            
            .then(result => {   //レコード作成に成功したら
                //表示用の配列情報を更新する
                this.importantNotes[indexs].kindergartenDiaryId = result.id;                   //作成したレコードIDを表示用の変数に戻してあげる：再描写
                this.importantNotes[indexs].AttendanceSchedule = fields[AS_FIELD.fieldApiName];//作成した出席情報を表示用の変数に戻してあげる：再描写
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