// Our provider boundary; no third-party implementation is included here.
export async function loadChatGPT({enabled=false,load,config}={}){
  if(enabled){
    if(typeof load!=='function')throw Error('An explicit local provider loader is required.');
    const {createChatGPT}=await load();
    return createChatGPT(config);
  }
  const message='ChatGPT integration is not included in this open-source build. Local views work without AI. See docs/optional-chatgpt.md.';
  const unavailable=async()=>{throw Error(message);};
  return {
    getSession:async()=>({status:'disconnected',sharing:false,available:false,message}),
    signIn:unavailable,listModels:async()=>[],streamResponse:unavailable,
    cancelSignIn(){},async disconnect(){}
  };
}
