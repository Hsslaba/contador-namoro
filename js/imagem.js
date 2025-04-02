
const SUPABASE_URL = "https://xyyrtlslzhadigqbxzyl.supabase.co";  // Substitua pela sua URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eXJ0bHNsemhhZGlncWJ4enlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjU4NTcsImV4cCI6MjA1OTIwMTg1N30.5DcsU9MN6l4p3emt5VPUCKh2BOhDVmapOadndBQJF0k";    // Substitua pela sua chave anônima
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    const uploadBtn = document.getElementById("upload-foto");
    const fotoInput = document.getElementById("foto-input");
    const downloadBtn = document.getElementById("download");

    // Configurar evento para botão de upload
    uploadBtn.addEventListener("click", () => {
        fotoInput.click();
    });

    // Configurar evento para quando uma foto é selecionada
    fotoInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const imageUrl = await salvarImagem(file);
            if (imageUrl) {
                document.getElementById("casal-img").src = imageUrl;

                // Salvar a URL no Supabase Database
                const { error } = await supabase
                    .from("relacionamento")  // Tabela no Supabase
                    .insert([{ 
                        imageUrl: imageUrl,
                        uploadedBy: auth.currentUser.displayName,
                        uploadedAt: new Date()
                    }]);

                if (error) throw error;
                console.log("Imagem salva no Supabase Database!");
            }
        } catch (error) {
            console.error("Erro ao fazer upload:", error);
        }
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

// Função para salvar imagem no Supabase Storage
async function salvarImagem(file) {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para fazer upload de imagens.");
        return;
    }

    const filePath = `imagens/${auth.currentUser.uid}/${file.name}`;
    
    // Upload para o Supabase Storage
    let { data, error } = await supabase.storage.from("imagens").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
    });

    if (error) {
        console.error("Erro ao fazer upload:", error);
        return null;
    }

    // Gerar URL pública da imagem
    const { data: publicUrl } = supabase.storage.from("imagens").getPublicUrl(filePath);
    return publicUrl.publicUrl;
}
