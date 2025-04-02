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
                
                // Habilita o botão de upload de foto
                document.getElementById("upload-foto").disabled = false;
                document.getElementById("download").disabled = false;
                
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
    
    const segundosRestantes = segundos % 60;
    const horasRestantes = horas % 24;
    const diasRestantes = Math.floor(dias % 30.436875);
    const mesesRestantes = meses % 12;
    
    // Atualiza o painel de controle
    let textoTempo = "";
    
    if (anos > 0) {
        textoTempo += `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
        if (mesesRestantes > 0) {
            textoTempo += ` e ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}`;
        }
    } else if (meses > 0) {
        textoTempo += `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
        if (diasRestantes > 0) {
            textoTempo += ` e ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`;
        }
    } else {
        textoTempo += `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
    }
    
    document.getElementById("detalhes").innerHTML = `
        <strong>Estamos juntos há:</strong> ${textoTempo}<br>
        <small>
            ${dias} dias, ${horasRestantes} horas, ${minutos % 60} minutos 
            e ${segundosRestantes} segundos de felicidade juntos.
        </small>
    `;
    
    // Atualiza o overlay da imagem
    document.getElementById("anos").textContent = `${anos} ${anos === 1 ? 'ano' : 'anos'}.`;
    document.getElementById("meses").textContent = `${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}.`;
    document.getElementById("dias").textContent = `${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}.`;
    document.getElementById("horas").textContent = `${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}.`;
    document.getElementById("segundos").textContent = `${segundosRestantes} ${segundosRestantes === 1 ? 'segundo' : 'segundos'}`;
}