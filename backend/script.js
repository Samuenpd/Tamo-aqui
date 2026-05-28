// =========================
// USUÁRIO + PROTEÇÃO
// =========================
let user = JSON.parse(localStorage.getItem("user"));

if(window.location.pathname.includes("feed.html")){
  if(!user){
    window.location.href = "login.html";
  }
}

// =========================
// DADOS
// =========================
let posts = JSON.parse(localStorage.getItem("posts")) || [];

let imagemBase64 = "";
let localAtual = "Local desconhecido";

// =========================
// GPS
// =========================
navigator.geolocation.getCurrentPosition(
  () => localAtual = "GPS ativo",
  () => localAtual = "Local não permitido"
);

// =========================
// SALVAR
// =========================
function salvar(){
  localStorage.setItem("posts", JSON.stringify(posts));
}

// =========================
// LOGIN
// =========================
function login(){

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const tipo = document.getElementById("tipo").value;

  if(!nome || !email || !senha){
    alert("Preencha tudo!");
    return;
  }

  if(senha.length < 4){
    alert("Senha muito curta!");
    return;
  }

  user = { nome, email, tipo };

  localStorage.setItem("user", JSON.stringify(user));

  window.location.href = "feed.html";
}

// =========================
// RENDER
// =========================
function render(){

  const app = document.getElementById("app");

  app.innerHTML = `

  <div class="topbar" id="topbar">
    <div>
      <h1>TamoAqui</h1>
      <small>de cidadão para cidadão</small>
    </div>
  </div>

  <h2>Bem-vindo (${user.tipo})</h2>

  <p>Total de denúncias: ${posts.length}</p>

  ${
    user.tipo === "cidadao"
    ?
    `
    <div class="card">
      <textarea id="texto" placeholder="Descreva a reclamação"></textarea>

      <input id="bairro" placeholder="Bairro ou local">

      <input type="file" onchange="carregarImagem(event)">

      <select id="categoria">
        <option>Alagamento</option>
        <option>Asfalto</option>
        <option>Hospital</option>
        <option>Escola</option>
        <option>Museu</option>
      </select>

      <select id="urgencia">
        <option value="baixa">Baixa</option>
        <option value="normal">Normal</option>
        <option value="alta">Alta</option>
      </select>

      <button class="primary" onclick="criarPost()">Postar</button>
    </div>
    `
    :
    ""
  }

  <div class="card">

    <input id="filtro" placeholder="Buscar reclamações...">

    <input id="filtroCidade" placeholder="Cidade">

    <select id="filtroCategoria">
      <option value="">Todas categorias</option>
      <option>Alagamento</option>
      <option>Asfalto</option>
      <option>Hospital</option>
      <option>Escola</option>
    </select>

    <select id="ordenar">
      <option value="novo">Mais recentes</option>
      <option value="likes">Mais curtidos</option>
    </select>

    <button onclick="filtrar()">Aplicar</button>
    <button class="gray" onclick="limpar()">Limpar tudo</button>

  </div>

  <div id="feed"></div>
  `;

  renderPosts(posts);
}

// =========================
// IMAGEM
// =========================
function carregarImagem(e){

  const file = e.target.files[0];

  const reader = new FileReader();

  reader.onload = ev => imagemBase64 = ev.target.result;

  reader.readAsDataURL(file);
}

// =========================
// CRIAR POST
// =========================
function criarPost(){

  const texto = document.getElementById("texto").value;
  const categoria = document.getElementById("categoria").value;
  const urgencia = document.getElementById("urgencia").value;
  const bairro = document.getElementById("bairro").value;

  if(!texto){
    alert("Escreva algo!");
    return;
  }

  posts.unshift({
    autor: user.nome,
    prefeitura: user.tipo === "prefeitura",
    texto,
    categoria,
    urgencia,
    likes: 0,
    local: bairro || localAtual,
    imagem: imagemBase64,
    resposta: ""
  });

  imagemBase64 = "";

  salvar();
  render();
}

// =========================
// CURTIR
// =========================
function curtir(i){
  posts[i].likes++;
  salvar();
  render();
}

// =========================
// EXCLUIR
// =========================
function excluir(i){
  if(confirm("Excluir post?")){
    posts.splice(i,1);
    salvar();
    render();
  }
}

// =========================
// RESPONDER
// =========================
function responder(i){
  const r = prompt("Resposta:");
  if(r){
    posts[i].resposta = r;
    salvar();
    render();
  }
}

// =========================
// LIMPAR
// =========================
function limpar(){
  if(confirm("Apagar tudo?")){
    posts = [];
    salvar();
    render();
  }
}

// =========================
// FILTRAR
// =========================
function filtrar(){

  let lista = [...posts];

  const termo = document.getElementById("filtro").value.toLowerCase();
  const cat = document.getElementById("filtroCategoria").value;
  const ord = document.getElementById("ordenar").value;

  if(termo){
    lista = lista.filter(p =>
      p.texto.toLowerCase().includes(termo)
    );
  }

  if(cat){
    lista = lista.filter(p => p.categoria === cat);
  }

  if(ord === "likes"){
    lista.sort((a,b) => b.likes - a.likes);
  }

  renderPosts(lista);
}

// =========================
// POSTS
// =========================
function renderPosts(lista){

  const feed = document.getElementById("feed");

  feed.innerHTML = "";

  lista.forEach((p,i)=>{

    feed.innerHTML += `

    <div class="card ${p.urgencia === "alta" ? "urgente" : ""}">

      <h3>
        ${p.autor}
        ${p.prefeitura ? " ✔️" : ""}
      </h3>

      <p>${p.texto}</p>

      <small>
        ${p.categoria} • ${p.local}
      </small>

      <div class="tag ${p.urgencia}">
        ${p.urgencia.toUpperCase()}
      </div>

      ${p.imagem ? `<img src="${p.imagem}">` : ""}

      <div class="actions">

        <button onclick="curtir(${i})">
          ❤️ ${p.likes}
        </button>

        ${
          user.tipo === "prefeitura"
          ?
          `
          <button onclick="responder(${i})">Responder</button>
          <button class="danger" onclick="excluir(${i})">Excluir</button>
          `
          :
          ""
        }

      </div>

      ${
        p.resposta
        ?
        `<p><b>Prefeitura:</b> ${p.resposta}</p>`
        :
        ""
      }

    </div>
    `;
  });
}

// =========================
// TOPBAR RETRÁTIL
// =========================
let lastScroll = 0;

window.addEventListener("scroll", ()=>{

  const topbar = document.getElementById("topbar");
  if(!topbar) return;

  if(window.scrollY > lastScroll){
    topbar.style.top = "-80px";
  }else{
    topbar.style.top = "0";
  }

  lastScroll = window.scrollY;
});

// =========================
// MOSTRAR TOPBAR
// =========================
document.addEventListener("mousemove", (e)=>{

  const topbar = document.getElementById("topbar");
  if(!topbar) return;

  if(e.clientY < 80){
    topbar.style.top = "0";
  }
});

// =========================
// INICIAR
// =========================
if(
  document.getElementById("app")
  && window.location.pathname.includes("feed.html")
){
  render();
}