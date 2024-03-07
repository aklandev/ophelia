class DeferredMedia extends HTMLElement {
    constructor() {
        super();
        this.trigger = this.querySelector('[id^="Deferred-Poster-"]');
        if (!this.trigger) return;
        this.trigger.addEventListener('click', this.loadContent.bind(this));
    }

    loadContent() {
        window.pauseAllMedia();
        if (!this.getAttribute('loaded')) {
            this.classList.add('media--lazy-animation');
            this.trigger.classList.add('hidden');
            const content = document.createElement('div');
            content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

            this.setAttribute('loaded', true);
            this.appendChild(content.querySelector('video, model-viewer, iframe')).focus();
        }
    }
}
customElements.define('deferred-media', DeferredMedia);