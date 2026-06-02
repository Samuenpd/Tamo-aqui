function salvar(){
  localStorage.setItem(
    "posts",
    JSON.stringify(posts)
  );
}