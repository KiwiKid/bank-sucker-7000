import { getTransactionTypeProperty } from "src/content-scripts/api";
import { ANZRow } from "./elementFinder";
import { TransactionSplitStore } from 'firefly-iii-typescript-sdk-fetch'
import { AccountConfig } from "./userConfig";

const getBaseFields = (t:ANZRow, ac:AccountConfig, version:string):TransactionSplitStore => {
    const isWithdrawal = t.depositAmount?.length > 0
    const amount = isWithdrawal ? t.depositAmount : t.creditAmount
    // Ensure transactions created are unique:
    const transactionNote = `via bank-sucker-7000_${t.title?.length > 0 ? t.title : t.details}_${amount}_${t.date.toISOString().slice(0, 10)}`

    return {
        // ANZ data-transactionId is not a great unique Id
        externalId: transactionNote,
        amount: amount,
        type: getTransactionTypeProperty(t),
        description: t.title?.length > 0 ? t.title : t.details,
        notes: `${t.date.toISOString().slice(0, 10)}`,
        date: t.date, 
    }
}

export const mapANZRowToFireflyTransaction = (t:ANZRow, ac:AccountConfig, version:string):TransactionSplitStore => {
    const type = getTransactionTypeProperty(t)

    const baseFireflyTransaction = getBaseFields(t,ac,version)

    switch(type){
        case 'deposit':
            baseFireflyTransaction.destinationName = ac.accountConfig.fireflyAccountName;
            baseFireflyTransaction.sourceName = t.title;
            return baseFireflyTransaction;
        case 'withdrawal':
        case 'transfer':
            baseFireflyTransaction.destinationName = t.title;
            baseFireflyTransaction.sourceName = ac.accountConfig.fireflyAccountName;
            return baseFireflyTransaction;
    }
}