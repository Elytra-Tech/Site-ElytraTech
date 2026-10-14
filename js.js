
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


/* ========================================
   EDITOR VISUAL - ELYTRA TECH
   ======================================== */

const canvas = document.querySelector('#preview-canvas');

if (canvas) {
    const emptyMessage = document.querySelector('#editor-empty');
    const fields = document.querySelector('#editor-fields');
    const hint = document.querySelector('#editor-hint');
    const contentInput = document.querySelector('#component-content');
    const colorInput = document.querySelector('#component-color');
    const removeButton = document.querySelector('#remove-component');
    const clearButton = document.querySelector('#clear-preview');

    let selectedComponent = null;

    const defaultColor = '#f2edf5';

    // Cria um componente sem interpretar o texto como HTML.
    function createComponent(type) {
        const component = document.createElement('div');

        component.classList.add('editor-component');
        component.dataset.type = type;

        let content = document.createElement('div');
        content.dataset.content = '';

        switch (type) {
            case 'header':
                component.classList.add('editor-preview-header');
                content.textContent = 'Minha marca';
                break;

            case 'title':
                content = document.createElement('h2');
                content.dataset.content = '';
                content.textContent = 'Meu novo título';
                break;

            case 'text':
                content = document.createElement('p');
                content.dataset.content = '';
                content.textContent = 'Escreva seu texto aqui.';
                break;

            case 'button':
                content = document.createElement('button');
                content.type = 'button';
                content.classList.add('editor-preview-button');
                content.textContent = 'Clique aqui';
                break;

            case 'section':
                component.classList.add('editor-preview-section');

                const sectionTitle = document.createElement('h2');
                sectionTitle.textContent = 'Minha seção';

                content = document.createElement('p');
                content.textContent = 'Adicione uma descrição para esta seção.';

                component.appendChild(sectionTitle);
                break;

            default:
                return null;
        }

        content.dataset.content = '';
        component.appendChild(content);

        return component;
    }

    // Adiciona o componente à área de prévia.
    function addComponent(type) {
        const component = createComponent(type);

        if (!component) return;

        canvas.appendChild(component);
        emptyMessage.hidden = true;

        selectComponent(component);
    }

    // Seleciona um componente e carrega suas propriedades.
    function selectComponent(component) {
        if (selectedComponent) {
            selectedComponent.classList.remove('is-selected');
        }

        selectedComponent = component;
        selectedComponent.classList.add('is-selected');

        const editableContent = selectedComponent.querySelector(
            '[data-content]'
        );

        contentInput.value = editableContent.textContent;
        colorInput.value = rgbToHex(
            getComputedStyle(editableContent).color
        );

        fields.hidden = false;
        hint.hidden = true;
    }

    // Atualiza o conteúdo enquanto você digita.
    contentInput.addEventListener('input', function () {
        if (!selectedComponent) return;

        const editableContent = selectedComponent.querySelector(
            '[data-content]'
        );

        editableContent.textContent = contentInput.value;
    });

    // Atualiza a cor do texto selecionado.
    colorInput.addEventListener('input', function () {
        if (!selectedComponent) return;

        const editableContent = selectedComponent.querySelector(
            '[data-content]'
        );

        editableContent.style.color = colorInput.value;
    });

    // Seleciona componentes clicados na prévia.
    canvas.addEventListener('click', function (event) {
        const component = event.target.closest('.editor-component');

        if (component && canvas.contains(component)) {
            selectComponent(component);
        }
    });

    // Botões para adicionar os componentes.
    document.querySelectorAll('[data-add]').forEach(function (button) {
        button.addEventListener('click', function () {
            addComponent(button.dataset.add);
        });
    });

    // Remove somente o componente selecionado.
    removeButton.addEventListener('click', function () {
        if (!selectedComponent) return;

        selectedComponent.remove();
        selectedComponent = null;

        fields.hidden = true;
        hint.hidden = false;
        emptyMessage.hidden = canvas.querySelector(
            '.editor-component'
        ) !== null;
    });

    // Limpa toda a área de prévia.
    clearButton.addEventListener('click', function () {
        canvas.querySelectorAll('.editor-component').forEach(
            function (component) {
                component.remove();
            }
        );

        selectedComponent = null;
        fields.hidden = true;
        hint.hidden = false;
        emptyMessage.hidden = false;
    });

    // Converte cores RGB para hexadecimal.
    function rgbToHex(color) {
        if (color.startsWith('#')) return color;

        const values = color.match(/\d+/g);

        if (!values || values.length < 3) {
            return defaultColor;
        }

        return '#' + values.slice(0, 3).map(function (value) {
            return Number(value).toString(16).padStart(2, '0');
        }).join('');
    }
}


/* Alinhamento do texto no editor */
const alignmentButtons = document.querySelectorAll(".alignment-button");

alignmentButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedComponent = document.querySelector(
            "#preview-canvas .editor-component.is-selected"
        );

        if (!selectedComponent) {
            alert("Selecione um componente da prévia primeiro.");
            return;
        }

        const alignment = button.dataset.align;

        selectedComponent.style.textAlign = alignment;

        alignmentButtons.forEach(function (item) {
            item.classList.remove("active");
        });

        button.classList.add("active");
    });
});
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


/* Personalização avançada dos componentes */
const fontSizeInput = document.querySelector("#font-size");
const fontSizeValue = document.querySelector("#font-size-value");

const paddingInput = document.querySelector("#padding-size");
const paddingValue = document.querySelector("#padding-size-value");

const marginInput = document.querySelector("#margin-size");
const marginValue = document.querySelector("#margin-size-value");

const boldToggle = document.querySelector("#bold-toggle");
const positionButtons = document.querySelectorAll(".position-button");

function getSelectedComponent() {
    return document.querySelector(
        "#preview-canvas .editor-component.is-selected"
    );
}

/* Atualiza o tamanho da fonte */
if (fontSizeInput && fontSizeValue) {
    fontSizeInput.addEventListener("input", function () {
        const component = getSelectedComponent();

        fontSizeValue.textContent = `${fontSizeInput.value} px`;

        if (component) {
            component.style.fontSize = `${fontSizeInput.value}px`;
        }
    });
}


/* Ativa ou desativa o negrito */
if (boldToggle) {
    boldToggle.addEventListener("click", function () {
        const component = getSelectedComponent();

        if (!component) {
            alert("Selecione um componente da prévia primeiro.");
            return;
        }

        const currentWeight = window.getComputedStyle(component).fontWeight;
        const isBold = Number(currentWeight) >= 600;

        component.style.setProperty(
            "font-weight",
            isBold ? "400" : "700",
            "important"
        );

        boldToggle.classList.toggle("active", !isBold);
    });
}


/* Controla o espaçamento interno */
if (paddingInput && paddingValue) {
    paddingInput.addEventListener("input", function () {
        const component = getSelectedComponent();

        paddingValue.textContent = `${paddingInput.value} px`;

        if (component) {
            component.style.padding = `${paddingInput.value}px`;
        }
    });
}

/* Controla o espaçamento externo */
if (marginInput && marginValue) {
    marginInput.addEventListener("input", function () {
        const component = getSelectedComponent();

        marginValue.textContent = `${marginInput.value} px`;

        if (component) {
            component.style.margin = `${marginInput.value}px`;
        }
    });
}

/* Posiciona o componente */
positionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const component = getSelectedComponent();

        if (!component) {
            alert("Selecione um componente da prévia primeiro.");
            return;
        }

        const position = button.dataset.position;

        component.style.display = "block";
        component.style.width = "fit-content";
        component.style.maxWidth = "100%";

        if (position === "left") {
            component.style.marginLeft = "0";
            component.style.marginRight = "auto";
        } else if (position === "center") {
            component.style.marginLeft = "auto";
            component.style.marginRight = "auto";
        } else {
            component.style.marginLeft = "auto";
            component.style.marginRight = "0";
        }

        positionButtons.forEach(function (item) {
            item.classList.toggle("active", item === button);
        });
    });
});


/* ========================================
   FUNDO, LARGURA E ALTURA DOS COMPONENTES
   ======================================== */

const backgroundSelect = document.querySelector("#background-color");
const widthInput = document.querySelector("#component-width");
const widthValue = document.querySelector("#component-width-value");
const heightInput = document.querySelector("#component-height");
const heightValue = document.querySelector("#component-height-value");

const dimensionCanvas = document.querySelector("#preview-canvas");

/* Retorna o componente atualmente selecionado */
function getDimensionComponent() {
    return document.querySelector(
        "#preview-canvas .editor-component.is-selected"
    );
}

/* Preenche o seletor usando as cores do tema existente */
if (backgroundSelect) {
    const rootStyles = getComputedStyle(document.documentElement);

    const paletteVariables = [
        ["--deep", "Fundo escuro"],
        ["--deep-2", "Fundo secundário"],
        ["--ink", "Texto claro"],
        ["--line", "Bordas"],
        ["--purple", "Roxo da paleta"]
    ];

    paletteVariables.forEach(function ([variable, label]) {
        const color = rootStyles.getPropertyValue(variable).trim();

        if (!color) return;

        const option = document.createElement("option");
        option.value = color;
        option.textContent = label;

        backgroundSelect.appendChild(option);
    });
}

/* Altera o fundo do componente selecionado */
if (backgroundSelect) {
    backgroundSelect.addEventListener("change", function () {
        const component = getDimensionComponent();

        if (!component) {
            alert("Selecione um componente da prévia primeiro.");
            backgroundSelect.value = "";
            return;
        }

        if (backgroundSelect.value === "") {
            component.style.removeProperty("background-color");
            return;
        }

        component.style.backgroundColor = backgroundSelect.value;
    });
}

/* Atualiza a largura */
if (widthInput && widthValue) {
    widthInput.addEventListener("input", function () {
        const component = getDimensionComponent();

        widthValue.textContent = `${widthInput.value}%`;

        if (!component) return;

        component.style.width = `${widthInput.value}%`;
        component.style.maxWidth = "100%";
        component.style.boxSizing = "border-box";
    });
}

/* Atualiza a altura */
if (heightInput && heightValue) {
    heightInput.addEventListener("input", function () {
        const component = getDimensionComponent();
        const height = Number(heightInput.value);

        heightValue.textContent = height === 0
            ? "Automática"
            : `${height} px`;

        if (!component) return;

        if (height === 0) {
            component.style.removeProperty("height");
            component.style.removeProperty("min-height");
        } else {
            component.style.height = `${height}px`;
            component.style.minHeight = "0";
            component.style.boxSizing = "border-box";
        }
    });
}

/* Atualiza os controles ao selecionar outro componente */
if (dimensionCanvas) {
    dimensionCanvas.addEventListener("click", function () {
        const component = getDimensionComponent();

        if (!component) return;

        const styles = getComputedStyle(component);
        const width = styles.width;
        const height = styles.height;

        if (widthInput && widthValue) {
            const percentage = component.parentElement
                ? (component.offsetWidth /
                   component.parentElement.clientWidth) * 100
                : 100;

            const safeWidth = Math.min(
                100,
                Math.max(10, Math.round(percentage))
            );

            widthInput.value = safeWidth;
            widthValue.textContent = `${safeWidth}%`;
        }

        if (heightInput && heightValue) {
            const hasCustomHeight =
                component.style.height !== "";

            const currentHeight = hasCustomHeight
                ? Math.round(parseFloat(height))
                : 0;

            heightInput.value = currentHeight;
            heightValue.textContent = currentHeight === 0
                ? "Automática"
                : `${currentHeight} px`;
        }

        if (backgroundSelect) {
            backgroundSelect.value = "";
        }
    });
}
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
};
