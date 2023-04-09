


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



    /*

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
