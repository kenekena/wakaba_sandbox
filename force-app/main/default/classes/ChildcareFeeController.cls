public without sharing class ChildcareFeeController {

    // 保育料OBJからボタンで呼び出し
    @AuraEnabled
    public static String ChildcareCalculation(ID ChildcareFeeid) {

        // 所属項目定義
		String Kindergarten  = '幼稚園部';
		String NurserySchool_Short  = '保育園部の短時間';
		String NurserySchool_Standrd  = '保育園部の標準時間';
        // 所属の別項目定義
		String No1Certification  = '1号認定';
		String No1Certification2  = '1号認定新2号';
		String No1Certification3  = '1号認定新3号';
		String No1CertificationY  = '1号認定（2歳児）';
		String No2Certification  = '2号認定';
		String No3Certification  = '3号認定';
        
        // 料金区分項目定義
		String PTAFee_STR = 'PTA会費';
		String EducationCosts_STR = '特別教育費';
		String Diapers_STR = 'おむつ破棄代';
		String ChangeFee_STR = '区分変更手数料';
		String Fee_STR = '手数料';
		String StapleFoodCost_STR = '主食費';
		String SideDishCost_STR = '副食費';
		String MonthCustody_STR = '預かり保育料';
		String GraduationAlbum_STR = '卒園アルバム費';

        // 預かり種別項目定義
		String Normal_STR = '通常預かり';
		String Saturday_STR = '土曜日預かり';
		String LongBreak_STR = '長期休み預かり';
		String EndChildcare_STR = '保育終了';
		String Holiday_STR = '休み';

        // 預かり区分項目定義
		String MorningChildcare_STR = '朝の預かり保育';


        // 副食費の免除額
		Decimal SideDishCost_Exemption = 4500;
        // 登園日数
		Decimal Attendance_cnt = 0;

		// ------------------------------------------------------------------------
        // 保育料データを検索
		// ------------------------------------------------------------------------
		List<ChildcareFee__c> ChildcareFeeList = [SELECT Id, ImportantNotes__c,
                                                                                                Year__c, Month__c, YearMonth__c,
																								DiapersCheck__c, BusFareCheck__c,
																								TeachingMaterialsCheck__c, FeeCheck__c,
																								ChangeFeeCheck__c, GraduationAlbumCheck__c,
                                                  												ApplicationCategory__c, SchoolLunchfree__c,
																								OutsideFast__c, Outside__c
                                                  												FROM ChildcareFee__c 
                                                                                                WHERE Id = :ChildcareFeeid];
        // 保育料データなし
        if(ChildcareFeeList.size() == 0){
            // データなしメッセージ
            return '保育料データがありません！';
        }

        // 保育料データを取得
        ChildcareFee__c ChildcareFee = ChildcareFeeList.get(0);
        ID ImportantNotesid = ChildcareFee.ImportantNotes__c;
        Integer Year = Integer.Valueof(ChildcareFee.Year__c);
        Integer Month = Integer.Valueof(ChildcareFee.Month__c);
        String OutsideFast = '0'+ChildcareFee.OutsideFast__c;
        String Outside = ChildcareFee.Outside__c;
//System.debug('ChildcareFee　'+ChildcareFee);

		// ------------------------------------------------------------------------
        // 要録情報データを検索
		// ------------------------------------------------------------------------
        List<ImportantNotes__c> ImportantNotesList = [SELECT Id, Contact__c, School__c, Age__c,
                                                                                                            Belongs__c, AnotherAffiliation__c,
                                                                                                            Number__c, PassageRoute__c,
                                                                                                            BankName__c, StoreNumber__c,
                                                                                                            AccountNumber__c, AccountName__c,
                                                                                                            SchoolLunch__c
                                                                                                FROM ImportantNotes__c 
                                                                                                WHERE Id = :ImportantNotesid];
        // 要録情報データなし
        if(ImportantNotesList.size() == 0){
            // データなしメッセージ
            return '要録情報データがありません！';
        }

        // 要録情報データを取得
        ImportantNotes__c ImportantNotes = ImportantNotesList.get(0);
//System.debug('ImportantNotes　'+ImportantNotes);
        ID ContactId = ImportantNotes.Contact__c;

        // 完全給食
		Decimal SchoolLunch = 0;
        if(ImportantNotes.SchoolLunch__c == TRUE)
			SchoolLunch = 1;

        // 副食費免除者
		Decimal SchoolLunchfree = 0;
//        if(ImportantNotes.SchoolLunchfree__c == TRUE)
        if(ChildcareFee.SchoolLunchfree__c == TRUE)
			SchoolLunchfree = 1;

        // 所属、所属の別のパターンを設定
        // 幼稚園部　１号認定：100
        // 幼稚園部　１号認定新２号：101
        // 幼稚園部　１号認定新３号：102
        // 幼稚園部　１号認定（２歳児）：103
        // 保育園部の短時間　　2号認定：2０２
        // 保育園部の短時間　　3号認定：２０3
        // 保育園部の標準時間　　2号認定：302
        // 保育園部の標準時間　　3号認定：303

        // 幼稚園部
        Decimal Belongs_AnotherAffiliation = 0;
        if(ImportantNotes.Belongs__c == Kindergarten){
			// １号認定：101
            if(ImportantNotes.AnotherAffiliation__c == No1Certification)
                Belongs_AnotherAffiliation = 101;
			// １号認定新２号：102
            if(ImportantNotes.AnotherAffiliation__c == No1Certification2)
                Belongs_AnotherAffiliation = 102;
			// １号認定新３号：103
            if(ImportantNotes.AnotherAffiliation__c == No1Certification3)
                Belongs_AnotherAffiliation = 103;
			// １号認定（２歳児）：100
            if(ImportantNotes.AnotherAffiliation__c == No1CertificationY)
                Belongs_AnotherAffiliation = 100;
        }
        // 保育園部の短時間
        if(ImportantNotes.Belongs__c == NurserySchool_Short){
			// 保育園部の短時間　　2号認定：202
            if(ImportantNotes.AnotherAffiliation__c == No2Certification)
                Belongs_AnotherAffiliation = 202;
			// 保育園部の短時間　　3号認定：203
            if(ImportantNotes.AnotherAffiliation__c == No3Certification)
                Belongs_AnotherAffiliation = 203;
        }
        // 保育園部の標準時間
        if(ImportantNotes.Belongs__c == NurserySchool_Standrd){
			// 保育園部の標準時間　　2号認定：302
            if(ImportantNotes.AnotherAffiliation__c == No2Certification)
                Belongs_AnotherAffiliation = 302;
			// 保育園部の標準時間　　3号認定：303
            if(ImportantNotes.AnotherAffiliation__c == No3Certification)
                Belongs_AnotherAffiliation = 303;            
        }
System.debug('Belongs_AnotherAffiliation　'+Belongs_AnotherAffiliation);
        

		// ------------------------------------------------------------------------
		// 料金マスタより費用を設定
		// ------------------------------------------------------------------------
		// 料金マスタデータを検索
		// 預かり種別の昇順、預かり終了時間の昇順、預かり開始時間の昇順
		List<ChargeMaster__c> ChargeMasterList = [SELECT Name, ChargeCategory__c,
                                                                                                Belongs__c, AnotherAffiliation__c,
                                                  												MonthlyCharge__c, DailyCharge__c,
                                                  												CustodyStart__c, CustodyEnd__c,
                                                  												CustodyType__c, CustodyDivision__c
                                                                                                FROM ChargeMaster__c
																								ORDER BY CustodyType__c ASC,
																								CustodyEnd__c ASC,
																								CustodyStart__c ASC];

        // 算出項目定義
        Decimal PTAFee = 0;						// PTA会費
        Decimal EducationCosts = 0;			// 特別教育費
		Decimal Diapers = 0;					// おむつ破棄代
        Decimal ChangeFee = 0;				// 区分変更手数料
        Decimal Fee = 0;						// 手数料
        Decimal StapleFoodCost = 0;			// 主食費
        Decimal SideDishCost = 0;			// 副食費
        Decimal GraduationAlbum = 0;		// 卒園アルバム費
        Decimal DailyCustody = 0;				// 預かり代（日申込）
        Decimal MonthlyCustody = 0;			// 預かり代（月申込）
        Decimal MonthCustody = 0;			// 預かり代
        Decimal MonthCustodyApplication = 0;	// 預かり代(日申込算出)
        
        Decimal StapleFoodCost_Full = 0;			// 主食費（完全給食）
        Decimal SideDishCost_Full = 0;			// 副食費（完全給食）
        Decimal NormalCustody = 0;			// 預かり代（土曜日預かり）
        Decimal SaturdayCustody = 0;			// 預かり代（土曜日預かり）
        Decimal LongBreakCustody = 0;			// 預かり代（長期預かり）

        // 預かり保育のマスタ項目定義
        List<String> nm = new String[50];
        List<String> CustodyStart = new String[50];
        List<String> CustodyEnd = new String[50];
        List<String> CustodyType = new String[50];
        List<String> CustodyDivision = new String[50];
        List<Decimal> MonthlyCharge = new Decimal[50];
        List<Decimal> DailyCharge = new Decimal[50];

        // 料金マスタデータ数分処理
        Integer cnt = 0;
    	for(integer i=0; ChargeMasterList.size()>i; i++){
            // 項目を取得
	        ChargeMaster__c ChargeMaster = ChargeMasterList.get(i);

            // ■PTA会費
            if(ChargeMaster.ChargeCategory__c == PTAFee_STR){
                PTAFee = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
            }
            // ■特別教育費
            if(ChargeMaster.ChargeCategory__c == EducationCosts_STR){
                EducationCosts = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
            }
            // ■おむつ破棄代
            if(ChargeMaster.ChargeCategory__c == Diapers_STR){
                if(ChildcareFee.DiapersCheck__c == TRUE)
	                Diapers = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                else
                    Diapers = null;
            }
            // ■区分変更手数料
            if(ChargeMaster.ChargeCategory__c == ChangeFee_STR){
                if(ChildcareFee.ChangeFeeCheck__c == TRUE)
	                ChangeFee = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                else
                    ChangeFee = null;
            }
            // ■手数料
            if(ChargeMaster.ChargeCategory__c == Fee_STR){
                if(ChildcareFee.FeeCheck__c == TRUE)
	                Fee = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                else
                    Fee = null;
            }
            // ■卒園アルバム費
            if(ChargeMaster.ChargeCategory__c == GraduationAlbum_STR){
                if(ChildcareFee.GraduationAlbumCheck__c == TRUE)
	                GraduationAlbum = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                else
                    GraduationAlbum = null;
            }

            // ■主食費
            if(ChargeMaster.ChargeCategory__c == StapleFoodCost_STR){
				// 保育園部の標準時間
                if(Belongs_AnotherAffiliation >= 300){
					if(ChargeMaster.Belongs__c == NurserySchool_Standrd)
		                StapleFoodCost = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                }
				// 保育園部の短時間
                else if(Belongs_AnotherAffiliation >= 200){
					if(ChargeMaster.Belongs__c == NurserySchool_Short)
		                StapleFoodCost = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                }
				// 幼稚園部
                else if(Belongs_AnotherAffiliation > 100){
					if(ChargeMaster.Belongs__c == Kindergarten)
		                StapleFoodCost = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                }
                // 完全給食
				if(ChargeMaster.Belongs__c == null)
		            StapleFoodCost_Full = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
            }

            // ■副食費
            if(ChargeMaster.ChargeCategory__c == SideDishCost_STR){
				// 保育園部の標準時間
                if(Belongs_AnotherAffiliation >= 300){
					if(ChargeMaster.Belongs__c == NurserySchool_Standrd)
		                SideDishCost = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                }
				// 保育園部の短時間
                else if(Belongs_AnotherAffiliation >= 200){
					if(ChargeMaster.Belongs__c == NurserySchool_Short)
		                SideDishCost = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                }
				// 幼稚園部
                else if(Belongs_AnotherAffiliation > 100){
					if(ChargeMaster.Belongs__c == Kindergarten)
		                SideDishCost = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
                }
                // 完全給食
				if(ChargeMaster.Belongs__c == null)
		            SideDishCost_Full = Integer.ValueOf(ChargeMaster.MonthlyCharge__c);
            }

            // ■預かり保育料
            if(ChargeMaster.ChargeCategory__c == MonthCustody_STR){
				// 保育園部の標準時間
                if(Belongs_AnotherAffiliation >= 300){
					if(ChargeMaster.Belongs__c == NurserySchool_Standrd){
	                    nm[cnt] = ChargeMaster.Name;
            			CustodyStart[cnt] = ChargeMaster.CustodyStart__c;
            			CustodyEnd[cnt] = ChargeMaster.CustodyEnd__c;
            			CustodyType[cnt] = ChargeMaster.CustodyType__c;
            			CustodyDivision[cnt] = ChargeMaster.CustodyDivision__c;
            			MonthlyCharge[cnt] = ChargeMaster.MonthlyCharge__c;
            			DailyCharge[cnt] = ChargeMaster.DailyCharge__c;
		                cnt = cnt + 1;
                    }
                }
				// 保育園部の短時間
                else if(Belongs_AnotherAffiliation >= 200){
					if(ChargeMaster.Belongs__c == NurserySchool_Short){
	                    nm[cnt] = ChargeMaster.Name;
            			CustodyStart[cnt] = ChargeMaster.CustodyStart__c;
            			CustodyEnd[cnt] = ChargeMaster.CustodyEnd__c;
            			CustodyType[cnt] = ChargeMaster.CustodyType__c;
            			CustodyDivision[cnt] = ChargeMaster.CustodyDivision__c;
            			MonthlyCharge[cnt] = ChargeMaster.MonthlyCharge__c;
            			DailyCharge[cnt] = ChargeMaster.DailyCharge__c;
		                cnt = cnt + 1;
                    }
                }
				// 幼稚園部
                else if(Belongs_AnotherAffiliation >= 100){
					if(ChargeMaster.Belongs__c == Kindergarten){
	                    nm[cnt] = ChargeMaster.Name;
            			CustodyStart[cnt] = ChargeMaster.CustodyStart__c;
            			CustodyEnd[cnt] = ChargeMaster.CustodyEnd__c;
            			CustodyType[cnt] = ChargeMaster.CustodyType__c;
            			CustodyDivision[cnt] = ChargeMaster.CustodyDivision__c;
            			MonthlyCharge[cnt] = ChargeMaster.MonthlyCharge__c;
            			DailyCharge[cnt] = ChargeMaster.DailyCharge__c;
		                cnt = cnt + 1;
                    }
                }
            }
        }
//System.debug('PTA会費　'+PTAFee);
//System.debug('特別教育費　'+EducationCosts);
//System.debug('おむつ破棄代　'+Diapers);
//System.debug('区分変更手数料　'+ChangeFee);
//System.debug('手数料　'+Fee);
//System.debug('完全給食_主食費　'+StapleFoodCost_Full);
//System.debug('完全給食_副食費　'+SideDishCost_Full);
//System.debug('主食費　'+StapleFoodCost);
//System.debug('副食費　'+SideDishCost);
//System.debug('預かり代（日申込）　'+DayCustody);
//System.debug('預かり代（月申込）　'+MonthCustody);

//System.debug('預かり代_項目名　'+nm);
//System.debug('CustodyStart　'+CustodyStart);
//System.debug('CustodyEnd　'+CustodyEnd);
//System.debug('CustodyType　'+CustodyType);
//System.debug('CustodyDivision　'+CustodyDivision);
//System.debug('MonthlyCharge　'+MonthlyCharge);
//System.debug('DailyCharge　'+DailyCharge);

//System.debug('完全給食　'+SchoolLunch);
System.debug('副食費免除者　'+SchoolLunchfree);


        // ---------------------------------------------------------------------------------------
		// 主食費および副食費の算出
		// １号認定（２歳児）は保育料に含まれているので算出しない
		// １号認定、１号認定新２号、１号認定新３号、２号認定は、完全給食がある
		// ３号認定は、３歳になった月から主食費のみ算出（副食費はない）
		// 副食費免除に✓がある場合は、免除額分マイナス
		// --------------------------------------------------------------------------------------
		// 幼稚園部　１号認定（２歳児）の場合、費用は０円（保育料に含まれている）
        if(Belongs_AnotherAffiliation == 100){
        	StapleFoodCost = 0;
        	SideDishCost = 0;
        }else{
            // ３号認定者の場合
	        if(Belongs_AnotherAffiliation == 203 || Belongs_AnotherAffiliation == 303){
		        SideDishCost = 0;
//System.debug('Integer.valueof((ImportantNotes.Age__c).substring(0,2))　'+Integer.valueof((ImportantNotes.Age__c).substring(0,2)));
    	    	// 要録情報の年齢が3歳以上でない場合は0円
        	    if(3 > Integer.valueof((ImportantNotes.Age__c).substring(0,2)))
            		StapleFoodCost = 0;
            }
            else{
	            // 完全給食にチェックがある場合
    	    	if(SchoolLunch == 1){
        			StapleFoodCost = StapleFoodCost + StapleFoodCost_Full;
        			SideDishCost = SideDishCost + SideDishCost_Full;
        		}

	            // 副食費免除者にチェックがある場合、免除額分減算
    	        if(SchoolLunchfree == 1){
        	        if(SideDishCost < SideDishCost_Exemption)
	        	        SideDishCost = 0;
    	        	else
        	        	SideDishCost = SideDishCost - SideDishCost_Exemption;
            	}
            }
        }

        // -----------------------------------------------------------------------------------------------
		// 預かり保育料の算出
		// 幼稚園部は、通常預かり、土曜日預かり、長期休みがある
		// また預かり代は日申込、月申込で費用が変わる、それぞれ算出
		// ただし月申込でも平日の出勤数が平日の半分に満たない場合は日申込の費用を請求
		// 保育園部は、短時間預かり、標準時間預かりがある
		// -----------------------------------------------------------------------------------------------
        // 項目定義
        List<Date> ChildcareTimeMasterDate = new Date[31];
        List<String> ChildcareEndTime  = new String[31];

        // 園児日誌データを取得対象期間（先月）
		Date StartDate = date.newinstance(Year, Month-1, 1);
		Date EndDate = date.newinstance(Year, Month, 1)-1;
        // １月の場合は、昨年の１２月１日〜１２月３１日
        if(Month == 1){
			StartDate = date.newinstance(Year-1, 12, 1);
			EndDate = date.newinstance(Year, Month, 1)-1;
        }
System.debug('StartDate　'+StartDate);
System.debug('EndDate　'+EndDate);

		// 保育時間マスタデータを検索
		List<ChildcareTimeMaster__c> ChildcareTimeMasterList = [SELECT Id, Date__c, 
																															ChildcareEndTime__c
                                                                                                				FROM ChildcareTimeMaster__c
																												WHERE Date__c >= :StartDate
																												AND Date__c <= :EndDate
																												ORDER BY Date__c DESC];
        // 保育時間マスタデータ数分処理
        Integer Weekdays = 0;
    	for(integer i=0; ChildcareTimeMasterList.size()>i; i++){
            // 項目を取得
	        ChildcareTimeMaster__c ChildcareTimeMaster = ChildcareTimeMasterList.get(i);
//System.debug('ChildcareTimeMaster　'+ChildcareTimeMaster);

            ChildcareTimeMasterDate[i] = ChildcareTimeMaster.Date__c;
            ChildcareEndTime[i] = ChildcareTimeMaster.ChildcareEndTime__c;
            
            // 平日の日数をカウント
      		if(ChildcareTimeMaster.ChildcareEndTime__c != Holiday_STR && ChildcareTimeMaster.ChildcareEndTime__c != Saturday_STR)
                Weekdays = Weekdays + 1;
        }
//System.debug('ChildcareTimeMasterDate　'+ChildcareTimeMasterDate);
//System.debug('ChildcareEndTime　'+ChildcareEndTime);

        // 園児日誌データを検索
		List<KindergartenDiary__c> KindergartenDiaryList = [SELECT Id, Date__c, Week__c,
                                                                                                				AttendingSchoolTime__c,
                                                  																GoingBackTime__c,
																												Charge__c, AttendanceSchedule__c,
                                                            													MonthlyApplication__c
                                                                                                		FROM KindergartenDiary__c
																										WHERE Date__c >= :StartDate
																										AND Date__c <= :EndDate
																										AND Contact__c = :ContactId
																										ORDER BY Date__c DESC];
        // 園児日誌データ数分処理
    	for(integer i=0; KindergartenDiaryList.size()>i; i++){
            // 項目を取得
	        KindergartenDiary__c KindergartenDiary = KindergartenDiaryList.get(i);
System.debug('KindergartenDiary　'+KindergartenDiary);

            // 保育料を算出
			MonthCustody = MonthCustody + KindergartenDiary.Charge__c;
            
            // 保育料(日申込算出)を算出
			MonthCustodyApplication = MonthCustodyApplication + KindergartenDiary.MonthlyApplication__c;
            
            // 出席をカウント
            if(KindergartenDiary.AttendanceSchedule__c == '出席')
                Attendance_cnt = Attendance_cnt +1;

        }

        // --------------------------------------------------------------------
        // 幼稚園部の場合かつ月申込かつ
        // 登園日数が月の半分より小さい場合
        // 日申込の金額で再算出する
        // --------------------------------------------------------------------
        if(Belongs_AnotherAffiliation < 200){
	        if(ChildcareFee.ApplicationCategory__c == '月申込'){
System.debug('Attendance_cnt　'+Attendance_cnt);
//System.debug('Decimal.valueof(EndDate.day())/2　'+Decimal.valueof(EndDate.day())/2);
System.debug('Decimal.valueof(EndDate.day())/2　'+Weekdays/2);
//            	if(Attendance_cnt < Decimal.valueof(EndDate.day())/2){
            	if(Attendance_cnt < Weekdays/2){
	            	// 保育料(日申込算出)を保育料に設定
					MonthCustody = MonthCustodyApplication;
                }
            }
        }

System.debug('預かり保育料　 MonthCustody　'+ MonthCustody);

        // ------------------------------------------------------------------------
		// 算出結果を保育料に反映（データ更新）
		// ------------------------------------------------------------------------
	    // 保育料OBJ
		List<ChildcareFee__c > ChildcareFeeTMP = new List<ChildcareFee__c >();

        // 保育料OBJを更新情報
        ChildcareFeeTMP.add(new ChildcareFee__c(
            	       												Id = ChildcareFeeId,
                	   												PTAFee__c = PTAFee,
                   													EducationCosts__c = EducationCosts,
                   													Diapers__c = Diapers,
               										                ChangeFee__c = ChangeFee,
               										                Fee__c = Fee,
               										                GraduationAlbum__c = GraduationAlbum,
               										                StapleFoodCost__c = StapleFoodCost,
               										                SideDishCost__c = SideDishCost,
               										                MonthCustody__c = MonthCustody,
               										                MonthlyCustody__c = MonthlyCustody,
               										                DailyCustody__c = DailyCustody
        										)
        );

	    // 保育料OBJデータ更新
    	if (ChildcareFeeTMP.size() > 0) {
        	try{
System.debug('after update ChildcareFeeTMP　'+ChildcareFeeTMP);
        		update ChildcareFeeTMP;
            }catch(DmlException e){
            	System.debug('KindergartenDiary__c after update1 保育料OBJの更新失敗');
	            Integer errNum = e.getNumDml();
	    	    for(Integer i = 0; i < errNum; i++){
    	    		ChildcareFeeTMP.get(e.getDmlIndex(i)).addError('保育料データ更新時にエラーが発生しました'+e.getDmlMessage(i));
        	    }
	        }
    	}

        
        // 処理完了メッセージ
        return '反映処理が完了しました！';
    }
}