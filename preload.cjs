const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('aibrowser',{
  feedEnable:enabled=>ipcRenderer.invoke('feed:enable',enabled),feedPause:paused=>ipcRenderer.invoke('feed:pause',paused),feedSource:id=>ipcRenderer.invoke('feed:source',id),
  chatGPTSession:()=>ipcRenderer.invoke('chatgpt:session'),chatGPTSignIn:()=>ipcRenderer.invoke('chatgpt:signin'),chatGPTCancelSignIn:()=>ipcRenderer.invoke('chatgpt:cancel-signin'),chatGPTDisconnect:()=>ipcRenderer.invoke('chatgpt:disconnect'),chatGPTModels:()=>ipcRenderer.invoke('chatgpt:models'),chatGPTUsage:()=>ipcRenderer.invoke('chatgpt:usage'),aiRender:request=>ipcRenderer.invoke('chatgpt:render',request),aiCancel:()=>ipcRenderer.invoke('chatgpt:cancel'),
  navigate:url=>ipcRenderer.invoke('page:navigate',url),back:()=>ipcRenderer.invoke('page:go-back'),forward:()=>ipcRenderer.invoke('page:go-forward'),reload:()=>ipcRenderer.invoke('page:reload'),
  snapshot:()=>ipcRenderer.invoke('page:snapshot'),transform:prompt=>ipcRenderer.invoke('page:transform',prompt),restore:()=>ipcRenderer.invoke('page:restore'),configureProvider:configuration=>ipcRenderer.invoke('provider:configure',configuration),
  showAIML:enabled=>ipcRenderer.invoke('aiml:show',Boolean(enabled)),
  onLocation:listener=>ipcRenderer.on('page:location',(_event,value)=>listener(value)),onAIML:listener=>ipcRenderer.on('aiml:document',(_event,value)=>listener(value))
});
