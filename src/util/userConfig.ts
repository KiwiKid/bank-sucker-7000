import { defaults } from "lodash-es";
import Browser from "webextension-polyfill";
import { getSystemLanguage } from "./localization";
import { SelectorSet, getEmptySelectorSet } from "./ElementFinder";

const defaultConfig: UserConfig = {
  numWebResults: 3,
  webAccess: true,
  region: "wt-wt",
  timePeriod: "",
  language: getSystemLanguage(),
  promptUUID: "default",
  firefly: {
    dry_run: true,
    token: "set-this-token-in-browser-storage",
    address: "http://url+port-to-firefly-no-end-slash",
    accountExportConfig: [
      {
        website: "anz",
        fireflyAccountName: "Anz",
        accountNameOnBankSite: "Main Account",
        selectors: {
          accountName: `h1[class='account-name-heading']").querySelector("span[class='account-name']`,
          table: `div[class*='transactions-list']`,
          date: {
            transactionDateSelector: `input[class*='date-range-start-date']`,
          },
          pageActions: {
            datePickerStart: `input[class*='date-range-start-date']`,
            datePickerEnd: `input[class*='date-range-start-date']`,
            filterTransactionButton: "body",
          },
          importButtonLocation: `body`,
          rootElm: "body",
          details: ``,
          title: ``,
          drAmount: ``,
          crAmount: ``,
          isOnSiblingRowField: [],
          tableRows: "",
          fallbackDate: undefined,
        },
      } /*,
            {
                website: 'simplicity',
                accountNameOnBankSite: 'KiwiSaver Growth Fund',
                fireflyAccountName: 'Simplicity Investment - Growth',
            }*/,
    ],
  },
};

export type UserConfig = {
  numWebResults: number;
  webAccess: boolean;
  region: string;
  timePeriod: string;
  language: string;
  promptUUID: string;
  firefly: FireflyConfig;
};

export type FireflyConfig = {
  dry_run: boolean;
  token: string;
  address: string;
  accountExportConfig: AccountExportConfig[];
};

export type SupportedWebsites = "anz" | "simplicity";

export type AccountExportConfig = {
  website: SupportedWebsites;
  fireflyAccountName: string;
  accountNameOnBankSite: string;
  selectors: SelectorSet;
};

export function isValidUserConfig(obj: any): string[] {
  const errors: string[] = [];

  // Check if the main object and the firefly object are not undefined or null
  if (!obj) errors.push("Main object is undefined or null.");
  if (!obj.firefly) errors.push("Firefly object is undefined or null.");

  // Check if accountExportConfig is an array and has at least one item
  if (!Array.isArray(obj.firefly.accountExportConfig)) {
    errors.push("accountExportConfig is not an array.");
  } else if (obj.firefly.accountExportConfig.length === 0) {
    errors.push("accountExportConfig is empty.");
  } else {
    for (const account of obj.firefly.accountExportConfig) {
      // Check required fields in each account object
      if (typeof account.website !== "string" || !account.website)
        errors.push("Account website is invalid.");
      if (
        typeof account.fireflyAccountName !== "string" ||
        !account.fireflyAccountName
      )
        errors.push("Firefly account name is invalid.");
      if (
        typeof account.accountNameOnBankSite !== "string" ||
        !account.accountNameOnBankSite
      )
        errors.push("Account name on bank site is invalid.");

      // Check selectors
      if (!account.selectors) {
        errors.push("Selectors are missing in account.");
      } else {
        for (const selector in account.selectors) {
          if (typeof account.selectors[selector] !== "string") {
            errors.push(`Selector ${selector} is not a string.`);
          }
        }
      }
    }
  }

  return errors;
}

export async function getUserConfig(): Promise<UserConfig> {
  const config = await Browser.storage.sync.get("BANK_IMPORTER_7000");
  return defaults(config, defaultConfig);
}
/*
export async function getSpecificAccountConfig(
  accountName: string
): Promise<AccountExportConfig> {
  const fireflyConfig = await getFireflyConfig();

  if (!fireflyConfig.accountExportConfig) {
    console.error("Could not find matching account");
  }
  const currentAccount = fireflyConfig?.accountExportConfig?.filter(
    (ac) => ac.accountNameOnBankSite === accountName
  );
  if (currentAccount?.length > 0) {
    return {
      fireflyConfig,
      accountConfig: currentAccount[0],
    };
  }
  console.error(`could not find matching account for ${accountName}
    (checked ${
      fireflyConfig?.accountExportConfig?.length > 0
        ? fireflyConfig?.accountExportConfig
            ?.map((aec) => `${aec.accountNameOnBankSite}`)
            .join()
        : "none in config"
    })`);
}*/

export async function getFireflyConfig(
  accountName: string
): Promise<FireflyConfig> {
  const config = await getUserConfig();
  if (
    !config ||
    !config.firefly?.token ||
    config.firefly?.token == "set-this-token-in-browser-storage"
  ) {
    console.log("No firefly API Token in browser storage/config");
  }

  const currentAccount = config.firefly?.accountExportConfig?.filter(
    (ac) => ac.accountNameOnBankSite === accountName
  );
  if (currentAccount?.length > 0) {
    return {
      ...config.firefly,
      accountExportConfig: [currentAccount[0]],
    };
  }
  console.error(`could not find matching account for ${accountName}
    (checked ${
      config.firefly?.accountExportConfig?.length > 0
        ? config.firefly?.accountExportConfig
            ?.map((aec) => `${aec.accountNameOnBankSite}`)
            .join()
        : "none in config"
    })`);

  return config.firefly;
}

export async function updateUserConfig(
  config: Partial<UserConfig>
): Promise<void> {
  await Browser.storage.sync.set({ BANK_IMPORTER_7000: config });
}

export async function addNewAccountExportConfig(
  website: SupportedWebsites,
  accountNameOnPage: string
): Promise<void> {
  const existing: UserConfig = await Browser.storage.sync
    .get("BANK_IMPORTER_7000")
    .then((res) => res["BANK_IMPORTER_7000"]);
  existing.firefly.accountExportConfig.push({
    website: website,
    accountNameOnBankSite: accountNameOnPage,
    fireflyAccountName: "REPLACE_WITH_ACCOUNT_NAME_IN_FIREFLY",
    selectors: getEmptySelectorSet(),
  });
  await Browser.storage.sync.set(existing);
}
