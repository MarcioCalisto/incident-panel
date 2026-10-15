// estudo/dia1/objetos.js
const incidente = {
    id: 1,
    titulo: "Falha de login",
    responsavel: {nome: "Ana", setor: "TI"}
};

// destructuring com renomear e valor padrão
const {titulo, responsavel: {nome: nomeResp}, prioridade = "media" } = incidente;
console.log(titulo, nomeResp, prioridade);

// optional chaining: evita erro quando a propriedade não existe
console.log(incidente.cliente?.telefone ?? "Sem telefone");

// spread: copia rasa e atualização imutável
const atualizado = {
    ...incidente, titulo: "Falha do login no SSO"
};

// lista imutável: adicionar, remover, atualizar
let lista = [
    {
    id: 1, 
    feito: false},
    {
    id: 2,
    feito: false
    }
];  

lista = [
    ...lista, {
        id: 3, 
        feito: false
    }
]; // adicionar

lista = lista.filter((item) => item.id !==2); // remover
lista = lista.map((i) => (i.id === 1 ? {...i, feito: true} : i)); // atualizar
console.log(atualizado.lista, lista);