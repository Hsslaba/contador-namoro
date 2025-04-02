document.addEventListener("DOMContentLoaded", async () => {
    const uploadBtn = document.getElementById("upload-foto");
    const fotoInput = document.getElementById("foto-input");
    const downloadBtn = document.getElementById("download");
    const casalImg = document.getElementById("casal-img");

    // 🔹 Carregar imagem do Firestore
    await carregarImagem();

    // Evento de upload
    uploadBtn.addEventListener("click", () => {
        fotoInput.click();
    });

    // Evento quando uma imagem é selecionada
    fotoInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Verifica se é uma imagem válida
        if (!file.type.match("image.*")) {
            alert("Por favor, selecione uma imagem válida.");
            return;
        }

        // Verifica o tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Arquivo muito grande. O tamanho máximo é 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            casalImg.src = e.target.result;

            // Enviar para o Imgur e salvar no Firestore
            const imageUrl = await salvarImagem(file);
            if (imageUrl) {
                console.log("Imagem enviada para o Imgur:", imageUrl);
                await salvarNoFirestore(imageUrl);
            }
        };
        reader.readAsDataURL(file);
    });

    // Evento de download da imagem
    downloadBtn.addEventListener("click", () => {
        const fotoContainer = document.getElementById("foto-container");

        html2canvas(fotoContainer).then((canvas) => {
            const imgUrl = canvas.toDataURL("image/jpeg");

            const link = document.createElement("a");
            link.href = imgUrl;
            link.download = "nosso-relacionamento.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
});

// 🔹 Salvar imagem no Imgur
async function salvarImagem(file) {
    const CLIENT_ID = "8cee1fdb46b14d3"; // Substitua pelo seu Client ID do Imgur

    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                Authorization: `Client-ID ${CLIENT_ID}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            return data.data.link;
        } else {
            throw new Error("Erro ao enviar imagem para o Imgur");
        }
    } catch (error) {
        console.error("Erro ao fazer upload:", error);
        return null;
    }
}

// 🔹 Salvar link da imagem no Firestore
async function salvarNoFirestore(imageUrl) {
    try {
        await db.collection("relacionamento").doc("contador").update({
            foto: imageUrl,
        });

        console.log("✅ Link salvo no Firestore com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao salvar link no Firestore:", error);
    }
}

// 🔹 Carregar imagem salva no Firestore
async function carregarImagem() {
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
