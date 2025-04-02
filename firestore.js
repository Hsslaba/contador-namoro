const iniciarBtn = document.getElementById("iniciar");
const contadorTexto = document.getElementById("contador");

// Iniciar contador no Firestore
iniciarBtn.addEventListener("click", () => {
    const dataAtual = new Date();

    db.collection("relacionamento").doc("contador").set({
        dataInicio: firebase.firestore.Timestamp.fromDate(dataAtual)
    })
    .then(() => {
        contadorTexto.innerHTML = "Relacionamento iniciado!";
    })
    .catch(error => {
        console.error("Erro ao salvar:", error);
    });
});

// Carregar contador salvo no Firestore
db.collection("relacionamento").doc("contador").get().then(doc => {
    if (doc.exists) {
        const dataInicio = doc.data().dataInicio.toDate();
        contadorTexto.innerHTML = `Começamos em: ${dataInicio.toLocaleDateString("pt-BR")}`;
    }
});
