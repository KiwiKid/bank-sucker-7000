import { getUserConfig } from "./userConfig"

export interface TransactionRow {
    htmlElement: HTMLElement
    date: Date
    /**
     * This field can be used to ensure fields aren't duplicates (will be inserted as 'node')
     */
    transactionId: string
    title: string
    details: string
    depositAmount?: string,
    creditAmount?: string
    currency: string
}

export interface AccountName {
    name: string,
}

export interface SelectorSet {
    accountName: string
    table: string
    date: string
    date_end: string
    rootElm: string
    details: string
    title: string
    import_button_location: string
    filter_transaction_button: string
    /**
     * Populate if deposits and withdraws are two seperate values (this is deposits)
     */
    drAmount?: string
    crAmount: string
}

export interface DateInput {
    date: Date
    htmlElement: HTMLElement
}

export const getAccountStatusElement = (): HTMLElement => {
    return document.querySelector("div[id='firefly-status']")
}

export class ElementFinder {
    selectorSet: SelectorSet | null

    async setSelectorSet(overrideSet?: SelectorSet): Promise<void> {

        const config = await getUserConfig();

        const thisConfig = config.firefly.accountExportConfig.filter(
            (aec) => aec.website == "anz"
        )

        if (!thisConfig || thisConfig.length == 0) {
            console.error(thisConfig)
        } else {
            this.selectorSet = overrideSet ? overrideSet : thisConfig[0].selectors;
        }
    }

    _printAllChecks(): void {
        if (this.getStartDatePicker()) {
            console.log('getStartDatePicker')
        } else {
            console.error('NO getStartDatePicker - check "date_end" in the selectors')
        }

        if (this.getAccountNameOnPage()) {
            console.log('getAccountNameOnPage')
        } else {
            console.error('NO getAccountNameOnPage - check "accountName" in the selectors')
        }


        if (this.getStartDatePicker()) {
            console.log('getStartDatePicker')
        } else {
            console.error('NO getStartDatePicker - check "date" in the selectors')
        }

        if (this.getEndDatePicker()) {
            console.log('getEndDatePicker')
        } else {
            console.error('NO getEndDatePicker - check "date_end" in the selectors')
        }


        if (this.getTransactionTable()) {
            console.log('getTransactionTable')
        } else {
            console.error('NO getTransactionTable - check "table" in the selectors')
        }
    }

    getFilterTransactionsButton(): HTMLButtonElement {
        return document.querySelector(this.selectorSet?.filter_transaction_button)
    }

    getAddImportButtonLocation(): HTMLButtonElement {
        return document.querySelector(this?.selectorSet?.import_button_location || `div[class*='transactions-action-panels']`)
    }
    //*[@id="ember1146"]
    getTransactionTable(): HTMLElement {
        return document.querySelector(this.selectorSet?.table)
    }


    getStartDatePicker(): HTMLInputElement {
        return document.querySelector(this.selectorSet?.date)
    }

    getEndDatePicker(): HTMLInputElement {
        return document.querySelector(this.selectorSet?.date_end)
    }

    getAccountNameOnPage(): HTMLElement {
        return document.querySelector(this.selectorSet?.accountName)
    }

    getRows(): TransactionRow[] {

        const rows = document.querySelectorAll(this.selectorSet?.table);
        if (!rows || rows.length === 0) {
            throw new Error('No transaction rows found');
        }

        const res = Array.from(rows).map((row: HTMLElement) => {
            const dateText = row.querySelector(this.selectorSet?.date)
            if (typeof dateText === 'undefined' || dateText === null) {
                throw new Error(`Transaction row missing date attribute (${this.selectorSet?.date})`);
            }

            const date = new Date(dateText?.textContent?.trim());
            if (isNaN(date.getTime())) {
                throw new Error('Transaction row has invalid date attribute');
            }

            /*  const typeEl = row.querySelector(this.selectorSet?.type);
              if (!typeEl) {
                  throw new Error('Transaction row missing type element');
              }
              const type = typeEl.textContent.trim();*/

            const titleEl = row.querySelector(this.selectorSet?.title);
            if (!titleEl) {
                throw new Error('Transaction missing titleEl element');
            }
            const title = titleEl.textContent.trim();

            const detailsSummaryEl = row.querySelector(this.selectorSet?.details);
            if (!detailsSummaryEl) {
                throw new Error('Transaction missing details element');
            }
            const details = detailsSummaryEl.textContent.trim();

            let finalCreditAmount;
            let finalDepositAmount;
            if (this.selectorSet?.drAmount && this.selectorSet?.crAmount) {
                const drAmountEl = row.querySelector(this.selectorSet?.drAmount);
                const creditAmountEl = row.querySelector(this.selectorSet?.crAmount);
                if (!drAmountEl && !creditAmountEl) {
                    throw new Error('Transaction row missing amount element');
                }

                finalCreditAmount = creditAmountEl?.textContent?.trim().replace('$', '').replace(',', '');
                finalDepositAmount = drAmountEl?.textContent?.trim().replace('$', '').replace(',', '');
            } else if (this.selectorSet?.crAmount) {
                const creditAmountEl = row.querySelector(this.selectorSet?.crAmount);
                const creditAmount = creditAmountEl?.textContent?.trim().replace('$', '').replace(',', '');

                if (+creditAmount > 0) {
                    finalCreditAmount = creditAmount;
                    finalDepositAmount = 0
                } else {
                    finalCreditAmount = 0;
                    finalDepositAmount = creditAmount;
                }
            }

            return {
                htmlElement: row
                , transactionId: `via bank-sucker-7000_${title?.length > 0 ? title : details}_${finalDepositAmount?.length > 0 ? `${finalDepositAmount}_` : '' ?? ''}${finalCreditAmount?.length > 0 ? `${finalCreditAmount}_` : ''}${date.toISOString().slice(0, 10)}`
                , date
                //  , type
                , title
                , details
                , depositAmount: finalDepositAmount
                , creditAmount: finalCreditAmount
                , currency: 'NZD'
            };
        });

        return res;
    }
}
