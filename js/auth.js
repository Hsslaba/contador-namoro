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
    
                imgElement.src = imageUrl;
    
                imgElement.onload = () => console.log("✅ Imagem carregada com sucesso!");
                imgElement.onerror = () => {
                    console.error("❌ Erro ao carregar a imagem! Tentando novamente...");
                    setTimeout(() => carregarFotoSalva(userId), 1000); // Tenta carregar novamente após 1s
                };
            } else {
                console.warn("⚠ Nenhuma imagem encontrada no Firestore.");
                document.getElementById("casal-img").src = "default.jpg"; // Define uma imagem padrão
            }
        }).catch(error => {
            console.error("Erro ao carregar imagem:", error);
        });
    }
    
    window.carregarFotoSalva = carregarFotoSalva;

    function salvarFoto(userId, imageUrl) {
        db.collection("relacionamento").doc(userId).set({ foto: imageUrl }, { merge: true })
            .then(() => console.log("✅ Foto salva no Firestore!"))
            .catch(error => console.error("❌ Erro ao salvar a foto:", error));
    }

    function verificarRelacionamentoLocal(userId) {
        db.collection("relacionamento").doc(userId).get().then(doc => {
            if (doc.exists) {
                const dados = doc.data();
    
                if (dados.dataInicio) {
                    atualizarContador(dados.dataInicio.toDate());
                    iniciarBtn.disabled = true;
                    iniciarBtn.textContent = "Relacionamento já iniciado";
                } else {
                    iniciarBtn.disabled = false;
                }
    
                uploadBtn.disabled = false;
                downloadBtn.disabled = false;
                carregarFotoSalva(userId);
            } else {
                console.log("⚠ Nenhum relacionamento encontrado. Criando entrada vazia...");
                db.collection("relacionamento").doc(userId).set({ foto: "" }, { merge: true }).then(() => {
                    carregarFotoSalva(userId);
                });
                iniciarBtn.disabled = false;
                uploadBtn.disabled = false;
                downloadBtn.disabled = true;
            }
        }).catch(error => {
            console.error("Erro ao verificar relacionamento:", error);
        });
    }
    

    function iniciarRelacionamento(userId) {
        db.collection("relacionamento").doc(userId).get().then(doc => {
            if (doc.exists) {
                const dados = doc.data();
                const fotoExistente = dados.foto || ""; // Mantém a foto salva
    
                db.collection("relacionamento").doc(userId).update({
                    dataInicio: firebase.firestore.Timestamp.now(),
                    foto: fotoExistente // Evita sobrescrever com vazio
                }).then(() => {
                    console.log("✅ Relacionamento iniciado sem perder a foto!");
                    carregarRelacionamento(userId);
                }).catch(error => {
                    console.error("❌ Erro ao iniciar relacionamento:", error);
                });
            } else {
                console.error("⚠ Erro: Tentando iniciar um relacionamento sem documento existente.");
            }
        }).catch(error => {
            console.error("Erro ao buscar relacionamento antes de iniciar:", error);
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

    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("Usuário logado:", user.displayName);
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
            iniciarBtn.disabled = false;

            verificarRelacionamentoLocal(user.uid); // Agora não inicia automaticamente
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

    iniciarBtn.addEventListener("click", () => {
        const user = auth.currentUser;
        if (user) {
            if (confirm("Deseja iniciar o relacionamento? Isso salvará a data permanentemente.")) {
                iniciarRelacionamento(user.uid);
            }
        } else {
            alert("Você precisa estar logado para iniciar um relacionamento.");
        }
    });

    uploadBtn.addEventListener("change", async (event) => {
        const user = auth.currentUser;
        if (!user) {
            alert("Você precisa estar logado para salvar uma imagem!");
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`relacionamentos/${user.uid}/${file.name}`);

        try {
            const snapshot = await fileRef.put(file);
            const imageUrl = await snapshot.ref.getDownloadURL();

            console.log("✅ Imagem enviada com sucesso:", imageUrl);
            salvarFoto(user.uid, imageUrl);
            document.getElementById("casal-img").src = imageUrl;
        } catch (error) {
            console.error("❌ Erro ao enviar a imagem:", error);
        }
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
