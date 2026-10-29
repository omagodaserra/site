// =====================================================
// CAMARSAN - JAVASCRIPT PRINCIPAL
// Arquivo responsável pelos comportamentos da página inicial
// =====================================================

const CONFIG = {
    // Endereço da API da CamarSan
    API_URL: "https://aliancascamarsan1993.pythonanywhere.com",

    // Nome da aplicação
    APP_NAME: "CamarSan"
};


// -----------------------------------------------------
// INICIALIZAÇÃO
// -----------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    inicializarSite();
    const menuToggleBtn = document.getElementById("menu-toggle-btn");
    const navDropdownMenu = document.getElementById("nav-dropdown-menu");
    
    const filtroToggleBtn = document.getElementById("filtro-toggle-btn");
    const filtroDropdownMenu = document.getElementById("filtro-dropdown-menu");

    // Lógica do Menu Principal
    if (menuToggleBtn && navDropdownMenu) {
        menuToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (filtroDropdownMenu) filtroDropdownMenu.classList.remove("ativo");
            navDropdownMenu.classList.toggle("ativo");
        });
    }

    // Lógica do Menu de Filtros no Cabeçalho
    if (filtroToggleBtn && filtroDropdownMenu) {
        filtroToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (navDropdownMenu) navDropdownMenu.classList.remove("ativo");
            filtroDropdownMenu.classList.toggle("ativo");
        });
    }

    // Fecha os menus ao clicar fora
    document.addEventListener("click", (e) => {
        if (navDropdownMenu && !navDropdownMenu.contains(e.target) && !menuToggleBtn?.contains(e.target)) {
            navDropdownMenu.classList.remove("ativo");
        }
        if (filtroDropdownMenu && !filtroDropdownMenu.contains(e.target) && !filtroToggleBtn?.contains(e.target)) {
            filtroDropdownMenu.classList.remove("ativo");
        }
    });
});

function inicializarSite() {
    console.log(`${CONFIG.APP_NAME} iniciado.`);

    inicializarMenu();
    inicializarBotoes();
    inicializarAno();
    inicializarProdutosDestaque();
    inicializarNumismaticaDestaque(); // <-- Adicionado para carregar as moedas e notas na home
    inicializarEventos();
    inicializarDepoimentos();
    inicializarEnvioDepoimento();
    inicializarCarrosselDiferenciais();
    inicializarToggleDepoimento();
}

// -----------------------------------------------------
// CARROSSEL DE DIFERENCIAIS
// -----------------------------------------------------

function inicializarCarrosselDiferenciais() {
    const container = document.querySelector("#carrossel-diferenciais");
    const containerIndicadores = document.querySelector("#indicadores-diferenciais");

    if (!container || !containerIndicadores) return;

    const cards = container.querySelectorAll(".diferencial-card");
    containerIndicadores.innerHTML = "";

    cards.forEach((_, index) => {
        const ponto = document.createElement("div");
        ponto.classList.add("indicador-ponto");
        if (index === 0) ponto.classList.add("ativo");
        containerIndicadores.appendChild(ponto);
    });

    const pontos = containerIndicadores.querySelectorAll(".indicador-ponto");

    container.addEventListener("scroll", () => {
        const indexAtivo = Math.round(container.scrollLeft / container.clientWidth);

        pontos.forEach((ponto, index) => {
            if (index === indexAtivo) {
                ponto.classList.add("ativo");
            } else {
                ponto.classList.remove("ativo");
            }
        });
    });
}

// -----------------------------------------------------
// MENU E SONS (COMPATÍVEL COM RAIZ E SUBPASTAS)
// -----------------------------------------------------

function inicializarMenu() {
    // Deteta se a página está numa subpasta (ex: /pages/catalogo.html) para ajustar o caminho do som
    const estaEmSubpasta = window.location.pathname.includes('/pages/');
    const caminhoSom = estaEmSubpasta ? '../assets/sons/clique.mp3' : 'assets/sons/clique.mp3';

    // Cria o objeto de áudio com o caminho dinâmico correto
    const somClique = new Audio(caminhoSom);

    // Seleciona TODOS os elementos marcados com .btn-com-som no cabeçalho e no menu suspenso
    const elementosComSom = document.querySelectorAll(".btn-com-som");
    
    elementosComSom.forEach(elemento => {
        elemento.addEventListener("click", () => {
            somClique.currentTime = 0; // Reinicia o áudio para cliques rápidos seguidos
            somClique.play().catch(erro => console.log("Áudio aguardando interação:", erro));
        });
    });
}
// -----------------------------------------------------
// BOTÕES
// -----------------------------------------------------

function inicializarBotoes() {
    const botoesWhatsApp = document.querySelectorAll(".btn-whatsapp");

    botoesWhatsApp.forEach((botao) => {
        botao.addEventListener("click", () => {
            console.log("Botão WhatsApp acionado.");
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
// API - PRODUTOS EM DESTAQUE
// -----------------------------------------------------

async function inicializarProdutosDestaque() {
    const container = document.querySelector("#produtos-destaque");

    if (!container) {
        console.warn("Container de produtos em destaque não encontrado.");
        return;
    }

    try {
        const resposta = await fetch(`${CONFIG.API_URL}/produtos`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const produtos = await resposta.json();
        container.innerHTML = "";

        if (produtos.length === 0) {
            container.innerHTML = "<p>Nenhuma aliança cadastrada no momento.</p>";
            return;
        }

        produtos.slice(0, 4).forEach(produto => {
            const card = document.createElement("article");
            card.classList.add("produto-card");

            const fotoUrl = produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : '';

            card.innerHTML = `
                <img src="${fotoUrl}" alt="${produto.nome}">
                <div class="produto-card-body">
                    <h3>${produto.nome}</h3>
                    <p class="produto-preco">R$ ${produto.preco.toFixed(2).replace(".", ",")}</p>
                    <a href="pages/produto.html?id=${produto.id}" class="btn-detalhes">Ver detalhes</a>
                </div>
            `;

            container.appendChild(card);
        });

        console.log(`${produtos.length} produtos carregados pela API.`);

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        container.innerHTML = "<p>Não foi possível carregar os produtos.</p>";
    }
}


// -----------------------------------------------------
// API - NUMISMÁTICA EM DESTAQUE (MOEDAS E NOTAS)
// -----------------------------------------------------

async function inicializarNumismaticaDestaque() {
    const container = document.querySelector("#numismatica-home");

    if (!container) {
        return; // Caso a secção não esteja presente na página atual
    }

    try {
        const resposta = await fetch(`${CONFIG.API_URL}/numismatica`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const itens = await resposta.json();
        container.innerHTML = "";

        if (itens.length === 0) {
            container.innerHTML = "<p>Nenhuma peça numismática cadastrada no momento.</p>";
            return;
        }

        // Mostra até 4 peças em destaque na página inicial
        itens.slice(0, 4).forEach(item => {
            const card = document.createElement("article");
            card.classList.add("produto-card");

            const fotoUrl = item.imagens && item.imagens.length > 0 ? item.imagens[0] : '';

            card.innerHTML = `
                <img src="${fotoUrl}" alt="${item.nome}">
                <div class="produto-card-body">
                    <h3>${item.nome}</h3>
                    <p class="produto-preco">R$ ${Number(item.preco).toFixed(2).replace(".", ",")}</p>
                    <a href="pages/item-numismatica.html?id=${item.id}" class="btn-detalhes">Ver detalhes</a>
                </div>
            `;

            container.appendChild(card);
        });

        console.log(`${itens.length} peças numismáticas carregadas pela API.`);

    } catch (erro) {
        console.error("Erro ao carregar numismática:", erro);
        container.innerHTML = "<p>Não foi possível carregar as moedas e notas antigas.</p>";
    }
}


async function inicializarEventos() {
    const container = document.querySelector("#eventos-container");

    if (!container) {
        return;
    }

    try {
        const resposta = await fetch(`${CONFIG.API_URL}/eventos`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const eventos = await resposta.json();
        container.innerHTML = "";

        if (eventos.length === 0) {
            container.innerHTML = "<p>Nenhum evento agendado no momento. Acompanhe o nosso Instagram para novidades!</p>";
            return;
        }

        container.classList.add("produtos-destaque");

        // Data atual do sistema (ignorando a hora para comparar apenas o dia)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Lista para armazenar todos os pares de (evento + data individual válida)
        let listaEventosFiltrados = [];

        eventos.forEach(evento => {
            const listaDatas = (evento.datas && Array.isArray(evento.datas) && evento.datas.length > 0)
                ? evento.datas
                : [evento.data || ""];

            listaDatas.forEach(dataStr => {
                // Converte a string "DD/MM/AAAA" para o formato Date do JavaScript (AAAA-MM-DD)
                const partes = dataStr.split('/');
                if (partes.length === 3) {
                    const dia = parseInt(partes[0], 10);
                    const mes = parseInt(partes[1], 10) - 1; // Meses no JS começam em 0
                    const ano = parseInt(partes[2], 10);
                    const dataObj = new Date(ano, mes, dia);

                    // Verifica se a data é válida e se NÃO já passou (>= hoje)
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

        // Ordena por ordem cronológica (da data mais próxima para a mais distante)
        listaEventosFiltrados.sort((a, b) => a.dataObj - b.dataObj);

        if (listaEventosFiltrados.length === 0) {
            container.innerHTML = "<p>Nenhum evento agendado para as próximas datas. Acompanhe o nosso Instagram para novidades!</p>";
            return;
        }

        // Renderiza cada card com base na lista filtrada e ordenada
        listaEventosFiltrados.forEach(item => {
            const evento = item.evento;
            const dataIndividual = item.dataStr;

            const card = document.createElement("article");
            card.classList.add("produto-card");

            const imagemHtml = evento.imagem ? `
                <div class="produto-card-img">
                    <img src="${evento.imagem}" alt="${evento.nome}">
                </div>
            ` : '';

            card.innerHTML = `
                ${imagemHtml}
                <div class="evento-card-body">
                    <span class="evento-data-badge">📅 ${dataIndividual}</span>
                    <h3>${evento.nome}</h3>
                    <div class="evento-info-extra">
                        <span>📍 ${evento.local}</span>
                        <span>⏰ ${evento.horario}</span>
                    </div>
                    <a href="pages/evento.html?id=${evento.id}" class="btn-detalhes">Ver detalhes</a>
                </div>
            `;

            container.appendChild(card);
        });

        console.log(`${listaEventosFiltrados.length} ocorrências de eventos futuros carregadas e ordenadas.`);

    } catch (erro) {
        console.error("Erro ao carregar eventos:", erro);
        container.innerHTML = "<p>Não foi possível carregar os eventos no momento.</p>";
    }
}
// -----------------------------------------------------
// API - DEPOIMENTOS PÚBLICOS
// -----------------------------------------------------

async function inicializarDepoimentos() {
    const container = document.querySelector("#lista-depoimentos-publicos");

    if (!container) {
        return;
    }

    try {
        const resposta = await fetch(`${CONFIG.API_URL}/depoimentos`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const depoimentos = await resposta.json();
        container.innerHTML = "";

        if (depoimentos.length === 0) {
            container.innerHTML = "<p>Ainda não há depoimentos publicados. Seja o primeiro a avaliar!</p>";
            return;
        }

        depoimentos.forEach(d => {
            const estrelasStr = "⭐".repeat(d.estrelas);

            const imagemHtml = d.foto_path ? `
                <div style="flex-shrink: 0;">
                    <img src="${CONFIG.API_URL}/uploads/${d.foto_path}" alt="Foto do cliente" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">
                </div>
            ` : '';

            const card = document.createElement("div");
            card.classList.add("card-depoimento-publico");

            card.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: flex-start;">
                    ${imagemHtml}
                    <div style="flex-grow: 1; overflow: hidden;">
                        <div style="color: #f39c12; margin-bottom: 4px; font-size: 0.85rem;">${estrelasStr}</div>
                        <p class="texto-depoimento-limitado" style="color: var(--cinza); font-style: italic; font-size: 0.9rem; line-height: 1.4; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; transition: max-height 0.3s ease;">
                            "${d.mensagem}"
                        </p>
                        <button class="btn-expandir-depo" style="background: none; border: none; color: var(--dourado-escuro); font-weight: bold; font-size: 0.8rem; cursor: pointer; padding: 0; margin-bottom: 8px; text-decoration: underline;">
                            Ver mais
                        </button>
                    </div>
                </div>
                <div style="margin-top: 10px; border-top: 1px solid #f0f0f0; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 0.85rem; color: #222;">${d.nome}</strong>
                    <small style="color: #777; font-size: 0.75rem;">${d.cidade}</small>
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

        console.log(`${depoimentos.length} depoimentos carregados pela API.`);

    } catch (erro) {
        console.error("Erro ao carregar depoimentos:", erro);
        container.innerHTML = "<p>Não foi possível carregar os depoimentos no momento.</p>";
    }
}


// -----------------------------------------------------
// API - ENVIO DE NOVO DEPOIMENTO
// -----------------------------------------------------

function inicializarEnvioDepoimento() {
    const form = document.querySelector("#form-enviar-depoimento");

    if (!form) {
        return;
    }

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
                alert("Muito obrigado! O seu depoimento foi enviado com sucesso e será publicado após a nossa verificação.");
                form.reset();
            } else {
                alert("Erro ao enviar o depoimento. Tente novamente.");
            }
        } catch (erro) {
            console.error("Erro:", erro);
            alert("Não foi possível conectar ao servidor para enviar o depoimento.");
        }
    });
}


// -----------------------------------------------------
// TOGGLE DO FORMULÁRIO DE DEPOIMENTO
// -----------------------------------------------------

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
// LÓGICA DA CONVERSA INTERATIVA COM O MOISES (7 CENAS)
// -----------------------------------------------------

const roteiroConversa = [
    {
        fala: "Olá! Sou o Moises, artesão CamarSan. Clique em Mim para conversarmos sobre as nossas alianças artesanais e sobre este Site.",
        botao: "Vamos lá!",
        imagem: "mascote-img11.png"
    },
    {
        fala: "Transformamos moedas antigas em joias exclusivas e cheias de história para perpetuar gerações. Clique no MENU acima e veja a Seção NOSSA HISTÓRIA!  ",
        botao: "Como funciona?",
        imagem: "mascote-img2.png"
    },
    {
        fala: "Você escolhe o modelo ideal no catálogo, coloca no CARRINHO e clica em FINALIZAR, nós tratamos de todos os detalhes e medidas a partir daí.",
        botao: "Quero ver os modelos!",
        imagem: "mascote-img3.png"
    },
    {
        fala: "Estes são os nossos destaques mais queridos. Você pode ver os detalhes e logo abaixo pode ver todos os Modelos do CATÁLOGO!",
        botao: "Como faço o pedido?",
        imagem: "mascote-img4.png",
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('#destaques').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({
                    top: posicaoOriginal,
                    behavior: 'smooth'
                });
            }, 1500);
        }
    },
    {
        fala: "Combinamos tudo diretamente pelo WhatsApp de forma rápida, segura e totalmente personalizada.",
        botao: "Quais as entregas?",
        imagem: "mascote-img5.png"
    },
    {
        fala: "Enviamos via Correios para todo o Brasil, entregamos por motoboy na região ou retirada local.",
        botao: "Perfeito!",
        imagem: "mascote-img6.png"
    },
    {
        fala: "Veja mais sobre meu trabalho no instagram, sempre posto o passo a passo de como faço a forja, o polimento e demais etapas do processo produtivo.",
        botao: "Segue lá",
        imagem: "mascote-img7.png",
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('#redes-sociais').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({
                    top: posicaoOriginal,
                    behavior: 'smooth'
                });
            }, 2000);
        }
    },
    {
        fala: "Veja os Eventos que Participamos em Caxias do Sul, estamos nas Melhores Feiras da Cidade!",
        botao: "Nos Vemos Por Aí!",
        imagem: "mascote-img8.png",
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('#eventos').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({
                    top: posicaoOriginal,
                    behavior: 'smooth'
                });
            }, 2000);
        }
    },
    {
        fala: "Depois de sua experiência com a Camarsan deixe o seu feedback nos depoimentos abaixo, sua opinião é muito importante para nós!",
        botao: "COMENTEM!",
        imagem: "mascote-img9.png",
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('.secao-depoimentos-publicos').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({
                    top: posicaoOriginal,
                    behavior: 'smooth'
                });
            }, 2000);
        }
    },
    {
        fala: "Ficou com alguma dúvida ou quer encomendar? É só me chamar no WhatsApp abaixo ou me ligar pelo telefone. Até breve!",
        botao: "Reiniciar conversa",
        imagem: "mascote-img10.png",
        final: true,
        acao: () => {
            const posicaoOriginal = window.scrollY;
            document.querySelector('#contato').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.scrollTo({
                    top: posicaoOriginal,
                    behavior: 'smooth'
                });
            }, 2000);
        }
    }
];

let cenaAtual = 0;
const caminhoImagens = "assets/mascote/";

const areaMascote = document.getElementById('area-mascote');
const imgMascote = document.getElementById('img-mascote');
const balaoFala = document.getElementById('balao-fala-moises');
const textoFala = document.getElementById('texto-fala');
const btnProxima = document.getElementById('btn-proxima-fala');

if (imgMascote) {
    imgMascote.style.transition = "opacity 0.4s ease-in-out, transform 0.4s ease-in-out";
}

if (areaMascote && imgMascote && balaoFala && textoFala && btnProxima) {
    function atualizarCena() {
        const dadosCena = roteiroConversa[cenaAtual];
        balaoFala.classList.remove('visivel');

        // Transição suave apenas de fade e zoom leve, sem mexer na posição horizontal
        imgMascote.style.opacity = 0;
        imgMascote.style.transform = "scale(0.96)";

        setTimeout(() => {
            imgMascote.src = caminhoImagens + dadosCena.imagem;
            imgMascote.alt = `Moises CamarSan - Cena ${cenaAtual + 1}`;
            
            imgMascote.style.opacity = 1;
            imgMascote.style.transform = "scale(1)";

            textoFala.textContent = dadosCena.fala;
            btnProxima.textContent = dadosCena.botao;

            if (dadosCena.acao) {
                dadosCena.acao();
            }

            if (dadosCena.final) {
                btnProxima.style.display = 'inline-block';
            } else {
                btnProxima.style.display = 'inline-block';
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
            cenaAtual = 0; // Reinicia o ciclo ao chegar ao fim
            atualizarCena();
        }
    }
}
// --- FUNÇÃO PARA ABRIR O WHATSAPP COM MENSAGEM GERAL DE CONTATO ---
function falarPeloWhatsApp(e) {
    if (e) e.preventDefault();

    const numeroWhatsApp = "5554996322787"; // O seu número configurado
    const mensagem = "Olá! Gostaria de conversar com a CamarSan sobre sobre assuntos que vi no site e tirar algumas dúvidas.";
    
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
}
