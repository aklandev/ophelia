class HeaderDrawer extends MenuDrawer {
    constructor() {
        super();

        this.toggler = this.querySelector('summary');
        this.submenus = this.querySelectorAll('#menu-drawer details');
        this.submenuToggleHandle();
    }

    openMenuDrawer(summaryElement) {
        isElementInViewport(document.querySelector('.section-announcement-bar'))
            ? this.classList.add('announcement-offset')
            : this.classList.remove('announcement-offset');

        this.header = this.header || document.querySelector('.section-header');
        document.body.classList.add('overflow-hidden');
        this.header.classList.remove('shopify-section-header-hidden');

        setTimeout(() => {
            this.mainDetailsToggle.classList.add('menu-opening');
        });

        summaryElement.setAttribute('aria-expanded', true);
        trapFocus(this.mainDetailsToggle, summaryElement);
    }
    submenuToggleHandle() {
        this.submenus.forEach(submenu => {
            submenu.addEventListener('toggle', () => {
                if (submenu.hasAttribute('open')) {
                    submenu.closest('ul').classList.add('drawer__menu--blur');
                    submenu.parentElement.classList.add('opened');
                } else {
                    submenu.closest('ul').classList.remove('drawer__menu--blur');
                    submenu.parentElement.classList.remove('opened');
                }
            })
        })
    }
    closeAllSubmenus(exception = null) {
        if (this.submenus == null) return;

        this.submenus.forEach(submenu => {
            if (exception !== submenu) {
                submenu.removeAttribute('open');
                submenu.classList.remove('menu-opening');
                submenu.parentElement.classList.remove('opened');
            }
        });

        if (exception === null)
            this.querySelector('.drawer__menu').classList.remove('drawer__menu--blur');
    }

    closeMenuDrawer(event, elementToFocus = false) {
        if (event !== undefined) {
            document.body.classList.remove('overflow-hidden');
            this.mainDetailsToggle.classList.remove('menu-opening');
            this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
                details.removeAttribute('open');
                details.classList.remove('menu-opening');
            });
            this.toggler.setAttribute('aria-expanded', 'false');
            removeTrapFocus(elementToFocus);
            this.closeAnimation(this.mainDetailsToggle);
            this.closeAllSubmenus();
        }
    }
    closeSubmenu(detailsElement) {
        document.body.classList.remove('overflow-hidden');
        detailsElement.classList.remove('menu-opening');
        detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
        removeTrapFocus();
        this.closeAnimation(detailsElement);
        this.closeAllSubmenus();
    }
}
customElements.define('header-drawer', HeaderDrawer);