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

/* TOPBAR RETRÁTIL */
let lastScroll = 0;

window.addEventListener(
  "scroll",
  ()=>{

    const topbar =
    document.getElementById("topbar");

    if(!topbar) return;

    if(window.scrollY > lastScroll){

      topbar.style.top = "-80px";

    }else{

      topbar.style.top = "0";
    }

    lastScroll = window.scrollY;
  }
);

/* MOSTRAR TOPBAR */
document.addEventListener(
  "mousemove",
  (e)=>{

    const topbar =
    document.getElementById("topbar");

    if(!topbar) return;

    if(e.clientY < 80){

      topbar.style.top = "0";
    }
  }
);

render();