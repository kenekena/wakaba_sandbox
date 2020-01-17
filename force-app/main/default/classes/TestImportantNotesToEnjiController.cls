@isTest
public with sharing class TestImportantNotesToEnjiController {

    @isTest static void test_ImportantNotes() {
        
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
                    FirstName='園児男子',
                    LastName='テスト',
                    Sex__c='男子',
                    kana__c='てすと えんじだんし',
                    Birthdate=BTD,
                    EntryDate__c=ETD,
                    AccountId=ACTID.Id
        );
        insert cnt1;
        Contact CNTID = cnt1;

        Date TDY = date.today();
        String YEAR = String.ValueOf(TDY.year());
        String MONTH = String.ValueOf(TDY.month());

        // 園児日誌のテストデータを作成する
        KindergartenDiary__c kgd1 = new KindergartenDiary__c(
                    Contact__c = CNTID.Id,
                    Date__c = TDY,
                    AttendanceSchedule__c = '欠席',
                    StaffId__c = STFID.Id
        );
        insert kgd1;
        KindergartenDiary__c KGDID = kgd1;

        // 要録情報のテストデータを作成する
        ImportantNotes__c itn1 = new ImportantNotes__c(
                    FiscalYear__c= YEAR,
                    Contact__c=CNTID.Id,
                    Class__c='ゆり',
                    PassageRoute__c = '犬１',
                    Number__c = '101',
                    BusDisplayOrder__c = '101',
                    School__c='北広島わかば',
                    AnotherAffiliation__c='1号認定新2号',
                    BankName__c='ゆうちょ',
                    StoreNumber__c='123',
                    AccountNumber__c='1234567',
                    AccountName__c='ﾜｶﾊﾞ'
        );
        insert itn1;
        ImportantNotes__c ITNID1 = itn1;


        // テスト開始        
        Test.startTest();

        String result = '';
        result = ImportantNotesToEnjiController.EnjiUpdate( ITNID1.Id );

        Test.stopTest();
    }    

}