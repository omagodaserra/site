// =====================================================
// O MAGO DA SERRA - CARRINHO EXCLUSIVO DA BANCA
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slugBanca = urlParams.get('slug');

    if (!slugBanca) {
        alert("Banca não identificada.");
        window.location.href = "../index.html";
        return;
    }

    const API_URL = "https://omagodaserra.pythonanywhere.com";
    const chaveStorage = `carrinho_banca_${slugBanca}`;

    carregarCarrinhoBanca(slugBanca, chaveStorage, API_URL);

    document.getElementById("btn-limpar-carrinho-banca").addEventListener("click", () => {
        if (confirm("Deseja esvaziar o carrinho desta banca?")) {
            localStorage.removeItem(chaveStorage);
            carregarCarrinhoBanca(slugBanca, chaveStorage, API_URL);
        }
    });
});

async function carregarCarrinhoBanca(slugBanca, chaveStorage, apiUrl) {
    let carrinho = JSON.parse(localStorage.getItem(chaveStorage)) || [];
    const listaContainer = document.getElementById("lista-carrinho-banca");
    const resumoQtd = document.getElementById("resumo-qtd-banca");
    const resumoTotal = document.getElementById("resumo-total-banca");

    resumoQtd.textContent = carrinho.length;

    // Buscar dados da banca para obter o nome e o WhatsApp do lojista
    let dadosBanca = {};
    try {
        const res = await fetch(`${apiUrl}/bancas/${slugBanca}`);
        dadosBanca = await res.json();
        const subtitulo = document.getElementById("carrinho-banca-subtitulo");
        if (subtitulo) subtitulo.textContent = `Banca: ${dadosBanca.nome || slugBanca}`;
    } catch (e) {
        console.error("Erro ao buscar dados da banca:", e);
    }

    if (carrinho.length === 0) {
        listaContainer.innerHTML = `
            <div style="background: var(--branco); padding: 30px; border-radius: 12px; text-align: center; border: 1px solid var(--cinza-claro); width: 100%;">
                <p style="color: var(--cinza); margin-bottom: 15px;">O seu carrinho nesta banca está vazio.</p>
                <a href="banca.html?slug=${slugBanca}" class="btn-mago-base btn-tipo-1" style="display: inline-block; width: auto; padding: 10px 20px;">Voltar para a Banca</a>
            </div>
        `;
        resumoTotal.textContent = "R$ 0,00";
        return;
    }

    listaContainer.innerHTML = "";
    let totalGeral = 0;

    carrinho.forEach((produto, index) => {
        totalGeral += Number(produto.preco || 0);
        const imagemCapa = (produto.imagens && produto.imagens.length > 0) ? produto.imagens[0] : '../assets/logo/logo.png';

        const itemDiv = document.createElement("div");
        itemDiv.className = "carrinho-item";
        itemDiv.innerHTML = `
            <img src="${imagemCapa}" alt="${produto.nome}">
            <div class="carrinho-item-info">
                <h4>${produto.nome}</h4>
                <p>R$ ${Number(produto.preco).toFixed(2)}</p>
                <button onclick="removerItemBanca('${slugBanca}', ${index})" class="btn-mago-base btn-tipo-2" style="padding: 4px 10px; font-size: 0.75rem; width: auto;">Remover</button>
            </div>
        `;
        listaContainer.appendChild(itemDiv);
    });

    resumoTotal.textContent = `R$ ${totalGeral.toFixed(2)}`;

    // Configurar botão de finalizar via WhatsApp com o número do lojista
    const btnFinalizar = document.getElementById("btn-finalizar-whatsapp-banca");
    btnFinalizar.onclick = () => {
        enviarPedidoWhatsAppBanca(carrinho, dadosBanca, totalGeral);
    };
}

window.removerItemBanca = function(slugBanca, index) {
    const chaveStorage = `carrinho_banca_${slugBanca}`;
    let carrinho = JSON.parse(localStorage.getItem(chaveStorage)) || [];
    carrinho.splice(index, 1);
    localStorage.setItem(chaveStorage, JSON.stringify(carrinho));
    const API_URL = "https://omagodaserra.pythonanywhere.com";
    carregarCarrinhoBanca(slugBanca, chaveStorage, API_URL);
};

function enviarPedidoWhatsAppBanca(carrinho, banca, totalGeral) {
    let mensagem = `🏛️ *Novo Pedido - Banca ${banca.nome || 'Parceira'}*\n\n`;

    carrinho.forEach((produto, i) => {
        let imagemCapa = (produto.imagens && produto.imagens.length > 0) ? produto.imagens[0] : '';
        mensagem += `${i + 1}. *${produto.nome}*\n`;
        mensagem += `   Preço: R$ ${Number(produto.preco).toFixed(2)}\n`;
        if (imagemCapa) mensagem += `   📷 Foto: ${imagemCapa}\n`;
        mensagem += `\n`;
    });

    mensagem += `*Total do Pedido:* R$ ${totalGeral.toFixed(2)}`;
    mensagem += `\n\nGostaria de combinar a entrega e o pagamento deste pedido.`;

    // Usa o WhatsApp do lojista cadastrado ou um número padrão do Mago
    const numeroWhatsApp = banca.whatsapp || "5554996322787";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
}