const SUBJECTS = [
  "Língua Portuguesa","Direito Constitucional","Direito Administrativo","Direito Penal",
  "Processo Penal","Direitos Humanos","Legislação Especial","Estatuto da Pessoa Idosa",
  "Legislação da PMPE","Raciocínio Lógico"
];

const QUESTIONS = [
 {id:"q1",subject:"Direito Constitucional",text:"Nos termos da Constituição Federal, todo poder emana do povo, que o exerce:",options:["Exclusivamente por representantes eleitos.","Por meio de representantes eleitos ou diretamente, nos termos da Constituição.","Somente por consulta popular.","Por decisão exclusiva do Congresso Nacional."],answer:1,explanation:"O art. 1º, parágrafo único, da Constituição Federal prevê o exercício do poder por representantes eleitos ou diretamente, nos termos da Constituição."},
 {id:"q2",subject:"Direitos Humanos",text:"Segundo a Declaração Universal dos Direitos Humanos, todos os seres humanos nascem:",options:["Com direitos diferentes conforme sua nacionalidade.","Livres e iguais em dignidade e direitos.","Subordinados à autoridade do Estado.","Com direitos definidos exclusivamente por sua condição econômica."],answer:1,explanation:"O art. 1º da DUDH afirma que todos nascem livres e iguais em dignidade e direitos."},
 {id:"q3",subject:"Estatuto da Pessoa Idosa",text:"Para os efeitos do Estatuto da Pessoa Idosa, considera-se pessoa idosa aquela com idade:",options:["Igual ou superior a 55 anos.","Superior a 65 anos.","Igual ou superior a 60 anos.","Igual ou superior a 70 anos."],answer:2,explanation:"O art. 1º da Lei nº 10.741/2003 considera pessoa idosa quem tem idade igual ou superior a 60 anos."},
 {id:"q4",subject:"Legislação Especial",text:"De acordo com a Lei de Abuso de Autoridade, a divergência na interpretação de lei ou na avaliação de fatos e provas:",options:["Configura sempre abuso de autoridade.","Configura crime quando houver denúncia.","Não configura abuso de autoridade por si só.","Gera automaticamente perda do cargo público."],answer:2,explanation:"A Lei nº 13.869/2019 estabelece que divergência na interpretação de lei ou na avaliação de fatos e provas não configura abuso de autoridade."},
 {id:"q5",subject:"Estatuto da Pessoa Idosa",text:"De acordo com o Estatuto da Pessoa Idosa, a ação penal relativa aos crimes definidos na lei é, em regra:",options:["Privada exclusiva.","Pública condicionada à representação.","Pública incondicionada.","Privada subsidiária obrigatória."],answer:2,explanation:"O art. 95 prevê que os crimes definidos no Estatuto da Pessoa Idosa são de ação penal pública incondicionada."},
 {id:"q6",subject:"Direito Constitucional",text:"A casa é asilo inviolável do indivíduo. Sem consentimento do morador, é possível nela entrar:",options:["A qualquer hora, por mera suspeita policial.","Somente durante o dia, em qualquer situação.","Em flagrante delito, desastre, para prestar socorro ou, durante o dia, por determinação judicial.","Somente com autorização escrita do delegado."],answer:2,explanation:"Conforme art. 5º, XI, da Constituição Federal, há exceções para flagrante delito, desastre, prestação de socorro e, durante o dia, determinação judicial."},
 {id:"q7",subject:"Direitos Humanos",text:"A Declaração Universal dos Direitos Humanos estabelece que ninguém será submetido a:",options:["Qualquer forma de processo judicial.","Tortura ou tratamento ou castigo cruel, desumano ou degradante.","Restrição de circulação em qualquer circunstância.","Deveres perante a comunidade."],answer:1,explanation:"O art. 5º da DUDH proíbe tortura e tratamento ou castigo cruel, desumano ou degradante."},
 {id:"q8",subject:"Legislação Especial",text:"Nos termos da Lei nº 9.455/1997, a condenação por crime de tortura acarretará:",options:["Somente multa.","Perda automática dos direitos políticos por toda a vida.","A perda do cargo, função ou emprego público e a interdição para seu exercício pelo dobro do prazo da pena aplicada, nos termos da lei.","Apenas advertência administrativa."],answer:2,explanation:"O art. 1º, § 5º, da Lei de Tortura prevê perda do cargo, função ou emprego público e interdição pelo dobro do prazo da pena aplicada."}
];

const STORAGE_KEY = "pmpe2027_aocp_progress_v1";
let state = loadState();
let currentReview = "favoritas";
let mockStarted = false;
let mockAnswers = {};

function freshState(){return {answers:{},favorites:[],mockCount:0,mockHistory:[]};}
function loadState(){try{return {...freshState(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")};}catch(e){return freshState();}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderStats();}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderStats(){
 const answered=Object.keys(state.answers).length;
 const correct=Object.entries(state.answers).filter(([id,a])=>{const q=QUESTIONS.find(x=>x.id===id);return q&&a.selected===q.answer;}).length;
 const rate=answered?Math.round(correct/answered*100)+"%":"—";
 document.getElementById("statAnswered").textContent=answered;
 document.getElementById("statRate").textContent=rate;
 document.getElementById("statFav").textContent=state.favorites.length;
 document.getElementById("statMocks").textContent=state.mockCount;
 document.getElementById("progressAnswered").textContent=answered;
 document.getElementById("progressCorrect").textContent=correct;
 document.getElementById("progressWrong").textContent=answered-correct;
 document.getElementById("progressMocks").textContent=state.mockCount;
}
function goPage(page){
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 const labels={inicio:"Visão geral",materias:"Matérias",questoes:"Questões",simulado:"Simulado",revisao:"Revisão e favoritos",progresso:"Meu progresso"};
 document.getElementById("pageTitle").textContent=labels[page]||"PMPE 2027";
 document.getElementById("sidebar").classList.remove("open");
 if(page==="questoes")renderQuestions();
 if(page==="materias")renderSubjects();
 if(page==="revisao")renderReview();
 if(page==="progresso")renderStats();
 window.scrollTo({top:0,behavior:"smooth"});
}
function questionCard(q,reviewMode=false){
 const saved=state.answers[q.id];
 const answered=!!saved;
 const fav=state.favorites.includes(q.id);
 const showFeedback=answered;
 return `<article class="question-card" data-id="${q.id}">
 <div class="question-meta"><span>${esc(q.subject.toUpperCase())} · ${q.id.toUpperCase()}</span><button class="fav-button ${fav?"is-fav":""}" data-fav="${q.id}" aria-label="Alternar favorito">${fav?"★ Favorita":"☆ Favoritar"}</button></div>
 <div class="question-text">${esc(q.text)}</div>
 <div class="option-list">${q.options.map((op,i)=>`<label class="option ${showFeedback&&i===q.answer?"correct":showFeedback&&saved.selected===i&&i!==q.answer?"incorrect":""}"><input type="radio" name="${q.id}" value="${i}" ${answered&&saved.selected===i?"checked":""} ${answered?"disabled":""}><span><b>${String.fromCharCode(65+i)})</b> ${esc(op)}</span></label>`).join("")}</div>
 <div class="answer-actions">${answered?`<span class="muted">${saved.selected===q.answer?"Resposta correta":"Resposta incorreta"}</span>`:`<button class="btn btn-dark" data-check="${q.id}">Conferir resposta</button>`}</div>
 ${showFeedback?`<div class="feedback ${saved.selected===q.answer?"good":"bad"}"><b>${saved.selected===q.answer?"Muito bem!":"Revise este ponto."}</b> ${esc(q.explanation)}</div>`:""}
 </article>`;
}
function renderQuestions(){
 const subject=document.getElementById("subjectFilter").value;
 const filter=document.getElementById("questionFilter").value;
 let list=QUESTIONS.filter(q=>subject==="Todas"||q.subject===subject);
 if(filter==="naoRespondidas")list=list.filter(q=>!state.answers[q.id]);
 if(filter==="erros")list=list.filter(q=>state.answers[q.id]&&state.answers[q.id].selected!==q.answer);
 if(filter==="favoritas")list=list.filter(q=>state.favorites.includes(q.id));
 const root=document.getElementById("questionsList");
 root.innerHTML=list.length?list.map(q=>questionCard(q)).join(""):`<div class="empty-state">Nenhuma questão encontrada neste filtro. Tente outra disciplina ou opção de exibição.</div>`;
}
function renderSubjects(){
 document.getElementById("subjectGrid").innerHTML=SUBJECTS.map((s,i)=>`<button class="subject-card" data-subject="${esc(s)}"><span class="subject-symbol">${["Aa","§","⚖","⚔","⌕","◎","✦","♡","★","∑"][i]}</span><b>${esc(s)}</b><small>Ver questões disponíveis →</small></button>`).join("");
}
function renderReview(){
 const list=QUESTIONS.filter(q=>currentReview==="favoritas"?state.favorites.includes(q.id):state.answers[q.id]&&state.answers[q.id].selected!==q.answer);
 document.querySelectorAll("[data-review]").forEach(b=>b.classList.toggle("active",b.dataset.review===currentReview));
 document.getElementById("reviewList").innerHTML=list.length?list.map(q=>questionCard(q,true)).join(""):`<div class="empty-state">${currentReview==="favoritas"?"Você ainda não marcou questões favoritas.":"Você ainda não tem questões erradas registradas."}</div>`;
}
function toggleFavorite(id){
 state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];
 saveState();renderQuestions();renderReview();
}
function checkAnswer(id){
 const q=QUESTIONS.find(x=>x.id===id);const chosen=document.querySelector(`input[name="${id}"]:checked`);
 if(!chosen){alert("Selecione uma alternativa antes de conferir.");return;}
 state.answers[id]={selected:Number(chosen.value),date:new Date().toISOString()};
 saveState();renderQuestions();renderReview();
}
function renderMock(){
 const root=document.getElementById("mockArea");
 if(!mockStarted){root.innerHTML="";return;}
 root.innerHTML=QUESTIONS.slice(0,4).map((q,i)=>`<article class="question-card mock-question"><div class="question-meta"><span>QUESTÃO ${i+1} DE 4 · ${esc(q.subject.toUpperCase())}</span></div><div class="question-text">${esc(q.text)}</div><div class="option-list">${q.options.map((op,j)=>`<label class="option"><input type="radio" name="mock-${q.id}" value="${j}" ${mockAnswers[q.id]===j?"checked":""}><span><b>${String.fromCharCode(65+j)})</b> ${esc(op)}</span></label>`).join("")}</div></article>`).join("")+`<button class="btn btn-gold" id="finishMock">Finalizar simulado</button>`;
}
function finishMock(){
 const qs=QUESTIONS.slice(0,4);const unanswered=qs.filter(q=>mockAnswers[q.id]===undefined);
 if(unanswered.length){if(!confirm(`Você deixou ${unanswered.length} questão(ões) sem resposta. Deseja finalizar mesmo assim?`))return;}
 const correct=qs.filter(q=>mockAnswers[q.id]===q.answer).length;
 state.mockCount++;state.mockHistory.push({date:new Date().toISOString(),total:qs.length,correct});
 saveState();
 document.getElementById("mockArea").innerHTML=`<div class="mock-result"><div class="eyebrow">RESULTADO DO SIMULADO</div><h3>${correct} de ${qs.length} acertos · ${Math.round(correct/qs.length*100)}%</h3><p>Revise as questões que errou e tente novamente depois de estudar os comentários.</p><button class="btn btn-dark" id="reviewMockErrors">Revisar questões</button> <button class="btn btn-outline" id="restartMock">Refazer simulado</button></div>`;
 mockStarted=false;
}
function exportData(){
 const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="backup-pmpe-2027-aocp.json";a.click();URL.revokeObjectURL(url);
 document.getElementById("backupMessage").textContent="Backup exportado. Guarde o arquivo em local seguro.";
}
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-page]");if(nav)goPage(nav.dataset.page);
 const goto=e.target.closest("[data-goto]");if(goto)goPage(goto.dataset.goto);
 const subj=e.target.closest("[data-subject]");if(subj){document.getElementById("subjectFilter").value=subj.dataset.subject;goPage("questoes");}
 const fav=e.target.closest("[data-fav]");if(fav)toggleFavorite(fav.dataset.fav);
 const check=e.target.closest("[data-check]");if(check)checkAnswer(check.dataset.check);
 const review=e.target.closest("[data-review]");if(review){currentReview=review.dataset.review;renderReview();}
 if(e.target.id==="startMock"){mockStarted=true;mockAnswers={};renderMock();document.getElementById("mockArea").scrollIntoView({behavior:"smooth",block:"start"});}
 if(e.target.id==="finishMock")finishMock();
 if(e.target.id==="restartMock"){mockStarted=true;mockAnswers={};renderMock();}
 if(e.target.id==="reviewMockErrors"){goPage("revisao");currentReview="erros";renderReview();}
});
document.addEventListener("change",e=>{
 if(e.target.matches('input[type="radio"][name^="mock-"]')){const id=e.target.name.replace("mock-","");mockAnswers[id]=Number(e.target.value);}
});
document.getElementById("subjectFilter").addEventListener("change",renderQuestions);
document.getElementById("questionFilter").addEventListener("change",renderQuestions);
document.getElementById("mobileMenu").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("exportData").addEventListener("click",exportData);
document.getElementById("importData").addEventListener("change",async e=>{
 const file=e.target.files[0];if(!file)return;
 try{const parsed=JSON.parse(await file.text());const incoming=parsed.state||parsed;if(!incoming.answers||!Array.isArray(incoming.favorites))throw new Error("Formato inválido");if(!confirm("Importar este backup substituirá o progresso atual neste navegador. Continuar?"))return;state={...freshState(),...incoming};saveState();renderQuestions();renderReview();document.getElementById("backupMessage").textContent="Backup importado com sucesso.";}
 catch(err){document.getElementById("backupMessage").textContent="Não foi possível importar. Selecione um backup válido desta plataforma.";}
 e.target.value="";
});
document.getElementById("resetData").addEventListener("click",()=>{
 if(confirm("Tem certeza de que deseja apagar todo o progresso salvo neste navegador? Esta ação não pode ser desfeita.")){state=freshState();saveState();renderQuestions();renderReview();document.getElementById("backupMessage").textContent="Progresso apagado.";}
});
const filter=document.getElementById("subjectFilter");
SUBJECTS.forEach(s=>filter.insertAdjacentHTML("beforeend",`<option value="${esc(s)}">${esc(s)}</option>`));
renderSubjects();renderStats();renderQuestions();
