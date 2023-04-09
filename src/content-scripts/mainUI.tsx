import '../style/base.css'
import { getANZAccountStatus, getANZActionPanel, getANZTransactionTable, getAccountNameOnPage, getEndDatePicker, getLoadMoreContainer, getSpecificTransactionRow, getStartDatePicker, getSubmitButton, getTopMenuBar } from "src/util/elementFinder"
import { render, h, Fragment } from 'preact'
import createShadowRoot from "src/util/createShadowRoot"
import { dateFormatter } from 'src/util/dateFormatter';
import Browser from 'webextension-polyfill';
import { GetTransactionsOptions, SetTransactionsOptions } from './api';
import { mapANZRowToFireflyTransaction } from 'src/util/mapANZRowToFireflyTransaction';
import {  getAccountConfig } from 'src/util/userConfig';
import ImportButton from 'src/components/ImportButton';
import SettingsConfig from 'src/components/SettingsConfig';
import ElementFinder, { SelectorSet } from 'src/util/anzElementFinder';

let table: HTMLElement
//let btnSubmit:HTMLButtonElement
let startDatePicker:HTMLInputElement
let endDatePicker:HTMLInputElement
let manifest_version:string
let startDate:Date  // YYYY-MM-DD
let endDate:Date 
const importButton = document.createElement('button');
let topMenuBar:HTMLElement
let importButtonContainer:HTMLElement
// The name of the account retrieved from the page, used to get account specific config
let accountName:string

let accountStatusElement:HTMLElement;

let elementFinder:ElementFinder;

async function contentLoaded (){
    console.log('contentLoaded')
}

const targetNode = document.body;

// create an observer instance
const observer = new MutationObserver((mutationsList, observer) => {
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            for(const addedNode of mutation.addedNodes) {
            //    console.log(addedNode)
                if (addedNode?.classList && addedNode?.classList.contains('transactions-list')) {
                    updateUI()
                }
            }
        }
    }
});

// start observing the target node for mutations
observer.observe(targetNode, { childList: true, subtree: true });

const getSelectorSet = ():SelectorSet => {
    if(window.location.origin.includes('anz.co.nz')){
        return {
            accountName: ["h1[class='account-name-heading']", "span[class='account-name']"],
            rows: "div[class*='transaction-row']",
            title: '.transaction-detail-link',
            date: "div[class*='column-postdate']",
            details: '.transaction-detail-summary',
            drAmount: '.column-dr .money',
            crAmount: '.column-cr .money'
        }
    }

    if(window.location.origin.includes('app.simplicity.kiwi')){
        return {
            accountName: ["div[class='MuiBox-root']", "span[class='MuiTypography-subtitle1']"],
            rows: "tr[class*='MuiTableRow-root']",
            date: "table tr th div div",
            title: 'table tr th subtitle2',
  //          type: ".column-type",
            details: '.table tr th subtitle2',
            crAmount: 'table tr:first-child td:nth-child(2)'
        }
    }
}


async function updateUI() {



    elementFinder = new ElementFinder(getSelectorSet());

    const errors = []
    const accountNameEl = elementFinder.getAccountNameOnPage();
    accountName = accountNameEl.textContent.trim();
    const accountConfig = await getAccountConfig(accountName)
    manifest_version = Browser.runtime.getManifest().version

    topMenuBar = getTopMenuBar();

    table = getANZTransactionTable()
    //loadMoreContainer = getLoadMoreContainer()
    //btnSubmit = getSubmitButton()
    startDatePicker = getStartDatePicker();
    endDatePicker = getEndDatePicker()

    startDate = new Date(Date.parse(`${startDatePicker?.value?.replace('/', '-')}T00:00:00Z`)) //2023-04-09T15:30:00Z
    endDate = new Date(Date.parse(`${endDatePicker?.value?.replace('/', '-')}T00:00:00Z`)) //2023-04-09T15:30:00Z


    
    if(!startDate){
        errors.push('Could not get start date')
    }

    if(!endDate){
        errors.push('Could not get end date')
    }

    console.log('updateUI 3')


       
       // table.addEventListener("DOMSubtreeModified", onTableChange)
        //btnSubmit.addEventListener("click", onSubmit)

       // const textareaParentParent = table.parentElement.parentElement
        //textareaParentParent.style.flexDirection = 'column'
       // textareaParentParent.parentElement.style.flexDirection = 'column'
       // textareaParentParent.parentElement.style.gap = '0px'
       // textareaParentParent.parentElement.style.marginBottom = '0.5em'

       importButtonContainer = document.createElement('div');

        // Set the style for the div element
        importButtonContainer.style.position = 'fixed';
        importButtonContainer.style.left = '5%';
        importButtonContainer.style.top = '20%';
        importButtonContainer.style.height = '30rem';
        importButtonContainer.style.width = '10rem';
        importButtonContainer.style.transform = 'translate(-50%, -50%)';

        // Create the button element
        importButton.type = 'submit';
        importButton.textContent = 'Import';
        importButton.onclick = onSubmit;
        // Add some basic CSS styles to the button
        importButton.style.padding = '10px 20px';
        importButton.style.border = 'none';
        importButton.style.backgroundColor = '#007bff';
        importButton.style.color = 'white';
        importButton.style.fontSize = '1.2rem';
        importButton.style.cursor = 'pointer';
        importButtonContainer.appendChild(importButton)

        document.body.appendChild(importButtonContainer)

        accountStatusElement = getANZAccountStatus() ?? document.createElement('span');
        if(!accountConfig){
            accountStatusElement.textContent = '\u2717 (No firefly config)';
        }else{
            accountStatusElement.textContent = '\u2713';
            // append the tick element to an existing element with id "my-element"
        }
        
        accountStatusElement.id = 'firefly-status'
        const hasStatusOnPage = getANZAccountStatus()
        if(!hasStatusOnPage){
            accountNameEl.parentElement.appendChild(accountStatusElement);
        }
        

        const { 
            shadowRootDiv, 
            shadowRoot
         } = await createShadowRoot('content-scripts/mainUI.css')

         console.log('appendChild 2')

       // shadowRootDiv.classList.add('wcg-toolbar')
       importButtonContainer.appendChild(shadowRootDiv)
        console.log('appendChild')

        render(<Fragment>
           {/*} <ImportButton onClick={onSubmit} />          */}  
            {<SettingsConfig />}
            </Fragment>, shadowRoot)
        console.log('render')

}
async function onSubmit(event){
    if (event.type === "click") {
        importButton.style.backgroundColor = 'gray'
        const config = await getAccountConfig(accountName)
        
        const rows = elementFinder.getRows()

        const transactionsToSend = Array.from(rows)
        console.log(`${transactionsToSend.length} to upload)`)

        transactionsToSend.map((t) => ({
            orginalRow: t,
               tToSend: mapANZRowToFireflyTransaction(t, config, manifest_version)
        })).forEach((t) => {
            const updatedRow = t.orginalRow.htmlElement
            updatedRow.style.backgroundColor = '#bffcc0'
            const eventToFire:SetTransactionsOptions = {
                transaction: t.tToSend,
                dry_run: config.fireflyConfig.dry_run
            }
            Browser.runtime.sendMessage({
                type: "set_transactions", 
                options: eventToFire
            }).then((res) => {
                
                if(res.status === 'uploaded'){
                    updatedRow.style.backgroundColor = '#b8e7ff'
                    const uploadedElement = document.createElement("div");
                    uploadedElement.textContent = res.status;
                    updatedRow.appendChild(uploadedElement)

                }else if(res.status == 'existing'){
                    updatedRow.style.backgroundColor = '#ffd2ab'

                    const existingElement = document.createElement("div");
                    existingElement.textContent = `${res.message}`;
                    //existingElement.style.color = "orange";
                    updatedRow.appendChild(existingElement)
                }else{
                    const errorElement = document.createElement('div');
                    errorElement.textContent = `${res?.status} - ${res?.message}`;
                    updatedRow.appendChild(errorElement);
                    updatedRow.style.backgroundColor = ' #ff957e'
                }
                

            }).catch((err) => {
                console.error(`\n\nMAIN UI RES - error`)
                console.log(err)
                console.log(eventToFire)
            }).finally(() => {
                importButton.style.backgroundColor = '#007bff';
            })
        })
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