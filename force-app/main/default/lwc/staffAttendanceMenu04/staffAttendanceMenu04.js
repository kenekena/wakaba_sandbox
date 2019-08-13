/* eslint-disable no-console */
import { LightningElement,track,wire } from 'lwc';

/* 選択リストを取得 */
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import LIST_FiscalYear from '@salesforce/schema/ImportantNotes__c.FiscalYear__c';

/* ポップアップメッセージ表示 */
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

/* APEX Class呼び出し */
import findImportantNotes from '@salesforce/apex/ImportantNotesV2Controller.findImportantNotes';

export default class StaffAttendanceMenu04 extends LightningElement {
    @track ThisYear = "2019";
    ThisKindergarten = "北広島わかば";
    @track FiscalYearList  = [];


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





}