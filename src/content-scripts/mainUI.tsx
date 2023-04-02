import '../style/base.css'
import { getANZActionPanel, getANZTransactionTable } from "src/util/elementFinder"
import { render, h } from 'preact'
import createShadowRoot from "src/util/createShadowRoot"

let table: HTMLElement
let actionsPanel: HTMLElement

async function updateUI() {

    console.log('updateUI entry')

   // if (getANZActionPanel()) return

    console.log('updateUI 2')


    table = getANZTransactionTable()
    actionsPanel = getANZActionPanel()

    console.log('updateUI 3')


    if (actionsPanel) {

        console.log('updateUI')

        table.addEventListener("DOMSubtreeModified", onTableChange)
        //btnSubmit.addEventListener("click", onUpload)

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
        render(<button>Hello World</button>, shadowRoot)
        console.log('render')
    }else{
        console.error('No action panel? getANZActionPanel')
    }

}

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