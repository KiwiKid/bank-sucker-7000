import { getTransactionTypeProperty } from "src/content-scripts/api";
import { ANZRow } from "./elementFinder";
import { TransactionSplitStore } from 'firefly-iii-typescript-sdk-fetch'
import { AccountConfig } from "./userConfig";

const getBaseFields = (t:ANZRow, ac:AccountConfig, version:string):TransactionSplitStore => {
    const transactionTitle = t.title?.length > 0 ? t.title : t.details 
    const isWithdrawal = t.depositAmount?.length > 0
    return {
        // ANZ data-transactionId is not a great unique Id
        externalId: `${transactionTitle}_${t.date.toISOString().slice(0, 10)}`,
        amount:  isWithdrawal ? t.depositAmount : t.creditAmount,
        type: getTransactionTypeProperty(t),
        description: isWithdrawal ? t.title : transactionTitle,
        notes: `via bank-sucker-7000_${t.date.toISOString().slice(0, 10)}`,
        date: t.date, 
    }
}

export const mapANZRowToFireflyTransaction = (t:ANZRow, ac:AccountConfig, version:string):TransactionSplitStore => {
    const type = getTransactionTypeProperty(t)

    const baseFireflyTransaction = getBaseFields(t,ac,version)

    switch(type){
        case 'deposit':
            baseFireflyTransaction.destinationName = ac.destinationName;
            baseFireflyTransaction.sourceName = t.title;
            return baseFireflyTransaction;
        case 'withdrawal':
        case 'transfer':
            baseFireflyTransaction.destinationName = t.title;
            baseFireflyTransaction.sourceName = ac.destinationName;
            return baseFireflyTransaction;
    }
}