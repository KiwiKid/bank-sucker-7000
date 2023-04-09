export function getTextArea(): HTMLTextAreaElement {
    return document.querySelector('textarea')
}

export function getFooter(): HTMLDivElement {
    return document.querySelector("div[class*='absolute bottom-0']")
}

export function getRootElement(): HTMLDivElement {
    return document.querySelector('div[id="__next"]')
}

export function getWebChatGPTToolbar(): HTMLElement {
    return document.querySelector("div[class*='wcg-toolbar']")
}

export function getTopMenuBar():HTMLElement {
    return document.querySelector("div[id='main-menu']")
}

export function getANZTransactionTable():HTMLElement {
    return document.querySelector("div[class*='transactions-list']") 
}


export interface ANZRow {
    date:Date
    transactionId:string
    type:string
    title:string
    details:string
    depositAmount?:string, 
    creditAmount?:string
    currency:string
}
export function getANZRows():ANZRow[] {
    const rows = document.querySelectorAll("div[class*='transaction-row']");
    if (!rows || rows.length === 0) {
        throw new Error('No transaction rows found');
    }

    const res = Array.from(rows).map((row) => {
        const dateText = row.getAttribute('data-date');
        if (typeof dateText === 'undefined' || dateText === null) {
            throw new Error('Transaction row missing date attribute');
        }

        const date = new Date(dateText);
        if (isNaN(date.getTime())) {
            throw new Error('Transaction row has invalid date attribute');
        }

        const transactionId = row.getAttribute('data-transaction-id');
        if (typeof transactionId === 'undefined' || transactionId === null) {
            throw new Error('Transaction row missing transaction ID attribute');
        }

        const typeEl = row.querySelector('.column-type');
        if (!typeEl) {
            throw new Error('Transaction row missing type element');
        }
        const type = typeEl.textContent.trim();

        const titleEl = row.querySelector('.transaction-detail-link');
        if (!titleEl) {
            throw new Error('Transaction missing titleEl element');
        }
        const title = titleEl.textContent.trim();
        
        const detailsSummaryEl = row.querySelector('.transaction-detail-summary');
        if(!detailsSummaryEl){
            throw new Error('Transaction missing details element');
        }
        const details = detailsSummaryEl.textContent.trim();


        const drAmountEl = row.querySelector('.column-dr .money');
        const creditAmountEl = row.querySelector('.column-cr .money');
        if (!drAmountEl && !creditAmountEl) {
            throw new Error('Transaction row missing amount element');
        }

        const creditAmount = drAmountEl?.textContent?.trim().replace('$', '').replace(',','');
        const depositAmount = creditAmountEl?.textContent?.trim().replace('$', '').replace(',','');

        return { date, transactionId, type, title, details, depositAmount, creditAmount, currency: 'NZD' };
    });

    return res;
}
export function getANZActionPanel():HTMLUListElement {
    return document.querySelector("div[class*='transactions-action-panels']")
}

// make this get called when the table updates and render the button (i.e. render when table updates)
export function getLoadMoreContainer():HTMLElement {
    return document.querySelector("div[class*='load-more-container']")
}
export function getAccountNameOnPage():HTMLElement{
    return document.querySelector("h1[class='account-name-heading']").querySelector("span[class='account-name']")
}

export function getSubmitButton():HTMLButtonElement {
    return document.querySelector("button[class*='actual-import']")
}

export function getStartDatePicker():HTMLInputElement {
    return document.querySelector("input[class*='date-range-start-date']")
}


export function getANZAccountStatus():HTMLSpanElement {
    return document.querySelector("span[id='firefly-status'")
}

export function getEndDatePicker():HTMLInputElement {
    return document.querySelector("input[class*='date-range-end-date']")
}


export function getSpecificTransactionRow(transactionId:string):HTMLElement{
    return document.querySelector(`div[data-transaction-id="${transactionId}"]`)
}


//export function getRootANZElement():HTMLElement {
//    return document.querySelector("div[class*='container-main']")/
//}

/*export function getSubmitButton(): HTMLButtonElement {
    const textarea = getTextArea()
    if (!textarea) {
        return null
    }
    return textarea.parentNode.querySelector("button")
}*/
