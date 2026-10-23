// Only the current image's known Facebook CDN URL may be fetched.
export function allowedImageUrl(value){
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&(!url.port||url.port==='443')&&(url.hostname==='fbcdn.net'||url.hostname.endsWith('.fbcdn.net'))?url.href:null;}catch{return null;}
}
export function safePreview(value){return typeof value==='string'&&value.length<=600000&&/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(value)?value:undefined;}

export async function fullImagePreview(session,nativeImage,value){
  const url=allowedImageUrl(value);if(!url)return undefined;
  const response=await session.fetch(url,{credentials:'omit',cache:'force-cache',redirect:'error',signal:AbortSignal.timeout(6000)});
  if(!response.ok||!/^image\/(jpeg|png|webp|avif)(;|$)/i.test(response.headers.get('content-type')||'')){await response.body?.cancel();return undefined;}
  if(Number(response.headers.get('content-length'))>8000000){await response.body?.cancel();return undefined;}
  const reader=response.body?.getReader();if(!reader)return undefined;
  const chunks=[];let length=0;
  while(true){const {done,value:chunk}=await reader.read();if(done)break;length+=chunk.length;if(length>8000000){await reader.cancel();return undefined;}chunks.push(Buffer.from(chunk));}
  let image=nativeImage.createFromBuffer(Buffer.concat(chunks));if(image.isEmpty())return undefined;
  const size=image.getSize();if(size.width*size.height>24000000)return undefined;
  if(size.width>1200)image=image.resize({width:1200});
  for(let attempt=0;attempt<5;attempt++){const preview=safePreview(image.toDataURL());if(preview)return preview;image=image.resize({width:Math.max(1,Math.round(image.getSize().width*.75))});}
  return undefined;
}
