document.addEventListener('DOMContentLoaded', () => {
    // ### ELEMENTOS DO DOM ###
    const mainContainer = document.getElementById('main-container');
    const contadorPresenca = document.getElementById('contador-presenca');
    const btnResetarMarcacoes = document.getElementById('btn-resetar-marcacoes');
    
    // Modal
    const btnGerenciarLista = document.getElementById('btn-gerenciar-lista');
    const modal = document.getElementById('modal-gerenciamento');
    const btnFecharModal = modal.querySelector('.btn-fechar');
    const btnRestaurarPadrao = document.getElementById('btn-restaurar-padrao');
    const inputListaCompleta = document.getElementById('input-lista-completa');
    const btnSubstituirLista = document.getElementById('btn-substituir-lista');

    // ### DADOS E ESTADO ###
    let participantes = [];
    // A lista padrão agora não é mais usada para carregar, apenas para restauração.
    const listaPadrao = [
        { id: 1, nome: "Cris Lima 008", grupo: "van2" }, { id: 2, nome: "Joyce 010", grupo: "van2" }, { id: 3, nome: "Neide 016", grupo: "van2" }, { id: 4, nome: "Kaiane 017", grupo: "van2" }, { id: 5, nome: "Romualdo 019", grupo: "van2" }, { id: 6, nome: "Gislane 021", grupo: "van2" }, { id: 7, nome: "Nicoly 024", grupo: "van2" }, { id: 8, nome: "Theo 025", grupo: "van2" }, { id: 9, nome: "Carlos 026", grupo: "van2" }, { id: 10, nome: "Gisele 028", grupo: "van2" }, { id: 11, nome: "Cleane 034", grupo: "van2" }, { id: 12, nome: "Domingos 037/048", grupo: "van2" }, { id: 13, nome: "Vanessa 038", grupo: "van2" }, { id: 14, nome: "Mariana 043", grupo: "van2" }, { id: 15, nome: "Cris Silva 044", grupo: "van2" }, { id: 16, nome: "Jociane 051", grupo: "van2" }, { id: 17, nome: "Juan 052", grupo: "van2" }, { id: 18, nome: "Aurilene 053 (Emprestada)", grupo: "van2" },
        { id: 19, nome: "Ana Beatriz 023", grupo: "servnac_com" }, { id: 20, nome: "Adriana 002", grupo: "servnac_com" }, { id: 21, nome: "Davi 046", grupo: "servnac_com" }, { id: 22, nome: "Valquiria 040", grupo: "servnac_com" },
        { id: 23, nome: "Aline", grupo: "servnac_sem" }, { id: 24, nome: "Ana Caroline", grupo: "servnac_sem" }, { id: 25, nome: "Darliane", grupo: "servnac_sem" }, { id: 26, nome: "Sabrina", grupo: "servnac_sem" }, { id: 27, nome: "Karliane", grupo: "servnac_sem" }, { id: 28, nome: "Vitória", grupo: "servnac_sem" }
    ];

    // ### LÓGICA DO MODAL ###
    const abrirModal = () => modal.style.display = 'flex';
    const fecharModal = () => modal.style.display = 'none';

    // ### FUNÇÕES DE DADOS (LOCALSTORAGE) ###
    const salvarParticipantes = () => {
        localStorage.setItem('listaDeParticipantes', JSON.stringify(participantes));
    };

    const carregarParticipantes = () => {
        const dadosSalvos = localStorage.getItem('listaDeParticipantes');
        if (dadosSalvos) {
            participantes = JSON.parse(dadosSalvos);
        } else {
            // Se não houver nada salvo, começa com uma lista vazia.
            participantes = [];
            salvarParticipantes();
        }
    };

    // ### FUNÇÕES DE RENDERIZAÇÃO E LÓGICA PRINCIPAL ###
    const atualizarContador = () => {
        const presentes = document.querySelectorAll('.participante-btn.presente').length;
        const total = participantes.length;
        contadorPresenca.textContent = `Presentes: ${presentes} / ${total}`;
    };

    const renderizarPaginaPrincipal = () => {
        mainContainer.innerHTML = `
            <div class="grupo-participantes" data-grupo-container="sem_grupo">
                <div class="lista-participantes" data-lista-container="sem_grupo"></div>
            </div>
            <div class="grupo-participantes" data-grupo-container="van2"><h2>VAN 2</h2><div class="lista-participantes" data-lista-container="van2"></div></div>
            <div class="grupo-participantes" data-grupo-container="servnac">
                <h2>SERVNAC</h2>
                <h3 data-subtitulo-container="servnac_com">COM SMARTS</h3><div class="lista-participantes" data-lista-container="servnac_com"></div>
                <h3 data-subtitulo-container="servnac_sem">SEM SMARTS</h3><div class="lista-participantes" data-lista-container="servnac_sem"></div>
            </div>`;

        participantes.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'participante-btn';
            btn.textContent = p.nome;
            btn.dataset.id = p.id;
            
            btn.addEventListener('click', () => {
                btn.classList.toggle('presente');
                atualizarContador();
            });

            const listaContainer = mainContainer.querySelector(`[data-lista-container="${p.grupo}"]`);
            if (listaContainer) listaContainer.appendChild(btn);
        });

        mainContainer.querySelectorAll('[data-grupo-container]').forEach(grupo => {
            const temFilhos = grupo.querySelector('.lista-participantes').children.length > 0;
            grupo.classList.toggle('oculto', !temFilhos);

            if (grupo.dataset.grupoContainer === 'servnac') {
                grupo.querySelectorAll('h3').forEach(subtitulo => {
                    const chaveSubtitulo = subtitulo.dataset.subtituloContainer;
                    const temFilhosSubtitulo = grupo.querySelector(`[data-lista-container="${chaveSubtitulo}"]`).children.length > 0;
                    subtitulo.classList.toggle('oculto', !temFilhosSubtitulo);
                });
            }
        });

        atualizarContador();
    };

    btnResetarMarcacoes.addEventListener('click', () => {
        document.querySelectorAll('.participante-btn.presente').forEach(btn => {
            btn.classList.remove('presente');
        });
        atualizarContador();
    });
    
    // ### LÓGICA DO GERENCIAMENTO ###
    btnSubstituirLista.addEventListener('click', () => {
        const textoLista = inputListaCompleta.value.trim();
        if (!textoLista) {
            alert('A caixa de texto está vazia. Cole uma lista para substituir.');
            return;
        }

        const novosParticipantes = [];
        // MUDANÇA PRINCIPAL: O grupo padrão agora é 'sem_grupo'
        let grupoAtual = 'sem_grupo'; 
        let idCounter = 1;

        const mapaGrupos = {
            '[VAN 2]': 'van2',
            '[SERVNAC - COM SMARTS]': 'servnac_com',
            '[SERVNAC - SEM SMARTS]': 'servnac_sem'
        };

        const linhas = textoLista.split('\n');

        for (const linha of linhas) {
            const linhaLimpa = linha.trim();
            if (!linhaLimpa) continue;

            const chaveGrupo = mapaGrupos[linhaLimpa.toUpperCase()];
            if (chaveGrupo) {
                grupoAtual = chaveGrupo;
            } else { 
                novosParticipantes.push({ id: idCounter++, nome: linhaLimpa, grupo: grupoAtual });
            }
        }

        if (novosParticipantes.length === 0) {
            alert('Não foi possível encontrar participantes na lista.');
            return;
        }

        if (confirm(`Foram encontrados ${novosParticipantes.length} participantes. Deseja substituir a lista atual por esta?`)) {
            participantes = novosParticipantes;
            salvarParticipantes();
            renderizarPaginaPrincipal();
            fecharModal();
            alert('Lista substituída com sucesso!');
        }
    });

    btnRestaurarPadrao.addEventListener('click', () => {
        if (confirm('Tem certeza? Isso restaurará a lista original com todos os grupos.')) {
            // A restauração agora carrega a lista padrão completa.
            participantes = JSON.parse(JSON.stringify(listaPadrao));
            salvarParticipantes();
            renderizarPaginaPrincipal();
            fecharModal();
        }
    });

    // ### EVENTOS E INICIALIZAÇÃO ###
    btnGerenciarLista.addEventListener('click', abrirModal);
    btnFecharModal.addEventListener('click', fecharModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });

    modal.style.display = 'none'; 
    carregarParticipantes();
    renderizarPaginaPrincipal();
});