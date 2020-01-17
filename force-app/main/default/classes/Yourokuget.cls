public class Yourokuget {

    // property
    public String message {
        get {
            return '・テスト　０１ああ<br />あああああああ';
        }
        set;
    }

    // getter
    public String getMessage2() {
        return 'Good bye!';
    }

    public List<ImportantNotes__c> getImportantNotes() {
    
        List<ImportantNotes__c> results = Database.query(
            'SELECT Id, ContactName__c, Contact__r.Name, Birthdate__c, Sex__c, JapaneseCalendar__c, GradePointEmphasis__c, PersonalEmphasis__c, ReferenceItems__c, Remarks__c, FiscalYear__c, ChildcareDays__c, AttendanceDays__c ' +
            'FROM ImportantNotes__c ' +
            'ORDER BY FiscalYear__c  DESC ' +
            'LIMIT 6'
        );
        return results;
    }
}