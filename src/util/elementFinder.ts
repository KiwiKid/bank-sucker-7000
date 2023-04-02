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

export function getANZTransactionTable():HTMLElement {
    return document.querySelector("div[class*='transactions-list']") 
}

export function getANZActionPanel():HTMLUListElement {
    return document.querySelector("ul[class*='transactions-action-links']")
}

export function getSubmitButton():HTMLButtonElement {
    return document.querySelector('button')
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
