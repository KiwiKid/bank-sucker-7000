import { getTransactionTypeProperty } from "src/content-scripts/api";
import { TransactionSplitStore } from 'firefly-iii-typescript-sdk-fetch'
import { AccountConfig } from "./userConfig";
import { TransactionRow } from "./anzElementFinder";

const getBaseFields = (t:TransactionRow, ac:AccountConfig, version:string):TransactionSplitStore => {
    const isWithdrawal = t.depositAmount?.length > 0
    const amount = isWithdrawal ? t.depositAmount : t.creditAmount
    // Ensure transactions created are unique:

    return {
        // ANZ data-transactionId is not a great unique Id
        amount: amount,
        type: getTransactionTypeProperty(t),
        description: t.title?.length > 0 ? t.title : t.details,
        notes: `${t.transactionId}`,
        date: t.date,
        externalId: t.transactionId
    }
}

export const mapANZRowToFireflyTransaction = (t:TransactionRow, ac:AccountConfig, version:string):TransactionSplitStore => {
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