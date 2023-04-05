import { Readability } from "@mozilla/readability"
import { parseHTML } from "linkedom"
import Browser from "webextension-polyfill"
import { SearchResult } from "./ddg_search"
import { getUserConfig } from "src/util/userConfig"
import { updateUserConfig } from "src/util/userConfig"

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

export async function getTransactions(accountId:string, dateFrom:string, dateTo:string): Promise<Transaction[]>{
    let response: Response
    const params = new URLSearchParams({
        page: "1"
        , start: dateFrom
        , end: dateTo
    })
    const baseUrl = 'http://192.168.1.5:4575';
    const endpoint = `/api/v1/transactions?${params.toString()}`;

    const config = await getUserConfig()

    let accessToken:string;
    if(!config || !config.fireflyToken || config?.fireflyToken == 'set-this-token-in-browser-storage'){
       // await updateUserConfig({fireflyToken: ''})
        console.log('No firefly API Token in browser storage/config')
    }else{
        accessToken = config.fireflyToken;
    }

    try {
        response = await fetch(baseUrl + endpoint, {
            headers: {
                'Content-Type': 'application/vnd.api+json',
                Authorization: `Bearer ${accessToken}`
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

export async function apiExtractText(url: string): Promise<SearchResult[]> {
    const response = await Browser.runtime.sendMessage({
        type: "get_webpage_text",
        url
    })

    return [response]
}