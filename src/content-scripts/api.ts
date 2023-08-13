import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import Browser from "webextension-polyfill";
import { SearchResult } from "./ddg_search";
import { getFireflyConfig } from "src/util/userConfig";
import {
  ListTransactionRequest,
  AccountsApi,
  Configuration,
  TransactionsApi,
  TransactionRead,
  TransactionSplitStore,
  TransactionTypeProperty,
} from "firefly-iii-typescript-sdk-fetch";
import { TransactionRow } from "src/util/ElementFinder";

const cleanText = (text: string) =>
  text
    .trim()
    .replace(/(\n){4,}/g, "\n\n\n")
    // .replace(/\n\n/g, " ")
    .replace(/ {3,}/g, "  ")
    .replace(/\t/g, "")
    .replace(/\n+(\s*\n)*/g, "\n");

export async function getWebpageTitleAndText(
  url: string,
  html_str = ""
): Promise<SearchResult> {
  let html = html_str;
  if (!html) {
    let response: Response;
    try {
      response = await fetch(url.startsWith("http") ? url : `https://${url}`);
    } catch (e) {
      return {
        title: "Could not fetch the page.",
        body: `Could not fetch the page: ${e}.\nMake sure the URL is correct.`,
        url,
      };
    }
    if (!response.ok) {
      return {
        title: "Could not fetch the page.",
        body: `Could not fetch the page: ${response.status} ${response.statusText}`,
        url,
      };
    }
    html = await response.text();
  }

  const doc = parseHTML(html).document;
  const parsed = new Readability(doc).parse();

  if (!parsed) {
    return { title: "Could not parse the page.", body: "", url };
  }

  const text = cleanText(parsed.textContent);
  return { title: parsed.title, body: text, url };
}

export interface Transaction {
  id: string;
  amount: number;
}

interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

interface Links {
  self: string;
  first: string;
  last: string;
}

interface ApiResponse {
  data: any[];
  meta: {
    pagination: Pagination;
  };
  links: Links;
}

export interface GetTransactionsOptions {
  accountName: string;
  listOptions: ListTransactionRequest;
}

export function getTransactionTypeProperty(
  transaction: TransactionRow
): TransactionTypeProperty {
  if (transaction.creditAmount?.length > 0) {
    return "deposit" as TransactionTypeProperty;
  }
  return "withdrawal" as TransactionTypeProperty;

  /*Withdrawal = "withdrawal",
    Deposit = "deposit",
    Transfer = "transfer",
    Reconciliation = "reconciliation",
    OpeningBalance = "opening balance"*/
}

export interface SetTransactionsOptions {
  transaction: TransactionSplitStore;
  dry_run: boolean;
  /*{
         * YYYY-MM-DD
        date:string // '2023-04-07',
        description:string // 'Example transaction',
        amount:number // 10.00,
        currency:'NZD' // 'USD',
        source_name: 'Example source',
        destination_name: 'Example destination',
        asset_id: 1
      }[]*/
}

export async function getTransactions({
  listOptions,
}: GetTransactionsOptions): Promise<TransactionRead[]> {
  const config = await getFireflyConfig();

  console.log("IN API:");
  console.log(listOptions);

  const existingTransactions = new TransactionsApi(
    new Configuration({
      basePath: config.address,
      accessToken: `Bearer ${config.token}`,
      headers: {
        "Content-Type": "application/json",
        accept: "application/vnd.api+json",
      },
      fetchApi: self.fetch.bind(self),
    })
  )
    .listTransaction(listOptions)
    .then((res) => {
      console.log(res.data);

      return res.data;
    });

  return existingTransactions; /*


    try {
        response = await fetch(config.address + endpoint, {
            headers: {
                'Content-Type': 'application/vnd.api+json',
                Authorization: `Bearer ${config.token}`
            }
        }).catch((err) => {
            console.error(err)
            throw new Error('error failed to get transactions')
        })
    } catch (e) {
        console.error(e)
        return []
    }
    if (!response.ok) {
        console.error('Response not ok', { response })
        return []
    }
    const transactions:ApiResponse = await response.json()

    return transactions.data;*/
}

export async function getAccounts() {
  const config = await getFireflyConfig();
  return new AccountsApi(
    new Configuration({
      basePath: config.address,
      accessToken: `Bearer ${config.token}`,
      headers: {
        "Content-Type": "application/json",
        accept: "application/vnd.api+json",
      },
      fetchApi: self.fetch.bind(self),
    })
  )
    .listAccount({})
    .then((r: any) => {
      console.log(JSON.stringify(r));
      return r;
    });
}

enum TransResult {
  Failed2 = "failed-2",
  Failed3 = "failed-3",
  Failed4 = "failed-4",
  Failed5 = "failed-5",
  ConnectionError = "ConnectionError",
  Existing = "existing",
  Uploaded = "uploaded",
  AuthFailure = "auth-failure",
}
interface TransactionResults {
  transaction: TransactionSplitStore;
  status: TransResult;
  message?: string;
}

export async function setTransaction(
  options: SetTransactionsOptions
): Promise<TransactionResults> {
  const config = await getFireflyConfig();

  if (options.dry_run) {
    console.log("DRY_RUN");
    console.log(options.transaction);
    return;
  }
  console.log(options.transaction);
  try {
    return new TransactionsApi(
      new Configuration({
        basePath: config.address,
        accessToken: `Bearer ${config.token}`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/vnd.api+json",
        },
        fetchApi: self.fetch.bind(self),
      })
    )
      .storeTransaction({
        transactionStore: {
          transactions: [options.transaction],
          errorIfDuplicateHash: true,
          applyRules: true,
          fireWebhooks: true,
          groupTitle: null,
        },
      })
      .then(() => {
        //    console.log('RES IN API:')
        //     console.log(options.transaction)
        return {
          transaction: options.transaction,
          status: TransResult.Uploaded,
        };
      })
      .catch(async (errRes) => {
        if (errRes.message != null) {
          return {
            transaction: options.transaction,
            status: TransResult.ConnectionError,
            message: errRes?.message ?? "Failed to store transaction",
          };
        }
        const errorBody = await errRes.json().catch((err) => {
          return {
            status: 500,
            message: err,
          };
        });

        if (errRes?.status === 422) {
          console.log("errorBodyerrorBodyerrorBodyerrorBodyerrorBody");
          console.log(errorBody);
          if (errorBody?.message?.startsWith("Duplicate of transaction")) {
            /*const response = await Browser.runtime.sendMessage({
                                    type: "get_webpage_text",
                                    options: {url: 'url'}
                                })*/
            /*browser.tabs.query({active: true, currentWindow: true}).then((tabs:unknown) => {
                                    browser.tabs.sendMessage(tabs[0].id, "set_transaction_imported", {}).then((res) => console.log(res))
                                })*/

            //               console.info('Duplicate found')
            //               console.info(options.transaction)
            return {
              transaction: options.transaction,
              status: TransResult.Existing,
              message: JSON.stringify(errorBody?.errors),
            };
          } else if (typeof errorBody?.message !== "undefined") {
            console.log("Failed 3");
            console.error(errorBody);
            return {
              transaction: options.transaction,
              status: TransResult.Failed3,
              message: errorBody?.message ?? "Failed to store transaction",
            };
          }
          console.log("Failed 4");
          console.error(errorBody);
          return {
            transaction: options.transaction,
            status: TransResult.Failed4,
            message: errorBody?.message ?? "Failed to store transaction",
          };
        }
        if (errRes.statusText == "Unauthorized") {
          return {
            transaction: options.transaction,
            status: TransResult.AuthFailure,
            message: `${errRes?.status} - Could not authenticate, check firefly token config`,
          };
        }
        return {
          transaction: options.transaction,
          status: TransResult.Failed5,
          message: `${errRes?.status} - ${errRes?.statusText}`,
        };
      });
  } catch (err) {
    console.error("SetTransaction outer catch", err);
  }
  /*console.log(`\n\n\n\n\saveAttemptssaveAttemptssaveAttemptssaveAttemptsn\n\n\n\n`)
    saveAttempts.forEach((result:any) => {
        if (result.status === "fulfilled") {
          console.log("Transaction saved:");
          console.log(result)
        } else {
          console.log("Transaction save failed:", result.reason);
        }
        console.log(result)
      });

      const res2 = saveAttempts.filter((s) => s.status === 'fulfilled').map((sa:PromiseFulfilledResult<TransactionSingle|void>) => {
        console.log('IN API: ')
        console.log(sa)
        return sa
      })*/

  /*
        .listAccount({})
        .then((r: any) => {
            console.log(JSON.stringify(r))
            return r;
        });*/
}

export async function apiExtractText(url: string): Promise<SearchResult[]> {
  const response = await Browser.runtime.sendMessage({
    type: "get_webpage_text",
    url,
  });

  return [response];
}
