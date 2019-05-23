@isTest
// This class is bound to API version 45.0 by Version Settings
public with sharing class TestImportantNotesController {

    @isTest static void test_ImportantNotes() {
        
        // 職員名簿のテストデータを作成する
        Staff__c staff1 = new Staff__c(
            Name='テスト職員A',
            WorkDivision__c ='正職員',
            School__c='北広島わかば'
        );
        insert staff1;
        
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

        // テスト開始        
        Test.startTest();

        List<Staff__c> Staff = ImportantNotesController.findStaff();

        List<KindergartenDiary__c> KindergartenDiary1 = ImportantNotesController.findKindergartenDiary_OrList('2019-05-01 00:00:00','2019-05-31 00:00:00',CNTID.Id);

        List<ImportantNotes__c> ImportantNotes1 = ImportantNotesController.findImportantNotes2('ゆり','2019-05-16 00:00:00','class');
        List<ImportantNotes__c> ImportantNotes2 = ImportantNotesController.findImportantNotes2('ゆり','2019-02-15 00:00:00','class');
        List<ImportantNotes__c> ImportantNotes3 = ImportantNotesController.findImportantNotes2('通園コース1','2019-05-19 00:00:00','bus');
        List<ImportantNotes__c> ImportantNotes4 = ImportantNotesController.findImportantNotes2('通園コース1','2019-05-19 00:00:00','buss');

        List<KindergartenDiary__c> KindergartenDiary2 = ImportantNotesController.findKindergartenDiary('2019-05-01 00:00:00');
        Test.stopTest();

    }    

}