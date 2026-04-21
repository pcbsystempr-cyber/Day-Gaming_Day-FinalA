// Advanced Admin Modal Authentication (synced with index.html)
function openAdminPanel() {
  document.getElementById('admin-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.add('hidden');
  document.body.style.overflow = '';
  resetAdminForm();
}

function handleAdminLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;
  
  if (username === 'compu@' && password === 'admin4050%') {
    closeAdminModal();
    window.open('admin.html', '_blank');
    return;
  }
  
  // Error handling
  const modal = document.getElementById('admin-modal');
  const errorMsg = document.getElementById('admin-error');
  const form = document.getElementById('admin-form');
  
  let attempts = parseInt(modal.dataset.attempts || 0) + 1;
  modal.dataset.attempts = attempts;
  
  if (attempts >= 3) {
    errorMsg.textContent = '¡Demasiados intentos! Espera 30 segundos.';
    errorMsg.classList.remove('hidden');
    modal.dataset.locked = 'true';
    form.style.pointerEvents = 'none';
    setTimeout(() => {
      modal.dataset.attempts = 0;
      modal.dataset.locked = 'false';
      form.style.pointerEvents = '';
      resetAdminForm();
    }, 30000);
    return;
  }
  
  errorMsg.textContent = `Credenciales incorrectas. Intento ${attempts}/3`;
  errorMsg.classList.remove('hidden');
  form.classList.add('shake');
  setTimeout(() => form.classList.remove('shake'), 500);
}

function resetAdminForm() {
  document.getElementById('admin-form').reset();
  const error = document.getElementById('admin-error');
  error.textContent = '';
  error.classList.add('hidden');
  document.getElementById('admin-modal').dataset.attempts = 0;
}

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAdminModal();
});

