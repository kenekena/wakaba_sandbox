const Week = ["日","月","火","水","木","金","土"];
/********************************
    選択リストを作成SetListValue
        DafaultList     :@wire getPicklistValuesで取得した入れる
        HeadValue       :bloon 先頭にデフォルトの値を追加
        DefaultValue    :HeadValueがtrueのときの先頭のvalue
        DefaultLabel    :HeadValueがtrueのときの先頭のlabel
        SelectLabel     :valueとイコールならselectedをtrueにする
    return >>> 配列
********************************/
const SetListValue = (DefaultList,HeadValue,DefaultValue,DefultLabel,SelectLabel) => {
    let i;let Head = 0;let SetList = [];let SetSelected = false;
    if(HeadValue){
        if(DefaultValue === SelectLabel){SetSelected = true;}
        Head = 1;
        SetList[0] = {
            value : DefaultValue,
            label : DefultLabel,
            selected: SetSelected
        }
    }
    for(i = 0; i< DefaultList.values.length; i++){
        if(DefaultList.values[i].value === SelectLabel){SetSelected = true}else{SetSelected = false}
        SetList[i + Head] = {
            value : DefaultList.values[i].value,
            label : DefaultList.values[i].value,
            selected: SetSelected
        }
    }
    return SetList;
}
/* END:選択リストを作成SetListValue */

/********************************
    先頭ゼロ付加
********************************/
const padZero = (num) =>{
    let result;
    if (num < 10) {
        result = "0" + num;
    } else {
        result = "" + num;
    }
    return result;
}
/* END:先頭ゼロ付加 */

/********************************
    日付を文字列に変換
********************************/
const ChangeText = (TargeDate) =>{
    return TargeDate.getFullYear() + "年" + (TargeDate.getMonth() + 1) + "月"+ TargeDate.getDate() + "日(" + Week[TargeDate.getDay()] + ")";
}
/* END:日付を文字列に変換 */

/********************************
    日付を文字列に変換
********************************/
const ChangeText2 = (TargeDate) =>{
    return (TargeDate.getMonth() + 1) + "月"+ TargeDate.getDate() + "日(" + Week[TargeDate.getDay()] + ")";
}
/* END:日付を文字列に変換 */

/********************************
    日付を処理用に変換
********************************/
const ChangeProcess = (TargeDate) =>{
    return TargeDate.getFullYear() + "-" + padZero((TargeDate.getMonth() + 1)) + "-"+ padZero(TargeDate.getDate());
}
/* END:日付を処理用に変換 */


export {
    SetListValue,
    padZero,
    ChangeText,
    ChangeText2,
    ChangeProcess
};