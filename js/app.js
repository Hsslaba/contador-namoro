document.addEventListener("DOMContentLoaded", () => {
    console.log("App carregado!");
    
    // Adiciona título dinâmico com emojis
    const tituloOriginal = document.title;
    const emojis = ["❤️", "💑", "💘", "💖", "💗", "💓", "💕"];
    
    // Alterna emojis no título
    setInterval(() => {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        document.title = `${emoji} ${tituloOriginal}`;
    }, 2000);
    
    // Verifica se está em um dispositivo móvel para ajustar a interface
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile');
    }
    
    // Aguarda a autenticação do usuário antes de verificar datas especiais
    auth.onAuthStateChanged(user => {
        if (user) {
            verificarDatasEspeciais(user.uid);
        }
    });
});

function verificarDatasEspeciais(userId) {
    const hoje = new Date();
    const dia = hoje.getDate();
    const mes = hoje.getMonth() + 1; // Janeiro é 0
    
    db.collection("relacionamento").doc(userId).get().then(doc => {
        if (!doc.exists) return;
        
        const dataInicio = doc.data().dataInicio.toDate();
        const diaInicio = dataInicio.getDate();
        const mesInicio = dataInicio.getMonth() + 1;
        
        // Verifica se é aniversário de namoro (mesmo dia e mês)
        if (dia === diaInicio && mes === mesInicio && hoje.getFullYear() > dataInicio.getFullYear()) {
            const anos = hoje.getFullYear() - dataInicio.getFullYear();
            mostrarMensagemEspecial(`🎉 Hoje comemoramos ${anos} ${anos === 1 ? 'ano' : 'anos'} juntos! 🎉`);
        }
        
        // Verifica se é "mesversário" (mesmo dia em mês diferente)
        if (dia === diaInicio && (mes !== mesInicio || hoje.getFullYear() > dataInicio.getFullYear())) {
            mostrarMensagemEspecial("❤️ Feliz mesversário! ❤️");
        }
    });
}

function mostrarMensagemEspecial(mensagem) {
    const container = document.querySelector('.container');
    
    const mensagemEl = document.createElement('div');
    mensagemEl.className = 'mensagem-especial';
    mensagemEl.innerHTML = mensagem;
    mensagemEl.style.backgroundColor = '#ff4c4c';
    mensagemEl.style.color = 'white';
    mensagemEl.style.padding = '15px';
    mensagemEl.style.borderRadius = '8px';
    mensagemEl.style.marginBottom = '20px';
    mensagemEl.style.fontWeight = 'bold';
    mensagemEl.style.animation = 'pulsar 2s infinite';
    
    // Adiciona estilo de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulsar {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Insere antes do primeiro elemento
    container.insertBefore(mensagemEl, container.firstChild);
}