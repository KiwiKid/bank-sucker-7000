import { h } from "preact"
import { useEffect } from "preact/hooks"
import Browser from "webextension-polyfill"


interface ImportButtonProps {
    onClick:any
}


function ImportButton({onClick}:ImportButtonProps) {
    useEffect(() => {
        const handleMessage = async (request: string) => {
            if (request === "toggle-web-access") {
                console.log('toggle-web-access')
                console.log(request)
            }
        }

        Browser.runtime.onMessage.addListener(handleMessage)

        return function cleanup() {
            Browser.runtime.onMessage.removeListener(handleMessage)
        }
        }, [])

        return (<button onClick={onClick} class="actual-import">Hello World</button>)
    }
    

export default ImportButton