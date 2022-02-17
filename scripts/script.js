// EXIBIR QUIZZES

let quizzSelecionado = null
let count = 0
let acertos = 0
let niveis = []
let qtdDePerguntas = null

exibirQuizzes()

function exibirQuizzes() {
    const promessa = axios.get('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes')

    promessa.then(resposta => {
        console.log(resposta.data)
        const quizzes = document.querySelector(".quizzes")
        quizzes.innerHTML = ""

        resposta.data.forEach(quizz => {
            quizzes.innerHTML += `
            <article id="${quizz.id}" onclick="habilitarTela2(this)" class="quizz">
                <div class="degrade"></div>
                <img src="${quizz.image}" alt="quizz">
                <p>${quizz.title}</p>
            </article>
            `
        });
    })

    promessa.catch(erro => {
        console.log(erro)
        alert("Alguma coisa deu ruim!")
    })
}

// EXIBIR PERGUNTAS DO QUIZZ SELECIONADO
function habilitarTela2(quizz) {
    const tela1 = document.querySelector(".tela-1")
    const tela2 = document.querySelector(".tela-2")
    tela1.classList.add("escondido")
    tela2.classList.remove("escondido")

    quizzSelecionado = quizz

    const promessa = axios.get(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${quizz.id}`)

    promessa.then(resposta => {
        console.log(resposta.data)
        const banner = document.querySelector(".banner")

        banner.innerHTML += `
            <div class="degrade"></div>
            <img src="${resposta.data.image}" alt="banner">
            <p>${resposta.data.title}</p>
        `
        const tela2 = document.querySelector(".tela-2")
        let indiceDaPergunta = 1

        resposta.data.questions.forEach(pergunta => {
            tela2.innerHTML += `
            <div id="pergunta_${indiceDaPergunta}" class="pergunta">
                <div class="pergunta__titulo" style="background-color: ${pergunta.color};">${pergunta.title}</div>
            </div>
            `
            const perguntaAtual = document.getElementById(`pergunta_${indiceDaPergunta}`)

            pergunta.answers = embaralharArray(pergunta.answers)

            pergunta.answers.forEach(resposta => {
                let isRespostaCorreta = ""
                if (resposta.isCorrectAnswer) {
                    isRespostaCorreta = 'correta'
                } else {
                    isRespostaCorreta = 'errada'
                }

                perguntaAtual.innerHTML += `
                <div class="pergunta__resposta ${isRespostaCorreta}" onclick="selecionarResposta(this)">
                    <img src=${resposta.image} alt="">
                    <p>${resposta.text}</p>
                </div>
                `
            });
            indiceDaPergunta++
        });

        niveis = resposta.data.levels
        qtdDePerguntas = resposta.data.questions.length
    })

    promessa.catch(erro => {
        console.log(erro)
        alert("Ops! Não foi possível abrir o quizz.")
    })
}

function selecionarResposta(respostaEscolhida) {
    count++
    const pergunta = respostaEscolhida.parentNode
    const respostas = pergunta.querySelectorAll(".pergunta__resposta")

    respostas.forEach(resposta => {
        resposta.classList.add("gabarito")
        resposta.onclick = null
        if (resposta !== respostaEscolhida) {
            resposta.classList.add("esbranquicar")
        } else { }
    });

    if (respostaEscolhida.classList.contains("correta")) {
        acertos++
    }

    const proximaPergunta = pergunta.nextElementSibling
    setTimeout(() => {
        proximaPergunta.scrollIntoView()
    }, 2000)

    const tela2 = document.querySelector(".tela-2")
    let porcentagemDeAcertos = (acertos/qtdDePerguntas)*100
    porcentagemDeAcertos = Math.round(porcentagemDeAcertos)
    console.log(porcentagemDeAcertos)

    if (count === qtdDePerguntas) {

        let indiceNivel = null
        niveis.forEach(nivel => {
            if (porcentagemDeAcertos >= nivel.minValue) {
                indiceNivel = niveis.indexOf(nivel)
            }
        })

        tela2.innerHTML += `
        <div class="resultado-quizz">
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

    } else { }
}

function reiniciarQuizz() {
    count = 0
    acertos = 0
    niveis = []
    qtdDePerguntas = null

    const tela2 = document.querySelector(".tela-2")
    tela2.innerHTML = ""

    habilitarTela2(quizzSelecionado)
}

function voltarParaHome() {
    count = 0
    acertos = 0
    niveis = []
    qtdDePerguntas = null

    const tela1 = document.querySelector(".tela-1")
    const tela2 = document.querySelector(".tela-2")
    const banner = document.querySelector(".banner")
    const main = document.querySelector("main")

    tela2.innerHTML = ""
    banner.innerHTML = ""

    tela1.classList.remove("escondido")
    tela2.classList.add("escondido")

    main.scrollIntoView(true)
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
}

// EXIBIR PERGUNTAS DO QUIZZ


// EXIBIR CRIAÇÃO DO QUIZZ
let numero__perguntas = null
let valido = null
let reg = /^#([0-9a-f]{3}){1,2}$/i;

function validarInformacoes() {
    let titulo = document.getElementById("quizz__titulo").value
    let imagem = document.getElementById("quizz__imagemURL").value
    let perguntas = document.getElementById("quizz__perguntas").value
    let niveis = document.getElementById("quizz__niveis").value
    let url = validarURL(imagem)

    if (titulo.length >= 20 && titulo.length <= 65 && url && parseInt(perguntas) >= 3 && parseInt(niveis) >= 2) {
        numero__perguntas = perguntas
        habilitarPerguntas()
    } else {
        document.querySelector(".informacoes p").innerHTML = "Informações inválidas"
    }
}

function validarURL(url) {
    try {
        url = new URL(url);
    } catch (_) {
        return false;
    }
    return url
}

function habilitarPerguntas() {
    document.querySelector(".informacoes").classList.add("escondido")
    document.querySelector(".perguntas").classList.remove("escondido")
    mostrarPerguntas()
}

function mostrarPerguntas() {
    for (let i = 1; i <= numero__perguntas; i++) {
        document.querySelector(".criacao__pergunta__geral").innerHTML += `
        <article class="criacao__pergunta">
    
            <h1>Pergunta ${i}</h1>
            <div>
                <input type="text" id="pergunta__texto" placeholder="Texto da pergunta">
                <input type="text" id="pergunta__cor" placeholder="Cor de fundo da pergunta">
            </div>

            <h1>Resposta correta</h1>
            <div>
                <input type="text" id="correta__texto" placeholder="Resposta correta">
                <input type="text" id="correta__url" placeholder="URL da imagem">
            </div>

            <h1>Respostas incorretas</h1>
            <div>
                <input type="text" id="incorreta1__texto" placeholder="Resposta incorreta 1">
                <input type="text" id="incorreta1__url" placeholder="URL da imagem 1">
            </div>
            <div>
                <input type="text" id="incorreta2__texto" placeholder="Resposta incorreta 2">
                <input type="text" id="incorreta2__url" placeholder="URL da imagem 2">
            </div>
            <div>
                <input type="text" id="incorreta3__texto" placeholder="Resposta incorreta 3">
                <input type="text" id="incorreta3__url" placeholder="URL da imagem 3">
            </div>

        </article>
    `
    }
}

function validarPerguntas() {
    valido = true
    let teste = document.querySelector(".criacao__pergunta__geral").childNodes

    for (let i = 1; i < teste.length; i += 2) {validarPergunta(teste[i])}

    if (valido === true) {
        habilitarNiveis()
    } else {
        document.querySelector(".perguntas p").innerHTML = "Informações inválidas"
    }
}

function validarPergunta(pergunta) {
    if (!valido) {
        return valido = false
    }
    let texto__pergunta = pergunta.childNodes[3].childNodes[1].value
    let cor__pergunta = pergunta.childNodes[3].childNodes[3].value
    let cor__valida = reg.test(cor__pergunta)

    let correta = pergunta.childNodes[7].childNodes[1].value
    let correta__url = pergunta.childNodes[7].childNodes[3].value
    let correta__URL = validarURL(correta__url)

    let incorreta1 = pergunta.childNodes[11].childNodes[1].value
    let incorreta1__url = pergunta.childNodes[11].childNodes[3].value
    let incorreta1__URL = validarURL(incorreta1__url)

    let incorreta2 = pergunta.childNodes[13].childNodes[1].value
    let incorreta2__url = pergunta.childNodes[13].childNodes[3].value
    let incorreta2__URL = validarURL(incorreta2__url)

    let incorreta3 = pergunta.childNodes[15].childNodes[1].value
    let incorreta3__url = pergunta.childNodes[15].childNodes[3].value
    let incorreta3__URL = validarURL(incorreta3__url)

    if (texto__pergunta.length >= 20 && cor__valida && correta !== "" && correta__URL && incorreta1 !== "" && incorreta1__URL) {

        if ((incorreta2 === "" && incorreta2__url === "") && (incorreta3 === "" && incorreta3__url === "")) {
            valido = true
        } else if ((incorreta2 !== "" && incorreta2__URL) && (incorreta3 === "" && incorreta3__url === "")) {
            valido = true
        } else if ((incorreta2 === "" && incorreta2__url === "") && (incorreta3 !== "" && incorreta3__URL)) {
            return valido = false
        } else if ((incorreta2 !== "" && incorreta2__URL) && (incorreta3 !== "" && incorreta3__URL)) {
            valido = true
        } else {
            return valido = false
        }

    } else {
        return valido = false
    }
}

function habilitarNiveis() {
    document.querySelector(".perguntas").classList.add("escondido")
    document.querySelector(".niveis").classList.remove("escondido")
}
