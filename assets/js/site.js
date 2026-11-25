// Modular loader: each section lives in its own HTML file under content/sections.
const modules = [
  ["hero-module", "content/sections/hero.html"],
  ["fragments-module", "content/sections/fragments.html"],
  ["timeline-module", "content/sections/timeline.html"],
  ["notes-module", "content/sections/notes.html"],
  ["clue-module", "content/sections/clue.html"],
  ["closing-module", "content/sections/closing.html"]
];
async function loadModules(){
  for(const [target,path] of modules){
    const container=document.getElementById(target);
    try{
      const response=await fetch(path);
      if(!response.ok) throw new Error(`Couldn't load ${path}`);
      container.innerHTML=await response.text();
    }catch(error){
      container.innerHTML='<p class="wrap smallprint">This section could not be loaded.</p>';
      console.error(error);
    }
  }
  setupClue();
}
function setupClue(){
  const input=document.getElementById('answer');
  const button=document.getElementById('check');
  const feedback=document.getElementById('feedback');
  if(!input||!button||!feedback)return;
  function check(){
    const value=input.value.trim().toLowerCase();
    if(!value){feedback.textContent='Take your time.';return;}
    if(['return','remember','revisit','wander'].includes(value)){
      feedback.textContent='That will do. Some places stay with us.';
    }else{
      feedback.textContent='Not quite. Think of a word about going back in memory.';
    }
  }
  button.addEventListener('click',check);
  input.addEventListener('keydown',event=>{if(event.key==='Enter')check();});
}
loadModules();