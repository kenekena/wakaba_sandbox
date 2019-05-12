declare module "@salesforce/apex/ImportantNotesController.getImportantNotesList" {
  export default function getImportantNotesList(): Promise<any>;
}
declare module "@salesforce/apex/ImportantNotesController.findImportantNotes" {
  export default function findImportantNotes(param: {searchKey: any}): Promise<any>;
}
declare module "@salesforce/apex/ImportantNotesController.findImportantNotes2" {
  export default function findImportantNotes2(param: {searchValue: any, searchYear: any, searchGroup: any}): Promise<any>;
}
declare module "@salesforce/apex/ImportantNotesController.findKindergartenDiary" {
  export default function findKindergartenDiary(param: {searchDate: any}): Promise<any>;
}
