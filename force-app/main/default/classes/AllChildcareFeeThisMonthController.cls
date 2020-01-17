public without sharing class AllChildcareFeeThisMonthController {

    // 保育料OBJからボタンで呼び出し
    @AuraEnabled
    public static String ChildcareCalculation() {

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



        // 本日を取得
        Date Today = Date.today();
        // 今月の年と月を設定
        String ThisYear = String.valueof(Today.year());
        String ThisMonth = String.valueof(Today.month());
        // 先月の年と月を設定
        String LastYear = String.valueof(Today.year());
        String LastMonth = String.valueof(Today.month()-1);
		// 今月が１月の場合-1年
        if(Today.month()==1)
        	LastYear = String.valueof(Today.year()-1);
                
        // 年度を設定
        String Nendo = String.valueof(Today.year());
		// 今月が１月の場合-1年
        if(1<=Today.month() && Today.month()<=3)
        	Nendo = String.valueof(Today.year()-1);
        
		// ------------------------------------------------------------------------
		// 料金マスタより費用を取得
		// ------------------------------------------------------------------------
		// 配列定義
        List<String> CM_Name = new String[50];								// 項目名
        List<String> CM_ChargeCategory = new String[50];			// 料金区分
        List<String> CM_Belongs = new String[50];							// 所属
        List<String> CM_AnotherAffiliation = new String[50];		// 所属の別
        List<Decimal> CM_MonthlyCharge = new Decimal[50];		// 月料金
        List<Decimal> CM_DailyCharge = new Decimal[50];				// 日料金
        List<String> CM_CustodyStart = new String[50];				// 預かり開始
        List<String> CM_CustodyEnd = new String[50];				// 預かり終了
        List<String> CM_CustodyType = new String[50];				// 預かり種別
        List<String> CM_CustodyDivision = new String[50];			// 預かり区分
		
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
		// 配列に格納
        for(integer cm=0; ChargeMasterList.size()>cm; cm++){
	        ChargeMaster__c ChargeMaster = ChargeMasterList.get(cm);

	        CM_Name[cm] = ChargeMaster.Name;
    	    CM_ChargeCategory[cm] = ChargeMaster.ChargeCategory__c;
        	CM_Belongs[cm] = ChargeMaster.Belongs__c;
	        CM_AnotherAffiliation[cm] = ChargeMaster.AnotherAffiliation__c;
    	    CM_MonthlyCharge[cm] = ChargeMaster.MonthlyCharge__c;
        	CM_DailyCharge[cm] = ChargeMaster.DailyCharge__c;
	        CM_CustodyStart[cm] = ChargeMaster.CustodyStart__c;
    	    CM_CustodyEnd[cm] = ChargeMaster.CustodyEnd__c;
        	CM_CustodyType[cm] = ChargeMaster.CustodyType__c;
        	CM_CustodyDivision[cm] = ChargeMaster.CustodyDivision__c;
        }


        // ------------------------------------------------------------------------
        // 保育料データと要録データを取得
		// ------------------------------------------------------------------------
        // 配列　の定義
        List<ID>ChildcareFeeId = new ID[500];												// 保育料ID
        List<ID> ContactId = new ID[500];														// 園児ID
        List<ID> ImportantNotesid = new ID[500];										// 要録情報ID
        List<String> Year = new String[500];												// 年
        List<String> Month = new String[500];												// 月
        List<String> YearMonth = new String[500];										// 年月
        List<Boolean > DiapersCheck = new Boolean [500];						// おむつ破棄代有無
        List<Boolean > BusFareCheck = new Boolean [500];						// バス代有無
        List<Boolean > TeachingMaterialsCheck = new Boolean [500];		// 個人持教材有無
        List<Boolean > FeeCheck = new Boolean [500];								// 手数料有無
        List<Boolean > ChangeFeeCheck = new Boolean [500];					// 区分変更手数料
        List<Boolean > GraduationAlbumCheck = new Boolean [500];		// 卒業アルバム費有無
        List<String> ApplicationCategory = new String[500];						// 申込区分
        List<String> OutsideFast = new String[500];										// 朝の預かり保育
        List<String> Outside = new String[500];												// 預かり保育
        List<Decimal > SchoolLunchfree = new Decimal [500];						// 副食費免除者

        List<Decimal > PTAFee = new Decimal [500];									// PTA会費
        List<Decimal > EducationCosts = new Decimal [500];						// 特別教育費
        List<Decimal > Diapers = new Decimal [500];									// おむつ破棄代
        List<Decimal > ChangeFee = new Decimal [500];							// 区分変更手数料
        List<Decimal > Fee = new Decimal [500];											// 手数料
        List<Decimal > GraduationAlbum = new Decimal [500];					// 卒業アルバム費
        List<Decimal > SideDishCost = new Decimal [500];						// 副食費
        List<Decimal > SideDishCost_Full = new Decimal [500];				// 副食費（完全給食）
        List<Decimal > StapleFoodCost = new Decimal [500];					// 主食費
        List<Decimal > StapleFoodCost_Full = new Decimal [500];			// 主食費（完全給食）
        
        List<String> School = new String[500];												// 幼稚園
        List<String> Age = new String[500];													// 年齢
        List<String> Belongs = new String[500];											// 所属
        List<String> AnotherAffiliation = new String[500];							// 所属の別
        List<String> EnjiNumber = new String[500];									// 園児番号
        List<String> PassageRoute = new String[500];							// 通園コース
        List<Decimal> SchoolLunch = new Decimal[500];							// 完全給食

        List<Decimal> Belongs_AnotherAffiliation = new Decimal[500];		// 所属パターン
        
		List<ChildcareFee__c> ChildcareFeeList = [SELECT Id, ImportantNotes__c, Contact__c,
                                                                                                Year__c, Month__c, YearMonth__c,
																								DiapersCheck__c, BusFareCheck__c,
																								TeachingMaterialsCheck__c, FeeCheck__c,
																								ChangeFeeCheck__c, GraduationAlbumCheck__c,
                                                  												ApplicationCategory__c, SchoolLunchfree__c,
																								OutsideFast__c, Outside__c,
                                                  												ImportantNotes__r.School__c,
                                                  												ImportantNotes__r.Age__c,
                                                  												ImportantNotes__r.Belongs__c,
                                                  												ImportantNotes__r.AnotherAffiliation__c,
                                                  												ImportantNotes__r.Number__c,
                                                  												ImportantNotes__r.PassageRoute__c,
                                                  												ImportantNotes__r.SchoolLunch__c
                                                  												FROM ChildcareFee__c 
                                                                                                WHERE Year__c = :ThisYear AND 
                                                  												Month__c = :ThisMonth
//                                                                                                WHERE Year__c = :LastYear AND 
//                                                  												Month__c = :LastMonth
                                                 												ORDER BY Contact__c ASC];
        // 保育料データなし
        if(ChildcareFeeList.size() == 0){
            // データなしメッセージ
            return '保育料データがありません！';
        }

		// 配列に格納
        for(integer c=0; ChildcareFeeList.size()>c; c++){
	        ChildcareFee__c ChildcareFee = ChildcareFeeList.get(c);

        	ChildcareFeeId[c] = ChildcareFee.Id;
        	ContactId[c] = ChildcareFee.Contact__c;
	        ImportantNotesid[c] = ChildcareFee.ImportantNotes__c;
	        Year[c] = ChildcareFee.Year__c;
    	    Month[c] = ChildcareFee.Month__c;
        	YearMonth[c] = ChildcareFee.YearMonth__c;
	        DiapersCheck[c] = ChildcareFee.DiapersCheck__c;
    	    BusFareCheck[c] = ChildcareFee.BusFareCheck__c;
        	TeachingMaterialsCheck[c] = ChildcareFee.TeachingMaterialsCheck__c;
	        FeeCheck[c] = ChildcareFee.FeeCheck__c;
    	    ChangeFeeCheck[c] = ChildcareFee.ChangeFeeCheck__c;
        	GraduationAlbumCheck[c] = ChildcareFee.GraduationAlbumCheck__c;
	        ApplicationCategory[c] = ChildcareFee.ApplicationCategory__c;
        	OutsideFast[c] = '0'+ChildcareFee.OutsideFast__c;
        	Outside[c] = ChildcareFee.Outside__c;

	        School[c] = ChildcareFee.ImportantNotes__r.School__c;
    	    Age[c] = ChildcareFee.ImportantNotes__r.Age__c;
        	Belongs[c] = ChildcareFee.ImportantNotes__r.Belongs__c;
	        AnotherAffiliation[c] = ChildcareFee.ImportantNotes__r.AnotherAffiliation__c;
    	    EnjiNumber[c] = ChildcareFee.ImportantNotes__r.Number__c;
        	PassageRoute[c] = ChildcareFee.ImportantNotes__r.PassageRoute__c;
            
            // 完全給食
			SchoolLunchfree[c] = 0;
    	    if(ChildcareFee.SchoolLunchfree__c == TRUE)
				SchoolLunchfree[c] = 1;

            // 完全給食を設定
			SchoolLunch[c] = 0;
    	    if(ChildcareFee.ImportantNotes__r.SchoolLunch__c == TRUE)
				SchoolLunch[c] = 1;

            // 所属パターンを設定
	        if(Belongs[c] == Kindergarten){
				// １号認定：101
        	    if(AnotherAffiliation[c] == No1Certification)
            	    Belongs_AnotherAffiliation[c] = 101;
				// １号認定新２号：102
    	        if(AnotherAffiliation[c] == No1Certification2)
        	        Belongs_AnotherAffiliation[c] = 102;
				// １号認定新３号：103
	            if(AnotherAffiliation[c] == No1Certification3)
    	            Belongs_AnotherAffiliation[c] = 103;
				// １号認定（２歳児）：100
            	if(AnotherAffiliation[c] == No1CertificationY)
                	Belongs_AnotherAffiliation[c] = 100;
        	}
	        // 保育園部の短時間
    	    if(Belongs[c] == NurserySchool_Short){
				// 保育園部の短時間　　2号認定：202
            	if(AnotherAffiliation[c] == No2Certification)
                	Belongs_AnotherAffiliation[c] = 202;
				// 保育園部の短時間　　3号認定：203
    	        if(AnotherAffiliation[c] == No3Certification)
        	        Belongs_AnotherAffiliation[c] = 203;
        	}
	        // 保育園部の標準時間
    	    if(Belongs[c] == NurserySchool_Standrd){
				// 保育園部の標準時間　　2号認定：302
            	if(AnotherAffiliation[c] == No2Certification)
                	Belongs_AnotherAffiliation[c] = 302;
				// 保育園部の標準時間　　3号認定：303
    	        if(AnotherAffiliation[c] == No3Certification)
        	        Belongs_AnotherAffiliation[c] = 303;            
        	}

//System.debug('ChildcareFee　'+ChildcareFee);
//System.debug('Belongs_AnotherAffiliation　'+Belongs_AnotherAffiliation[c]);

	    	for(integer cm=0; ChargeMasterList.size()>cm; cm++){
    	        // ■PTA会費
        	    if(CM_ChargeCategory[cm] == PTAFee_STR){
            	    PTAFee[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
            	}
	            // ■特別教育費
    	        if(CM_ChargeCategory[cm]  == EducationCosts_STR){
        	        EducationCosts[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
            	}
	            // ■おむつ破棄代
    	        if(CM_ChargeCategory[cm]  == Diapers_STR){
        	        if(DiapersCheck[c] == TRUE)
	        	        Diapers[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	else
                    	Diapers[c] = null;
            	}
	            // ■区分変更手数料
    	        if(CM_ChargeCategory[cm] == ChangeFee_STR){
        	        if(ChangeFeeCheck[c] == TRUE)
	        	        ChangeFee[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	else
                    	ChangeFee[c] = null;
            	}
	            // ■手数料
    	        if(CM_ChargeCategory[cm] == Fee_STR){
        	        if(FeeCheck[c] == TRUE)
	        	        Fee[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	else
                    	Fee[c] = null;
            	}
	            // ■卒園アルバム費
    	        if(CM_ChargeCategory[cm]  == GraduationAlbum_STR){
        	        if(GraduationAlbumCheck[c] == TRUE)
	        	        GraduationAlbum[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	else
                    	GraduationAlbum[c] = null;
            	}

	            // ■主食費
    	        if(CM_ChargeCategory[cm] == StapleFoodCost_STR){
                    StapleFoodCost[c] = 0;
                    StapleFoodCost_Full[c] = 0;
					// 保育園部の標準時間
            	    if(Belongs_AnotherAffiliation[c] >= 300){
						if(Belongs[c] == NurserySchool_Standrd)
		            	    StapleFoodCost[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	}
					// 保育園部の短時間
    	            else if(Belongs_AnotherAffiliation[c] >= 200){
						if(Belongs[c] == NurserySchool_Short)
		    	            StapleFoodCost[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	}
					// 幼稚園部
    	            else if(Belongs_AnotherAffiliation[c] > 100){
						if(Belongs[c] == Kindergarten)
		    	            StapleFoodCost[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	}
	                // 完全給食
					if(Belongs[c] == null)
			            StapleFoodCost_Full[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
            	}

	            // ■副食費
    	        if(CM_ChargeCategory[cm] == SideDishCost_STR){
                    SideDishCost[c] = 0;
                    SideDishCost_Full[c] = 0;
					// 保育園部の標準時間
            	    if(Belongs_AnotherAffiliation[c] >= 300){
						if(Belongs[0] == NurserySchool_Standrd)
		            		SideDishCost[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	}
					// 保育園部の短時間
    	            else if(Belongs_AnotherAffiliation[c] >= 200){
						if(Belongs[c] == NurserySchool_Short)
		    	            SideDishCost[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	}
					// 幼稚園部
    	            else if(Belongs_AnotherAffiliation[c] > 100){
						if(Belongs[c] == Kindergarten)
		    	            SideDishCost[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
                	}
	                // 完全給食
					if(Belongs[c] == null)
			            SideDishCost_Full[c] = Integer.ValueOf(CM_MonthlyCharge[cm]);
            	}

            }

            // ---------------------------------------------------------------------------------------
			// 主食費および副食費の算出
			// １号認定（２歳児）は保育料に含まれているので算出しない
			// １号認定、１号認定新２号、１号認定新３号、２号認定は、完全給食がある
			// ３号認定は、３歳になった月から主食費のみ算出（副食費はない）
			// 副食費免除に✓がある場合は、免除額分マイナス
			// --------------------------------------------------------------------------------------
			// 幼稚園部　１号認定（２歳児）の場合、費用は０円（保育料に含まれている）
		    if(Belongs_AnotherAffiliation[c] == 100){
        		StapleFoodCost[c] = 0;
        		SideDishCost[c] = 0;
        	}else{
            	// ３号認定者の場合
	        	if(Belongs_AnotherAffiliation[c] == 203 || Belongs_AnotherAffiliation[c] == 303){
		       		SideDishCost[c] = 0;
System.debug('ContactId[c]　'+ContactId[c]);
System.debug('Age[c]　'+Age[c]);
System.debug('Integer.valueof((Integer.valueof((Age[c]).substring(0,2))))　'+Integer.valueof((Age[c]).substring(0,2)));
    	    		// 要録情報の年齢が3歳以上でない場合は0円
            		if(3 > Integer.valueof((Age[c]).substring(0,2)))
           				StapleFoodCost[c] = 0;
           		}
           		else{
	            	// 完全給食にチェックがある場合
    	    		if(SchoolLunch[c] == 1){
System.debug('StapleFoodCost[c]　'+StapleFoodCost[c]);
System.debug('StapleFoodCost_Full[c]　'+StapleFoodCost_Full[c]);
        				StapleFoodCost[c] = StapleFoodCost[c] + StapleFoodCost_Full[c];
        				SideDishCost[c] = SideDishCost[c] + SideDishCost_Full[c];
       				}

	            	// 副食費免除者にチェックがある場合、免除額分減算
    	        	if(SchoolLunchfree[c] == 1){
        	       		if(SideDishCost[c] < SideDishCost_Exemption)
	                		SideDishCost[c] = 0;
    	       			else
                			SideDishCost[c] = SideDishCost[c] - SideDishCost_Exemption;
           			}
           		}
       		}

        }


        // ------------------------------------------------------------------------
        // 保育時間マスタより該当月の保育終了時間を取得
		// ------------------------------------------------------------------------
        // 項目定義
        List<Date> ChildcareTimeMasterDate = new Date[31];
        List<String> ChildcareEndTime  = new String[31];

        // 園児日誌データを取得対象期間（先月）
		Date StartDate = date.newinstance(Integer.Valueof(Year[0]), Integer.Valueof(Month[0])-1, 1);
		Date EndDate = date.newinstance(Integer.Valueof(Year[0]), Integer.Valueof(Month[0]), 1)-1;
        // １月の場合は、昨年の１２月１日〜１２月３１日
        if(Integer.Valueof(Month[0]) == 1){
			StartDate = date.newinstance(Integer.Valueof(Year[0])-1, 12, 1);
			EndDate = date.newinstance(Integer.Valueof(Year[0]), Integer.Valueof(Month[0]), 1)-1;
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


		// ------------------------------------------------------------------------
        // 園児IDより園児日誌を取得
		// ------------------------------------------------------------------------
        List<ID> KD_ContactId = new ID[500];										// 園児ID
        List<Decimal> KD_Charge = new Decimal[500];							// 預かり保育料
        List<Decimal> KD_MonthlyApplication = new Decimal[500];		// 預かり保育料（日申込算出）
        List<Integer> KD_AttendanceStop = new Integer[500];				// 出席停止日数
        List<Integer> KD_LeaveEarly = new Integer[500];						// 早退日数
        List<Integer> KD_Lateness = new Integer[500];						// 遅刻日数
        List<Integer> KD_Attendance  = new Integer[500];				// 出席日数
        List<Integer> KD_Absence = new Integer[500];						// 欠席日数
		
        // 園児日誌データを検索
		List<KindergartenDiary__c> KindergartenDiaryList = [SELECT Id, Date__c, School__c, Contact__c,
                                                            													Charge__c, MonthlyApplication__c,
                                                            													AttendanceStop__c,
                                                            													LeaveEarly__c, Lateness__c,
																												AttendanceSchedule__c
                                                                                                		FROM KindergartenDiary__c
																										WHERE Date__c >= :StartDate
																										AND Date__c <= :EndDate
																										ORDER BY Contact__c ASC,Date__c DESC];
        // 園児日誌データ数分処理
        Integer enjicnt = 0;
    	for(integer i=0; KindergartenDiaryList.size()>i; i++){

            // 項目を取得
	        KindergartenDiary__c KindergartenDiary = KindergartenDiaryList.get(i);
//System.debug('KindergartenDiary　'+KindergartenDiary);

            // 園児IDを比較して違う場合は次の園児IDを設定
            if(KD_ContactId[enjicnt] != KindergartenDiary.Contact__c){
                if(i > 0){
	                // --------------------------------------------------------------------
    			    // 幼稚園部の場合かつ月申込かつ
        			// 登園日数が月の半分より小さい場合
        			// 日申込の金額で再算出する
        			// --------------------------------------------------------------------
	        		for(integer c=0; ChildcareFeeList.size()>c; c++){
                		if(KD_ContactId[enjicnt] == ContactId[c]){
        					if(Belongs_AnotherAffiliation[c] < 200 && ApplicationCategory[c] == '月申込'){
				            	if(KD_Attendance[enjicnt] < Weekdays/2){
	            					// 保育料(日申込算出)を保育料に設定
									KD_Charge[enjicnt] = KD_MonthlyApplication[enjicnt];
                				}
                            }
        				}
            		}
                    // 次の園児
	            	enjicnt = enjicnt + 1;
                }

                KD_ContactId[enjicnt] = KindergartenDiary.Contact__c;
                KD_Charge[enjicnt] = 0;
                KD_MonthlyApplication[enjicnt] = 0;
                KD_AttendanceStop[enjicnt] = 0;
                KD_LeaveEarly[enjicnt] = 0;
                KD_Lateness[enjicnt] = 0;
                KD_Attendance[enjicnt] = 0;
                KD_Absence[enjicnt] = 0;

            }

            // 保育料を算出
			KD_Charge[enjicnt] = KD_Charge[enjicnt] + KindergartenDiary.Charge__c;
            
            // 保育料(日申込算出)を算出
			KD_MonthlyApplication[enjicnt] = KD_MonthlyApplication[enjicnt] + KindergartenDiary.MonthlyApplication__c;
            
            // 出席をカウント
            if(KindergartenDiary.AttendanceSchedule__c == '出席')
                KD_Attendance[enjicnt] = KD_Attendance[enjicnt] +1;

            // 欠席をカウント
            // 出席停止の場合は欠席はカウントしない
            if(KindergartenDiary.AttendanceSchedule__c == '欠席'){
	            // 出席停止をカウント
                if(KindergartenDiary.AttendanceStop__c == TRUE)
        	        KD_AttendanceStop[enjicnt] = KD_AttendanceStop[enjicnt] +1;
                else
	                KD_Absence[enjicnt] = KD_Absence[enjicnt] +1;
            }

            // 早退をカウント
            if(KindergartenDiary.LeaveEarly__c == TRUE)
                KD_LeaveEarly[enjicnt] = KD_LeaveEarly[enjicnt] +1;

            // 遅刻をカウント
            if(KindergartenDiary.Lateness__c == TRUE)
                KD_Lateness[enjicnt] = KD_Lateness[enjicnt] +1;

        }


        // ------------------------------------------------------------------------
		// 算出結果を保育料に反映（データ更新）
		// ------------------------------------------------------------------------
	    // 保育料OBJ
		List<ChildcareFee__c > ChildcareFeeTMP = new List<ChildcareFee__c >();

		// 保育料データ分くり返す
	    for(integer c=0; ChildcareFeeList.size()>c; c++){
	    	for(integer i=0; KindergartenDiaryList.size()>i; i++){
            	if(KD_ContactId[i] == ContactId[c]){
			        // 保育料OBJを更新情報
        			ChildcareFeeTMP.add(new ChildcareFee__c(
            	       												Id = ChildcareFeeId[c],
                	   												PTAFee__c = PTAFee[c],
                   													EducationCosts__c = EducationCosts[c],
                   													Diapers__c = Diapers[c],
               										                ChangeFee__c = ChangeFee[c],
               										                Fee__c = Fee[c],
               										                GraduationAlbum__c = GraduationAlbum[c],
               										                StapleFoodCost__c = StapleFoodCost[c],
               										                SideDishCost__c = SideDishCost[c],
               										                MonthCustody__c = KD_Charge[i],
               										                AttendanceStopDays__c = KD_AttendanceStop[i],
               										                LeaveEarly__c = KD_LeaveEarly[i],
               										                Lateness__c = KD_Lateness[i],
               										                AttendanceDays__c = KD_Attendance[i],
               										                AbsenceDays__c = KD_Absence[i],
               										                ChildcareDays__c = KD_AttendanceStop[i]+KD_Attendance[i]+KD_Absence[i]
//               										                MonthlyCustody__c = MonthlyCustody[c],
//               										                DailyCustody__c = KD_MonthlyApplication[i]
        										)
        			);
                }
            }
        }

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