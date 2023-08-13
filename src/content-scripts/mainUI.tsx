import { ElementFinder, GetRowsMode } from "src/util/ElementFinder";
import "../style/base.css";
import { render, h, Fragment } from "preact";
import createShadowRoot from "src/util/createShadowRoot";
import { dateFormatter } from "src/util/dateFormatter";

import SettingsConfig from "src/components/SettingsConfig";
import Rows from "src/util/Rows";

let table: HTMLElement;
let actionsPanel: HTMLElement;
let btnSubmit: HTMLButtonElement;
let startDatePicker: HTMLInputElement;
let endDatePicker: HTMLInputElement;

let finder: ElementFinder;
let rows;

async function getRows(mode: GetRowsMode) {
  try {
    return await finder.getRows(mode);
  } catch (e) {
    console.error("COULD NOT GET ROWS", e);
  }
}

async function updateUI() {
  try {
    console.log("updateUI entry");

    // if (getANZActionPanel()) return

    console.log("updateUI 2");

    // TODO: fix this for other websites
    finder = new ElementFinder();
    await finder.setSelectorSet();

    actionsPanel = finder.getAddImportButtonLocation();
    if (!actionsPanel) {
      return;
    }

    startDatePicker = finder.getStartDatePicker();
    endDatePicker = finder.getEndDatePicker();

    if (!endDatePicker || !startDatePicker) {
      const button = finder.getFilterTransactionsButton();
      // "button.transactions-filter-panel-toggle"
      // );
      if (button) button.click();

      startDatePicker = finder.getStartDatePicker();
      endDatePicker = finder.getEndDatePicker();
    }

    table = finder.getTransactionTable();
    actionsPanel = finder.getAddImportButtonLocation();
    btnSubmit = finder.getFilterTransactionsButton();

    console.log("updateUI 3");

    // table.addEventListener("DOMSubtreeModified", onTableChange);
    //btnSubmit.addEventListener("click", onSubmit)

    // const textareaParentParent = table.parentElement.parentElement
    //textareaParentParent.style.flexDirection = 'column'
    // textareaParentParent.parentElement.style.flexDirection = 'column'
    // textareaParentParent.parentElement.style.gap = '0px'
    // textareaParentParent.parentElement.style.marginBottom = '0.5em'
    console.log("appendChild 1");

    const { shadowRootDiv, shadowRoot } = await createShadowRoot(
      "content-scripts/mainUI.css"
    );

    console.log("appendChild 2");

    if (!actionsPanel) {
      console.error("actionsPanel failed, adding to body");
      actionsPanel = document.querySelectorAll("div")[0];
      actionsPanel.prepend(shadowRootDiv);
    } else {
      actionsPanel.appendChild(shadowRootDiv);
    }
    finder.addRowButtons();

    // shadowRootDiv.classList.add('wcg-toolbar')

    console.log("appendChild");

    render(
      <Fragment>
        <button onClick={async () => await getRows("dry_run")} class="import">
          Scan Rows
        </button>
        <button onClick={async () => await getRows("upload")} class="import">
          Upload Rows
        </button>
        <Rows rows={rows} />
        <button onClick={onSubmit} class="import">
          Submit
        </button>
        <SettingsConfig />
      </Fragment>,
      shadowRoot
    );
    //document.body.appendChild(p);
    console.log("render");
  } catch (e: any) {
    const errors = finder._printAllChecks();
    console.error("Failed to update UI, rendering error", {
      e,
    });
    render(
      <Fragment>
        Error Occured
        <SettingsConfig />
        <pre>
          Error:{" "}
          {JSON.stringify({ message: e.message, stack: e.stack }, undefined, 4)}
        </pre>
        <pre>{JSON.stringify(errors, null, 4)}</pre>
      </Fragment>,
      finder.getAddImportButtonLocation()
    );
  }
}
async function onSubmit(event: MouseEvent) {
  console.log("onSubmit");
  console.log(event.type);

  /* if (event instanceof KeyboardEvent && event.shiftKey && event.key === 'Enter')
        return

    if (event instanceof KeyboardEvent && event.key === 'Enter' && event.isComposing) {
        return
    }*/

  // Simulate a click event on the button

  if (!endDatePicker?.value) {
    console.error("no endDatePicker.value");
  }

  if (!startDatePicker?.value) {
    console.error("no startDatePicker.value");
  }

  if (event.type === "click" && startDatePicker && endDatePicker) {
    console.log("onSubmit - click check");
    // const rows = table.querySelectorAll("div[class*='transaction-row']")

    const startDate = dateFormatter(startDatePicker.value);
    const endDate = dateFormatter(endDatePicker.value);
    console.log("onSubmit - post date");
    /* const res = await Browser.runtime.sendMessage({
            type: "get_transactions",
            dateTo: startDate,
            dateFrom: endDate
        })*/

    //  console.log('RESULTS')
    //  console.log(res)
    //  updateUserConfig({
    //      fireflyAccessToken: "[insert token and uncomment this line]"
    //  })

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

        console.log(response)*/

    //:SearchResponse
    /*     const response = await Browser.runtime.sendMessage({
            type: "get_transactions", options: {
                accountId: 'anz',
                startDate,
                endDate
            }})

            console.log(response)
    
        if(!response){
            console.error('got no existing budget')
        }

        console.error(`got existing tra ${response.length}`)*/
  }
}
/*
const onTableChange = function () {
  console.log("table changed");
};*/

setTimeout(() => {
  console.log("setTimeout updateUI");
  updateUI();
}, 1500);

window.onload = function () {
  console.log("MAIN ANZ UI 1 RAN ONLOAD");
  updateUI();

  try {
    console.log("MAIN ANZ UI RAN ONLOAD - 2 MutationObserver");

    const picker = new ElementFinder();
    picker.setSelectorSet().then(() => {
      picker._printAllChecks();
      const rootEl = picker.getTransactionTable();

      new MutationObserver(() => {
        console.log("MAIN ANZ UI RAN ONLOAD - 3 updateUI()");
        updateUI();
      }).observe(rootEl, { childList: true });
    });
  } catch (e) {
    console.info("error --> Could not update UI:\n", e.stack);
  }
};

document.addEventListener("onload", () => {
  console.log("onload");
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");
});
console.log(window.onload);

console.log("window.onload AFT");
