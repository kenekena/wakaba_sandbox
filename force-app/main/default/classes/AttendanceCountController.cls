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
                                                            															AttendanceStopReason__c, AbsenceReason__c,
                                                            															Lateness__c, LeaveEarly__c
                                                                                                            FROM KindergartenDiary__c 
                                                                                                            WHERE ImportantNotes__c = :ImportantNotesid];

System.debug('KindergartenDiaryList.size()　'+KindergartenDiaryList.size());
        // 園児日誌データなし
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

        Decimal Influenza = 0;					// インフルエンザ
        Decimal WhoopingCough = 0;		// 百日咳（百日咳）
        Decimal Measles = 0;					// 麻風（はしか）
        Decimal Mumps = 0;						// 流行性耳下腺炎（おたふくかぜ）
        Decimal Rubella = 0;					// 風疹（三日はしか）
        Decimal ChickenPox = 0;				// 水痘（みずぼうそう）
        Decimal PoolHeat = 0;				// 咽頭結膜熱（プール熱）
        Decimal Tuberculosis = 0;			// 結核（けっかく）
        Decimal Meningitis = 0;				// 髄膜炎菌性髄膜炎（ずいまくえん）
        Decimal Abduction = 0;				// 忌引き
        Decimal HeadShirami = 0;			// 頭し
        
        // 取得レコード数分処理
        for(integer i=0; KindergartenDiaryList.size()>i; i++){
            // レコード取得
            KindergartenDiary__c  KindergartenDiary = KindergartenDiaryList.get(i);
//System.debug('KindergartenDiary 　'+KindergartenDiary);

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

            // 出席停止理由がある場合
            // 出席停止理由の日数を算出
            if(KindergartenDiary.AttendanceStopReason__c != null){
				// インフルエンザ                
	            if(KindergartenDiary.AttendanceStopReason__c == 'インフルエンザ')
                	Influenza = Influenza + 1;

                // 百日咳（百日咳）                
	            if(KindergartenDiary.AttendanceStopReason__c == '百日咳（百日咳）')
                	WhoopingCough = WhoopingCough + 1;
                
                // 麻風（はしか）              
	            if(KindergartenDiary.AttendanceStopReason__c == '麻風（はしか）')
                	Measles = Measles + 1;
                
                // 流行性耳下腺炎（おたふくかぜ）                
	            if(KindergartenDiary.AttendanceStopReason__c == '流行性耳下腺炎（おたふくかぜ）')
                	Mumps = Mumps + 1;
                
                // 風疹（三日はしか）               
	            if(KindergartenDiary.AttendanceStopReason__c == '風疹（三日はしか）')
                	Rubella = Rubella + 1;
                
                // 水痘（みずぼうそう）               
	            if(KindergartenDiary.AttendanceStopReason__c == '水痘（みずぼうそう）')
                	ChickenPox = ChickenPox + 1;
                
                // 咽頭結膜熱（プール熱）                
	            if(KindergartenDiary.AttendanceStopReason__c == '咽頭結膜熱（プール熱）')
                	PoolHeat = PoolHeat + 1;
                
                // 結核（けっかく）               
	            if(KindergartenDiary.AttendanceStopReason__c == '結核（けっかく）')
                	Tuberculosis = Tuberculosis + 1;
                
                // 髄膜炎菌性髄膜炎（ずいまくえん）               
	            if(KindergartenDiary.AttendanceStopReason__c == '髄膜炎菌性髄膜炎（ずいまくえん）')
                	Meningitis = Meningitis + 1;
            }
            
            // 欠席理由がある場合
            // 忌引き、頭しの日数を算出
            if(KindergartenDiary.AbsenceReason__c != null){
                // 忌引き
	            if(KindergartenDiary.AbsenceReason__c == '忌引き')
                	Abduction = Abduction + 1;
                // 頭し
	            if(KindergartenDiary.AbsenceReason__c == '頭し')
                	HeadShirami = HeadShirami + 1;
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
																	Influenza__c = Influenza,
																	WhoopingCough__c = WhoopingCough,
																	Measles__c = Measles,
																	Mumps__c = Mumps,
																	Rubella__c = Rubella,
																	ChickenPox__c= ChickenPox,
																	PoolHeat__c = PoolHeat,
																	Tuberculosis__c = Tuberculosis,
																	Meningitis__c = Meningitis,
																	Abduction__c = Abduction,
																	HeadShirami__c= HeadShirami,
																	LeaveEarly__c = LeaveEarly,
                                                                    Lateness__c = Lateness,
																	AggregationTime__c = Datetime.now()
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