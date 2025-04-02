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
            
            // Salvar a imagem no Cloudinary
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
    if (!auth.currentUser) {
        alert("Você precisa estar logado para fazer upload de imagens.");
        return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "SEU_UPLOAD_PRESET"); // Configure no Cloudinary

    fetch("https://api.cloudinary.com/v1_1/SEU_CLOUD_NAME/image/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Imagem salva:", data.secure_url);
        
        // Salvar a URL no Firestore
        db.collection("relacionamento").doc("foto").set({
            imageUrl: data.secure_url,
            uploadedBy: auth.currentUser.displayName,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("URL da imagem salva com sucesso!");
        })
        .catch(error => {
            console.error("Erro ao salvar URL:", error);
        });
    })
    .catch(error => console.error("Erro ao fazer upload:", error));
}