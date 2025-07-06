// main.js

import { inicializarFerramenta } from './init.js';
import './pwa.js'; // Importa para executar o código de setup do PWA (side-effect)

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
