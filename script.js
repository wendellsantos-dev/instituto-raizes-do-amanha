// ==============================================================================
// 1. DADOS DE ORIGEM E SISTEMA DE TEMPLATES
// ==============================================================================

const dadosImpacto = [
    { quantidade: '1.250', descricao: 'Árvores Plantadas' },
    { quantidade: '18', descricao: 'Espaços Urbanos Revitalizados' },
    { quantidade: '32', descricao: 'Ações de Educação Ambiental' },
    { quantidade: '740', descricao: 'Voluntários Envolvidos' }
];

function renderizarCardImpacto(item) {
    return `
        <div class="card-indicador">
            <span class="numero-impacto">${item.quantidade}</span>
            <p class="legenda-impacto">${item.descricao}</p>
        </div>
    `;
}

// ==============================================================================
// 2. DICIONÁRIO DE ROTAS DA SINGLE PAGE APPLICATION (SPA)
// ==============================================================================

const rotas = {
    '#home': `
        <section class="secao" id="quem-somos">
            <h2>Quem somos</h2>
            <p>O Instituto Raízes do Amanhã é uma organização sem fins lucrativos dedicada à transformação de espaços urbanos por meio do reflorestamento, da educação ambiental e da mobilização comunitária. Atuamos em parceria com moradores, escolas e empresas para tornar as cidades mais verdes, conscientes e acolhedoras.</p>
            <div class="card-imagem">
                <img src="imagens/quem_somos.jpg" alt="Ação de reflorestamento urbano realizada pelo instituto">
            </div>
        </section>

        <section class="secao" id="missao">
            <h2>Nossa missão</h2>
            <p>Promover o reflorestamento urbano e despertar a consciência ambiental por meio de ações educativas e participativas, aproximando comunidades da natureza e contribuindo para cidades mais saudáveis e sustentáveis.</p>
            <div class="card-imagem">
                <img src="imagens/nossa_missao.jpg" alt="Comunidade participando de ação de educação ambiental">
            </div>
        </section>

        <section class="secao" id="impacto">
            <h2>Nosso impacto</h2>
            <p>Confira os números das nossas conquistas geradas pela força da comunidade e de nossos voluntários:</p>
            
            <div id="grid-indicadores" class="grid-indicadores">
                ${dadosImpacto.map(renderizarCardImpacto).join('')}
            </div>

            <div class="bloco-conteudo" style="margin-top: 30px;">
                <p>A transformação de uma cidade começa com pequenas atitudes e cresce quando pessoas se unem por uma causa. Você pode contribuir com o Instituto Raízes do Amanhã como voluntário, apoiador ou parceiro. Conheça nossos projetos e descubra como participar das próximas ações.</p>
                <div class="card-imagem">
                    <img src="imagens/faca_parte.jpg" alt="Pessoas participando de uma ação ambiental comunitária">
                </div>
            </div>
        </section>
    `,
    '#cadastro': `
        <div class="form-container">
            <form id="formulario-cadastro" class="formulario-cadastro">
                <fieldset>
                    <legend><h2>Cadastro de Voluntários</h2></legend>
                    
                    <div class="campo">
                        <label for="nome">Nome Completo:</label>
                        <input type="text" name="nome" id="nome" placeholder="Digite seu nome completo" required>
                    </div>  

                    <div class="campo">
                        <label for="cpf">CPF:</label>
                        <input type="text" name="cpf" id="cpf" pattern="[0-9]{11}" maxlength="11" placeholder="Somente 11 números" required>
                    </div>

                    <div class="campo">
                        <label for="nascimento">Data de Nascimento:</label>
                        <input type="date" name="nascimento" id="nascimento" required>
                    </div>

                    <div class="campo campo-cep">
                        <label for="cep">CEP:</label>
                        <div class="campo-cep-grupo">
                            <input type="text" name="cep" id="cep" maxlength="9" placeholder="00000-000" required>
                            <button type="button" id="btn-buscar-cep" class="botao-cep">Buscar CEP</button>
                        </div>
                    </div>

                    <div class="campo">
                        <label for="email">E-mail:</label>
                        <input type="email" name="email" id="email" placeholder="seuemail@dominio.com" required>
                    </div>

                    <div class="campo">
                        <label for="tel">Telefone:</label>
                        <input type="tel" name="tel" id="tel" pattern="[0-9]{11}" maxlength="11" placeholder="Somente 11 números com DDD" required>
                    </div>

                    <button id="botaocadastro" type="submit" class="botao-enviar">Cadastrar</button>
                    <p id="boasvindas" class="mt-3"></p>
                </fieldset>
            </form>
        </div>
    `
};

rotas['#quem-somos'] = rotas['#home'];
rotas['#missao'] = rotas['#home'];
rotas['#impacto'] = rotas['#home'];

// ==============================================================================
// 3. INTEGRACÃO COM SERVIÇO EXTERNO (API ViaCEP) E PERSISTÊNCIA
// ==============================================================================

function consultarCep() {
    const campoCep = document.getElementById('cep');
    const boasvindas = document.getElementById('boasvindas');

    if (!campoCep || !campoCep.value) {
        boasvindas.textContent = 'Por favor, informe um CEP válido.';
        boasvindas.className = 'text-danger fw-bold';
        return;
    }

    const cepLimpo = campoCep.value.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
        boasvindas.textContent = 'CEP inválido! O CEP deve conter 8 dígitos.';
        boasvindas.className = 'text-danger fw-bold';
        return;
    }

    boasvindas.textContent = 'Buscando endereço...';
    boasvindas.className = 'text-info fw-bold';

    fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        .then(resposta => resposta.json())
        .then(dados => {
            if (dados.erro) {
                boasvindas.textContent = 'CEP não encontrado!';
                boasvindas.className = 'text-danger fw-bold';
            } else {
                boasvindas.textContent = `Endereço localizado: ${dados.logradouro}, ${dados.bairro} - ${dados.localidade}/${dados.uf}`;
                boasvindas.className = 'mensagem-sucesso';
            }
        })
        .catch(() => {
            boasvindas.textContent = 'Erro ao consultar o CEP. Verifique sua conexão.';
            boasvindas.className = 'text-danger fw-bold';
        });
}

function restaurarSessaoLocal() {
    try {
        const boasvindas = document.getElementById('boasvindas');
        const dadosCrus = localStorage.getItem('ultimoVoluntario');
        
        if (boasvindas && dadosCrus) {
            const ultimoVoluntario = JSON.parse(dadosCrus);
            boasvindas.textContent = `Bem-vindo(a) de volta, ${ultimoVoluntario.nome}! Seu cadastro permanece ativo.`;
            boasvindas.className = 'mensagem-sucesso';
        }
    } catch (erro) {
        // Ignora a restauração silenciosamente se o dado estiver quebrado no navegador
        console.log('Nenhum dado válido salvo anteriormente.');
    }
}

function inicializarFormulario() {
    const botaocadastro = document.getElementById('botaocadastro');
    const btnBuscarCep = document.getElementById('btn-buscar-cep');
    const nomecompleto = document.getElementById('nome');
    const cpf = document.getElementById('cpf');
    const email = document.getElementById('email');
    const tel = document.getElementById('tel');
    const boasvindas = document.getElementById('boasvindas');

    restaurarSessaoLocal();

    if (btnBuscarCep) {
        btnBuscarCep.addEventListener('click', consultarCep);
    }

    if (botaocadastro) {
        botaocadastro.addEventListener('click', function(event) {
            event.preventDefault();

            const valorNome = nomecompleto ? nomecompleto.value.trim() : '';
            const valorCpf = cpf ? cpf.value.trim() : '';
            const valorEmail = email ? email.value.trim() : '';
            const valorTel = tel ? tel.value.trim() : '';

            if (valorNome === '') {
                boasvindas.textContent = 'Por favor, insira seu nome completo!';
                boasvindas.className = '';
                boasvindas.style.color = 'red';
                return;
            }

            if (valorCpf.length !== 11 || isNaN(valorCpf)) {
                boasvindas.textContent = 'CPF inválido! Por favor, insira exatamente 11 números.';
                boasvindas.className = '';
                boasvindas.style.color = 'red';
                return;
            }

            if (valorEmail === '' || !valorEmail.includes('@') || !valorEmail.includes('.')) {
                boasvindas.textContent = 'Por favor, insira um e-mail válido!';
                boasvindas.className = '';
                boasvindas.style.color = 'red';
                return;
            }

            if (valorTel.length !== 11 || isNaN(valorTel)) {
                boasvindas.textContent = 'Telefone inválido! Digite o DDD + número (11 dígitos).';
                boasvindas.className = '';
                boasvindas.style.color = 'red';
                return;
            }

            const primeiroNome = valorNome.split(' ')[0];
            const dadosVoluntario = {
                nome: primeiroNome,
                nomeCompleto: valorNome,
                cpf: valorCpf,
                email: valorEmail,
                dataCadastro: new Date().toLocaleDateString('pt-BR')
            };

            // Proteção Try/Catch para gravação de memória
            try {
                localStorage.setItem('ultimoVoluntario', JSON.stringify(dadosVoluntario));
                let listaVoluntarios = JSON.parse(localStorage.getItem('listaVoluntarios')) || [];
                listaVoluntarios.push(dadosVoluntario);
                localStorage.setItem('listaVoluntarios', JSON.stringify(listaVoluntarios));
            } catch (e) {
                console.log('Não foi possível salvar os dados na memória.', e);
            }

            boasvindas.textContent = `Olá, ${primeiroNome}! Seu cadastro foi salvo com sucesso no sistema.`;
            boasvindas.className = 'mensagem-sucesso';
            boasvindas.style.color = '';
        });
    }
}

// Roteador SPA
function navegar() {
    const hashAtual = window.location.hash || '#home';
    const containerMain = document.getElementById('conteudo-principal');

    if (containerMain && rotas[hashAtual]) {
        containerMain.innerHTML = rotas[hashAtual];

        if (hashAtual === '#cadastro') {
            inicializarFormulario();
        }

        if (['#quem-somos', '#missao', '#impacto'].includes(hashAtual)) {
            // Pequeno atraso para garantir que a rolagem aconteça APÓS injetar a tela na página
            setTimeout(() => {
                const elementoAlvo = document.querySelector(hashAtual);
                if (elementoAlvo) {
                    elementoAlvo.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }
}

// Escutadores globais de gatilho
window.addEventListener('hashchange', navegar);
window.addEventListener('DOMContentLoaded', navegar);

// 🔥 Solução Definitiva: Dispara a navegação imediatamente por precaução e garante a criação das páginas
navegar();