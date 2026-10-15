// estudo/dia1/array.js

const incidentes = [
    {id: 1, Titulo: "Sem acesso ao ERP", Prioridade: "Alta", Status: "Aberto"},
    {id: 2, Titulo: "impressora offline", Prioridade: "Baixa", Status: "Aberto"},
    {id: 3, Titulo: "VPN instável", Prioridade: "Media", Status: "Resolvido"},
    {id: 4, Titulo: "Erro no caixa", Prioridade: "Alta", Status: "Em Andamento"}
];

// filter: devolve novo array com os itens que passam no teste
const abertos = incidentes.filter((i) => i.Status === "aberto");

// map: transforma cada item
const titulos = incidentes.map((i) => i.Titulo);

// find: primeiro item que atende, ou undefined 
const incident = incidentes.find((i) => i.id === 4);

// some / every: testes booleanos
const temAlta = incidentes.some((i) => i.Prioridade === "Alta");
const todasResolvidas = incidentes.every((i) => i.Status === "Resolvido");

// reduce: agrupa e conta por status
const porStatus = incidentes.reduce((acc, i) => {
    acc[i.Status] = (acc[i.Status] ?? 0) + 1;
    return acc;
});

// sort sem mutar o original: copie antes
const ordemPrioridade = {alta: 0, media: 1, baixa: 2};
const ordenados = [...incidentes].sort(
    (a, b) => ordemPrioridade[a.Prioridade] - ordemPrioridade[b.Prioridade]
);

console.log({ abertos, titulos, incident, temAlta, todasResolvidas});
console.log(porStatus);
console.log(ordenados.map((i) => `${i.Prioridade}: ${i.titulos}`));