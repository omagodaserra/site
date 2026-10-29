// =====================================================
// O MAGO DA SERRA - PÁGINA DE PRODUTO DA BANCA PARCEIRA
// =====================================================

const CONFIG_BANCA_PRODUTO = {
    API_URL: "https://omagodaserra.pythonanywhere.com"
};

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutoBanca();
});

async function carregarProdutoBanca() {
    const container = document.querySelector("#produto-container");
    if (!container) return;

    const parametros = new URLSearchParams(window.location.search);
    const slugBanca = parametros.get("banca"); // Ex: dolfin
    const idProduto = parametros.get("id");

    if (!slugBanca || !idProduto) {
        container.innerHTML = `<p class="carregando-texto">Produto ou banca não especificados.</p>`;
        return;
    }

    try {
        // Busca os dados completos da banca, que incluem o WhatsApp do lojista e seus produtos
        const resposta = await fetch(`${CONFIG_BANCA_PRODUTO.API_URL}/bancas/${slugBanca}`);
        if (!resposta.ok) throw new Error("Erro ao carregar dados da banca.");

        const dadosBanca = await resposta.json();
        const produtos = dadosBanca.produtos || [];
        
        const produto = produtos.find(item => String(item.id) === String(idProduto));

        if (!produto) {
            container.innerHTML = `<p class="carregando-texto">Tesouro não encontrado nesta banca.</p>`;
            return;
        }

        exibirProdutoBanca(produto, dadosBanca);

    } catch (erro) {
        console.error("Erro ao carregar produto da banca:", erro);
        container.innerHTML = `<p class="carregando-texto" style="color: red;">Não foi possível carregar o produto.</p>`;
    }
}

function exibirProdutoBanca(produto, banca) {
    const container = document.querySelector("#produto-container");
    const imagens = produto.imagens && produto.imagens.length > 0 ? produto.imagens : ['../assets/logo/logo.png'];

    container.innerHTML = `
        <div class="produto-galeria">
            <div class="produto-imagem-principal-container">
                <img id="imagem-principal" src="${imagens[0]}" alt="${produto.nome}" class="produto-imagem-principal">
            </div>
            <div class="produto-miniaturas">
                ${imagens.map((imagem, index) => `
                    <button type="button" class="miniatura ${index === 0 ? "ativa" : ""}" data-imagem="${imagem}" aria-label="Ver imagem ${index + 1}">
                        <img src="${imagem}" alt="${produto.nome} - imagem ${index + 1}">
                    </button>
                `).join("")}
            </div>
        </div>

        <div class="produto-informacoes">
            <p class="produto-categoria">Banca: ${banca.nome}</p>
            <h1>${produto.nome}</h1>
            <p class="produto-descricao">${produto.descricao || 'Peça artesanal exclusiva do nosso reino.'}</p>
            
            <div class="produto-caracteristicas">
                <p><strong>Disponibilidade:</strong> ${produto.disponibilidade || 'Disponível na banca'}</p>
            </div>

            <p class="produto-preco">R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}</p>

            <a href="#" class="btn-whatsapp-personalizado" id="produto-banca-whatsapp" target="_blank" rel="noopener noreferrer">
                <img src="../assets/icones/whats.png" alt="WhatsApp" class="icone-contato-btn">
                SABER MAIS (FALAR COM O LOJISTA)
            </a>
        </div>
    `;

    inicializarGaleriaProdutos();

    // --- CONFIGURAR BOTÃO WHATSAPP EXCLUSIVO DO LOJISTA DA BANCA ---
    const btnWhatsapp = document.getElementById("produto-banca-whatsapp");
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener("click", (e) => {
            e.preventDefault();

            const imagemCapa = imagens[0] || '';
            const precoFormatado = `R$ ${Number(produto.preco).toFixed(2)}`;

            let mensagem = `🧙‍♂️ *Consulta sobre Produto - Banca ${banca.nome}*\n\n`;
            mensagem += `Olá! Gostaria de saber mais sobre o item:\n`;
            mensagem += `*${produto.nome}*\n`;
            mensagem += `Preço: ${precoFormatado}\n`;

            if (imagemCapa) {
                mensagem += `📷 Foto: ${imagemCapa}\n`;
            }

            mensagem += `\nPoderia me dar mais detalhes?`;

            // Utiliza o número de WhatsApp cadastrado pelo lojista (ou número padrão do mago caso não tenha)
            const numeroWhatsApp = banca.whatsapp || "5554996322787";
            const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

            window.open(url, "_blank");
        });
    }
}

function inicializarGaleriaProdutos() {
    const imagemPrincipal = document.querySelector("#imagem-principal");
    const miniaturas = document.querySelectorAll(".miniatura");

    miniaturas.forEach((miniatura) => {
        miniatura.addEventListener("click", () => {
            const novaImagem = miniatura.dataset.imagem;
            imagemPrincipal.src = novaImagem;

            miniaturas.forEach((item) => item.classList.remove("ativa"));
            miniatura.classList.add("ativa");
        });
    });
}