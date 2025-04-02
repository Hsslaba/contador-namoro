document.addEventListener("DOMContentLoaded", async () => {
    const uploadBtn = document.getElementById("upload-foto");
    const fotoInput = document.getElementById("foto-input");
    const downloadBtn = document.getElementById("download");

    // 🔹 Carregar imagem salva no Firebase Firestore ao iniciar
    await carregarImagem();

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
            document.getElementById("casal-img").src = e.target.result;

            const imageUrl = await salvarImagem(file);
            if (imageUrl) {
                console.log("Imagem enviada para o Imgur:", imageUrl);
                await salvarUrlNoFirestore(imageUrl);
            }
        };
        reader.readAsDataURL(file);
    });

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

// 🔹 Função para enviar a imagem para o Imgur
async function salvarImagem(file) {
    const CLIENT_ID = "8cee1fdb46b14d3";

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

// 🔹 Função para salvar a URL no Firebase Firestore
async function salvarUrlNoFirestore(imageUrl) {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para salvar imagens.");
        return;
    }

    try {
        await db.collection("relacionamento").doc("foto").set({
            imageUrl: imageUrl,
            uploadedBy: auth.currentUser.displayName || "Anônimo",
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        console.log("URL da imagem salva no Firestore!");
    } catch (error) {
        console.error("Erro ao salvar URL no Firestore:", error);
    }
}

// 🔹 Função para carregar a imagem salva no Firestore ao iniciar
async function carregarImagem() {
    try {
        const doc = await db.collection("relacionamento").doc("foto").get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById("casal-img").src = data.imageUrl;
            console.log("Imagem carregada:", data.imageUrl);
        } else {
            console.log("Nenhuma imagem encontrada no Firestore.");
        }
    } catch (error) {
        console.error("Erro ao carregar imagem:", error);
    }
}
