document.addEventListener("DOMContentLoaded", () => {
    const uploadBtn = document.getElementById("upload-foto");
    const fotoInput = document.getElementById("foto-input");
    const downloadBtn = document.getElementById("download");
    
    // Configurar evento para botão de upload
    uploadBtn.addEventListener("click", () => {
        fotoInput.click();
    });
    
    // Configurar evento para quando uma foto é selecionada
    fotoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Verificar se é uma imagem
        if (!file.type.match('image.*')) {
            alert("Por favor, selecione uma imagem válida.");
            return;
        }
        
        // Verificar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Arquivo muito grande. O tamanho máximo é 5MB.");
            return;
        }
        
        // Mostrar preview da imagem
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById("casal-img").src = e.target.result;
            
            // Salvar a imagem no Firebase Storage
            salvarImagem(file);
        };
        reader.readAsDataURL(file);
    });
    
    // Configurar evento para botão de download
    downloadBtn.addEventListener("click", () => {
        const fotoContainer = document.getElementById("foto-container");
        
        // Usar html2canvas para capturar a imagem com o contador
        html2canvas(fotoContainer).then(canvas => {
            // Converter para URL de imagem
            const imgUrl = canvas.toDataURL("image/jpeg");
            
            // Criar um link para download
            const link = document.createElement("a");
            link.href = imgUrl;
            link.download = "nosso-relacionamento.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
});

function salvarImagem(file) {
    // Verifica se o usuário está logado
    if (!auth.currentUser) {
        alert("Você precisa estar logado para fazer upload de imagens.");
        return;
    }
    
    // Referência para o Storage
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(`imagens/${auth.currentUser.uid}/casal.jpg`);
    
    // Upload da imagem
    const uploadTask = imageRef.put(file);
    
    // Feedback de progresso do upload
    uploadTask.on('state_changed', 
        // Progresso
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload: ' + progress + '%');
        },
        // Erro
        (error) => {
            console.error("Erro no upload:", error);
            alert("Erro ao fazer upload da imagem. Tente novamente.");
        },
        // Completo
        () => {
            // Obter URL da imagem
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                console.log('Imagem disponível em:', downloadURL);
                
                // Salvar a URL no Firestore
                db.collection("relacionamento").doc("foto").set({
                    imageUrl: downloadURL,
                    uploadedBy: auth.currentUser.displayName,
                    uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    console.log("URL da imagem salva com sucesso!");
                })
                .catch(error => {
                    console.error("Erro ao salvar URL:", error);
                });
            });
        }
    );
}