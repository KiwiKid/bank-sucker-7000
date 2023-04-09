import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'
import { getSystemLanguage } from './localization'


const defaultConfig = {
    numWebResults: 3,
    webAccess: true,
    region: 'wt-wt',
    timePeriod: '',
    language: getSystemLanguage(),
    promptUUID: 'default',
    firefly:{
        token: 'set-this-token-in-browser-storage',
        address: 'http://url+port-to-firefly-no-end-slash',
        accountExportConfig: [
            {
                destinationName: 'Anz',
                accountNameOnSite: 'Main Account',
            }
        ]
    }
}

export type UserConfig = typeof defaultConfig

export type FireflyConfig = typeof defaultConfig.firefly


export type AccountConfig = typeof defaultConfig.firefly.accountExportConfig[0]

export async function getUserConfig(): Promise<UserConfig> {
    const config = await Browser.storage.sync.get(defaultConfig)
    return defaults(config, defaultConfig)
}

export async function getAccountConfig(accountName:string): Promise<AccountConfig> {
    const fireflyConfig = await getFireflyConfig()

    if(!fireflyConfig.accountExportConfig){
        console.error('Could not find matching account')
    }
    const currentAccount = fireflyConfig?.accountExportConfig?.filter((ac) => ac.accountNameOnSite === accountName)
    if(currentAccount?.length > 0){
        return currentAccount[0]
    }
    console.error(`could not find matching account for ${accountName}
    (checked ${fireflyConfig?.accountExportConfig?.length > 0 ? fireflyConfig?.accountExportConfig?.map((aec) => `${aec.accountNameOnSite}`).join() : 'none in config'})`)
}

export async function getFireflyConfig(): Promise<FireflyConfig> {
    const config = await getUserConfig()
    if(!config || !config.firefly?.token || config.firefly?.token == 'set-this-token-in-browser-storage'){
        
        console.log('No firefly API Token in browser storage/config')
    }

    return config.firefly
}

export async function updateUserConfig(config: Partial<UserConfig>): Promise<void> {
    await Browser.storage.sync.set(config)
}
