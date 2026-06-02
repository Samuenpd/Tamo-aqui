function carregarImagem(e){

  const file = e.target.files[0];

  const reader = new FileReader();

  reader.onload =
  ev => imagemBase64 = ev.target.result;

  reader.readAsDataURL(file);
}

function criarPost(){

  const texto =
  document.getElementById("texto").value;

  const categoria =
  document.getElementById("categoria").value;

  const urgencia =
  document.getElementById("urgencia").value;

  const bairro =
  document.getElementById("bairro").value;

  if(!texto){

    alert("Escreva algo!");

    return;
  }

  posts.unshift({

    autor:user.nome,

    prefeitura:
    user.tipo === "prefeitura",

    texto,

    categoria,

    urgencia,

    likes:0,

    local:
    bairro || localAtual,

    imagem:imagemBase64,

    resposta:""

  });

  imagemBase64 = "";

  salvar();

  render();
}

function curtir(i){

  posts[i].likes++;

  salvar();

  render();
}

function responder(i){

  const r =
  prompt("Resposta:");

  if(r){

    posts[i].resposta = r;

    salvar();

    render();
  }
}