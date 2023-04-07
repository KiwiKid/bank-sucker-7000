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
        address: 'http://url+port-to-firefly-no-end-slash'
    }
    
}

export type UserConfig = typeof defaultConfig

export type FireflyConfig = typeof defaultConfig.firefly

export async function getUserConfig(): Promise<UserConfig> {
    const config = await Browser.storage.sync.get(defaultConfig)
    return defaults(config, defaultConfig)
}


export async function getFireflyConfig(): Promise<FireflyConfig> {
    const config = await getUserConfig()
    if(!config || !config.firefly?.token || config.firefly?.token == 'set-this-token-in-browser-storage'){
        // Add config/config loading here:
       /// await updateUserConfig({firefly: {
       //     token: '',
       //     address: ''
       // }})
        
        console.log('No firefly API Token in browser storage/config')
    }

    return config.firefly
}

export async function updateUserConfig(config: Partial<UserConfig>): Promise<void> {
    await Browser.storage.sync.set(config)
}
