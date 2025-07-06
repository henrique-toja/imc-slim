/**
 * Ponto de entrada da aplicação. Aguarda o carregamento completo do DOM
 * para então buscar o container principal e inicializar a ferramenta.
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app-container');
    if (container) {
        inicializarFerramenta(container);
    } else {
        console.error("O container da aplicação com ID 'app-container' não foi encontrado.");
    }
});

// ===================================================================================
// 🟣 1. FUNÇÕES DE INSTALAÇÃO DO PWA (Progressive Web App)
// ===================================================================================

let deferredPrompt;

/**
 * Captura o evento para instalar o PWA e exibe um botão de instalação customizado.
 */
window.addEventListener('beforeinstallprompt', (e) => {
    // Previne o mini-infobar padrão do Chrome
    e.preventDefault();
    // Guarda o evento para ser disparado mais tarde
    deferredPrompt = e;
    // Exibe o nosso botão de instalação customizado
    exibirBotaoInstalarPWA();
});

/**
 * Lida com o evento de PWA instalado, removendo o botão de instalação.
 */
window.addEventListener('appinstalled', () => {
    console.log('PWA instalado com sucesso!');
    const installBtn = document.getElementById('btnInstallPWA');
    if (installBtn) installBtn.remove();
});

/**
 * Cria e exibe um botão para que o usuário possa instalar o PWA.
 */
function exibirBotaoInstalarPWA() {
    if (document.getElementById('btnInstallPWA')) return;

    const installBtn = document.createElement('button');
    installBtn.id = 'btnInstallPWA';
    installBtn.textContent = 'Instalar Aplicativo';
    // Estilização do botão (pode ser substituída por classes de CSS)
    Object.assign(installBtn.style, {
        position: 'fixed', bottom: '20px', right: '20px',
        padding: '10px 20px', fontWeight: 'bold', zIndex: '1000',
        backgroundColor: '#a855f7', color: 'white', border: 'none',
        borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
    });

    document.body.appendChild(installBtn);

    installBtn.addEventListener('click', async () => {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Resultado da escolha do usuário: ${outcome}`);
        deferredPrompt = null;
    });
}


// ===================================================================================
// 🟠 2. FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO DA FERRAMENTA
// ===================================================================================

/**
 * Função central que constrói o HTML da ferramenta e coordena a inicialização
 * de todas as outras funcionalidades (formulário, botões, parsers, etc.).
 * @param {HTMLElement} container - O elemento DOM onde a ferramenta será renderizada.
 */
function inicializarFerramenta(container) {

    // --- Estrutura HTML da Ferramenta ---
    container.innerHTML = `
      <div class="bg-gray-800/50 backdrop-blur-sm border border-purple-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl shadow-purple-900/40 text-white max-w-md mx-auto animate-fade-in">
        <h2 class="text-3xl font-bold text-center mb-6 text-fuchsia-400 drop-shadow-lg">Calculadora de IMC</h2>

        <textarea id="inputDadosCliente" placeholder="Cole aqui os dados da cliente (Ex: Tenho 25 anos, 1.65m e 70kg)" class="w-full p-3 rounded-lg mb-2 bg-gray-900/70 border border-gray-600 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors placeholder-gray-400"></textarea>
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button id="btnColar" class="bg-fuchsia-500 hover:bg-fuchsia-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">Colar Dados</button>
          <button id="btnPreencherAutomatico" class="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">Auto-Preencher</button>
        </div>

        <form id="formIMC" class="flex flex-col gap-4">
          <div>
            <label for="idadeInput" class="block text-sm font-medium text-gray-300 mb-1">Idade (anos)</label>
            <input id="idadeInput" name="idade" type="number" min="1" max="120" placeholder="Ex: 25" required class="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-600 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors"/>
          </div>
          <div>
            <label for="alturaInput" class="block text-sm font-medium text-gray-300 mb-1">Altura (m)</label>
            <input id="alturaInput" name="altura" type="number" step="0.01" min="0.5" max="2.5" placeholder="Ex: 1.65" required class="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-600 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors"/>
          </div>
          <div>
            <label for="pesoInput" class="block text-sm font-medium text-gray-300 mb-1">Peso (kg)</label>
            <input id="pesoInput" name="peso" type="number" step="0.1" min="2" max="500" placeholder="Ex: 70.5" required class="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-600 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors"/>
          </div>
          <button type="submit" class="bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white py-3 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-2">Calcular IMC</button>
        </form>

        <div id="resultadoContainer" class="mt-6"></div>
        <div class="flex flex-col gap-3 mt-4">
            <button id="btnCopiarSumario" class="hidden bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300">Copiar Resultado Completo</button>
            <button id="btnGerarMensagens" class="hidden bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300">Gerar Mensagens para Cliente</button>
        </div>
        <div id="mensagensContainer" class="mt-4"></div>
      </div>`;

    // --- Variáveis de Estado e Elementos DOM ---
    let ultimoResultado = null;

    const form = container.querySelector('#formIMC');
    const resultadoContainer = container.querySelector('#resultadoContainer');
    const mensagensContainer = container.querySelector('#mensagensContainer');
    const btnCopiarSumario = container.querySelector('#btnCopiarSumario');
    const btnGerarMensagens = container.querySelector('#btnGerarMensagens');
    const btnColar = container.querySelector('#btnColar');
    const btnPreencherAutomatico = container.querySelector('#btnPreencherAutomatico');
    const inputDadosCliente = container.querySelector('#inputDadosCliente');
    
    // --- Banco de Mensagens ---
    const mensagensIMC = {
        'Abaixo do Peso': ["Olha, seu IMC indica que você precisa ganhar peso, mas eu trabalho com emagrecedores.\n\nO ideal é buscar uma avaliação nutricional. Ganhar massa magra de forma saudável pode ser o melhor caminho pra você.", "Se quiser, posso te mostrar suplementos para ganhar peso de forma saudável.\n\nVocê tem interesse?"],
        'Peso Normal': ["Olha, seu IMC indica que você não precisa tomar emagrecedor, mas cada caso é um caso.\n\nÀs vezes, mesmo no peso normal, você pode ter gordura localizada. Se quiser, posso te indicar um produto mais leve para ajudar com isso, mas talvez nem precise.\n\nO que você acha?"],
        'Sobrepeso': ["Olha preciso te dizer que seu IMC indica que você está quase desenvolvendo obesidade grau 1 e que sua situação tá ficando grave 🙁\n\nVocê precisa com urgência mudar seus hábitos físicos e alimentares 💪", "Tomar emagrecedor é muito útil e pode ser o pontapé inicial pra você começar a emagrecer e se motivar 💊🔥\n\nMas me diz uma coisa: sua rotina é muito parada ou você se movimenta bastante durante a maior parte do tempo?"],
        'Obesidade Grau I': ["Olha preciso te dizer que seu IMC indica que sua situação é grave 🙁\n\nVocê precisa com urgência mudar seus hábitos físicos e alimentares 💪", "Tomar emagrecedor é muito útil e pode ser o pontapé inicial pra você começar a emagrecer e se motivar 💊🔥\n\nMas me diz uma coisa: sua rotina é muito parada ou você se movimenta bastante durante a maior parte do tempo?"],
        'Obesidade Grau II': ["Olha preciso te dizer que seu IMC indica que sua situação é grave 🙁\n\nVocê precisa com urgência mudar seus hábitos físicos e alimentares 💪", "Tomar emagrecedor é muito útil e pode ser o pontapé inicial pra você começar a emagrecer e se motivar 💊🔥\n\nMas me diz uma coisa: sua rotina é muito parada ou você se movimenta bastante durante a maior parte do tempo?"],
        'Obesidade Grau III': ["Olha preciso te dizer que seu IMC indica que sua situação é grave 🙁\n\nVocê precisa com urgência mudar seus hábitos físicos e alimentares 💪", "Tomar emagrecedor é muito útil e pode ser o pontapé inicial pra você começar a emagrecer e se motivar 💊🔥\n\nMas me diz uma coisa: sua rotina é muito parada ou você se movimenta bastante durante a maior parte do tempo?"]
    };

    // --- Execução e Vinculação das Funções ---
    configurarEnvioFormulario();
    configurarGeradorMensagens();
    configurarAcoesClipboard();
    configurarAutoPreenchimento();


    // ===================================================================================
    // 🟡 3. FUNÇÕES DO PARSER (ANALISADOR DE DADOS)
    // ===================================================================================

    /**
     * Analisa um texto livre para extrair dados de idade, peso e altura.
     * @param {string} textoBruto - O texto a ser analisado.
     * @returns {{idade: number|null, altura: number|null, peso: number|null}}
     */
    function analisarDadosCliente(textoBruto) {
        let texto = textoBruto.toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ').trim();
        let dados = { idade: null, altura: null, peso: null };

        const configBusca = {
            peso: { keywords: ['kg', 'kgs', 'quilo', 'quilos', 'kilos', 'pesando'], regex: /(\d{2,3}\.?\d*)\s*({keywords})/ },
            alturaM: { keywords: ['m', 'metros', 'mt', 'mts'], regex: /([0-2]\.\d{1,2})\s*({keywords})/ },
            alturaCm: { keywords: ['cm', 'centimetros'], regex: /(1[3-9]\d|2[0-2]\d)\s*({keywords})/ },
            idade: { keywords: ['anos', 'idade'], regex: /(\d{1,3})\s*({keywords})/ },
        };

        /**
         * Função auxiliar para extrair um tipo de dado específico do texto.
         * @param {string} tipo - A chave do dado em `configBusca` (ex: 'peso').
         * @param {Function} parser - Função para converter o valor string (parseFloat, parseInt).
         * @param {Function} setter - Função para atribuir o valor ao objeto `dados`.
         */
        function extrairDado(tipo, parser, setter) {
            const config = configBusca[tipo];
            const re = new RegExp(config.regex.source.replace('{keywords}', config.keywords.join('|')), 'g');
            texto = texto.replace(re, (match, valor) => {
                if (dados[tipo.replace(/M|Cm/, '').toLowerCase()] === null) {
                    setter(parser(valor));
                }
                return ''; // Remove o trecho encontrado para evitar re-análise
            });
        }
        
        // Extração baseada em palavras-chave
        extrairDado('peso', parseFloat, (val) => dados.peso = val);
        extrairDado('alturaM', parseFloat, (val) => dados.altura = val);
        if (dados.altura === null) {
            extrairDado('alturaCm', parseFloat, (val) => dados.altura = val / 100);
        }
        extrairDado('idade', parseInt, (val) => dados.idade = val);

        // Tentativa de inferir valores numéricos restantes
        const valoresRestantes = (texto.match(/\d+\.?\d*/g) || []).map(parseFloat).filter(v => !isNaN(v));
        for (const valor of valoresRestantes) {
            if (dados.altura === null) {
                if (valor >= 135 && valor <= 230 && Number.isInteger(valor)) { dados.altura = valor / 100; continue; }
                if (valor >= 1.35 && valor <= 2.30) { dados.altura = valor; continue; }
            }
            if (dados.peso === null && valor >= 35 && valor < 400) { dados.peso = valor; continue; }
            if (dados.idade === null && valor >= 1 && valor <= 120 && Number.isInteger(valor)) { dados.idade = valor; continue; }
        }
        
        return dados;
    }


    // ===================================================================================
    // 🔵 4. FUNÇÃO DE CÁLCULO DO IMC
    // ===================================================================================
    
    /**
     * Calcula o IMC e retorna o valor, a classificação e uma conclusão.
     * @param {number} peso - Peso em quilogramas (kg).
     * @param {number} altura - Altura em metros (m).
     * @returns {{imc: string, classificacao: string, faixa: string, conclusao: string}}
     */
    function calcularIMC(peso, altura) {
        const imc = peso / (altura * altura);
        let classificacao = '', faixa = '', conclusao = '';

        if (imc < 18.5) {
            classificacao = 'Abaixo do Peso';
            faixa = 'Abaixo de 18.5';
            conclusao = 'Seu IMC está abaixo da faixa de peso ideal. É importante buscar orientação para garantir que você está recebendo todos os nutrientes necessários para sua saúde.';
        } else if (imc < 25) {
            classificacao = 'Peso Normal';
            faixa = 'entre 18.5 e 24.9';
            conclusao = 'Parabéns! Seu IMC está na faixa considerada ideal pela OMS. Manter hábitos saudáveis de alimentação e exercícios é a chave para continuar assim.';
        } else if (imc < 30) {
            classificacao = 'Sobrepeso';
            faixa = 'entre 25.0 e 29.9';
            conclusao = 'Seu IMC indica sobrepeso. Este é um sinal de alerta para um maior risco de desenvolver problemas de saúde. Pequenas mudanças no estilo de vida podem fazer uma grande diferença.';
        } else if (imc < 35) {
            classificacao = 'Obesidade Grau I';
            faixa = 'entre 30.0 e 34.9';
            conclusao = 'Seu IMC está na faixa de Obesidade Grau I. Isso aumenta o risco de doenças como diabetes e hipertensão. É um bom momento para buscar apoio e iniciar mudanças.';
        } else if (imc < 40) {
            classificacao = 'Obesidade Grau II';
            faixa = 'entre 35.0 e 39.9';
            conclusao = 'Seu IMC indica Obesidade Grau II (severa). O risco para a saúde é considerado alto. É altamente recomendável procurar orientação médica e nutricional para um plano de ação.';
        } else {
            classificacao = 'Obesidade Grau III';
            faixa = 'Acima de 40.0';
            conclusao = 'Seu IMC está na faixa de Obesidade Grau III (mórbida). Esta condição apresenta um risco muito elevado para a saúde. É crucial e urgente buscar ajuda médica especializada.';
        }

        return { imc: imc.toFixed(2), classificacao, faixa, conclusao };
    }


    // ===================================================================================
    // 🟢 5. FUNÇÕES DO FORMULÁRIO
    // ===================================================================================
    
    /**
     * Configura o listener para o evento de submit do formulário de IMC.
     */
    function configurarEnvioFormulario() {
        form.addEventListener('submit', event => {
            event.preventDefault();

            // Limpa resultados anteriores
            resultadoContainer.innerHTML = '';
            mensagensContainer.innerHTML = '';
            btnCopiarSumario.classList.add('hidden');
            btnGerarMensagens.classList.add('hidden');

            const formData = new FormData(form);
            const idade = parseInt(formData.get('idade'));
            const altura = parseFloat(formData.get('altura'));
            const peso = parseFloat(formData.get('peso'));

            if (!idade || !altura || !peso || idade <= 0 || altura <= 0 || peso <= 0) {
                resultadoContainer.innerHTML = `<p class="text-red-400 text-center">Por favor, preencha todos os campos com valores válidos.</p>`;
                return;
            }

            ultimoResultado = calcularIMC(peso, altura);

            const sumarioTexto = `
📌 Resultado do seu IMC (Índice de Massa Corporal)
✅ Idade: ${idade} anos
✅ Altura: ${altura.toFixed(2)} m
✅ Peso: ${peso.toFixed(1)} kg
📐 Cálculo:
IMC = ${peso.toFixed(1)} ÷ (${altura.toFixed(2)} × ${altura.toFixed(2)}) ≈ ${ultimoResultado.imc}
🔍 Classificação segundo a OMS:
"${ultimoResultado.classificacao}" (IMC ${ultimoResultado.faixa})
✅ Conclusão:
${ultimoResultado.conclusao}
`;
            resultadoContainer.innerHTML = `<div id="resultadoSumario" class="p-4 border border-purple-700 rounded-lg bg-gray-900/50" style="white-space: pre-wrap;">${sumarioTexto.trim()}</div>`;
            
            // Exibe os botões de ação pós-cálculo
            btnCopiarSumario.classList.remove('hidden');
            btnGerarMensagens.classList.remove('hidden');
        });
    }

    
    // ===================================================================================
    // 🟤 6. FUNÇÃO DE GERAÇÃO DE MENSAGENS PÓS-CÁLCULO
    // ===================================================================================
    
    /**
     * Configura o listener para o botão que gera mensagens personalizadas para o cliente.
     */
    function configurarGeradorMensagens() {
        btnGerarMensagens.addEventListener('click', () => {
            if (!ultimoResultado) return;

            const { classificacao, imc } = ultimoResultado;
            const mensagensDaFaixa = mensagensIMC[classificacao] || [];

            const titulo = `<h3 class="text-xl font-bold mb-4 text-center text-fuchsia-300 border-b-2 border-fuchsia-500/30 pb-2">Fluxo para: ${classificacao} (IMC: ${imc})</h3>`;
            mensagensContainer.innerHTML = titulo;

            mensagensDaFaixa.forEach((msg) => {
                const messageBox = document.createElement('div');
                messageBox.className = 'message-box mb-3 p-3 bg-gray-900 rounded-lg border border-purple-700 flex justify-between items-center animate-fade-in';
                messageBox.innerHTML = `
                    <div class="msg-text text-white flex-grow pr-3" style="white-space: pre-wrap;">${msg}</div>
                    <button class="copy-btn bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-1 px-3 rounded font-semibold transition-colors" data-text="${msg.replace(/"/g, '&quot;')}">Copiar</button>
                `;
                mensagensContainer.appendChild(messageBox);
            });

            btnGerarMensagens.classList.add('hidden'); // Oculta o botão após gerar
        });
    }

    
    // ===================================================================================
    // ⚫ 7. FUNÇÕES DE INTERAÇÃO COM CLIPBOARD (COPIAR/COLAR)
    // ===================================================================================
    
    /**
     * Centraliza a configuração de todos os listeners relacionados à área de transferência.
     */
    function configurarAcoesClipboard() {
        
        // --- Listener para Copiar o Sumário Completo ---
        btnCopiarSumario.addEventListener('click', () => {
            const sumarioElement = container.querySelector('#resultadoSumario');
            if (!sumarioElement) return;

            navigator.clipboard.writeText(sumarioElement.innerText).then(() => {
                const originalText = btnCopiarSumario.textContent;
                btnCopiarSumario.textContent = 'Resultado Copiado!';
                btnCopiarSumario.classList.add('bg-green-500');
                setTimeout(() => {
                    btnCopiarSumario.textContent = originalText;
                    btnCopiarSumario.classList.remove('bg-green-500');
                }, 2000);
            }).catch(err => {
                alert('Falha ao copiar o resultado.');
                console.error('Erro ao copiar sumário:', err);
            });
        });

        // --- Listener para Copiar Mensagens Individuais (delegação de evento) ---
        mensagensContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.copy-btn');
            if (button) {
                const textoParaCopiar = button.dataset.text;
                navigator.clipboard.writeText(textoParaCopiar).then(() => {
                    button.textContent = 'Copiado!';
                    button.classList.add('copied'); // Adiciona classe para estilização (ex: bg-green-500)
                    setTimeout(() => {
                        button.textContent = 'Copiar';
                        button.classList.remove('copied');
                    }, 1500);
                });
            }
        });
        
        // --- Listener para Colar Dados no Textarea ---
        btnColar.addEventListener('click', async () => {
            try {
                const texto = await navigator.clipboard.readText();
                inputDadosCliente.value = texto;
                // Dispara o auto-preenchimento em seguida para conveniência
                btnPreencherAutomatico.click(); 
            } catch (err) {
                alert('Não foi possível ler da área de transferência. Verifique as permissões do navegador.');
                console.error('Erro ao colar:', err);
            }
        });
    }


    // ===================================================================================
    // ⚪ 8. BOTÃO DE AUTO-PREENCHIMENTO COM PARSER
    // ===================================================================================

    /**
     * Configura o listener para o botão que usa o parser para preencher o formulário.
     */
    function configurarAutoPreenchimento() {
        btnPreencherAutomatico.addEventListener('click', () => {
            const textoCliente = inputDadosCliente.value;
            if (!textoCliente) {
                alert('Por favor, cole os dados da cliente primeiro no campo acima.');
                return;
            }

            const dadosExtraidos = analisarDadosCliente(textoCliente);

            if (dadosExtraidos.idade) form.idade.value = dadosExtraidos.idade;
            if (dadosExtraidos.altura) form.altura.value = dadosExtraidos.altura.toFixed(2);
            if (dadosExtraidos.peso) form.peso.value = dadosExtraidos.peso.toFixed(1);
        });
    }

} // Fim da função inicializarFerramenta
