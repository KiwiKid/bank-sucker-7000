import Browser from "webextension-polyfill";

const manifest_version = Browser.runtime.getManifest().manifest_version;

Browser.runtime.onInstalled.addListener(async () => openChatGPTWebpage());

function openChatGPTWebpage() {
  Browser.tabs.create({
    url: "https://digital.anz.co.nz/preauth/web/service/login",
  });
}

if (manifest_version == 2) {
  Browser.browserAction.onClicked.addListener(openChatGPTWebpage);
  update_origin_for_ddg_in_firefox();
} else {
  Browser.action.onClicked.addListener(openChatGPTWebpage);
}

Browser.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-web-access") {
    Browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0].url.startsWith("https://OFFsecure.anz.co.nz/")) {
        Browser.tabs.sendMessage(tabs[0].id, "toggle-web-access");
      }
    });
  }
});

Browser.runtime.onMessage.addListener((request) => {
  if (request === "show_options") {
    Browser.runtime.openOptionsPage();
  }
});

Browser.runtime.onMessage.addListener(async (message) => {
  /*  console.log('Browser.runtime.onMessage.addListener((message) => ')
      if (message.type === "get_search_results") {
          return getHtml(message.search)
      }
  
      if (message.type === "get_webpage_text") {
          return getWebpageTitleAndText(message.url, message.html)
      }*/

  if (message.type === "get_transactions") {
    console.log(
      "Browser.runtime.onMessage.addListener((message) => get_transactions "
    );
    console.log("OPTIONS PASSED");
    console.log(message.options);
    //return getTransactions(message.options);
  }

  if (message.type === "set_transactions") {
    // return setTransaction(message.options);
    /*.then((trans) => {
            console.error('setTransaction:then-block')

            return Browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                if (tabs[0]?.url?.startsWith("https://secure.anz.co.nz/")) {
                    Browser.tabs.sendMessage(tabs[0].id, { type: "toggle-web-access", res: trans, trans: message.options})
                }else{
                    console.error('Could not send message - no active tab?')
                }
            })
        })*/
  }
});
/*
// Firefox does not support declarativeNetRequest.updateDynamicRules yet
Browser.declarativeNetRequest.updateDynamicRules({
    addRules: [
        {
            id: 1,
            priority: 1,
            action: {
                type: "modifyHeaders",
                requestHeaders: [
                    {  
                        header: "Origin",
                        operation: "set",
                        value: "https://lite.duckduckgo.com"
                    },
                ],
            },

            condition: {
                urlFilter: "https://lite.duckduckgo.com/*",
                resourceTypes: ["xmlhttprequest"],
            },
        },
    ],
    removeRuleIds: [1],
})
*/
function update_origin_for_ddg_in_firefox() {
  Browser.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      for (let i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === "Origin")
          details.requestHeaders[i].value = "https://lite.duckduckgo.com";
      }

      return {
        requestHeaders: details.requestHeaders,
      };
    },
    {
      urls: ["https://lite.duckduckgo.com/*"],
    },
    ["blocking", "requestHeaders"]
  );
}
