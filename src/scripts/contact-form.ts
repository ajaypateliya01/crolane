/**
 * Contact form: client validation mirror, JSON submission with loading,
 * field errors, success and failure states. The form also works without
 * JavaScript via a normal POST handled by the server with a redirect.
 */

type ApiOk = { ok: true; message?: string };
type ApiFail = { ok: false; message?: string; errors?: Record<string, string> };

function initForm(root: HTMLElement) {
  if (root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const form = root.querySelector<HTMLFormElement>('[data-cf-form]');
  const success = root.querySelector<HTMLElement>('[data-cf-success]');
  const successMsg = root.querySelector<HTMLElement>('[data-cf-success-msg]');
  const errorBox = root.querySelector<HTMLElement>('[data-cf-error]');
  const errorMsg = root.querySelector<HTMLElement>('[data-cf-error-msg]');
  const submitBtn = root.querySelector<HTMLButtonElement>('[data-cf-submit]');
  const submitLabel = root.querySelector<HTMLElement>('[data-cf-submit-label]');
  const elapsed = root.querySelector<HTMLInputElement>('[data-cf-elapsed]');
  const anotherBtn = root.querySelector<HTMLButtonElement>('[data-cf-another]');

  if (!form) return;
  const started = Date.now();

  // No-JS redirect result (?sent=1) still renders the success state.
  const params = new URLSearchParams(window.location.search);
  if (params.get('sent') === '1') {
    showSuccess();
    const url = new URL(window.location.href);
    url.searchParams.delete('sent');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  } else if (params.get('failed') === '1') {
    showError(
      'The server could not deliver your message. Please try again shortly or email us directly.'
    );
    const url = new URL(window.location.href);
    url.searchParams.delete('failed');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  function clearErrors() {
    root.querySelectorAll<HTMLElement>('[data-err-for]').forEach((el) => {
      el.textContent = '';
    });
    form!.querySelectorAll<HTMLElement>('[aria-invalid]').forEach((el) => {
      el.removeAttribute('aria-invalid');
    });
  }

  function setError(name: string, msg: string) {
    const slot = root.querySelector<HTMLElement>(`[data-err-for='${name}']`);
    const input = form!.elements.namedItem(name) as HTMLElement | null;
    if (slot) slot.textContent = msg;
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function clientValidate(): boolean {
    clearErrors();
    let ok = true;
    const data = new FormData(form!);

    const name = String(data.get('name') || '').trim();
    if (name.length < 2) {
      setError('name', 'Please enter your full name.');
      ok = false;
    }

    const email = String(data.get('email') || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('email', 'Please enter a valid business email.');
      ok = false;
    }

    const website = String(data.get('website') || '').trim();
    if (website && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(website)) {
      setError('website', 'Please enter a valid URL, or leave this blank.');
      ok = false;
    }

    const service = String(data.get('service') || '');
    if (!service) {
      setError('service', 'Please choose a service.');
      ok = false;
    }

    const details = String(data.get('details') || '').trim();
    if (details.length < 10) {
      setError('details', 'Please add a few details about your project.');
      ok = false;
    }

    if (!ok) {
      const firstInvalid = form!.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
    }
    return ok;
  }

  function showSuccess(message?: string) {
    if (errorBox) errorBox.hidden = true;
    if (successMsg && message) {
      // Keep the anchor fallback but swap the leading sentence.
      const anchor = successMsg.querySelector('a');
      successMsg.textContent = message + ' ';
      if (anchor) successMsg.append(anchor);
    }
    if (success) success.hidden = false;
    form?.setAttribute('hidden', '');
    success?.querySelector<HTMLElement>('h3')?.focus?.();
  }

  function showError(message: string) {
    if (success) success.hidden = true;
    if (errorMsg) errorMsg.textContent = message;
    if (errorBox) errorBox.hidden = false;
    form?.removeAttribute('hidden');
  }

  function setBusy(busy: boolean) {
    form!.classList.toggle('busy', busy);
    if (submitBtn) submitBtn.disabled = busy;
    if (submitLabel) submitLabel.textContent = busy ? 'Sending…' : 'Send enquiry';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBox) errorBox.hidden = true;
    if (!clientValidate()) return;

    if (elapsed) elapsed.value = String(Date.now() - started);
    setBusy(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form!))),
      });
      const data = (await res.json().catch(() => ({}))) as ApiOk | ApiFail;

      if (res.ok && data.ok) {
        showSuccess(data.message ? `${data.message}` : undefined);
        form!.reset();
        return;
      }

      const fail = data as ApiFail;
      if ('errors' in fail && fail.errors) {
        clearErrors();
        Object.entries(fail.errors).forEach(([field, msg]) => setError(field, msg));
        const firstInvalid = form!.querySelector<HTMLElement>('[aria-invalid="true"]');
        firstInvalid?.focus();
      } else {
        showError(fail.message || 'We could not send your message right now.');
      }
    } catch {
      showError('We could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  });

  anotherBtn?.addEventListener('click', () => {
    if (success) success.hidden = true;
    form?.removeAttribute('hidden');
    form!.querySelector<HTMLElement>('input[name="name"]')?.focus();
  });
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-contact-form]').forEach(initForm);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
