### 1. `import` e `export default`

-   **Código:**

    ``` jsx
    import { useState } from 'react';

    export default function IncidentForm() {
        // ...
    }
    ```

-   **O que faz:** `import` permite utilizar recursos disponibilizados
    por outros módulos. `export default` define a exportação principal
    daquele arquivo.

-   **No React:** `useState` vem da biblioteca React, enquanto
    `IncidentForm` é o componente que poderá ser importado em outro
    arquivo.

-   **Como se comunica:** outro componente pode importar o formulário
    com `import IncidentForm from './components/IncidentForm'`.

-   **Atenção:** o nome do componente deve começar com letra maiúscula.
    No código original está escrito `incidentForm`; o correto é
    `IncidentForm`. Isso é importante porque o React diferencia
    componentes de elementos HTML pelo uso de letras maiúsculas e
    minúsculas.

## 2. O Hook `useState`

-   **Código:**

    ``` jsx
    const [values, setValues] = useState(initalValues);
    ```

-   **O que faz:** cria um estado, isto é, um valor que o componente
    mantém entre renderizações e que pode ser atualizado.

-   **Como funciona:** `values` guarda o valor atual, enquanto
    `setValues` atualiza esse valor e solicita uma nova renderização do
    componente.

-   **No formulário:** existem cinco estados ou grupos de informações
    importantes:

  -----------------------------------------------------------------------
  Estado                              Responsabilidade
  ----------------------------------- -----------------------------------
  `values`                            Guarda título, descrição e
                                      prioridade.

  `errors`                            Guarda as mensagens de validação.

  `touched`                           Registra quais campos já receberam
                                      interação, como perder o foco.

  `submitting`                        Indica se o formulário está sendo
                                      enviado.

  `submitError`                       Guarda uma mensagem caso o envio
                                      falhe.
  -----------------------------------------------------------------------

-   **Atenção:** `useState(initalValues)` usa o valor inicial apenas na
    primeira renderização do componente. Se `initalValues` mudar depois,
    o estado `values` não será atualizado automaticamente.

## 3. Objetos e valores iniciais

-   **Código:**

    ``` jsx
    const EMPTY = {
        title: "",
        description: "",
        priority: "media"
    };
    ```

-   **O que faz:** cria um objeto com os valores iniciais do formulário.

-   **No React:** esse objeto permite iniciar o formulário vazio e
    também restaurá-lo após um envio bem-sucedido.

-   **Conceito importante:** objetos agrupam propriedades relacionadas.
    Aqui, `title`, `description` e `priority` representam os campos de
    um incidente.

-   **Atenção:** o valor `"media"` precisa corresponder a uma das opções
    aceitas pela lista `PRIORITES`, inclusive respeitando a grafia
    utilizada na validação.

## 4. O operador spread (`...`)

-   **Código:**

    ``` jsx
    const next = { ...values, [name]: value };
    ```

-   **O que faz:** o operador spread (`...`) copia as propriedades
    enumeráveis de um objeto para outro.

-   **No formulário:** `...values` preserva os campos que não foram
    alterados. Em seguida, `[name]: value` substitui o valor do campo
    modificado.

-   **Exemplo:** se `values` for
    `{ title: "Internet", description: "", priority: "media" }` e o
    usuário digitar `"Falha de rede"` no título, o novo objeto
    preservará a descrição e a prioridade.

-   **Atenção:** essa cópia é superficial (*shallow copy*). Se o objeto
    tiver propriedades que também sejam objetos ou arrays, essas
    estruturas internas não serão copiadas recursivamente.

## 5. Desestruturação de objetos (*destructuring*)

-   **Código:**

    ``` jsx
    const { name, value } = event.target;
    ```

-   **O que faz:** extrai propriedades de um objeto e as armazena em
    variáveis.

-   **Na prática:** `event.target` representa o elemento que disparou o
    evento. Nesse caso, `name` identifica o campo e `value` contém seu
    valor atual.

-   **Exemplo:** ao digitar `Computador sem acesso à rede` no campo cujo
    nome é `title`, você terá:

    ``` jsx
    name = "title";
    value = "Computador sem acesso à rede";
    ```

-   **Por que usar:** evita escrever `event.target.name` e
    `event.target.value` repetidamente.

## 6. Propriedade computada (`[name]: value`)

-   **Código:**

    ``` jsx
    const next = { ...values, [name]: value };
    ```

-   **O que faz:** permite definir o nome de uma propriedade de um
    objeto dinamicamente.

-   **Como funciona:** os colchetes fazem o JavaScript utilizar o
    conteúdo da variável `name` como nome da propriedade.

-   **Exemplo:**

    ``` jsx
    const name = "priority";
    const value = "alta";

    const campo = { [name]: value };
    // Resultado: { priority: "alta" }
    ```

-   **No React:** essa técnica permite utilizar uma única função
    `handleChange` para atualizar vários campos, em vez de criar uma
    função para cada input.

## 7. Funções manipuladoras de eventos (*event handlers*)

-   **Código:**

    ``` jsx
    function handleChange(event) {
        // ...
    }
    ```

-   **O que faz:** define uma função que será executada quando
    determinado evento acontecer.

-   **No React:** `handleChange` cuida das alterações nos campos;
    `handleBlur` cuida da saída do foco; e `handleSubmit` cuida do envio
    do formulário.

-   **Como se comunica:** os atributos `onChange`, `onBlur` e `onSubmit`
    conectam os elementos da interface às funções JavaScript.

-   **Atenção:** definir a função não faz com que ela seja executada
    automaticamente. Ela precisa estar associada ao evento correto.

## 8. `setState` com função anterior (`prev`)

-   **Código:**

    ``` jsx
    setTouched((prev) => ({
        ...prev,
        [name]: true
    }));
    ```

-   **O que faz:** atualiza o estado utilizando o valor anterior como
    referência.

-   **No React:** `prev` representa o estado anterior de `touched`. O
    spread preserva os campos que já haviam sido marcados, e
    `[name]: true` marca o campo atual.

-   **Exemplo:** se o usuário sair do campo `title` e depois do campo
    `description`, o estado poderá ficar assim:

    ``` jsx
    {
        title: true,
        description: true
    }
    ```

-   **Por que usar:** evita perder informações já existentes no estado.

-   **Boa prática:** quando o próximo estado depende do anterior,
    prefira a atualização funcional, pois ela trabalha com o valor mais
    recente disponibilizado pelo React.

## 9. O operador condicional (`if`)

-   **Código:**

    ``` jsx
    if (touched[name]) {
        setErrors(validateIncident(next));
    }
    ```

-   **O que faz:** executa um bloco somente quando uma condição é
    verdadeira.

-   **No formulário:** a validação em resposta à digitação só acontece
    quando o campo já foi marcado como tocado.

-   **Na prática:** isso evita exibir erros imediatamente enquanto a
    pessoa ainda está preenchendo o formulário pela primeira vez.

-   **Como se comunica:** `touched` controla quando a validação é
    exibida, enquanto `validateIncident` verifica se os valores estão
    corretos.

-   **Atenção:** `touched[name]` pode ser `undefined` quando o campo
    ainda não foi marcado. Nesse caso, a condição é considerada falsa.

## 10. A função `validateIncident()`

-   **Código:**

    ``` jsx
    const found = validateIncident(values);
    ```

-   **O que faz:** chama uma função externa responsável por verificar os
    dados do incidente.

-   **No projeto:** a lógica de validação fica separada da interface
    visual, o que facilita testes, manutenção e reutilização.

-   **Como se comunica:** o componente envia o objeto `values` para a
    função e recebe um resultado, geralmente um objeto contendo erros.

-   **Exemplo ilustrativo:**

    ``` jsx
    {
        title: "Informe um título",
        description: "A descrição é obrigatória"
    }
    ```

-   **Atenção:** esse resultado é apenas um exemplo. Para saber quais
    mensagens sua função realmente retorna, é necessário analisar o
    arquivo `valideteIncident.js` (ou o nome correto que existir no
    projeto).

## 11. `hasErrors()` e a validação antes do envio

-   **Código:**

    ``` jsx
    if (hasErrors(found)) return;
    ```

-   **O que faz:** verifica se a validação encontrou algum erro. Se
    encontrar, `return` encerra a execução da função naquele ponto.

-   **No React:** isso impede que o formulário tente salvar dados
    inválidos.

-   **Fluxo de execução:**

    1.  O usuário clica em Salvar.
    2.  `validateIncident(values)` verifica os dados.
    3.  `hasErrors(found)` verifica se o objeto de erros contém alguma
        propriedade.
    4.  Se houver erros, o envio é interrompido.
    5.  Se não houver erros, o código continua para o salvamento.

-   **Atenção:** `hasErrors` não valida os campos por conta própria. Ela
    verifica o resultado produzido por `validateIncident`.

## 12. O método `event.preventDefault()`

-   **Código:**

    ``` jsx
    event.preventDefault();
    ```

-   **O que faz:** impede o comportamento padrão associado a um evento.

-   **No React:** no evento `submit` de um formulário HTML, impede que o
    navegador execute o envio tradicional da página, que normalmente
    pode causar uma navegação ou recarga.

-   **Por que usar:** permite controlar o envio com JavaScript, validar
    os campos e chamar a função responsável por salvar os dados sem
    recarregar a página.

-   **Atenção:** ele não valida os dados, não salva informações e não
    impede automaticamente que a função continue executando. Apenas
    cancela a ação padrão do evento.

## 13. `async` e `await`

-   **Código:**

    ``` jsx
    async function handleSubmit(event) {
        // ...
        await onSubmit({
            ...values,
            title: values.title.trim()
        });
    }
    ```

-   **O que faz:** `async` permite que uma função utilize `await` e faz
    com que ela retorne uma `Promise`. O `await` pausa a continuação
    daquela função assíncrona até que a operação aguardada seja
    resolvida ou rejeitada.

-   **No projeto:** `onSubmit` é uma função recebida por propriedade
    (*prop*). Ela pode, por exemplo, chamar uma API para registrar um
    incidente.

-   **Como se comunica:** o formulário prepara os dados e entrega a
    responsabilidade de salvá-los à função recebida do componente pai.

-   **Atenção:** o `await` só espera a operação se `onSubmit` retornar
    uma `Promise` ou outro valor aguardável. A implementação concreta do
    salvamento depende de quem fornece essa função.

## 14. `try`, `catch` e `finally`

-   **Código:**

    ``` jsx
    try {
        await onSubmit(values);
    } catch (error) {
        setSubmitError(
            error.message || "Não foi possível salvar o incidente"
        );
    } finally {
        setSubmitting(false);
    }
    ```

-   **O que faz:** organiza a execução de operações que podem falhar.

-   **Como funciona:**

    -   `try`: executa a operação principal.
    -   `catch`: trata uma exceção ou rejeição da operação aguardada.
    -   `finally`: executa o bloco final independentemente de a operação
        ter sido concluída ou ter falhado.

-   **No React:** se o salvamento falhar, o componente registra uma
    mensagem de erro. Ao terminar, libera o botão novamente.

-   **Atenção:** se `onSubmit` falhar sem lançar uma exceção ou retornar
    uma `Promise` rejeitada, o `catch` não terá como detectar a falha
    dessa maneira.

## 15. `setSubmitting(true)` e `disabled`

-   **Código:**

    ``` jsx
    setSubmitting(true);
    ```

    ``` jsx
    <button type="submit" disabled={submitting}>
        {submitting ? "Salvando..." : "Salvar incidente"}
    </button>
    ```

-   **O que faz:** controla o estado de carregamento durante o
    salvamento.

-   **No React:** quando `submitting` é `true`, o botão fica
    desabilitado e seu texto muda para `"Salvando..."`.

-   **O operador ternário (`? :`):** escolhe um resultado entre duas
    alternativas de acordo com uma condição.

-   **Atenção:** desabilitar o botão melhora a experiência do usuário e
    reduz envios repetidos pela interface, mas não substitui mecanismos
    de proteção contra duplicidade no servidor.

## 16. Renderização condicional com `&&`

-   **Código:**

    ``` jsx
    {submitError && (
        <p role="alert" className="error">
            {submitError}
        </p>
    )}
    ```

-   **O que faz:** o operador `&&` permite renderizar o elemento da
    direita quando a expressão da esquerda é verdadeira.

-   **No React:** a mensagem só aparece quando `submitError` contém um
    valor verdadeiro, como uma mensagem de falha.

-   **Outro exemplo do código:**

    ``` jsx
    {showError("title") && (
        <p>{errors.title}</p>
    )}
    ```

-   **Atenção:** se a expressão da esquerda for `false`, `null` ou
    `undefined`, o React não renderiza um elemento correspondente.
    Entretanto, expressões com números como `0 && ...` podem renderizar
    o próprio `0`.

## 17. A função `showError`

-   **Código:**

    ``` jsx
    const showError = (name) => touched[name] && errors[name];
    ```

-   **O que faz:** cria uma função que verifica se um campo já foi
    tocado e se existe um erro associado a ele.

-   **No React:** centraliza a regra de exibição das mensagens, evitando
    repetir a mesma condição em cada campo.

-   **Como funciona:** recebe o nome do campo, consulta `touched` e
    depois consulta `errors`.

-   **Atenção:** a função não retorna necessariamente um booleano. Ela
    pode retornar a própria mensagem de erro ou um valor falsy. Isso
    funciona com renderização condicional, mas, se quiser garantir um
    booleano, pode usar:

    ``` jsx
    const showError = (name) =>
        Boolean(touched[name] && errors[name]);
    ```

## 18. Props: `onSubmit` e `initialValues`

-   **Código:**

    ``` jsx
    export default function IncidentForm({
        onSubmit,
        initialValues = EMPTY
    }) {
        // ...
    }
    ```

-   **O que faz:** recebe propriedades fornecidas pelo componente pai e
    as extrai por desestruturação.

-   **No projeto:**

    -   `onSubmit`: função que o formulário chama para salvar o
        incidente.
    -   `initialValues`: valores usados para inicializar os campos, caso
        sejam fornecidos.
    -   `= EMPTY`: valor padrão quando `initialValues` é `undefined`.

-   **Atenção:** no código original há um erro de grafia:
    `initalValues`. O nome mais adequado é `initialValues`. O importante
    é usar exatamente o mesmo nome na declaração e em todos os lugares
    em que a propriedade for passada.

-   **Outro detalhe:** se você pretende utilizar o mesmo formulário para
    criar e editar incidentes, precisa considerar como atualizar os
    valores quando o incidente selecionado mudar. O valor padrão de uma
    prop não faz isso automaticamente.

## 19. `map()` e a propriedade `key`

-   **Código:**

    ``` jsx
    {PRIORITES.map((p) => (
        <option key={p} value={p}>
            {p}
        </option>
    ))}
    ```

-   **O que faz:** o método `map()` percorre um array e produz um novo
    array com o resultado de cada elemento.

-   **No React:** cada item da lista é transformado em uma opção do
    campo de seleção.

-   **A propriedade `key`:** ajuda o React a identificar cada elemento
    entre renderizações e a atualizar listas corretamente.

-   **Atenção:** `key` deve ser estável e única entre os elementos
    irmãos. Usar `p` funciona se cada prioridade aparecer apenas uma vez
    na lista.

## 20. Atributos de acessibilidade: `htmlFor`, `aria-invalid` e `aria-describedby`

-   **Código:**

    ``` jsx
    <label htmlFor="title">Título</label>
    <input
        id="title"
        aria-invalid={Boolean(showError("title"))}
        aria-describedby="title-error"
    />
    ```

-   **`htmlFor`:** associa o rótulo ao campo cujo `id` corresponde ao
    valor informado. Em JSX, usa-se `htmlFor` em vez de `for`.

-   **`aria-invalid`:** informa às tecnologias assistivas que o campo
    contém um valor inválido.

-   **`aria-describedby`:** associa o campo a um elemento que fornece
    informações adicionais, como uma mensagem de erro.

-   **No React:** esses atributos ajudam a tornar o formulário mais
    acessível para pessoas que utilizam leitores de tela.

-   **Atenção:** o valor de `aria-describedby` deve corresponder ao `id`
    real do elemento de descrição. Se o elemento não existir, a
    associação fica quebrada.

## 21. `role="alert"`

-   **Código:**

    ``` jsx
    <p id="title-error" role="alert">
        {errors.title}
    </p>
    ```

-   **O que faz:** indica às tecnologias assistivas que o conteúdo tem
    caráter de alerta e pode precisar ser anunciado quando surgir.

-   **No React:** é útil para comunicar erros de validação e falhas de
    salvamento.

-   **Boa prática:** utilize-o para mensagens relevantes e evite
    provocar anúncios excessivos a cada pequena mudança do formulário.

------------------------------------------------------------------------

# Correções importantes no código original

Além dos conceitos, há erros que podem impedir o funcionamento correto
do componente.

  -----------------------------------------------------------------------
  Problema encontrado     Correção                Impacto
  ----------------------- ----------------------- -----------------------
  `incidentForm`          `IncidentForm`          Permite utilizar o
                                                  componente corretamente
                                                  em JSX.

  `onChane`               `onChange`              Conecta o campo à
                                                  função de alteração.

  `onBlue`                `onBlur`                Conecta o campo à
                                                  função de perda de
                                                  foco.

  `notValidate`           `noValidate`            Desativa a validação
                                                  nativa do navegador no
                                                  envio.

  `values.decription`     `values.description`    Corrige a leitura do
                                                  estado da descrição.

  `row={3}`               `rows={3}`              Define corretamente as
                                                  linhas visíveis do
                                                  textarea.

  `id="title=error"`      `id="title-error"`      Corrige a associação
                                                  com `aria-describedby`.

  `valideteIncident`      Conferir o nome real do O caminho e o nome da
                          arquivo                 importação precisam
                                                  corresponder ao arquivo
                                                  existente.

  `initalValues`          `initialValues`         Corrige a grafia da
                                                  propriedade, desde que
                                                  o nome seja atualizado
                                                  em todos os usos.
  -----------------------------------------------------------------------

## Outros pontos que merecem atenção

### A validação no `handleBlur`

O código chama `validateIncident(values)` no `handleBlur`. Isso funciona
para validar o estado disponível naquela renderização. Já no
`handleChange`, usar `next` é importante porque esse objeto contém a
alteração mais recente, mesmo antes de a nova renderização ocorrer.

### Limpeza do formulário

O código original executa:

``` jsx
setValues(EMPTY);
setTouched({});
```

Isso limpa os campos e as marcações de interação depois do envio
bem-sucedido. Entretanto, se o formulário estiver editando um incidente
com valores iniciais personalizados, talvez seja melhor restaurar os
valores adequados para aquele fluxo, em vez de sempre voltar para
`EMPTY`.

### Estado de erros após o envio

O código atual não limpa explicitamente `errors` após um salvamento
bem-sucedido. Como os campos são limpos, pode ser útil também executar
`setErrors({})` para manter os estados coerentes.

------------------------------------------------------------------------

# Fluxo completo de comunicação do componente

O diagrama abaixo resume como os eventos, estados, validação e envio se
conectam.

``` mermaid
flowchart TD
    A["Usuário preenche o formulário"] --> B["onChange → handleChange"]
    B --> C["setValues atualiza o estado"]
    C --> D["validateIncident verifica os dados"]
    D --> E["errors e touched controlam as mensagens"]
    A --> F["onBlur → handleBlur"]
    F --> D
    A --> G["submit → handleSubmit"]
    G --> H["validateIncident + hasErrors"]
    H --> I{"Existem erros?"}
    I -- Sim --> J["Exibe os erros e interrompe"]
    I -- Não --> K["setSubmitting(true)"]
    K --> L["await onSubmit(...)"]
    L --> M{"Salvamento concluído?"}
    M -- Sim --> N["Limpa o formulário"]
    M -- Não --> O["setSubmitError(...)"]
    N --> P["finally: setSubmitting(false)"]
    O --> P
```

## Resumo final

O formulário não é apenas um conjunto de campos. Ele coordena:

-   **Estado:** guarda os dados digitados e o estado de envio.
-   **Eventos:** detecta alterações, perda de foco e submissão.
-   **Validação:** verifica os dados e decide quando mostrar erros.
-   **Comunicação entre componentes:** recebe `onSubmit` e
    `initialValues` por props.
-   **Assincronismo:** espera o salvamento e trata possíveis falhas.
-   **Acessibilidade:** conecta rótulos, campos e mensagens de erro.

O próximo arquivo mais importante para analisar é `valideteIncident.js`
--- ou o nome correto utilizado no seu projeto --- porque ele contém a
lógica que determina quais valores são válidos, quais erros são
retornados e como `hasErrors` participa da decisão de salvar ou
interromper o envio.