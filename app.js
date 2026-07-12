document.addEventListener('DOMContentLoaded', () => {
    gerarBotoesAno();
    
    const copasOrdenadas = [...window.dadosCopas].sort((a, b) => b.temporada - a.temporada);
    if (copasOrdenadas.length > 0) {
        carregarCopa(copasOrdenadas[0].temporada);
    }
});

// Função para alternar visibilidade dos balões
window.toggleComment = (btn) => {
    const bubble = btn.nextElementSibling;
    bubble.classList.toggle('active');
};

function gerarBotoesAno() {
    const container = document.getElementById('ano-container');
    if (!container) return;
    
    container.innerHTML = '';
    const copasOrdenadas = [...window.dadosCopas].sort((a, b) => b.temporada - a.temporada);

    copasOrdenadas.forEach((copa, index) => {
        const btn = document.createElement('button');
        btn.className = 'ano-btn';
        if (index === 0) btn.classList.add('active');
        btn.innerText = `Copa ${copa.temporada}`;
        btn.onclick = (e) => trocarCopa(copa.temporada, e.target);
        container.appendChild(btn);
    });
}

function formatarNomeArquivo(nome) {
    return nome.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, "");
}

function mostrarAba(tipo) {
    const btnGrupos = document.querySelector('.aba-btn:nth-child(1)');
    const btnMataMata = document.querySelector('.aba-btn:nth-child(2)');
    const divGrupos = document.getElementById('container-grupos');
    const divMataMata = document.getElementById('container-mata-mata');

    if (tipo === 'grupos') {
        divGrupos.style.display = 'block';
        divMataMata.style.display = 'none';
        btnGrupos.classList.add('active');
        btnMataMata.classList.remove('active');
    } else {
        divGrupos.style.display = 'none';
        divMataMata.style.display = 'block';
        btnGrupos.classList.remove('active');
        btnMataMata.classList.add('active');
    }
}

function trocarCopa(ano, btnElemento) {
    document.querySelectorAll('.ano-btn').forEach(b => b.classList.remove('active'));
    btnElemento.classList.add('active');
    carregarCopa(ano);
}

function carregarCopa(ano) {
    const copa = window.dadosCopas.find(c => c.temporada === ano);
    if (!copa) return;

    // --- Renderizar Grupos ---
    const containerGrupos = document.getElementById('container-grupos');
    containerGrupos.innerHTML = '';
    
    copa.grupos.forEach(grupo => {
        let linhas = '';
        grupo.equipes.forEach(t => {
            const nomeArquivo = formatarNomeArquivo(t.time);
            // Adicionado Empates (t.empates) e Derrotas (t.derrotas)
            linhas += `<tr>
                <td class="col-time">
                    <img src="assets/bandeiras/${nomeArquivo}.png" class="bandeira" onerror="this.style.display='none'">
                    <span class="nome-pais">${t.time}</span>
                </td>
                <td>${t.pontos}</td>
                <td>${t.vitorias}</td>
                <td>${t.empates}</td>
                <td>${t.derrotas}</td>
                <td>${t.saldoGols}</td>
            </tr>`;
        });
        
        containerGrupos.innerHTML += `
            <div class="tabela-wrapper">
                <h3 class="grupo-titulo">${grupo.nome}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Pts</th>
                            <th>V</th>
                            <th>E</th>
                            <th>D</th>
                            <th>SG</th>
                        </tr>
                    </thead>
                    <tbody>${linhas}</tbody>
                </table>
            </div>`;
    });

    // --- Renderizar Mata-Mata ---
    const containerMata = document.getElementById('container-mata-mata');
    containerMata.innerHTML = '';
    
    if (copa.mataMata) {
        copa.mataMata.forEach(fase => {
            let htmlJogos = `<div class="fase-container"><h4 class="fase-titulo">${fase.fase}</h4>`;
            
            fase.jogos.forEach(jogo => {
                const img1 = formatarNomeArquivo(jogo.time1);
                const img2 = formatarNomeArquivo(jogo.time2);
                const score1 = jogo.gols1 !== null ? jogo.gols1 : '-';
                const score2 = jogo.gols2 !== null ? jogo.gols2 : '-';

                let penaltyHtml = jogo.penaltis1 != null ? `<span class="penaltis">(${jogo.penaltis1} - ${jogo.penaltis2})</span>` : '';

                let comentariosHtml = '';
                if (jogo.comentarios) {
                    comentariosHtml = `
                        <div class="comment-area">
                            <div class="comment-wrapper">
                                <button class="btn-toggle" onclick="toggleComment(this)"></button>
                                <div class="bubble">${jogo.comentarios.esquerda}</div>
                            </div>
                            <div class="comment-wrapper">
                                <button class="btn-toggle" onclick="toggleComment(this)"></button>
                                <div class="bubble">${jogo.comentarios.direita}</div>
                            </div>
                        </div>
                    `;
                }

                htmlJogos += `
                <div class="match-card">
                    <div class="match-main">
                        <div class="team-box">
                            <img src="assets/bandeiras/${img1}.png" class="bandeira-mini" onerror="this.src='assets/bandeiras/indefinido.png'">
                            <span class="team-name">${jogo.time1}</span>
                        </div>
                        <div class="match-score">
                            ${score1} - ${score2}
                            ${penaltyHtml}
                        </div>
                        <div class="team-box right">
                            <span class="team-name">${jogo.time2}</span>
                            <img src="assets/bandeiras/${img2}.png" class="bandeira-mini" onerror="this.src='assets/bandeiras/indefinido.png'">
                        </div>
                    </div>
                    ${comentariosHtml}
                </div>`;
            });
            htmlJogos += `</div>`;
            containerMata.innerHTML += htmlJogos;
        });
    }

    // --- Renderizar Campeão ---
    if (copa.campeao) {
        const imgCampeao = formatarNomeArquivo(copa.campeao.time);
        
        containerMata.innerHTML += `
            <div class="campeao-pennant">
                <h3 class="campeao-titulo">Campeão ${copa.temporada}</h3>
                <img src="assets/bandeiras/${imgCampeao}.png" class="campeao-flag" onerror="this.style.display='none'">
                <div class="campeao-time">${copa.campeao.time}</div>
                <p style="font-size: 0.8rem; color: var(--text-muted);">${copa.campeao.texto}</p>
            </div>
        `;
    }
}
