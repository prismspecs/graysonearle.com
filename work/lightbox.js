// /work/ project pages: a minimal lightbox. Clicking an image shows it as large
// as the screen allows, with its caption. Arrows, arrow keys or a swipe move
// through the page's images; the ×, Escape, a click on the background or the
// back button close it. Without this script the links still open the image.
(() => {
    const links = [...document.querySelectorAll('.work-img')];
    if (!links.length) return;

    const box = document.createElement('div');
    box.className = 'lb' + (links.length === 1 ? ' lb-single' : '');
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = `
        <figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>
        <div class="lb-bar">
            <button class="lb-btn lb-prev" type="button" aria-label="Previous image">‹</button>
            <span class="lb-count" aria-live="polite"></span>
            <button class="lb-btn lb-next" type="button" aria-label="Next image">›</button>
        </div>
        <button class="lb-btn lb-close" type="button" aria-label="Close">×</button>`;
    document.body.append(box);

    const img = box.querySelector('.lb-img');
    const cap = box.querySelector('.lb-cap');
    const count = box.querySelector('.lb-count');
    const buttons = [...box.querySelectorAll('button')];
    let index = 0;
    let opener = null;
    let inHistory = false;

    const wrap = i => (i + links.length) % links.length;

    function show(i) {
        index = wrap(i);
        const link = links[index];
        img.src = link.href;
        img.alt = link.querySelector('img')?.alt || '';
        cap.innerHTML = link.dataset.caption || '';  // generated from the project's own text
        count.textContent = `${index + 1} / ${links.length}`;
        for (const j of [index + 1, index - 1]) new Image().src = links[wrap(j)].href;
    }

    function open(i, link) {
        opener = link;
        show(i);
        box.hidden = false;
        document.documentElement.classList.add('lb-open');
        // the back button (or gesture) closes the viewer instead of leaving the page
        history.pushState({ lightbox: true }, '');
        inHistory = true;
        box.querySelector('.lb-close').focus({ preventScroll: true });
    }

    function close() {
        if (box.hidden) return;
        box.hidden = true;
        document.documentElement.classList.remove('lb-open');
        img.removeAttribute('src');
        if (inHistory) {
            inHistory = false;
            history.back();
        }
        opener?.focus({ preventScroll: true });
    }

    links.forEach((link, i) => link.addEventListener('click', e => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;  // new-tab clicks still work
        e.preventDefault();
        open(i, link);
    }));

    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
    box.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
    box.addEventListener('click', e => {
        if (e.target === box || e.target.classList.contains('lb-figure')) close();
    });

    window.addEventListener('popstate', () => {
        if (box.hidden) return;
        inHistory = false;
        close();
    });

    document.addEventListener('keydown', e => {
        if (box.hidden) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(index - 1);
        else if (e.key === 'ArrowRight') show(index + 1);
        else if (e.key === 'Tab') {
            // keep focus inside the viewer
            const visible = buttons.filter(b => b.offsetParent !== null);
            const at = visible.indexOf(document.activeElement);
            e.preventDefault();
            visible[(at + (e.shiftKey ? -1 : 1) + visible.length) % visible.length].focus();
        }
    });

    let startX = null;
    let startY = null;
    box.addEventListener('touchstart', e => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener('touchend', e => {
        if (startX === null || links.length < 2) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        startX = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
    });
})();
