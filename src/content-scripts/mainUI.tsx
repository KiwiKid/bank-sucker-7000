import '../style/base.css'
import { getANZActionPanel, getANZTransactionTable, getEndDatePicker, getStartDatePicker, getSubmitButton } from "src/util/elementFinder"
import { render, h, Fragment } from 'preact'
import createShadowRoot from "src/util/createShadowRoot"
import { dateFormatter } from 'src/util/dateFormatter';
import Browser from 'webextension-polyfill';

let table: HTMLElement
let actionsPanel: HTMLElement
let btnSubmit:HTMLButtonElement
let startDatePicker:HTMLInputElement
let endDatePicker:HTMLInputElement

let startDate:string  // YYYY-MM-DD
let endDate:string 

async function updateUI() {

    console.log('updateUI entry')

   // if (getANZActionPanel()) return

    console.log('updateUI 2')


    table = getANZTransactionTable()
    actionsPanel = getANZActionPanel()
    btnSubmit = getSubmitButton()
    startDatePicker = getStartDatePicker();
    endDatePicker = getEndDatePicker()

    startDate = dateFormatter(startDatePicker?.value)
    endDate = dateFormatter(endDatePicker?.value)

    console.log('updateUI 3')


    if (actionsPanel) {
        
        table.addEventListener("DOMSubtreeModified", onTableChange)
        //btnSubmit.addEventListener("click", onSubmit)

       // const textareaParentParent = table.parentElement.parentElement
        //textareaParentParent.style.flexDirection = 'column'
       // textareaParentParent.parentElement.style.flexDirection = 'column'
       // textareaParentParent.parentElement.style.gap = '0px'
       // textareaParentParent.parentElement.style.marginBottom = '0.5em'
       console.log('appendChild 1')

        const { 
            shadowRootDiv, 
            shadowRoot
         } = await createShadowRoot('content-scripts/mainUI.css')

         console.log('appendChild 2')

       // shadowRootDiv.classList.add('wcg-toolbar')
        actionsPanel.appendChild(shadowRootDiv)
        console.log('appendChild')
        render(<Fragment><button onClick={() => Browser.runtime.sendMessage({
            type: "get_transactions", options: {
                accountId: 'anz',
                startDate,
                endDate
            }})} class="actual-import">Hello World</button>{!startDate ? startDate : ''}{!endDate ? endDate : ''}
            </Fragment>, shadowRoot)
        console.log('render')
    }else{
        console.error('No action panel? getANZActionPanel')
    }

}
const ACTUAL_ACCCOUNT_ID = ''
/*async function onSubmit(event: MouseEvent | KeyboardEvent) {

    if (event instanceof KeyboardEvent && event.shiftKey && event.key === 'Enter')
        return

    if (event instanceof KeyboardEvent && event.key === 'Enter' && event.isComposing) {
        return
    }

    if ((event.type === "click" || (event instanceof KeyboardEvent && event.key === 'Enter'))) {

        const rows = table.querySelectorAll("div[class*='transaction-row']")


        const response = await 

            console.log(response)

            console.log(response)

      /*    console.log(`GOT: ${rows.length} actual records (for: ${startDate}->${endDate})`)
        console.log(rows)

      const transactionsToSend = Array.from(rows).map((r) => {
            return {
                date: r.getAttribute('data-date'),
                transactionId: r.getAttribute('data-transaction-id'),
                type: r.querySelector('.column-type').textContent.trim(),
                details: r.querySelector('.transaction-detail-summary').textContent.trim(),
                amount: r.querySelector('.column-amount .money').textContent.trim(),
                balance: r.querySelector('.column-balance .money').textContent.trim(),
            }
        })






//:SearchResponse
     /*   

            console.log(response)
    
        if(!response){
            console.error('got no existing budget')
        }

        console.error(`got existing tra ${response.length}`)
    }

}*/



const onTableChange = function (){
    console.log('table changed')
}

console.log("\n\n\n MAIN ANZ UI RAN 0");

const rootEl = getANZTransactionTable();


console.log(`MAIN ANZ UI RAN ${rootEl}\n\n ${rootEl?.innerHTML}`);


console.log('window.onload BEF')


setTimeout(() => {
    console.log('setTimeout updateUI')
    updateUI()
}, 1500)

window.onload = function () {
    console.log('MAIN ANZ UI 1 RAN ONLOAD')
    updateUI()

    try {
        console.log('MAIN ANZ UI RAN ONLOAD - 2 MutationObserver')

        new MutationObserver(() => {
            console.log('MAIN ANZ UI RAN ONLOAD - 3 updateUI()')
            updateUI()
        }).observe(rootEl, { childList: true })
    } catch (e) {
        console.info("WebChatGPT error --> Could not update UI:\n", e.stack)
    }
}

document.addEventListener("onload", () => {
    console.log('onload');
})

document.addEventListener("DOMContentLoaded", () => {
    console.log('DOMContentLoaded');
})
console.log(window.onload)

console.log('window.onload AFT')