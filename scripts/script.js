const QUIZZ_API = 'https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/'

let existeQuizzesCriados = false
let quizzSelecionado = null

// Variaveis para calculo do nivel atingido
let count = 0
let acertos = 0
let niveis = []
let qtdDePerguntas = null

exibirQuizzes()

function exibirQuizzes() {
    habilitarTelaCarregando()
    
    const promessa = axios.get(QUIZZ_API)
    
    promessa.then(resposta => {
        desabilitarTelaCarregando()
        
        const quizzes = document.querySelector(".quizzes")
        const quizzes__criados = document.querySelector(".quizzes-criados")
        quizzes.innerHTML = ""
        quizzes__criados.innerHTML = ""

        if (localStorage.length > 0) {
            document.querySelector(".sem-quizzes-criados").classList.add("escondido")
            document.querySelector(".com-quizzes-criados").classList.remove("escondido")
            existeQuizzesCriados = true
        } else {
            document.querySelector(".sem-quizzes-criados").classList.remove("escondido")
            document.querySelector(".com-quizzes-criados").classList.add("escondido")
            existeQuizzesCriados = false
        }
        
        resposta.data.forEach(quizz => {
            quizzes.innerHTML += `
            <article data-identifier="quizz-card" id="${quizz.id}" onclick="habilitarTela2(this)" class="quizz">
            <div class="degrade"></div>
            <img src="${quizz.image}" alt="quizz">
            <p>${quizz.title}</p>
            </article>
            `
            
            if (existeQuizzesCriados) {
                for (let i = 0; i < 100; i++) {
                    if (localStorage.getItem(`objeto${i}`) !== null) {
                        let localQuizzString = localStorage.getItem(`objeto${i}`)
                        let localQuizz = JSON.parse(localQuizzString)
                        if (quizz.id === localQuizz.id) {
                            quizzes__criados.innerHTML += `
                            <article data-identifier="quizz-card" id="${quizz.id}" class="quizz">
                            <div class="degrade" onclick="habilitarTela2(this.parentNode)"></div>
                            <img src="${quizz.image}" alt="quizz">
                            <div class="editar__excluir">
                            <ion-icon name="create-outline" onclick="editarQuizz(this)"></ion-icon>
                            <ion-icon name="trash-outline" onclick="excluirQuizz(this)"></ion-icon>
                            </div>
                            <p>${quizz.title}</p>
                            </article>
                            `
                        }
                    }
                }
            }
                
        });
    })
        
    promessa.catch(erro => {
        console.log(erro)
        alert("Alguma coisa deu ruim!")
    })
}
    
// EXIBIR PERGUNTAS DO QUIZZ SELECIONADO
function habilitarTela2(quizz) {
    habilitarTelaCarregando()
    
    const tela1 = document.querySelector(".tela-1")
    const tela2 = document.querySelector(".tela-2")
    const tela3 = document.querySelector(".tela-3")
    tela1.classList.add("escondido")
    tela2.classList.remove("escondido")
    tela3.classList.add("escondido")
    
    quizzSelecionado = quizz
    
    const promessa = axios.get(QUIZZ_API + `${quizz.id}`)
    
    promessa.then(resposta => {
        desabilitarTelaCarregando()
        
        const banner = document.querySelector(".banner")
        banner.classList.remove("escondido")
        let perguntas = resposta.data.questions
        
        banner.innerHTML += `
            <div class="degrade"></div>
            <img src="${resposta.data.image}" alt="banner">
            <p>${resposta.data.title}</p>
            `
            
        gerarPerguntas(perguntas)
        
        niveis = resposta.data.levels
        qtdDePerguntas = perguntas.length
    })

    promessa.catch(erro => {
        console.log(erro)
        alert("Ops! Não foi possível abrir o quizz.")
    })
}

function gerarPerguntas(perguntas) {
    const tela2 = document.querySelector(".tela-2")
    let indiceDaPergunta = 1
    
    perguntas.forEach(pergunta => {
        let respostas = pergunta.answers
        
        tela2.innerHTML += `
        <div data-identifier="question" id="pergunta_${indiceDaPergunta}" class="pergunta">
        <div class="pergunta__titulo" style="background-color: ${pergunta.color};">${pergunta.title}</div>
        </div>
        `
        
        const perguntaGerada = document.getElementById(`pergunta_${indiceDaPergunta}`)
        
        respostas = embaralharArray(respostas)
        
        gerarRespostas(respostas, perguntaGerada)
        
        indiceDaPergunta++
    });
}

function gerarRespostas(respostas, perguntaGerada) {

    respostas.forEach(resposta => {
        let isRespostaCorreta = ""
        
        if (resposta.isCorrectAnswer) {
            isRespostaCorreta = 'correta'
        } else {
            isRespostaCorreta = 'errada'
        }
        
        perguntaGerada.innerHTML += `
        <div data-identifier="answer" class="pergunta__resposta ${isRespostaCorreta}" onclick="selecionarResposta(this)">
        <img src=${resposta.image} alt="">
        <p>${resposta.text}</p>
        </div>
        `
    });
}

function selecionarResposta(respostaEscolhida) {
    count++
    const pergunta = respostaEscolhida.parentNode
    const respostas = pergunta.querySelectorAll(".pergunta__resposta")
    
    mostrarGabarito(respostas, respostaEscolhida)
    
    contarAcertos(respostaEscolhida)
    
    setTimeout(() => {
        const proximaPergunta = pergunta.nextElementSibling
        
        if (count !== qtdDePerguntas) {
            proximaPergunta.scrollIntoView()
        } else { }
    }, 2000)
    
    
    const tela2 = document.querySelector(".tela-2")
    
    let porcentagemDeAcertos = (acertos/qtdDePerguntas)*100
    porcentagemDeAcertos = Math.round(porcentagemDeAcertos)
    
    if (count === qtdDePerguntas) {
        exibirResultadoDoQuizz(tela2, porcentagemDeAcertos)
    } else { }
}

function mostrarGabarito(respostas, respostaEscolhida) {
    
    respostas.forEach(resposta => {
        resposta.classList.add("gabarito")
        resposta.onclick = null
        if (resposta !== respostaEscolhida) {
            resposta.classList.add("esbranquicar")
        } else { }
    });
}

function contarAcertos(respostaEscolhida) {
    
    if (respostaEscolhida.classList.contains("correta")) {
        acertos++
    } else { }
}

function exibirResultadoDoQuizz(tela2, porcentagemDeAcertos) {
    let indiceNivel = null
    let valoresNiveis = []
    let valorNivelAtingido = null
    
    niveis.forEach(nivel => {
        valoresNiveis.push(parseInt(nivel.minValue))
    })
    
    valoresNiveis.sort(function(a, b){return a-b}) // Organiza a lista de niveis em ordem crescente
    
    valoresNiveis.forEach(valor => {
        if (porcentagemDeAcertos >= valor) {
            valorNivelAtingido = valor
        } else { }
    })
    
    niveis.forEach(nivel => {
        if (nivel.minValue === valorNivelAtingido) {
            indiceNivel = niveis.indexOf(nivel)
        } else { }
    })
    
    tela2.innerHTML += `
    <div data-identifier="quizz-result" class="resultado-quizz">
    <div class="resultado-quizz__titulo">${niveis[indiceNivel].title}</div>
    <img src="${niveis[indiceNivel].image}" alt="">
    <p>${niveis[indiceNivel].text}</p>
    </div>
    
    <button class="reiniciar-quizz" onclick="reiniciarQuizz()">Reiniciar Quizz</button>
    <button class="voltar-home" onclick="voltarParaHome()">Voltar pra home</button>
    `
    const resultadoQuizz = document.querySelector(".resultado-quizz")
    setTimeout(() => {
        resultadoQuizz.scrollIntoView()
    }, 2000)
}

function reiniciarQuizz() {
    
    resetarVariaveisCalculoNivelAtingido()
    
    const tela2 = document.querySelector(".tela-2")
    tela2.innerHTML = ""
    
    habilitarTela2(quizzSelecionado)
}

function voltarParaHome() {
    
    resetarVariaveisCalculoNivelAtingido()
    
    const tela1 = document.querySelector(".tela-1")
    const tela2 = document.querySelector(".tela-2")
    const banner = document.querySelector(".banner")
    const main = document.querySelector("main")
    
    tela2.innerHTML = ""
    banner.innerHTML = ""
    
    tela1.classList.remove("escondido")
    tela2.classList.add("escondido")
    document.querySelector(".banner").classList.add("escondido")
    
    main.scrollIntoView(true)
    windowReaload()
}

function resetarVariaveisCalculoNivelAtingido() {
    count = 0
    acertos = 0
    niveis = []
    qtdDePerguntas = null
}

function habilitarTelaCarregando() {
    const carregando = document.querySelector(".carregando")
    carregando.classList.remove("escondido")
}

function desabilitarTelaCarregando() {
    const carregando = document.querySelector(".carregando")
    carregando.classList.add("escondido")
}

function embaralharArray(minhaArray) {
    minhaArray.sort(comparador)
    
    function comparador() { 
        return Math.random() - 0.5; 
    }

    return minhaArray
}

function habilitarTela3() {
    const tela1 = document.querySelector(".tela-1")
    const tela3 = document.querySelector(".tela-3")
    tela1.classList.add("escondido")
    tela3.classList.remove("escondido")
    
    if (editandoQuizz) {
        document.getElementById("quizz__titulo").value = editandoQuizzObj.title
        document.getElementById("quizz__imagemURL").value = editandoQuizzObj.image
        document.getElementById("quizz__perguntas").value = editandoQuizzObj.questions.length
        document.getElementById("quizz__niveis").value = editandoQuizzObj.levels.length
    }
}

// EXIBIR CRIAÇÃO DO QUIZZ
let numero__perguntas = null
let numero__niveis = null
let valido = null
let porcentagem__minima = null
let reg = /^#[0-9A-F]{6}$/i;
let objeto = {}
let questions = []
let questions__obj = {}
let answers = []
let levels = []
let levels__obj = {}
let editandoQuizz = false
let editandoQuizzObj = null

// Variaveis para validacao das informacoes básicas
let isTituloValido = false
let isURLValido = false
let isPerguntasValido = false
let isNiveisValido = false

function validarInformacoes() {
    let titulo = document.getElementById("quizz__titulo").value
    let imagem = document.getElementById("quizz__imagemURL").value
    let perguntas = document.getElementById("quizz__perguntas").value
    let niveis = document.getElementById("quizz__niveis").value
    let url = validarURL(imagem)

    validarInformacoesBasicas(titulo, imagem, perguntas, niveis, url)

    if (isTituloValido && isURLValido && isPerguntasValido && isNiveisValido) {
        habilitarPerguntas()
    } else { }
}

function validarInformacoesBasicas(titulo, imagem, perguntas, niveis, url) {

    if (titulo.length >= 20 && titulo.length <= 65) {
        removerMensagemDeErro('titulo')
        objeto.title = titulo
        isTituloValido = true
    } else {
        exibirMensagemDeErro('titulo')
    }

    if (url) {
        removerMensagemDeErro('imagemURL')
        objeto.image = imagem
        isURLValido = true
    } else {
        exibirMensagemDeErro('imagemURL')
    }

    if (parseInt(perguntas) >= 3) {
        removerMensagemDeErro('perguntas')
        numero__perguntas = perguntas
        isPerguntasValido = true
    } else {
        exibirMensagemDeErro('perguntas')
    }

    if (parseInt(niveis) >= 2) {
        removerMensagemDeErro('niveis')
        numero__niveis = niveis
        isNiveisValido = true
    } else {
        exibirMensagemDeErro('niveis')
    }
}

function exibirMensagemDeErro(elemento) {
    document.getElementById(`quizz__${elemento}`).classList.add("informacao-invalida")
    document.getElementById(`quizz__${elemento}__label`).classList.remove("escondido")
    document.querySelector(".informacoes p").innerHTML = "Informações inválidas"
}

function removerMensagemDeErro(elemento) {
    document.getElementById(`quizz__${elemento}`).classList.remove("informacao-invalida")
    document.getElementById(`quizz__${elemento}__label`).classList.add("escondido")
}

function validarURL(url) {
    if (url[0] === "h") {
        try {
            url = new URL(url);
        } catch (_) {
            return false;
        }
        return url
    } else {
        return false;
    }
}

function habilitarPerguntas() {
    document.querySelector(".informacoes").classList.add("escondido")
    document.querySelector(".perguntas").classList.remove("escondido")
    mostrarPerguntas()
}

function mostrarPerguntas() {
    for (let i = 1; i <= numero__perguntas; i++) {
        document.querySelector(".criacao__pergunta__geral").innerHTML += `
        <article data-identifier="question" id="pergunta${i}" class="criacao__pergunta guardado">

            <div id="criacao__pergunta__topo">
                <h1>Pergunta ${i}</h1>
                <ion-icon data-identifier="expand" name="create-outline" onclick="guardarSecao(this)"></ion-icon>
            </div>
            <div>
                <input type="text" id="pergunta__texto" class="pergunta__texto${i}" placeholder="Texto da pergunta">
                <label for="pergunta__texto" id="pergunta__texto__label" class="escondido">Texto da pergunta deve ter no mínimo 20 caracteres</label>
                <input type="text" id="pergunta__cor" class="pergunta__cor${i}" placeholder="Cor de fundo da pergunta">
                <label for="pergunta__cor" id="pergunta__cor__label" class="escondido">Cor de fundo deve ser uma cor em hexadecimal</label>
            </div>

            <h1>Resposta correta</h1>
            <div>
                <input type="text" id="correta__texto" class="correta__texto${i}" placeholder="Resposta correta">
                <label for="correta__texto" id="correta__texto__label" class="escondido">Não pode estar vazio</label>
                <input type="text" id="correta__url" class="correta__url${i}" placeholder="URL da imagem">
                <label for="correta__url" id="correta__url__label" class="escondido">URL inválido</label>
            </div>

            <h1>Respostas incorretas</h1>
            <div>
                <input type="text" id="incorreta1__texto" class="incorreta1__texto${i}" placeholder="Resposta incorreta 1">
                <label for="incorreta1__texto" id="incorreta1__texto__label" class="escondido">Não pode estar vazio</label>
                <input type="text" id="incorreta1__url" class="incorreta1__url${i}" placeholder="URL da imagem 1">
                <label for="incorreta1__url" id="incorreta1__url__label" class="escondido">URL inválido</label>
            </div>
            <div>
                <input type="text" id="incorreta2__texto" class="incorreta2__texto${i}" placeholder="Resposta incorreta 2">
                <label for="incorreta2__texto" id="incorreta2__texto__label" class="escondido">Não pode estar vazio</label>
                <input type="text" id="incorreta2__url" class="incorreta2__url${i}" placeholder="URL da imagem 2">
                <label for="incorreta2__url" id="incorreta2__url__label" class="escondido">URL inválido</label>
            </div>
            <div>
                <input type="text" id="incorreta3__texto" class="incorreta3__texto${i}" placeholder="Resposta incorreta 3">
                <label for="incorreta3__texto" id="incorreta3__texto__label" class="escondido">Não pode estar vazio</label>
                <input type="text" id="incorreta3__url" class="incorreta3__url${i}" placeholder="URL da imagem 3">
                <label for="incorreta3__url" id="incorreta3__url__label" class="escondido">URL inválido</label>
            </div>

        </article>
        `
    }

    if (editandoQuizz) {
        for (let i = 1; i <= numero__perguntas; i++) {
            if (typeof editandoQuizzObj.questions[i - 1] !== "undefined") {
                document.querySelector(`.pergunta__texto${i}`).value = editandoQuizzObj.questions[i - 1].title
                document.querySelector(`.pergunta__cor${i}`).value = editandoQuizzObj.questions[i - 1].color
    
                document.querySelector(`.correta__texto${i}`).value = editandoQuizzObj.questions[i - 1].answers[0].text
                document.querySelector(`.correta__url${i}`).value = editandoQuizzObj.questions[i - 1].answers[0].image
    
                document.querySelector(`.incorreta1__texto${i}`).value = editandoQuizzObj.questions[i - 1].answers[1].text
                document.querySelector(`.incorreta1__url${i}`).value = editandoQuizzObj.questions[i - 1].answers[1].image
    
                if (typeof editandoQuizzObj.questions[i - 1].answers[2] !== "undefined") {
                    document.querySelector(`.incorreta2__texto${i}`).value = editandoQuizzObj.questions[i - 1].answers[2].text
                    document.querySelector(`.incorreta2__url${i}`).value = editandoQuizzObj.questions[i - 1].answers[2].image
    
                    if (typeof editandoQuizzObj.questions[i - 1].answers[3] !== "undefined") {
                        document.querySelector(`.incorreta3__texto${i}`).value = editandoQuizzObj.questions[i - 1].answers[3].text
                        document.querySelector(`.incorreta3__url${i}`).value = editandoQuizzObj.questions[i - 1].answers[3].image
                    }
                }
            }
        }
    }
}

function validarPerguntas() {
    valido = true
    questions = []
    let perguntas = document.querySelector(".criacao__pergunta__geral").childNodes

    for (let i = 1; i < perguntas.length; i += 2) {validarPergunta(perguntas[i], i)}

    if (valido === true) {
        objeto.questions = questions
        habilitarNiveis()
    } else {
        document.querySelector(".perguntas p").innerHTML = "Informações inválidas"
    }
}

function validarPergunta(pergunta, i) {
    j = (i + 1)/2

    answers = []
    questions__obj = {}
    let answer = {}

    let texto__pergunta = pergunta.childNodes[3].childNodes[1].value
    let cor__pergunta = pergunta.childNodes[3].childNodes[5].value
    let cor__valida = reg.test(cor__pergunta)

    let correta = pergunta.childNodes[7].childNodes[1].value
    let correta__url = pergunta.childNodes[7].childNodes[5].value
    let correta__URL = validarURL(correta__url)

    let incorreta1 = pergunta.childNodes[11].childNodes[1].value
    let incorreta1__url = pergunta.childNodes[11].childNodes[5].value
    let incorreta1__URL = validarURL(incorreta1__url)

    let incorreta2 = pergunta.childNodes[13].childNodes[1].value
    let incorreta2__url = pergunta.childNodes[13].childNodes[5].value
    let incorreta2__URL = validarURL(incorreta2__url)

    let incorreta3 = pergunta.childNodes[15].childNodes[1].value
    let incorreta3__url = pergunta.childNodes[15].childNodes[5].value
    let incorreta3__URL = validarURL(incorreta3__url)

    let isTextoPerguntaValido = false
    let isCorPerguntaValido = false
    let isCorretaValido = false
    let isCorretaURLValido = false
    let isIncorreta1Valido = false
    let isIncorreta1URLValido = false
    let isIncorreta2Valido = false
    let isIncorreta2urlValido = false
    let isIncorreta2URLValido = false
    let isIncorreta3Valido = false
    let isIncorreta3urlValido = false
    let isIncorreta3URLValido = false

    if (texto__pergunta.length >= 20) {
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[3].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[1].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[1].style.marginBottom = '14px'
        isTextoPerguntaValido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[3].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[1].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[1].style.marginBottom = 0
        isTextoPerguntaValido = false
    }

    if (cor__valida) {
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[7].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[5].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[5].style.marginBottom = '14px'
        isCorPerguntaValido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[7].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[5].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[3].childNodes[5].style.marginBottom = 0
        isCorPerguntaValido = false
    }

    if (correta !== "") {
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[3].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[1].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[1].style.marginBottom = '14px'
        isCorretaValido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[3].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[1].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[1].style.marginBottom = 0
        isCorretaValido = false
    }

    if (correta__URL) {
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[7].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[5].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[5].style.marginBottom = '14px'
        isCorretaURLValido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[7].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[5].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[7].childNodes[5].style.marginBottom = 0
        isCorretaURLValido = false
    }

    if (incorreta1 !== "") {
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[3].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[1].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[1].style.marginBottom = '14px'
        isIncorreta1Valido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[3].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[1].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[1].style.marginBottom = 0
        isIncorreta1Valido = false
    }

    if (incorreta1__URL) {
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[7].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[5].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[5].style.marginBottom = '14px'
        isIncorreta1URLValido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[7].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[5].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[11].childNodes[5].style.marginBottom = 0
        isIncorreta1URLValido = false
    }

    if (incorreta2 !== "" || (incorreta2 === "" && incorreta2__url === "")) {
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[3].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[1].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[1].style.marginBottom = '14px'
        isIncorreta2Valido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[3].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[1].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[1].style.marginBottom = 0
        isIncorreta2Valido = false
    }

    if (incorreta2__url !== "" || (incorreta2 === "" && incorreta2__url === "")) {
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[7].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[5].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[5].style.marginBottom = '14px'
        isIncorreta2urlValido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[7].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[5].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[5].style.marginBottom = 0
        isIncorreta2urlValido = false
    }

    if (incorreta2__URL || (incorreta2 === "" && incorreta2__url === "")) {
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[7].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[5].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[5].style.marginBottom = '14px'
        isIncorreta2URLValido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[7].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[5].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[13].childNodes[5].style.marginBottom = 0
        isIncorreta2URLValido = false
    }

    if ((incorreta3 !== "" && incorreta2 !== "" && incorreta2__url !== "") || (incorreta3 === "" && incorreta3__url === "")) {
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[3].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[1].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[1].style.marginBottom = '14px'
        isIncorreta3Valido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[3].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[1].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[1].style.marginBottom = 0
        isIncorreta3Valido = false
    }

    if ((incorreta3__url !== "" && incorreta2 !== "" && incorreta2__url !== "") || (incorreta3 === "" && incorreta3__url === "")) {
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[7].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[5].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[5].style.marginBottom = '14px'
        isIncorreta3urlValido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[7].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[5].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[5].style.marginBottom = 0
        isIncorreta3urlValido = false
    }

    if ((incorreta3__URL && incorreta2 !== "" && incorreta2__url !== "") || (incorreta3 === "" && incorreta3__url === "")) {
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[7].classList.add("escondido")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[5].classList.remove("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[5].style.marginBottom = '14px'
        isIncorreta3URLValido = true
    } else {
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[7].classList.remove("escondido")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[5].classList.add("informacao-invalida")
        document.getElementById(`pergunta${j}`).childNodes[15].childNodes[5].style.marginBottom = 0
        isIncorreta3URLValido = false
    }

    if (!valido) {
        return valido = false
    }

    if (isTextoPerguntaValido && isCorPerguntaValido && isCorretaValido && isCorretaURLValido && isIncorreta1Valido && isIncorreta1URLValido) {
        
        answer.text = correta
        answer.image = correta__url
        answer.isCorrectAnswer = true
        answers.push(answer)
        answer = {}

        answer.text = incorreta1
        answer.image = incorreta1__url
        answer.isCorrectAnswer = false
        answers.push(answer)
        answer = {}

        if ((incorreta2 === "" && incorreta2__url === "") && (incorreta3 === "" && incorreta3__url === "")) {
            valido = true
        } else if ((incorreta2 !== "" && incorreta2__URL) && (incorreta3 === "" && incorreta3__url === "")) {
            valido = true

            answer.text = incorreta2
            answer.image = incorreta2__url
            answer.isCorrectAnswer = false
            answers.push(answer)
            answer = {}
        } else if ((!isIncorreta2Valido && !isIncorreta2URLValido) && (isIncorreta3Valido && isIncorreta3URLValido)) {
            return valido = false
        } else if ((incorreta2 !== "" && incorreta2__URL) && (incorreta3 !== "" && incorreta3__URL)) {
            valido = true

            answer.text = incorreta2
            answer.image = incorreta2__url
            answer.isCorrectAnswer = false
            answers.push(answer)
            answer = {}

            answer.text = incorreta3
            answer.image = incorreta3__url
            answer.isCorrectAnswer = false
            answers.push(answer)
            answer = {}
        } else {
            return valido = false
        }

    } else {
        return valido = false
    }

    questions__obj.title = texto__pergunta
    questions__obj.color = cor__pergunta
    questions__obj.answers = answers
    questions.push(questions__obj)
}

function habilitarNiveis() {
    document.querySelector(".perguntas").classList.add("escondido")
    document.querySelector(".niveis").classList.remove("escondido")
    window.scrollTo({top: 0, behavior: 'smooth'})
    mostrarNiveis()
}

function mostrarNiveis() {
    for (let i = 1; i <= numero__niveis; i++) {
        document.querySelector(".niveis__geral").innerHTML += `
        <article data-identifier="level" id="nivel${i}" class="nivel guardado">
            <div id="nivel__topo">
                <h1>Nível ${i}</h1>
                <ion-icon data-identifier="expand" name="create-outline" onclick="guardarSecao(this)"></ion-icon>
            </div>
            <input type="text" id="nivel__texto" class="nivel__texto${i}" placeholder="Título do nível">
            <label for="nivel__texto" id="nivel__texto__label" class="escondido">Título do nível deve ter no mínimo 10 caracteres</label>

            <input type="text" id="nivel__%" class="nivel__porcentagem${i}" placeholder="% de acerto mínima">
            <label for="nivel__%" id="nivel__%__label" class="escondido">% de acerto mínima: um número entre 0 e 100</label>

            <input type="text" id="nivel__imagem" class="nivel__imagem${i}" placeholder="URL da imagem do nível">
            <label for="nivel__imagem" id="nivel__imagem__label" class="escondido">URL inválido</label>

            <textarea name="descricao" id="nivel__descricao" rows="10" class="nivel__descricao${i}" placeholder="Descrição do nível"></textarea>
            <label for="nivel__descricao" id="nivel__descricao__label" class="escondido">Descrição do nível deve ter no mínimo de 30 caracteres</label>
        </article>
        `
    }
    if (editandoQuizz) {
        for (let i = 1; i <= numero__perguntas; i++) {
            if (typeof editandoQuizzObj.levels[i - 1] !== "undefined") {
                document.querySelector(`.nivel__texto${i}`).value = editandoQuizzObj.levels[i - 1].title
                document.querySelector(`.nivel__porcentagem${i}`).value = editandoQuizzObj.levels[i - 1].minValue
                document.querySelector(`.nivel__imagem${i}`).value = editandoQuizzObj.levels[i - 1].image
                document.querySelector(`.nivel__descricao${i}`).value = editandoQuizzObj.levels[i - 1].text
            }
        }
    }
}

function validarNiveis() {
    valido = true
    porcentagem__minima = false
    levels = []
    let niveis = document.querySelector(".niveis__geral").childNodes

    for (let i = 1; i < niveis.length; i += 2) {validarNivel(niveis[i], i)}

    if (valido && porcentagem__minima) {
        objeto.levels = levels
        habilitarSucesso()
    } else {
        document.querySelector(".niveis p").innerHTML = "Informações inválidas"
    }
}

let isTituloNivelValido = false
let isPorcentagemValido = false
let isImagemNivelURLValido = false
let isDescricaoNivelValido = false

function validarNivel(nivel, i) {
    let j = (i+1)/2

    levels__obj = {}

    let titulo__nivel = nivel.childNodes[3].value
    let porcentagem = nivel.childNodes[7].value
    let imagem__nivel = nivel.childNodes[11].value
    let imagem__nivel__url = validarURL(imagem__nivel)
    let descricao__nivel = nivel.childNodes[15].value

    validarInformacoesDosNiveis(titulo__nivel, porcentagem, imagem__nivel__url, descricao__nivel, j)

    porcentagemInteiro = parseInt(porcentagem)

    levels__obj.title = titulo__nivel
    levels__obj.image = imagem__nivel
    levels__obj.text = descricao__nivel
    levels__obj.minValue = porcentagemInteiro
    levels.push(levels__obj)
}

function validarInformacoesDosNiveis(titulo__nivel, porcentagem, imagem__nivel__url, descricao__nivel, j) {
    if (titulo__nivel.length >= 10) {
        document.getElementById(`nivel${j}`).childNodes[5].classList.add("escondido")
        document.getElementById(`nivel${j}`).childNodes[3].classList.remove("informacao-invalida")
        isPorcentagemValido = true
    } else {
        document.getElementById(`nivel${j}`).childNodes[5].classList.remove("escondido")
        document.getElementById(`nivel${j}`).childNodes[3].classList.add("informacao-invalida")
        isPorcentagemValido = false
    }

    if (parseInt(porcentagem) >= 0 && parseInt(porcentagem) <= 100) {
        document.getElementById(`nivel${j}`).childNodes[9].classList.add("escondido")
        document.getElementById(`nivel${j}`).childNodes[7].classList.remove("informacao-invalida")
        isTituloNivelValido = true
    } else {
        document.getElementById(`nivel${j}`).childNodes[9].classList.remove("escondido")
        document.getElementById(`nivel${j}`).childNodes[7].classList.add("informacao-invalida")
        isTituloNivelValido = false
    }

    if (imagem__nivel__url) {
        document.getElementById(`nivel${j}`).childNodes[13].classList.add("escondido")
        document.getElementById(`nivel${j}`).childNodes[11].classList.remove("informacao-invalida")
        isImagemNivelURLValido = true
    } else {
        document.getElementById(`nivel${j}`).childNodes[13].classList.remove("escondido")
        document.getElementById(`nivel${j}`).childNodes[11].classList.add("informacao-invalida")
        isImagemNivelURLValido = false
    }

    if (descricao__nivel.length >= 30) {
        document.getElementById(`nivel${j}`).childNodes[17].classList.add("escondido")
        document.getElementById(`nivel${j}`).childNodes[15].classList.remove("informacao-invalida")
        isDescricaoNivelValido = true
    } else {
        document.getElementById(`nivel${j}`).childNodes[17].classList.remove("escondido")
        document.getElementById(`nivel${j}`).childNodes[15].classList.add("informacao-invalida")
        isDescricaoNivelValido = false
    }

    if (!valido) {
        return valido = false
    }

    if (isPorcentagemValido && isTituloNivelValido && isImagemNivelURLValido && isDescricaoNivelValido) {
        if (parseInt(porcentagem) === 0) {
            porcentagem__minima = true
        } else { }
    } else {
        valido = false
    }
}

function habilitarSucesso() {
    if (!editandoQuizz) {
        let promessa = axios.post(QUIZZ_API, objeto)
        promessa.then(resposta => {
            window.scrollTo({ top: 0, behavior: 'smooth' })

            let tamanho = 0
            const objeto__string = JSON.stringify(resposta.data)
            while (localStorage.getItem(`objeto${tamanho}`) !== null) {
                tamanho++
            }
            localStorage.setItem(`objeto${tamanho}`, objeto__string)

            mostrarQuizzCriado()
            document.querySelector(".niveis").classList.add("escondido")
            document.querySelector(".quizz__criado").classList.remove("escondido")
        })
        promessa.catch(() => {
            alert("Erro na criação do quizz")
        })
    } else {
        postarQuizzEditado()
    }
}

function mostrarQuizzCriado() {
    habilitarTelaCarregando()
    let article = document.querySelector(".quizz__criado .quizz")
    let obj = null
    const promessa = axios.get(QUIZZ_API)
    promessa.then(resposta => {
        desabilitarTelaCarregando()

        if (!editandoQuizz) {
            obj = resposta.data[0]
        } else {
            resposta.data.forEach(quizz => {
                if (quizz.id === editandoQuizzObj.id) {
                    obj = quizz
                }
            })
            editandoQuizz = false
            editandoQuizzObj = null
        }

        article.setAttribute("id", obj.id)
        article.innerHTML = `
        <div class="degrade" style="height: 100%;"></div>
        <img src="${obj.image}" alt="quizz">
        <p>${obj.title}</p>
        `
    })
    promessa.catch(() => {
        alert("Não foi possível renderizar o quizz criado")
    })
}

function abrirQuizzCriado(botao) {
    let quizz = botao.parentNode.childNodes[3]
    habilitarTela2(quizz)
}

function voltarTelaInicial() {
    document.querySelector(".tela-1").classList.remove("escondido")
    document.querySelector(".tela-2").classList.add("escondido")
    document.querySelector(".tela-3").classList.add("escondido")
    window.location.reload()
}

function excluirQuizz(element) {
    habilitarTelaCarregando()

    if (window.confirm("Você realmente quer deletar esse quizz?")) {
        let quizz = element.parentNode.parentNode
        let key = null
        let storageNumber = null
        for (let i = 0; i < 100; i++) {
            if (localStorage.getItem(`objeto${i}`) !== null) {
                let quizzAPI = JSON.parse(localStorage.getItem(`objeto${i}`))
                if (parseInt(quizz.id) === quizzAPI.id) {
                    key = quizzAPI.key
                    storageNumber = i
                }
            }
        }
        const promessa = axios.delete(QUIZZ_API + `${quizz.id}`, {headers: {"Secret-Key": key}})
        promessa.then(() => {
            desabilitarTelaCarregando()

            localStorage.removeItem(`objeto${storageNumber}`)
            window.location.reload()
        })
        promessa.catch(() => { alert("deu ruim") })
    }
}

function editarQuizz(element) {
    habilitarTelaCarregando()

    let quizz = element.parentNode.parentNode
    let quizzObj = null
    const promessa = axios.get(QUIZZ_API)
    promessa.then(resposta => {
        desabilitarTelaCarregando()

        for (let i = 0; i < resposta.data.length; i++) {
            if (resposta.data[i].id === parseInt(quizz.id)) {
                quizzObj = resposta.data[i]
            }
        }
        editandoQuizz = true
        editandoQuizzObj = quizzObj
        habilitarTela3()
    })
}

function postarQuizzEditado() {
    habilitarTelaCarregando()

    let quizz = editandoQuizzObj
    let key = null
    let storageNumber = null
    for (let i = 0; i < 100; i++) {
        if (localStorage.getItem(`objeto${i}`) !== null) {
            let quizzAPI = JSON.parse(localStorage.getItem(`objeto${i}`))
            if (parseInt(quizz.id) === quizzAPI.id) {
                key = quizzAPI.key
                storageNumber = i
            }
        }
    }
    const promessa = axios.put(QUIZZ_API + `${quizz.id}`, objeto, { headers: { "Secret-Key": key } })
    promessa.then(resposta => {
        desabilitarTelaCarregando()

        const objeto__string = JSON.stringify(resposta.data)
        localStorage.setItem(`objeto${storageNumber}`, objeto__string)
        window.scrollTo({top: 0, behavior: 'smooth'})
        document.querySelector(".niveis").classList.add("escondido")
        document.querySelector(".quizz__criado").classList.remove("escondido") 

        mostrarQuizzCriado()
    })
    promessa.catch(() => { alert("deu ruim no axios.put") })
}

// OUTROS

function windowReaload() {
    window.location.reload()
}

function guardarSecao(element) {
    let article = element.parentNode.parentNode
    article.classList.toggle("guardado")
    if (article.classList.contains("guardado")) {
        article.style.height = "74px"
        element.setAttribute("name", "create-outline")
    } else {
        if (article.classList.contains("criacao__pergunta")) {
            article.style.height = "975px"
        } else {
            article.style.height = "439px"
        }
        element.setAttribute("name", "contract-outline")
    }
}
