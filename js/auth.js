document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login");
    const logoutBtn = document.getElementById("logout");
    const iniciarBtn = document.getElementById("iniciar");
    const uploadBtn = document.getElementById("upload-foto");
    const downloadBtn = document.getElementById("download");

    function carregarFotoSalva(userId) {
        db.collection("relacionamento").doc(userId).get().then(doc => {
            if (doc.exists && doc.data().foto) {
                const imageUrl = doc.data().foto;
                console.log("🔹 URL da imagem recuperada do Firestore:", imageUrl);

                const imgElement = document.getElementById("casal-img");
                imgElement.onload = () => console.log("✅ Imagem carregada com sucesso!");
                imgElement.onerror = () => console.error("❌ Erro ao carregar a imagem!");
                imgElement.src = imageUrl;
            } else {
                console.warn("⚠ Nenhuma imagem encontrada no Firestore.");
                document.getElementById("casal-img").src = ""; // Remover imagem se não houver
            }
        }).catch(error => {
            console.error("Erro ao carregar imagem:", error);
        });
    }
    window.carregarFotoSalva = carregarFotoSalva;

    function verificarOuCriarRelacionamento(userId) {
        const userRef = db.collection("relacionamento").doc(userId);
    
        userRef.get().then(doc => {
            if (doc.exists) {
                console.log("🔹 Relacionamento encontrado para o usuário:", userId);
                carregarRelacionamento(userId);
            } else {
                console.log("⚠ Nenhum relacionamento encontrado. Criando um novo...");
                criarNovoRelacionamento(userId);
            }
        }).catch(error => {
            console.error("Erro ao buscar relacionamento:", error);
        });
    }

    function criarNovoRelacionamento(userId) {
        db.collection("relacionamento").doc(userId).set({
            dataInicio: firebase.firestore.Timestamp.now(),
            foto: "" // Começa sem foto
        }).then(() => {
            console.log("✅ Novo relacionamento criado para o usuário:", userId);
            carregarRelacionamento(userId);
        }).catch(error => {
            console.error("Erro ao criar novo relacionamento:", error);
        });
    }

    function carregarRelacionamento(userId) {
        db.collection("relacionamento").doc(userId).get().then(doc => {
            if (doc.exists) {
                const dados = doc.data();
                atualizarContador(dados.dataInicio.toDate());
                iniciarBtn.disabled = true;
                iniciarBtn.textContent = "Relacionamento já iniciado";
                
                uploadBtn.disabled = false;
                downloadBtn.disabled = false;
                if (dados.foto) {
                    document.getElementById("casal-img").src = dados.foto;
                } else {
                    console.warn("⚠ Nenhuma imagem encontrada.");
                    document.getElementById("casal-img").src = ""; // Evita erro ao carregar imagem
                }
            }
        }).catch(error => {
            console.error("Erro ao carregar relacionamento:", error);
        });
    }

    function verificarRelacionamentoLocal(userId) {
        db.collection("relacionamento").doc(userId).get().then(doc => {
            if (doc.exists) {
                atualizarContador(doc.data().dataInicio.toDate());
                iniciarBtn.disabled = true;
                iniciarBtn.textContent = "Relacionamento já iniciado";
                
                uploadBtn.disabled = false;
                downloadBtn.disabled = false;
                
                carregarFotoSalva(userId);
            } else {
                document.getElementById("tempo").textContent = "Nenhum relacionamento iniciado";
                document.getElementById("detalhes").textContent = "Clique no botão para iniciar";
                iniciarBtn.disabled = false;
            }
        }).catch(error => {
            console.error("Erro ao verificar relacionamento:", error);
        });
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("Usuário logado:", user.displayName);
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
            iniciarBtn.disabled = false;

            verificarOuCriarRelacionamento(user.uid);
        } else {
            console.log("Nenhum usuário logado.");
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
            iniciarBtn.disabled = true;
            uploadBtn.disabled = true;
            downloadBtn.disabled = true;
            
            document.getElementById("tempo").textContent = "Faça login para começar";
            document.getElementById("detalhes").textContent = "";
            
            document.getElementById("anos").textContent = "0 anos.";
            document.getElementById("meses").textContent = "0 meses.";
            document.getElementById("dias").textContent = "0 dias.";
            document.getElementById("horas").textContent = "0 horas.";
            document.getElementById("segundos").textContent = "0 segundos";
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
    
    window.verificarRelacionamento = () => {
        const user = auth.currentUser;
        if (user) {
            verificarRelacionamentoLocal(user.uid);
        } else {
            console.log("Usuário não autenticado.");
        }
    };
});

function verificarRelacionamento() {
    document.getElementById("iniciar")?.disabled 
        ? console.log("Botão já está desabilitado") 
        : window.verificarRelacionamento?.();
}
