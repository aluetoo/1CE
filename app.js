(() => {
  const cfg = window.SUPABASE_CONFIG || {};
  const ready = Boolean(cfg.url && cfg.publishableKey && window.supabase);
  const client = ready ? window.supabase.createClient(cfg.url, cfg.publishableKey) : null;
  window.class1CE = { client };

  const notify = (message) => {
    let el = document.querySelector('[data-app-notice]');
    if (!el) {
      el = document.createElement('div');
      el.dataset.appNotice = 'true';
      el.className = 'fixed bottom-4 right-4 z-[100] max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl';
      document.body.appendChild(el);
    }
    el.textContent = message;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.remove(), 4500);
  };

  const requireAuth = async () => {
    if (!client) { notify('Supabase n’est pas configuré : ajoute supabase-config.js.'); return null; }
    const { data: { user } } = await client.auth.getUser();
    if (!user) { notify('Connecte-toi avec ton compte de classe pour participer.'); return null; }
    return user;
  };

  const messageInput = document.querySelector('#chat-input, #chatInput');
  const sendButton = messageInput?.closest('form')?.querySelector('button[type="submit"]') || document.querySelector('[data-send-message]');
  const sendMessage = async () => {
    const body = messageInput?.value.trim();
    if (!body) return;
    const user = await requireAuth();
    if (!user) return;
    const { error } = await client.from('messages').insert({ author_id: user.id, content: body });
    if (error) { notify('Le message n’a pas pu être envoyé.'); return; }
    messageInput.value = '';
    notify('Message envoyé dans le salon 1CE.');
  };
  if (messageInput) messageInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  if (sendButton) sendButton.addEventListener('click', e => { e.preventDefault(); sendMessage(); });

  const postInput = document.querySelector('textarea');
  const postButton = postInput && [...document.querySelectorAll('button')].find(b => /publier|poster|partager/i.test(b.textContent));
  if (postInput && postButton) postButton.addEventListener('click', async () => {
    const body = postInput.value.trim();
    if (!body) return;
    const user = await requireAuth();
    if (!user) return;
    const { error } = await client.from('posts').insert({ author_id: user.id, content: body });
    if (error) { notify('La publication n’a pas pu être enregistrée.'); return; }
    postInput.value = '';
    notify('Publication enregistrée dans Supabase.');
  });
})();

