
/* ========================================
   MENU RESPONSIVO DO SITE ORIGINAL
   ======================================== */

const menuBtn = document.querySelector('.Color-button-anim');
const navList = document.querySelector('.STYcabecalho ul');

if (menuBtn && navList) {
    menuBtn.addEventListener('click', function () {
        navList.classList.toggle('open');
    });

    navList.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navList.classList.remove('open');
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
fontSizeInput.addEventListener("input", function () {
    const component = getSelectedComponent();

    fontSizeValue.textContent = `${fontSizeInput.value} px`;

    if (component) {
        component.style.fontSize = `${fontSizeInput.value}px`;
    }
});


/* Ativa ou desativa o negrito */
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


/* Controla o espaçamento interno */
paddingInput.addEventListener("input", function () {
    const component = getSelectedComponent();

    paddingValue.textContent = `${paddingInput.value} px`;

    if (component) {
        component.style.padding = `${paddingInput.value}px`;
    }
});

/* Controla o espaçamento externo */
marginInput.addEventListener("input", function () {
    const component = getSelectedComponent();

    marginValue.textContent = `${marginInput.value} px`;

    if (component) {
        component.style.margin = `${marginInput.value}px`;
    }
});

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
