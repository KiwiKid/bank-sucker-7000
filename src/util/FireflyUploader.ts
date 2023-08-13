import { GetRowsMode, TransactionRow } from "./ElementFinder";
import { mapANZRowToFireflyTransaction } from "./mapANZRowToFireflyTransaction";
import { AccountExportConfig, FireflyConfig } from "./userConfig";
import {
  Configuration,
  TransactionsApi,
  TransactionStore,
} from "firefly-iii-typescript-sdk-fetch";

interface UploadResult {
  type: "success" | "failure" | "duplicate";
  row: HTMLElement;
  message?: string;
  sent: TransactionStore;
  got: any;
}

export class FireflyUploader {
  accessToken: string;
  baseUrl: string;
  private transactionsApi: TransactionsApi;
  private accountConfig: AccountExportConfig;

  constructor(config: FireflyConfig, accountConfig: AccountExportConfig) {
    this.accessToken = config.token;
    this.baseUrl = config.address;
    this.accountConfig = accountConfig;
    this.transactionsApi = new TransactionsApi(
      new Configuration({
        basePath: this.baseUrl,
        accessToken: `Bearer ${this.accessToken}`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/vnd.api+json",
        },
        fetchApi: self.fetch.bind(self),
      })
    );
  }

  async uploadTransaction(
    row: TransactionRow,
    mode: GetRowsMode
  ): Promise<UploadResult> {
    console.log("uploadTransaction start");
    let transactionData: TransactionStore;
    let apiRes;
    try {
      transactionData = {
        errorIfDuplicateHash: true,
        applyRules: true,
        transactions: [mapANZRowToFireflyTransaction(row, this.accountConfig)],
      };
      if (mode == "dry_run") {
        return {
          type: "success",
          row: row.htmlElement,
          sent: transactionData,
          message: "ITS A DRY RUN - NO API call",
          got: null,
        };
      }

      apiRes = await this.transactionsApi.storeTransaction({
        transactionStore: transactionData,
      });

      console.log(`Upload results: ${JSON.stringify(apiRes, null, 4)}`);

      console.log("uploadTransaction success");
      return {
        type: "success",
        row: row.htmlElement,
        sent: transactionData,
        got: apiRes,
      };
    } catch (error) {
      const detailedError = await error.json();
      //errorMessage += `: ${JSON.stringify(detailedError, null, 4)}`;

      if (detailedError?.message.includes("Duplicate of transaction")) {
        return {
          type: "duplicate",
          row: row.htmlElement,
          sent: transactionData,
          message: detailedError?.message,
          got: {
            apiRes,
            error: detailedError,
          },
        };
      }
      return {
        type: "failure",
        row: row.htmlElement,
        sent: transactionData,
        message: detailedError?.message,
        got: {
          apiRes,
          error: detailedError,
        },
      };
      /* const errorDiv = document.createElement("div");
      errorDiv.innerHTML = `uploadTransaction error ${error.status} ${
        error.statusText
      } <h1>Firefly upload failed</h1> <h3>Sent</h3><textarea>${JSON.stringify(
        transactionData,
        null,
        4
      )}</textarea> <textarea>${JSON.stringify(apiRes, null, 4)}</textarea>`;
      row.htmlElement.appendChild(errorDiv);
      console.error(
        `uploadTransaction error ${error.status} ${error.statusText} ${
          error.data
        } \n\n Tried: \n${
          transactionData
            ? JSON.stringify(transactionData, null, 4)
            : "NO transactionData"
        }`
      );
      return new Error("Failed to Upload"); //error;*/
    }
  }
}
