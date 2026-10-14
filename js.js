
/* =========================================
   MENU MOBILE - ELYTRA TECH
========================================= */

const menuBtn = document.querySelector('.Color-button-anim');
const navList = document.querySelector('.STYcabecalho ul');

if (menuBtn && navList) {
    menuBtn.setAttribute('aria-expanded', 'false');

    menuBtn.addEventListener('click', () => {
        const menuAberto = navList.classList.toggle('open');

        menuBtn.setAttribute('aria-expanded', String(menuAberto));
        menuBtn.setAttribute(
            'aria-label',
            menuAberto ? 'Fechar menu' : 'Abrir menu'
        );
    });

    document.querySelectorAll('.STYcabecalho ul a').forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.setAttribute('aria-label', 'Abrir menu');
        });
    });
}


/* =========================================
   ACESSIBILIDADE - ELYTRA TECH
========================================= */

const btnAcessibilidade = document.querySelector('#btnAcessibilidade');
const painelAcessibilidade = document.querySelector('#painelAcessibilidade');

const aumentarTexto = document.querySelector('#aumentarTexto');
const diminuirTexto = document.querySelector('#diminuirTexto');
const restaurarAcessibilidade = document.querySelector('#restaurarAcessibilidade');

const alternarContraste = document.querySelector('#alternarContraste');

const btnTemas = document.querySelector('#btnTemas');
const opcoesTemas = document.querySelector('#opcoesTemas');

const tipoDaltonismo = document.querySelector('#tipoDaltonismo');
const destacarLinks = document.querySelector('#destacarLinks');

let escalaTexto = 1;

const elementosTexto = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'button', 'li', 'span',
    'label', 'strong', 'em', 'small',
    'input', 'textarea', 'select'
].join(', ');


/* =========================================
   ABRIR E FECHAR O PAINEL
========================================= */

if (btnAcessibilidade && painelAcessibilidade) {
    btnAcessibilidade.setAttribute('aria-expanded', 'false');

    btnAcessibilidade.addEventListener('click', () => {
        const vaiAbrir = painelAcessibilidade.hidden;

        painelAcessibilidade.hidden = !vaiAbrir;

        btnAcessibilidade.setAttribute(
            'aria-expanded',
            String(vaiAbrir)
        );
    });

    // Fechar com Escape
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') {
            painelAcessibilidade.hidden = true;

            btnAcessibilidade.setAttribute('aria-expanded', 'false');

            if (opcoesTemas && btnTemas) {
                opcoesTemas.hidden = true;
                btnTemas.setAttribute('aria-expanded', 'false');
            }

            btnAcessibilidade.focus();
        }
    });

    // Fechar ao clicar fora
    document.addEventListener('click', evento => {
        if (
            evento.target instanceof Element &&
            !evento.target.closest('.acessibilidade-container') &&
            !painelAcessibilidade.hidden
        ) {
            painelAcessibilidade.hidden = true;

            btnAcessibilidade.setAttribute('aria-expanded', 'false');
        }
    });
}


/* =========================================
   AUMENTAR E DIMINUIR TEXTO
========================================= */

function aplicarEscalaTexto() {
    document.querySelectorAll(elementosTexto).forEach(elemento => {
        // Não modificar os textos do painel de acessibilidade
        if (elemento.closest('.acessibilidade-container')) {
            return;
        }

        // Guardar os tamanhos originais uma única vez
        if (!elemento.dataset.tamanhoOriginal) {
            elemento.dataset.tamanhoOriginal =
                getComputedStyle(elemento).fontSize;

            elemento.dataset.estiloOriginal =
                elemento.style.fontSize;
        }

        const tamanhoOriginal = parseFloat(
            elemento.dataset.tamanhoOriginal
        );

        elemento.style.fontSize =
            `${tamanhoOriginal * escalaTexto}px`;
    });
}


// Aumentar texto
if (aumentarTexto) {
    aumentarTexto.addEventListener('click', () => {
        escalaTexto = Math.min(
            Math.round((escalaTexto + 0.1) * 10) / 10,
            1.5
        );

        aplicarEscalaTexto();
    });
}


// Diminuir texto
if (diminuirTexto) {
    diminuirTexto.addEventListener('click', () => {
        escalaTexto = Math.max(
            Math.round((escalaTexto - 0.1) * 10) / 10,
            0.8
        );

        aplicarEscalaTexto();
    });
}


/* =========================================
   TEMA CLARO E ESCURO
========================================= */

const opcoesTema = document.querySelectorAll(
    'input[name="tema"]'
);


// Abrir e fechar opções de tema
if (btnTemas && opcoesTemas) {
    btnTemas.addEventListener('click', () => {
        const vaiAbrir = opcoesTemas.hidden;

        opcoesTemas.hidden = !vaiAbrir;

        btnTemas.setAttribute(
            'aria-expanded',
            String(vaiAbrir)
        );
    });
}


// Aplicar tema selecionado
opcoesTema.forEach(opcao => {
    opcao.addEventListener('change', () => {
        if (!opcao.checked) return;

        document.body.classList.toggle(
            'tema-claro',
            opcao.value === 'claro'
        );
    });
});


/* =========================================
   ALTO CONTRASTE
========================================= */

if (alternarContraste) {
    alternarContraste.setAttribute('aria-pressed', 'false');

    alternarContraste.addEventListener('click', () => {
        const ativo = document.body.classList.toggle('alto-contraste');

        alternarContraste.setAttribute(
            'aria-pressed',
            String(ativo)
        );
    });
}


/* =========================================
   ADAPTAÇÕES PARA DALTONISMO
========================================= */

const classesDaltonismo = [
    'daltonismo-protanopia',
    'daltonismo-deuteranopia',
    'daltonismo-tritanopia'
];

function aplicarDaltonismo(tipo) {
    // Remover qualquer adaptação anterior
    document.body.classList.remove(...classesDaltonismo);

    // Só adicionar uma classe quando houver seleção
    if (
        ['protanopia', 'deuteranopia', 'tritanopia'].includes(tipo)
    ) {
        document.body.classList.add(`daltonismo-${tipo}`);
    }

    if (tipoDaltonismo) {
        tipoDaltonismo.value = tipo;
    }
}

if (tipoDaltonismo) {
    tipoDaltonismo.addEventListener('change', () => {
        aplicarDaltonismo(tipoDaltonismo.value);
    });

    // Não ativar nenhuma adaptação automaticamente
    aplicarDaltonismo('nenhum');
}


/* =========================================
   DESTACAR LINKS
========================================= */

if (destacarLinks) {
    destacarLinks.addEventListener('change', () => {
        const ativo = destacarLinks.checked;

        document.body.classList.toggle('links-destacados', ativo);

        destacarLinks.setAttribute(
            'aria-pressed',
            String(ativo)
        );
    });
}


/* =========================================
   RESTAURAR CONFIGURAÇÕES PADRÃO
========================================= */

if (restaurarAcessibilidade) {
    restaurarAcessibilidade.addEventListener('click', () => {

        // Restaurar tamanhos do texto
        escalaTexto = 1;

        document.querySelectorAll('[data-tamanho-original]')
            .forEach(elemento => {
                elemento.style.fontSize =
                    elemento.dataset.estiloOriginal || '';

                delete elemento.dataset.tamanhoOriginal;
                delete elemento.dataset.estiloOriginal;
            });

        // Restaurar tema escuro
        document.body.classList.remove('tema-claro');

        const temaEscuro = document.querySelector(
            'input[name="tema"][value="escuro"]'
        );

        if (temaEscuro) {
            temaEscuro.checked = true;
        }

        // Restaurar cores originais
        aplicarDaltonismo('nenhum');

        // Desativar alto contraste
        document.body.classList.remove('alto-contraste');

        if (alternarContraste) {
            alternarContraste.setAttribute('aria-pressed', 'false');
        }

        // Desativar destaque dos links
        document.body.classList.remove('links-destacados');

        if (destacarLinks) {
            destacarLinks.checked = false;
            destacarLinks.setAttribute('aria-pressed', 'false');
        }

        // Fechar opções de temas
        if (opcoesTemas && btnTemas) {
            opcoesTemas.hidden = true;
            btnTemas.setAttribute('aria-expanded', 'false');
        }
    });
}
