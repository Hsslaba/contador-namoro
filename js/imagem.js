document.addEventListener("DOMContentLoaded", async () => {
    const uploadBtn = document.getElementById("upload-foto");
    const fotoInput = document.getElementById("foto-input");
    const downloadBtn = document.getElementById("download");
    const casalImg = document.getElementById("casal-img");

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await carregarImagem(user.uid);
        }
    });

    uploadBtn.addEventListener("click", () => {
        fotoInput.click();
    });

    fotoInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match("image.*")) {
            alert("Por favor, selecione uma imagem válida.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Arquivo muito grande. O tamanho máximo é 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            casalImg.src = e.target.result;

            const user = auth.currentUser;
            if (user) {
                const imageUrl = await salvarImagem(file, user.uid);
                if (imageUrl) {
                    console.log("Imagem enviada para o Imgur:", imageUrl);
                    await salvarNoFirestore(imageUrl, user.uid);
                }
            }
        };
        reader.readAsDataURL(file);
    });

    downloadBtn.addEventListener("click", () => {
        const fotoContainer = document.getElementById("foto-container");
        const imgElement = fotoContainer.querySelector("img");
    
        if (!imgElement || !imgElement.complete) {
            alert("Aguarde a imagem carregar completamente antes de baixar.");
            return;
        }
    
        html2canvas(fotoContainer, {
            useCORS: true,
            allowTaint: false, // Taint pode causar problemas com imagens externas
            scale: 2,
        }).then((canvas) => {
            const imgUrl = canvas.toDataURL("image/jpeg", 1.0);
    
            const link = document.createElement("a");
            link.href = imgUrl;
            link.download = "nosso-relacionamento.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch((error) => {
            console.error("Erro ao gerar imagem:", error);
            alert("Erro ao gerar a imagem. Tente novamente.");
        });
    });
});

async function salvarImagem(file, userId) {
    const CLIENT_ID = "8cee1fdb46b14d3";
    
    const formData = new FormData();
    formData.append("image", file);
    
    try {
        const response = await fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                "Authorization": `Client-ID ${CLIENT_ID}`
            },
            body: formData
        });
        
        const data = await response.json();
        if (data.success) {
            const imageUrl = data.data.link;
            console.log("Imagem enviada para o Imgur:", imageUrl);

            return db.collection("relacionamento").doc(userId).update({
                foto: imageUrl
            }).then(() => {
                console.log("✅ URL da imagem salva no Firestore!");
                carregarImagem(userId);
                return imageUrl;
            }).catch(error => {
                console.error("❌ Erro ao salvar URL no Firestore:", error);
                return null;
            });
        } else {
            throw new Error("Erro ao enviar imagem para o Imgur");
        }
    } catch (error) {
        console.error("Erro ao fazer upload:", error);
        return null;
    }
}

async function salvarNoFirestore(imageUrl, userId) {
    try {
        await db.collection("relacionamento").doc(userId).update({
            foto: imageUrl,
        });
        console.log("✅ Link salvo no Firestore com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao salvar link no Firestore:", error);
    }
}

async function carregarImagem(userId) {
    try {
        const doc = await db.collection("relacionamento").doc(userId).get();

        if (doc.exists) {
            const data = doc.data();
            if (data.foto) {
                console.log("🔹 Imagem carregada do Firestore:", data.foto);
                document.getElementById("casal-img").src = data.foto;
            } else {
                console.warn("⚠ Nenhuma imagem encontrada no Firestore.");
            }
        } else {
            console.warn("⚠ Documento do usuário não encontrado.");
        }
    } catch (error) {
        console.error("❌ Erro ao buscar imagem no Firestore:", error);
    }
}
