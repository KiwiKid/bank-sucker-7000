import { getTransactionTypeProperty } from "src/content-scripts/api";
import { TransactionSplitStore } from "firefly-iii-typescript-sdk-fetch";
import { AccountExportConfig } from "./userConfig";
import { TransactionRow } from "./ElementFinder";

const getBaseFields = (t: TransactionRow): TransactionSplitStore => {
  const isWithdrawal = t.depositAmount?.length > 0;
  const amount = isWithdrawal ? t.depositAmount : t.creditAmount;
  // Ensure transactions created are unique:

  const title = t.title?.length > 0 ? t.title : t.details;
  return {
    // ANZ data-transactionId is not a great unique Id
    amount: amount,
    type: getTransactionTypeProperty(t),
    description: title,
    notes: `${t.transactionId}${t.details ? ` - ${t.details}` : ""}`,
    date: new Date(t.date.locale("en_NZ").format()),
    externalId: `${title}_${t.date.format()}`,
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
