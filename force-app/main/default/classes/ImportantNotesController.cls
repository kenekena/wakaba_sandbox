public with sharing class ImportantNotesController {
    /* 使わない
    @AuraEnabled(cacheable=true)
    public static List<ImportantNotes__c> getImportantNotesList() {
        return [SELECT Id, Name,Class__c FROM ImportantNotes__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<ImportantNotes__c> findImportantNotes(String searchKey) {
        if (String.isBlank(searchKey)) {
            return new List<ImportantNotes__c>();
        }
        String key = searchKey;
        return [SELECT Id, Name , Contact__r.kana__c , Class__c,Remarks__c FROM ImportantNotes__c WHERE Class__c =: searchKey];
    }
    */

    /* ------------------------------------------------------------------------
        共通：職員一覧を呼び出し　overtimeReservation / staffAttendanceMenu03
    ------------------------------------------------------------------------ */
    @AuraEnabled(cacheable=true)
    public static List<Staff__c> findStaff() {
        return [SELECT Id,Name FROM Staff__c WHERE ListDisplayCheck__c = true  ];
    }
    


    /* ------------------------------------------------
        overtimeReservation:園児日誌一覧を取得
    ------------------------------------------------ */
    @AuraEnabled
    public static List<KindergartenDiary__c> findKindergartenDiary_OrList(String StartDate,String EndDate,String EnjiID) {
        Date StartDateS = Date.valueOf(StartDate);
        Date EndDateS = Date.valueOf(EndDate);

        system.debug('StartDateS' + StartDateS);
        system.debug('EndDateS' + EndDateS);
        system.debug('EnjiID' + EnjiID);
        return [SELECT Id,AbsenceReason__c,BusBackNotUse__c,BusGoingNotUse__c,OutsideFast__c,Outside__c,AbsentSchedule__c ,Contact__r.Id,Contact__r.kana__c,Date__c FROM KindergartenDiary__c WHERE Contact__r.Id =:EnjiID AND Date__c >= :StartDateS AND Date__c <= :EndDateS];
    }
    
    /* ------------------------------------------------
        overtimeReservation:園児日誌を一括upsert
    ------------------------------------------------ */
    @AuraEnabled
    public static String upsertKindergartenDiary(List<KindergartenDiary__c> upsertList) {
        system.debug('これこれupsertList');
        system.debug(upsertList);
        return 'あああ';
    }




    /* ------------------------------------------------
        staffAttendanceMenu03:要録一覧を取得
    ------------------------------------------------ */
    @AuraEnabled
    public static List<ImportantNotes__c> findImportantNotes2(String searchValue,String searchDate,String searchGroup) {
        //!!!!!　年度と会計年度をあわせる処理を加える!!!!!!!!
        // 基準日の設定（本日）
        Date TDY =Date.valueOf(searchDate);
        // 会計年度期首月を取得
        Organization organization = [SELECT Id, Name,FiscalYearStartMonth FROM Organization LIMIT 1];
        // 会計年度期首月日を設定
        integer StartFYSM = organization.FiscalYearStartMonth;
        date StartDate = date.newInstance(TDY.year(), StartFYSM, 1);
        // 会計年度期末月日を設定
        date EndDate = (StartDate.addYears(1)).addDays(-1);
        //期末より月が小さかったらマイナス1年 
        if(EndDate.month() >=TDY.month()){
            TDY = TDY.addYears(-1); 
        }
        // 文字列に変化して頭4文字でYYYYを取得
        String searchYears = TDY.format();
        searchYears = searchYears.left(4);
        
        if(searchGroup == 'bus'){
            return [SELECT Id, Name ,PickUpTimeText__c,DropOffText__c,Contact__r.Id, Contact__r.kana__c , Class__c FROM ImportantNotes__c WHERE Contact__r.PassageRoute__c =: searchValue AND FiscalYear__c =:searchYears ORDER BY PickUpTime__c ASC NULLS LAST];
        }
        if(searchGroup == 'class'){
            return [SELECT Id, Name ,PickUpTimeText__c,DropOffText__c,Contact__r.Id, Contact__r.kana__c , Class__c FROM ImportantNotes__c WHERE Class__c =: searchValue AND FiscalYear__c =:searchYears ORDER BY DisplayOrder__c ASC NULLS LAST];
        }else{
            return new List<ImportantNotes__c>();
        }

        /* 別パターンの記述
            List<ImportantNotes__c> ImportantNoteList = new List<ImportantNotes__c> ();
            ImportantNoteList = [SELECT Id, Name ,Contact__r.Id, Contact__r.kana__c , Class__c,Remarks__c FROM ImportantNotes__c WHERE Class__c =: searchKey AND FiscalYear__c =:searchYear];
            return ImportantNoteList;
        */

    }

    /* ------------------------------------------------
        staffAttendanceMenu03:園児日報一覧を取得
    ------------------------------------------------ */
    @AuraEnabled
    public static List<KindergartenDiary__c> findKindergartenDiary(String searchDate) {
        Date myDate = Date.valueOf(searchDate);
        system.debug(searchDate);
        return [SELECT Id,AbsenceReason__c,AttendanceSchedule__c,BusBackNotUse__c,BusGoingNotUse__c,Contact__r.Id,Contact__r.kana__c,Date__c , AttendanceTime__c , AttendingSchool__c ,AbsentSchedule__c , attendingSchoolTime__c , GoingBack__c , GoingBackTime__c FROM KindergartenDiary__c WHERE Date__c =:myDate];

        /* 別パターンの記述
            List<KindergartenDiary__c> KindergartenDiaryList = new List<KindergartenDiary__c>();
            KindergartenDiaryList = [SELECT Id,AttendanceSchedule__c ,Contact__r.Id,Contact__r.kana__c FROM KindergartenDiary__c WHERE Date__c =:myDate];
            return KindergartenDiaryList;
        */

    }
    
}