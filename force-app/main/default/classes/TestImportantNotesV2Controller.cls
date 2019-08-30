@isTest
// This class is bound to API version 45.0 by Version Settings
public with sharing class TestImportantNotesV2Controller {

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

        // 園児日誌のテストデータを作成する
        Date TDY = date.today();
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
                    FiscalYear__c='2019',
                    Contact__c=CNTID.Id,
            		Class__c='ゆり',
            		PassageRoute__c = '犬１',
            		Number__c = '101',
            		BusDisplayOrder__c = '101',
                    School__c='北広島わかば'
        );
        insert itn1;
        ImportantNotes__c ITNID = itn1;


        // insertList設定
        List<KindergartenDiary__c> insertList = new List<KindergartenDiary__c>();
        insertList.add(new KindergartenDiary__c(
								Date__c = TDY,
								Contact__c = CNTID.Id,
								Outside__c = '16:00',
								OutsideFast__c  = '7:00',
								StaffId__c = STFID.Id)
        );

        // updateList設定
        List<KindergartenDiary__c> updateList = new List<KindergartenDiary__c>();
        updateList.add(new KindergartenDiary__c(
								Id = KGDID.Id,
								Date__c = TDY,
								Contact__c = CNTID.Id,
								Outside__c = '16:00',
								OutsideFast__c  = '7:00',
								StaffId__c = STFID.Id)
        );

		Map<Id, Contact> contactMap = new Map<Id, Contact>([SELECT Id, Name FROM Contact]);
		List<Id> ContactList = new List<Id>(contactMap.keySet());

        // テスト開始        
        Test.startTest();

        List<Staff__c> Staff = ImportantNotesV2Controller.findStaff('北広島わかば');
        List<Staff__c> Staff2 = ImportantNotesV2Controller.findStaff('');

//        List<KindergartenDiary__c> KindergartenDiary1 = ImportantNotesV2Controller.findKindergartenDiary_OrList('2019-05-01 00:00:00','2019-05-31 00:00:00',CNTID.Id);

        List<ImportantNotes__c> ImportantNotes1 = ImportantNotesV2Controller.findImportantNotes('2019','北広島わかば');
        List<ImportantNotes__c> ImportantNotes2 = ImportantNotesV2Controller.findImportantNotes('2019','');
//        List<ImportantNotes__c> ImportantNotes3 = ImportantNotesV2Controller.findImportantNotes('2019','北広島わかば');
//        List<ImportantNotes__c> ImportantNotes4 = ImportantNotesV2Controller.findImportantNotes('2019','北広島わかば');

        List<KindergartenDiary__c> KindergartenDiary2 = ImportantNotesV2Controller.findKindergartenDiary('2019-08-29', ContactList);

//        String result = ImportantNotesV2Controller.upsertKindergartenDiary( insertList, updateList );

        Test.stopTest();
    }    

}