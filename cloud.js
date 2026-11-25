/* CikguDocs: log masuk dan simpanan online (Supabase).
   Jika SUPABASE_URL tidak ditetapkan di pelayan, app kekal dalam mod tempatan (localStorage). */
const CLOUD = {
  mode: 'local',          // 'local' | 'cloud'
  client: null,
  user: null,
  urls: {},               // path gambar -> URL bertandatangan / dataURL sementara
  status: 'idle',         // idle | saving | saved | error | offline
  lastUpdated: null,
  _timer: null, _pending: null, _onStatus: () => {},

  async init() {
    let cfg = {};
    try { const r = await fetch('/api/config'); if (r.ok) cfg = await r.json(); } catch (e) {}
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return;
    this.mode = 'cloud';
    this.client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    const { data } = await this.client.auth.getSession();
    this.user = data.session ? data.session.user : null;
  },

  onAuthChange(cb) { if (this.client) this.client.auth.onAuthStateChange((_e, s) => cb(s ? s.user : null)); },
  async signInGoogle() {
    const { error } = await this.client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
    if (error) throw error;
  },
  async signInEmail(email) {
    const { error } = await this.client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
    if (error) throw error;
  },
  async signOut() { await this.flush(); await this.client.auth.signOut(); this.user = null; },
  async token() {
    if (this.mode !== 'cloud') return null;
    const { data } = await this.client.auth.getSession();
    return data.session ? data.session.access_token : null;
  },

  /* ---- data ---- */
  async loadData() {
    const { data, error } = await this.client.from('user_data').select('data, updated_at').eq('user_id', this.user.id).maybeSingle();
    if (error) throw error;
    if (data) this.lastUpdated = data.updated_at;
    return data;
  },
  async remoteUpdatedAt() {
    const { data } = await this.client.from('user_data').select('updated_at').eq('user_id', this.user.id).maybeSingle();
    return data ? data.updated_at : null;
  },
  queueSave(db) {
    if (this.mode !== 'cloud' || !this.user) return;
    this._pending = db;
    this._set('saving');
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.flush(), 1200);
  },
  async flush() {
    clearTimeout(this._timer);
    if (!this._pending || !this.user) return;
    const db = this._pending; this._pending = null;
    const updated_at = new Date().toISOString();
    const { error } = await this.client.from('user_data').upsert({ user_id: this.user.id, data: db, updated_at });
    if (error) { this._pending = this._pending || db; this._set(navigator.onLine ? 'error' : 'offline'); return; }
    this.lastUpdated = updated_at;
    this._set(this._pending ? 'saving' : 'saved');
  },
  hasPending() { return !!this._pending; },
  _set(s) { this.status = s; this._onStatus(s); },

  /* ---- gambar ---- */
  async uploadImage(b64, type = 'image/jpeg') {
    const bin = atob(b64); const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const path = `${this.user.id}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await this.client.storage.from('gambar').upload(path, new Blob([buf], { type }), { contentType: type, upsert: false });
    if (error) throw error;
    return path;
  },
  async signUrls(paths) {
    const need = paths.filter(p => p && !this.urls[p]);
    if (!need.length) return;
    const { data, error } = await this.client.storage.from('gambar').createSignedUrls(need, 60 * 60 * 24);
    if (error) return;
    (data || []).forEach(d => { if (d.signedUrl) this.urls[d.path] = d.signedUrl; });
  },
  deleteImage(path) { if (path && this.client) this.client.storage.from('gambar').remove([path]).catch(() => {}); },
};

/* Sumber gambar untuk dipaparkan (dataURL tempatan atau URL cloud). */
function imgSrc(g) { return (g && (g.data || CLOUD.urls[g.path])) || ''; }
/* Base64 JPEG bagi gambar (untuk dihantar ke AI). */
async function imgB64(g) {
  if (g.data) return g.data.split(',')[1];
  const blob = await (await fetch(imgSrc(g))).blob();
  return await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = no; r.readAsDataURL(blob); });
}
