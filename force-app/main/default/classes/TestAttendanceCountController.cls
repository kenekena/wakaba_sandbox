@isTest
public class TestAttendanceCountController {
    
    @isTest static void test_AttendanceCount() {
        
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
        Account ACTID = act1;

        // 園児のテストデータを作成する
        Date BTD = Date.newInstance(2014, 1, 29);
        Date ETD = Date.newInstance(2017, 4, 3);
        Contact cnt1 = new Contact(
                    FirstName='園児男子1',
                    LastName='テスト1',
                    Sex__c='男子',
                    kana__c='てすと えんじだんし',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID.Id
        );
        insert cnt1;
        Contact CNTID1 = cnt1;

        Contact cnt2 = new Contact(
                    FirstName='園児男子2',
                    LastName='テスト2',
                    Sex__c='男子',
                    kana__c='てすと えんじだんし',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID.Id
        );
        insert cnt2;
        Contact CNTID2 = cnt2;

        Contact cnt3 = new Contact(
                    FirstName='園児男子3',
                    LastName='テスト3',
                    Sex__c='男子',
                    kana__c='てすと えんじだんし',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID.Id
        );
        insert cnt3;
        Contact CNTID3 = cnt3;


        Date TDY = date.today();
        String YEAR = String.ValueOf(TDY.year());
        String MONTH = String.ValueOf(TDY.month());

        // 要録情報のテストデータを作成する
        ImportantNotes__c itn1 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID1.Id,
                    Belongs__c = '幼稚園部',
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '101',
                    BusDisplayOrder__c = '101',
                    School__c='北広島わかば'
        );
        insert itn1;
        ImportantNotes__c ITNID1 = itn1;

        ImportantNotes__c itn2 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID2.Id,
                    Belongs__c = '保育園部の標準時間',
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '102',
                    BusDisplayOrder__c = '102',
                    School__c='北広島わかば'
        );
        insert itn2;
        ImportantNotes__c ITNID2 = itn2;

        ImportantNotes__c itn3 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID3.Id,
                    Belongs__c = '保育園部の短時間',
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '10３',
                    BusDisplayOrder__c = '10３',
                    School__c='北広島わかば'
        );
        insert itn3;
        ImportantNotes__c ITNID3 = itn3;


        // 保育料のテストデータを作成する
        ChildcareFee__c ccf1 = new ChildcareFee__c(
                    Year__c = YEAR,
                    Month__c = MONTH,
                    Contact__c=CNTID1.Id
        );
        insert ccf1;
        ChildcareFee__c CCFID1 = ccf1;

        ChildcareFee__c ccf2 = new ChildcareFee__c(
                    Year__c = YEAR,
                    Month__c = MONTH,
                    Contact__c=CNTID2.Id
        );
        insert ccf2;
        ChildcareFee__c CCFID2 = ccf2;

        ChildcareFee__c ccf3 = new ChildcareFee__c(
                    Year__c = YEAR,
                    Month__c = MONTH,
                    Contact__c=CNTID3.Id
        );
        insert ccf3;
        ChildcareFee__c CCFID3 = ccf3;



        // 園児日誌のテストデータを作成する
        KindergartenDiary__c kgd1 = new KindergartenDiary__c(
                    Contact__c = CNTID1.Id,
                    Date__c = TDY,
                    AttendanceSchedule__c = '欠席',
                    Belongs__c = '幼稚園部',
                    ImportantNotes__c = ITNID1.Id,
                    AttendanceStopReason__c = 'インフルエンザ',
                    Lateness__c = False,
                    LeaveEarly__c = False,
                    StaffId__c = STFID.Id
        );
        insert kgd1;
        KindergartenDiary__c KGDID1 = kgd1;

        KindergartenDiary__c kgd2 = new KindergartenDiary__c(
                    Contact__c = CNTID1.Id,
                    Date__c = TDY+1,
                    AttendanceSchedule__c = '出席',
                    Belongs__c = '幼稚園部',
                    ImportantNotes__c = ITNID1.Id,
                    AttendanceStopReason__c = '',
                    Lateness__c = True,
                    LeaveEarly__c = True,
                    StaffId__c = STFID.Id
        );
        insert kgd2;
        KindergartenDiary__c KGDID2 = kgd2;

        KindergartenDiary__c kgd3 = new KindergartenDiary__c(
                    Contact__c = CNTID2.Id,
                    Date__c = TDY+2,
                    AttendanceSchedule__c = '出席',
                    Belongs__c = '保育園部の標準時間',
                    ImportantNotes__c = ITNID2.Id,
                    AttendanceStopReason__c = '',
                    Lateness__c = True,
                    LeaveEarly__c = True,
                    StaffId__c = STFID.Id
        );
        insert kgd3;
        KindergartenDiary__c KGDID3 = kgd3;

        KindergartenDiary__c kgd4 = new KindergartenDiary__c(
                    Contact__c = CNTID3.Id,
                    Date__c = TDY+3,
                    AttendanceSchedule__c = '出席',
                    Belongs__c = '保育園部の短時間',
                    ImportantNotes__c = ITNID3.Id,
                    AttendanceStopReason__c = '',
                    Lateness__c = True,
                    LeaveEarly__c = True,
                    StaffId__c = STFID.Id
        );
        insert kgd4;
        KindergartenDiary__c KGDID4 = kgd4;

        KindergartenDiary__c kgd5 = new KindergartenDiary__c(
                    Contact__c = CNTID1.Id,
                    Date__c = TDY+4,
                    AttendanceSchedule__c = '出席',
                    Belongs__c = NULL,
                    ImportantNotes__c = ITNID1.Id,
                    AttendanceStopReason__c = '',
                    Lateness__c = True,
                    LeaveEarly__c = True,
                    StaffId__c = STFID.Id
        );
        insert kgd5;
        KindergartenDiary__c KGDID5 = kgd5;

        KindergartenDiary__c kgd6 = new KindergartenDiary__c(
                    Contact__c = CNTID2.Id,
                    Date__c = TDY+5,
                    Belongs__c = NULL,
                    ImportantNotes__c = ITNID2.Id,
                    AttendanceSchedule__c = '出席',
                    AttendanceStopReason__c = '',
                    Lateness__c = True,
                    LeaveEarly__c = True,
                    StaffId__c = STFID.Id
        );
        insert kgd6;
        KindergartenDiary__c KGDID6 = kgd6;

        KindergartenDiary__c kgd7 = new KindergartenDiary__c(
                    Contact__c = CNTID3.Id,
                    Date__c = TDY+6,
                    Belongs__c = NULL,
                    ImportantNotes__c = ITNID3.Id,
                    AttendanceSchedule__c = '出席',
                    AttendanceStopReason__c = '',
                    Lateness__c = True,
                    LeaveEarly__c = True,
                    StaffId__c = STFID.Id
        );
        insert kgd7;
        KindergartenDiary__c KGDID7 = kgd7;

        KindergartenDiary__c kgd8 = new KindergartenDiary__c(
                    Contact__c = CNTID1.Id,
                    Date__c = TDY+7,
                    Belongs__c = NULL,
                    ImportantNotes__c = ITNID1.Id,
                    AttendanceSchedule__c = '出席',
                    AttendanceStopReason__c = '',
                    Lateness__c = True,
                    LeaveEarly__c = True,
                    StaffId__c = STFID.Id
        );
        insert kgd8;
        KindergartenDiary__c kgd9 = new KindergartenDiary__c(
                    Id = kgd8.Id,
                    Belongs__c = NULL
        );
        update kgd9;

        KindergartenDiary__c kgd10 = new KindergartenDiary__c(
                    Contact__c = CNTID2.Id,
                    Date__c = TDY+8,
                    Belongs__c = NULL,
                    ImportantNotes__c = ITNID3.Id,
                    AttendanceSchedule__c = '出席',
                    AttendanceStopReason__c = '',
                    Lateness__c = True,
                    LeaveEarly__c = True,
                    StaffId__c = STFID.Id
        );
        insert kgd10;
        KindergartenDiary__c kgd11 = new KindergartenDiary__c(
                    Id = kgd10.Id,
                    Belongs__c = NULL
        );
        update kgd11;


        // テスト開始        
        Test.startTest();

        String result = '';
        result = AttendanceCountController.AttendanceCounting( ITNID1.Id );
        result = AttendanceCountController.AttendanceCounting( ITNID2.Id );
        result = AttendanceCountController.AttendanceCounting( ITNID3.Id );

        Test.stopTest();



    }
}