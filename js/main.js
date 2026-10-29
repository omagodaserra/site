// =====================================================
// O MAGO DA SERRA - JAVASCRIPT PRINCIPAL
// Arquivo responsável pelos comportamentos e interações do site
// =====================================================

const CONFIG = {
    // Endereço real da sua API no PythonAnywhere
    API_URL: "https://omagodaserra.pythonanywhere.com",

    // Nome da aplicação
    APP_NAME: "O Mago da Serra"
};


// -----------------------------------------------------
// INICIALIZAÇÃO
// -----------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    inicializarSite();
    const menuToggleBtn = document.getElementById("menu-toggle-btn");
    const navDropdownMenu = document.getElementById("nav-dropdown-menu");

    // Lógica do Menu Principal
    if (menuToggleBtn && navDropdownMenu) {
        menuToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navDropdownMenu.classList.toggle("ativo");
        });
    }

    // Fecha o menu ao clicar fora
    document.addEventListener("click", (e) => {
        if (navDropdownMenu && !navDropdownMenu.contains(e.target) && !menuToggleBtn?.contains(e.target)) {
            navDropdownMenu.classList.remove("ativo");
        }
    });
});

function inicializarSite() {
    console.log(`${CONFIG.APP_NAME} iniciado com magia.`);

    inicializarMenu();
    inicializarAno();
    inicializarBancasParceiros();
    inicializarEventos();
    inicializarDepoimentos();
    inicializarEnvioDepoimento();
    inicializarToggleDepoimento();
    inicializarConversaMago();
}


// -----------------------------------------------------
// MENU E SONS (COMPATÍVEL COM RAIZ E SUBPASTAS)
// -----------------------------------------------------

function inicializarMenu() {
    const estaEmSubpasta = window.location.pathname.includes('/pages/');
    const caminhoSom = estaEmSubpasta ? '../assets/sons/clique.mp3' : 'assets/sons/clique.mp3';
    const somClique = new Audio(caminhoSom);

    const elementosComSom = document.querySelectorAll(".btn-som-3, .btn-som-2, .btn-som-1");
    
    elementosComSom.forEach(elemento => {
        elemento.addEventListener("click", () => {
            somClique.currentTime = 0;
            somClique.play().catch(erro => console.log("Áudio aguardando interação:", erro));
        });
    });
}


// -----------------------------------------------------
// ANO DO RODAPÉ
// -----------------------------------------------------

function inicializarAno() {
    const elementoAno = document.querySelector("#ano-atual");
    if (elementoAno) {
        elementoAno.textContent = new Date().getFullYear();
    }
}

// -----------------------------------------------------
// FACHADAS DAS BANCAS VIRTUAIS & EXPOSITORES (PÁGINA INICIAL)
// -----------------------------------------------------

// -----------------------------------------------------
// FACHADAS DAS BANCAS VIRTUAIS & EXPOSITORES (PÁGINA INICIAL)
// -----------------------------------------------------

function inicializarBancasParceiros() {
    const container = document.querySelector("#grid-bancas-parceiros");
    if (!container) return;

    // Busca as bancas diretamente da API cadastradas pelo Admin/Lojista
    fetch(`${CONFIG.API_URL}/bancas`)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao buscar bancas");
            return response.json();
        })
        .then(bancas => {
            container.innerHTML = "";

            if (bancas.length === 0) {
                container.innerHTML = `<p class="carregando-texto">Nenhuma banca parceira disponível no momento.</p>`;
                return;
            }

            bancas.forEach(banca => {
                const card = document.createElement("article");
                card.classList.add("produto-card");

                // Imagem cadastrada ou imagem padrão caso não tenha sido enviada
                const imagemFachada = banca.logo_path || 'assets/logo/logo.png';
                const linkPagina = `pages/banca.html?slug=${banca.slug}`;

                card.innerHTML = `
                    <div style="position: relative; overflow: hidden;">
                        <img src="${imagemFachada}" alt="Fachada da ${banca.nome}" onerror="this.src='assets/logo/logo.png'" style="height: 180px; object-fit: cover; width: 100%;">
                        <span style="position: absolute; bottom: 10px; left: 10px; background: rgba(13, 21, 38, 0.85); color: var(--dourado-claro); font-family: 'Cinzel', serif; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; border: 1px solid var(--dourado);">🏛️ Banca Parceira</span>
                    </div>
                    <div class="produto-card-body" style="padding: 18px; display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;">
                        <div>
                            <h3 style="font-family: 'Cinzel', serif; font-size: 1.2rem; color: var(--azul-profundo); margin-bottom: 4px;">${banca.nome}</h3>
                            <strong style="font-size: 0.85rem; color: var(--dourado-escuro); display: block; margin-bottom: 10px; font-family: 'IM Fell English SC', serif;">${banca.slogan || ''}</strong>
                            <p style="font-size: 0.95rem; color: var(--cinza); margin-bottom: 16px; line-height: 1.4;">${banca.descricao || 'Conheça nossos produtos e criações artesanais exclusivas.'}</p>
                        </div>
                        <a href="${linkPagina}" class="btn-mago-base btn-tipo-1 btn-som-1" style="padding: 10px 18px; min-height: 42px; font-size: 0.9rem; width: 100%;">
                            <span>Entrar na Banca</span>
                        </a>
                    </div>
                `;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar bancas virtuais:", error);
            container.innerHTML = `<p class="carregando-texto">Não foi possível carregar as bancas parceiras no momento.</p>`;
        });
}

// -----------------------------------------------------
// EVENTOS E FEIRAS PRESENCIAIS
// -----------------------------------------------------

// -----------------------------------------------------
// EVENTOS E FEIRAS PRESENCIAIS (DINÂMICO VIA API)
// -----------------------------------------------------

async function inicializarEventos() {
    const container = document.querySelector("#eventos-container");
    if (!container) return;

    try {
        const resposta = await fetch(`${CONFIG.API_URL}/eventos`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const eventos = await resposta.json();
        container.innerHTML = "";

        if (eventos.length === 0) {
            container.innerHTML = "<p class='carregando-texto'>Nenhum evento agendado no momento. Acompanhe o nosso Instagram!</p>";
            return;
        }

        // Garante que usa a classe do carrossel/grid padrão do site
        container.classList.add("eventos-container");

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let listaEventosFiltrados = [];

        eventos.forEach(evento => {
            const listaDatas = (evento.datas && Array.isArray(evento.datas) && evento.datas.length > 0)
                ? evento.datas
                : [evento.data || ""];

            listaDatas.forEach(dataStr => {
                const partes = dataStr.split('/');
                if (partes.length === 3) {
                    const dia = parseInt(partes[0], 10);
                    const mes = parseInt(partes[1], 10) - 1;
                    const ano = parseInt(partes[2], 10);
                    const dataObj = new Date(ano, mes, dia);

                    if (!isNaN(dataObj.getTime()) && dataObj >= hoje) {
                        listaEventosFiltrados.push({
                            evento: evento,
                            dataStr: dataStr,
                            dataObj: dataObj
                        });
                    }
                }
            });
        });

        // Ordena cronologicamente pela data mais próxima
        listaEventosFiltrados.sort((a, b) => a.dataObj - b.dataObj);

        if (listaEventosFiltrados.length === 0) {
            container.innerHTML = "<p class='carregando-texto'>Nenhum evento agendado para as próximas datas.</p>";
            return;
        }

        listaEventosFiltrados.forEach(item => {
            const evento = item.evento;
            const dataIndividual = item.dataStr;

            const card = document.createElement("article");
            card.classList.add("produto-card"); // Utiliza a classe padrão de card do Mago

            const imagemSrc = evento.imagem ? evento.imagem : 'assets/logo/logo.png';

            card.innerHTML = `
                <div style="position: relative; overflow: hidden;">
                    <img src="${imagemSrc}" alt="${evento.nome}" style="height: 180px; object-fit: cover; width: 100%;" onerror="this.src='assets/logo/logo.png'">
                    <span style="position: absolute; top: 10px; right: 10px; background: var(--azul-principal); color: var(--dourado-claro); font-family: 'Cinzel', serif; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; border: 1px solid var(--dourado);">📅 ${dataIndividual}</span>
                </div>
                <div class="produto-card-body" style="padding: 18px; display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;">
                    <div>
                        <h3 style="font-family: 'Cinzel', serif; font-size: 1.15rem; color: var(--azul-profundo); margin-bottom: 8px;">${evento.nome}</h3>
                        <p style="font-size: 0.9rem; color: var(--cinza); margin-bottom: 4px;">📍 ${evento.local}</p>
                        <p style="font-size: 0.9rem; color: var(--cinza); margin-bottom: 16px;">⏰ ${evento.horario || '09h às 18h'}</p>
                    </div>
                    <a href="pages/evento.html?id=${evento.id}" class="btn-mago-base btn-tipo-1 btn-som-1" style="padding: 8px 16px; min-height: 38px; font-size: 0.85rem; width: 100%;">
                        <span>Ver Detalhes</span>
                    </a>
                </div>
            `;

            container.appendChild(card);
        });

        console.log(`${listaEventosFiltrados.length} eventos carregados com sucesso.`);

    } catch (erro) {
        console.error("Erro ao carregar eventos:", erro);
        container.innerHTML = "<p class='carregando-texto'>Não foi possível carregar os eventos no momento.</p>";
    }
}


// -----------------------------------------------------
// DEPOIMENTOS PÚBLICOS
// -----------------------------------------------------

async function inicializarDepoimentos() {
    const container = document.querySelector("#lista-depoimentos-publicos");
    if (!container) return;

    try {
        const resposta = await fetch(`${CONFIG.API_URL}/depoimentos`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const depoimentos = await resposta.json();
        container.innerHTML = "";

        if (depoimentos.length === 0) {
            container.innerHTML = "<p class='carregando-texto'>Ainda não há depoimentos publicados. Seja o primeiro a avaliar!</p>";
            return;
        }

        depoimentos.forEach(d => {
            const estrelasStr = "⭐".repeat(d.estrelas);
            
            // Pega a primeira letra do nome para o Avatar de Perfil Padrão
            const inicialNome = d.nome ? d.nome.charAt(0).toUpperCase() : '🧙‍♂️';

            // Lógica da Foto de Perfil: Exibe a foto enviada ou gera o Avatar de Perfil com Inicial
            const fotoPerfilHtml = d.foto_path ? `
                <div class="depoimento-avatar-wrapper">
                    <img src="${d.foto_path}" alt="Foto de perfil de ${d.nome}" class="depoimento-avatar-img">
                </div>
            ` : `
                <div class="depoimento-avatar-wrapper depoimento-avatar-inicial">
                    <span>${inicialNome}</span>
                </div>
            `;

            const card = document.createElement("div");
            card.classList.add("card-depoimento-publico");

            card.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: flex-start;">
                    ${fotoPerfilHtml}
                    <div style="flex-grow: 1; overflow: hidden;">
                        <div style="color: #f39c12; margin-bottom: 4px; font-size: 0.85rem;">${estrelasStr}</div>
                        <p class="texto-depoimento-limitado" style="color: var(--cinza); font-style: italic; font-size: 0.95rem; line-height: 1.4; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">
                            "${d.mensagem}"
                        </p>
                        <button class="btn-expandir-depo" style="background: none; border: none; color: var(--dourado-escuro); font-weight: bold; font-size: 0.8rem; cursor: pointer; padding: 0; margin-bottom: 8px; text-decoration: underline;">
                            Ver mais
                        </button>
                    </div>
                </div>
                <div style="margin-top: 10px; border-top: 1px solid var(--cinza-claro); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 0.85rem; color: var(--azul-profundo); font-family: 'Cinzel', serif;">${d.nome}</strong>
                    <small style="color: var(--cinza); font-size: 0.75rem;">${d.cidade}</small>
                </div>
            `;

            const btnExpandir = card.querySelector(".btn-expandir-depo");
            const pMensagem = card.querySelector(".texto-depoimento-limitado");

            if (d.mensagem.length < 120) {
                btnExpandir.style.display = "none";
            }

            btnExpandir.addEventListener("click", () => {
                if (pMensagem.style.webkitLineClamp === "unset") {
                    pMensagem.style.webkitLineClamp = "4";
                    pMensagem.style.display = "-webkit-box";
                    btnExpandir.textContent = "Ver mais";
                } else {
                    pMensagem.style.webkitLineClamp = "unset";
                    pMensagem.style.display = "block";
                    btnExpandir.textContent = "Ver menos";
                }
            });

            container.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar depoimentos:", erro);
        container.innerHTML = "<p class='carregando-texto'>Não foi possível carregar os depoimentos no momento.</p>";
    }
}


// -----------------------------------------------------
// API - ENVIO DE NOVO DEPOIMENTO (DINÂMICO)
// -----------------------------------------------------

function inicializarEnvioDepoimento() {
    const form = document.querySelector("#form-enviar-depoimento");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nome', document.querySelector("#depo-nome").value);
        formData.append('cidade', document.querySelector("#depo-cidade").value);
        formData.append('estrelas', document.querySelector("#depo-estrelas").value);
        formData.append('mensagem', document.querySelector("#depo-mensagem").value);

        const fotoInput = document.querySelector("#depo-foto");
        if (fotoInput && fotoInput.files.length > 0) {
            formData.append('foto', fotoInput.files[0]);
        }

        try {
            const resposta = await fetch(`${CONFIG.API_URL}/depoimentos`, {
                method: 'POST',
                body: formData
            });

            if (resposta.ok) {
                alert("Muito obrigado! O seu depoimento foi enviado com sucesso e será publicado após a nossa verificação no painel.");
                form.reset();
            } else {
                alert("Erro ao enviar o depoimento. Tente novamente.");
            }
        } catch (erro) {
            console.error("Erro:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
}

function inicializarToggleDepoimento() {
    const btnToggle = document.querySelector("#btn-toggle-depoimento");
    const wrapperForm = document.querySelector("#wrapper-form-depoimento");

    if (!btnToggle || !wrapperForm) return;

    btnToggle.addEventListener("click", () => {
        if (wrapperForm.style.display === "none" || wrapperForm.style.display === "") {
            wrapperForm.style.display = "block";
            btnToggle.textContent = "Esconder formulário";
            wrapperForm.scrollIntoView({ behavior: 'smooth' });
        } else {
            wrapperForm.style.display = "none";
            btnToggle.textContent = "Deixe o seu depoimento";
        }
    });
}


// -----------------------------------------------------
// LÓGICA DA CONVERSA INTERATIVA COM O MAGO DA SERRA
// -----------------------------------------------------

const roteiroConversa = [
    {
        fala: "Saudações, jovem aprendiz! Eu sou o Mago da Serra. Clique em mim para iniciarmos nossa jornada mágica!",
        botao: "Vamos lá!",
        imagem: "mascote-img.png"
    },
    {
        fala: "Aqui no nosso reino, a magia do artesanato se une à diversão das feiras. Venha conhecer nossas pelúcias exclusivas e varinhas!",
        botao: "O que mais encontro?",
        imagem: "mascote-img.png"
    },
    {
        fala: "Temos o famoso Chapéu Seletor de Hogwarts esperando por você. Responda ao quiz e descubra sua casa presencialmente em nossa banca!",
        botao: "Quero ver o Chapéu!",
        imagem: "mascote-img.png",
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('#chapeu-seletor').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({ top: posicaoOriginal, behavior: 'smooth' });
            }, 1500);
        }
    },
    {
        fala: "Explore também as nossas Bancas Virtuais e conheça os parceiros de pelúcias e alianças artesanais.",
        botao: "Onde nos encontrar?",
        imagem: "mascote-img.png",
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('#bancas-parceiros').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({ top: posicaoOriginal, behavior: 'smooth' });
            }, 1500);
        }
    },
    {
        fala: "Participamos das melhores feiras da região com a Pescaria Divertida e fotos inesquecíveis. Veja onde estaremos!",
        botao: "Ver redes sociais",
        imagem: "mascote-img.png",
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('#eventos').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({ top: posicaoOriginal, behavior: 'smooth' });
            }, 1500);
        }
    },
    {
        fala: "Siga-nos no Instagram (@omagodaserra) para acompanhar os bastidores e os melhores momentos nas feiras.",
        botao: "Falar com o Mago",
        imagem: "mascote-img.png",
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('#redes-sociais').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({ top: posicaoOriginal, behavior: 'smooth' });
            }, 1500);
        }
    },
    {
        fala: "Ficou com alguma dúvida ou deseja encomendar uma peça? Fale diretamente comigo pelo WhatsApp abaixo. Até breve!",
        botao: "Reiniciar conversa",
        imagem: "mascote-img.png",
        final: true,
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('#contato').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({ top: posicaoOriginal, behavior: 'smooth' });
            }, 1500);
        }
    }
];

let cenaAtual = 0;
const caminhoImagens = "assets/mascote/";

function inicializarConversaMago() {
    const areaMascote = document.getElementById('area-mascote');
    const imgMascote = document.getElementById('img-mascote');
    const balaoFala = document.getElementById('balao-fala-mago');
    const textoFala = document.getElementById('texto-fala');
    const btnProxima = document.getElementById('btn-proxima-fala');

    if (!areaMascote || !imgMascote || !balaoFala || !textoFala || !btnProxima) return;

    imgMascote.style.transition = "opacity 0.4s ease-in-out, transform 0.4s ease-in-out";

    function atualizarCena() {
        const dadosCena = roteiroConversa[cenaAtual];
        balaoFala.classList.remove('visivel');

        imgMascote.style.opacity = 0;
        imgMascote.style.transform = "scale(0.96)";

        setTimeout(() => {
            // Mantém a imagem base ou alterna caso tenha variações
            imgMascote.style.opacity = 1;
            imgMascote.style.transform = "scale(1)";

            textoFala.textContent = dadosCena.fala;
            btnProxima.textContent = dadosCena.botao;

            if (dadosCena.acao) {
                dadosCena.acao();
            }

            balaoFala.classList.add('visivel');
        }, 300);
    }

    areaMascote.addEventListener('click', () => {
        if (balaoFala.classList.contains('visivel')) {
            avancarConversa();
        } else {
            balaoFala.classList.add('visivel');
        }
    });

    btnProxima.addEventListener('click', (e) => {
        e.stopPropagation();
        avancarConversa();
    });

    function avancarConversa() {
        if (cenaAtual < roteiroConversa.length - 1) {
            cenaAtual++;
            atualizarCena();
        } else {
            cenaAtual = 0; // Reinicia o ciclo
            atualizarCena();
        }
    }
}


// -----------------------------------------------------
// WHATSAPP
// -----------------------------------------------------

function falarPeloWhatsApp(e) {
    if (e) e.preventDefault();

    const numeroWhatsApp = "5554996322787";
    const mensagem = "Olá, Mago da Serra! Gostaria de tirar algumas dúvidas sobre as pelúcias, feiras e produtos mágicos.";
    
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
}