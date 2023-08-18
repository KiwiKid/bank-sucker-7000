import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  getAccountNameFromPage,
  getSpecificConfig,
  getWebsite,
} from "src/content-scripts/mainUI";
import { ElementFinder } from "src/util/ElementFinder";
import {
  getUserConfig,
  updateUserConfig,
  getUserConfigErrors,
} from "src/util/userConfig";

function SettingsConfig() {
  const [showConfig, setShowConfig] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputStatus, setInputStatus] = useState("");
  const [inputErrors, setInputErrors] = useState<string[]>([]);
  const [tokenValue, setTokenValue] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const newConfig = JSON.parse(event.target.children[4].value);

      newConfig.firefly.token = tokenValue;

      const validConfigErrors = getUserConfigErrors(newConfig);
      if (validConfigErrors.length > 0) {
        setInputErrors(validConfigErrors);
        setInputStatus(`failed:`);
        return;
        /* const websiteName = getWebsite();
      const accountNameOnPage = getAccountNameFromPage(websiteName);

      if (!accountNameOnPage) {
        console.info("No account name on page");
        return;
      }
      const specificConfig = await getSpecificConfig(
        websiteName,
        accountNameOnPage.name
      );

      if ("message" in specificConfig) {
        console.error(specificConfig.message);
        return;
      }
      /*await finder.setSelectorSet();
      const errors = finder._printAllChecks();
      if (errors && errors.length == 0) {
      } else {
        setInputStatus( 
          `${inputStatus} Errors: ${JSON.stringify(errors, null, 4)}`
        );
      }*/
      }
      setInputStatus(`Valid --> Uploading`);

      await updateUserConfig(newConfig)
        .then(() => {
          setInputStatus("Uploaded " + new Date().toISOString());
        })
        .catch((e) => {
          setInputStatus(`failed ${JSON.stringify(e)}`);
        });
    } catch (e) {
      `failed ${JSON.stringify(e)}`;
    }
  };

  const handleChange = async (event) => {
    try {
      const res = JSON.parse(event.target.value);
      /*if (isValidUserConfig(res)) {
        const websiteName = getWebsite();
        const accountNameOnPage = getAccountNameFromPage(websiteName);

        if (!accountNameOnPage) {
          console.info("No account name on page");
          return;
        }
        const specificConfig = await getSpecificConfig({
          website: websiteName,
          accountName: accountNameOnPage.name,
        });

        if ("message" in specificConfig) {
          console.error(specificConfig.message);
          return;
        }

        const finder = new ElementFinder(specificConfig);
        const errors = finder._printAllChecks();
        if (errors.length == 0) {
          setInputStatus("valid");
        } else {
          setInputStatus(JSON.stringify(errors, undefined, 4));
        }
        // setInputValue(JSON.stringify(res, undefined, 4));
      } else {
        throw "Not valid";
      }*/
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
          <div>Tips: Ensure you passs through the</div>
          <div>
            <h3>{inputStatus}</h3>
            {inputErrors.length > 0 && (
              <ul>
                {inputErrors.map((vce, i) => (
                  <li key={{ i }}>{JSON.stringify(vce, null, 4)}</li>
                ))}
              </ul>
            )}
          </div>
          <label for="config">Config</label>
          <textarea
            rows={30}
            cols={100}
            name="config"
            ref={textareaRef}
            type="text"
            value={inputValue}
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
