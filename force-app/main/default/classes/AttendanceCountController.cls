public without sharing class AttendanceCountController {

    // 要録情報OBJからボタンで呼び出し
    @AuraEnabled
    public static String AttendanceCounting(ID ImportantNotesid) {

        // 要録情報データを検索
        List<ImportantNotes__c> ImportantNotesList = [SELECT Id, Belongs__c
                                                                                                            FROM ImportantNotes__c 
                                                                                                            WHERE Id = :ImportantNotesid];

        // 要録情報データあり
        if(ImportantNotesList.size() == 0){
            // データなしメッセージ
            return '要録情報データができません！';
        }

        // 要録情報データを取得
        ImportantNotes__c ImportantNotes = ImportantNotesList.get(0);
System.debug('ImportantNotes　'+ImportantNotes);


        // 園児日誌データを検索
        List<KindergartenDiary__c> KindergartenDiaryList = [SELECT Id, AttendanceSchedule__c, Belongs__c,
                                                                                                                        AttendingSchool__c, AttendanceStop__c,
                                                            															Lateness__c, LeaveEarly__c
                                                                                                            FROM KindergartenDiary__c 
                                                                                                            WHERE ImportantNotes__c = :ImportantNotesid];

System.debug('KindergartenDiaryList.size()　'+KindergartenDiaryList.size());
        // 園児日誌データあり
        if(KindergartenDiaryList.size() == 0){
            // データなしメッセージ
            return '園児日誌データがありません！';
        }

        // 項目定義
        Decimal ChildcareDays = 0;
        Decimal AttendanceDays = 0;
        Decimal AbsenceDays = 0;
        Decimal AttendanceStopDays = 0;
        Decimal LeaveEarly = 0;
        Decimal Lateness = 0;

        // 取得レコード数分処理
        for(integer i=0; KindergartenDiaryList.size()>i; i++){
            // レコード取得
            KindergartenDiary__c  KindergartenDiary = KindergartenDiaryList.get(i);
System.debug('KindergartenDiary 　'+KindergartenDiary);

            // IDを設定
            ID IKindergartenDiaryId = KindergartenDiary.Id;

            // 出欠席予定が出席の場合かつ所属が幼稚園部の場合は出席日数をカウント
            // 出欠席予定が出席の場合かつ所属が保育部XXXの場合は保育日数をカウント
            // 出欠席予定が欠席の場合は欠席日数をカウント
            // 出欠席予定が欠席の場合かつ出席停止がTRUEの場合は出席停止日数をカウント
            if(KindergartenDiary.AttendanceSchedule__c == '出席'){
                if(KindergartenDiary.Belongs__c == '幼稚園部'){
                    // 出席日数を算出
                    AttendanceDays = AttendanceDays + 1;
                }else if(KindergartenDiary.Belongs__c == '保育園部の標準時間' || 
                    KindergartenDiary.Belongs__c == '保育園部の短時間'){
                    // 保育日数を算出
                    ChildcareDays = ChildcareDays + 1;
                }else  if(KindergartenDiary.Belongs__c == Null ){
                    //　所属に値がない場合は要録情報の所属で判定
                    if(ImportantNotes.Belongs__c == '幼稚園部'){
                        // 出席日数を算出
                            AttendanceDays = AttendanceDays + 1;
                    }else if(ImportantNotes.Belongs__c == '保育園部の標準時間' || 
                        ImportantNotes.Belongs__c == '保育園部の短時間'){
                        // 保育日数を算出
                        ChildcareDays = ChildcareDays + 1;
                    }
                }
            }
            else if(KindergartenDiary.AttendanceSchedule__c == '欠席'){
                // 欠席日数を算出
                AbsenceDays = AbsenceDays + 1;
                if(KindergartenDiary.AttendanceStop__c == TRUE){
                    // 出席停止日数を算出
                    AttendanceStopDays = AttendanceStopDays + 1;
                }
            }
            // 遅刻日数を算出
            if(KindergartenDiary.Lateness__c == TRUE){
                Lateness = Lateness + 1;
            }
            // 早退日数を算出
            if(KindergartenDiary.LeaveEarly__c == TRUE){
                LeaveEarly = LeaveEarly + 1;
            }

        }

        // 要録情報OBJ
        List<ImportantNotes__c> ImportantNotesTMP = new List<ImportantNotes__c>();

        // 要録情報OBJを更新情報
        ImportantNotesTMP.add(new ImportantNotes__c(
                                                                    Id = ImportantNotesid,
                                                                    ChildcareDays__c = ChildcareDays,
                                                                    AttendanceDays__c = AttendanceDays,
                                                                    AbsenceDays__c = AbsenceDays,
                                                                    AttendanceStopDays__c = AttendanceStopDays,
                                                                    LeaveEarly__c = LeaveEarly,
                                                                    Lateness__c = Lateness
                                                            )
        );
        
        // 要録情報OBJデータ更新
        if (ImportantNotesTMP.size() > 0) {
            try{
System.debug('update ImportantNotesTMP　'+ImportantNotesTMP);
                update ImportantNotesTMP;
            }catch(DmlException e){
                System.debug('ImportantNotes__c 要録情報OBJの更新失敗');
                Integer errNum = e.getNumDml();
                for(Integer i = 0; i < errNum; i++){
                    ImportantNotesTMP.get(e.getDmlIndex(i)).addError('要録情報データ更新時にエラーが発生しました'+e.getDmlMessage(i));
                }
            }
        }

        // 処理完了メッセージ
            return '日数集計処理が完了しました！';
    }
}