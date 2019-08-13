public with sharing class ImportantNotesV2Controller {
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
}
