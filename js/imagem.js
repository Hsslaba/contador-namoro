document.addEventListener("DOMContentLoaded", () => {
    const uploadBtn = document.getElementById("upload-foto");
    const fotoInput = document.getElementById("foto-input");
    const downloadBtn = document.getElementById("download");
    
    uploadBtn.addEventListener("click", () => {
        fotoInput.click();
    });
    
    fotoInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
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
            }
        };
        reader.readAsDataURL(file);
    });
    
    downloadBtn.addEventListener("click", () => {
        const fotoContainer = document.getElementById("foto-container");
        
        html2canvas(fotoContainer).then(canvas => {
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

async function salvarImagem(file) {
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
            return data.data.link;
        } else {
            throw new Error("Erro ao enviar imagem para o Imgur");
        }
    } catch (error) {
        console.error("Erro ao fazer upload:", error);
        return null;
    }
}
