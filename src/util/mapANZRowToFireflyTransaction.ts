import { getTransactionTypeProperty } from "src/content-scripts/api";
import { TransactionSplitStore } from "firefly-iii-typescript-sdk-fetch";
import { AccountExportConfig } from "./userConfig";
import { TransactionRow } from "./ElementFinder";

const getBaseFields = (t: TransactionRow): TransactionSplitStore => {
  const isWithdrawal = t.depositAmount?.length > 0;
  const amount = isWithdrawal ? t.depositAmount : t.creditAmount;
  // Ensure transactions created are unique:

  return {
    // ANZ data-transactionId is not a great unique Id
    amount: amount,
    type: getTransactionTypeProperty(t),
    description: t.title?.length > 0 ? t.title : t.details,
    notes: `${t.transactionId}`,
    date: t.date.locale("en_NZ").toDate(),
    externalId: `${t.date.locale("en_NZ").toISOString()}`,
  };
};

export const mapANZRowToFireflyTransaction = (
  t: TransactionRow,
  ac: AccountExportConfig
): TransactionSplitStore => {
  const type = getTransactionTypeProperty(t);

  const baseFireflyTransaction = getBaseFields(t);

  switch (type) {
    case "deposit":
      baseFireflyTransaction.destinationName = ac.fireflyAccountName;
      baseFireflyTransaction.sourceName = t.title;
      break;
    case "withdrawal":
    case "transfer":
      baseFireflyTransaction.destinationName = t.title;
      baseFireflyTransaction.sourceName = ac.fireflyAccountName;
      break;
  }

  return baseFireflyTransaction;
};
