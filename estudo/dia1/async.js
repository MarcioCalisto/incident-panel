// estudo/dia1/async.js
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function buscarUsuario(id) {
    const resposta = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    if(!resposta.ok) {
        throw new Error(`Falha HTTP ${resposta.status}`);
    }
    return resposta.json();
}

async function main() {
    try {
        const usuario = await buscarUsuario(1);
        console.log(usuario.nome, usuario.email);
    
    // em paralelo: Promise.all espera todas
    const [u2, u3] = await Promise.all([buscarUsuario(2), buscarUsuario(3)]);
    console.log(u2.nome, u3.nome);

    await esperar(500);
    await buscarUsuario(99999); // gera erro tratado abaixo
  }   catch (erro) {
    console.log("Erro capturado: ", erro.message);
  }   finally {
    console.log("Fim");
  }
}

main();