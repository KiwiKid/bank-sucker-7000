import { getUserConfig } from "./userConfig"
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);


export interface TransactionRow {
    htmlElement: HTMLElement
    date: Dayjs | Error
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
type SiblingRowField = 'transactionDate'

type RemoveType = '[at]' | '[Processed on]'

export interface DateSelectorSet {
    transactionDateSelector: string,
    dayjsDateParseFormat?:string
    dayjsDateParseRemoveRegex?:RemoveType[]
}

export interface SelectorSet {
    importButtonLocation: string
    accountName: string
    table:string
    rowPreProcessClick?: string
    isOnSiblingRowField:SiblingRowField[]
    tableRows: string
    details: string
    title: string
    date: DateSelectorSet
    fallbackDate: DateSelectorSet
    pageActions:{ 
        datePickerStart: string
        datePickerEnd: string
        filterTransactionButton: string
    }
    rootElm: string
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
       /* if (!element) {
            errorMessages.push(`NO getAddImportButtonLocation found - check [accountExportConfig.selectors.importButtonLocation: ${this.selectorSet?.importButtonLocation}]`);
        }
    
        if (!this.getAccountNameOnPage()) {
            errorMessages.push(`NO getAccountNameOnPage - [accountExportConfig.selectors.accountName: ${this.selectorSet?.accountName}]`);
        }
    
       if (!this.getTransactionDate()) {
            errorMessages.push(`NO getTransactionDate -[accountExportConfig.selectors.transactionDate: ${this.selectorSet?.transactionDate}]`);
        }

        if (!this.getStartDatePicker()) {
            errorMessages.push(`NO getStartDatePicker - [accountExportConfig.selectors.datePickerEnd: ${this.selectorSet?.date.datePickerEnd}]`);
        }
    
        if (!this.getEndDatePicker()) {
            errorMessages.push(`NO getEndDatePicker -[accountExportConfig.selectors.date_end: ${this.selectorSet?.datePickerEnd}]`);
        }
    
        if (!this.getTransactionTable()) {
            errorMessages.push(`NO getTransactionTable -[accountExportConfig.selectors.table: ${this.selectorSet?.table}]`);
        }

        if (!this.hasNoWebsite) {
            errorMessages.push(`NO hasNoWebsite!!! - check "accountExportConfig.website": ${this.selectorSet?.table}]`);
        }

        if(!this.getTransactionTableRows()){
            errorMessages.push(`NO rows - check [accountExportConfig.selectors.tableRows: ${this.selectorSet?.table}]`);
        }
    
        if(errorMessages.length == 0){
            console.log('\n\nALL GOOD TO GOOO\n\n')
        }*/
    
        return errorMessages;
    }

    getFilterTransactionsButton(): HTMLButtonElement {
        return document.querySelector(this.selectorSet?.pageActions?.filterTransactionButton)
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
        return document.querySelector(this.selectorSet?.date.transactionDateSelector)
    }

    getStartDatePicker(): HTMLInputElement {
        return document.querySelector(this.selectorSet?.pageActions?.datePickerStart)
    }

    getEndDatePicker(): HTMLInputElement {
        return document.querySelector(this.selectorSet?.pageActions?.datePickerEnd)
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

    useSiblingRowIfConfigured(fieldName:SiblingRowField, row:HTMLElement){
        if(this.selectorSet.isOnSiblingRowField.includes(fieldName)){
            return row.nextElementSibling
        }

        return row;
    }

    parseDateFromRow(row:HTMLElement, dateSelector:DateSelectorSet): Error | Dayjs {
        const dateText:HTMLElement = this.useSiblingRowIfConfigured('transactionDate', row).querySelector(dateSelector.transactionDateSelector)

        const dateFormat = dateSelector.dayjsDateParseFormat ?? 'ddd D MMM YYYY h:mm a';
        let dateToProcess = dateText?.textContent?.trim()

        if(!dateToProcess){
            return new Error(`No date text found to process for:\n\n\t${dateSelector.transactionDateSelector}`)
        }
        dateSelector.dayjsDateParseRemoveRegex.forEach((rr) => {
            switch(rr){
                case '[at]':
                    dateToProcess = dateToProcess.replace(/ at /g, ' ')
                case '[Processed on]':
                dateToProcess = dateToProcess.replace(/Processed on /g, ' ')
                default:
            }
        })
        
        const date = dayjs(dateToProcess, { format: dateFormat});
        if (!date.isValid()) {
            const message = `Date could not be processed\n (Before:${dateText?.textContent} --> \nAfter: ${dateToProcess} --> \n  [${dateFormat}] \nAdjust the date format (selectorSet.dayjsDateParseFormat) and (optionally) replace characters before parse \nCurrent:${dateSelector.transactionDateSelector}`
            this.setElementStatus(dateText, false, message)
            return new Error(message);
        }else{
            this.setElementStatus(dateText, true)
            return date;
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
            const dateOrError = this.selectorSet.date ? this.parseDateFromRow(row, this.selectorSet.date) : new Error("No this.selectorSet.date configured")
            if('message' in dateOrError){
                console.error(`Error parsing date: ${dateOrError.message}\n\n${dateOrError.stack}`)
                if(this.selectorSet.fallbackDate){
                    console.error(`Error parsing date: ${dateOrError.message}\n\n${dateOrError.stack}`)

                    this.parseDateFromRow(row, this.selectorSet.fallbackDate)
                }else{
                    console.error(`Error parsing date: ${dateOrError.message}\n\n${dateOrError.stack}\n\nTry setting a selectorSet.fallbackDate`)
                }
            }else {
                console.log(`good date - ${dateOrError.toISOString()}`)
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
                , transactionId: `via bank-sucker-7000_${title?.length > 0 ? title : details}_${finalDepositAmount?.length > 0 ? `${finalDepositAmount}_` : '' ?? ''}${finalCreditAmount?.length > 0 ? `${finalCreditAmount}_` : ''}${'message' in dateOrError ? `${dateOrError.message} \n${dateOrError.stack}` : dateOrError.toISOString().slice(0, 10)}`
                , date: dateOrError
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
