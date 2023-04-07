import '../style/base.css'
import { getANZActionPanel, getANZRows, getANZTransactionTable, getEndDatePicker, getStartDatePicker, getSubmitButton } from "src/util/elementFinder"
import { render, h, Fragment } from 'preact'
import createShadowRoot from "src/util/createShadowRoot"
import { dateFormatter } from 'src/util/dateFormatter';
import Browser from 'webextension-polyfill';
import { SetTransactionsOptions, getTransactionTypeProperty } from './api';
import { mapANZRowToFireflyTransaction } from 'src/util/mapANZRowToFireflyTransaction';

let table: HTMLElement
let actionsPanel: HTMLElement
let btnSubmit:HTMLButtonElement
let startDatePicker:HTMLInputElement
let endDatePicker:HTMLInputElement

let startDate:string  // YYYY-MM-DD
let endDate:string 


let existingTransactions:unknown[]

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

        render(<Fragment>
            <button onClick={onSubmit} class="actual-import">Hello World</button>{!startDate ? startDate : ''}{!endDate ? endDate : ''}
            </Fragment>, shadowRoot)
        console.log('render')
    }else{
        console.error('No action panel? getANZActionPanel')
    }

}

async function onSubmit(event){
    if (event.type === "click") {
        
       existingTransactions = await Browser.runtime.sendMessage({
        type: "get_transactions", options: {
            accountId: 'anz',
            startDate,
            endDate
        }})

        const rows = getANZRows();

        const transactionsToSend = Array.from(rows)
        console.log(`${transactionsToSend.length} to upload (${existingTransactions.length} existing)`)

        const event:SetTransactionsOptions = {
            transactions: [transactionsToSend.map(mapANZRowToFireflyTransaction)[0]]
        }
        
        await Browser.runtime.sendMessage({
            type: "set_transactions", options: event})
    }
}

const onTableChange = function (){
    console.log('table changed')
}

setTimeout(() => {
    updateUI()
    try {
        const rootEl = getANZTransactionTable();

        new MutationObserver(() => {
            console.log('MAIN ANZ UI RAN ONLOAD - MutationObserver:updateUI()')
            updateUI()
        }).observe(rootEl, { childList: true })
    } catch (e) {
        console.info("error --> Could not update UI:\n", e.stack)
        console.error(e)
    }
}, 1500)
/*
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
        console.info("error --> Could not update UI:\n", e.stack)
    }
}
*/
document.addEventListener("onload", () => {
    console.log('onload');
})

document.addEventListener("DOMContentLoaded", () => {
    console.log('DOMContentLoaded');
})
console.log(window.onload)

console.log('window.onload AFT')