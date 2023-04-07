import { getTransactionTypeProperty } from "src/content-scripts/api";
import { ANZRow } from "./elementFinder";
import { TransactionSplitStore } from 'firefly-iii-typescript-sdk-fetch'

// leg_id=transaction.get('legId'),
// transaction_type=transaction.get('type'),
// date=transaction.get('createdDate'),
// description=transaction.get('description'),
// merchant=transaction.get('merchant'),
// amount=Amount(revolut_amount=transaction.get('amount'),
//               currency=transaction.get('currency')),
// category=transaction.get('category'),
// is_vault=bool(transaction.get('vault')),
// currency=transaction.get('currency')

const getTransactionCategory = (t:ANZRow) => {    
    return ''
}


export const mapANZRowToFireflyTransaction = (t:ANZRow):TransactionSplitStore => {    
    const res:TransactionSplitStore = {
        amount: t.creditAmount?.length > 0 ? t.creditAmount : t.depositAmount,
        date: t.date, 
        type: getTransactionTypeProperty(t),
        description: t.details ?? t.destinationName,
        categoryName: getTransactionCategory(t),
        destinationName: t.destinationName
    }

    return res

}