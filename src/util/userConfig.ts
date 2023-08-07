import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'
import { getSystemLanguage } from './localization'
import { SelectorSet } from './ElementFinder'


const defaultConfig: UserConfig = {
    numWebResults: 3,
    webAccess: true,
    region: 'wt-wt',
    timePeriod: '',
    language: getSystemLanguage(),
    promptUUID: 'default',
    firefly: {
        dry_run: true,
        token: 'set-this-token-in-browser-storage',
        address: 'http://url+port-to-firefly-no-end-slash',
        accountExportConfig: [
            {
                website: 'anz',
                fireflyAccountName: 'Anz',
                accountNameOnBankSite: 'Main Account',
                selectors: {
                    accountName: `h1[class='account-name-heading']").querySelector("span[class='account-name']`,
                    table: `div[class*='transactions-list']`,
                    date: `input[class*='date-range-start-date']`,
                    details: ``,
                    title: ``,
                    drAmount: ``,
                    crAmount: ``,
                }
            },
            {
                website: 'simplicity',
                accountNameOnBankSite: 'KiwiSaver Growth Fund',
                fireflyAccountName: 'Simplicity Investment - Growth',
                selectors: {

                }
            }
        ]
    }
}

export type UserConfig = {
    numWebResults: number
    webAccess: boolean
    region: string
    timePeriod: string
    language: string
    promptUUID: string
    firefly: FireflyConfig
}

export type FireflyConfig = {
    dry_run: boolean,
    token: string
    address: string
    accountExportConfig: AccountExportConfig[]
}

export type AccountExportConfig = {
    website: 'anz' | 'simplicity',
    fireflyAccountName: string,
    accountNameOnBankSite: string
    selectors: SelectorSet
}


export type AccountConfig = {
    accountConfig: AccountExportConfig
    fireflyConfig: FireflyConfig
}

export async function getUserConfig(): Promise<UserConfig> {
    const config = await Browser.storage.sync.get(defaultConfig)
    return defaults(config, defaultConfig)
}

export async function getAccountConfig(accountName: string): Promise<AccountConfig> {
    const fireflyConfig = await getFireflyConfig()

    if (!fireflyConfig.accountExportConfig) {
        console.error('Could not find matching account')
    }
    const currentAccount = fireflyConfig?.accountExportConfig?.filter((ac) => ac.accountNameOnBankSite === accountName)
    if (currentAccount?.length > 0) {
        return {
            fireflyConfig,
            accountConfig: currentAccount[0]
        }
    }
    console.error(`could not find matching account for ${accountName}
    (checked ${fireflyConfig?.accountExportConfig?.length > 0 ? fireflyConfig?.accountExportConfig?.map((aec) => `${aec.accountNameOnBankSite}`).join() : 'none in config'})`)
}

export async function getFireflyConfig(): Promise<FireflyConfig> {
    const config = await getUserConfig()
    if (!config || !config.firefly?.token || config.firefly?.token == 'set-this-token-in-browser-storage') {

        console.log('No firefly API Token in browser storage/config')
    }

    return config.firefly
}

export async function updateUserConfig(config: Partial<UserConfig>): Promise<void> {
    await Browser.storage.sync.set(config)
}
