public with sharing class ImportantNotesV2Controller {
    /* ------------------------------------------------------------------------
        共通：職員一覧を呼び出し　staffAttendanceMenu04
    ------------------------------------------------------------------------ */
    @AuraEnabled(cacheable=true)
    public static List<Staff__c> findStaff(String ThisKindergarten) {
        system.debug(ThisKindergarten);
        if(ThisKindergarten != ''){
	        return [SELECT Id,Name FROM Staff__c WHERE ListDisplayCheck__c = true AND School__c = :ThisKindergarten ORDER BY StaffCode__c  ASC];
        }else{
	        return [SELECT Id,Name FROM Staff__c WHERE ListDisplayCheck__c = true ORDER BY StaffCode__c  ASC]; 
        }
    }

    /* ------------------------------------------------
        staffAttendanceMenu04:要録情報を取得
    ------------------------------------------------ */
    @AuraEnabled
    public static List<ImportantNotes__c> findImportantNotes(String Year,String Kindergarten) {
        if(Kindergarten != ''){
	        return [SELECT Id, Name ,Number__c,PickUpTimeText__c,PassageRoute__c,DropOffText__c,Class__c,Contact__r.Id, Contact__r.kana__c , Contact__r.PassageRoute__c ,BusDisplayOrder__c,Belongs__c
                FROM ImportantNotes__c
                WHERE FiscalYear__c =: Year AND School__c =:Kindergarten
                ORDER BY Number__c ASC NULLS LAST];
        }else{
	        return [SELECT Id, Name ,Number__c,PickUpTimeText__c,PassageRoute__c,DropOffText__c,Class__c,Contact__r.Id, Contact__r.kana__c , Contact__r.PassageRoute__c ,BusDisplayOrder__c
                FROM ImportantNotes__c
                WHERE FiscalYear__c =: Year
                ORDER BY Number__c ASC NULLS LAST];
        }
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

    /* ------------------------------------------------
        staffAttendanceMenu04:保育料リストを取得
    ------------------------------------------------ */
    @AuraEnabled
    public static List<ChildcareFee__c> findChildcareFees(String Year,String Month,List<Id> EnjiID) {
        return [SELECT Id,AbsenceDays__c,AttendanceDays__c,AttendanceStopDays__c,ChildcareDays__c,Contact__c,Contact__r.kana__c
                    FROM ChildcareFee__c 
                    WHERE Contact__c in :EnjiID AND Year__c =:Year AND Month__c =:Month
        ];
    }

    /* ------------------------------------------------
        overtimeReservation2:園児日誌一覧を取得
    ------------------------------------------------ */
    @AuraEnabled
    public static List<KindergartenDiary__c> findKindergartenDiary_OrList(String StartDate,String EndDate,Id EnjiID) {
        Date StartDateS = Date.valueOf(StartDate);
        Date EndDateS = Date.valueOf(EndDate);

        system.debug('StartDateS' + StartDateS);
        system.debug('EndDateS' + EndDateS);
        system.debug('EnjiID' + EnjiID);
        return [SELECT Id,AbsenceReason__c,NotRideReason__c ,BusBackNotUse__c,BusGoingNotUse__c,OutsideFast__c,Outside__c,AbsentSchedule__c ,Contact__r.Id,Contact__r.kana__c,Date__c 
                    FROM KindergartenDiary__c 
                    WHERE Contact__r.Id =:EnjiID AND Date__c >= :StartDateS AND Date__c <= :EndDateS
        ];
    }
    /* ------------------------------------------------
        overtimeReservation2:保育料を取得
    ------------------------------------------------ */
    @AuraEnabled
    public static List<ChildcareFee__c> findChildcareFee(String Year,String Month,Id EnjiID) {
        return [SELECT Id,AbsenceDays__c,AttendanceDays__c,AttendanceStopDays__c,ChildcareDays__c
                    FROM ChildcareFee__c 
                    WHERE Contact__r.Id =:EnjiID AND Year__c =:Year AND Month__c =:Month
                    LIMIT 1
        ];
    }
    /* ------------------------------------------------
        overtimeReservation2:園児日誌一括登録
    ------------------------------------------------ */
    @AuraEnabled
    public static String UpsertKindergartenDiary(List<KindergartenDiary__c> UpsertList) {
        System.debug(UpsertList);
        upsert UpsertList KindergartenDiary__c.Fields.Id;

        return 'OK';
    }

}