customElements.define('page-preloader', class PagePreloader extends HTMLElement {
    constructor() {
        super();

        this.id = this.dataset.id;
        this.preloaderLogo = this.querySelector('[data-preloader-logo]');
        this.delay = parseInt(this.dataset.delay);

        this._hidePreloader = this._hidePreloader.bind(this);
        this._eventListener();
    }
    _revealContent() {
        let firstBanner = document.querySelector('#MainContent section.banner-section:first-child');

        if (firstBanner && isElementInViewport(firstBanner)) {
            let img = firstBanner.querySelector('img');

            // Check if image is loaded
            if (img === null || (img.complete && img.naturalHeight !== 0)) {
                this._hidePreloader();
            } else {
                img.addEventListener('load', () => this._hidePreloader());
            }
        } else {
            this._hidePreloader();
        }
    }
    _eventListener() {
        document.body.classList.add('hide');

        document.addEventListener('DOMContentLoaded', this._revealContent.bind(this));

        // Theme Editor Events
        // Show preloader on section select in Theme Editor
        document.addEventListener("shopify:section:select", (e) => {
            if (this.id === e.detail.sectionId) {
                this.preloaderLogo.style.top = '';
                this.classList.remove('hide');

                document.removeEventListener('DOMContentLoaded', this._revealContent);
            }
        });

        // Hide preloader on section deselect in Theme Editor
        document.addEventListener("shopify:section:deselect", (e) => {
            if (this.id === e.detail.sectionId) {
                this._hidePreloader();
            }
        });

    }
    _hidePreloader() {

        this.headerLogo = {
            selector: document.querySelector('.header__heading-logo'),
        };
        if (this.headerLogo.selector == null) {
            setTimeout(() => {
                this.classList.add('hide');
            }, 400);
        } else {
            setTimeout(() => {
                this.headerLogo.rect = this.headerLogo.selector.getBoundingClientRect();
                this.headerLogo.left = this.headerLogo.rect.left;
                this.headerLogo.top = this.headerLogo.rect.top;
                let newHeight = this.headerLogo.selector.scrollHeight;
                this.preloaderLogo.style.top = (this.headerLogo.top + (newHeight / 2)) + 'px';

                setTimeout(() => {
                    this.classList.add('hide');
                    document.body.classList.add('animate');
                }, 400);
            }, this.delay);
        };
    }
});