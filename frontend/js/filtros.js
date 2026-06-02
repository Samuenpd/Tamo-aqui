function limpar(){

  if(confirm("Apagar tudo?")){

    posts = [];

    salvar();

    render();
  }
}

function filtrar(){

  let lista = [...posts];

  const termo =
  document.getElementById("filtro")
  .value.toLowerCase();

  const cat =
  document.getElementById(
    "filtroCategoria"
  ).value;

  const ord =
  document.getElementById(
    "ordenar"
  ).value;

  if(termo){

    lista = lista.filter(
      p =>
      p.texto
      .toLowerCase()
      .includes(termo)
    );
  }

  if(cat){

    lista = lista.filter(
      p => p.categoria === cat
    );
  }

  if(ord === "likes"){

    lista.sort(
      (a,b) => b.likes - a.likes
    );
  }

  renderPosts(lista);
}