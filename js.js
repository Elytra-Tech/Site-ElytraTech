
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


/* ========================================
   PERSONALIZAÇÃO RGB E TIPOGRAFIA
   ======================================== */

(function initVisualSettings() {
    const canvas = document.querySelector("#preview-canvas");

    // A personalização só funciona na página do editor.
    if (!canvas) return;

    const scopeSelect = document.querySelector("#visual-scope");
    const targetSelect = document.querySelector("#rgb-target");

    const redInput = document.querySelector("#rgb-red");
    const greenInput = document.querySelector("#rgb-green");
    const blueInput = document.querySelector("#rgb-blue");

    const rgbPreview = document.querySelector("#rgb-preview");
    const rgbValue = document.querySelector("#rgb-value");
    const applyRgbButton = document.querySelector("#apply-rgb");

    const fontNameInput = document.querySelector("#font-family-input");
    const fontUrlInput = document.querySelector("#font-url-input");
    const fontFileInput = document.querySelector("#font-file-input");

    const loadFontButton = document.querySelector("#load-font-url");
    const applyFontButton = document.querySelector("#apply-font");
    const fontPreview = document.querySelector("#font-preview-text");

    let loadedFontName = "";
    let uploadedFontUrl = "";

    // Recupera o componente selecionado.
    function getSelected() {
        return canvas.querySelector(
            ".editor-component.is-selected"
        );
    }

    // Decide se a mudança será individual ou global.
    function getTargets() {
        if (scopeSelect.value === "all") {
            return Array.from(
                canvas.querySelectorAll(".editor-component")
            );
        }

        const selected = getSelected();

        return selected ? [selected] : [];
    }

    // Limita cada canal RGB ao intervalo permitido.
    function getChannelValue(input) {
        const value = Number(input.value);

        if (input.value.trim() === "" || !Number.isFinite(value)) {
            return null;
        }

        return Math.min(255, Math.max(0, Math.round(value)));
    }

    // Monta e atualiza a cor RGB.
    function getRgbColor() {
        const r = getChannelValue(redInput);
        const g = getChannelValue(greenInput);
        const b = getChannelValue(blueInput);

        if (r === null || g === null || b === null) {
            return null;
        }

        redInput.value = r;
        greenInput.value = g;
        blueInput.value = b;

        return `rgb(${r}, ${g}, ${b})`;
    }

    function updateRgbPreview() {
        const color = getRgbColor();

        if (!color) {
            rgbValue.textContent = "Informe valores de 0 a 255.";
            return;
        }

        rgbPreview.style.backgroundColor = color;
        rgbValue.textContent = color;
    }

    [redInput, greenInput, blueInput].forEach(function (input) {
        input.addEventListener("input", updateRgbPreview);
        input.addEventListener("change", updateRgbPreview);
    });

    updateRgbPreview();

    // Aplica a cor de texto ou de fundo.
    applyRgbButton.addEventListener("click", function () {
        const color = getRgbColor();

        if (!color) {
            alert("Preencha os três valores RGB entre 0 e 255.");
            return;
        }

        const targets = getTargets();

        if (targets.length === 0) {
            alert(
                "Adicione um componente ou selecione um componente na prévia."
            );
            return;
        }

        const property = targetSelect.value;

        targets.forEach(function (component) {
            if (property === "backgroundColor") {
                component.style.backgroundColor = color;
            } else {
                // Aplica também ao conteúdo interno, como o texto dos botões.
                component.style.color = color;

                component.querySelectorAll("[data-content]").forEach(
                    function (element) {
                        element.style.color = color;
                    }
                );
            }
        });
    });

    // Atualiza a demonstração da tipografia.
    function updateFontPreview() {
        const fontName = fontNameInput.value.trim();

        if (fontName) {
            fontPreview.style.fontFamily = `"${fontName}", sans-serif`;
        } else {
            fontPreview.style.fontFamily = "";
        }
    }

    fontNameInput.addEventListener("input", updateFontPreview);

    // Carrega uma folha CSS externa que disponibilize a fonte.
    loadFontButton.addEventListener("click", function () {
        const url = fontUrlInput.value.trim();
        const fontName = fontNameInput.value.trim();

        if (!url || !fontName) {
            alert("Informe o nome da fonte e o link da folha CSS.");
            return;
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            alert("Informe um endereço de URL válido.");
            return;
        }

        if (!["https:", "http:"].includes(parsedUrl.protocol)) {
            alert("O link precisa utilizar HTTP ou HTTPS.");
            return;
        }

        // Reaproveita a folha se o mesmo link já estiver carregado.
        let fontLink = document.querySelector("#custom-font-stylesheet");

        if (!fontLink) {
            fontLink = document.createElement("link");
            fontLink.id = "custom-font-stylesheet";
            fontLink.rel = "stylesheet";
            document.head.appendChild(fontLink);
        }

        fontLink.href = parsedUrl.href;
        loadedFontName = fontName;

        fontLink.onload = function () {
            updateFontPreview();

            alert(
                "Folha de estilos carregada. Confira se a fonte está disponível."
            );
        };

        fontLink.onerror = function () {
            alert(
                "Não foi possível carregar a folha CSS. Verifique o link e a conexão."
            );
        };
    });

    // Permite carregar arquivos de fonte do computador.
    fontFileInput.addEventListener("change", async function () {
        const file = fontFileInput.files[0];
        const fontName = fontNameInput.value.trim();

        if (!file) return;

        if (!fontName) {
            alert("Digite um nome para a fonte antes de carregá-la.");
            fontFileInput.value = "";
            return;
        }

        const allowedExtensions = /\.(ttf|otf|woff2?)$/i;

        if (!allowedExtensions.test(file.name)) {
            alert("Formato não suportado. Use TTF, OTF, WOFF ou WOFF2.");
            fontFileInput.value = "";
            return;
        }

        // Limite para evitar o carregamento acidental de arquivos enormes.
        if (file.size > 10 * 1024 * 1024) {
            alert("O arquivo precisa ter no máximo 10 MB.");
            fontFileInput.value = "";
            return;
        }

        try {
            const fileUrl = URL.createObjectURL(file);
            const fontFace = new FontFace(
                fontName,
                `url("${fileUrl}")`
            );

            await fontFace.load();
            document.fonts.add(fontFace);

            if (uploadedFontUrl) {
                URL.revokeObjectURL(uploadedFontUrl);
            }

            uploadedFontUrl = fileUrl;
            loadedFontName = fontName;

            updateFontPreview();

            alert("Fonte carregada com sucesso!");
        } catch (error) {
            console.error("Erro ao carregar a fonte:", error);
            alert(
                "Não foi possível carregar essa fonte. Verifique o arquivo."
            );
        }
    });

    // Aplica a fonte carregada ou uma fonte já disponível no navegador.
    applyFontButton.addEventListener("click", function () {
        const fontName = fontNameInput.value.trim();

        if (!fontName) {
            alert("Digite o nome da fonte que deseja utilizar.");
            return;
        }

        const targets = getTargets();

        if (targets.length === 0) {
            alert(
                "Adicione um componente ou selecione um componente na prévia."
            );
            return;
        }

        const isLoaded = document.fonts.check(
            `16px "${fontName}"`
        );

        if (!isLoaded && fontName !== loadedFontName) {
            const useFont = confirm(
                "Não foi possível confirmar se essa fonte está carregada. " +
                "Deseja aplicá-la mesmo assim? Ela poderá aparecer com uma fonte substituta."
            );

            if (!useFont) return;
        }

        targets.forEach(function (component) {
            component.style.fontFamily = `"${fontName}", sans-serif`;

            component.querySelectorAll("*").forEach(
                function (element) {
                    element.style.fontFamily = "inherit";
                }
            );
        });

        updateFontPreview();
    });
})();



/* ========================================
   ABAS DO EDITOR — ELYTRA TECH
   ======================================== */

(function initEditorTabs() {
    const editor = document.querySelector(".editor-layout");

    if (!editor) return;

    const tabButtons = editor.querySelectorAll("[data-editor-tab]");
    const panels = editor.querySelectorAll("[data-editor-panel]");
    const canvas = document.querySelector("#preview-canvas");
    const previewArea = document.querySelector("#editor-preview-area");
    const welcome = document.querySelector("#editor-workspace-welcome");
    const workspaceTitle = document.querySelector("#editor-workspace-title");
    const openPreviewButton = document.querySelector("#open-editor-preview");
    const layersList = document.querySelector("#editor-layers-list");

    const tabTitles = {
        components: "Componentes",
        layers: "Camadas",
        properties: "Propriedades",
        themes: "Personalização do tema",
        preview: "Prévia do site"
    };

    function openTab(tabName) {
        tabButtons.forEach(function (button) {
            const active = button.dataset.editorTab === tabName;

            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        panels.forEach(function (panel) {
            panel.hidden = panel.dataset.editorPanel !== tabName;
        });

        if (previewArea) {
            previewArea.hidden = false;
        }

        if (welcome) {
            welcome.hidden = true;
        }

        if (workspaceTitle) {
            workspaceTitle.textContent = tabTitles[tabName] || "Editor";
        }

        if (tabName === "layers") {
            updateLayers();
        }
    }

    function getComponentName(component, index) {
        const type = component.dataset.type || component.tagName.toLowerCase();

        const names = {
            header: "Cabeçalho",
            title: "Título",
            text: "Texto",
            button: "Botão",
            section: "Seção"
        };

        const content = component.textContent.trim().replace(/\s+/g, " ");
        const name = names[type] || "Componente";
        const description = content ? " — " + content.slice(0, 20) : "";

        return (index + 1) + ". " + name + description;
    }

    function updateLayers() {
        if (!canvas || !layersList) return;

        const components = canvas.querySelectorAll(".editor-component");

        layersList.replaceChildren();

        if (components.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "editor-empty-layers";
            emptyMessage.textContent = "Nenhum componente adicionado.";
            layersList.appendChild(emptyMessage);
            return;
        }

        components.forEach(function (component, index) {
            const layer = document.createElement("button");

            layer.type = "button";
            layer.className = "editor-layer-item";
            layer.textContent = getComponentName(component, index);

            if (component.classList.contains("is-selected")) {
                layer.classList.add("is-active");
            }

            layer.addEventListener("click", function () {
                canvas.querySelectorAll(".editor-component").forEach(function (item) {
                    item.classList.remove("is-selected");
                });

                component.classList.add("is-selected");

                // Aciona os listeners de seleção já existentes no editor.
                component.dispatchEvent(new MouseEvent("click", {
                    bubbles: true
                }));

                openTab("properties");
                updateLayers();
            });

            layersList.appendChild(layer);
        });
    }

    tabButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            openTab(button.dataset.editorTab);
        });
    });

    if (openPreviewButton) {
        openPreviewButton.addEventListener("click", function () {
            openTab("preview");
        });
    }

    if (canvas) {
        canvas.addEventListener("click", function () {
            requestAnimationFrame(updateLayers);
        });
    }

    editor.querySelectorAll("[data-add]").forEach(function (button) {
        button.addEventListener("click", function () {
            requestAnimationFrame(updateLayers);
        });
    });

    const clearButton = document.querySelector("#clear-preview");

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            requestAnimationFrame(updateLayers);
        });
    }

    const removeButton = document.querySelector("#remove-component");

    if (removeButton) {
        removeButton.addEventListener("click", function () {
            requestAnimationFrame(updateLayers);
        });
    }

    // Abre a aba Componentes ao carregar.
    openTab("components");
    updateLayers();
})();


/* ========================================
   TEMAS PRONTOS — ELYTRA TECH
   ======================================== */

(function initEditorThemes() {
    const canvas = document.querySelector("#preview-canvas");
    const themeSelect = document.querySelector("#editor-theme-select");
    const applyButton = document.querySelector("#apply-editor-theme");
    const themePreview = document.querySelector("#editor-theme-preview");

    if (!canvas || !themeSelect || !applyButton) return;

    const themes = {
        elytra: {
            background: "#0d0b12",
            text: "#f2edf5",
            accent: "#ff4fc3",
            surface: "#171020"
        },
        purple: {
            background: "#171020",
            text: "#f2edf5",
            accent: "#a855f7",
            surface: "#271333"
        },
        pink: {
            background: "#1b101b",
            text: "#f2edf5",
            accent: "#ff4fc3",
            surface: "#351329"
        },
        minimal: {
            background: "#08080c",
            text: "#f2edf5",
            accent: "#7b2cbf",
            surface: "#17131f"
        }
    };

    function updateThemePreview() {
        if (themePreview) {
            themePreview.dataset.theme = themeSelect.value;
        }
    }

    themeSelect.addEventListener("change", updateThemePreview);

    applyButton.addEventListener("click", function () {
        const theme = themes[themeSelect.value];

        if (!theme) return;

        canvas.style.backgroundColor = theme.background;
        canvas.style.color = theme.text;

        canvas.querySelectorAll(".editor-component").forEach(function (component) {
            component.style.color = theme.text;
            component.style.borderColor = theme.accent;

            if (component.matches("button")) {
                component.style.backgroundColor = theme.accent;
                component.style.color = theme.text;
            }

            if (component.matches("section, header")) {
                component.style.backgroundColor = theme.surface;
            }
        });
    });

    updateThemePreview();
})();



/* ========================================
   HISTÓRICO — DESFAZER E REFAZER
   ELYTRA TECH
   ======================================== */

(function initEditorHistory() {
    const canvas = document.querySelector("#preview-canvas");
    const undoButton = document.querySelector("#editor-undo");
    const redoButton = document.querySelector("#editor-redo");

    if (!canvas || !undoButton || !redoButton) return;

    const MAX_HISTORY = 50;

    let history = [];
    let historyIndex = -1;
    let debounceTimer = null;
    let restoring = false;

    function getSnapshot() {
        const components = Array.from(
            canvas.querySelectorAll(":scope > .editor-component")
        ).map(function (component) {
            const clone = component.cloneNode(true);

            // A seleção visual não precisa fazer parte do histórico.
            clone.classList.remove("is-selected");

            return clone.outerHTML;
        });

        return JSON.stringify({
            components: components,
            canvasStyle: canvas.getAttribute("style")
        });
    }

    function updateButtons() {
        undoButton.disabled = historyIndex <= 0;
        redoButton.disabled = historyIndex >= history.length - 1;
    }

    function saveSnapshot() {
        if (restoring) return;

        const snapshot = getSnapshot();

        // Evita guardar estados repetidos.
        if (history[historyIndex] === snapshot) return;

        // Uma nova alteração descarta o histórico futuro.
        history = history.slice(0, historyIndex + 1);
        history.push(snapshot);

        if (history.length > MAX_HISTORY) {
            history.shift();
        }

        historyIndex = history.length - 1;
        updateButtons();
    }

    function scheduleSnapshot() {
        if (restoring) return;

        clearTimeout(debounceTimer);

        // Agrupa alterações rápidas, como digitação e controles deslizantes.
        debounceTimer = setTimeout(function () {
            saveSnapshot();
        }, 300);
    }

    function restoreSnapshot(snapshot) {
        if (!snapshot) return;

        clearTimeout(debounceTimer);
        restoring = true;

        const state = JSON.parse(snapshot);

        // Desconecta temporariamente o observador para não registrar
        // a restauração como uma nova alteração.
        observer.disconnect();

        canvas.querySelectorAll(":scope > .editor-component").forEach(
            function (component) {
                component.remove();
            }
        );

        if (state.canvasStyle === null) {
            canvas.removeAttribute("style");
        } else {
            canvas.setAttribute("style", state.canvasStyle);
        }

        const template = document.createElement("template");
        template.innerHTML = state.components.join("");

        canvas.appendChild(template.content);

        const emptyMessage = document.querySelector("#editor-empty");
        const fields = document.querySelector("#editor-fields");
        const hint = document.querySelector("#editor-hint");

        const components = canvas.querySelectorAll(".editor-component");

        if (emptyMessage) {
            emptyMessage.hidden = components.length > 0;
        }

        if (components.length > 0) {
            // Selecionar o primeiro componente atualiza também
            // as referências internas do editor original.
            components[0].dispatchEvent(new MouseEvent("click", {
                bubbles: true
            }));
        } else {
            if (fields) fields.hidden = true;
            if (hint) hint.hidden = false;
        }

        observer.observe(canvas, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["style"]
        });

        restoring = false;

        // Atualiza a lista de camadas, se ela estiver presente.
        const layersList = document.querySelector("#editor-layers-list");

        if (layersList) {
            const layerTab = document.querySelector(
                '[data-editor-tab="layers"]'
            );

            if (layerTab) {
                layerTab.click();
            }
        }

        updateButtons();
    }

    function undo() {
        if (historyIndex <= 0) return;

        historyIndex--;
        restoreSnapshot(history[historyIndex]);
    }

    function redo() {
        if (historyIndex >= history.length - 1) return;

        historyIndex++;
        restoreSnapshot(history[historyIndex]);
    }

    const observer = new MutationObserver(function () {
        scheduleSnapshot();
    });

    observer.observe(canvas, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["style"]
    });

    undoButton.addEventListener("click", function () {
        undo();
    });

    redoButton.addEventListener("click", function () {
        redo();
    });

    // Salva o estado inicial do editor.
    saveSnapshot();
})();
