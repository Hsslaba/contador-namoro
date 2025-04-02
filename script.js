const auth = firebase.auth();
const db = firebase.firestore();

const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const iniciarBtn = document.getElementById("iniciar");
const contadorTexto = document.getElementById("contador");

// Verifica se o usuário está logado
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("Usuário logado:", user.displayName);
        loginBtn.style.display = "none";
        logoutBtn.style.display = "block";
        iniciarBtn.disabled = false;
    } else {
        console.log("Nenhum usuário logado.");
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
        iniciarBtn.disabled = true;
    }
});

// Login com Google
loginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => {
        console.error("Erro no login:", error);
    });
});

// Logout
logoutBtn.addEventListener("click", () => {
    auth.signOut();
});

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
