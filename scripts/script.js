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
            <article onclick="habilitarTela2(this)" class="quizz">
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

function habilitarTela2(quizz) {
    const tela2 = document.querySelector(".tela-2")
    tela2.classList.remove("escondido")
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
