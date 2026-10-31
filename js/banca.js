// =====================================================
// O MAGO DA SERRA - LÓGICA DA BANCA PARCEIRA
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slugBanca = urlParams.get('slug'); // Ex: dolfin

    if (!slugBanca) {
        document.getElementById("banca-nome-h1").textContent = "Banca não encontrada";
        return;
    }

    const API_URL = "https://omagodaserra.pythonanywhere.com";

    // Atualiza o link do carrinho no topo para passar a banca atual
    const linkCarrinho = document.getElementById("link-carrinho-banca");
    if (linkCarrinho) {
        linkCarrinho.href = `banca-carrinho.html?slug=${slugBanca}`;
    }

    atualizarContadorCarrinhoBanca(slugBanca);

    // Buscar dados da banca e seus produtos
    fetch(`${API_URL}/bancas/${slugBanca}`)
        .then(res => res.json())
        .then(dados => {
            if (dados.logo_path) {
                document.getElementById("banca-cabecalho-logo").innerHTML = `
                    <img src="${dados.logo_path}" alt="${dados.nome}" class="banca-logo-img">
                `;
            }
            document.getElementById("banca-nome-h1").textContent = dados.nome;
            document.getElementById("banca-slogan-h2").textContent = dados.slogan || "";
            document.getElementById("banca-descricao-p").textContent = dados.descricao || "";

            // Renderizar botões dinâmicos de contacto (WhatsApp, Instagram, Localização)
            renderizarBotoesContato(dados);

            // Renderizar produtos da banca no padrão do catálogo
            renderizarProdutosBanca(dados.produtos || [], slugBanca);
        })
        .catch(err => {
            console.error("Erro ao carregar banca:", err);
        });
});

// Renderizar botões dinâmicos com imagem padrão do CSS
function renderizarBotoesContato(dados) {
    const container = document.getElementById("banca-botoes-contato");
    if (!container) return;
    container.innerHTML = "";

    // 1. Botão WhatsApp (se cadastrado)
    if (dados.whatsapp) {
        const aWhats = document.createElement("a");
        aWhats.href = `https://wa.me/${dados.whatsapp}?text=${encodeURIComponent("Olá! Vim pela banca " + dados.nome + " no site O Mago da Serra.")}`;
        aWhats.target = "_blank";
        aWhats.className = "btn-mago-base btn-tipo-2 btn-som-2";
        aWhats.innerHTML = `<img src="../assets/icones/whats.png" alt="WhatsApp" class="btn-mago-icone"><span>WhatsApp do Lojista</span>`;
        container.appendChild(aWhats);
    }

    // 2. Botão Instagram (se cadastrado)
    if (dados.instagram) {
        const aInsta = document.createElement("a");
        aInsta.href = dados.instagram;
        aInsta.target = "_blank";
        aInsta.className = "btn-mago-base btn-tipo-2 btn-som-2";
        aInsta.innerHTML = `<img src="../assets/icones/instagram.png" alt="Instagram" class="btn-mago-icone"><span>Instagram da Banca</span>`;
        container.appendChild(aInsta);
    }

    // 3. Botão Localização (se cadastrado)
    if (dados.localizacao || dados.mapa) {
        const linkLocal = dados.localizacao || dados.mapa;
        const aLocal = document.createElement("a");
        aLocal.href = linkLocal;
        aLocal.target = "_blank";
        aLocal.className = "btn-mago-base btn-tipo-2 btn-som-2";
        aLocal.innerHTML = `<img src="../assets/icones/fone.png" alt="Localização" class="btn-mago-icone"><span>Ver Localização / Banca</span>`;
        container.appendChild(aLocal);
    }
}

function renderizarProdutosBanca(produtos, slugBanca) {
    const container = document.getElementById("lista-catalogo-banca");
    container.innerHTML = "";

    // Remove indicadores antigos antes de recriar
    const indicadoresAntigos = document.getElementById("catalogo-indicadores-banca");
    if (indicadoresAntigos) indicadoresAntigos.remove();

    if (produtos.length === 0) {
        container.innerHTML = `<p class="carregando-texto">Esta banca ainda não possui produtos cadastrados no catálogo.</p>`;
        return;
    }

    produtos.forEach((produto, index) => {
        const capa = produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : '../assets/logo/logo.png';
        
        const card = document.createElement("div");
        card.className = "produto-card";
        card.dataset.index = index;

        card.innerHTML = `
            <div class="produto-card-img">
                <img src="${capa}" alt="${produto.nome}">
            </div>
            <div class="produto-card-body">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao ? produto.descricao.substring(0, 80) + '...' : 'Peça artesanal exclusiva da banca.'}</p>
                <div class="produto-preco">R$ ${Number(produto.preco).toFixed(2)}</div>
                <div class="produto-botoes">
                    <a href="banca-produto.html?banca=${slugBanca}&id=${produto.id}" class="btn-detalhes">Detalhes</a>
                    <button type="button" class="btn-add-carrinho" onclick='adicionarAoCarrinhoBanca("${slugBanca}", ${JSON.stringify(produto)})'>Adicionar</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    criarMarcadoresPosicaoBanca(produtos.length);
}

function criarMarcadoresPosicaoBanca(totalProdutos) {
    const containerCatalogo = document.getElementById("lista-catalogo-banca");
    const secaoCatalogo = containerCatalogo.closest(".secao-catalogo");

    if (!containerCatalogo || !secaoCatalogo) return;

    const indicadoresContainer = document.createElement("div");
    indicadoresContainer.className = "catalogo-indicadores";
    indicadoresContainer.id = "catalogo-indicadores-banca";

    for (let i = 0; i < totalProdutos; i++) {
        const bolinha = document.createElement("button");
        bolinha.type = "button";
        bolinha.className = i === 0 ? "bolinha-indicador ativa" : "bolinha-indicador";
        bolinha.setAttribute("aria-label", `Ir para produto ${i + 1}`);
        bolinha.dataset.index = i;

        bolinha.addEventListener("click", () => {
            const cards = containerCatalogo.querySelectorAll(".produto-card");
            if (cards[i]) {
                cards[i].scrollIntoView({
                    behavior: "smooth",
                    inline: "start",
                    block: "nearest"
                });
            }
        });

        indicadoresContainer.appendChild(bolinha);
    }

    secaoCatalogo.appendChild(indicadoresContainer);

    containerCatalogo.addEventListener("scroll", () => {
        const cards = containerCatalogo.querySelectorAll(".produto-card");
        const bolinhas = indicadoresContainer.querySelectorAll(".bolinha-indicador");
        
        let cardMaisProximo = 0;
        let menorDistancia = Infinity;

        cards.forEach((card, index) => {
            const distancia = Math.abs(card.offsetLeft - containerCatalogo.scrollLeft);
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                cardMaisProximo = index;
            }
        });

        bolinhas.forEach((bolinha, index) => {
            if (index === cardMaisProximo) {
                bolinha.classList.add("ativa");
            } else {
                bolinha.classList.remove("ativa");
            }
        });
    }, { passive: true });
}

// Adicionar produto ao carrinho exclusivo da banca no localStorage
window.adicionarAoCarrinhoBanca = function(slugBanca, produto) {
    const chaveStorage = `carrinho_banca_${slugBanca}`;
    let carrinho = JSON.parse(localStorage.getItem(chaveStorage)) || [];
    
    carrinho.push(produto);
    localStorage.setItem(chaveStorage, JSON.stringify(carrinho));

    atualizarContadorCarrinhoBanca(slugBanca);
    alert(`"${produto.nome}" foi adicionado ao carrinho da banca!`);
};

function atualizarContadorCarrinhoBanca(slugBanca) {
    const chaveStorage = `carrinho_banca_${slugBanca}`;
    let carrinho = JSON.parse(localStorage.getItem(chaveStorage)) || [];
    const contador = document.getElementById("contador-carrinho-banca");
    if (contador) {
        contador.textContent = carrinho.length;
    }
}
