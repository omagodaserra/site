// =====================================================
// O MAGO DA SERRA - LÓGICA DA PÁGINA DE EVENTOS
// =====================================================

const CONFIG_EVENTO = {
    API_URL: "https://omagodaserra.pythonanywhere.com"
};

document.addEventListener("DOMContentLoaded", () => {
    carregarDetalhesEvento();
});

async function carregarDetalhesEvento() {
    const container = document.getElementById("evento-container");

    if (!container) return;

    const parametros = new URLSearchParams(window.location.search);
    const idEvento = parametros.get("id");

    if (!idEvento) {
        container.innerHTML = `<p class="carregando-texto">Evento não especificado.</p>`;
        return;
    }

    try {
        const resposta = await fetch(`${CONFIG_EVENTO.API_URL}/eventos`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const eventos = await resposta.json();
        const evento = eventos.find(item => String(item.id) === String(idEvento));

        if (!evento) {
            container.innerHTML = `<p class="carregando-texto">Evento não encontrado no reino.</p>`;
            return;
        }

        exibirDetalhesEvento(evento);

    } catch (erro) {
        console.error("Erro ao carregar detalhes do evento:", erro);
        container.innerHTML = `<p class="carregando-texto">Não foi possível carregar as informações do evento.</p>`;
    }
}

function exibirDetalhesEvento(evento) {
    const container = document.getElementById("evento-container");

    // Lógica para Mapa do Google
    let mapaHtml = '';
    if (evento.mapa) {
        if (evento.mapa.includes('<iframe')) {
            mapaHtml = `<div class="evento-mapa-container">${evento.mapa}</div>`;
        } else {
            const urlMapa = evento.mapa.startsWith('http') ? evento.mapa : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.local)}`;
            mapaHtml = `
                <div class="evento-acao-bloco">
                    <a href="${urlMapa}" target="_blank" rel="noopener noreferrer" class="btn-mago-base btn-tipo-2 btn-som-2">
                        <img src="../assets/icones/fone.png" alt="Mapa" class="btn-mago-icone">
                        <span>📍 Ver no Google Maps</span>
                    </a>
                </div>
            `;
        }
    } else if (evento.local) {
        const urlBuscaMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.local)}`;
        mapaHtml = `
            <div class="evento-acao-bloco">
                <a href="${urlBuscaMapa}" target="_blank" rel="noopener noreferrer" class="btn-mago-base btn-tipo-2 btn-som-2">
                    <span>📍 Localizar no Google Maps</span>
                </a>
            </div>
        `;
    }

    // Botão Instagram
    let instagramHtml = '';
    if (evento.instagram) {
        instagramHtml = `
            <div class="evento-acao-bloco">
                <a href="${evento.instagram}" target="_blank" rel="noopener noreferrer" class="btn-mago-base btn-tipo-2 btn-som-2">
                    <img src="../assets/icones/instagram.png" alt="Instagram" class="btn-mago-icone">
                    <span>📸 Ver Publicação no Instagram</span>
                </a>
            </div>
        `;
    }

    // Formatação de datas
    const datasTexto = Array.isArray(evento.datas) ? evento.datas.join(' • ') : (evento.datas || 'Data a confirmar');

    container.innerHTML = `
        <div class="evento-galeria">
            <div class="evento-imagem-wrapper">
                <img
                    id="imagem-principal"
                    src="${evento.imagem || '../assets/logo/logo.png'}"
                    alt="${evento.nome}"
                    class="evento-imagem-destaque"
                >
            </div>
        </div>

        <div class="evento-informacoes">
            <span class="evento-badge-data">
                📅 ${datasTexto}
            </span>

            <h1 class="evento-titulo-h1">${evento.nome}</h1>

            <p class="evento-descricao-p">
                ${evento.descricao || 'Venha conferir o ateliê do Mago da Serra, testar o Chapéu Seletor de Hogwarts e conhecer as melhores bancas artesanais!'}
            </p>

            <div class="evento-detalhes-lista">
                <p><strong>📍 Local:</strong> ${evento.local || 'A definir'}</p>
                <p><strong>⏰ Horário:</strong> ${evento.horario || '09h às 18h'}</p>
            </div>

            <!-- EXIBIÇÃO DE MAPA E INSTAGRAM -->
            ${mapaHtml}
            ${instagramHtml}

            <!-- BOTÃO WHATSAPP PADRÃO MAGO -->
            <div class="evento-contato-bloco">
                <a href="#" class="btn-mago-base btn-tipo-1 btn-som-1" id="evento-whatsapp">
                    <img src="../assets/icones/whats.png" alt="WhatsApp" class="btn-mago-icone">
                    <span>Falar com o Mago sobre esta Feira</span>
                </a>
            </div>
        </div>
    `;

    // Ação do Botão WhatsApp
    const btnWhatsapp = document.getElementById("evento-whatsapp");
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener("click", (e) => {
            e.preventDefault();

            let mensagem = `🧙‍♂️ *Consulta de Evento - O Mago da Serra*\n\n`;
            mensagem += `Olá, Mago! Gostaria de saber mais informações sobre a feira:\n`;
            mensagem += `*${evento.nome}*\n`;
            mensagem += `Data: ${datasTexto}\n`;
            mensagem += `Local: ${evento.local || 'A definir'}\n\n`;
            mensagem += `Estarei presente para ver as atrações!`;

            const numeroWhatsApp = "5554996322787";
            const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

            window.open(url, "_blank");
        });
    }
}