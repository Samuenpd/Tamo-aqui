let user = null;

let posts =
JSON.parse(localStorage.getItem("posts")) || [];

let imagemBase64 = "";

let localAtual = "Local desconhecido";

/* GPS */
navigator.geolocation.getCurrentPosition(
  () => localAtual = "GPS ativo",
  () => localAtual = "Local não permitido"
);

function render(){

  const app =
  document.getElementById("app");

  /* LOGIN */
  if(!user){

    app.innerHTML = `
    
    <div class="login-container">

      <div class="login-box">

        <h1 class="logo">
          TamoAqui
        </h1>

        <p class="subtitle">
          de cidadão para cidadão
        </p>

        <label>Nome</label>
        <input
          id="nome"
          placeholder="Seu nome"
        >

        <label>Email</label>
        <input
          id="email"
          type="email"
          placeholder="Digite seu email"
        >

        <label>Senha</label>
        <input
          id="senha"
          type="password"
          placeholder="Digite sua senha"
        >

        <label>Tipo de conta</label>

        <select id="tipo">
          <option value="cidadao">
            Cidadão
          </option>

          <option value="prefeitura">
            Prefeitura
          </option>
        </select>

        <button
          class="primary"
          onclick="login()"
        >
          Entrar
        </button>

      </div>

    </div>

    `;

    return;
  }

  app.innerHTML = `
  
<div class="feed-container">

<div class="topbar" id="topbar">

  <div>
    <h1>TamoAqui</h1>

    <small>
      de cidadão para cidadão
    </small>
  </div>

  <div>
    ${user.nome}
  </div>

</div>

<div class="pilares">

  <div class="pilar">
    <h3>🏘 Comunidade</h3>
    <p>
      Eventos locais, campanhas solidárias,
      animais perdidos e projetos sociais.
    </p>
  </div>

  <div class="pilar">
    <h3>🚨 Alertas Urbanos</h3>
    <p>
      Alagamentos, acidentes,
      falta de água, energia e riscos urbanos.
    </p>
  </div>

  <div class="pilar">
    <h3>🏛 Canal Cidadão</h3>
    <p>
      Comunicação entre cidadãos,
      prefeitura e comunidade.
    </p>
  </div>

</div>

<h2>
  Bem-vindo (${user.tipo})
</h2>

  <p>
    Total de denúncias:
    ${posts.length}
  </p>

  ${
    user.tipo === "cidadao"

    ?

    `
    <div class="card">

      <textarea
        id="texto"
        placeholder="Descreva a reclamação"
      ></textarea>

      <input
        id="bairro"
        placeholder="Bairro ou local"
      >

      <input
        type="file"
        onchange="carregarImagem(event)"
      >

      <select id="categoria">
        <option>Alagamento</option>
        <option>Asfalto</option>
        <option>Hospital</option>
        <option>Escola</option>
        <option>Museu</option>
      </select>

      <select id="urgencia">
        <option value="baixa">
          Baixa
        </option>

        <option value="normal">
          Normal
        </option>

        <option value="alta">
          Alta
        </option>
      </select>

      <button
        class="primary"
        onclick="criarPost()"
      >
        Postar
      </button>

    </div>
    `

    :

    ""
  }

  <div class="card">

    <input
      id="filtro"
      placeholder="Buscar reclamações..."
    >

    <input
      id="filtroCidade"
      placeholder="Cidade"
    >

    <select id="filtroCategoria">

      <option value="">
        Todas categorias
      </option>

      <option>
        Alagamento
      </option>

      <option>
        Asfalto
      </option>

      <option>
        Hospital
      </option>

      <option>
        Escola
      </option>

    </select>

    <select id="ordenar">

      <option value="novo">
        Mais recentes
      </option>

      <option value="likes">
        Mais curtidos
      </option>

    </select>

    <button onclick="filtrar()">
      Aplicar
    </button>

    <button
      class="gray"
      onclick="limpar()"
    >
      Limpar tudo
    </button>

  </div>

  <div id="feed"></div>

  <div class="footer">
    ODS 11 • ODS 16 • ODS 9
  </div>

</div>
`;

  renderPosts(posts);
}

function renderPosts(lista){

  const feed =
  document.getElementById("feed");

  feed.innerHTML = "";

  lista.forEach((p,i)=>{

    feed.innerHTML += `

    <div class="card ${
      p.urgencia === "alta"
      ?
      "urgente"
      :
      ""
    }">

      <h3>
        ${p.autor}

        ${
          p.prefeitura
          ?
          " ✔️"
          :
          ""
        }
      </h3>

      <p>${p.texto}</p>

      <small>
        ${p.categoria}
        •
        ${p.local}
      </small>

      <div class="tag ${p.urgencia}">
        ${p.urgencia.toUpperCase()}
      </div>

      ${
        p.imagem
        ?
        `<img src="${p.imagem}">`
        :
        ""
      }

      <div class="actions">

        <button onclick="curtir(${i})">
          ❤️ ${p.likes}
        </button>

        ${
          user.tipo === "prefeitura"
          ?
          `
          <button onclick="responder(${i})">
            Responder
          </button>

          <button
            class="danger"
            onclick="excluir(${i})"
          >
            Excluir
          </button>
          `
          :
          ""
        }

      </div>

      ${
        p.resposta
        ?
        `
        <p>
          <b>Prefeitura:</b>
          ${p.resposta}
        </p>
        `
        :
        ""
      }

    </div>

    `;
  });
}

render();