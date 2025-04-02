document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login");
    const logoutBtn = document.getElementById("logout");
    const iniciarBtn = document.getElementById("iniciar");
    const uploadBtn = document.getElementById("upload-foto");
    const downloadBtn = document.getElementById("download");

    async function carregarFotoSalva() {
        try {
            const doc = await db.collection("relacionamento").doc("contador").get();
    
            if (doc.exists) {
                const data = doc.data();
                if (data.foto) {
                    console.log("🔹 Imagem carregada do Firestore:", data.foto);
                    document.getElementById("casal-img").src = data.foto;
                } else {
                    console.warn("⚠ Nenhuma imagem encontrada no Firestore.");
                }
            } else {
                console.warn("⚠ Documento 'contador' não encontrado.");
            }
        } catch (error) {
            console.error("❌ Erro ao buscar imagem no Firestore:", error);
        }
    }
    window.carregarFotoSalva = carregarFotoSalva;

    // Função local que tem acesso a todos os elementos
    function verificarRelacionamentoLocal() {
        db.collection("relacionamento").doc("contador").get().then(doc => {
            if (doc.exists) {
                atualizarContador(doc.data().dataInicio.toDate());
                iniciarBtn.disabled = true;
                iniciarBtn.textContent = "Relacionamento já iniciado";
                
                // Habilita o botão de upload de foto e download
                uploadBtn.disabled = false;
                downloadBtn.disabled = false;
                
                // Verifica se há uma foto salva
                carregarFotoSalva();
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
            
            // Usa a função local que tem acesso ao botão
            verificarRelacionamentoLocal();
        } else {
            console.log("Nenhum usuário logado.");
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
            iniciarBtn.disabled = true;
            uploadBtn.disabled = true;
            downloadBtn.disabled = true;
            
            document.getElementById("tempo").textContent = "Faça login para começar";
            document.getElementById("detalhes").textContent = "";
            
            // Reseta o overlay da imagem
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
    
    // Se precisar chamar esta função de outro lugar, defina uma versão global
    window.verificarRelacionamento = verificarRelacionamentoLocal;

});

// Se precisar manter a função global para compatibilidade com código existente
function verificarRelacionamento() {
    document.getElementById("iniciar")?.disabled 
        ? console.log("Botão já está desabilitado") 
        : window.verificarRelacionamento?.();
}

