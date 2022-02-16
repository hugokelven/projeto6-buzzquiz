exibirQuizzes()

function exibirQuizzes() {
    const promessa = axios.get('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes')

    promessa.then(resposta => {
        console.log(resposta.data)
        const quizzes = document.querySelector(".quizzes")
        quizzes.innerHTML = ""

        resposta.data.forEach(quizz => {
            quizzes.innerHTML += `
            <article onclick="habilitarTela2(this)">
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
    const tela3 = document.querySelector(".tela-3")
    tela3.classList.remove("escondido")
}