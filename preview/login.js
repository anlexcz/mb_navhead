const form=document.querySelector('#loginForm'),error=document.querySelector('#loginError');
const authKey='navhead-preview-auth:'+new URL('./',location.href).pathname;
if (new URL(location.href).searchParams.has('expired')) error.textContent='Přihlášení vypršelo. Přihlas se znovu.';
form.addEventListener('submit',event=>{
  event.preventDefault();
  if (form.elements.username.value!=='admin' || form.elements.password.value!=='demo') {error.textContent='Pro ukázku použij admin / demo.';return;}
  sessionStorage.setItem(authKey,JSON.stringify({last_activity:Date.now()}));location.replace('./admin.html');
});
