public without sharing class ImportantNotesToEnjiController {

    // 要録情報OBJからボタンで呼び出し
    @AuraEnabled
    public static String EnjiUpdate(ID ImportantNotesid) {

        // 要録情報データを検索
        // ID、関連園児ID、幼稚園、所属、所属の別、園児番号、通園コース、メール
        // 銀行名、店番号、口座番号、口座名
        List<ImportantNotes__c> ImportantNotesList = [SELECT Id, Contact__c, School__c, Mail__c,
                                                                                                            Belongs__c, AnotherAffiliation__c,
                                                                                                            Number__c, PassageRoute__c,
                                                                                                            BankName__c, StoreNumber__c,
                                                                                                            AccountNumber__c, AccountName__c
                                                                                                            FROM ImportantNotes__c 
                                                                                                            WHERE Id = :ImportantNotesid];

        // 要録情報データなし
        if(ImportantNotesList.size() == 0){
            // データなしメッセージ
            return '要録情報データがありません！';
        }

        // 要録情報データを取得
        ImportantNotes__c ImportantNotes = ImportantNotesList.get(0);
System.debug('ImportantNotes　'+ImportantNotes);
System.debug('ImportantNotes.Mail__c　'+ImportantNotes.Mail__c);

        // 園児OBJ
        List<Contact> ContactTMP = new List<Contact>();

        // 園児OBJを更新情報
        // 幼稚園、所属、所属の別、園児番号、通園コース、メール
        // 銀行名、店番号、口座番号、口座名
        ContactTMP.add(new Contact(
                                                            Id = ImportantNotes.Contact__c,
															Email = ImportantNotes.Mail__c,
                                                            School__c = ImportantNotes.School__c,
                                                            Belongs__c = ImportantNotes.Belongs__c,
                                                            AnotherAffiliation__c = ImportantNotes.AnotherAffiliation__c,
                                                            Number__c = ImportantNotes.Number__c,
                                                            PassageRoute__c = ImportantNotes.PassageRoute__c,
                                                            BankName__c = ImportantNotes.BankName__c,
                                                            StoreNumber__c = ImportantNotes.StoreNumber__c,
                                                            AccountNumber__c = ImportantNotes.AccountNumber__c,
                                                            AccountName__c = ImportantNotes.AccountName__c,
                                                            INReflectionTime__c = Datetime.now()
                                                )
        );
        
        // 園児OBJデータ更新
        if (ContactTMP.size() > 0) {
            try{
System.debug('update ContactTMP　'+ContactTMP);
                update ContactTMP;
            }catch(DmlException e){
                System.debug('ImportantNotes__c 園児OBJの更新失敗');
                Integer errNum = e.getNumDml();
                for(Integer i = 0; i < errNum; i++){
                    ContactTMP.get(e.getDmlIndex(i)).addError('園児データ更新時にエラーが発生しました'+e.getDmlMessage(i));
                }
            }
        }

        // 保護者データの更新
        // 園児データを検索
        List<Contact > ContactList = [SELECT Id, AccountId FROM Contact  
                                                                               WHERE Id = :ImportantNotes.Contact__c];
 
        // 園児データあり
        if(ContactList.size() > 0){
            // レコード取得
            Contact  ContactREC = ContactList.get(0);

            // 保護者IDがNULLでない場合、保護者OBJデータを更新
            if(ContactREC.AccountId != null){
                // 保護者OBJ
                List<Account> AccountTMP = new List<Account>();

                // 保護者OBJを更新情報
                // 幼稚園
                AccountTMP.add(new Account(
                                                            Id = ContactREC.AccountId,
                                                            School__c = ImportantNotes.School__c,
															Mail__c = ImportantNotes.Mail__c,
                                                            INReflectionTime__c = Datetime.now()
                                                )
                );
                // 保護者OBJデータ更新
                if (AccountTMP.size() > 0) {
                    try{
System.debug('update AccountTMP　'+AccountTMP);
                        update AccountTMP;
                    }catch(DmlException e){
                        System.debug('ImportantNotes__c 保護者OBJの更新失敗');
                        Integer errNum = e.getNumDml();
                        for(Integer i = 0; i < errNum; i++){
                            AccountTMP.get(e.getDmlIndex(i)).addError('保護者データ更新時にエラーが発生しました'+e.getDmlMessage(i));
                        }
                    }
                }
                
            }

        }

        // 処理完了メッセージ
        return '反映処理が完了しました！';
    }
}