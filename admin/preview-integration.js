/* Admin live-preview bridge: preview uses the real production component. */
(() => {
  const BLUE='#87CEFA';
  const componentUrl=new URL('../nav/metrobus-nav.js',location.href).href;
  const plainText=html=>{const el=document.createElement('div');el.innerHTML=String(html||'').replace(/<br\s*\/?\s*>/gi,' ');return(el.textContent||'').replace(/\s+/g,' ').trim()};
  const draftConfig=()=>{const group=menu.find(i=>i.type==='group');return{announcements:anns.map(i=>({text:plainText(i.html)})),main:menu.map(i=>i.type==='group'?{id:i.key||i.id,label:i.label,type:'apps'}:{id:i.key||i.id,label:i.label,url:i.url,priority:i.key==='forendors'}),apps:(group?.children||[]).map(i=>({id:i.key||i.id,label:i.label,url:i.url}))}};
  const preview=document.querySelector('#preview'),frame=document.querySelector('#previewFrame');if(!preview||!frame)return;
  frame.innerHTML='';
  const iframe=document.createElement('iframe');iframe.id='productionPreview';iframe.title='Živý náhled produkčního navheadu';iframe.style.cssText='display:block;width:100%;height:72px;border:0;background:#25282d;overflow:visible';
  iframe.srcdoc=`<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:#25282d}metrobus-nav{--mb-nav-blue:${BLUE}}</style></head><body><metrobus-nav id="nav" active="apps"></metrobus-nav><script type="module" src="${componentUrl}"><\/script><script>addEventListener('message',async e=>{if(e.data?.type!=='mb-nav-draft')return;await customElements.whenDefined('metrobus-nav');const n=document.querySelector('#nav');n.config=e.data.config;n.announcementIndex=0;n.render();n.startAnnouncementRotation();n.scheduleCompactLayout()});<\/script></body></html>`;
  frame.appendChild(iframe);
  const push=()=>{try{iframe.contentWindow?.postMessage({type:'mb-nav-draft',config:draftConfig()},'*')}catch(_){}};
  iframe.addEventListener('load',()=>{push();setTimeout(push,150);setTimeout(push,600)});
  window.renderPreview=push;document.addEventListener('input',()=>queueMicrotask(push));document.addEventListener('change',()=>queueMicrotask(push));push();
})();
