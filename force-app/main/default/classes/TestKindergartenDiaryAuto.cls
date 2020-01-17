@isTest
public class TestKindergartenDiaryAuto {


    // テスト
    @isTest static void test_TestKindergartenDiaryAuto(){
        // 現在のユーザIDを設定
        String USRID = UserInfo.getUserId();

        // 本日を設定
        Date TDY11 = Date.today();        
        String YEAR = String.ValueOf(TDY11.year());
        String MONTH = String.ValueOf(TDY11.month());
        Datetime SRTDT11 = Datetime.newInstance(TDY11.year(), TDY11.month(), TDY11.day(), 7, 11, 59);
        Datetime ENDDT11 = Datetime.newInstance(TDY11.year(), TDY11.month(), TDY11.day(), 18, 11, 59);
        Datetime SRTDT12 = Datetime.newInstance(TDY11.year(), TDY11.month(), TDY11.day(), 7, 21, 59);
        Datetime ENDDT12 = Datetime.newInstance(TDY11.year(), TDY11.month(), TDY11.day(), 17, 11, 59);
        Datetime SRTDT13 = Datetime.newInstance(TDY11.year(), TDY11.month(), TDY11.day(), 6, 21, 59);
        Datetime ENDDT13 = Datetime.newInstance(TDY11.year(), TDY11.month(), TDY11.day(), 19, 11, 59);
        // 本日+1を設定
        Date TDY21 = TDY11.addDays(+1);
        Datetime SRTDT21 = Datetime.newInstance(TDY21.year(), TDY21.month(), TDY21.day(), 7, 11, 59);
        Datetime ENDDT21 = Datetime.newInstance(TDY21.year(), TDY21.month(), TDY21.day(), 18, 11, 59);
        Datetime SRTDT22 = Datetime.newInstance(TDY21.year(), TDY21.month(), TDY21.day(), 7, 21, 59);
        Datetime ENDDT22 = Datetime.newInstance(TDY21.year(), TDY21.month(), TDY21.day(), 17, 11, 59);
        // 本日-1を設定
        Date TDY31 = TDY11.addDays(-1);
        Datetime SRTDT31 = Datetime.newInstance(TDY31.year(), TDY31.month(), TDY31.day(), 7, 11, 59);
        Datetime ENDDT31 = Datetime.newInstance(TDY31.year(), TDY31.month(), TDY31.day(), 18, 11, 59);
        Datetime SRTDT32 = Datetime.newInstance(TDY31.year(), TDY31.month(), TDY31.day(), 7, 41, 59);
        Datetime ENDDT32 = Datetime.newInstance(TDY31.year(), TDY31.month(), TDY31.day(), 17, 11, 59);

        
        // テストデータ作成        
        // 料金マスタのテストデータを作成する
        ChargeMaster__c CM1 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='幼稚園部',
            AnotherAffiliation__c='１号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='朝の預かり保育',
            CustodyType__c='通常預かり',
            CustodyStart__c='7:00',
            CustodyEnd__c='7:29',
            DailyCharge__c=150,
            MonthlyCharge__c=100
        );
        insert CM1;
        ChargeMaster__c CM2 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='幼稚園部',
            AnotherAffiliation__c='１号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='預かり保育',
            CustodyType__c='通常預かり',
            CustodyStart__c='保育終了',
            CustodyEnd__c='19:00',
            DailyCharge__c=600,
            MonthlyCharge__c=500
        );
        insert CM2;

        // 保育時間マスタのテストデータを作成する
        ChildcareTimeMaster__c CTM1 = new ChildcareTimeMaster__c(
            Date__c=TDY11,
            ChildcareEndTime__c ='13:30',
            School__c='北広島わかば'
        );
        insert CTM1;
        ChildcareTimeMaster__c CTM2 = new ChildcareTimeMaster__c(
            Date__c=TDY21,
            ChildcareEndTime__c ='土曜日預かり',
            School__c='北広島わかば'
        );
        insert CTM2;
        ChildcareTimeMaster__c CTM3 = new ChildcareTimeMaster__c(
            Date__c=TDY31,
            ChildcareEndTime__c ='長期休み預かり',
            School__c='北広島わかば'
        );
        insert CTM3;

        // 職員名簿のテストデータを作成する
        Staff__c staff1 = new Staff__c(
            Name='テスト職員1',
            WorkDivision__c ='正職員',
            School__c='北広島わかば'
        );
        insert staff1;
        Staff__c STFID1 = staff1;

         // 保護者のテストデータを作成する
        Account act1 = new Account(
                    Name='テスト保護者',
                    RelationshipWithChildren1__c='父',
                    School__c='北広島わかば'
        );
        insert act1;
        Account ACTID1 = act1;

        // 園児のテストデータを作成する
        Date BTD = Date.newInstance(2014, 1, 29);
        Date ETD = Date.newInstance(2017, 4, 3);
        Contact cnt1 = new Contact(
                    FirstName='園児男子1',
                    LastName='テスト',
                    Sex__c='男子',
                    kana__c='てすと えんじだんし',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID1.Id
        );
        insert cnt1;
        ID  CNTID1 = cnt1.Id;

        Contact cnt2 = new Contact(
                    FirstName='園児男子2',
                    LastName='テスト',
                    Sex__c='男子',
                    kana__c='てすと えんじだんし',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID1.Id
        );
        insert cnt2;
        ID  CNTID2 = cnt2.Id;

        Contact cnt3 = new Contact(
                    FirstName='園児男子3',
                    LastName='テスト',
                    Sex__c='男子',
                    kana__c='てすと えんじだんし',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID1.Id
        );
        insert cnt3;
        ID  CNTID3 = cnt3.Id;

        // 要録情報のテストデータを作成する
        ImportantNotes__c itn1 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID1,
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '101',
                    BusDisplayOrder__c = '101',
                    School__c='北広島わかば',
                    Belongs__c='幼稚園部',
                    AnotherAffiliation__c='1号認定新2号',
            		SchoolLunch__c=TRUE
        );
        insert itn1;
        ID  ITNID1 = itn1.Id;

        ImportantNotes__c itn2 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID2,
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '101',
                    BusDisplayOrder__c = '101',
                    School__c='北広島わかば',
                    Belongs__c='幼稚園部',
                    AnotherAffiliation__c='1号認定',
            		SchoolLunch__c=TRUE
        );
        insert itn2;
        ID  ITNID2 = itn2.Id;

        ImportantNotes__c itn3 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID3,
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '101',
                    BusDisplayOrder__c = '101',
                    School__c='北広島わかば',
                    Belongs__c='保育園部の短時間',
                    AnotherAffiliation__c='3号認定',
            		SchoolLunch__c=TRUE
        );
        insert itn3;
        ID  ITNID3 = itn3.Id;

        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        Long startTime = DateTime.now().getTime();
        Long finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }
        
        // 保育料のテストデータを作成する
        ChildcareFee__c ccf1= [SELECT Id FROM ChildcareFee__c WHERE ImportantNotes__c = :ITNID1 AND Year__c = :YEAR AND Month__c = :MONTH];
        ChildcareFee__c cf1 = new ChildcareFee__c(
            		ID = ccf1.Id,
                    Year__c =YEAR,
                    Month__c =MONTH,
                    ImportantNotes__c=ITNID1,
					DiapersCheck__c=TRUE,
            		ChangeFeeCheck__c=TRUE,
            		FeeCheck__c=TRUE,
            		ApplicationCategory__c='月申込',
            		OutsideFast__c ='7:00',
            		Outside__c ='19:00',
                    Contact__c=CNTID1,
	    			AttendanceDays__c = 0,
					AttendanceStopDays__c = 0,
					AbsenceDays__c = 0,
					LeaveEarly__c = 0,
					Lateness__c = 0,
            		SchoolLunchfree__c=TRUE
        );
        update cf1;
        ID  CFID1 = cf1.Id;

        ChildcareFee__c ccf2= [SELECT Id FROM ChildcareFee__c WHERE ImportantNotes__c = :ITNID2 AND Year__c = :YEAR AND Month__c = :MONTH];
        ChildcareFee__c cf2 = new ChildcareFee__c(
            		ID = ccf2.Id,
                    Year__c =YEAR,
                    Month__c =MONTH,
                    ImportantNotes__c=ITNID2,
					DiapersCheck__c=TRUE,
            		ChangeFeeCheck__c=TRUE,
            		FeeCheck__c=TRUE,
            		ApplicationCategory__c='日申込',
            		OutsideFast__c ='',
            		Outside__c ='',
                    Contact__c=CNTID2,
	    			AttendanceDays__c = 0,
					AttendanceStopDays__c = 0,
					AbsenceDays__c = 0,
					LeaveEarly__c = 0,
					Lateness__c = 0,
            		SchoolLunchfree__c=TRUE
        );
        update cf2;
        ID  CFID2 = cf2.Id;

        ChildcareFee__c ccf3= [SELECT Id FROM ChildcareFee__c WHERE ImportantNotes__c = :ITNID3 AND Year__c = :YEAR AND Month__c = :MONTH];
        ChildcareFee__c cf3 = new ChildcareFee__c(
            		ID = ccf3.Id,
                    Year__c =YEAR,
                    Month__c =MONTH,
                    ImportantNotes__c=ITNID3,
					DiapersCheck__c=TRUE,
            		ChangeFeeCheck__c=TRUE,
            		FeeCheck__c=TRUE,
            		ApplicationCategory__c='日申込',
            		OutsideFast__c ='',
            		Outside__c ='',
                    Contact__c=CNTID3,
	    			AttendanceDays__c = 0,
					AttendanceStopDays__c = 0,
					AbsenceDays__c = 0,
					LeaveEarly__c = 0,
					Lateness__c = 0,
            		SchoolLunchfree__c=TRUE
        );
        update cf3;
        ID  CFID3 = cf3.Id;

        // 園児日誌のテストデータを作成する
        KindergartenDiary__c kgd11 = new KindergartenDiary__c(
                    Contact__c = CNTID1,
                    Date__c = TDY11,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=SRTDT11,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=ENDDT11,
					LeaveEarly__c=TRUE,
					Lateness__c=TRUE,
            		ImportantNotes__c=ITNID1,
            		StaffId__c = STFID1.Id
        );
        insert kgd11;
        ID KGDID11 = kgd11.Id;

        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        startTime = DateTime.now().getTime();
        finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }
        
        KindergartenDiary__c kgd12 = new KindergartenDiary__c(
            		ID = KGDID11,
                    Contact__c = CNTID1,
                    Date__c = TDY11,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=SRTDT12,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=ENDDT12,
					LeaveEarly__c=TRUE,
					Lateness__c=TRUE,
            		ImportantNotes__c=ITNID1,
            		StaffId__c = STFID1.Id
        );
        update kgd12;
        ID KGDID12 = kgd12.Id;

        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        startTime = DateTime.now().getTime();
        finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }
        
        KindergartenDiary__c kgd13 = new KindergartenDiary__c(
            		ID = KGDID11,
                    Contact__c = CNTID1,
                    Date__c = TDY11,
                    AttendanceSchedule__c = '欠席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=SRTDT12,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=ENDDT12,
					LeaveEarly__c=TRUE,
					Lateness__c=TRUE,
            		AbsenceReason__c='出席停止',
            		AttendanceStopReason__c='インフルエンザ',
            		ImportantNotes__c=ITNID1,
            		StaffId__c = STFID1.Id
        );
        update kgd13;
        ID KGDID13 = kgd13.Id;


        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        startTime = DateTime.now().getTime();
        finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }
        
        KindergartenDiary__c kgd14 = new KindergartenDiary__c(
            		ID = KGDID11,
                    Contact__c = CNTID1,
                    Date__c = TDY11,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=SRTDT13,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=ENDDT13,
					LeaveEarly__c=TRUE,
					Lateness__c=TRUE,
            		AbsenceReason__c='出席停止',
            		AttendanceStopReason__c='インフルエンザ',
            		ImportantNotes__c=ITNID1,
            		StaffId__c = STFID1.Id
        );
        update kgd14;
        ID KGDID14 = kgd14.Id;

        KindergartenDiary__c kgd21 = new KindergartenDiary__c(
                    Contact__c = CNTID2,
                    Date__c = TDY21,
                    AttendanceSchedule__c = '欠席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=SRTDT21,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=ENDDT21,
					LeaveEarly__c=TRUE,
					Lateness__c=TRUE,
            		AbsenceReason__c='出席停止',
            		AttendanceStopReason__c='インフルエンザ',
            		ImportantNotes__c=ITNID2,
            		StaffId__c = STFID1.Id
        );
        insert kgd21;
        ID KGDID21 = kgd21.Id;

        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        startTime = DateTime.now().getTime();
        finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }
        
        KindergartenDiary__c kgd22 = new KindergartenDiary__c(
            		ID = KGDID21,
                    Contact__c = CNTID2,
                    Date__c = TDY21,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=SRTDT22,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=ENDDT22,
					LeaveEarly__c=TRUE,
					Lateness__c=TRUE,
            		ImportantNotes__c=ITNID2,
            		StaffId__c = STFID1.Id
        );
        update kgd22;
        ID KGDID22 = kgd22.Id;


        KindergartenDiary__c kgd31 = new KindergartenDiary__c(
                    Contact__c = CNTID3,
                    Date__c = TDY31,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=SRTDT31,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=ENDDT31,
					LeaveEarly__c=TRUE,
					Lateness__c=TRUE,
            		ImportantNotes__c=ITNID3,
            		StaffId__c = STFID1.Id
        );
        insert kgd31;
        ID KGDID31 = kgd31.Id;

        // 園児日誌データを取得
        KindergartenDiary__c kgddel = [SELECT Id FROM KindergartenDiary__c WHERE Id = :KGDID11];
        
        // テスト開始
        Test.startTest();

        delete(kgddel);

        // テスト終了
        Test.stopTest();
        
    }

}