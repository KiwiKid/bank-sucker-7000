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
type siblingRowField = 'transactionDate'

export interface SelectorSet {
    accountName: string
    table:string
    rowPreProcessClick?: string
    isOnSiblingRowField:siblingRowField[]
    tableRows: string
    transactionDate: string
    datePickerStart: string
    datePickerEnd: string
    rootElm: string
    details: string
    title: string
    importButtonLocation: string
    filterTransactionButton: string
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
    hasNoWebsite: boolean

    async setSelectorSet(overrideSet?: SelectorSet): Promise<void> {
        console.log('setSelectorSet')
        const config = await getUserConfig();

        // TODO: make this dynamic
        const thisConfig = config.firefly.accountExportConfig.filter(
            (aec):boolean => { 
                if(aec.website == undefined){
                    this.hasNoWebsite = true
                    return true;
                }else if(aec.website == "anz"){
                    return true;
                }
                
                return false
            })


        if (!thisConfig || thisConfig.length == 0) {
            console.log('NO CONFIG')

            console.error(thisConfig)
        } else {
            console.log(`setSelectorSet SET ${overrideSet ? 'WITH OVERRIDE' : ''}`)

            this.selectorSet = overrideSet ? overrideSet : thisConfig[0].selectors;
            console.log(this.selectorSet)
        }
    }

    _printAllChecks(): string[] {
        
        //console.info(`SELECTOR SET: ${JSON.stringify(selectorSet, null, 4)}`)
        const errorMessages: string[] = [];
    
        const element = this.getAddImportButtonLocation()
        if (!element) {
            errorMessages.push(`NO getAddImportButtonLocation found - check [accountExportConfig.selectors.importButtonLocation: ${this.selectorSet?.importButtonLocation}]`);
        }
    
        if (!this.getAccountNameOnPage()) {
            errorMessages.push(`NO getAccountNameOnPage - check "accountName" in the selectors [accountExportConfig.selectors.accountName: ${this.selectorSet?.accountName}]`);
        }
    
        if (!this.getTransactionDate()) {
            errorMessages.push(`NO getTransactionDate - check "date" in the selectors [accountExportConfig.selectors.transactionDate: ${this.selectorSet?.transactionDate}]`);
        }

        if (!this.getStartDatePicker()) {
            errorMessages.push(`NO getStartDatePicker - check "date" in the selectors [accountExportConfig.selectors.datePickerEnd: ${this.selectorSet?.datePickerEnd}]`);
        }
    
        if (!this.getEndDatePicker()) {
            errorMessages.push(`NO getEndDatePicker - check "date_end" in the selectors [accountExportConfig.selectors.date_end: ${this.selectorSet?.datePickerEnd}]`);
        }
    
        if (!this.getTransactionTable()) {
            errorMessages.push(`NO getTransactionTable - check "table" in the selectors [accountExportConfig.selectors.table: ${this.selectorSet?.table}]`);
        }

        if (!this.hasNoWebsite) {
            errorMessages.push(`NO hasNoWebsite!!! - check "accountExportConfig.website": ${this.selectorSet?.table}]`);
        }

        if(!this.getTransactionTableRows()){
            errorMessages.push(`NO rows - check [accountExportConfig.selectors.tableRows: ${this.selectorSet?.table}]`);
        }
    
        if(errorMessages.length == 0){
            console.log('\n\nALL GOOD TO GOOO\n\n')
        }
    
        return errorMessages;
    }

    getFilterTransactionsButton(): HTMLButtonElement {
        return document.querySelector(this.selectorSet?.filterTransactionButton)
    }

    getAddImportButtonLocation(): HTMLButtonElement {
        return document.querySelector(this?.selectorSet?.importButtonLocation)
    }

    getTransactionTable(): HTMLElement {
        return document.querySelector(this.selectorSet?.table)
    }
    //*[@id="ember1146"]
    getTransactionTableRows(): NodeListOf<HTMLElement> {
        return document.querySelectorAll(this.selectorSet?.tableRows)
    }

    getTransactionDate():HTMLElement {
        return document.querySelector(this.selectorSet?.transactionDate)
    }

    getStartDatePicker(): HTMLInputElement {
        return document.querySelector(this.selectorSet?.datePickerStart)
    }

    getEndDatePicker(): HTMLInputElement {
        return document.querySelector(this.selectorSet?.datePickerEnd)
    }

    getAccountNameOnPage(): HTMLElement {
        return document.querySelector(this.selectorSet?.accountName)
    }

    setElementStatus(element:HTMLElement, success:boolean, message?:string, ){
        if(success){
            element.style.backgroundColor = 'green'
        }else{
            const mess = document.createElement('div')
            mess.textContent = message;
            element.append(mess)
            element.style.backgroundColor = 'red'
        }
    }

    getRows(): TransactionRow[] {

        const rows = this.getTransactionTableRows()
        if (!rows || rows.length === 0) {
            throw new Error('No transaction rows found');
        }

        if(this.selectorSet.rowPreProcessClick){
            rows.forEach((r) => {
            if(this.selectorSet.rowPreProcessClick){
                const clickElement:HTMLElement = r.querySelector(this.selectorSet.rowPreProcessClick);
                clickElement.style.transition = 'none'
                if(clickElement){
                    clickElement.click()
                }else{
                    console.error(`A rowPreProcessClick was configured, but the buttton for: \n\n row.querySelector(${this.selectorSet.rowPreProcessClick})`)
                }
            }
            })
        }

        const res = Array.from(rows).map((row: HTMLElement) => {



                const useSiblingRow = this.selectorSet.isOnSiblingRowField && this.selectorSet.isOnSiblingRowField.includes('transactionDate')
                const getDateRow = useSiblingRow ? row.nextElementSibling : row 
                
                const dateText:HTMLElement = getDateRow.querySelector(this.selectorSet?.transactionDate)
                if (typeof dateText === 'undefined' || dateText === null) {
                    throw new Error(`Transaction row missing date attribute (${this.selectorSet?.transactionDate})`);
                }

                const date = new Date(dateText?.textContent?.trim());
                if (isNaN(date.getTime())) {
                    const message = `Transaction row has invalid date attribute processed (${date}`
                    this.setElementStatus(dateText, false, message)
                    throw new Error(message);
                }else{
                    this.setElementStatus(dateText, true)
                }

            /*  const typeEl = row.querySelector(this.selectorSet?.type);
              if (!typeEl) {
                  throw new Error('Transaction row missing type element');
              }
              const type = typeEl.textContent.trim();*/

            const titleEl:HTMLElement = row.querySelector(this.selectorSet?.title);
            if (!titleEl) {
                this.setElementStatus(titleEl, false)
                throw new Error('Transaction missing titleEl element');
            }else{
                this.setElementStatus(titleEl, true)
                titleEl.style.backgroundColor = 'green'
            }
            

            const title = titleEl.textContent.trim();

            const detailsSummaryEl:HTMLElement = row.querySelector(this.selectorSet?.details);
            if (!detailsSummaryEl) {
                this.setElementStatus(detailsSummaryEl, false)
                throw new Error('Transaction missing details element');
            }else{
                this.setElementStatus(detailsSummaryEl, true)

            }
            const details = detailsSummaryEl.textContent.trim();

            let finalCreditAmount:string;
            let finalDepositAmount:string;
            if (this.selectorSet?.drAmount && this.selectorSet?.crAmount) {
                const drAmountEl:HTMLElement = row.querySelector(this.selectorSet?.drAmount);
                const creditAmountEl:HTMLElement = row.querySelector(this.selectorSet?.crAmount);
                if (!drAmountEl && !creditAmountEl) {
                    throw new Error('Transaction row missing amount element');
                }else{

                }

                finalCreditAmount = creditAmountEl?.textContent?.trim().replace('$', '').replace(',', '');
                finalDepositAmount = drAmountEl?.textContent?.trim().replace('$', '').replace(',', '');
            } else if (this.selectorSet?.crAmount) {
                const creditAmountEl = row.querySelector(this.selectorSet?.crAmount);
                const creditAmount = creditAmountEl?.textContent?.trim().replace('$', '').replace(',', '');

                if (+creditAmount > 0) {
                    finalCreditAmount = creditAmount;
                    finalDepositAmount = '0'
                } else {
                    finalCreditAmount = '0';
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
