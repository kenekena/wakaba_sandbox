@isTest
public class TestKindergartenDiaryAuto_BK {

    @isTest static void test_KindergartenDiaryAuto() {
        
        Date TDY = date.today();
        String YEAR = String.ValueOf(TDY.year());
//        String MONTH = String.ValueOf(TDY.month()+1);
        String MONTH = String.ValueOf(TDY.month());
        Date TDY1_3 = Date.newInstance(TDY.year(), 1, TDY.day());
        Datetime StrDate = Datetime.newInstance(TDY.year(), TDY.month(), TDY.day(), 7, 11, 59);
        Datetime EndDate = Datetime.newInstance(TDY.year(), TDY.month(), TDY.day(), 18, 11, 59);
        Datetime StrDate2 = Datetime.newInstance(TDY.year(), TDY.month(), TDY.day(), 6, 11, 59);
        Datetime EndDate2 = Datetime.newInstance(TDY.year(), TDY.month(), TDY.day(), 19, 11, 59);

        // 保育時間マスタのテストデータを作成する
        ChildcareTimeMaster__c CTM1 = new ChildcareTimeMaster__c(
            Date__c=TDY,
            ChildcareEndTime__c ='11:30',
            School__c='北広島わかば'
        );
        insert CTM1;
        ChildcareTimeMaster__c CTM2 = new ChildcareTimeMaster__c(
            Date__c=TDY+1,
            ChildcareEndTime__c ='土曜日預かり',
            School__c='北広島わかば'
        );
        insert CTM2;
        ChildcareTimeMaster__c CTM3 = new ChildcareTimeMaster__c(
            Date__c=TDY+2,
            ChildcareEndTime__c ='長期休み預かり',
            School__c='北広島わかば'
        );
        insert CTM3;
        ChildcareTimeMaster__c CTM4 = new ChildcareTimeMaster__c(
            Date__c=TDY1_3,
            ChildcareEndTime__c ='13:30',
            School__c='北広島わかば'
        );
        insert CTM4;
        
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
        ChargeMaster__c CM3 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='保育園部の短時間',
            AnotherAffiliation__c='２号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='朝の預かり保育',
            CustodyType__c='',
            CustodyStart__c='7:00',
            CustodyEnd__c='7:29',
            DailyCharge__c=200,
            MonthlyCharge__c=200
        );
        insert CM3;
        ChargeMaster__c CM4 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='保育園部の短時間',
            AnotherAffiliation__c='２号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='預かり保育',
            CustodyType__c='',
            CustodyStart__c='18:31',
            CustodyEnd__c='19:00',
            DailyCharge__c=200,
            MonthlyCharge__c=200
        );
        insert CM4;
        ChargeMaster__c CM5 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='保育園部の標準時間',
            AnotherAffiliation__c='3号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='預かり保育',
            CustodyType__c='',
            CustodyStart__c='18:31',
            CustodyEnd__c='19:00',
            DailyCharge__c=200,
            MonthlyCharge__c=200
        );
        insert CM5;
        ChargeMaster__c CM6 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='保育園部の標準時間',
            AnotherAffiliation__c='3号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='朝の預かり保育',
            CustodyType__c='',
            CustodyStart__c='7:00',
            CustodyEnd__c='7:29',
            DailyCharge__c=200,
            MonthlyCharge__c=200
        );
        insert CM6;
        ChargeMaster__c CM7 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='幼稚園部',
            AnotherAffiliation__c='１号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='朝の預かり保育',
            CustodyType__c='土曜日預かり',
            CustodyStart__c='7:00',
            CustodyEnd__c='８:29',
            DailyCharge__c=150,
            MonthlyCharge__c=100
        );
        insert CM7;
        ChargeMaster__c CM8 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='幼稚園部',
            AnotherAffiliation__c='１号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='預かり保育',
            CustodyType__c='土曜日預かり',
            CustodyStart__c='8:3０',
            CustodyEnd__c='19:00',
            DailyCharge__c=600,
            MonthlyCharge__c=500
        );
        insert CM8;
        ChargeMaster__c CM9 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='幼稚園部',
            AnotherAffiliation__c='１号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='朝の預かり保育',
            CustodyType__c='長期休み預かり',
            CustodyStart__c='7:00',
            CustodyEnd__c='８:29',
            DailyCharge__c=150,
            MonthlyCharge__c=100
        );
        insert CM9;
        ChargeMaster__c CM10 = new ChargeMaster__c(
            Name='料金マスタ',
            School__c='北広島わかば',
            Belongs__c='幼稚園部',
            AnotherAffiliation__c='１号認定',
            ChargeCategory__c='預かり保育料',
            CustodyDivision__c ='預かり保育',
            CustodyType__c='長期休み預かり',
            CustodyStart__c='8:3０',
            CustodyEnd__c='19:00',
            DailyCharge__c=600,
            MonthlyCharge__c=500
        );
        insert CM10;
//        ChargeMaster__c CM11 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='PTA会費',
//            MonthlyCharge__c=500
//        );
//        insert CM11;
//        ChargeMaster__c CM12 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='特別教育費',
//            MonthlyCharge__c=3500
//        );
//        insert CM12;
//        ChargeMaster__c CM13 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='おむつ破棄代',
//            MonthlyCharge__c=1500
//        );
//        insert CM13;
//        ChargeMaster__c CM14 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='手数料',
//            MonthlyCharge__c=300
//        );
//        insert CM14;
//        ChargeMaster__c CM15 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='区分変更手数料',
//            MonthlyCharge__c=1500
//        );
//        insert CM15;
//        ChargeMaster__c CM21 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='主食費',
//            MonthlyCharge__c=500
//        );
//        insert CM21;
//        ChargeMaster__c CM22 = new ChargeMaster__c(
//           Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='主食費',
//            Belongs__c='幼稚園部',
//            AnotherAffiliation__c='１号認定',
//           MonthlyCharge__c=900
//        );
//        insert CM22;
//        ChargeMaster__c CM23 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='主食費',
//            Belongs__c='保育園部の短時間',
//            AnotherAffiliation__c='2号認定',
//            MonthlyCharge__c=1500
//        );
//        insert CM23;
//        ChargeMaster__c CM24 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='主食費',
//            Belongs__c='保育園部の標準時間',
//            AnotherAffiliation__c='2号認定',
//            MonthlyCharge__c=1500
//        );
//        insert CM24;
//        ChargeMaster__c CM25 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='副食費',
//            MonthlyCharge__c=1500
//        );
//        insert CM25;
//        ChargeMaster__c CM26 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='副食費',
//            Belongs__c='幼稚園部',
//            AnotherAffiliation__c='１号認定',
//            MonthlyCharge__c=2600
//        );
//        insert CM26;
//        ChargeMaster__c CM27 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='副食費',
//            Belongs__c='保育園部の短時間',
//            AnotherAffiliation__c='2号認定',
//            MonthlyCharge__c=4500
//        );
//        insert CM27;
//        ChargeMaster__c CM28 = new ChargeMaster__c(
//            Name='料金マスタ',
//            School__c='北広島わかば',
//            ChargeCategory__c='副食費',
//            Belongs__c='保育園部の標準時間',
//            AnotherAffiliation__c='2号認定',
//            MonthlyCharge__c=4500
//        );
//        insert CM28;

        // 職員名簿のテストデータを作成する
        Staff__c staff1 = new Staff__c(
            Name='テスト職員A',
            WorkDivision__c ='正職員',
            School__c='北広島わかば'
        );
        insert staff1;
        Staff__c STFID = staff1;
        
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
                    FirstName='園児男子',
                    LastName='テスト',
                    Sex__c='男子',
                    kana__c='てすと えんじだんし',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID1.Id
        );
        insert cnt1;
        Contact CNTID1 = cnt1;
        // 園児のテストデータを作成する
        Contact cnt2 = new Contact(
                    FirstName='園児男子２',
                    LastName='テスト',
                    Sex__c='男子',
                    kana__c='てすと えんじだんしに',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID1.Id
        );
        insert cnt2;
        Contact CNTID2 = cnt2;
        // 園児のテストデータを作成する
        Contact cnt3 = new Contact(
                    FirstName='園児女子',
                    LastName='テスト',
                    Sex__c='女子',
                    kana__c='てすと えんじじょし',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID1.Id
        );
        insert cnt3;
        Contact CNTID3 = cnt3;

        // 要録情報のテストデータを作成する
        ImportantNotes__c itn1 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID1.Id,
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '101',
                    BusDisplayOrder__c = '101',
                    School__c='北広島わかば',
                    Belongs__c='幼稚園部',
                    AnotherAffiliation__c='1号認定新2号',
            		SchoolLunch__c=TRUE
//            		SchoolLunchfree__c=TRUE
        );
        insert itn1;
        ImportantNotes__c ITNID1 = itn1;
        // 要録情報のテストデータを作成する
        ImportantNotes__c itn2 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID2.Id,
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '102',
                    BusDisplayOrder__c = '102',
                    School__c='北広島わかば',
                    Belongs__c='保育園部の短時間',
                    AnotherAffiliation__c='2号認定',
            		SchoolLunch__c=TRUE
//            		SchoolLunchfree__c=TRUE
        );
        insert itn2;
        ImportantNotes__c ITNID2 = itn2;
        // 要録情報のテストデータを作成する
        ImportantNotes__c itn3 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID3.Id,
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '103',
                    BusDisplayOrder__c = '103',
                    School__c='北広島わかば',
                    Belongs__c='保育園部の標準時間',
                    AnotherAffiliation__c='3号認定',
            		SchoolLunch__c=TRUE
//            		SchoolLunchfree__c=TRUE
        );
        insert itn3;
        ImportantNotes__c ITNID3 = itn3;

        // 保育料のテストデータを作成する
        ChildcareFee__c cf1 = new ChildcareFee__c(
                    Year__c =YEAR,
                    Month__c =MONTH,
                    ImportantNotes__c=ITNID1.Id,
					DiapersCheck__c=TRUE,
//            		BusFareCheck__c=TRUE,
//            		TeachingMaterialsCheck__c=TRUE,
            		ChangeFeeCheck__c=TRUE,
            		FeeCheck__c=TRUE,
            		ApplicationCategory__c='月申込',
            		OutsideFast__c ='7:30',
            		Outside__c ='18:30',
                    Contact__c=CNTID1.Id,
            		SchoolLunchfree__c=TRUE
        );
        insert cf1;
        ChildcareFee__c CFID1 = cf1;
        // 保育料のテストデータを作成する
        ChildcareFee__c cf2 = new ChildcareFee__c(
                    Year__c =YEAR,
                    Month__c =MONTH,
                    ImportantNotes__c=ITNID2.Id,
            		ApplicationCategory__c='日申込',
                    Contact__c=CNTID2.Id,
            		SchoolLunchfree__c=TRUE
        );
        insert cf2;
        ChildcareFee__c CFID2 = cf2;
        // 保育料のテストデータを作成する
        ChildcareFee__c cf3 = new ChildcareFee__c(
                    Year__c =YEAR,
                    Month__c =MONTH,
                    ImportantNotes__c=ITNID3.Id,
            		ApplicationCategory__c='日申込',
                    Contact__c=CNTID3.Id,
            		SchoolLunchfree__c=TRUE
        );
        insert cf3;
        ChildcareFee__c CFID3 = cf3;

        // 園児日誌のテストデータを作成する
        KindergartenDiary__c kgd11 = new KindergartenDiary__c(
                    Contact__c = CNTID1.Id,
                    Date__c = TDY,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=StrDate,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=EndDate,
                    StaffId__c = STFID.Id
        );
        insert kgd11;
        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        Long startTime = DateTime.now().getTime();
        Long finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }

        KindergartenDiary__c kgdup11 = new KindergartenDiary__c(
            		Id = kgd11.id,
            		attendingSchoolTime__c=StrDate2,
            		GoingBackTime__c=EndDate2
        );
        update kgdup11;
        KindergartenDiary__c kgd12 = new KindergartenDiary__c(
                    Contact__c = CNTID1.Id,
                    Date__c = TDY+1,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=StrDate2,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=EndDate2,
                    StaffId__c = STFID.Id
        );
        insert kgd12;
        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        startTime = DateTime.now().getTime();
        finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }

        KindergartenDiary__c kgdup12 = new KindergartenDiary__c(
            		Id = kgd12.id,
            		attendingSchoolTime__c=StrDate,
            		GoingBackTime__c=EndDate
        );
        update kgdup12;
        // 園児日誌のテストデータを作成する
        KindergartenDiary__c kgd21 = new KindergartenDiary__c(
                    Contact__c = CNTID2.Id,
                    Date__c = TDY+2,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=StrDate,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=EndDate,
                    StaffId__c = STFID.Id
        );
        insert kgd21;
        KindergartenDiary__c kgd22 = new KindergartenDiary__c(
                    Contact__c = CNTID2.Id,
                    Date__c = TDY+3,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=StrDate2,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=EndDate2,
                    StaffId__c = STFID.Id
        );
        insert kgd22;
        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        startTime = DateTime.now().getTime();
        finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }

        KindergartenDiary__c kgdup22 = new KindergartenDiary__c(
            		Id = kgd22.id,
            		attendingSchoolTime__c=StrDate,
            		GoingBackTime__c=EndDate
        );
        update kgdup22;
        // 園児日誌のテストデータを作成する
        KindergartenDiary__c kgd31 = new KindergartenDiary__c(
                    Contact__c = CNTID3.Id,
                    Date__c = TDY+4,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=StrDate,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=EndDate,
                    StaffId__c = STFID.Id
        );
        insert kgd31;
        KindergartenDiary__c kgd32 = new KindergartenDiary__c(
                    Contact__c = CNTID3.Id,
                    Date__c = TDY+5,
                    AttendanceSchedule__c = '出席',
            		AttendingSchool__c=TRUE,
            		attendingSchoolTime__c=StrDate2,
            		GoingBack__c=TRUE,
            		GoingBackTime__c=EndDate2,
                    StaffId__c = STFID.Id
        );
        insert kgd32;
        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        startTime = DateTime.now().getTime();
        finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }

        KindergartenDiary__c kgdup32 = new KindergartenDiary__c(
            		Id = kgd32.id,
            		attendingSchoolTime__c=StrDate,
            		GoingBackTime__c=EndDate
        );
        update kgdup32;
        delete(kgd32);

        
        // テスト開始        
        Test.startTest();

        Database.SaveResult result11 = Database.insert(kgd11, false); 
        Database.SaveResult result12 = Database.insert(kgd12, false); 
        Database.SaveResult result21 = Database.insert(kgd21, false); 
        Database.SaveResult result22 = Database.insert(kgd22, false); 
        Database.SaveResult result31 = Database.insert(kgd31, false); 
        Database.SaveResult result32 = Database.insert(kgd32, false); 

        Test.stopTest();

    }


}