import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { ElementFinder } from "src/util/ElementFinder";
import { getUserConfig, updateUserConfig, isValidUserConfig } from "src/util/userConfig";

function SettingsConfig() {
  const [showConfig, setShowConfig] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputStatus, setInputStatus] = useState("");
  const [tokenValue, setTokenValue] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newConfig = JSON.parse(inputValue);

    newConfig.firefly.token = tokenValue;

    await updateUserConfig(newConfig).then(() => {
      setInputStatus("Uploaded "+new Date().toISOString());
    }).catch((e) => {
      setInputStatus(`failed ${JSON.stringify(e)}`);
    })

    const validConfigErrors = isValidUserConfig(newConfig)
    if(validConfigErrors.length > 0){
      const finder = new ElementFinder();
      await finder.setSelectorSet();
      const errors = finder._printAllChecks();
      if(errors && errors.length == 0){
      
    } else {
      setInputStatus(`${inputStatus} Errors: ${JSON.stringify(errors, null ,4)}`);
    }
    }else{
      setInputStatus(`${inputStatus} Errors via isValidUserConfig  ${JSON.stringify(validConfigErrors, null ,4)}`);
    }
}

  const handleChange = (event) => {
    try {
      const res = JSON.parse(event.target.value);
     if(isValidUserConfig(res)){
        const finder = new ElementFinder();
        const errors = finder._printAllChecks();
        if(errors.length == 0){
          setInputStatus("valid");

        }else{
          setInputStatus(JSON.stringify(errors, undefined, 4));

        }
            // setInputValue(JSON.stringify(res, undefined, 4));
     }else{
      throw 'Not valid'
     }
    } catch (err) {
      setInputStatus(err.message);
    }
    setInputValue(event.target.value);
  };

  const handleTokenChange = (event) => {
    setTokenValue(event.target.value);
  };

  useEffect(() => {
    async function fetchConfig() {
      const config = await getUserConfig();
      if (typeof config.firefly !== "undefined") {
        setTokenValue(config.firefly.token);
        delete config.firefly.token;

        setInputValue(JSON.stringify(config, undefined, 4));
      }
    }

    fetchConfig();
  }, []);
  

  const toggleShowConfig = () => {
    setShowConfig(!showConfig);
  };

  return (
    <div>
      <button
        style="padding: 10px 20px; border: medium none; background-color: rgb(0, 123, 255); color: white; font-size: 1.2rem; cursor: pointer;"
        onClick={toggleShowConfig}
      >
        {!showConfig ? "Show Config" : "Hide Config"}
      </button>
      {showConfig && (
        <form onSubmit={handleSubmit}>
          <button type="submit">Save Config</button>
          <pre>{inputStatus}</pre>
          <label for="config">Config</label>
          <textarea
            rows={30}
            cols={100}
            name="config"
            ref={textareaRef}
            type="text"
            value={inputValue}
            onChange={handleChange}
          />
          <label>
            FireFly Token
            <input
              type="text"
              value={tokenValue}
              onChange={handleTokenChange}
            />
          </label>
        </form>
      )}
    </div>
  );
}

export default SettingsConfig;
