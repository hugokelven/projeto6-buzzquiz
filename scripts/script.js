// EXIBIR QUIZZES
const QUIZZ_API = 'https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/'

let existeQuizzesCriados = false

let quizzSelecionado = null
let count = 0
let acertos = 0
let niveis = []
let qtdDePerguntas = null

exibirQuizzes()

function exibirQuizzes() {
    const promessa = axios.get(QUIZZ_API)

    promessa.then(resposta => {
        console.log(resposta.data)
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
            <article id="${quizz.id}" onclick="habilitarTela2(this)" class="quizz">
                <div class="degrade"></div>
                <img src="${quizz.image}" alt="quizz">
                <p>${quizz.title}</p>
            </article>
            `

            if (existeQuizzesCriados) {
                for (let i = 0; i < localStorage.length; i++) {
                    let localQuizzString = localStorage.getItem(`objeto${i}`)
                    let localQuizz = JSON.parse(localQuizzString)
                    if (quizz.id === localQuizz.id) {
                        quizzes__criados.innerHTML += `
                        <article id="${quizz.id}" onclick="habilitarTela2(this)" class="quizz">
                            <div class="degrade"></div>
                            <img src="${quizz.image}" alt="quizz">
                            <p>${quizz.title}</p>
                        </article>
                        `
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
    const tela1 = document.querySelector(".tela-1")
    const tela2 = document.querySelector(".tela-2")
    const tela3 = document.querySelector(".tela-3")
    tela1.classList.add("escondido")
    tela2.classList.remove("escondido")
    tela3.classList.add("escondido")

    quizzSelecionado = quizz

    const promessa = axios.get(QUIZZ_API + `${quizz.id}`)

    promessa.then(resposta => {
        console.log(resposta.data)
        const banner = document.querySelector(".banner")
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
        <div id="pergunta_${indiceDaPergunta}" class="pergunta">
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
        <div class="pergunta__resposta ${isRespostaCorreta}" onclick="selecionarResposta(this)">
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

function validarInformacoes() {
    let titulo = document.getElementById("quizz__titulo").value
    let imagem = document.getElementById("quizz__imagemURL").value
    let perguntas = document.getElementById("quizz__perguntas").value
    let niveis = document.getElementById("quizz__niveis").value
    let url = validarURL(imagem)

    if (titulo.length >= 20 && titulo.length <= 65 && url && parseInt(perguntas) >= 3 && parseInt(niveis) >= 2) {
        numero__perguntas = perguntas
        numero__niveis = niveis
        objeto.title = titulo
        objeto.image = imagem
        habilitarPerguntas()
    } else {
        document.querySelector(".informacoes p").innerHTML = "Informações inválidas"
    }
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
    questions = []
    let perguntas = document.querySelector(".criacao__pergunta__geral").childNodes

    for (let i = 1; i < perguntas.length; i += 2) {validarPergunta(perguntas[i])}

    if (valido === true) {
        objeto.questions = questions
        habilitarNiveis()
    } else {
        document.querySelector(".perguntas p").innerHTML = "Informações inválidas"
    }
}

function validarPergunta(pergunta) {
    if (!valido) {
        return valido = false
    }

    answers = []
    questions__obj = {}
    let answer = {}

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

        } else if ((incorreta2 === "" && incorreta2__url === "") && (incorreta3 !== "" && incorreta3__URL)) {
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
        <article class="nivel">
            <h1>Nível ${i}</h1>
            <input type="text" id="nivel__texto" placeholder="Título do nível">
            <input type="text" id="nivel__%" placeholder="% de acerto mínima">
            <input type="text" id="nivel__imagem" placeholder="URL da imagem do nível">
            <textarea name="descricao" id="nivel__descricao" rows="10" placeholder="Descrição do nível"></textarea>
        </article>
        `
    }
}

function validarNiveis() {
    valido = true
    porcentagem__minima = false
    levels = []
    let niveis = document.querySelector(".niveis__geral").childNodes

    for (let i = 1; i < niveis.length; i += 2) {validarNivel(niveis[i])}

    if (valido && porcentagem__minima) {
        objeto.levels = levels
        habilitarSucesso()
    } else {
        document.querySelector(".niveis p").innerHTML = "Informações inválidas"
    }
}

function validarNivel(nivel) {
    if (!valido) {
        return valido = false
    }

    levels__obj = {}

    let titulo__nivel = nivel.childNodes[3].value
    let porcentagem = nivel.childNodes[5].value
    let imagem__nivel = nivel.childNodes[7].value
    let imagem__nivel__url = validarURL(imagem__nivel)
    let descricao__nivel = nivel.childNodes[9].value

    if (titulo__nivel.length >= 10 && parseInt(porcentagem) >= 0 && parseInt(porcentagem) <= 100 && imagem__nivel__url && descricao__nivel.length >= 30) {
        valido = true
        if (parseInt(porcentagem) === 0) {
            porcentagem__minima = true
        }
    } else {
        valido = false
    }

    porcentagemInteiro = parseInt(porcentagem)

    levels__obj.title = titulo__nivel
    levels__obj.image = imagem__nivel
    levels__obj.text = descricao__nivel
    levels__obj.minValue = porcentagemInteiro
    levels.push(levels__obj)
}

function habilitarSucesso() {
    let promessa = axios.post("https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes", objeto)
    promessa.then(resposta => {
        window.scrollTo({top: 0, behavior: 'smooth'})

        let tamanho = localStorage.length
        const objeto__string = JSON.stringify(resposta.data)
        localStorage.setItem(`objeto${tamanho}`, objeto__string)

        mostrarQuizzCriado()
        document.querySelector(".niveis").classList.add("escondido")
        document.querySelector(".quizz__criado").classList.remove("escondido")
    })
    promessa.catch(() => {
        alert("Erro na criação do quizz")
    })
}

function mostrarQuizzCriado() {
    let article = document.querySelector(".quizz__criado .quizz")
    const promessa = axios.get('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes')
    promessa.then(resposta => {
        let obj = resposta.data[0]
        article.setAttribute("id", obj.id)
        article.innerHTML = `
        <div class="degrade"></div>
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
