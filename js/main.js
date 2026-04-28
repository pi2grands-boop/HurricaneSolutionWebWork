);
  setTimeout(initReveals,100);
}
function initReveals(){
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach((e,i)=>{if(e.isIntersecting)setTimeout(()=>e.target.classList.add('vis'),i*55);});
  },{threshold:0.07});
  document.querySelectorAll('.reveal:not(.vis)').forEach(r=>obs.observe(r));
}
initReveals();
function toggleFaq(btn){
  const item=btn.parentElement;
  const isOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
  if(!isOpen)item.classList.add('open');
}
function submitForm(e,form){
  e.preventDefault();
  const btn=form.querySelector('.fsub');
  btn.textContent='✓ Solicitud enviada — le contactamos pronto';
  btn.style.background='#2a9d5c';
  btn.style.color='#fff';
  btn.disabled=true;
}