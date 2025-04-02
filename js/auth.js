document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login");
    const logoutBtn = document.getElementById("logout");
    const iniciarBtn = document.getElementById("iniciar");

    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("Usuário logado:", user.displayName);
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
            iniciarBtn.disabled = false;
            
            // Verifica se já existe um relacionamento iniciado
            verificarRelacionamento();
        } else {
            console.log("Nenhum usuário logado.");
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
            iniciarBtn.disabled = true;
            
            document.getElementById("tempo").textContent = "Faça login para começar";
            document.getElementById("detalhes").textContent = "";
        }
    });

    loginBtn.addEventListener("click", () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(error => {
            console.error("Erro no login:", error);
            alert("Erro ao fazer login: " + error.message);
        });
    });

    logoutBtn.addEventListener("click", () => {
        auth.signOut().then(() => {
            console.log("Usuário deslogado com sucesso");
        }).catch(error => {
            console.error("Erro ao sair:", error);
        });
    });
});

function verificarRelacionamento() {
    db.collection("relacionamento").doc("contador").get().then(doc => {
        if (doc.exists) {
            atualizarContador(doc.data().dataInicio.toDate());
            iniciarBtn.disabled = true;
            iniciarBtn.textContent = "Relacionamento já iniciado";
        } else {
            document.getElementById("tempo").textContent = "Nenhum relacionamento iniciado";
            document.getElementById("detalhes").textContent = "Clique no botão para iniciar";
            iniciarBtn.disabled = false;
        }
    }).catch(error => {
        console.error("Erro ao verificar relacionamento:", error);
    });
}