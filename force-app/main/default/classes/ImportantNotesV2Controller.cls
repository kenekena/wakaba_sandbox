public with sharing class ImportantNotesV2Controller {
    /* ------------------------------------------------------------------------
        共通：職員一覧を呼び出し　staffAttendanceMenu04
    ------------------------------------------------------------------------ */
    @AuraEnabled(cacheable=true)
    public static List<Staff__c> findStaff(String ThisKindergarten) {
        return [SELECT Id,Name FROM Staff__c WHERE ListDisplayCheck__c = true AND School__c = :ThisKindergarten];
    }

    /* ------------------------------------------------
        staffAttendanceMenu04:要録情報を取得
    ------------------------------------------------ */
    @AuraEnabled
    public static List<ImportantNotes__c> findImportantNotes(String Year,String Kindergarten) {
        return [SELECT Id, Name ,PickUpTimeText__c,PassageRoute__c,DropOffText__c,Class__c,Contact__r.Id, Contact__r.kana__c , Contact__r.PassageRoute__c 
                FROM ImportantNotes__c
                WHERE FiscalYear__c =: Year AND School__c =:Kindergarten 
                ORDER BY Number__c ASC NULLS LAST];
    }

    /* ------------------------------------------------
        staffAttendanceMenu04:園児日報一覧を取得
    ------------------------------------------------ */
    @AuraEnabled
    public static List<KindergartenDiary__c> findKindergartenDiary(String SearchDate,List<Id> ContactIdList) {
        system.debug(ContactIdList);
        //ゆくゆくは、園児日誌objと保育料obj
        Date myDate = Date.valueOf(SearchDate);
        return [SELECT Id,AbsenceReason__c,NotRideReason__c ,AttendanceSchedule__c,BusBackNotUse__c,BusGoingNotUse__c,
                    Contact__r.Id,Contact__r.kana__c,Date__c , AttendanceTime__c , AttendingSchool__c ,AbsentSchedule__c , 
                    attendingSchoolTime__c , GoingBack__c , GoingBackTime__c , AttendanceStopReason__c
                    FROM KindergartenDiary__c 
                    WHERE Date__c =:myDate AND Contact__c in :ContactIdList];
    }
}