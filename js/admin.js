// =====================================================
// O MAGO DA SERRA - LÓGICA DO PAINEL ADMINISTRATIVO
// =====================================================

const API_URL = "https://omagodaserra.pythonanywhere.com";
const SENHA_ADMIN_MASTER = "mago1234";

document.addEventListener("DOMContentLoaded", () => {
    configurarAnoRodape();
    configurarLogin();
    configurarFormularioBanca();
    configurarFormularioEvento();
    configurarBotaoSair();
});

function configurarAnoRodape() {
    const spanAno = document.getElementById("ano-atual");
    if (spanAno) {
        spanAno.textContent = new Date().getFullYear();
    }
}

function configurarLogin() {
    const formLogin = document.getElementById("form-login-admin");
    if (!formLogin) return;

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const credencial = document.getElementById("senha-ou-chave").value.trim();

        document.getElementById("painel-login-wrapper").style.display = "none";
        document.getElementById("painel-conteudo-restrito").style.display = "block";

        if (credencial === SENHA_ADMIN_MASTER) {
            document.getElementById("bloco-admin-master").style.display = "block";
            carregarBancasAdmin();
            carregarEventosAdmin();
            carregarDepoimentosAdmin();
        } else {
            verificarChaveLojista(credencial);
        }
    });
}

function verificarChaveLojista(chave) {
    fetch(`${API_URL}/bancas`)
        .then(res => res.json())
        .then(bancas => {
            const bancaEncontrada = bancas.find(b => b.chave_acesso === chave);

            if (bancaEncontrada) {
                document.getElementById("bloco-lojista-parceiro").style.display = "block";
                document.getElementById("titulo-painel-lojista").textContent = `Gestão da Banca: ${bancaEncontrada.nome}`;
            } else {
                alert("Credencial inválida! Verifique sua senha de administrador ou chave de acesso.");
                window.location.reload();
            }
        })
        .catch(err => {
            console.error("Erro ao validar chave:", err);
            alert("Erro de conexão com o reino.");
            window.location.reload();
        });
}

function configurarBotaoSair() {
    const btnSair = document.getElementById("btn-sair");
    if (!btnSair) return;

    btnSair.addEventListener("click", () => {
        window.location.reload();
    });
}

// -----------------------------------------------------
// GESTÃO DE BANCAS (COM WHATSAPP, INSTAGRAM E LOCALIZAÇÃO)
// -----------------------------------------------------
function carregarBancasAdmin() {
    const container = document.getElementById("lista-bancas-admin");
    if (!container) return;

    fetch(`${API_URL}/bancas`)
        .then(res => res.json())
        .then(bancas => {
            container.innerHTML = "";
            if (bancas.length === 0) {
                container.innerHTML = `<p class="carregando-texto">Nenhuma banca cadastrada.</p>`;
                return;
            }

            bancas.forEach(banca => {
                const card = document.createElement("div");
                card.className = "card-depoimento-publico";
                card.style.marginBottom = "15px";

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div>
                            <h3 style="font-family: 'Cinzel', serif; color: var(--azul-principal);">${banca.nome}</h3>
                            <p style="font-size: 0.9rem; color: var(--cinza);">URL: /pages/banca.html?slug=${banca.slug}</p>
                            <p style="font-size: 0.9rem; color: var(--dourado-escuro);">Chave: <code>${banca.chave_acesso}</code></p>
                            <p style="font-size: 0.85rem; color: var(--cinza);">📞 WhatsApp: ${banca.whatsapp || 'Não informado'} | 📸 Insta: ${banca.instagram ? 'Sim' : 'Não'}</p>
                        </div>
                        <button class="btn-mago-base btn-tipo-1" onclick="excluirBanca(${banca.id})" style="padding: 6px 14px; font-size: 0.85rem; min-height: 35px;">Excluir</button>
                    </div>
                `;
                container.appendChild(card);
            });
        });
}

function configurarFormularioBanca() {
    const form = document.getElementById("form-criar-banca");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("nome", document.getElementById("banca-nome").value);
        formData.append("slug", document.getElementById("banca-slug").value);
        formData.append("slogan", document.getElementById("banca-slogan").value);

        const logoInput = document.getElementById("banca-logo");
        if (logoInput.files[0]) formData.append("imagens", logoInput.files[0]);

        fetch(`${API_URL}/bancas`, { method: "POST", body: formData })
            .then(res => res.json())
            .then(resultado => {
                alert(`Banca criada com sucesso! Chave gerada para o lojista: ${resultado.banca.chave_acesso}`);
                form.reset();
                carregarBancasAdmin();
            })
            .catch(err => {
                console.error("Erro:", err);
                alert("Erro ao criar a banca.");
            });
    });
}

window.excluirBanca = function(id) {
    if (!confirm("Tem certeza que deseja apagar esta banca?")) return;
    fetch(`${API_URL}/bancas/${id}`, { method: "DELETE" })
        .then(() => {
            alert("Banca excluída!");
            carregarBancasAdmin();
        });
}
// Variável global para armazenar temporariamente a chave do lojista logado
let chaveLojistaAtual = "";

function verificarChaveLojista(chave) {
    fetch(`${API_URL}/bancas`)
        .then(res => res.json())
        .then(bancas => {
            const bancaEncontrada = bancas.find(b => b.chave_acesso === chave);

            if (bancaEncontrada) {
                chaveLojistaAtual = chave;
                document.getElementById("bloco-lojista-parceiro").style.display = "block";
                document.getElementById("titulo-painel-lojista").textContent = `Gestão da Banca: ${bancaEncontrada.nome}`;

                // Preenche o formulário do lojista com os dados atuais da banca dele
                document.getElementById("lojista-nome").value = bancaEncontrada.nome || "";
                document.getElementById("lojista-slogan").value = bancaEncontrada.slogan || "";
                document.getElementById("lojista-descricao").value = bancaEncontrada.descricao || "";
                document.getElementById("lojista-whatsapp").value = bancaEncontrada.whatsapp || "";
                document.getElementById("lojista-instagram").value = bancaEncontrada.instagram || "";
                document.getElementById("lojista-localizacao").value = bancaEncontrada.localizacao || "";

                configurarFormularioLojista();
            } else {
                alert("Credencial inválida! Verifique sua senha de administrador ou chave de acesso.");
                window.location.reload();
            }
        })
        .catch(err => {
            console.error("Erro ao validar chave:", err);
            alert("Erro de conexão com o reino.");
            window.location.reload();
        });
}

function configurarFormularioLojista() {
    const form = document.getElementById("form-editar-banca-lojista");
    if (!form) return;

    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("nome", document.getElementById("lojista-nome").value);
        formData.append("slogan", document.getElementById("lojista-slogan").value);
        formData.append("descricao", document.getElementById("lojista-descricao").value);
        formData.append("whatsapp", document.getElementById("lojista-whatsapp").value);
        formData.append("instagram", document.getElementById("lojista-instagram").value);
        formData.append("localizacao", document.getElementById("lojista-localizacao").value);

        const logoInput = document.getElementById("lojista-logo");
        if (logoInput.files[0]) {
            formData.append("imagens", logoInput.files[0]);
        }

        fetch(`${API_URL}/bancas/chave/${chaveLojistaAtual}`, {
            method: "PUT",
            body: formData
        })
        .then(res => res.json())
        .then(resultado => {
            alert("Informações da banca atualizadas com sucesso!");
            document.getElementById("titulo-painel-lojista").textContent = `Gestão da Banca: ${resultado.banca.nome}`;
        })
        .catch(err => {
            console.error("Erro:", err);
            alert("Erro ao atualizar os dados da banca.");
        });
    };
}
// -----------------------------------------------------
// GESTÃO DE EVENTOS / FEIRAS
// -----------------------------------------------------
function carregarEventosAdmin() {
    const container = document.getElementById("lista-eventos-admin");
    if (!container) return;

    fetch(`${API_URL}/eventos`)
        .then(res => res.json())
        .then(eventos => {
            container.innerHTML = "";
            if (eventos.length === 0) {
                container.innerHTML = `<p class="carregando-texto">Nenhum evento cadastrado.</p>`;
                return;
            }

            eventos.forEach(ev => {
                const card = document.createElement("div");
                card.className = "card-depoimento-publico";
                card.style.marginBottom = "15px";

                const datasTexto = Array.isArray(ev.datas) ? ev.datas.join(', ') : '';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div>
                            <h3 style="font-family: 'Cinzel', serif; color: var(--azul-principal);">${ev.nome}</h3>
                            <p style="font-size: 0.9rem; color: var(--cinza);">📅 ${datasTexto} | 📍 ${ev.local}</p>
                        </div>
                        <button class="btn-mago-base btn-tipo-1" onclick="excluirEvento(${ev.id})" style="padding: 6px 14px; font-size: 0.85rem; min-height: 35px;">Excluir</button>
                    </div>
                `;
                container.appendChild(card);
            });
        });
}

function configurarFormularioEvento() {
    const form = document.getElementById("form-evento");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("nome", document.getElementById("evento-nome").value);
        formData.append("descricao", document.getElementById("evento-desc").value);
        formData.append("datas", document.getElementById("evento-datas").value);
        formData.append("local", document.getElementById("evento-local").value);
        formData.append("horario", document.getElementById("evento-horario").value);

        const imgInput = document.getElementById("evento-imagem");
        if (imgInput.files[0]) formData.append("imagem", imgInput.files[0]);

        fetch(`${API_URL}/eventos`, { method: "POST", body: formData })
            .then(res => res.json())
            .then(() => {
                alert("Evento cadastrado com sucesso!");
                form.reset();
                carregarEventosAdmin();
            });
    });
}

window.excluirEvento = function(id) {
    if (!confirm("Tem certeza que deseja apagar este evento?")) return;
    fetch(`${API_URL}/eventos/${id}`, { method: "DELETE" })
        .then(() => {
            alert("Evento excluído!");
            carregarEventosAdmin();
        });
}

// -----------------------------------------------------
// MODERAÇÃO DE DEPOIMENTOS (EXIBINDO FOTO DE PERFIL / INICIAL)
// -----------------------------------------------------
function carregarDepoimentosAdmin() {
    const container = document.getElementById("lista-depoimentos-admin");
    if (!container) return;

    fetch(`${API_URL}/admin/depoimentos`)
        .then(res => res.json())
        .then(deps => {
            container.innerHTML = "";
            if (deps.length === 0) {
                container.innerHTML = `<p class="carregando-texto">Nenhum depoimento para moderar.</p>`;
                return;
            }

            deps.forEach(dep => {
                const inicialNome = dep.nome ? dep.nome.charAt(0).toUpperCase() : '🧙‍♂️';
                const fotoPerfilHtml = dep.foto_path ? `
                    <div class="depoimento-avatar-wrapper" style="width: 50px; height: 50px;">
                        <img src="${dep.foto_path}" alt="Foto" class="depoimento-avatar-img">
                    </div>
                ` : `
                    <div class="depoimento-avatar-wrapper depoimento-avatar-inicial" style="width: 50px; height: 50px;">
                        <span style="font-size: 1.1rem;">${inicialNome}</span>
                    </div>
                `;

                const card = document.createElement("div");
                card.className = "card-depoimento-publico";
                card.style.marginBottom = "15px";

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div style="display: flex; gap: 15px; align-items: center;">
                            ${fotoPerfilHtml}
                            <div>
                                <strong style="color: var(--azul-principal);">${dep.nome}</strong> (${dep.cidade}) - ${dep.estrelas} ⭐
                                <p style="font-size: 0.9rem; color: var(--cinza); margin: 4px 0;">"${dep.mensagem}"</p>
                                <small>Status: ${dep.aprovado ? '✅ Aprovado' : '⏳ Pendente'}</small>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${!dep.aprovado ? `<button class="btn-mago-base btn-tipo-1" onclick="aprovarDepoimento(${dep.id})" style="padding: 6px 12px; font-size: 0.8rem; min-height: 32px;">Aprovar</button>` : ''}
                            <button class="btn-mago-base btn-tipo-2" onclick="excluirDepoimento(${dep.id})" style="padding: 6px 12px; font-size: 0.8rem; min-height: 32px;">Excluir</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        });
}

window.aprovarDepoimento = function(id) {
    fetch(`${API_URL}/depoimentos/${id}/aprovar`, { method: "PUT" })
        .then(() => {
            alert("Depoimento aprovado e publicado!");
            carregarDepoimentosAdmin();
        });
}

window.excluirDepoimento = function(id) {
    if (!confirm("Tem certeza que deseja excluir este depoimento?")) return;
    fetch(`${API_URL}/depoimentos/${id}`, { method: "DELETE" })
        .then(() => {
            alert("Depoimento excluído!");
            carregarDepoimentosAdmin();
        });
}