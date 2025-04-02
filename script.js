// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_ID",
    appId: "SUA_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const tempoTexto = document.getElementById("tempo");
const botao = document.getElementById("iniciar");

// Atualiza o tempo decorrido
function atualizarTempo(dataInicio) {
    setInterval(() => {
        let agora = new Date();
        let inicio = new Date(dataInicio.seconds * 1000);
        let diff = agora - inicio;

        let anos = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
        let meses = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        let dias = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        let horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let segundos = Math.floor((diff % (1000 * 60)) / 1000);

        tempoTexto.innerHTML = `${anos} anos. ${meses} meses. ${dias} dias.<br> ${horas} horas. ${segundos} segundos`;
    }, 1000);
}

// Busca a data salva no Firestore
db.collection("relacionamento").doc("contador").get().then(doc => {
    if (doc.exists) {
        atualizarTempo(doc.data().dataInicio);
    } else {
        tempoTexto.innerHTML = "Clique para iniciar!";
    }
});

// Botão para iniciar o contador
botao.addEventListener("click", () => {
    let agora = new Date();
    db.collection("relacionamento").doc("contador").set({
        dataInicio: firebase.firestore.Timestamp.fromDate(agora)
    }).then(() => {
        atualizarTempo({ seconds: agora.getTime() / 1000 });
    });
});
