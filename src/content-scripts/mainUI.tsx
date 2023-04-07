import '../style/base.css'
import { getANZActionPanel, getANZRows, getANZTransactionTable, getAccountNameOnPage, getEndDatePicker, getStartDatePicker, getSubmitButton } from "src/util/elementFinder"
import { render, h, Fragment } from 'preact'
import createShadowRoot from "src/util/createShadowRoot"
import { dateFormatter } from 'src/util/dateFormatter';
import Browser from 'webextension-polyfill';
import { GetTransactionsOptions, SetTransactionsOptions, getTransactionTypeProperty } from './api';
import { mapANZRowToFireflyTransaction } from 'src/util/mapANZRowToFireflyTransaction';
import { AccountConfig, getAccountConfig } from 'src/util/userConfig';

let table: HTMLElement
let actionsPanel: HTMLElement
let btnSubmit:HTMLButtonElement
let startDatePicker:HTMLInputElement
let endDatePicker:HTMLInputElement
let manifest_version:string
let startDate:Date  // YYYY-MM-DD
let endDate:Date 

// The name of the account retrieved from the page, used to get account specific config
let accountName:string


let existingTransactions:unknown[]

async function updateUI() {

    const errors = []
   // if (getANZActionPanel()) return

    const accountNameEl = getAccountNameOnPage();
    accountName = accountNameEl.textContent.trim();
    console.log('accountName')
    console.log(accountName)
    console.log(accountNameEl)
    const accountConfig = await getAccountConfig(accountName)
    manifest_version = Browser.runtime.getManifest().version

    table = getANZTransactionTable()
    actionsPanel = getANZActionPanel()
    btnSubmit = getSubmitButton()
    startDatePicker = getStartDatePicker();
    endDatePicker = getEndDatePicker()

    startDate = new Date(startDatePicker?.value)
    endDate = new Date(endDatePicker?.value)

    if(!startDate){
        errors.push('Could not get start date')
    }

    if(!endDate){
        errors.push('Could not get end date')
    }

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
            <button onClick={onSubmit} class="actual-import">Hello World(Account:{JSON.stringify(accountConfig, undefined, 4)} {errors.join(',')})</button>{!startDate ? startDate : ''}{!endDate ? endDate : ''}
            </Fragment>, shadowRoot)
        console.log('render')
    }else{
        console.error('No action panel? getANZActionPanel')
    }

}
async function onSubmit(event){
    if (event.type === "click") {
        const accountConfig = await getAccountConfig(accountName)
        
      /*  const getOptions:GetTransactionsOptions = {
            accountName,
            listOptions: {
                page: 1,
                start: startDate,
                end: endDate,
            }
        }

       existingTransactions = await Browser.runtime.sendMessage({
        type: "get_transactions", options: getOptions})
*/

        const rows = getANZRows();

        const transactionsToSend = Array.from(rows)
        console.log(`${transactionsToSend.length} to upload)`)

        const eventToFire:SetTransactionsOptions = {
            transactions: transactionsToSend.map((t) => mapANZRowToFireflyTransaction(t, accountConfig, manifest_version))
        }
        
        const res = await Browser.runtime.sendMessage("set_transactions", {
            type: "set_transactions", 
            options: eventToFire
        }).then((res) => {
            onTransactionUploaded(res)
        })
            


        console.log('\n\nMAIN UI RES:')
        console.log(res)
    }
}

const onTableChange = function (){
    console.log('table changed')
}

const onTransactionUploaded = function (transactionInfo){
    console.log('transactionInfo confimed uploaded')
    console.log(transactionInfo)
}

setTimeout(() => {
    updateUI()
    try {
        const rootEl = getANZTransactionTable();

        if(!rootEl){
            console.info('No Table found, no update')
            return;
        }

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