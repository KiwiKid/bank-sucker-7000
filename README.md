<div align="center">
<h1>Bank Sucker 7000</h1>


(WIP) Import transactions from bank accounts into firefly
  
  #### Temporary installation, in official Release or Beta
  1. Go to `about:debugging#/runtime/this-firefox`.
  2. Click `Load Temporary Add-on` button, then select the zip file you re-zipped.


  #### Persistent installation, in Nightly or Developer Edition
  1. Open Firefox, go to `about:config` and set `xpinstall.signatures.required` to `false`.
  2. Go to `about:addons`
  3. Click on the gear icon in the top right corner of the Add-ons page and select `Install Add-on From File`.
  4. Select the zip file and click open.
  5. Firefox will prompt you to confirm the installation of the addon. Click Install.
  6. The addon will be installed and will appear in the list of installed addons on the Add-ons page.
  7. Go to [ChatGPT](https://chat.openai.com/chat/) and enjoy!

<details>
<summary><h2>Build from source</h2></summary>

1. `git clone https://github.com/qunash/chatgpt-advanced.git`
2. `npm install`
3. `npm run build-prod`
4. Grab your zip extension from `build/` folder
</details>

<br>
