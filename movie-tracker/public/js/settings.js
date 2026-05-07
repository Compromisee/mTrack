const $ = id => document.getElementById(id);

async function init() {
    try {
        const r = await fetch('/api/me');
        if (r.status === 401) { window.location.href = '/pages/login.html'; return; }
        const user = await r.json();
        $('setUsername').value = user.username;
    } catch { window.location.href = '/pages/login.html'; return; }

    // Load saved settings
    $('setApiKey').value = localStorage.getItem('tmdb_api_key') || '';
    $('setDefaultSource').value = localStorage.getItem('mtrack-default-source') || 'spencerdevs';
    $('setDisplayName').value = localStorage.getItem('mtrack-display-name') || '';

    const currentTheme = localStorage.getItem('mtrack-theme') || 'mtrack';
    $('customCssInput').value = localStorage.getItem('mtrack-custom-css') || '';

    // Highlight active theme
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === currentTheme);
        card.addEventListener('click', () => {
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const theme = card.dataset.theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('mtrack-theme', theme);
            $('customCssSection').style.display = theme === 'custom' ? '' : 'none';
            if (theme === 'custom') applyCustomCSS();
            showToast('Theme changed to ' + card.querySelector('.theme-name').textContent);
        });
    });

    // Show custom CSS section if needed
    $('customCssSection').style.display = currentTheme === 'custom' ? '' : 'none';

    // Live custom CSS
    $('customCssInput').addEventListener('input', applyCustomCSS);

    // Save all
    $('saveAllSettings').addEventListener('click', saveAll);

    // Logout
    $('logoutBtnSettings').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/pages/login.html';
    });

    // Apply custom CSS if custom theme
    if (currentTheme === 'custom') applyCustomCSS();
}

function applyCustomCSS() {
    let styleEl = document.getElementById('custom-css-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-css-style';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = $('customCssInput').value;
}

function saveAll() {
    const apiKey = $('setApiKey').value.trim();
    const source = $('setDefaultSource').value;
    const displayName = $('setDisplayName').value.trim();
    const customCss = $('customCssInput').value;

    if (apiKey) localStorage.setItem('tmdb_api_key', apiKey);
    localStorage.setItem('mtrack-default-source', source);
    if (displayName) localStorage.setItem('mtrack-display-name', displayName);
    localStorage.setItem('mtrack-custom-css', customCss);

    showToast('Settings saved!');
}

function showToast(msg) {
    $('toastMsg').textContent = msg;
    $('toastIcon').textContent = 'check_circle';
    $('toastIcon').style.color = '#22c55e';
    $('toast').classList.add('show');
    setTimeout(() => $('toast').classList.remove('show'), 3000);
}

init();