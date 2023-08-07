import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { getUserConfig, updateUserConfig } from "src/util/userConfig";

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

    await updateUserConfig(newConfig).then((update) => {
      setInputStatus("Uploaded");
    });
  };

  const handleChange = (event) => {
    try {
      const res = JSON.parse(event.target.value);
      setInputStatus("valid");
      // setInputValue(JSON.stringify(res, undefined, 4));
    } catch (err) {
      setInputStatus("Invalid Json");
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
          <button type="submit">Submit</button>
          <div>{inputStatus}</div>
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
