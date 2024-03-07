document.addEventListener('DOMContentLoaded', () => {
    // Parallax
    (function () {
        const parallax = document.querySelectorAll('[data-parallax]');
        if (parallax === null) return;
        parallax.forEach(img => {
            let state = 0;
            let lastScrollTop = 0;
            let amplifier = parseFloat(img.dataset.parallaxAmplifier) || 1;
            window.addEventListener('scroll', () => {

                if (window.innerWidth < 992) return;

                if (isElementInViewport(img)) {
                    let st = window.pageYOffset || document.documentElement.scrollTop;
                    if (st > lastScrollTop) {
                        state += 0.5 * amplifier;
                    } else {
                        state -= 0.5 * amplifier;
                    }
                    img.style.transform = `translateY(${state}px)`;
                    lastScrollTop = st <= 0 ? 0 : st;
                }
            });
        });
    })();

    // PDP stars badge click handle
    (function () {
        const ratingBadge = document.querySelector('[data-rating-badge]');

        if (ratingBadge === null) return;

        if (window.detectBrowser() === 'safari') {
            let url = 'https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
            let script = document.createElement('script');
            script.src = url;
            document.getElementsByTagName('head')[0].appendChild(script);
        }

        ratingBadge.addEventListener('click', () => {
            const details = document.querySelector('#shopify-product-reviews').closest('details');

            if (details === null) return;

            details.setAttribute('open', '');
            details.querySelector('summary').setAttribute('aria-expanded', 'true');

            let topOffset = details.getBoundingClientRect().top + window.pageYOffset;

            if (document.querySelector('sticky-header') !== null) {
                topOffset -= (getComputedStyle(document.documentElement).getPropertyValue('--header-height').replace('px', '') * 1);
            }

            window.scroll({
                top: topOffset,
                left: 0,
                behavior: "smooth"
            });
        });
    })();

    // SPR star replace
    // For some reason event listeners do exist but
    // do not work...
    (function () {
        function replaceIcons() {
            const starts = document.querySelectorAll('.spr-icon');

            if (starts.length < 1) return;

            starts.forEach(star => {
                let newStarHtml =
                    `<svg aria-hidden="true" focusable="false" role="presentation" class="icon icon--star ${star.classList.contains('spr-icon-star') ? 'icon--primary' : 'icon--tertiary'}" width="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="m13.4228 8.26231 7.976 1.4434-7.142 3.86059 1.1023 8.1-5.84274-5.6623-7.29321 3.564 3.53112-7.3612L.142578 6.308 8.16948 7.42233 11.9944.21373l1.4284 8.04858Z" fill="currentColor"></path></svg>`;

                star.insertAdjacentHTML('beforebegin', newStarHtml);
                star.remove();
            });

            clearInterval(replaceIconsInterval);
        }
        const replaceIconsInterval = setInterval(replaceIcons, 300);
    })();

    class InstafeedSlider extends HTMLElement {
        constructor() {
            super();

            this.selectors = {
                slider: this.querySelector('[data-slider]'),
                cursor: this.querySelector('[data-custom-cursor]')
            };
            this.options = {
                cellAlign: 'center',
                contain: true,
                pageDots: false,
                prevNextButtons: false,
                wrapAround: true,
                on: {
                    ready: function () {
                        theme.lazy.init(this.element.querySelectorAll('img'));
                    }
                }
            };
        }

        connectedCallback() {
            this.slider = new Flickity(this.selectors.slider, this.options);

            this.addEventListener('mousemove', () => {
                this.selectors.cursor.style.left.replace('px', '') <= (window.innerWidth / 2)
                    ? this.selectors.cursor.classList.add('revert')
                    : this.selectors.cursor.classList.remove('revert')
            });

            this.selectors.slider.addEventListener('click', () => {
                if (window.innerWidth < 768) return;

                this.selectors.cursor.style.left.replace('px', '') <= (window.innerWidth / 2)
                    ? this.slider.previous()
                    : this.slider.next();
            });
        }
    }
    customElements.define('instagram-feed', InstafeedSlider);

    class ImageScroller extends HTMLElement {
        constructor() {
            super();

            this.selector = {
                text: this.querySelector('[data-text-speed]'),
                image: this.querySelector('[data-image-speed]')
            };
            this.options = {
                textSpeed: Number(this.selector.text.dataset.textSpeed),
                imageSpeed: Number(this.selector.image.dataset.imageSpeed)
            };

            this.stateText = 0;
            this.stateImage = 0;
            this.lastScrollTop = this.getBoundingClientRect().top + window.pageYOffset;
            this.st = this.getBoundingClientRect().top + window.pageYOffset;

            this.selector.image.style.width = this.selector.text.scrollWidth + 'px';

            this._check();
            window.addEventListener('resize', this._resize.bind(this));
        }
        _check() {
            this.scrollWidth > window.innerWidth
                ? this._init()
                : this._destroy()
        }
        _resize() {
            if (window.isMobile() || window.innerWidth < 750) return;

            this.stateText = 0;
            this.stateImage = 0;
            this.lastScrollTop = this.getBoundingClientRect().top + window.pageYOffset;
            this.st = this.getBoundingClientRect().top + window.pageYOffset;

            this.selector.image.style.width = this.selector.text.scrollWidth + 'px';

            // this.selector.text.style.transform = `translateX(0px)`;
            // this.selector.image.style.transform = `translateX(0px)`;
        }
        _init() {
            this.classList.remove('no-scroll');
            window.addEventListener('scroll', this._scrollHandle.bind(this));
        }
        _destroy() {
            this.selector.image.style.width = this.selector.text.scrollWidth + 'px';

            this.classList.add('no-scroll');
            window.addEventListener('scroll', this._scrollHandle, false);
        }
        _scrollHandle() {
            requestAnimationFrame(() => {
                if (isElementInViewport(this)) {
                    this.st = window.pageYOffset + window.innerHeight;

                    let scrollPower = window.innerWidth > 769
                        ? (this.lastScrollTop - this.st) / 2
                        : (this.lastScrollTop - this.st) / 3;

                    this.stateText += scrollPower * this.options.textSpeed;
                    this.stateImage += scrollPower * this.options.imageSpeed;

                    this.selector.text.style.transform = `translateX(${this.stateText}px)`;
                    this.selector.image.style.transform = `translateX(${this.stateImage}px)`;
                    this.lastScrollTop = this.st <= 0 ? 0 : this.st;

                }
            });
        }
    }
    customElements.define('image-scroll', ImageScroller);

    class ScrollTo extends HTMLElement {
        constructor() {
            super();

            this.parent = this.closest('section');

            this.settings = {
                target: this.dataset.target,
                isOffset: this.dataset.offset === 'true',
                isBanner: this.parent.classList.contains('banner-section')
            };

            this.optionsDefault = {
                left: 0,
                behavior: "smooth"
            };
            this.resizeTimeout = setTimeout(window.dispatchEvent(new Event('resize')), 100);

            // Smooth scroll polyfill for Safari
            if (window.detectBrowser() === 'safari')
                this._safariPolyfill();

            if (this.settings.isBanner) {
                this._updateHorizontalPosition = this._updateHorizontalPosition.bind(this);
                this._updateHorizontalPosition();
            }
            this._eventListeners();
        }
        _safariPolyfill() {
            let url = 'https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
            let script = document.createElement('script');
            script.src = url;
            document.getElementsByTagName('head')[0].appendChild(script);
        }
        _eventListeners() {
            this.addEventListener('click', this._scrollHandle);

            if (!this.settings.isBanner) return;

            window.addEventListener('resize', this._updateHorizontalPosition);
            // Theme Editor Integration
            document.addEventListener("shopify:section:load", (e) => {
                let parentId = this.parent.getAttribute('id');
                parentId = parentId.replace('shopify-section-', '');
                if (parentId === e.detail.sectionId) {
                    this._updateHorizontalPosition();
                }
            });
        }
        _scrollHandle() {
            // Accepts to values: "next-section" or any other "JS selector"
            if (this.settings.target === 'next-section') {
                this.topOffset = this.parent.offsetHeight;
            } else {
                var targetDom = document.querySelector(`${this.settings.target}`);
                if (targetDom === null) return;
                this.topOffset = targetDom.getBoundingClientRect().top + window.scrollY;
            }

            // If additional offset is required
            this.settings.isOffset
                ? this.topOffset -= (getComputedStyle(document.documentElement).getPropertyValue('--header-height').replace('px', '') * 1)
                : null;

            window.scroll({
                top: this.topOffset,
                ...this.optionsDefault
            });
        }
        _updateHorizontalPosition() {
            this.buttonReference = this.parent.querySelector('.btn');

            if (this.buttonReference === null) return;
            clearTimeout(this.resizeTimeout);

            // Align link with a middle of the button
            let moveArrowTo = this.buttonReference.offsetLeft + (this.buttonReference.scrollWidth / 2) - (this.scrollWidth / 2);
            this.style.left = `${moveArrowTo}px`;

            // this.resizeTimeout = setTimeout(() => {
            //     window.dispatchEvent(new Event('resize'))
            // }, 100);
        }
    }
    customElements.define('scroll-to', ScrollTo);

    class TestimonialsSlider extends HTMLElement {
        constructor() {
            super();

            this.selectors = {
                slider: this.querySelector('[data-slider]'),
                prevArrow: this.querySelector('[data-prev]'),
                nextArrow: this.querySelector('[data-next]'),
            };
            this.options = {
                cellAlign: 'center',
                contain: true,
                pageDots: false,
                prevNextButtons: false,
                wrapAround: true,
                adaptiveHeight: true,
            };
        }

        connectedCallback() {
            this.slider = new Flickity(this.selectors.slider, this.options);
            this.selectors.nextArrow.addEventListener('click', () => {
                this.slider.next();
            });
            this.selectors.prevArrow.addEventListener('click', () => {
                this.slider.previous();
            });
        }
    }
    customElements.define('testimonials-slider', TestimonialsSlider);
});