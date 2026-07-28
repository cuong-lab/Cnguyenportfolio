// Contact form: client-side validation + submit handling. No backend exists in
// this static build yet, so a valid submit resolves to an inline success state.
// When an endpoint is ready, replace the body of `submitForm()` with the real
// POST (Formspree / serverless / Supabase Edge Function) — the validation and
// UI state machine around it stay the same.
const form = document.getElementById('contact-form');

if (form) {
  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('.contact-submit');
  const submitLabel = form.querySelector('.contact-submit-label');
  const defaultLabel = submitLabel ? submitLabel.textContent : '';

  const messages = {
    sending: form.dataset.msgSending || 'Sending…',
    success: form.dataset.msgSuccess || 'Thank you!',
    error: form.dataset.msgError || 'Something went wrong.',
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function fieldError(name) {
    return form.querySelector(`[data-error-for="${name}"]`);
  }

  function setInvalid(name, invalid) {
    const input = form.elements.namedItem(name);
    const errorEl = fieldError(name);
    if (input) input.classList.toggle('is-invalid', invalid);
    if (errorEl) errorEl.classList.toggle('visible', invalid);
  }

  function validate() {
    const values = {
      name: form.elements.namedItem('name'),
      email: form.elements.namedItem('email'),
      message: form.elements.namedItem('message'),
    };
    const checks = {
      name: values.name && values.name.value.trim().length > 0,
      email: values.email && EMAIL_RE.test(values.email.value.trim()),
      message: values.message && values.message.value.trim().length > 0,
    };
    let firstInvalid = null;
    for (const key of ['name', 'email', 'message']) {
      const ok = !!checks[key];
      setInvalid(key, !ok);
      if (!ok && !firstInvalid) firstInvalid = values[key];
    }
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  // Clear a field's error as soon as the user starts fixing it.
  ['name', 'email', 'message'].forEach((name) => {
    const input = form.elements.namedItem(name);
    if (input) input.addEventListener('input', () => setInvalid(name, false));
  });

  function setStatus(text, tone) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.remove('is-success', 'is-error');
    if (tone) statusEl.classList.add(tone);
  }

  async function submitForm() {
    // Placeholder for the real network call. Simulate a brief round-trip so the
    // "sending" state is visible, then resolve. Swap for fetch(endpoint, …).
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = messages.sending;
    setStatus('', null);

    try {
      const result = await submitForm();
      if (!result.ok) throw new Error('submit failed');
      form.reset();
      setStatus(messages.success, 'is-success');
    } catch (err) {
      console.warn('Contact submit failed', err);
      setStatus(messages.error, 'is-error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = defaultLabel;
    }
  });
}
