(() => {
    const EMAILJS_PUBLIC_KEY  = 'TU_PUBLIC_KEY';
    const EMAILJS_SERVICE_ID  = 'TU_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID';
    const OFFICIAL_PORTAL_URL = 'https://pcbsystempr-cyber.github.io/Gaming_Day-F-D/';
    const GAME_URLS = {
        impostor: `${OFFICIAL_PORTAL_URL}impostor.html`,
        nba: `${OFFICIAL_PORTAL_URL}nba.html`,
        'mario-kart': `${OFFICIAL_PORTAL_URL}mario-kart.html`,
        'mortal-kombat': `${OFFICIAL_PORTAL_URL}mortal-kombat.html`,
        'smash-bros': `${OFFICIAL_PORTAL_URL}smash-bros.html`
    };
    const EMAILJS_READY = [EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID].every((value) => value && !value.startsWith('TU_'));

    if (window.emailjs && EMAILJS_READY) {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    const getRegistrationSync = () => window.GamingDayRegistrationSync || null;
    const sharedScriptsReady = window.GamingDaySharedScriptsReady || Promise.resolve(null);

    sharedScriptsReady.then(() => {
        const registrationSync = getRegistrationSync();
        if (registrationSync) {
            registrationSync.normalizePageContentRegistrationLinks();
        }
    });

    const form = document.getElementById('registerForm');
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const game = document.getElementById('game');
    const chips = game.querySelectorAll('.chip');
    const group = document.getElementById('group');
    const terms = document.getElementById('terms');
    const toast = document.getElementById('toast');
    const modal = document.getElementById('successModal');
    const qrCanvas = document.getElementById('qrCanvas');
    const playerCode = document.getElementById('playerCode');
    const sentTo = document.getElementById('sentTo');
    const closeModal = document.getElementById('closeModal');
    const completionText = document.getElementById('completionText');
    const progressFill = document.getElementById('progressFill');
    const previewName = document.getElementById('previewName');
    const previewMeta = document.getElementById('previewMeta');
    const gameCounter = document.getElementById('gameCounter');
    const submitButton = document.getElementById('submitButton');
    const startMatchButton = document.getElementById('startMatchButton');
    const viewOfficialSite = document.getElementById('viewOfficialSite');
    const viewSelectedGame = document.getElementById('viewSelectedGame');

    const gameLabels = {
        impostor: 'Impostor',
        nba: 'NBA',
        'mario-kart': 'Mario Kart',
        'mortal-kombat': 'Mortal Kombat',
        'smash-bros': 'Smash Bros'
    };

    let lastFocusedElement = null;

    /* ── Confetti Engine (lightweight canvas) ── */
    const confettiCanvas = document.getElementById('confettiCanvas');
    const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
    const CONFETTI_COLORS = ['#00f0ff', '#ff2bd6', '#8a2bff', '#39ff88', '#f7e733', '#ff4d6d', '#ff7a3d'];
    let confettiPieces = [];
    let confettiAnimId = null;

    const resizeConfettiCanvas = () => {
        if (!confettiCanvas) return;
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    };

    const launchConfetti = () => {
        if (!confettiCanvas || !confettiCtx) return;
        resizeConfettiCanvas();
        confettiPieces = [];
        const count = Math.min(150, Math.floor(window.innerWidth / 4));
        for (let i = 0; i < count; i++) {
            confettiPieces.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                w: Math.random() * 8 + 4,
                h: Math.random() * 6 + 3,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                vy: Math.random() * 3 + 2,
                vx: (Math.random() - 0.5) * 2,
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8,
                opacity: 1
            });
        }
        if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
        animateConfetti();
    };

    const animateConfetti = () => {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let alive = false;
        confettiPieces.forEach(p => {
            p.y += p.vy;
            p.x += p.vx;
            p.rot += p.rotSpeed;
            if (p.y > confettiCanvas.height * 0.85) p.opacity -= 0.02;
            if (p.opacity <= 0) return;
            alive = true;
            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rot * Math.PI) / 180);
            confettiCtx.globalAlpha = Math.max(0, p.opacity);
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            confettiCtx.restore();
        });
        if (alive) {
            confettiAnimId = requestAnimationFrame(animateConfetti);
        } else {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            confettiAnimId = null;
        }
    };

    window.addEventListener('resize', resizeConfettiCanvas);

    const setError = (field, msg) => {
        const el = document.querySelector(`.error[data-for="${field.id}"]`);
        if (el) el.textContent = msg || '';
        field.classList.toggle('invalid', !!msg);
    };

    const getSelectedGames = () =>
        Array.from(chips).filter(c => c.classList.contains('selected')).map(c => c.dataset.value);

    const getProgress = () => {
        const fields = [
            fullname.value.trim().length >= 3,
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()),
            getSelectedGames().length > 0,
            Boolean(group.value),
            terms.checked,
        ];
        const completed = fields.filter(Boolean).length;
        return Math.round((completed / fields.length) * 100);
    };

    const updateLivePanel = () => {
        const selectedGames = getSelectedGames();
        const progress = getProgress();
        const cleanName = fullname.value.trim();
        const selectedGroup = group.value ? `${group.value}mo grupo` : 'sin grupo';
        const firstSelectedGame = selectedGames[0];

        completionText.textContent = `${progress}% completado`;
        progressFill.style.width = `${progress}%`;
        previewName.textContent = cleanName || 'Jugador sin identificar';
        viewOfficialSite.href = `${OFFICIAL_PORTAL_URL}?source=registro-local`;

        if (selectedGames.length) {
            const gameNames = selectedGames.map(value => gameLabels[value] || value);
            previewMeta.textContent = `Pase listo para ${gameNames.join(', ')} en ${selectedGroup}.`;
            gameCounter.textContent = `${selectedGames.length} juego(s) seleccionado(s): ${gameNames.join(', ')}.`;
            viewSelectedGame.href = `${GAME_URLS[firstSelectedGame] || `${OFFICIAL_PORTAL_URL}#games`}?source=registro-local&player=${encodeURIComponent(cleanName || 'jugador')}`;
            viewSelectedGame.textContent = `VER ${gameNames[0].toUpperCase()}`;
        } else {
            previewMeta.textContent = 'Selecciona tus juegos y grupo para generar tu pase.';
            gameCounter.textContent = 'Aun no has seleccionado juegos.';
            viewSelectedGame.href = `${OFFICIAL_PORTAL_URL}#games`;
            viewSelectedGame.textContent = 'VER TU JUEGO';
        }
    };

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
            chip.setAttribute('aria-pressed', chip.classList.contains('selected'));
            setError(game, '');
            updateLivePanel();
        });
    });

    const showToast = (msg, color = '#39ff88') => {
        toast.textContent = msg;
        toast.style.borderColor = color;
        toast.style.boxShadow = `0 0 20px ${color}59`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    };

    const validate = () => {
        let ok = true;

        if (fullname.value.trim().length < 3) {
            setError(fullname, 'Mínimo 3 caracteres.');
            ok = false;
        } else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/.test(fullname.value.trim())) {
            setError(fullname, 'Solo letras y espacios.');
            ok = false;
        } else setError(fullname, '');

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            setError(email, 'Correo no válido.');
            ok = false;
        } else setError(email, '');

        if (getSelectedGames().length === 0) {
            setError(game, 'Selecciona al menos un juego.');
            ok = false;
        } else setError(game, '');

        if (!group.value) {
            setError(group, 'Selecciona un grupo.');
            ok = false;
        } else setError(group, '');

        if (!terms.checked) {
            showToast('Debes aceptar los términos y política de privacidad.', '#ff4d6d');
            const box = terms.closest('.agreement-box');
            if (box) {
                box.classList.remove('terms-error');
                void box.offsetWidth;
                box.classList.add('terms-error');
                setTimeout(() => box.classList.remove('terms-error'), 1500);
            }
            ok = false;
        }

        return ok;
    };

    const generateCode = () => {
        const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
        const ts = Date.now().toString(36).slice(-4).toUpperCase();
        return `GZ-${ts}-${rand}`;
    };

    const buildQrPayload = ({ code, name, emailAddress, groupValue, games }) => JSON.stringify({
        event: 'Gaming Day',
        code,
        player: name,
        email: emailAddress,
        group: groupValue,
        games,
        issuedAt: new Date().toISOString()
    });

    const buildQrUrl = (payload) =>
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(payload)}&size=260x260&margin=10`;

    const loadStoredRegistrations = () => {
        try {
            const raw = localStorage.getItem('gamingDayRegistrations');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    };

    const persistRegistrationLocally = (registrationPayload) => {
        const currentRegistrations = Array.isArray(loadStoredRegistrations()) ? loadStoredRegistrations() : [];
        const currentKey = registrationPayload.email
            ? `email:${registrationPayload.email.toLowerCase()}`
            : registrationPayload.code
                ? `code:${registrationPayload.code.toLowerCase()}`
                : `name:${registrationPayload.name.toLowerCase()}`;

        const mergedMap = new Map();

        currentRegistrations.concat([registrationPayload]).forEach((entry) => {
            if (!entry) return;

            const entryKey = entry.email
                ? `email:${String(entry.email).toLowerCase()}`
                : entry.code
                    ? `code:${String(entry.code).toLowerCase()}`
                    : `name:${String(entry.name || '').toLowerCase()}`;

            if (!entryKey) return;

            const previous = mergedMap.get(entryKey) || {};
            mergedMap.set(entryKey, {
                ...previous,
                ...entry,
                games: Array.isArray(entry.games) && entry.games.length
                    ? entry.games
                    : Array.isArray(previous.games)
                        ? previous.games
                        : []
            });
        });

        const mergedRegistrations = Array.from(mergedMap.entries())
            .sort(([a], [b]) => (a === currentKey ? -1 : b === currentKey ? 1 : 0))
            .map(([, value]) => value);

        localStorage.setItem('gamingDayRegistrations', JSON.stringify(mergedRegistrations));
        localStorage.setItem('gamingDayRegistration', JSON.stringify(registrationPayload));
    };

    const drawQr = (payload) => {
        qrCanvas.innerHTML = '';
        if (window.QRCode) {
            new QRCode(qrCanvas, { text: payload, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.H });
        } else {
            const img = document.createElement('img');
            img.src = buildQrUrl(payload); img.alt = 'QR';
            qrCanvas.appendChild(img);
        }
    };

    const openModal = (code, qrPayload, playerEmail, selectedGames, playerName) => {
        const firstSelectedGame = selectedGames[0];
        const fallbackUrl = `${OFFICIAL_PORTAL_URL}#games`;
        const selectedGameUrl = GAME_URLS[firstSelectedGame] || fallbackUrl;
        const playerParam = encodeURIComponent(playerName || 'jugador');

        lastFocusedElement = document.activeElement;
        playerCode.textContent = code;
        sentTo.textContent = playerEmail;
        startMatchButton.href = `${selectedGameUrl}?source=registro-local&player=${playerParam}&code=${encodeURIComponent(code)}`;
        viewSelectedGame.href = `${selectedGameUrl}?source=registro-local&player=${playerParam}`;
        drawQr(qrPayload);
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        launchConfetti();
        startMatchButton.focus();
    };

    const hideModal = () => {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        if (confettiAnimId) { cancelAnimationFrame(confettiAnimId); confettiAnimId = null; }
        if (confettiCtx && confettiCanvas) confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
    };

    closeModal.addEventListener('click', hideModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', hideModal);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) hideModal();
    });

    const sendEmail = (params) => {
        if (!window.emailjs || !EMAILJS_READY) {
            console.warn('EmailJS no configurado. Completa las constantes EMAILJS_* en script.js para enviar el Gmail con el QR.');
            return Promise.resolve({ skipped: true });
        }
        return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const btn = form.querySelector('.btn-submit span');
        const original = btn.textContent;
        btn.textContent = 'ENVIANDO...';

        const code = generateCode();
        const juegos = getSelectedGames().join(', ');
        const selectedGames = getSelectedGames();
        const playerName = fullname.value.trim();
        const playerEmail = email.value.trim();
        const qrPayload = buildQrPayload({
            code,
            name: playerName,
            emailAddress: playerEmail,
            groupValue: group.value,
            games: selectedGames.map((gameKey) => gameLabels[gameKey] || gameKey)
        });
        const params = {
            to_name: playerName,
            to_email: playerEmail,
            code,
            games: juegos,
            group: group.value,
            qr_url: buildQrUrl(qrPayload),
            qr_payload: qrPayload,
            portal_url: OFFICIAL_PORTAL_URL,
            selected_game_url: GAME_URLS[selectedGames[0]] || `${OFFICIAL_PORTAL_URL}#games`,
            registration_date: new Date().toLocaleString('es-PR'),
        };

        const registrationPayload = {
            name: playerName,
            email: playerEmail,
            games: selectedGames,
            group: group.value,
            code,
            qrPayload,
            qrUrl: buildQrUrl(qrPayload),
            source: 'registro-gd',
            registeredAt: new Date().toISOString()
        };

        await sharedScriptsReady;

        sendEmail(params)
            .then(async (res) => {
                let syncResult = null;
                const registrationSync = getRegistrationSync();

                if (registrationSync) {
                    syncResult = await registrationSync.recordRegistration(registrationPayload);
                } else {
                    persistRegistrationLocally(registrationPayload);
                }

                if (syncResult && syncResult.error) {
                    showToast('Registro guardado localmente. Falta sincronizar con el portal remoto.', '#f7e733');
                } else if (res && res.skipped) {
                    showToast('Registro completado. Falta configurar EmailJS para enviar el Gmail con el QR.', '#f7e733');
                } else {
                    showToast(`Gmail enviado a ${playerEmail} con tu QR unico.`);
                }
                openModal(code, qrPayload, playerEmail, selectedGames, playerName);
                form.reset();
                chips.forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-pressed', 'false'); });
                updateLivePanel();
            })
            .catch((err) => {
                console.error(err);
                persistRegistrationLocally(registrationPayload);
                showToast('No se pudo enviar el Gmail. Revisa la configuración de EmailJS.', '#ff4d6d');
                openModal(code, qrPayload, playerEmail, selectedGames, playerName);
            })
            .finally(() => { btn.textContent = original; });
    });

    [fullname, email, group].forEach((f) => {
        f.addEventListener('input', () => {
            setError(f, '');
            updateLivePanel();
        });
        f.addEventListener('change', () => {
            setError(f, '');
            updateLivePanel();
        });
    });

    terms.addEventListener('change', updateLivePanel);
    updateLivePanel();
})();
