// Status checks never extend the session. Only actual UI activity sends a touch.
export function monitorSession({check, touch, expire, expiresIn=1800}) {
  let stopped=false, busy=false, lastTouch=Date.now(), deadline=Date.now()+expiresIn*1000;
  function expired() { if (stopped) return; stop(); expire(); }
  async function request(action) {
    if (stopped || busy) return;
    busy=true;
    try {
      const state=await action();
      if (stopped) return;
      if (state.expires_in<=0) { expired(); return; }
      deadline=Date.now()+state.expires_in*1000;
    } catch (error) { if (error.status===401) expired(); }
    finally { busy=false; }
  }
  function activity(event) {
    if (!event.isTrusted) return;
    if (Date.now()>=deadline) { request(check); return; }
    if (Date.now()-lastTouch>=60000) { lastTouch=Date.now(); request(touch); }
  }
  const events=['pointerdown','keydown','input','wheel','touchstart'];
  events.forEach(name=>document.addEventListener(name,activity,{passive:true,capture:true}));
  const timer=setInterval(()=>request(check),15000);
  function visible() { if (document.visibilityState==='visible') request(check); }
  document.addEventListener('visibilitychange',visible);
  function stop() { stopped=true;clearInterval(timer);events.forEach(name=>document.removeEventListener(name,activity,true));document.removeEventListener('visibilitychange',visible); }
  return {stop};
}
