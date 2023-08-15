import { ElementFinder, GetRowsMode } from "src/util/ElementFinder";
import "../style/base.css";
import { render, h, Fragment } from "preact";
import createShadowRoot from "src/util/createShadowRoot";
import { dateFormatter } from "src/util/dateFormatter";

import SettingsConfig from "src/components/SettingsConfig";
import Rows from "src/util/Rows";
import {
  AccountExportConfig,
  SupportedWebsites,
  addNewAccountExportConfig,
  getUserConfig,
} from "src/util/userConfig";

let table: HTMLElement;
let actionsPanel: HTMLElement;
let btnSubmit: HTMLButtonElement;
let startDatePicker: HTMLInputElement;
let endDatePicker: HTMLInputElement;

let finder: ElementFinder;
let rows;

async function getRows(mode: GetRowsMode) {
  try {
    rows = await finder.getRows(mode);
    return rows;
  } catch (e) {
    console.error("COULD NOT GET ROWS", e);
  }
}

async function updateUI(): Promise<boolean> {
  try {
    console.log("updateUI entry");

    // if (getANZActionPanel()) return

    console.log("updateUI 2");

    // TODO: fix this for other websites

    const websiteName = getWebsite();
    const accountNameOnPage = getAccountNameFromPage(websiteName);

    if (!accountNameOnPage) {
      console.info("No account name on page");
      return false;
    }
    const specificConfig = await getSpecificConfig({
      website: websiteName,
      accountName: accountNameOnPage.name,
    });

    if ("message" in specificConfig) {
      console.error(specificConfig.message);
      return false;
    }

    finder = new ElementFinder(specificConfig);
    if (!finder.isWebsiteAccountValid || finder?.errors.length > 0) {
      console.error("Early exit, no account name on page");
      return false;
    }
    await finder.setSelectorSet();

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
    btnSubmit = finder.getFilterTransactionsButton();

    if (table) {
      console.log("table");
      table.addEventListener("DOMSubtreeModified", onTableChange);
    } else {
      console.error("No table found");
    }
    //btnSubmit.addEventListener("click", onSubmit)

    // const textareaParentParent = table.parentElement.parentElement
    //textareaParentParent.style.flexDirection = 'column'
    // textareaParentParent.parentElement.style.flexDirection = 'column'
    // textareaParentParent.parentElement.style.gap = '0px'
    // textareaParentParent.parentElement.style.marginBottom = '0.5em'
    const { shadowRootDiv, shadowRoot } = await createShadowRoot(
      "content-scripts/mainUI.css"
    );

    shadowRootDiv.classList.add("ui-toolbar");
    shadowRootDiv.style.position = "fixed";
    shadowRootDiv.style.backgroundColor = "gray";
    shadowRootDiv.style.top = "0";
    shadowRootDiv.style.right = "0";
    shadowRootDiv.style.zIndex = "1000";
    shadowRootDiv.style.padding = "10px";

    const existingUI = document.querySelectorAll("[class*='ui-toolbar']");
    if (existingUI.length > 0) {
      console.log("existing found");
      existingUI.forEach((eiu) => eiu.remove());
    } else {
      console.log("none found");
    }

    if (!actionsPanel) {
      console.error("actionsPanel FAILED, adding to body");
      actionsPanel = document.querySelector("body");
      actionsPanel.parentElement.prepend(shadowRootDiv);
    } else {
      console.error("actionsPanel ADDED");
      actionsPanel.appendChild(shadowRootDiv);
    }

    if (finder.getTransactionTableRows()) {
      finder.addRowButtons();
      rows = finder.getRows("dry_run");
    }

    console.log("appendChild");

    render(
      <div class="ui-toolbar">
        <div>
          {finder.website}/{finder.accountExportConfig?.accountNameOnBankSite}
        </div>
        <button onClick={async () => await getRows("dry_run")} class="import">
          Scan Rows
        </button>
        <button onClick={async () => await getRows("upload")} class="import">
          Upload Rows
        </button>
        {rows && rows.length > 0 ? (
          <Rows rows={rows} />
        ) : (
          <div>
            {specificConfig.selectors?.tableRows && (
              <div>
                Try running:{" "}
                <textarea>
                  document.querySelectorAll("
                  {specificConfig.selectors?.tableRows}")
                </textarea>
              </div>
            )}
            {!specificConfig.selectors?.tableRows && (
              <div>set tableRows [{specificConfig.selectors?.tableRows}]</div>
            )}
          </div>
        )}
        <button onClick={onSubmit} class="import">
          Submit
        </button>
        <SettingsConfig />
      </div>,
      shadowRoot
    );
    //document.body.appendChild(p);
    console.log("render");
    return true;
  } catch (e: any) {
    //const errors = finder._printAllChecks();
    console.error("Failed to update UI, rendering error", {
      e,
    });
    render(
      <Fragment>
        Error Occured - {e.message} <pre>{e.stack}</pre>
        <SettingsConfig />
        <pre>Error: {JSON.stringify(e, undefined, 4)}</pre>
      </Fragment>,
      document.body
    );
    return false;
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

const onTableChange = function () {
  console.log("table changed");
};

type GetSpecificParams = {
  accountName: string;
  website: SupportedWebsites;
};
export const getSpecificConfig = async ({
  accountName,
  website,
}: GetSpecificParams): Promise<AccountExportConfig | Error> => {
  const config = await getUserConfig();

  if (!config) {
    console.error("No config configured");
    return;
  }

  if (!website) {
    console.error("No website configured");
    return;
  }

  if (!accountName) {
    console.error("No accountName configured");
    return;
  }

  return config.firefly.accountExportConfig.find((aec): boolean => {
    if (aec.website == website && aec.accountNameOnBankSite == accountName) {
      console.log(
        `FOUND CONFIG match ${aec.website}${aec.accountNameOnBankSite}`
      );
      return true;
    } else if (website == undefined || accountName == undefined) {
      console.error(`hasNoWebsite ${website} or account name ${accountName}`);
      return false;
    }
    console.error(
      `has website, but no account name matching: ${accountName} [Options: ${config.firefly.accountExportConfig
        .map((aec) => aec.accountNameOnBankSite)
        .join(",")}]`
    );
    return false;
  });
};

export const getWebsite = (): SupportedWebsites | null => {
  const host = window.location.host;
  if (host.includes("anz.co.nz")) {
    return "anz";
  } else if (host.includes("simplicity.")) {
    return "simplicity";
  }
  return null;
};

type AccountRes = {
  elm: HTMLElement;
  name: string;
};

export const getAccountNameFromPage = (
  website: SupportedWebsites
): AccountRes | null => {
  switch (website) {
    case "anz": {
      const accountNameNode: HTMLElement = document.querySelector(
        "span[class='account-name']"
      );
      if (!accountNameNode) {
        return null;
      }
      return {
        elm: accountNameNode,
        name: accountNameNode?.textContent,
      };
    }
    case "simplicity": {
      throw new Error("Not implimented yet");
    }
  }
};
/*
setTimeout(() => {
  console.log("setTimeout updateUI");
  const websiteName = getWebsite();
  const accountNameOnPage = getAccountNameFromPage(websiteName);
  updateUI(websiteName, accountNameOnPage);
}, 1500);*/
/*
const bootstrapUI = async () => {
  console.log("MAIN ANZ UI 1 RAN ONLOAD");
  try {
    console.log("MAIN ANZ UI RAN ONLOAD - 2 MutationObserver");

    const websiteName = getWebsite();
    const accountNameOnPage = getAccountNameFromPage(websiteName);

    if (!accountNameOnPage) {
      console.info("No account name on page");
      return;
    }
    const specificConfig = await getSpecificConfig({
      website: websiteName,
      accountName: accountNameOnPage.name,
    });

    if (!specificConfig) {
      console.error(
        `Failed to get any config object for ${websiteName}/${accountNameOnPage.name}`
      );
      return;
    }

    if ("message" in specificConfig) {
      console.error(specificConfig?.message || "Failed to get config");
      return;
    }

    const picker = new ElementFinder(specificConfig);
    picker.setSelectorSet().then(() => {
      picker._printAllChecks();
      const rootEl = picker.getTransactionTable();
      
      const observer2 = new MutationObserver(async () => {
        console.log("MAIN ANZ UI RAN ONLOAD - 3 updateUI()");
        const websiteName = getWebsite();
        const accountNameOnPage = getAccountNameFromPage(websiteName);
        if (accountNameOnPage) {
          updateUI();
        } else {
          //change
          const res = prompt(
            `Could not find matching account name on page (${accountNameOnPage}). Enter it below to start the account setup:`
          );

          //const res = prompt(`What is the name of this account in firefly?`);
          if (res) {
            addNewAccountExportConfig(websiteName, res);
            if (res) observer2.disconnect();
          }
        }
      })
      
      //observer2.observe(rootEl, { childList: true });
    });
  } catch (e) {
    console.info("error --> Could not update UI:\n", e.stack);
  }
};*/
/*
window.addEventListener("onload", () => {
  bootstrapUI();
});*/

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");
});
//console.log(window.onload);

console.log("window.onload AFT");
// window.onload = bootstrapUI;

const bootstrap = async () => {
  console.log("observer");
  const websiteName = getWebsite(); // Assuming you have a method called `getWebsite` which returns the website name
  const accountNameOnPage = getAccountNameFromPage(websiteName);

  if (accountNameOnPage && accountNameOnPage.elm) {
    console.log("accountNameOnPage && accountNameOnPage.elm TRUE");
    // Do whatever you want here with the account name
    const res = await updateUI();

    // If you only want this to run once, disconnect the observer after it's found
    if (res) observer.disconnect();
  } else {
    console.log("accountNameOnPage && accountNameOnPage.elm FALSE");
  }
};

const observer = new MutationObserver(bootstrap);

window.addEventListener("locationchange", () => {
  bootstrap();
});

// Start observing the entire document for changes in child nodes
observer.observe(document, { childList: true, subtree: true });
