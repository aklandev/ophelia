class CartDrawer extends HeaderDrawer {
    constructor() {
        super();

        this.summaryElement = this.querySelector('summary');

        this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
            .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

        this.debouncedOnChange = debounce((event) => {
            this.onChange(event);
        }, 300);

        this.addEventListener('change', this.debouncedOnChange.bind(this));
    }
    openMenuDrawer(summaryElement) {
        isElementInViewport(document.querySelector('.section-announcement-bar'))
            ? this.classList.add('announcement-offset')
            : this.classList.remove('announcement-offset');

        document.body.classList.add('overflow-hidden');


        setTimeout(() => {
            this.mainDetailsToggle.classList.add('menu-opening');
            this.mainDetailsToggle.setAttribute('open', '');
        }, 100);
        summaryElement.setAttribute('aria-expanded', true);
        trapFocus(this.mainDetailsToggle, summaryElement);


    }
    closeAllSubmenus() { };
    bindEvents() {
        this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
        this.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
        document.querySelectorAll('form[action="/cart/add"]').forEach(form => form.addEventListener('submit', this.formSubmit.bind(this)))
    }
    formSubmit(e) {
        e.preventDefault();

        document.querySelector('.section-header').classList.remove('shopify-section-header-hidden');

        let body = new FormData(e.target);
        body.append('sections', 'header');

        fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            body: body
        }).then((response) => {
            return response.text();
        }).then(state => {
            const parsedState = JSON.parse(state);

            this.getSectionsToRender().forEach((section => {

                const elementToReplace =
                    document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

                elementToReplace.innerHTML =
                    this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
            }));

            this.querySelector('.header__cart-icon').classList.remove('header__cart-icon--zero');

            this.openMenuDrawer(this.summaryElement);
        }).catch((e) => {
            console.error(e);
            document.getElementById('cart-errors').textContent = e;
            this.openMenuDrawer(this.summaryElement);
        }).finally(() => {
            theme.lazy.init();
        });
    }
    onChange(event) {
        this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
    }
    getSectionsToRender() {
        return [
            {
                id: 'cart-drawer',
                section: 'header',
                selector: '.js-contents',
            },
            {
                id: 'cart-icon-bubble',
                section: 'header',
                selector: '.header__cart-icon__bubble'
            }
        ];
    }
    updateQuantity(line, quantity, name) {
        this.enableLoading(line);

        const body = JSON.stringify({
            line,
            quantity,
            sections: this.getSectionsToRender().map((section) => section.section),
            sections_url: window.location.pathname
        });

        fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
            .then((response) => {
                return response.text();
            })
            .then((state) => {
                const parsedState = JSON.parse(state);

                this.getSectionsToRender().forEach((section => {

                    const elementToReplace =
                        document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

                    elementToReplace.innerHTML =
                        this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
                }));

                if (parsedState.item_count !== 0) {
                    this.querySelector('.header__cart-icon').classList.remove('header__cart-icon--zero');
                    this.updateLiveRegions(line, parsedState.item_count);
                    const lineItem = document.getElementById(`CartItem-${line}`);
                    if (lineItem && lineItem.querySelector(`[name="${name}"]`)) lineItem.querySelector(`[name="${name}"]`).focus();
                } else {
                    this.querySelector('.header__cart-icon').classList.add('header__cart-icon--zero');
                }

                this.disableLoading();
            }).catch((e) => {
                document.getElementById('cart-errors').textContent = window.cartStrings.error;
                this.disableLoading();
            })
            .finally(() => {
                theme.lazy.init();
            });
    }
    updateLiveRegions(line, itemCount) {
        if (this.currentItemCount === itemCount) {
            document.getElementById(`Line-item-error-${line}`)
                .querySelector('.cart-item__error-text')
                .innerHTML = window.cartStrings.quantityError.replace(
                    '[quantity]',
                    document.getElementById(`Quantity-${line}`).value
                );
        }

        this.currentItemCount = itemCount;
        document.getElementById('shopping-cart-line-item-status').setAttribute('aria-hidden', true);

        const cartStatus = document.getElementById('cart-live-region-text');
        cartStatus.setAttribute('aria-hidden', false);

        setTimeout(() => {
            cartStatus.setAttribute('aria-hidden', true);
        }, 1000);
    }
    getSectionInnerHTML(html, selector) {
        return new DOMParser()
            .parseFromString(html, 'text/html')
            .querySelector(selector).innerHTML;
    }
    enableLoading() {
        document.getElementById('cart-drawer').classList.add('cart-drawer--disabled');
        document.activeElement.blur();
        document.getElementById('shopping-cart-line-item-status').setAttribute('aria-hidden', false);
    }
    disableLoading() {
        document.getElementById('cart-drawer').classList.remove('cart-drawer--disabled');
    }
}
customElements.define('cart-drawer', CartDrawer);