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
   ACESSIBILIDADE (painel #a11y)
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
    const deviceFrame = $('#editor-device-frame');
    const deviceBtns = $$('.editor-device-btn');
    const insertBanner = $('#insert-target-banner');
    const insertTargetName = $('#insert-target-name');

    const input = {
        containerControls: $('#container-controls'),
        sectionTitleControl: $('#section-title-control'),
        sectionTitleLabel: $('#section-title-label'),
        sectionTitle: $('#component-section-title'),
        extraFieldControl: $('#extra-field-control'),
        extraFieldLabel: $('#extra-field-label'),
        extraField: $('#component-extra-field'),
        contentFieldControl: $('#content-field-control'),
        contentFieldLabel: $('#content-field-label'),
        content: $('#component-content'),
        btnTextControl: $('#btn-text-control'),
        btnText: $('#component-btn-text'),
        imageControls: $('#image-controls'),
        imageFile: $('#component-image-file'),
        imageUrl: $('#component-image-url'),
        parentSelect: $('#parent-container-select'),
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
    const gridColsButtons = $$('.grid-cols-btn');
    const defaultColor = '#f2edf5';

    let selected = null;
    let insertTargetContainer = null; // .editor-component container onde novos blocos serão inseridos
    let idCounter = 1;


    /* ---------- Alternador Celular / Computador ---------- */

    function setDeviceMode(mode) {
        if (!deviceFrame) return;
        const isDesktop = mode === 'desktop';
        deviceFrame.classList.toggle('is-desktop', isDesktop);
        deviceBtns.forEach(function (btn) {
            btn.classList.toggle('is-active', btn.dataset.device === mode);
        });
    }

    deviceBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            setDeviceMode(btn.dataset.device);
        });
    });


    /* ---------- Funções auxiliares ---------- */

    function ensureComponentId(component) {
        if (!component.dataset.cid) {
            component.dataset.cid = 'c' + (idCounter++) + '_' + Math.random().toString(36).slice(2, 6);
        }
        component.draggable = true;
        return component.dataset.cid;
    }

    function contentOf(component) {
        return $(':scope > [data-content]', component) || $('[data-content]', component);
    }

    function titleOf(component) {
        return $(':scope > [data-title]', component) || $(':scope > h2', component) || $(':scope > h3', component);
    }

    function extraOf(component) {
        return $(':scope > [data-extra]', component);
    }

    function btnOf(component) {
        return $(':scope > [data-btn]', component);
    }

    function innerListOf(component) {
        return $(':scope > .editor-inner-list', component);
    }

    function isContainerComponent(component) {
        return !!innerListOf(component);
    }

    // O componente e seus elementos próprios (sem invadir filhos aninhados).
    function treeOf(component) {
        const inner = innerListOf(component);
        return [component].concat($$('*', component).filter(function (el) {
            return !inner || !inner.contains(el);
        }));
    }

    function allComponents() {
        return $$(':scope > .editor-component', canvas);
    }

    function allComponentsDeep() {
        return $$('.editor-component', canvas);
    }

    function allContainers() {
        return allComponentsDeep().filter(isContainerComponent);
    }

    function refreshEmpty() {
        emptyMessage.hidden = allComponents().length > 0;
    }

    function rgbToHex(color) {
        if (!color) return defaultColor;
        if (color.startsWith('#')) return color;

        const values = color.match(/\d+/g);

        if (!values || values.length < 3) return defaultColor;

        return '#' + values.slice(0, 3).map(function (value) {
            return Number(value).toString(16).padStart(2, '0');
        }).join('');
    }

    function onSelected(element, eventName, callback) {
        if (!element) return;
        element.addEventListener(eventName, function (event) {
            if (selected) callback(selected, event);
        });
    }

    function setInsertTarget(containerComponent) {
        allComponentsDeep().forEach(function (c) {
            c.classList.remove('is-insert-target');
        });

        if (containerComponent && isContainerComponent(containerComponent) && canvas.contains(containerComponent)) {
            insertTargetContainer = containerComponent;
            containerComponent.classList.add('is-insert-target');
            if (insertBanner && insertTargetName) {
                const t = titleOf(containerComponent)?.textContent.trim() || typeNames[containerComponent.dataset.type] || 'Seção';
                insertTargetName.textContent = t;
                insertBanner.hidden = false;
            }
        } else {
            insertTargetContainer = null;
            if (insertBanner) insertBanner.hidden = true;
        }
    }

    $('#clear-insert-target')?.addEventListener('click', function () {
        setInsertTarget(null);
    });


    /* ---------- Criação de componentes ---------- */

    const DEFAULT_IMAGE_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#271333"/><stop offset="100%" stop-color="#351329"/></linearGradient></defs>' +
        '<rect width="600" height="320" fill="url(#g)"/>' +
        '<circle cx="300" cy="135" r="36" fill="none" stroke="#ff4fc3" stroke-width="3"/>' +
        '<path d="M220 230 L275 175 L320 215 L355 185 L400 230 Z" fill="none" stroke="#a855f7" stroke-width="3"/>' +
        '<text x="300" y="275" text-anchor="middle" fill="#f2edf5" font-family="sans-serif" font-size="16">Sua Imagem / Banner Aqui</text>' +
        '</svg>'
    );

    function createAddInsideChip() {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'editor-add-inside-chip';
        chip.innerHTML = '<i class="ph ph-plus-circle"></i> Adicionar bloco aqui dentro';
        return chip;
    }

    function createContainerSection(cols, titleText, descText) {
        const component = document.createElement('div');
        component.className = 'editor-component editor-preview-section';
        component.dataset.type = cols === 2 ? 'columns2' : (cols === 3 ? 'columns3' : 'section');
        ensureComponentId(component);

        const sectionTitle = document.createElement('h2');
        sectionTitle.dataset.title = '';
        sectionTitle.textContent = titleText;
        component.appendChild(sectionTitle);

        const content = document.createElement('p');
        content.dataset.content = '';
        content.textContent = descText;
        component.appendChild(content);

        const innerList = document.createElement('div');
        innerList.className = 'editor-inner-list';
        innerList.dataset.cols = String(cols || 1);
        component.appendChild(innerList);

        component.appendChild(createAddInsideChip());
        return component;
    }

    function createComponent(type) {
        const component = document.createElement('div');
        let content;

        component.className = 'editor-component';
        component.dataset.type = type;
        ensureComponentId(component);

        switch (type) {
            case 'header': {
                component.classList.add('editor-preview-header');
                const brand = document.createElement('div');
                brand.dataset.title = '';
                brand.textContent = 'MINHA MARCA';
                component.appendChild(brand);

                content = document.createElement('div');
                content.className = 'editor-header-links';
                content.dataset.content = '';
                content.textContent = 'Início   |   Serviços   |   Contato';
                component.appendChild(content);
                return component;
            }

            case 'title':
                content = document.createElement('h2');
                content.textContent = 'Meu novo título de destaque';
                break;

            case 'text':
                content = document.createElement('p');
                content.textContent = 'Escreva seu texto explicativo aqui.';
                break;

            case 'button':
                content = document.createElement('button');
                content.type = 'button';
                content.className = 'editor-preview-cta';
                content.textContent = 'Fale conosco no WhatsApp';
                break;

            case 'image': {
                component.classList.add('editor-preview-image');
                const img = document.createElement('img');
                img.dataset.img = '';
                img.src = DEFAULT_IMAGE_SVG;
                img.alt = 'Imagem da prévia';
                component.appendChild(img);

                content = document.createElement('p');
                content.textContent = 'Legenda da imagem (opcional)';
                break;
            }

            case 'card': {
                component.classList.add('editor-preview-card');
                const badge = document.createElement('span');
                badge.className = 'editor-card-badge';
                badge.dataset.extra = '';
                badge.textContent = 'R$ 99,00';
                component.appendChild(badge);

                const h3 = document.createElement('h3');
                h3.dataset.title = '';
                h3.textContent = 'Nome do Serviço ou Produto';
                component.appendChild(h3);

                content = document.createElement('p');
                content.dataset.content = '';
                content.textContent = 'Descrição rápida dos benefícios incluídos neste pacote.';
                component.appendChild(content);

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'editor-preview-cta';
                btn.dataset.btn = '';
                btn.textContent = 'Quero este';
                component.appendChild(btn);
                return component;
            }

            case 'testimonial': {
                component.classList.add('editor-preview-testimonial');
                const stars = document.createElement('div');
                stars.className = 'editor-testimonial-stars';
                stars.dataset.extra = '';
                stars.textContent = '★★★★★';
                component.appendChild(stars);

                content = document.createElement('p');
                content.dataset.content = '';
                content.textContent = '"Excelente atendimento! Superou todas as minhas expectativas e entregou no prazo."';
                component.appendChild(content);

                const author = document.createElement('div');
                author.className = 'editor-testimonial-author';
                author.dataset.title = '';
                author.textContent = '— Cliente Satisfeito';
                component.appendChild(author);
                return component;
            }

            case 'form': {
                component.classList.add('editor-preview-form');
                const h3 = document.createElement('h3');
                h3.dataset.title = '';
                h3.textContent = 'Solicite um Orçamento';
                component.appendChild(h3);

                content = document.createElement('p');
                content.dataset.content = '';
                content.textContent = 'Preencha seus dados e entraremos em contato rapidamente:';
                component.appendChild(content);

                ['Seu nome completo', 'Seu WhatsApp com DDD', 'Como podemos ajudar?'].forEach(function (placeholder) {
                    const fake = document.createElement('div');
                    fake.className = 'editor-fake-input';
                    fake.textContent = placeholder;
                    component.appendChild(fake);
                });

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'editor-preview-cta';
                btn.dataset.btn = '';
                btn.textContent = 'Enviar mensagem';
                component.appendChild(btn);
                return component;
            }

            case 'footer':
                component.classList.add('editor-preview-footer');
                content = document.createElement('p');
                content.textContent = '© 2026 Minha Empresa • Todos os direitos reservados • WhatsApp (00) 00000-0000';
                break;

            case 'section':
                return createContainerSection(1, 'Título da Seção', 'Você pode colocar cards, textos, fotos e botões aqui dentro.');

            case 'columns2': {
                const sec2 = createContainerSection(2, 'Seção com 2 Colunas Lado a Lado', 'Os blocos abaixo ficam posicionados um ao lado do outro:');
                const list2 = innerListOf(sec2);
                const c1 = createComponent('card');
                titleOf(c1).textContent = 'Opção 1';
                extraOf(c1).textContent = 'Destaque';
                const c2 = createComponent('card');
                titleOf(c2).textContent = 'Opção 2';
                extraOf(c2).textContent = 'Novo';
                list2.appendChild(c1);
                list2.appendChild(c2);
                return sec2;
            }

            case 'columns3': {
                const sec3 = createContainerSection(3, 'Nossos Planos e Serviços', 'Compare as opções lado a lado:');
                const list3 = innerListOf(sec3);
                [
                    { title: 'Plano Básico', price: 'R$ 97', desc: 'Ideal para quem está começando agora.' },
                    { title: 'Plano Profissional', price: 'R$ 197', desc: 'O mais escolhido pelos nossos clientes.' },
                    { title: 'Plano Completo', price: 'R$ 297', desc: 'Solução completa com atendimento VIP.' }
                ].forEach(function (item) {
                    const card = createComponent('card');
                    titleOf(card).textContent = item.title;
                    extraOf(card).textContent = item.price;
                    contentOf(card).textContent = item.desc;
                    list3.appendChild(card);
                });
                return sec3;
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

        // Se adicionou 2 ou 3 colunas, muda para visualização Desktop para ver melhor lado a lado
        if (type === 'columns2' || type === 'columns3') {
            setDeviceMode('desktop');
        }

        // Evita colocar um container gigante dentro de outro se não for intencional
        const targetList = insertTargetContainer && !isContainerComponent(component)
            ? innerListOf(insertTargetContainer)
            : null;

        if (targetList) {
            targetList.appendChild(component);
        } else {
            canvas.appendChild(component);
        }

        refreshEmpty();
        selectComponent(component);
        component.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function loadStarterTemplate() {
        if (allComponents().length > 0) {
            const confirmar = confirm('Isso substituirá os blocos atuais por um site completo de exemplo pronto para editar. Deseja continuar?');
            if (!confirmar) return;
        }

        allComponents().forEach(function (component) {
            component.remove();
        });
        setInsertTarget(null);
        setDeviceMode('desktop');

        const header = createComponent('header');
        titleOf(header).textContent = 'MINHA EMPRESA';
        contentOf(header).textContent = 'Início   |   Serviços   |   Depoimentos   |   Contato';
        canvas.appendChild(header);

        const heroSection = createContainerSection(2, 'Transformamos sua ideia em realidade', 'Atendimento rápido, qualidade garantida e foco total em resultados para você.');
        const heroInner = innerListOf(heroSection);
        const heroImg = createComponent('image');
        contentOf(heroImg).textContent = 'Foto de destaque da sua empresa ou produto';
        const heroCard = createComponent('card');
        extraOf(heroCard).textContent = 'Atendimento Imediato';
        titleOf(heroCard).textContent = 'Fale com um Especialista';
        contentOf(heroCard).textContent = 'Tire suas dúvidas e receba um orçamento personalizado direto no seu WhatsApp.';
        btnOf(heroCard).textContent = 'Chamar no WhatsApp';
        heroInner.appendChild(heroImg);
        heroInner.appendChild(heroCard);
        canvas.appendChild(heroSection);

        const cols3 = createComponent('columns3');
        canvas.appendChild(cols3);

        const testimonial = createComponent('testimonial');
        canvas.appendChild(testimonial);

        const footer = createComponent('footer');
        canvas.appendChild(footer);

        refreshEmpty();
        selectComponent(header);
        openTab('properties');
    }

    $('#load-starter-template')?.addEventListener('click', loadStarterTemplate);
    $('#empty-starter-btn')?.addEventListener('click', loadStarterTemplate);


    /* ---------- Seleção e Controles Contextuais ---------- */

    function updateParentContainerSelect(component) {
        if (!input.parentSelect) return;
        input.parentSelect.replaceChildren();

        const rootOpt = document.createElement('option');
        rootOpt.value = 'root';
        rootOpt.textContent = 'Página principal (Fora de caixas)';
        input.parentSelect.appendChild(rootOpt);

        allContainers().forEach(function (container, idx) {
            if (container === component || component.contains(container)) return;
            const cid = ensureComponentId(container);
            const opt = document.createElement('option');
            opt.value = cid;
            const label = titleOf(container)?.textContent.trim() || typeNames[container.dataset.type] || 'Seção';
            opt.textContent = 'Dentro de: ' + (idx + 1) + '. ' + label.slice(0, 28);
            input.parentSelect.appendChild(opt);
        });

        const parentComp = component.parentElement?.closest('.editor-component');
        input.parentSelect.value = parentComp ? ensureComponentId(parentComp) : 'root';
    }

    function selectComponent(component) {
        if (selected) selected.classList.remove('is-selected');

        selected = component;
        ensureComponentId(component);
        selected.classList.add('is-selected');

        const type = component.dataset.type;
        const content = contentOf(component);
        const titleEl = titleOf(component);
        const extraEl = extraOf(component);
        const btnEl = btnOf(component);
        const innerList = innerListOf(component);

        const styles = getComputedStyle(component);
        const contentStyles = content ? getComputedStyle(content) : styles;

        // Controles de Container (Seção / Colunas)
        if (input.containerControls) {
            const isCont = !!innerList;
            input.containerControls.hidden = !isCont;
            if (isCont) {
                const cols = innerList.dataset.cols || '1';
                gridColsButtons.forEach(function (b) {
                    b.classList.toggle('is-active', b.dataset.cols === cols);
                });
            }
        }

        // Campo de Título / Marca / Autor
        if (input.sectionTitleControl && input.sectionTitle) {
            const hasTitle = !!titleEl;
            input.sectionTitleControl.hidden = !hasTitle;
            if (hasTitle) {
                if (input.sectionTitleLabel) {
                    input.sectionTitleLabel.textContent =
                        type === 'header' ? 'Nome da marca / empresa' :
                        type === 'testimonial' ? 'Nome do cliente' :
                        type === 'card' ? 'Título do card' : 'Título da seção';
                }
                input.sectionTitle.value = titleEl.textContent || '';
            }
        }

        // Campo Extra (Preço do card / Estrelas do depoimento)
        if (input.extraFieldControl && input.extraField) {
            const hasExtra = !!extraEl;
            input.extraFieldControl.hidden = !hasExtra;
            if (hasExtra) {
                if (input.extraFieldLabel) {
                    input.extraFieldLabel.textContent =
                        type === 'testimonial' ? 'Estrelas / Nota' : 'Preço ou Destaque (Ex: R$ 99)';
                }
                input.extraField.value = extraEl.textContent || '';
            }
        }

        // Campo principal de texto
        if (input.contentFieldControl && input.content) {
            const hasContent = !!content;
            input.contentFieldControl.hidden = !hasContent;
            if (hasContent) {
                if (input.contentFieldLabel) {
                    input.contentFieldLabel.textContent =
                        type === 'header' ? 'Links do menu (separados por |)' :
                        type === 'image' ? 'Legenda da imagem' :
                        isContainerComponent(component) ? 'Subtítulo / Descrição da seção' : 'Texto do bloco';
                }
                input.content.value = content.textContent || '';
            }
        }

        // Campo de texto do botão interno (para Card e Formulário)
        if (input.btnTextControl && input.btnText) {
            const hasBtn = !!btnEl;
            input.btnTextControl.hidden = !hasBtn;
            if (hasBtn) {
                input.btnText.value = btnEl.textContent || '';
            }
        }

        // Controles de Imagem
        if (input.imageControls) {
            const isImg = type === 'image';
            input.imageControls.hidden = !isImg;
            if (isImg && input.imageUrl) {
                const imgEl = $('[data-img]', component);
                const src = imgEl?.getAttribute('src') || '';
                input.imageUrl.value = src.startsWith('data:') ? '' : src;
            }
        }

        updateParentContainerSelect(component);

        input.color.value = rgbToHex(contentStyles.color);
        input.fontSize.value = parseInt(styles.fontSize, 10) || 18;
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
        const chip = event.target.closest('.editor-add-inside-chip');
        if (chip) {
            event.stopPropagation();
            const container = chip.closest('.editor-component');
            if (container) {
                setInsertTarget(container);
                openTab('components');
            }
            return;
        }

        const component = event.target.closest('.editor-component');

        if (component && canvas.contains(component)) {
            event.stopPropagation();
            selectComponent(component);
            openTab('properties');
        }
    });

    /* ---------- Arrastar e Soltar Blocos (Drag and Drop) ---------- */

    let draggedComponent = null;

    canvas.addEventListener('dragstart', function (event) {
        const component = event.target.closest('.editor-component');
        if (!component || !canvas.contains(component)) return;
        event.stopPropagation();
        draggedComponent = component;
        component.classList.add('is-dragging');
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', ensureComponentId(component));
        }
    });

    canvas.addEventListener('dragover', function (event) {
        if (!draggedComponent) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

        allComponentsDeep().forEach(function (c) {
            c.classList.remove('is-drag-over');
        });

        const overComp = event.target.closest('.editor-component');
        if (overComp && overComp !== draggedComponent && !draggedComponent.contains(overComp)) {
            overComp.classList.add('is-drag-over');
        }
    });

    canvas.addEventListener('dragleave', function (event) {
        const overComp = event.target.closest('.editor-component');
        if (overComp && !overComp.contains(event.relatedTarget)) {
            overComp.classList.remove('is-drag-over');
        }
    });

    canvas.addEventListener('drop', function (event) {
        if (!draggedComponent) return;
        event.preventDefault();
        event.stopPropagation();

        const overComp = event.target.closest('.editor-component');
        allComponentsDeep().forEach(function (c) {
            c.classList.remove('is-drag-over', 'is-dragging');
        });

        if (!overComp) {
            canvas.appendChild(draggedComponent);
        } else if (overComp !== draggedComponent && !draggedComponent.contains(overComp)) {
            const inner = innerListOf(overComp);
            const droppedInsideList = event.target.closest('.editor-inner-list') === inner;

            if (inner && droppedInsideList && !isContainerComponent(draggedComponent)) {
                inner.appendChild(draggedComponent);
            } else if (overComp.parentElement) {
                const rect = overComp.getBoundingClientRect();
                const after = (event.clientY - rect.top) > (rect.height / 2);
                if (after) {
                    overComp.parentElement.insertBefore(draggedComponent, overComp.nextSibling);
                } else {
                    overComp.parentElement.insertBefore(draggedComponent, overComp);
                }
            }
        }

        const moved = draggedComponent;
        draggedComponent = null;
        selectComponent(moved);
        updateLayers();
        scheduleSave();
    });

    canvas.addEventListener('dragend', function () {
        allComponentsDeep().forEach(function (c) {
            c.classList.remove('is-drag-over', 'is-dragging');
        });
        draggedComponent = null;
    });

    $('#add-inside-selected-btn')?.addEventListener('click', function () {
        if (selected && isContainerComponent(selected)) {
            setInsertTarget(selected);
            openTab('components');
        }
    });

    gridColsButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!selected) return;
            const inner = innerListOf(selected);
            if (!inner) return;
            inner.dataset.cols = btn.dataset.cols;
            if (btn.dataset.cols === '2' || btn.dataset.cols === '3') {
                setDeviceMode('desktop');
            }
            gridColsButtons.forEach(function (b) {
                b.classList.toggle('is-active', b === btn);
            });
            scheduleSave();
        });
    });

    input.parentSelect?.addEventListener('change', function () {
        if (!selected) return;
        const val = input.parentSelect.value;
        if (val === 'root') {
            canvas.appendChild(selected);
        } else {
            const targetContainer = allContainers().find(function (c) {
                return ensureComponentId(c) === val;
            });
            const list = targetContainer ? innerListOf(targetContainer) : null;
            if (list) list.appendChild(selected);
        }
        updateLayers();
        scheduleSave();
    });

    $$('[data-add]').forEach(function (button) {
        button.addEventListener('click', function () {
            addComponent(button.dataset.add);
        });
    });

    $('#move-up-component')?.addEventListener('click', function () {
        if (!selected) return;
        const parent = selected.parentElement;
        const prev = selected.previousElementSibling;
        if (parent && prev && prev.classList.contains('editor-component')) {
            parent.insertBefore(selected, prev);
            updateLayers();
        }
    });

    $('#move-down-component')?.addEventListener('click', function () {
        if (!selected) return;
        const parent = selected.parentElement;
        const next = selected.nextElementSibling;
        if (parent && next && next.classList.contains('editor-component')) {
            parent.insertBefore(next, selected);
            updateLayers();
        }
    });

    $('#remove-component').addEventListener('click', function () {
        if (!selected) return;

        if (insertTargetContainer === selected) {
            setInsertTarget(null);
        }
        selected.remove();
        deselect();
        refreshEmpty();
    });

    $('#clear-preview').addEventListener('click', function () {
        allComponents().forEach(function (component) {
            component.remove();
        });

        setInsertTarget(null);
        deselect();
        refreshEmpty();
    });


    /* ---------- Propriedades do componente ---------- */

    onSelected(input.sectionTitle, 'input', function (component) {
        const t = titleOf(component);
        if (t) t.textContent = input.sectionTitle.value;
    });

    onSelected(input.extraField, 'input', function (component) {
        const ex = extraOf(component);
        if (ex) ex.textContent = input.extraField.value;
    });

    onSelected(input.content, 'input', function (component) {
        const c = contentOf(component);
        if (c) c.textContent = input.content.value;
    });

    onSelected(input.btnText, 'input', function (component) {
        const b = btnOf(component);
        if (b) b.textContent = input.btnText.value;
    });

    // Upload e link de imagem para o bloco de Imagem
    input.imageUrl?.addEventListener('input', function () {
        if (!selected || selected.dataset.type !== 'image') return;
        const imgEl = $('[data-img]', selected);
        const url = input.imageUrl.value.trim();
        if (imgEl && url) {
            imgEl.src = url;
            scheduleSave();
        }
    });

    input.imageFile?.addEventListener('change', function () {
        if (!selected || selected.dataset.type !== 'image') return;
        const file = input.imageFile.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function () {
            const img = new Image();
            img.onload = function () {
                const maxW = 700;
                const scale = Math.min(1, maxW / img.width);
                const cv = document.createElement('canvas');
                cv.width = Math.round(img.width * scale);
                cv.height = Math.round(img.height * scale);
                cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
                const dataUrl = cv.toDataURL('image/jpeg', 0.82);
                const imgEl = $('[data-img]', selected);
                if (imgEl) {
                    imgEl.src = dataUrl;
                    scheduleSave();
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });

    onSelected(input.color, 'input', function (component) {
        treeOf(component).forEach(function (element) {
            element.style.color = input.color.value;
        });
    });

    alignButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            if (!selected) {
                alert('Selecione um bloco da prévia primeiro.');
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
            component.style.removeProperty('min-height');
            component.style.removeProperty('height');
            return;
        }

        component.style.minHeight = height + 'px';
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
        if (scopeSelect.value === 'all') return allComponentsDeep();

        return selected ? [selected] : [];
    }

    function requireTargets() {
        const targets = getTargets();

        if (targets.length === 0) {
            alert('Adicione um bloco ou selecione um bloco na prévia.');
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

        allComponentsDeep().forEach(function (component) {
            const type = component.dataset.type;

            setTextColor([component], theme.text);
            component.style.borderColor = theme.accent;

            if (type === 'header' || type === 'section' || type === 'columns2' || type === 'columns3' || type === 'card' || type === 'form') {
                component.style.backgroundColor = theme.surface;
            }

            if (type === 'button') {
                contentOf(component).style.background = theme.accent;
            }

            const internalBtn = btnOf(component);
            if (internalBtn) {
                internalBtn.style.background = theme.accent;
            }
        });
    });

    themePreview.dataset.theme = themeSelect.value;


    /* ---------- Abas e camadas ---------- */

    const tabButtons = $$('[data-editor-tab]');
    const stepCards = $$('[data-step-tab]');
    const panels = $$('[data-editor-panel]');
    const workspaceTitle = $('#editor-workspace-title');
    const layersList = $('#editor-layers-list');

    const tabTitles = {
        components: '1. Adicionar Blocos',
        properties: '2. Editar Bloco',
        themes: '3. Cores e Tema',
        layers: 'Camadas (Ordem dos blocos)',
        preview: '4. Finalizar e Enviar'
    };

    const typeNames = {
        header: 'Cabeçalho',
        columns2: '2 Colunas Lado a Lado',
        columns3: '3 Colunas Lado a Lado',
        section: 'Seção',
        title: 'Título',
        text: 'Texto',
        image: 'Imagem',
        button: 'Botão',
        card: 'Card de Serviço',
        testimonial: 'Depoimento',
        form: 'Formulário',
        footer: 'Rodapé'
    };

    function openTab(tabName) {
        tabButtons.forEach(function (button) {
            const active = button.dataset.editorTab === tabName;

            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });

        stepCards.forEach(function (card) {
            card.classList.toggle('is-active', card.dataset.stepTab === tabName);
        });

        panels.forEach(function (panel) {
            panel.hidden = panel.dataset.editorPanel !== tabName;
        });

        workspaceTitle.textContent = tabTitles[tabName] || 'Editor';

        if (tabName === 'layers') updateLayers();
    }

    function layerName(component, prefix) {
        const name = typeNames[component.dataset.type] || 'Bloco';
        const title = titleOf(component)?.textContent.trim() || '';
        const text = (title || contentOf(component)?.textContent.trim() || '').replace(/\s+/g, ' ');

        return prefix + ' ' + name + (text ? ' — ' + text.slice(0, 22) : '');
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
            layer.textContent = layerName(component, (index + 1) + '.');
            layer.classList.toggle('is-active', component === selected);

            layer.addEventListener('click', function () {
                selectComponent(component);
                openTab('properties');
            });

            layersList.appendChild(layer);

            const inner = innerListOf(component);
            if (inner) {
                $$(':scope > .editor-component', inner).forEach(function (child, cIdx) {
                    const childLayer = document.createElement('button');
                    childLayer.type = 'button';
                    childLayer.className = 'editor-layer-item is-child';
                    childLayer.textContent = layerName(child, '↳ ' + (index + 1) + '.' + (cIdx + 1));
                    childLayer.classList.toggle('is-active', child === selected);

                    childLayer.addEventListener('click', function () {
                        selectComponent(child);
                        openTab('properties');
                    });

                    layersList.appendChild(childLayer);
                });
            }
        });
    }

    tabButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            openTab(button.dataset.editorTab);
        });
    });

    stepCards.forEach(function (card) {
        card.addEventListener('click', function () {
            openTab(card.dataset.stepTab);
        });
    });

    $('#open-editor-preview')?.addEventListener('click', function () {
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

            clone.classList.remove('is-selected', 'is-insert-target', 'is-dragging', 'is-drag-over');
            $$('.is-selected, .is-insert-target, .is-dragging, .is-drag-over', clone).forEach(function (el) {
                el.classList.remove('is-selected', 'is-insert-target', 'is-dragging', 'is-drag-over');
            });

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
            saveLocalPreview();
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

        allComponentsDeep().forEach(ensureComponentId);

        // Garante que todo container restaurado tenha o botão de adicionar dentro
        allContainers().forEach(function (cont) {
            if (!$(':scope > .editor-add-inside-chip', cont)) {
                cont.appendChild(createAddInsideChip());
            }
        });

        // Descarta os registros gerados pela restauração.
        observer.takeRecords();
        restoring = false;

        selected = null;
        setInsertTarget(null);
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
        attributeFilter: ['style', 'data-cols', 'src']
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


    /* ---------- Salvar, Gerar PDF e Enviar pelo WhatsApp ---------- */

    const WHATSAPP_NUMBER = '5562994569506'; // 55 + DDD (62) + 994569506
    const LOCAL_STORAGE_KEY = 'elytra_previa_salva';
    const saveStatusEl = $('#preview-save-status');

    function showSaveStatus(text) {
        if (!saveStatusEl) return;
        saveStatusEl.textContent = text;
        saveStatusEl.hidden = false;
    }

    function toHex(color) {
        // Fundo transparente = sem cor definida
        if (!color || /rgba\(.*,\s*0\)$/.test(color) || color === 'transparent') {
            return 'padrão';
        }
        return rgbToHex(color).toUpperCase();
    }

    function describeComponentLine(component, labelPrefix, indent) {
        const type = component.dataset.type;
        const content = contentOf(component);
        const titleEl = titleOf(component);
        const extraEl = extraOf(component);
        const btnEl = btnOf(component);
        const inner = innerListOf(component);

        const contentStyle = content ? getComputedStyle(content) : getComputedStyle(component);
        const componentStyle = getComputedStyle(component);

        const parts = [];
        if (extraEl?.textContent.trim()) parts.push(extraEl.textContent.trim());
        if (titleEl?.textContent.trim()) parts.push(titleEl.textContent.trim());
        if (content?.textContent.trim()) parts.push(content.textContent.trim());
        if (btnEl?.textContent.trim()) parts.push('[Botão: ' + btnEl.textContent.trim() + ']');

        const colsInfo = inner ? ' (' + (inner.dataset.cols || '1') + ' col)' : '';
        const font = contentStyle.fontFamily.split(',')[0].replace(/["']/g, '');

        let line = indent + labelPrefix + ' ' + (typeNames[type] || 'Bloco') + colsInfo +
            ': "' + parts.join(' | ') + '"\n' +
            indent + '   Texto ' + toHex(contentStyle.color) +
            ' | Fundo ' + toHex(componentStyle.backgroundColor) +
            ' | ' + parseInt(componentStyle.fontSize, 10) + 'px' +
            ' | ' + font;

        if (inner) {
            const children = $$(':scope > .editor-component', inner);
            children.forEach(function (child, cIdx) {
                line += '\n' + describeComponentLine(child, '↳ ' + labelPrefix + '.' + (cIdx + 1), indent + '   ');
            });
        }

        return line;
    }

    function buildSummary() {
        const components = allComponents();

        const lines = components.map(function (component, index) {
            return describeComponentLine(component, String(index + 1), '');
        });

        return {
            count: components.length,
            text: lines.join('\n'),
            canvasBg: toHex(canvas.style.backgroundColor)
        };
    }

    function getCleanHtml() {
        const clone = canvas.cloneNode(true);

        $$('.is-selected, .is-insert-target, .is-dragging, .is-drag-over', clone).forEach(function (el) {
            el.classList.remove('is-selected', 'is-insert-target', 'is-dragging', 'is-drag-over');
        });

        $$('.editor-add-inside-chip', clone).forEach(function (el) {
            el.remove();
        });

        $('#editor-empty', clone)?.remove();

        return clone.innerHTML;
    }

    function saveLocalPreview() {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, getSnapshot());
        } catch (error) {
            console.error('Não foi possível salvar localmente:', error);
        }
    }

    async function savePreviewEverywhere(summary) {
        saveLocalPreview();

        let previewId = null;

        if (window.salvarPreviaNuvem) {
            try {
                previewId = await window.salvarPreviaNuvem(
                    getCleanHtml(),
                    summary.text,
                    canvas.getAttribute('style')
                );
            } catch (error) {
                console.error('Não foi possível salvar a prévia na nuvem:', error);
            }
        }

        return previewId;
    }

    async function generateAndDownloadPdf(summary, previewId) {
        if (!window.html2pdf) {
            window.print();
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.style.cssText = [
            'padding: 24px',
            'background: #0d0b12',
            'color: #f2edf5',
            'font-family: Inter, sans-serif',
            'width: 740px',
            'box-sizing: border-box'
        ].join(';');

        const headerBox = document.createElement('div');
        headerBox.style.cssText = 'border-bottom: 2px solid #a855f7; padding-bottom: 14px; margin-bottom: 18px;';
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        headerBox.innerHTML =
            '<h1 style="margin:0 0 6px;font-size:22px;color:#ff4fc3;">ELYTRA TECH — Prévia do Site</h1>' +
            '<p style="margin:0;font-size:12px;color:#b5acc1;">Data: ' + dataAtual +
            (previewId ? ' | Código da prévia: <strong>' + previewId + '</strong>' : '') +
            ' | WhatsApp: (62) 99456-9506</p>';
        wrapper.appendChild(headerBox);

        const visualTitle = document.createElement('h2');
        visualTitle.textContent = 'Visualização da Prévia do Site';
        visualTitle.style.cssText = 'font-size:15px;margin:0 0 12px;color:#f2edf5;';
        wrapper.appendChild(visualTitle);

        const siteMock = document.createElement('div');
        const canvasBg = canvas.style.backgroundColor || '#140f1d';
        siteMock.style.cssText = [
            'width: 100%',
            'margin: 0 auto 24px',
            'padding: 18px',
            'border: 2px solid #7b2cbf',
            'border-radius: 16px',
            'box-sizing: border-box',
            'background: ' + canvasBg,
            'color: ' + (canvas.style.color || '#f2edf5')
        ].join(';');
        siteMock.innerHTML = getCleanHtml();
        wrapper.appendChild(siteMock);

        const specTitle = document.createElement('h2');
        specTitle.textContent = 'Resumo dos Blocos e Estilo';
        specTitle.style.cssText = 'font-size:15px;margin:0 0 10px;color:#f2edf5;border-top:1px solid rgba(168,85,247,0.3);padding-top:16px;';
        wrapper.appendChild(specTitle);

        const specPre = document.createElement('pre');
        specPre.style.cssText = [
            'white-space: pre-wrap',
            'word-break: break-word',
            'font-family: Inter, sans-serif',
            'font-size: 11.5px',
            'line-height: 1.55',
            'background: #17131f',
            'padding: 14px',
            'border-radius: 10px',
            'border: 1px solid rgba(168,85,247,0.25)',
            'color: #f2edf5',
            'margin: 0'
        ].join(';');
        specPre.textContent = 'Fundo da página: ' + summary.canvasBg + '\n\n' + summary.text;
        wrapper.appendChild(specPre);

        const opt = {
            margin: 8,
            filename: 'previa-site-elytratech.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0d0b12' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await window.html2pdf().set(opt).from(wrapper).save();
    }

    async function handleDownloadPdf(triggerButton) {
        const summary = buildSummary();

        if (summary.count === 0) {
            alert('Adicione pelo menos um bloco antes de baixar o PDF da prévia.');
            return;
        }

        if (triggerButton) triggerButton.disabled = true;

        try {
            showSaveStatus('Gerando arquivo PDF da sua prévia...');
            const previewId = await savePreviewEverywhere(summary);
            await generateAndDownloadPdf(summary, previewId);
            showSaveStatus('PDF baixado com sucesso! Você já pode anexá-lo no WhatsApp.');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Não foi possível gerar o PDF automaticamente.');
        } finally {
            if (triggerButton) triggerButton.disabled = false;
        }
    }

    async function handleSavePreview() {
        const summary = buildSummary();

        if (summary.count === 0) {
            alert('Adicione pelo menos um bloco antes de salvar a prévia.');
            return;
        }

        const btn = $('#save-preview-btn');
        if (btn) btn.disabled = true;

        try {
            const previewId = await savePreviewEverywhere(summary);

            if (previewId) {
                showSaveStatus('Prévia salva com sucesso! Código: ' + previewId);
            } else {
                showSaveStatus('Prévia salva neste dispositivo com sucesso!');
            }
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    async function handleSendWhatsApp(triggerButton) {
        const summary = buildSummary();

        if (summary.count === 0) {
            alert('Adicione pelo menos um bloco antes de enviar.');
            return;
        }

        if (triggerButton) triggerButton.disabled = true;

        // Abre a aba já no clique para evitar bloqueio de pop-up em celulares
        const win = window.open('', '_blank');

        try {
            showSaveStatus('Salvando prévia e baixando PDF para você anexar no WhatsApp...');
            const previewId = await savePreviewEverywhere(summary);

            try {
                await generateAndDownloadPdf(summary, previewId);
            } catch (pdfErr) {
                console.error('Aviso ao gerar PDF:', pdfErr);
            }

            if (previewId) {
                showSaveStatus('PDF baixado e prévia salva (Código: ' + previewId + ')! Anexe o PDF na conversa do WhatsApp.');
            } else {
                showSaveStatus('PDF baixado e prévia salva! Anexe o PDF na conversa do WhatsApp.');
            }

            let previewLink = '';
            if (previewId && /^https?:$/i.test(window.location.protocol)) {
                const linkUrl = new URL(window.location.href);
                linkUrl.searchParams.set('previa', previewId);
                previewLink = 'Link da prévia salva: ' + linkUrl.href + '\n';
            }

            let message =
                '*Prévia do site – Elytra Tech*\n\n' +
                'Olá! Finalizei a prévia do meu site e gostaria de dar andamento ao projeto.\n' +
                '📎 *Estou enviando em anexo o PDF da prévia que acabei de baixar!*\n\n' +
                (previewId ? 'Código da prévia salva: *' + previewId + '*\n' : '') +
                previewLink +
                'Fundo da página: ' + summary.canvasBg + '\n\n' +
                '*Componentes da prévia:*\n' +
                summary.text;

            // Limite seguro para a URL do WhatsApp
            if (message.length > 1500) {
                message = message.slice(0, 1500) + '\n...(resumo cortado)';
            }

            const url = 'https://wa.me/' + WHATSAPP_NUMBER +
                '?text=' + encodeURIComponent(message);

            if (win) {
                win.location.href = url;
            } else {
                window.location.href = url;
            }
        } finally {
            if (triggerButton) triggerButton.disabled = false;
        }
    }

    $('#download-pdf')?.addEventListener('click', function () {
        handleDownloadPdf(this);
    });

    $('#panel-download-pdf')?.addEventListener('click', function () {
        handleDownloadPdf(this);
    });

    $('#send-whatsapp')?.addEventListener('click', function () {
        handleSendWhatsApp(this);
    });

    $('#finish-whatsapp-btn')?.addEventListener('click', function () {
        handleSendWhatsApp(this);
    });

    $('#save-preview-btn')?.addEventListener('click', handleSavePreview);


    /* ---------- Carregar prévia salva (nuvem ou local) ---------- */

    function applyCloudPreview(data) {
        if (!data || !data.html) return;

        restoring = true;

        allComponents().forEach(function (component) {
            component.remove();
        });

        if (data.canvasStyle) {
            canvas.setAttribute('style', data.canvasStyle);
        } else {
            canvas.removeAttribute('style');
        }

        const template = document.createElement('template');
        template.innerHTML = data.html;
        canvas.appendChild(template.content);

        allContainers().forEach(function (cont) {
            if (!$(':scope > .editor-add-inside-chip', cont)) {
                cont.appendChild(createAddInsideChip());
            }
        });

        observer.takeRecords();
        restoring = false;

        refreshEmpty();
        updateLayers();
        history = [];
        historyIndex = -1;
        saveSnapshot();
    }

    async function initSavedPreview() {
        const params = new URLSearchParams(window.location.search);
        const previaId = params.get('previa');

        if (previaId) {
            const loadFromCloud = async function () {
                try {
                    const data = await window.carregarPreviaNuvem(previaId);
                    if (data) {
                        applyCloudPreview(data);
                        showSaveStatus('Visualizando prévia salva (' + previaId + ').');
                    }
                } catch (error) {
                    console.error('Erro ao carregar prévia da nuvem:', error);
                }
            };

            if (window.carregarPreviaNuvem) {
                await loadFromCloud();
            } else {
                window.addEventListener('previa-nuvem-ready', loadFromCloud, { once: true });
            }
            return;
        }

        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && Array.isArray(parsed.components) && parsed.components.length > 0) {
                    restoreSnapshot(saved);
                    history = [saved];
                    historyIndex = 0;
                    updateButtons();
                }
            }
        } catch (error) {
            console.error('Erro ao restaurar prévia local:', error);
        }
    }

    /* ---------- Início ---------- */

    openTab('components');
    updateLayers();
    saveSnapshot();
    initSavedPreview();
})();


/* =========================================
   ACESSIBILIDADE - ELYTRA TECH
   (painel #btnAcessibilidade)
========================================= */

(function initAcessibilidade() {
    const btnAcessibilidade = $('#btnAcessibilidade');
    const painelAcessibilidade = $('#painelAcessibilidade');

    const aumentarTexto = $('#aumentarTexto');
    const diminuirTexto = $('#diminuirTexto');
    const restaurarAcessibilidade = $('#restaurarAcessibilidade');

    const alternarContraste = $('#alternarContraste');

    const btnTemas = $('#btnTemas');
    const opcoesTemas = $('#opcoesTemas');

    const tipoDaltonismo = $('#tipoDaltonismo');
    const destacarLinks = $('#destacarLinks');

    let escalaTexto = 1;

    const elementosTexto = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'a', 'button', 'li', 'span',
        'label', 'strong', 'em', 'small',
        'input', 'textarea', 'select'
    ].join(', ');


    /* ---------- Abrir e fechar o painel ---------- */

    if (btnAcessibilidade && painelAcessibilidade) {
        btnAcessibilidade.setAttribute('aria-expanded', 'false');

        btnAcessibilidade.addEventListener('click', () => {
            const vaiAbrir = painelAcessibilidade.hidden;

            painelAcessibilidade.hidden = !vaiAbrir;
            btnAcessibilidade.setAttribute('aria-expanded', String(vaiAbrir));
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


    /* ---------- Aumentar e diminuir texto ---------- */

    function aplicarEscalaTexto() {
        document.querySelectorAll(elementosTexto).forEach(elemento => {
            // Não modificar o painel de acessibilidade nem a prévia do editor
            if (
                elemento.closest('.acessibilidade-container') ||
                elemento.closest('#preview-canvas')
            ) {
                return;
            }

            // Guardar os tamanhos originais uma única vez
            if (!elemento.dataset.tamanhoOriginal) {
                elemento.dataset.tamanhoOriginal = getComputedStyle(elemento).fontSize;
                elemento.dataset.estiloOriginal = elemento.style.fontSize;
            }

            const tamanhoOriginal = parseFloat(elemento.dataset.tamanhoOriginal);

            elemento.style.fontSize = `${tamanhoOriginal * escalaTexto}px`;
        });
    }

    if (aumentarTexto) {
        aumentarTexto.addEventListener('click', () => {
            escalaTexto = Math.min(Math.round((escalaTexto + 0.1) * 10) / 10, 1.5);
            aplicarEscalaTexto();
        });
    }

    if (diminuirTexto) {
        diminuirTexto.addEventListener('click', () => {
            escalaTexto = Math.max(Math.round((escalaTexto - 0.1) * 10) / 10, 0.8);
            aplicarEscalaTexto();
        });
    }


    /* ---------- Tema claro e escuro ---------- */

    const opcoesTema = document.querySelectorAll('input[name="tema"]');

    // Abrir e fechar opções de tema
    if (btnTemas && opcoesTemas) {
        btnTemas.addEventListener('click', () => {
            const vaiAbrir = opcoesTemas.hidden;

            opcoesTemas.hidden = !vaiAbrir;
            btnTemas.setAttribute('aria-expanded', String(vaiAbrir));
        });
    }

    // Aplicar tema selecionado
    opcoesTema.forEach(opcao => {
        opcao.addEventListener('change', () => {
            if (!opcao.checked) return;

            document.body.classList.toggle('tema-claro', opcao.value === 'claro');
        });
    });


    /* ---------- Alto contraste ---------- */

    if (alternarContraste) {
        alternarContraste.setAttribute('aria-pressed', 'false');

        alternarContraste.addEventListener('click', () => {
            const ativo = document.body.classList.toggle('alto-contraste');

            alternarContraste.setAttribute('aria-pressed', String(ativo));
        });
    }


    /* ---------- Adaptações para daltonismo ---------- */

    const classesDaltonismo = [
        'daltonismo-protanopia',
        'daltonismo-deuteranopia',
        'daltonismo-tritanopia'
    ];

    function aplicarDaltonismo(tipo) {
        // Remover qualquer adaptação anterior
        document.body.classList.remove(...classesDaltonismo);

        // Só adicionar uma classe quando houver seleção
        if (['protanopia', 'deuteranopia', 'tritanopia'].includes(tipo)) {
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


    /* ---------- Destacar links ---------- */

    if (destacarLinks) {
        destacarLinks.addEventListener('change', () => {
            const ativo = destacarLinks.checked;

            document.body.classList.toggle('links-destacados', ativo);
            destacarLinks.setAttribute('aria-pressed', String(ativo));
        });
    }


    /* ---------- Restaurar configurações padrão ---------- */

    if (restaurarAcessibilidade) {
        restaurarAcessibilidade.addEventListener('click', () => {

            // Restaurar tamanhos do texto
            escalaTexto = 1;

            document.querySelectorAll('[data-tamanho-original]').forEach(elemento => {
                elemento.style.fontSize = elemento.dataset.estiloOriginal || '';

                delete elemento.dataset.tamanhoOriginal;
                delete elemento.dataset.estiloOriginal;
            });

            // Restaurar tema escuro
            document.body.classList.remove('tema-claro');

            const temaEscuro = document.querySelector('input[name="tema"][value="escuro"]');

            if (temaEscuro) temaEscuro.checked = true;

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
})();