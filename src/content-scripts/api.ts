import { Readability } from "@mozilla/readability"
import { parseHTML } from "linkedom"
import Browser from "webextension-polyfill"
import { SearchResult } from "./ddg_search"
import { getFireflyConfig } from "src/util/userConfig"
import { AccountsApi, Configuration, TransactionsApi, TransactionStore, TransactionSplitStore, TransactionTypeProperty } from 'firefly-iii-typescript-sdk-fetch'
import { ANZRow } from "src/util/elementFinder"

const cleanText = (text: string) =>
    text.trim()
        .replace(/(\n){4,}/g, "\n\n\n")
        // .replace(/\n\n/g, " ")
        .replace(/ {3,}/g, "  ")
        .replace(/\t/g, "")
        .replace(/\n+(\s*\n)*/g, "\n")

export async function getWebpageTitleAndText(url: string, html_str = ''): Promise<SearchResult> {

    let html = html_str
    if (!html) {
        let response: Response
        try {
            response = await fetch(url.startsWith('http') ? url : `https://${url}`)
        } catch (e) {
            return {
                title: 'Could not fetch the page.',
                body: `Could not fetch the page: ${e}.\nMake sure the URL is correct.`,
                url
            }
        }
        if (!response.ok) {
            return {
                title: "Could not fetch the page.",
                body: `Could not fetch the page: ${response.status} ${response.statusText}`,
                url
            }
        }
        html = await response.text()

    }


    const doc = parseHTML(html).document
    const parsed = new Readability(doc).parse()

    if (!parsed) {
        return { title: "Could not parse the page.", body: "", url }
    }

    const text = cleanText(parsed.textContent)
    return { title: parsed.title, body: text, url }
}


export interface Transaction {
    id:string
    amount:number
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

  interface GetTransactionsOptions {
    accountId: string,
    /**
     * YYYY-MM-DD
     */
    dateFrom:string,
    /**
     * YYYY-MM-DD
     */
    dateTo:string 
}

export function getTransactionTypeProperty (transaction:ANZRow):TransactionTypeProperty {
    if(transaction.creditAmount?.length > 0){
        return 'withdrawal' as TransactionTypeProperty
    }
    return 'deposit' as TransactionTypeProperty

    /*Withdrawal = "withdrawal",
    Deposit = "deposit",
    Transfer = "transfer",
    Reconciliation = "reconciliation",
    OpeningBalance = "opening balance"*/
}

export interface SetTransactionsOptions {
    transactions:TransactionSplitStore[] 
    
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

export async function getTransactions({accountId, dateFrom, dateTo}:GetTransactionsOptions): Promise<Transaction[]>{
    let response: Response
    const params = new URLSearchParams({
        page: "1"
        , start: dateFrom
        , end: dateTo
    })
    const endpoint = `/api/v1/transactions?${params.toString()}`;

    const config = await getFireflyConfig()

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

    return transactions.data;
}


export async function getAccounts(){
    const config = await getFireflyConfig()
    return new AccountsApi(
        new Configuration({
            basePath: config.address,
            accessToken: `Bearer ${config.token}`,
            headers: {
                "Content-Type": "application/json",
                accept: "application/vnd.api+json",
            },
            fetchApi: self.fetch.bind(self),
        }),
        )
        .listAccount({})
        .then((r: any) => {
            console.log(JSON.stringify(r))
            return r;
        });
}

const dry_run = true;
export async function setTransactions(options:SetTransactionsOptions){
    const config = await getFireflyConfig()

    const store:TransactionStore = {
        transactions: options.transactions,
        errorIfDuplicateHash: true,
        applyRules: true, 
        fireWebhooks: true,
        groupTitle: null
    }
    if(dry_run){
        console.log('DRY_RUN')
        console.log(store)
    }
    return new TransactionsApi(
        new Configuration({
            basePath: config.address,
            accessToken: `Bearer ${config.token}`,
            headers: {
                "Content-Type": "application/json",
                accept: "application/vnd.api+json",
            },
            fetchApi: self.fetch.bind(self),
        }),
        ).storeTransaction({
            transactionStore:store
        })

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
        url
    })

    return [response]
}