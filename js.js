/* ========================================
   UTILITÁRIOS
   ======================================== */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));


/* ========================================
   MENU RESPONSIVO DO SITE
   ======================================== */

(function initMenu() {
    const menuBtn = $('.Color-button-anim');
    const navList = $('.STYcabecalho ul');

    if (!menuBtn || !navList) return;

    menuBtn.addEventListener('click', function () {
        navList.classList.toggle('open');
    });

    navList.addEventListener('click', function (event) {
        if (event.target.closest('a')) navList.classList.remove('open');
    });
})();


/* ========================================
   ACESSIBILIDADE
   ======================================== */

(function initA11y() {
    const toggle = $('#a11y-toggle');
    const panel = $('#a11y-panel');

    if (!toggle || !panel) return;

    const root = document.documentElement;
    const classes = {
        'high-contrast': 'a11y-contrast',
        'grayscale': 'a11y-gray',
        'highlight-links': 'a11y-links',
        'no-motion': 'a11y-nomotion'
    };

    let zoom = 1;

    function setOpen(open) {
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
    }

    function applyZoom() {
        zoom = Math.min(1.4, Math.max(0.8, zoom));
        document.body.style.zoom = zoom === 1 ? '' : zoom;
    }

    toggle.addEventListener('click', function () {
        setOpen(panel.hidden);
    });

    document.addEventListener('click', function (event) {
        if (!panel.hidden && !event.target.closest('.a11y')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !panel.hidden) {
            setOpen(false);
            toggle.focus();
        }
    });

    panel.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-action]');

        if (!button) return;

        const action = button.dataset.action;

        if (action === 'font-up') {
            zoom += 0.1;
            applyZoom();
        } else if (action === 'font-down') {
            zoom -= 0.1;
            applyZoom();
        } else if (action === 'reset') {
            zoom = 1;
            applyZoom();

            Object.values(classes).forEach(function (name) {
                root.classList.remove(name);
            });

            $$('[aria-pressed]', panel).forEach(function (item) {
                item.setAttribute('aria-pressed', 'false');
            });
        } else if (classes[action]) {
            const active = root.classList.toggle(classes[action]);
            button.setAttribute('aria-pressed', String(active));
        }
    });
})();


/* ========================================
   PARTÍCULAS DO FUNDO (leve e pausável)
   ======================================== */

(function initParticles() {
    const cv = $('#particles');

    if (!cv) return;

    const ctx = cv.getContext('2d');
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const count = window.innerWidth < 700 ? 25 : 50;
    const maxDistance = 120;

    let width = 0;
    let height = 0;
    let dots = [];

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = window.innerWidth;
        height = window.innerHeight;
        cv.width = width * dpr;
        cv.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createDots() {
        dots = Array.from({ length: count }, function () {
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.5 + 0.5
            };
        });
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < dots.length; i++) {
            const a = dots[i];

            ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fill();

            for (let j = i + 1; j < dots.length; j++) {
                const b = dots[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.hypot(dx, dy);

                if (dist < maxDistance) {
                    ctx.strokeStyle =
                        'rgba(255, 79, 195, ' + (0.15 * (1 - dist / maxDistance)) + ')';
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
    }

    function update() {
        dots.forEach(function (dot) {
            dot.x += dot.vx;
            dot.y += dot.vy;

            if (dot.x < 0 || dot.x > width) dot.vx *= -1;
            if (dot.y < 0 || dot.y > height) dot.vy *= -1;
        });
    }

    function isPaused() {
        return document.hidden ||
            reduceMotion.matches ||
            root.classList.contains('a11y-nomotion');
    }

    function frame() {
        if (isPaused()) {
            // Quando pausado, verifica de novo só a cada meio segundo.
            setTimeout(function () {
                requestAnimationFrame(frame);
            }, 500);
            return;
        }

        update();
        draw();
        requestAnimationFrame(frame);
    }

    let resizeTimer;

    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            createDots();
        }, 150);
    });

    resize();
    createDots();
    draw();
    requestAnimationFrame(frame);
})();


/* ========================================
   EDITOR VISUAL - ELYTRA TECH
   Tudo do editor fica dentro deste bloco,
   compartilhando o mesmo estado.
   ======================================== */

(function initEditor() {
    const canvas = $('#preview-canvas');

    // Só executa na página do editor.
    if (!canvas) return;

    /* ---------- Referências ---------- */

    const emptyMessage = $('#editor-empty');
    const fields = $('#editor-fields');
    const hint = $('#editor-hint');

    const input = {
        content: $('#component-content'),
        color: $('#component-color'),
        fontSize: $('#font-size'),
        bold: $('#bold-toggle'),
        padding: $('#padding-size'),
        margin: $('#margin-size'),
        width: $('#component-width'),
        height: $('#component-height'),
        background: $('#background-color')
    };

    const alignButtons = $$('.alignment-button');
    const defaultColor = '#f2edf5';

    let selected = null;


    /* ---------- Funções auxiliares ---------- */

    function contentOf(component) {
        return $('[data-content]', component);
    }

    // O componente e todos os elementos dentro dele.
    function treeOf(component) {
        return [component].concat($$('*', component));
    }

    function allComponents() {
        return $$(':scope > .editor-component', canvas);
    }

    function refreshEmpty() {
        emptyMessage.hidden = allComponents().length > 0;
    }

    function rgbToHex(color) {
        if (color.startsWith('#')) return color;

        const values = color.match(/\d+/g);

        if (!values || values.length < 3) return defaultColor;

        return '#' + values.slice(0, 3).map(function (value) {
            return Number(value).toString(16).padStart(2, '0');
        }).join('');
    }

    // Executa uma ação no componente selecionado (se houver).
    function onSelected(element, eventName, callback) {
        element.addEventListener(eventName, function (event) {
            if (selected) callback(selected, event);
        });
    }


    /* ---------- Criação de componentes ---------- */

    // Cria um componente sem interpretar o texto como HTML.
    function createComponent(type) {
        const component = document.createElement('div');
        let content;

        component.className = 'editor-component';
        component.dataset.type = type;

        switch (type) {
            case 'header':
                component.classList.add('editor-preview-header');
                content = document.createElement('div');
                content.textContent = 'Minha marca';
                break;

            case 'title':
                content = document.createElement('h2');
                content.textContent = 'Meu novo título';
                break;

            case 'text':
                content = document.createElement('p');
                content.textContent = 'Escreva seu texto aqui.';
                break;

            case 'button':
                content = document.createElement('button');
                content.type = 'button';
                content.className = 'editor-preview-cta';
                content.textContent = 'Clique aqui';
                break;

            case 'section': {
                component.classList.add('editor-preview-section');

                const sectionTitle = document.createElement('h2');
                sectionTitle.textContent = 'Minha seção';
                component.appendChild(sectionTitle);

                content = document.createElement('p');
                content.textContent = 'Adicione uma descrição para esta seção.';
                break;
            }

            default:
                return null;
        }

        content.dataset.content = '';
        component.appendChild(content);

        return component;
    }

    function addComponent(type) {
        const component = createComponent(type);

        if (!component) return;

        canvas.appendChild(component);
        refreshEmpty();
        selectComponent(component);
    }


    /* ---------- Seleção ---------- */

    function selectComponent(component) {
        if (selected) selected.classList.remove('is-selected');

        selected = component;
        selected.classList.add('is-selected');

        const content = contentOf(component);
        const styles = getComputedStyle(component);
        const contentStyles = getComputedStyle(content);

        input.content.value = content.textContent;
        input.color.value = rgbToHex(contentStyles.color);
        input.fontSize.value = parseInt(styles.fontSize, 10) || 24;
        input.bold.checked = Number(contentStyles.fontWeight) >= 600;
        input.padding.value = parseInt(styles.paddingTop, 10) || 0;
        input.margin.value = parseInt(styles.marginBottom, 10) || 0;
        input.width.value = component.style.width
            ? parseInt(component.style.width, 10)
            : 100;
        input.height.value = component.style.height
            ? parseInt(component.style.height, 10)
            : 0;

        alignButtons.forEach(function (button) {
            button.classList.toggle(
                'is-active',
                button.dataset.align === component.style.textAlign
            );
        });

        fields.hidden = false;
        hint.hidden = true;

        updateLayers();
    }

    function deselect() {
        if (selected) selected.classList.remove('is-selected');

        selected = null;
        fields.hidden = true;
        hint.hidden = false;

        updateLayers();
    }

    canvas.addEventListener('click', function (event) {
        const component = event.target.closest('.editor-component');

        if (component && canvas.contains(component)) {
            selectComponent(component);
        }
    });

    $$('[data-add]').forEach(function (button) {
        button.addEventListener('click', function () {
            addComponent(button.dataset.add);
        });
    });

    $('#remove-component').addEventListener('click', function () {
        if (!selected) return;

        selected.remove();
        deselect();
        refreshEmpty();
    });

    $('#clear-preview').addEventListener('click', function () {
        allComponents().forEach(function (component) {
            component.remove();
        });

        deselect();
        refreshEmpty();
    });


    /* ---------- Propriedades do componente ---------- */

    onSelected(input.content, 'input', function (component) {
        contentOf(component).textContent = input.content.value;
    });

    onSelected(input.color, 'input', function (component) {
        treeOf(component).forEach(function (element) {
            element.style.color = input.color.value;
        });
    });

    alignButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            if (!selected) {
                alert('Selecione um componente da prévia primeiro.');
                return;
            }

            selected.style.textAlign = button.dataset.align;

            alignButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
        });
    });

    onSelected(input.fontSize, 'input', function (component) {
        component.style.fontSize = input.fontSize.value + 'px';
    });

    onSelected(input.bold, 'change', function (component) {
        const weight = input.bold.checked ? '700' : '400';

        treeOf(component).forEach(function (element) {
            element.style.fontWeight = weight;
        });
    });

    onSelected(input.padding, 'input', function (component) {
        component.style.padding = input.padding.value + 'px';
    });

    onSelected(input.margin, 'input', function (component) {
        component.style.margin = input.margin.value + 'px';
    });

    onSelected(input.width, 'input', function (component) {
        component.style.width = input.width.value + '%';
        component.style.maxWidth = '100%';
        component.style.boxSizing = 'border-box';
    });

    onSelected(input.height, 'input', function (component) {
        const height = Number(input.height.value);

        if (height === 0) {
            component.style.removeProperty('height');
            return;
        }

        component.style.height = height + 'px';
        component.style.boxSizing = 'border-box';
    });


    /* ---------- Tema: cores e tipografia ---------- */

    const scopeSelect = $('#visual-scope');
    const targetSelect = $('#rgb-target');
    const redInput = $('#rgb-red');
    const greenInput = $('#rgb-green');
    const blueInput = $('#rgb-blue');
    const rgbPreview = $('#rgb-preview');
    const rgbValue = $('#rgb-value');

    const fontNameInput = $('#font-family-input');
    const fontUrlInput = $('#font-url-input');
    const fontFileInput = $('#font-file-input');
    const fontPreview = $('#font-preview');

    let loadedFontName = '';
    let uploadedFontUrl = '';

    // Decide se a mudança será individual ou global.
    function getTargets() {
        if (scopeSelect.value === 'all') return allComponents();

        return selected ? [selected] : [];
    }

    function requireTargets() {
        const targets = getTargets();

        if (targets.length === 0) {
            alert('Adicione um componente ou selecione um componente na prévia.');
        }

        return targets;
    }

    function getRgbColor() {
        const channels = [redInput, greenInput, blueInput].map(function (item) {
            const value = Number(item.value);

            if (item.value.trim() === '' || !Number.isFinite(value)) return null;

            return Math.min(255, Math.max(0, Math.round(value)));
        });

        if (channels.includes(null)) return null;

        return 'rgb(' + channels.join(', ') + ')';
    }

    function updateRgbPreview() {
        const color = getRgbColor();

        if (!color) {
            rgbValue.textContent = 'Informe valores de 0 a 255.';
            return;
        }

        rgbPreview.style.backgroundColor = color;
        rgbValue.textContent = color;
    }

    [redInput, greenInput, blueInput].forEach(function (item) {
        item.addEventListener('input', updateRgbPreview);
    });

    function setBackground(targets, color) {
        targets.forEach(function (component) {
            component.style.backgroundColor = color;
        });
    }

    function setTextColor(targets, color) {
        targets.forEach(function (component) {
            treeOf(component).forEach(function (element) {
                element.style.color = color;
            });
        });
    }

    $('#apply-rgb').addEventListener('click', function () {
        const color = getRgbColor();

        if (!color) {
            alert('Preencha os três valores RGB entre 0 e 255.');
            return;
        }

        const targets = requireTargets();

        if (targets.length === 0) return;

        if (targetSelect.value === 'background') {
            setBackground(targets, color);
        } else {
            setTextColor(targets, color);
        }
    });

    input.background.addEventListener('input', function () {
        const targets = getTargets();

        if (targets.length > 0) setBackground(targets, input.background.value);
    });

    function updateFontPreview() {
        const name = fontNameInput.value.trim();

        fontPreview.style.fontFamily = name ? '"' + name + '", sans-serif' : '';
    }

    fontNameInput.addEventListener('input', updateFontPreview);

    $('#load-font-url').addEventListener('click', function () {
        const url = fontUrlInput.value.trim();
        const name = fontNameInput.value.trim();

        if (!url || !name) {
            alert('Informe o nome da fonte e o link da folha CSS.');
            return;
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            alert('Informe um endereço de URL válido.');
            return;
        }

        if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
            alert('O link precisa utilizar HTTP ou HTTPS.');
            return;
        }

        let fontLink = $('#custom-font-stylesheet');

        if (!fontLink) {
            fontLink = document.createElement('link');
            fontLink.id = 'custom-font-stylesheet';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }

        loadedFontName = name;

        fontLink.onload = function () {
            updateFontPreview();
            alert('Folha de estilos carregada. Confira se a fonte está disponível.');
        };

        fontLink.onerror = function () {
            alert('Não foi possível carregar a folha CSS. Verifique o link e a conexão.');
        };

        fontLink.href = parsedUrl.href;
    });

    fontFileInput.addEventListener('change', async function () {
        const file = fontFileInput.files[0];
        const name = fontNameInput.value.trim();

        if (!file) return;

        if (!name) {
            alert('Digite um nome para a fonte antes de carregá-la.');
            fontFileInput.value = '';
            return;
        }

        if (!/\.(ttf|otf|woff2?)$/i.test(file.name)) {
            alert('Formato não suportado. Use TTF, OTF, WOFF ou WOFF2.');
            fontFileInput.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('O arquivo precisa ter no máximo 10 MB.');
            fontFileInput.value = '';
            return;
        }

        const fileUrl = URL.createObjectURL(file);

        try {
            const fontFace = new FontFace(name, 'url("' + fileUrl + '")');

            await fontFace.load();
            document.fonts.add(fontFace);

            if (uploadedFontUrl) URL.revokeObjectURL(uploadedFontUrl);

            uploadedFontUrl = fileUrl;
            loadedFontName = name;

            updateFontPreview();
            alert('Fonte carregada com sucesso!');
        } catch (error) {
            URL.revokeObjectURL(fileUrl);
            console.error('Erro ao carregar a fonte:', error);
            alert('Não foi possível carregar essa fonte. Verifique o arquivo.');
        }
    });

    $('#apply-font').addEventListener('click', function () {
        const name = fontNameInput.value.trim();

        if (!name) {
            alert('Digite o nome da fonte que deseja utilizar.');
            return;
        }

        const targets = requireTargets();

        if (targets.length === 0) return;

        const isLoaded = document.fonts.check('16px "' + name + '"');

        if (!isLoaded && name !== loadedFontName) {
            const useFont = confirm(
                'Não foi possível confirmar se essa fonte está carregada. ' +
                'Deseja aplicá-la mesmo assim? Ela poderá aparecer com uma fonte substituta.'
            );

            if (!useFont) return;
        }

        targets.forEach(function (component) {
            treeOf(component).forEach(function (element) {
                element.style.fontFamily = '"' + name + '", sans-serif';
            });
        });

        updateFontPreview();
    });

    updateRgbPreview();


    /* ---------- Temas prontos ---------- */

    const themeSelect = $('#editor-theme-select');
    const themePreview = $('#editor-theme-preview');

    const themes = {
        elytra: { background: '#0d0b12', text: '#f2edf5', accent: '#ff4fc3', surface: '#171020' },
        purple: { background: '#171020', text: '#f2edf5', accent: '#a855f7', surface: '#271333' },
        pink: { background: '#1b101b', text: '#f2edf5', accent: '#ff4fc3', surface: '#351329' },
        minimal: { background: '#08080c', text: '#f2edf5', accent: '#7b2cbf', surface: '#17131f' }
    };

    themeSelect.addEventListener('change', function () {
        themePreview.dataset.theme = themeSelect.value;
    });

    $('#apply-editor-theme').addEventListener('click', function () {
        const theme = themes[themeSelect.value];

        if (!theme) return;

        canvas.style.backgroundColor = theme.background;
        canvas.style.color = theme.text;

        allComponents().forEach(function (component) {
            const type = component.dataset.type;

            setTextColor([component], theme.text);
            component.style.borderColor = theme.accent;

            if (type === 'header' || type === 'section') {
                component.style.backgroundColor = theme.surface;
            }

            if (type === 'button') {
                contentOf(component).style.background = theme.accent;
            }
        });
    });

    themePreview.dataset.theme = themeSelect.value;


    /* ---------- Abas e camadas ---------- */

    const tabButtons = $$('[data-editor-tab]');
    const panels = $$('[data-editor-panel]');
    const workspaceTitle = $('#editor-workspace-title');
    const layersList = $('#editor-layers-list');

    const tabTitles = {
        components: 'Componentes',
        layers: 'Camadas',
        properties: 'Propriedades',
        themes: 'Personalização do tema',
        preview: 'Prévia do site'
    };

    const typeNames = {
        header: 'Cabeçalho',
        title: 'Título',
        text: 'Texto',
        button: 'Botão',
        section: 'Seção'
    };

    function openTab(tabName) {
        tabButtons.forEach(function (button) {
            const active = button.dataset.editorTab === tabName;

            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });

        panels.forEach(function (panel) {
            panel.hidden = panel.dataset.editorPanel !== tabName;
        });

        workspaceTitle.textContent = tabTitles[tabName] || 'Editor';

        if (tabName === 'layers') updateLayers();
    }

    function layerName(component, index) {
        const name = typeNames[component.dataset.type] || 'Componente';
        const text = component.textContent.trim().replace(/\s+/g, ' ');

        return (index + 1) + '. ' + name + (text ? ' — ' + text.slice(0, 20) : '');
    }

    function updateLayers() {
        const components = allComponents();

        layersList.replaceChildren();

        if (components.length === 0) {
            const empty = document.createElement('p');

            empty.className = 'editor-empty-layers';
            empty.textContent = 'Nenhum componente adicionado.';
            layersList.appendChild(empty);
            return;
        }

        components.forEach(function (component, index) {
            const layer = document.createElement('button');

            layer.type = 'button';
            layer.className = 'editor-layer-item';
            layer.textContent = layerName(component, index);
            layer.classList.toggle('is-active', component === selected);

            layer.addEventListener('click', function () {
                selectComponent(component);
                openTab('properties');
            });

            layersList.appendChild(layer);
        });
    }

    tabButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            openTab(button.dataset.editorTab);
        });
    });

    $('#open-editor-preview').addEventListener('click', function () {
        openTab('preview');
    });


    /* ---------- Histórico: desfazer e refazer ---------- */

    const undoButton = $('#editor-undo');
    const redoButton = $('#editor-redo');
    const MAX_HISTORY = 50;

    let history = [];
    let historyIndex = -1;
    let debounceTimer = null;
    let restoring = false;

    function getSnapshot() {
        const components = allComponents().map(function (component) {
            const clone = component.cloneNode(true);

            clone.classList.remove('is-selected');

            return clone.outerHTML;
        });

        return JSON.stringify({
            components: components,
            canvasStyle: canvas.getAttribute('style')
        });
    }

    function updateButtons() {
        undoButton.disabled = historyIndex <= 0;
        redoButton.disabled = historyIndex >= history.length - 1;
    }

    function saveSnapshot() {
        if (restoring) return;

        const snapshot = getSnapshot();

        if (history[historyIndex] === snapshot) return;

        // Uma nova alteração descarta o histórico futuro.
        history = history.slice(0, historyIndex + 1);
        history.push(snapshot);

        if (history.length > MAX_HISTORY) history.shift();

        historyIndex = history.length - 1;
        updateButtons();
    }

    // Agrupa alterações rápidas (digitação, controles deslizantes).
    function scheduleSave() {
        if (restoring) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            saveSnapshot();
            updateLayers();
        }, 300);
    }

    function restoreSnapshot(snapshot) {
        const state = JSON.parse(snapshot);

        clearTimeout(debounceTimer);
        restoring = true;

        allComponents().forEach(function (component) {
            component.remove();
        });

        if (state.canvasStyle === null) {
            canvas.removeAttribute('style');
        } else {
            canvas.setAttribute('style', state.canvasStyle);
        }

        const template = document.createElement('template');

        template.innerHTML = state.components.join('');
        canvas.appendChild(template.content);

        // Descarta os registros gerados pela restauração.
        observer.takeRecords();
        restoring = false;

        selected = null;
        fields.hidden = true;
        hint.hidden = false;

        refreshEmpty();
        updateLayers();
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

    // Um único observador cuida do histórico e da lista de camadas.
    const observer = new MutationObserver(scheduleSave);

    observer.observe(canvas, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['style']
    });

    undoButton.addEventListener('click', undo);
    redoButton.addEventListener('click', redo);

    document.addEventListener('keydown', function (event) {
        if (!(event.ctrlKey || event.metaKey)) return;

        // Não interfere no desfazer nativo dos campos de texto.
        if (event.target.closest('textarea, input[type="text"], input[type="url"]')) {
            return;
        }

        const key = event.key.toLowerCase();

        if (key === 'z' && !event.shiftKey) {
            event.preventDefault();
            undo();
        } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
            event.preventDefault();
            redo();
        }
    });


    /* ---------- Início ---------- */

    openTab('components');
    updateLayers();
    saveSnapshot();
})();