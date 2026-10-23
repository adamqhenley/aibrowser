import {app,safeStorage,shell} from 'electron';
import path from 'node:path';
import {loadChatGPT} from './provider-loader.mjs';
export const chatgpt=await loadChatGPT({enabled:process.env.AI_BROWSER_ENABLE_CHATGPT_DEVKIT==='1',load:()=>import('./build/siwc.mjs'),config:{appName:'AI Browser',appId:'aibrowser',sendHostId:true,redirectPort:0,storageDir:path.join(app.getPath('userData'),'chatgpt'),
  openBrowser:async url=>{if(new URL(url).origin!=='https://auth.openai.com')throw Error('Unexpected sign-in origin');await shell.openExternal(url);},
  credentialEncryption:{id:'electron-safe-storage-v1',isAvailable:()=>app.isReady()&&safeStorage.isEncryptionAvailable()&&(process.platform!=='linux'||['gnome_libsecret','kwallet','kwallet5','kwallet6'].includes(safeStorage.getSelectedStorageBackend())),encrypt:value=>safeStorage.encryptString(value),decrypt:value=>safeStorage.decryptString(Buffer.from(value))}
}});
