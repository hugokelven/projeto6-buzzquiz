// EXIBIR QUIZZES

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

// Exibe as perguntas do quizz selecionado
function habilitarTela2(quizz) {
    const tela1 = document.querySelector(".tela-1")
    const tela2 = document.querySelector(".tela-2")
    tela1.classList.add("escondido")
    tela2.classList.remove("escondido")

    const promessa = axios.get(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${quizz.id}`)

    promessa.then(resposta => {
        console.log(resposta.data)
        const body = document.querySelector("body")

        body.innerHTML += `
        <div class="banner">
            <div class="degrade"></div>
            <img src="${resposta.data.image}" alt="banner">
            <p>${resposta.data.title}</p>
        </div>
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
    })

    promessa.catch(erro => {
        console.log(erro)
        alert("Ops! Não foi possível abrir o quizz.")
    })
}

function embaralharArray(minhaArray) {
    minhaArray.sort(comparador)

    function comparador() { 
        return Math.random() - 0.5; 
    }

    return minhaArray
}

function selecionarResposta(respostaEscolhida) {
    const pergunta = respostaEscolhida.parentNode
    const respostas = pergunta.querySelectorAll(".pergunta__resposta")
    console.log(respostas)

    respostas.forEach(resposta => {
        resposta.classList.add("gabarito")
        resposta.onclick = null
        if (resposta !== respostaEscolhida) {
            resposta.classList.add("esbranquicar")
        } else { }
    });

    const proximaPergunta = pergunta.nextElementSibling
    console.log(proximaPergunta)
    setTimeout(() => {
        proximaPergunta.scrollIntoView()
    }, 2000)
}

function habilitarTela3() {
    const tela1 = document.querySelector(".tela-1")
    const tela3 = document.querySelector(".tela-3")
    tela1.classList.add("escondido")
    tela3.classList.remove("escondido")
}

// EXIBIR PERGUNTAS DO QUIZZ


// EXIBIR CRIAÇÃO DO QUIZZ

function validarInformacoes() {
    let titulo = document.getElementById("quizz__titulo").value
    let imagem = document.getElementById("quizz__imagemURL").value
    let perguntas = document.getElementById("quizz__perguntas").value
    let niveis = document.getElementById("quizz__niveis").value
    let url = validarURL(imagem)

    if (titulo.length >= 20 && titulo.length <= 65 && url && parseInt(perguntas) >= 3 && parseInt(niveis) >= 2) {
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
}
