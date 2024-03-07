class StickyHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.header = this.closest('.shopify-section');
        this.header.classList.add('isSticky');
        this.headerBounds = {};
        this.currentScrollTop = 0;
        this.preventReveal = false;
        this.predictiveSearch = this.querySelector('predictive-search');

        this.onScrollHandler = this.onScroll.bind(this);
        this.hideHeaderOnScrollUp = () => this.preventReveal = true;

        this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
        window.addEventListener('scroll', this.onScrollHandler, false);

        document.querySelector(':root').style.setProperty('--header-height', this.header.offsetHeight + 'px');
        window.addEventListener('resize', () => {
            document.querySelector(':root').style.setProperty('--header-height', this.header.offsetHeight + 'px');
        });

        this.createObserver();
    }

    disconnectedCallback() {
        this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
        window.removeEventListener('scroll', this.onScrollHandler);
    }

    createObserver() {
        let observer = new IntersectionObserver((entries, observer) => {
            this.headerBounds = entries[0].intersectionRect;
            observer.disconnect();
        });

        observer.observe(this.header);
    }

    onScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

        if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
            requestAnimationFrame(this.hide.bind(this));
        } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
            if (!this.preventReveal) {
                requestAnimationFrame(this.reveal.bind(this));
            } else {
                window.clearTimeout(this.isScrolling);

                this.isScrolling = setTimeout(() => {
                    this.preventReveal = false;
                }, 66);

                requestAnimationFrame(this.hide.bind(this));
            }
        } else if (scrollTop <= this.headerBounds.top) {
            requestAnimationFrame(this.reset.bind(this));
        }

        this.currentScrollTop = scrollTop;
    }

    hide() {
        this.header.classList.add('shopify-section-header-hidden');
        this.closeMenuDisclosure();
    }

    reveal() {
        this.header.classList.add('shopify-section-header-sticky', 'animate');
        this.header.classList.remove('shopify-section-header-hidden');
    }

    reset() {
        this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
    }

    closeMenuDisclosure() {
        this.disclosures = this.disclosures || this.header.querySelectorAll('details-disclosure');
        this.disclosures.forEach(disclosure => disclosure.close());
    }
}

customElements.define('sticky-header', StickyHeader);