declare module "@salesforce/apex/ImportantNotesV2Controller.findStaff" {
  export default function findStaff(param: {ThisKindergarten: any}): Promise<any>;
}
declare module "@salesforce/apex/ImportantNotesV2Controller.findImportantNotes" {
  export default function findImportantNotes(param: {Year: any, Kindergarten: any}): Promise<any>;
}
declare module "@salesforce/apex/ImportantNotesV2Controller.findKindergartenDiary" {
  export default function findKindergartenDiary(param: {SearchDate: any, ContactIdList: any}): Promise<any>;
}
declare module "@salesforce/apex/ImportantNotesV2Controller.findKindergartenDiary_OrList" {
  export default function findKindergartenDiary_OrList(param: {StartDate: any, EndDate: any, EnjiID: any}): Promise<any>;
}
declare module "@salesforce/apex/ImportantNotesV2Controller.findChildcareFee" {
  export default function findChildcareFee(param: {Year: any, Month: any, EnjiID: any}): Promise<any>;
}
