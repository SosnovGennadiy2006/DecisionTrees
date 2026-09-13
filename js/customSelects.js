// Базовый класс для всех селектов
class CustomSelect extends EventTarget {
    constructor(id) {
        super();
        this.wrapper = document.getElementById(id);
        this.display = this.wrapper?.querySelector('.select-display');
        this.dropdown = this.wrapper?.querySelector('.select-dropdown');
        this.arrow = this.wrapper?.querySelector('.select-arrow');
        
        if (!this.wrapper || !this.display || !this.dropdown) {
            throw new Error(`Invalid select structure for id: ${id}`);
        }
        
        this.isOpen = false;
    }

    // Статический метод для управления всеми открытыми селектами
    static openSelects = new Set();

    static closeAllExcept(exceptSelect) {
        CustomSelect.openSelects.forEach(select => {
            if (select !== exceptSelect && select.isOpen) {
                select.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        // Закрываем все другие открытые селекты
        CustomSelect.closeAllExcept(this);
        
        this.dropdown.showPopover();
        this.dropdown.classList.add('open');
        if (this.arrow) this.arrow.classList.add('open');
        this.isOpen = true;
        CustomSelect.openSelects.add(this);
    }

    closeDropdown() {
        this.dropdown.hidePopover();
        this.dropdown.classList.remove('open');
        if (this.arrow) this.arrow.classList.remove('open');
        this.isOpen = false;
        CustomSelect.openSelects.delete(this);
    }

    // Общий обработчик для кликов вне селекта
    setupOutsideClick() {
        document.addEventListener('click', (e) => {
            if (this.wrapper && !this.wrapper.contains(e.target)) {
                this.closeDropdown();
            }
        });
    }
}

// ColorSelect с улучшениями
class ColorSelect extends CustomSelect {
    constructor(id, colorPairs) {
        super(id);

        this.selectedSquares = this.wrapper.querySelector('.selected-squares');
        this.addPanel = this.wrapper.querySelector('.add-panel');
        this.color1Input = this.wrapper.querySelector('.color1');
        this.color2Input = this.wrapper.querySelector('.color2');
        this.confirmAddBtn = this.wrapper.querySelector('.confirm-add-btn');
        this.closeAddBtn = this.wrapper.querySelector('.close-add-btn');
        
        this.colorPairs = colorPairs || [];
        this.nextId = this.colorPairs.length > 0 
            ? Math.max(...this.colorPairs.map(p => p.id)) + 1 
            : 0;
        this.selectedIndex = 0;

        this.init();
    }

    renderDropdown() {
        this.dropdown.innerHTML = '';

        // Рендерим опции
        this.colorPairs.forEach((pair, index) => {
            const option = this.createOptionElement(pair, index);
            this.dropdown.appendChild(option);
        });

        // Кнопка добавления
        const addBtn = this.createAddButton();
        this.dropdown.appendChild(addBtn);
    }

    createOptionElement(pair, index) {
        const option = document.createElement('div');
        option.className = 'select-option';
        if (index === this.selectedIndex) {
            option.classList.add('active');
        }
        option.dataset.index = index;

        const swatch1 = this.createSwatch(pair.primary, 'swatch-primary');
        const swatch2 = this.createSwatch(pair.secondary, 'swatch-secondary');

        option.appendChild(swatch1);
        option.appendChild(swatch2);

        option.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectOption(parseInt(option.dataset.index));
            this.closeDropdown();
        });

        return option;
    }

    createSwatch(color, className) {
        const swatch = document.createElement('div');
        swatch.className = `swatch ${className}`;
        swatch.style.backgroundColor = color;
        return swatch;
    }

    createAddButton() {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-option-btn';
        addBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 2v28M2 16h28"/>
            </svg>
        `;
        addBtn.type = 'button';
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAddPanel();
        });
        return addBtn;
    }

    toggleAddPanel() {
        const isOpen = this.addPanel.classList.contains('open');
        if (isOpen) {
            this.addPanel.classList.remove('open');
            this.addPanel.hidePopover();
        } else {
            this.closeDropdown(); // Закрываем дропдаун при открытии панели добавления
            this.addPanel.classList.add('open');
            this.addPanel.showPopover();
            this.color1Input?.focus();
        }
    }

    selectOption(index) {
        if (index < 0 || index >= this.colorPairs.length) return;
        
        this.selectedIndex = index;
        const pair = this.colorPairs[index];

        this.updateDisplay(pair);
        this.updateActiveOption(index);
        
        this.dispatchEvent(new CustomEvent("colorsChanged", {
            detail: { colors: pair }
        }));
    }

    updateDisplay(pair) {
        this.selectedSquares.innerHTML = '';
        const sw1 = this.createSwatch(pair.primary, 'swatch-primary');
        const sw2 = this.createSwatch(pair.secondary, 'swatch-secondary');
        this.selectedSquares.appendChild(sw1);
        this.selectedSquares.appendChild(sw2);
    }

    updateActiveOption(index) {
        const options = this.dropdown.querySelectorAll('.select-option');
        options.forEach((opt, idx) => {
            opt.classList.toggle('active', idx === index);
        });
    }

    addNewPair() {
        const primary = this.color1Input?.value?.trim();
        const secondary = this.color2Input?.value?.trim();

        if (!primary || !secondary) {
            console.warn('Both colors are required');
            return;
        }

        const newPair = {
            id: this.nextId++,
            primary: primary,
            secondary: secondary
        };

        this.colorPairs.push(newPair);
        this.renderDropdown();
        this.selectOption(this.colorPairs.length - 1);
        this.addPanel.classList.remove('open');
        this.closeDropdown();
        
        // Очищаем поля ввода
        if (this.color1Input) this.color1Input.value = '';
        if (this.color2Input) this.color2Input.value = '';
    }

    init() {
        this.renderDropdown();
        if (this.colorPairs.length > 0) {
            this.selectOption(0);
        }

        // Открытие/закрытие дропдауна
        this.display.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.addPanel?.classList.contains('open')) {
                this.addPanel.classList.remove('open');
            }
            this.toggleDropdown();
        });

        // Закрытие при клике вне
        this.setupOutsideClick();

        // Кнопки добавления
        this.confirmAddBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.addNewPair();
        });

        this.closeAddBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.addPanel?.classList.remove('open');
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
                this.addPanel?.classList.remove('open');
            }
        });
    }
}

// IconSelect с улучшениями
class IconSelect extends CustomSelect {
    constructor(id, options = []) {
        super(id);

        this.selectIcon = this.wrapper?.querySelector('.select-icon');
        this.selectText = this.wrapper?.querySelector('.select-text');
        this.options = options;

        this.init();
    }

    updateValue(val, svg) {
        if (this.selectText) this.selectText.innerText = val;
        if (this.selectIcon) this.selectIcon.innerHTML = svg;
    }

    init() {
        const options = this.wrapper?.querySelectorAll('.select-option');
        
        if (options) {
            options.forEach((opt) => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();

                    const textEl = opt.querySelector('.select-option-text');
                    const svgEl = opt.querySelector('svg');
                    
                    if (textEl && svgEl) {
                        const val = textEl.innerText;
                        const svg = svgEl.innerHTML;
                        this.updateValue(val, svg);

                        this.dispatchEvent(new CustomEvent("valueChanged", {
                            detail: { value: val }
                        }));
                    }
                    
                    this.closeDropdown();
                });
            });
        }

        // Открытие/закрытие дропдауна
        this.display?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Закрытие при клике вне
        this.setupOutsideClick();

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }
}

class GridSelect extends CustomSelect {
    constructor(id, options = []) {
        super(id);

        this.selectIcon = this.wrapper?.querySelector('.select-icon');
        this.selectText = this.wrapper?.querySelector('.select-text');
        this.drawButton = this.wrapper?.querySelector('.draw-button');
        this.options = options;

        this.init();
    }
    

    updateValue(val, svg) {
        if (this.selectText) this.selectText.innerText = val;
        if (this.selectIcon) {
            this.selectIcon.innerHTML = svg;
            if (svg != '') {
                if (this.selectIcon?.classList.contains('hidden'))
                    this.selectIcon?.classList.remove('hidden');
            } else {
                this.selectIcon?.classList.add('hidden');
            }
        }
    }

    makeDrawable() {
        this.updateValue("Нарисовать", '');
        this.closeDropdown();
    }

    init() {
        const options = this.wrapper?.querySelectorAll('.select-option');
        
        if (options) {
            options.forEach((opt) => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();

                    const textEl = opt.querySelector('.select-option-text');
                    const svgEl = opt.querySelector('svg');
                    
                    if (textEl && svgEl) {
                        const val = textEl.innerText;
                        const svg = svgEl.innerHTML;
                        this.updateValue(val, svg);

                        this.dispatchEvent(new CustomEvent("valueChanged", {
                            detail: { value: val }
                        }));
                    }
                    
                    this.closeDropdown();
                });
            });
        }

        // Открытие/закрытие дропдауна
        this.display?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        this.drawButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.makeDrawable();
            this.closeDropdown();

            this.dispatchEvent(new CustomEvent("buttonClicked", {}));
        });

        // Закрытие при клике вне
        this.setupOutsideClick();

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }
}