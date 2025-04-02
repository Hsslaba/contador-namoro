document.addEventListener("DOMContentLoaded", () => {
    const iniciarBtn = document.getElementById("iniciar");
    const tempoEl = document.getElementById("tempo");
    const detalhesEl = document.getElementById("detalhes");

    iniciarBtn.addEventListener("click", () => {
        const dataAtual = new Date();
        
        // Confirmar antes de iniciar
        if (confirm("Tem certeza que deseja iniciar o contador de relacionamento? Esta data será salva permanentemente.")) {
            db.collection("relacionamento").doc("contador").set({
                dataInicio: firebase.firestore.Timestamp.fromDate(dataAtual),
                criadoPor: auth.currentUser.displayName,
                email: auth.currentUser.email,
                dataCriacao: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                atualizarContador(dataAtual);
                iniciarBtn.disabled = true;
                iniciarBtn.textContent = "Relacionamento já iniciado";
                console.log("Data de início salva com sucesso!");
            })
            .catch(error => {
                console.error("Erro ao salvar data de início:", error);
                alert("Erro ao salvar: " + error.message);
            });
        }
    });
});

function atualizarContador(dataInicio) {
    const tempoEl = document.getElementById("tempo");
    const detalhesEl = document.getElementById("detalhes");
    
    // Mostra a data de início formatada
    tempoEl.innerHTML = `Começamos em: <strong>${dataInicio.toLocaleDateString("pt-BR")}</strong>`;
    
    // Calcula o tempo decorrido
    calcularTempoDecorrido(dataInicio);
    
    // Atualiza o contador a cada segundo
    setInterval(() => {
        calcularTempoDecorrido(dataInicio);
    }, 1000);
}

function calcularTempoDecorrido(dataInicio) {
    const agora = new Date();
    const diff = agora - dataInicio;
    
    // Cálculos de tempo
    const segundos = Math.floor(diff / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30.436875); // média de dias por mês
    const anos = Math.floor(dias / 365.25); // considerando anos bissextos
    
    const diasRestantes = dias % 30.436875;
    
    let textoTempo = "";
    
    if (anos > 0) {
        textoTempo += `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
        if (meses % 12 > 0) {
            textoTempo += ` e ${meses % 12} ${meses % 12 === 1 ? 'mês' : 'meses'}`;
        }
    } else if (meses > 0) {
        textoTempo += `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
        if (Math.floor(diasRestantes) > 0) {
            textoTempo += ` e ${Math.floor(diasRestantes)} ${Math.floor(diasRestantes) === 1 ? 'dia' : 'dias'}`;
        }
    } else {
        textoTempo += `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
    }
    
    document.getElementById("detalhes").innerHTML = `
        <strong>Estamos juntos há:</strong> ${textoTempo}<br>
        <small>
            ${dias} dias, ${horas % 24} horas, ${minutos % 60} minutos 
            e ${segundos % 60} segundos de felicidade juntos.
        </small>
    `;
}