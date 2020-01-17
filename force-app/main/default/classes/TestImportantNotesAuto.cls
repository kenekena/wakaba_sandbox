@isTest
public class TestImportantNotesAuto {
    // 登録時のテスト
    @isTest static void test_create1(){
        // テストデータ作成
        // 要録情報データ
        ImportantNotes__c insItn1 = CreateImportantNotes1();

        // テスト開始
        Test.startTest();
        Database.SaveResult result = Database.insert(insItn1, false);        
        Test.stopTest();
    }

    // 変更時のテスト
    @isTest static void test_update1(){
        // テストデータ作成
        // 要録情報データ
        ImportantNotes__c updItn1 = UpdateImportantNotes1();

        // テスト開始
        Test.startTest();
        Database.SaveResult result = Database.Update(updItn1, false);        
        Test.stopTest();
    }

    // 削除時のテスト
    @isTest static void test_delete1(){
        // テストデータ作成
        // 要録情報データ
        ImportantNotes__c dltItn1 = DeleteImportantNotes1();

        // テスト開始
        Test.startTest();
        delete(dltItn1);        
        Test.stopTest();
    }


    // 要録情報テストデータ作成
    private static ImportantNotes__c   CreateImportantNotes1(){
        // 園児データ作成
        Contact insCnt = CreateEnji();
        insert insCnt;
        String CNTID = insCnt.Id;

        // 要録情報データ作成
        ImportantNotes__c itn = new ImportantNotes__c(
            FiscalYear__c = '2019',
            School__c = '北広島わかば',
            Belongs__c = '幼稚園部',
            Number__c = '101',
            Class__c = 'ゆり',
            PassageRoute__c = '犬１',
            BusDisplayOrder__c = '101',
            Contact__c = CNTID
        );
        return itn;
    }

    // 要録情報テストデータ更新
    private static ImportantNotes__c   UpdateImportantNotes1(){
        // 園児データ作成
        Contact insCnt = CreateEnji();
        insert insCnt;
        String CNTID = insCnt.Id;

        // 要録情報データ作成
        ImportantNotes__c insItn = CreateImportantNotes1();
        insert insItn;
        String ITNID = insItn.Id;

        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        Long startTime = DateTime.now().getTime();
        Long finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }
        
        // 保育料データ削除
//        ChildcareFee__c delCf = [SELECT Id FROM ChildcareFee__c WHERE Year__c = '2019' AND Month__c = '12' AND ImportantNotes__c = :ITNID];
        LIST<ChildcareFee__c> delCf = [SELECT Id FROM ChildcareFee__c WHERE ImportantNotes__c = :ITNID];
System.debug('delCfdelCf　'+[SELECT Id FROM ChildcareFee__c WHERE ImportantNotes__c = :ITNID]);
        delete(delCf);
System.debug('delCfdelCf　'+[SELECT Id FROM ChildcareFee__c WHERE ImportantNotes__c = :ITNID]);

        // 要録情報データ更新
        ImportantNotes__c itn = new ImportantNotes__c(
            Id = ITNID,
            FiscalYear__c = '2019',
            School__c = '北広島わかば',
            Belongs__c = '保育園部の標準時間',
            Number__c = '101',
            Class__c = 'ゆり',
            PassageRoute__c = '犬１',
            BusDisplayOrder__c = '101',
            Contact__c = CNTID
        );
        return itn;
    }

    // 要録情報テストデータ削除
    private static ImportantNotes__c   DeleteImportantNotes1(){
        // 園児データ作成
        Contact insCnt = CreateEnji();
        insert insCnt;
        String CNTID = insCnt.Id;

        // 要録情報データ作成
        ImportantNotes__c insItn = CreateImportantNotes1();
        insert insItn;
        String ITNID = insItn.Id;

        ImportantNotes__c delItn = [SELECT Id FROM ImportantNotes__c WHERE Id = :ITNID];

        return delItn;
    }

    // 園児テストデータ作成
    private static Contact  CreateEnji(){
        
        // 保護者データ作成
		Account act = new Account (
            Name = 'テスト保護者'
        );
        insert act;
        String ACTID = act.Id;
        
        // データ作成
        Contact cnt = new contact(
            LastName = 'テスト園児',
            AccountId = ACTID
        );
        return cnt;
    }

}