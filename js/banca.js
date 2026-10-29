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

            // Renderizar produtos da banca
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

    if (produtos.length === 0) {
        container.innerHTML = `<p class="carregando-texto">Esta banca ainda não possui produtos cadastrados no catálogo.</p>`;
        return;
    }

    produtos.forEach(produto => {
        const capa = produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : '../assets/logo/logo.png';
        
        const card = document.createElement("div");
        card.className = "produto-card";
        card.innerHTML = `
            <div class="produto-card-img">
                <img src="${capa}" alt="${produto.nome}" style="height: 200px; object-fit: cover; width: 100%;">
            </div>
            <div class="produto-card-body" style="padding: 15px; display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;">
                <div>
                    <h3 style="font-family: 'Cinzel', serif; font-size: 1.1rem; color: var(--azul-profundo); margin-bottom: 6px;">${produto.nome}</h3>
                    <p style="font-size: 0.9rem; color: var(--cinza); margin-bottom: 10px;">${produto.descricao || ''}</p>
                    <div class="produto-preco" style="font-weight: bold; color: var(--dourado-escuro); margin-bottom: 12px;">R$ ${Number(produto.preco).toFixed(2)}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="banca-produto.html?banca=${slugBanca}&id=${produto.id}" class="btn-mago-base btn-tipo-2" style="width: 100%; padding: 8px; font-size: 0.85rem; text-align: center;">Ver Detalhes</a>
                    <button type="button" onclick='adicionarAoCarrinhoBanca("${slugBanca}", ${JSON.stringify(produto)})' class="btn-mago-base btn-tipo-1" style="width: 100%; padding: 8px; font-size: 0.85rem;">Adicionar ao Carrinho</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
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