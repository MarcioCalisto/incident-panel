//estudo/dia1/basico.js 
const nome = "Márcio";      //const: referência não muda
let tentativas = 0;         // let: valor pode mudar
tentativas += 1;        

// função tradicional e arrow function
function somar(a, b){
    return a + b;
}
const subtrair = (a, b) => a - b;

// parâmetro padrão e template string 
const saudacao = (nome="visitante") => `Olá, ${nome}!`;

console.log(somar(2, 3), subtrair(3 - 6), saudacao(), saudacao(nome));

//igualdade: use sempre === e !==
console.log(0 === "0", 0 === "0"); //true false 

//valores falsy: falso, 0, ==, null, undefined, NaN
const valor = "";
console.log(valor || "padrão"); //"padrão" (|| troca qualquer falsy)
console.log(valor ?? "padrão"); // "" (?? troca só null/undefined )

console.log("Olá! O Node está executando corretamente.");
