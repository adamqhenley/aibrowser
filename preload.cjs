const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('aibrowser',{
  navigate:url=>ipcRenderer.invoke('page:navigate',url),back:()=>ipcRenderer.invoke('page:go-back'),forward:()=>ipcRenderer.invoke('page:go-forward'),reload:()=>ipcRenderer.invoke('page:reload'),
  snapshot:()=>ipcRenderer.invoke('page:snapshot'),transform:prompt=>ipcRenderer.invoke('page:transform',prompt),restore:()=>ipcRenderer.invoke('page:restore'),configureProvider:configuration=>ipcRenderer.invoke('provider:configure',configuration),
  showAIML:enabled=>ipcRenderer.invoke('aiml:show',Boolean(enabled)),
  onLocation:listener=>ipcRenderer.on('page:location',(_event,value)=>listener(value)),onAIML:listener=>ipcRenderer.on('aiml:document',(_event,value)=>listener(value))
});
