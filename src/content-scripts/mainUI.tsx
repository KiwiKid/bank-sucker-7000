import '../style/base.css'
import { render, h, Fragment } from 'preact'
import createShadowRoot from "src/util/createShadowRoot"
import Browser from 'webextension-polyfill';
import {  SetTransactionsOptions } from './api';
import { mapANZRowToFireflyTransaction } from 'src/util/mapANZRowToFireflyTransaction';
import {  AccountConfig, getAccountConfig, getFireflyConfig } from 'src/util/userConfig';
import SettingsConfig from 'src/components/SettingsConfig';
import { ElementFinder, SelectorSet, getAccountStatusElement } from 'src/util/ElementFinder';
import { update } from 'lodash-es';

//let btnSubmit:HTMLButtonElement
let manifest_version:string
const importButton = document.createElement('button');
//let topMenuBar:HTMLElement
let importButtonContainer:HTMLElement
// The name of the account retrieved from the page, used to get account specific config
let accountName:string;
let accountConfig:AccountConfig|null

//et accountStatusElement:HTMLElement;

let elementFinder:ElementFinder;

async function contentLoaded (){
    console.log('contentLoaded')
}

console.log('WOAH\n\nWOAH\n\nWOAH\n\nWOAH\n\nWOAH\n\n')
// create an observer instance
let timer;
const observer = new MutationObserver((mutationsList, observer) => {
    if (timer) clearTimeout(timer);
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            for(const addedNodeRaw of mutation.addedNodes) {

                    if(addedNodeRaw.nodeType == 1){
                        const addedNode = addedNodeRaw as HTMLElement
                        //console.log(addedNode)

                        if(addedNode?.classList && addedNode?.classList.contains('MuiBox-root')
                        || addedNode?.classList.contains('responsiveheight')
                        || addedNode.innerText.startsWith('$') && addedNode?.classList.contains('MuiTypography-root') && addedNode.classList.contains('MuiTypography-h3')
                        || addedNode?.classList && addedNode?.classList.contains('transactions-list')
                        ){
                            debounce(updateUI());
                        }
                    }
            }
        }
    }
})

// start observing the target node for mutations
observer.observe(document.body, { childList: true, subtree: true });

const getSelectorSet = ():SelectorSet => {
    if(window.location.origin.includes('anz.co.nz')){
        return {
            accountName: "h1[class='account-name-heading'] span[class='account-name']",
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
            accountName: "p span[class*='MuiTypography-subtitle1']",
            rows: "tr[class*='MuiTableRow-root']",
            date: "table tr th div div",
            title: 'table tr th subtitle2',
  //          type: ".column-type",
            details: '.table tr th subtitle2',
            crAmount: 'table tr:first-child td:nth-child(2)'
        }
    }
}

function debounce(callback) {
    let timerId;
    return function() {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        callback.apply(this);
      });
    };
  }

async function updateUI() {


    if(getAccountStatusElement()) return

    console.log('updateUI')
    elementFinder = new ElementFinder(getSelectorSet());
    

    const errors = []
    const accountNameEl = elementFinder.getAccountNameOnPage();

    importButtonContainer = document.createElement('div');

    // Set the style for the div element
    importButtonContainer.style.position = 'fixed';
    importButtonContainer.style.right = '5%';
    importButtonContainer.style.top = '30%';
    importButtonContainer.style.height = '30rem';
    importButtonContainer.style.width = '10rem';
    importButtonContainer.style.transform = 'translate(-50%, -50%)';


    if(!accountNameEl) {
        errors.push('Could not get account name')
    } else {
        accountName = accountNameEl.textContent.trim();

        
        accountConfig = await getAccountConfig(accountName)
        manifest_version = Browser.runtime.getManifest().version

    // topMenuBar = getTopMenuBar();

    // table = getANZTransactionTable()
        //loadMoreContainer = getLoadMoreContainer()
        //btnSubmit = getSubmitButton()
     //   const startDate = elementFinder.getStartDate()
     ///   const endDate = elementFinder.getEndDate()

    //2023-04-09T15:30:00Z


        
     //   if(!startDate){
     //       errors.push('Could not get start date')
     //   }

     //   if(!endDate){
     //       errors.push('Could not get end date')
     //   }


        
        // table.addEventListener("DOMSubtreeModified", onTableChange)
            //btnSubmit.addEventListener("click", onSubmit)

        // const textareaParentParent = table.parentElement.parentElement
            //textareaParentParent.style.flexDirection = 'column'
        // textareaParentParent.parentElement.style.flexDirection = 'column'
        // textareaParentParent.parentElement.style.gap = '0px'
        // textareaParentParent.parentElement.style.marginBottom = '0.5em'



        // Create the button element
        importButton.type = 'submit';
        importButton.textContent = 'Import';
        importButton.onclick = onSubmit;
        // Add some basic CSS styles to the button
        importButton.style.padding = '10px 20px';
        importButton.style.zIndex = '9999999';
        importButton.style.border = 'none';
        importButton.style.backgroundColor = '#007bff';
        importButton.style.color = 'white';
        importButton.style.fontSize = '1.2rem';
        importButton.style.cursor = 'pointer';
        importButtonContainer.appendChild(importButton)

        // Double check we haven't already rendered
        //if(!getAccountStatusElement()) document.body.appendChild(importButtonContainer)

       // document.body.style.backgroundColor = 'blue'
        
    }

    const { 
        shadowRootDiv, 
        shadowRoot
        } = await createShadowRoot('content-scripts/mainUI.css')

    // Double check we haven't already rendered
 //   const alreadyRendered = getAccountStatusElement()
   // if(!alreadyRendered) { 

 //   }

    render(<Fragment>
        {/*} <ImportButton onClick={onSubmit} />          */}  
        {errors.map((e) => <div key={e} className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">{e}</div>)}
        {<SettingsConfig />}
        {}
        </Fragment>, shadowRoot)

    document.body.appendChild(shadowRootDiv)
    document.body.appendChild(importButtonContainer)
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