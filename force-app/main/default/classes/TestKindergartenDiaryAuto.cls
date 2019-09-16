@isTest
public class TestKindergartenDiaryAuto {
    // 登録時のテスト
    @isTest static void test_create1(){
        // テストデータ作成
        // 園児日誌データ
        KindergartenDiary__c insItn1 = CreateKindergartenDiary1();

        // テスト開始
        Test.startTest();
        Database.SaveResult result = Database.insert(insItn1, false);        
        Test.stopTest();
    }
    @isTest static void test_create2(){
        // テストデータ作成
        // 園児日誌データ
        KindergartenDiary__c insItn2 = CreateKindergartenDiary2();

        // テスト開始
        Test.startTest();
        Database.SaveResult result = Database.insert(insItn2, false);        
        Test.stopTest();
    }

    // 変更時のテスト
    @isTest static void test_update1(){
        // テストデータ作成
        // 園児日誌データ
        KindergartenDiary__c updItn1 = UpdateKindergartenDiary1();

        // テスト開始
        Test.startTest();
        Database.SaveResult result = Database.Update(updItn1, false);        
        Test.stopTest();
    }
    @isTest static void test_update2(){
        // テストデータ作成
        // 園児日誌データ
        KindergartenDiary__c updItn2 = UpdateKindergartenDiary2();

        // テスト開始
        Test.startTest();
        Database.SaveResult result = Database.Update(updItn2, false);        
        Test.stopTest();
    }

    // 削除時のテスト
    @isTest static void test_delete1(){
        // テストデータ作成
        // 園児日誌データ
        KindergartenDiary__c dltItn1 = DeleteKindergartenDiary1();

        // テスト開始
        Test.startTest();
        delete(dltItn1);        
        Test.stopTest();
    }
    @isTest static void test_delete2(){
        // テストデータ作成
        // 園児日誌データ
        KindergartenDiary__c dltItn2 = DeleteKindergartenDiary2();

        // テスト開始
        Test.startTest();
        delete(dltItn2);        
        Test.stopTest();
    }

    

    // 園児日誌テストデータ作成
    private static KindergartenDiary__c   CreateKindergartenDiary1(){
        // 園児データ作成
        Contact insCnt = CreateEnji();
        insert insCnt;
        String CNTID = insCnt.Id;

        // 要録情報データ作成
        ImportantNotes__c insItn = new ImportantNotes__c(
            FiscalYear__c = '2019',
            School__c = '北広島わかば',
            Belongs__c = '幼稚園部',
            Number__c = '101',
            Class__c = 'ゆり',
            PassageRoute__c = '犬１',
            BusDisplayOrder__c = '101',
            Contact__c = CNTID
        );
        insert insItn;
        String ITNID = insItn.Id;

        // 本日を設定
        Date TDY = Date.today();        

        // 園児日誌データ作成
        KindergartenDiary__c kgd = new KindergartenDiary__c(
            Date__c = TDY,
            AttendanceSchedule__c = '出席',
            AttendanceStopReason__c  = '',
            Contact__c = CNTID
        );
        return kgd;
    }

    private static KindergartenDiary__c   CreateKindergartenDiary2(){
        // 園児データ作成
        Contact insCnt = CreateEnji();
        insert insCnt;
        String CNTID = insCnt.Id;

        // 要録情報データ作成
        ImportantNotes__c insItn = new ImportantNotes__c(
            FiscalYear__c = '2019',
            School__c = '北広島わかば',
            Belongs__c = '保育園部の短時間',
            Number__c = '101',
            Class__c = 'ゆり',
            PassageRoute__c = '犬１',
            BusDisplayOrder__c = '101',
            Contact__c = CNTID
        );
        insert insItn;
        String ITNID = insItn.Id;

        // 本日を設定
        Date TDY = Date.today();

        // 園児日誌データ作成
        KindergartenDiary__c kgd = new KindergartenDiary__c(
            Date__c = TDY,
            AttendanceSchedule__c = '出席',
            AttendanceStopReason__c  = '',
            Contact__c = CNTID
        );
        return kgd;
    }

    // 要録情報テストデータ更新
    private static KindergartenDiary__c   UpdateKindergartenDiary1(){
        // 園児データ作成
        Contact insCnt = CreateEnji();
        insert insCnt;
        String CNTID = insCnt.Id;

        // 要録情報データ作成
        ImportantNotes__c insItn = new ImportantNotes__c(
            FiscalYear__c = '2019',
            School__c = '北広島わかば',
            Belongs__c = '幼稚園部',
            Number__c = '101',
            Class__c = 'ゆり',
            PassageRoute__c = '犬１',
            BusDisplayOrder__c = '101',
            Contact__c = CNTID
        );
        insert insItn;
        String ITNID = insItn.Id;

        // 本日を設定
        Date TDY = Date.today();        

        // 園児日誌データ作成
        KindergartenDiary__c insKgd = new KindergartenDiary__c(
            Date__c = TDY,
            AttendanceSchedule__c = '欠席',
            AttendanceStopReason__c  = 'インフルエンザ',
            Contact__c = CNTID
        );
        insert insKgd;
        String KGDID = insKgd.Id;

        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        Long startTime = DateTime.now().getTime();
        Long finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }

        // 園児日誌データ更新
        KindergartenDiary__c kgd2 = new KindergartenDiary__c(
            Id = KGDID,
            Date__c = TDY,
            AttendanceSchedule__c = '出席',
            AttendanceStopReason__c  = '',
            Contact__c = CNTID
        );
        update kgd2;
        
        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        startTime = DateTime.now().getTime();
        finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }

        // 園児日誌データ更新
        KindergartenDiary__c kgd = new KindergartenDiary__c(
            Id = KGDID,
            Date__c = TDY,
            AttendanceSchedule__c = '出席',
            AttendanceStopReason__c  = '',
            Belongs__c = '',
            Contact__c = CNTID
        );
        return kgd;
    }

    private static KindergartenDiary__c   UpdateKindergartenDiary2(){
        // 園児データ作成
        Contact insCnt = CreateEnji();
        insert insCnt;
        String CNTID = insCnt.Id;

        // 要録情報データ作成
        ImportantNotes__c insItn = new ImportantNotes__c(
            FiscalYear__c = '2019',
            School__c = '北広島わかば',
            Belongs__c = '保育園部の短時間',
            Number__c = '101',
            Class__c = 'ゆり',
            PassageRoute__c = '犬１',
            BusDisplayOrder__c = '101',
            Contact__c = CNTID
        );
        insert insItn;
        String ITNID = insItn.Id;

        // 本日を設定
        Date TDY = Date.today();        

        // 園児日誌データ作成
        KindergartenDiary__c insKgd = new KindergartenDiary__c(
            Date__c = TDY,
            AttendanceSchedule__c = '欠席',
            AttendanceStopReason__c  = 'インフルエンザ',
            Contact__c = CNTID
        );
        insert insKgd;
        String KGDID = insKgd.Id;

        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        Long startTime = DateTime.now().getTime();
        Long finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }

        // 園児日誌データ更新
        KindergartenDiary__c kgd2 = new KindergartenDiary__c(
            Id = KGDID,
            Date__c = TDY,
            AttendanceSchedule__c = '出席',
            AttendanceStopReason__c  = '',
            Contact__c = CNTID
        );
        update kgd2;
        
        // -----------------------------------------------------------
        // 1秒ウェイト（更新が早いため）
        // -----------------------------------------------------------
        startTime = DateTime.now().getTime();
        finishTime = DateTime.now().getTime();
        while ((finishTime - startTime) < 1000) {
            finishTime = DateTime.now().getTime();
        }

        // 園児日誌データ更新
        KindergartenDiary__c kgd = new KindergartenDiary__c(
            Id = KGDID,
            Date__c = TDY,
            AttendanceSchedule__c = '欠席',
            AttendanceStopReason__c  = '',
            Belongs__c = '',
            Contact__c = CNTID
        );
        return kgd;
    }

    // 要録情報テストデータ削除
    private static KindergartenDiary__c   DeleteKindergartenDiary1(){
        // 園児データ作成
        Contact insCnt = CreateEnji();
        insert insCnt;
        String CNTID = insCnt.Id;

        // 要録情報データ作成
        ImportantNotes__c insItn = new ImportantNotes__c(
            FiscalYear__c = '2019',
            School__c = '北広島わかば',
            Belongs__c = '幼稚園部',
            Number__c = '101',
            Class__c = 'ゆり',
            PassageRoute__c = '犬１',
            BusDisplayOrder__c = '101',
            Contact__c = CNTID
        );
        insert insItn;
        String ITNID = insItn.Id;

        // 本日を設定
        Date TDY = Date.today();        

        // 園児日誌データ作成
        KindergartenDiary__c insKgd3 = new KindergartenDiary__c(
            Date__c = TDY,
            AttendanceSchedule__c = '欠席',
            AttendanceStopReason__c  = 'インフルエンザ',
            Contact__c = CNTID
        );
        insert insKgd3;

        KindergartenDiary__c insKgd2 = new KindergartenDiary__c(
            Date__c = TDY+1,
            AttendanceSchedule__c = '出席',
            AttendanceStopReason__c  = '',
            Contact__c = CNTID
        );
        insert insKgd2;
        String KGDID2 = insKgd2.Id;

        KindergartenDiary__c kgd2 = new KindergartenDiary__c(
            Id = KGDID2,
            Belongs__c = '',
            Contact__c = CNTID
        );
        update kgd2;

        KindergartenDiary__c insKgd = new KindergartenDiary__c(
            Date__c = TDY+2,
            AttendanceSchedule__c = '出席',
            AttendanceStopReason__c  = '',
            Contact__c = CNTID
        );
        insert insKgd;
        String KGDID = insKgd.Id;

        KindergartenDiary__c delKgd = [SELECT Id FROM KindergartenDiary__c WHERE Id = :KGDID];

        return delKgd;
    }

    private static KindergartenDiary__c   DeleteKindergartenDiary2(){
        // 園児データ作成
        Contact insCnt = CreateEnji();
        insert insCnt;
        String CNTID = insCnt.Id;

        // 要録情報データ作成
        ImportantNotes__c insItn = new ImportantNotes__c(
            FiscalYear__c = '2019',
            School__c = '北広島わかば',
            Belongs__c = '保育園部の標準時間',
            Number__c = '101',
            Class__c = 'ゆり',
            PassageRoute__c = '犬１',
            BusDisplayOrder__c = '101',
            Contact__c = CNTID
        );
        insert insItn;
        String ITNID = insItn.Id;

        // 本日を設定
        Date TDY = Date.today();        

        // 園児日誌データ作成
        KindergartenDiary__c insKgd3 = new KindergartenDiary__c(
            Date__c = TDY,
            AttendanceSchedule__c = '欠席',
            AttendanceStopReason__c  = 'インフルエンザ',
            Contact__c = CNTID
        );
        insert insKgd3;

        KindergartenDiary__c insKgd2 = new KindergartenDiary__c(
            Date__c = TDY+1,
            AttendanceSchedule__c = '出席',
            AttendanceStopReason__c  = '',
            Contact__c = CNTID
        );
        insert insKgd2;
        String KGDID2 = insKgd2.Id;

        KindergartenDiary__c kgd2 = new KindergartenDiary__c(
            Id = KGDID2,
            Belongs__c = '',
            Contact__c = CNTID
        );
        update kgd2;

        KindergartenDiary__c insKgd = new KindergartenDiary__c(
            Date__c = TDY+2,
            AttendanceSchedule__c = '欠席',
            AttendanceStopReason__c  = '',
            Contact__c = CNTID
        );
        insert insKgd;
        String KGDID = insKgd.Id;

        KindergartenDiary__c delKgd = [SELECT Id FROM KindergartenDiary__c WHERE Id = :KGDID];

        return delKgd;
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