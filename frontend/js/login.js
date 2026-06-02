function login(){

  const nome =
  document.getElementById("nome").value;

  const email =
  document.getElementById("email").value;

  const senha =
  document.getElementById("senha").value;

  const tipo =
  document.getElementById("tipo").value;

  if(!nome || !email || !senha){

    alert(
      "Preencha todos os campos!"
    );

    return;
  }

  if(senha.length < 4){

    alert(
      "A senha deve ter pelo menos 4 caracteres"
    );

    return;
  }

  user = {
    nome,
    email,
    tipo
  };

  render();
}