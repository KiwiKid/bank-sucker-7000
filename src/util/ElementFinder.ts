import {
  AccountExportConfig,
  FireflyConfig,
  SupportedWebsites,
  getUserConfig,
} from "./userConfig";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { FireflyUploader } from "./FireflyUploader";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export type GetRowsMode = "upload" | "dry_run";
export interface TransactionRow {
  htmlElement: HTMLElement;
  date: Dayjs;
  /**
   * This field can be used to ensure fields aren't duplicates (will be inserted as 'node')
   */
  transactionId: string;
  title: string;
  details: string;
  depositAmount?: string;
  creditAmount?: string;
  currency: string;
  error: Error | null;
}

export interface AccountName {
  name: string;
}
type SiblingRowField = "transactionDate";

type RemoveType = "[at]" | "[Processed on]";

export interface Dateselectors {
  transactionDateSelector: string;
  dayjsDateParseFormat?: string;
  dayjsDateParseRemoveBeforeParseRegex?: RemoveType[];
}

export interface SelectorSet {
  importButtonLocation: string;
  accountName: string;
  table: string;
  preProcessClick?: {
    rowPreProcessClick: string;
    rowPreProcessClickDone: string;
  };
  isOnSiblingRowField: SiblingRowField[];
  tableRows: string;
  details: string;
  title: string;
  date: Dateselectors;
  fallbackDate: Dateselectors;
  pageActions: {
    datePickerStart: string;
    datePickerEnd: string;
    filterTransactionButton: string;
  };
  rootElm: string;
  /**
   * Populate if deposits and withdraws are two seperate values (this is deposits)
   */
  drAmount?: string;
  crAmount: string;
}

export interface DateInput {
  date: Date;
  htmlElement: HTMLElement;
}

export const getAccountStatusElement = (): HTMLElement => {
  return document.querySelector("div[id='firefly-status']");
};

export const getEmptySelectorSet = (): SelectorSet => {
  return {
    accountName: "",
    crAmount: "",
    details: "",
    date: {
      transactionDateSelector: "",
      dayjsDateParseFormat: "",
      dayjsDateParseRemoveBeforeParseRegex: ["[at]"],
    },
    fallbackDate: {
      transactionDateSelector: "",
      dayjsDateParseFormat: "",
      dayjsDateParseRemoveBeforeParseRegex: ["[at]"],
    },
    importButtonLocation: "",
    isOnSiblingRowField: ["transactionDate"],
    pageActions: {
      datePickerEnd: "",
      datePickerStart: "",
      filterTransactionButton: "",
    },
    rootElm: "",
    table: "",
    tableRows: "",
    title: "",
    drAmount: "",
  };
};
/*
 */

export class ElementFinder {
  accountExportConfig: AccountExportConfig | null;
  isWebsiteAccountValid: boolean;
  fireflyUploader: FireflyUploader;
  errors: string[];

  website: string;

  constructor(accountExportConfig: AccountExportConfig) {
    this.accountExportConfig = accountExportConfig;
    if (accountExportConfig) {
      this.isWebsiteAccountValid = true;
    } else {
      this.isWebsiteAccountValid = false;
    }
  }

  async setSelectorSet(): Promise<void> {
    console.log("setSelectorSet");
    const config = await getUserConfig();

    this.fireflyUploader = new FireflyUploader(
      config.firefly,
      this.accountExportConfig
    );
  }

  _printAllChecks(): string[] {
    //console.info(`SELECTOR SET: ${JSON.stringify(selectors, null, 4)}`)
    const errorMessages: string[] = [];

    const element = this.getAddImportButtonLocation();
    /* if (!element) {
            errorMessages.push(`NO getAddImportButtonLocation found - check [accountExportConfig.selectors.importButtonLocation: ${this.accountExportConfig.selectors?.importButtonLocation}]`);
        }
    
        if (!this.getAccountNameOnPage()) {
            errorMessages.push(`NO getAccountNameOnPage - [accountExportConfig.selectors.accountName: ${this.accountExportConfig.selectors?.accountName}]`);
        }
    
       if (!this.getTransactionDate()) {
            errorMessages.push(`NO getTransactionDate -[accountExportConfig.selectors.transactionDate: ${this.accountExportConfig.selectors?.transactionDate}]`);
        }

        if (!this.getStartDatePicker()) {
            errorMessages.push(`NO getStartDatePicker - [accountExportConfig.selectors.datePickerEnd: ${this.accountExportConfig.selectors?.date.datePickerEnd}]`);
        }
    
        if (!this.getEndDatePicker()) {
            errorMessages.push(`NO getEndDatePicker -[accountExportConfig.selectors.date_end: ${this.accountExportConfig.selectors?.datePickerEnd}]`);
        }
    
        if (!this.getTransactionTable()) {
            errorMessages.push(`NO getTransactionTable -[accountExportConfig.selectors.table: ${this.accountExportConfig.selectors?.table}]`);
        }

        if (!this.hasNoWebsite) {
            errorMessages.push(`NO hasNoWebsite!!! - check "accountExportConfig.website": ${this.accountExportConfig.selectors?.table}]`);
        }


    
        if(errorMessages.length == 0){
            console.log('\n\nALL GOOD TO GOOO\n\n')
        }*/

    if (!this.getTransactionTableRows()) {
      errorMessages.push(
        `NO rows - check [accountExportConfig.selectors.tableRows: ${this.accountExportConfig.selectors?.table}]`
      );
    }

    return errorMessages;
  }

  getFilterTransactionsButton(): HTMLButtonElement {
    return document.querySelector(
      this.accountExportConfig.selectors?.pageActions?.filterTransactionButton
    );
  }

  getAddImportButtonLocation(): HTMLButtonElement {
    return document.querySelector(
      this.accountExportConfig.selectors?.importButtonLocation
    );
  }

  getTransactionTable(): HTMLElement {
    return document.querySelector(this.accountExportConfig.selectors?.table);
  }
  //*[@id="ember1146"]
  getTransactionTableRows(): NodeListOf<HTMLElement> {
    return this.accountExportConfig.selectors?.tableRows
      ? document.querySelectorAll(this.accountExportConfig.selectors?.tableRows)
      : null;
  }

  getTransactionDate(): HTMLElement {
    return document.querySelector(
      this.accountExportConfig.selectors?.date.transactionDateSelector
    );
  }

  getStartDatePicker(): HTMLInputElement {
    return document.querySelector(
      this.accountExportConfig.selectors?.pageActions?.datePickerStart
    );
  }

  getEndDatePicker(): HTMLInputElement {
    return document.querySelector(
      this.accountExportConfig.selectors?.pageActions?.datePickerEnd
    );
  }

  getAccountNameOnPage(): HTMLElement {
    return document.querySelector(
      this.accountExportConfig.selectors?.accountName
    );
  }

  setElementStatus(element: HTMLElement, success: boolean, message?: string) {
    if (success) {
      element.style.borderStyle = "double";
      element.style.borderColor = "#b1f3b1";
    } else {
      const mess = document.createElement("div");
      mess.textContent = message;
      element.append(mess);
      element.style.backgroundColor = "#FFCCCC";
    }
  }

  useSiblingRowIfConfigured(fieldName: SiblingRowField, row: HTMLElement) {
    if (
      this.accountExportConfig.selectors.isOnSiblingRowField.includes(fieldName)
    ) {
      return row.nextElementSibling;
    }

    return row;
  }

  rowPreClickIsDone(row: HTMLElement): boolean {
    const conditionMet = row.querySelector(
      this.accountExportConfig.selectors.preProcessClick.rowPreProcessClickDone
    );
    return !!conditionMet;
  }

  rowPreClick(row: HTMLElement): Promise<boolean> {
    return new Promise<boolean>((reject, resolve) => {
      if (!this.accountExportConfig.selectors?.preProcessClick) {
        resolve(false);
      }
      console.log(
        `Pre process clicking - start: ${this.accountExportConfig.selectors.preProcessClick.rowPreProcessClick} \n[Done: ${this.accountExportConfig.selectors.preProcessClick.rowPreProcessClickDone}]`
      );

      const clickElement: HTMLElement = row.querySelector(
        this.accountExportConfig.selectors.preProcessClick.rowPreProcessClick
      );
      if (clickElement) {
        clickElement.style.transition = "none";

        const pollingInterval = setInterval(() => {
          const conditionMet = this.rowPreClickIsDone(row);

          if (conditionMet) {
            console.log("conditionMet");
            clearInterval(pollingInterval); // Stop polling
            resolve(true);
          } else {
            console.log("conditionNOTMet");
          }
        }, 100);

        clickElement.click();
      } else {
        console.error(
          `A rowPreProcessClick was configured, but the button for: \n\n row.querySelector(${this.accountExportConfig.selectors.preProcessClick.rowPreProcessClick}) was not found.`
        );
        resolve(false);
      }
    });
  }

  parseDateFromRow(
    row: HTMLElement,
    dateSelector: Dateselectors
  ): Error | Dayjs {
    const dateText: HTMLElement = this.useSiblingRowIfConfigured(
      "transactionDate",
      row
    ).querySelector(dateSelector.transactionDateSelector);

    const dateFormat =
      dateSelector.dayjsDateParseFormat ?? "ddd D MMM YYYY h:mm a";
    let dateToProcess = dateText?.textContent?.trim();

    if (!dateToProcess) {
      return new Error(
        `No date text found to process for:\n\n\t${dateSelector.transactionDateSelector}`
      );
    }
    dateSelector.dayjsDateParseRemoveBeforeParseRegex.forEach((rr) => {
      switch (rr) {
        case "[at]":
          dateToProcess = dateToProcess.replace(/ at /g, " ");
          break;
        case "[Processed on]":
          dateToProcess = dateToProcess.replace(/Processed on /g, " ");
          break;
        default:
      }
    });
    console.log(
      `dayjs.tz(${dateToProcess}, ${dateFormat}, "Pacific/Auckland");`
    );
    const date = dayjs(dateToProcess, { format: dateFormat });

    const dateNZ = date.tz("Pacific/Auckland", true);
    if (!date.isValid()) {
      const message = `Date could not be processed\n (Before:${dateText?.textContent} --> \nAfter: ${dateToProcess} --> \n  [${dateFormat}] \nAdjust the date format (selectors.dayjsDateParseFormat) and (optionally) replace characters before parse \nCurrent:${dateSelector.transactionDateSelector}`;
      this.setElementStatus(dateText, false, message);
      return new Error(message);
    }
    this.setElementStatus(dateText, true);
    return date;
  }

  async getRow(row: HTMLElement, mode: GetRowsMode): Promise<TransactionRow> {
    //return async (row: HTMLElement): Promise<TransactionRow> => {
    try {
      console.log(`Row process start ${JSON.stringify(row.attributes)}`);

      if (
        this.accountExportConfig.selectors.preProcessClick &&
        !this.rowPreClickIsDone(row)
      ) {
        const didClick = await this.rowPreClick(row).catch((e) => {
          /* This is being rejected, but its not causing issues atm... sorry future me
           
           console.error("this.rowPreClick(row) failed", {
              message: e.message,
              stack: e.stack,
            });*/
        });
        if (!didClick && !this.rowPreClickIsDone(row)) {
          console.error(
            `Expected preProcessClick ${JSON.stringify(row.attributes)}`
          );
        } else {
          console.log(`didClick ${JSON.stringify(row.attributes)}`);
        }
      }

      let dateRes: Dayjs;

      const dateOrError: Dayjs | Error = this.accountExportConfig.selectors.date
        ? this.parseDateFromRow(row, this.accountExportConfig.selectors.date)
        : new Error("No this.selectors.date configured");
      if ("message" in dateOrError) {
        console.error(
          `Error parsing date: ${dateOrError.message}\n\n${dateOrError.stack}`
        );
        if (this.accountExportConfig.selectors.fallbackDate) {
          console.error(
            `Error parsing date: ${dateOrError.message}\n\n${dateOrError.stack}`
          );
          const fallbackDateOrError: Dayjs | Error = this.accountExportConfig
            .selectors.date
            ? this.parseDateFromRow(
                row,
                this.accountExportConfig.selectors.fallbackDate
              )
            : new Error(
                "Primary date error, consider configuring a selectors.fallbackDate"
              );

          if ("message" in fallbackDateOrError) {
            console.error(
              `Error parsing fallback date: ${fallbackDateOrError.message}\n\n${fallbackDateOrError.stack}`
            );
          } else {
            dateRes = fallbackDateOrError;
          }
        } else {
          console.error(
            `Error parsing date: ${dateOrError.message}\n\n${dateOrError.stack}\n\nTry setting a selectors.fallbackDate`
          );
        }
      } else {
        dateRes = dateOrError;
        console.log(`good date - ${dateOrError.toISOString()}`);
      }

      /*  const typeEl = row.querySelector(this.accountExportConfig.selectors?.type);
              if (!typeEl) {
                  throw new Error('Transaction row missing type element');
              }
              const type = typeEl.textContent.trim();*/

      const titleEl: HTMLElement = row.querySelector(
        this.accountExportConfig.selectors?.title
      );
      if (!titleEl) {
        this.setElementStatus(titleEl, false);
        throw new Error("Transaction missing titleEl element");
      } else {
        this.setElementStatus(titleEl, true);
        //titleEl.style.backgroundColor = "#b1f3b1";
      }

      const title = titleEl.textContent.trim();

      const detailsSummaryEl: HTMLElement = row.querySelector(
        this.accountExportConfig.selectors?.details
      );
      if (!detailsSummaryEl) {
        this.setElementStatus(detailsSummaryEl, false);
        throw new Error("Transaction missing details element");
      } else {
        this.setElementStatus(detailsSummaryEl, true);
      }
      const details = detailsSummaryEl.textContent.trim();

      let finalCreditAmount: string;
      let finalDepositAmount: string;
      if (
        this.accountExportConfig.selectors?.drAmount &&
        this.accountExportConfig.selectors?.crAmount
      ) {
        const drAmountEl: HTMLElement = row.querySelector(
          this.accountExportConfig.selectors?.drAmount
        );
        const creditAmountEl: HTMLElement = row.querySelector(
          this.accountExportConfig.selectors?.crAmount
        );
        if (!drAmountEl && !creditAmountEl) {
          throw new Error("Transaction row missing amount element");
        }

        finalCreditAmount = creditAmountEl?.textContent
          ?.trim()
          .replace("$", "")
          .replace(",", "");
        finalDepositAmount = drAmountEl?.textContent
          ?.trim()
          .replace("$", "")
          .replace(",", "");
        this.setElementStatus(drAmountEl, true);
        this.setElementStatus(creditAmountEl, true);
      } else if (this.accountExportConfig.selectors?.crAmount) {
        const creditAmountEl: HTMLElement = row.querySelector(
          this.accountExportConfig.selectors?.crAmount
        );
        const creditAmount = creditAmountEl?.textContent
          ?.trim()
          .replace("$", "")
          .replace(",", "");

        if (+creditAmount > 0) {
          finalCreditAmount = creditAmount;
          finalDepositAmount = "0";
        } else {
          finalCreditAmount = "0";
          finalDepositAmount = creditAmount;
        }
        this.setElementStatus(creditAmountEl, true);
      }

      const rowResult = {
        htmlElement: row,
        transactionId: `via bank-sucker-7000_${
          title?.length > 0 ? title : details
        }_${
          finalDepositAmount?.length > 0 ? `${finalDepositAmount}_` : "" ?? ""
        }${
          finalCreditAmount?.length > 0 ? `${finalCreditAmount}_` : ""
        }_${dateRes.toISOString()}`,
        date: "millisecond" in dateRes ? dateRes : null,
        title,
        details,
        depositAmount: finalDepositAmount,
        creditAmount: finalCreditAmount,
        currency: "NZD",
        error: "message" in dateOrError ? dateOrError : null,
      };

      const summaryNode = document.createElement("div");
      const res = await this.fireflyUploader.uploadTransaction(rowResult, mode);

      const resNode = document.createElement("div");

      if ("type" in res && res.type == "success") {
        row.style.backgroundColor = "#bcf5bc";

        resNode.innerHTML = `<div>${
          mode == "dry_run" ? "IS DRY RUN" : ""
        }<textarea>${JSON.stringify(res, null, 4)}</textarea></div>`;
      } else if (res.type === "duplicate") {
        row.style.backgroundColor = "yellow";
        resNode.innerHTML = `<h1>Duplicate</h1><h2>${
          res.message
        }</h2><textarea>${JSON.stringify(res, null, 4)}</textarea>`;
      } else {
        row.style.backgroundColor = "red";
        resNode.innerHTML = `<h1>Firefly upload ${
          res.type == "success" ? "success" : "FAILED"
        }</h1> <h2>${res.message}</h2><textarea>${JSON.stringify(
          res,
          null,
          4
        )}</textarea>`;
      }
      summaryNode.appendChild(resNode);

      row.appendChild(summaryNode);

      return rowResult;
    } catch (e) {
      console.error(e);
    }
  }

  async addRowButtons() {
    const rows = this.getTransactionTableRows();
    if (!rows || rows.length === 0) {
      throw new Error("No transaction rows found");
    }

    rows.forEach((r) => {
      const lastCell = r.lastElementChild.cloneNode(true) as HTMLElement;
      r.appendChild(lastCell);

      // Clear the content of the cloned cell and add a button
      lastCell.innerHTML = "";
      const btn = document.createElement("button");
      btn.innerText = "Upload row";

      // Attach a click event to the button
      btn.addEventListener("click", () => {
        this.getRow(r, "upload");
      });

      lastCell.appendChild(btn);
    });
  }

  async getRows(mode: GetRowsMode): Promise<TransactionRow[]> {
    const rows = this.getTransactionTableRows();
    if (!rows || rows.length === 0) {
      throw new Error("No transaction rows found");
    }

    const res: PromiseSettledResult<TransactionRow>[] =
      await Promise.allSettled(
        Array.from(rows).map((row) => this.getRow(row, mode))
      );

    const failed = res.filter((r) => r.status == "rejected");
    if (failed.length > 0) {
      console.error(`==== SOME ROWS FAILED === \n\n ${JSON.stringify(failed)}`);
    }
    const success = res.filter(
      (r) => r.status == "fulfilled"
    ) as PromiseFulfilledResult<TransactionRow>[];

    const data = success.map((s) => s.value);
    // console.log(`=== SUCCESS ==== \n\n ${JSON.stringify(data, null, 4)}`);

    return data;
  }
}
