(() => {
    theme.lazy = theme.lazy || {};

    theme.lazy.imageAnimationDisable = (img) => {
        const animationClass = 'media--lazy-animation',
            mediaParent = img.closest(`.${animationClass}`);
        if (!mediaParent) return;

        img.closest(`.${animationClass}`).classList.remove(animationClass);
    }
    theme.lazy.init = (images = document.querySelectorAll('img')) => {
        images.forEach(img => {
            if (img === null || (img.complete && img.naturalHeight !== 0)) {
                theme.lazy.imageAnimationDisable(img);
            } else {
                img.addEventListener('load', () => theme.lazy.imageAnimationDisable(img));
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => theme.lazy.init());
    document.addEventListener('shopify:section:load', () => theme.lazy.init());
})();