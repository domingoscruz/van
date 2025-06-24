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
            participantes = JSON.parse(JSON.stringify(listaPadrao));
            salvarParticipantes();
        }
    };

    // ### FUNÇÕES DE RENDERIZAÇÃO E LÓGICA PRINCIPAL ###
    const atualizarContador = () => {
        const presentes = document.querySelectorAll('.participante-btn.presente').length;
        contadorPresenca.textContent = `Presentes: ${presentes} / ${participantes.length}`;
    };

    const renderizarPaginaPrincipal = () => {
        // 1. Limpa o container principal
        mainContainer.innerHTML = `
            <div class="grupo-participantes" data-grupo-container="van2"><h2>VAN 2</h2><div class="lista-participantes" data-lista-container="van2"></div></div>
            <div class="grupo-participantes" data-grupo-container="servnac">
                <h2>SERVNAC</h2>
                <h3 data-subtitulo-container="servnac_com">COM SMARTS</h3><div class="lista-participantes" data-lista-container="servnac_com"></div>
                <h3 data-subtitulo-container="servnac_sem">SEM SMARTS</h3><div class="lista-participantes" data-lista-container="servnac_sem"></div>
            </div>`;

        // 2. Cria e adiciona os botões de cada participante
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

        // 3. Esconde grupos e subtítulos vazios
        mainContainer.querySelectorAll('[data-lista-container]').forEach(lista => {
            const grupoKey = lista.dataset.listaContainer;
            const temFilhos = lista.children.length > 0;
            const subtitulo = mainContainer.querySelector(`[data-subtitulo-container="${grupoKey}"]`);
            if(subtitulo) subtitulo.classList.toggle('oculto', !temFilhos);
            const grupoContainer = lista.closest('[data-grupo-container]');
            if (grupoContainer) {
                const todasSublistasVazias = [...grupoContainer.querySelectorAll('[data-lista-container]')].every(l => l.children.length === 0);
                grupoContainer.classList.toggle('oculto', todasSublistasVazias);
            }
        });

        // 4. Atualiza o contador
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
        let grupoAtual = null;
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
            } else if (grupoAtual) {
                novosParticipantes.push({ id: idCounter++, nome: linhaLimpa, grupo: grupoAtual });
            }
        }

        if (novosParticipantes.length === 0) {
            alert('Não foi possível encontrar participantes na lista. Verifique o formato, com cabeçalhos como [VAN 2].');
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
        if (confirm('Tem certeza? Isso apagará todas as suas alterações e restaurará a lista original.')) {
            localStorage.removeItem('listaDeParticipantes');
            fecharModal();
            window.location.reload();
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