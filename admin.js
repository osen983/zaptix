/**
 * ============================================================
 * ZAPTIX — admin.js
 * ============================================================
 * كل المنطق الخاص بلوحة تحكم المسؤول.
 * هذا الملف يُحمَّل فقط من داخل admin.html.
 *
 * الوظائف الرئيسية:
 *  - التحقق من الجلسة (حماية الصفحة)
 *  - عرض / إضافة / تعديل / حذف المنتجات
 *  - إدارة إعدادات المتجر
 *  - تغيير كلمة المرور
 *  - تصدير / استيراد النسخة الاحتياطية
 *  - الإحصائيات
 * ============================================================
 */

/* ══════════════════════════════════════════════════════════
   1. حماية الصفحة — يجب الدخول من login.html أولاً
   ══════════════════════════════════════════════════════════ */
(function guardPage() {
  if (sessionStorage.getItem('zaptix_admin_session') !== 'active') {
    window.location.href = 'login.html';
  }
})();

/* ══════════════════════════════════════════════════════════
   2. المتغيرات العامة
   ══════════════════════════════════════════════════════════ */
let currentTab      = 'products';   // التبويب الحالي
let editingProductId = null;        // id المنتج اللي بيتعدّل حالياً
let productImageB64  = '';          // الصورة المرفوعة (base64)
let currentFilter    = 'all';       // فلتر جدول المنتجات

/* ══════════════════════════════════════════════════════════
   3. تهيئة الصفحة
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderAdminName();
  loadStats();
  renderProductsTable();
  loadSettingsForm();
  applyLiveColors();
});

/* اسم المسؤول في الهيدر */
function renderAdminName() {
  const nameEl = document.getElementById('admin-name');
  if (nameEl) {
    nameEl.textContent = sessionStorage.getItem('zaptix_admin_user') || 'admin';
  }
}

/* ══════════════════════════════════════════════════════════
   4. التبويبات (Tabs)
   ══════════════════════════════════════════════════════════ */
function switchTab(tab) {
  /* إخفاء كل التبويبات */
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  /* إظهار التبويب المطلوب */
  const panel = document.getElementById('tab-' + tab);
  const link  = document.getElementById('link-' + tab);
  if (panel) panel.classList.remove('hidden');
  if (link)  link.classList.add('active');

  currentTab = tab;

  /* تحميل بيانات التبويب */
  if (tab === 'products')  renderProductsTable();
  if (tab === 'settings')  loadSettingsForm();
  if (tab === 'stats')     loadStats();
  if (tab === 'backup')    renderBackupInfo();

  /* إغلاق السايدبار على موبايل */
  document.getElementById('sidebar').classList.remove('open');
}

/* ══════════════════════════════════════════════════════════
   5. الإحصائيات
   ══════════════════════════════════════════════════════════ */
function loadStats() {
  const stats = getAdminStats();
  const products = getProducts();

  setEl('stat-total',    stats.total);
  setEl('stat-enabled',  stats.enabled);
  setEl('stat-disabled', stats.disabled);
  setEl('stat-low',      stats.lowStock);
  setEl('stat-out',      stats.outOfStock);
  setEl('stat-value',    stats.totalInventoryValue.toLocaleString('ar-EG') + ' ج.م');

  if (stats.lastEdited) {
    const d = new Date(stats.lastEdited.time);
    setEl('stat-last', `${stats.lastEdited.name} — ${d.toLocaleDateString('ar-EG')}`);
  } else {
    setEl('stat-last', 'لا توجد تعديلات بعد');
  }

  /* مخطط الكاتيجوري */
  renderCategoryChart(products);
}

function renderCategoryChart(products) {
  const cats = {};
  products.forEach(p => {
    const name = p.category === 'old-tech' ? '🕹️ Old Tech' : '⚡ Modern Tech';
    cats[name] = (cats[name] || 0) + 1;
  });
  const wrap = document.getElementById('cat-chart');
  if (!wrap) return;
  wrap.innerHTML = Object.entries(cats).map(([name, count]) => `
    <div class="chart-row">
      <span class="chart-label">${name}</span>
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="width:${Math.round((count/products.length)*100)}%"></div>
      </div>
      <span class="chart-count">${count}</span>
    </div>`).join('');
}

/* ══════════════════════════════════════════════════════════
   6. جدول المنتجات
   ══════════════════════════════════════════════════════════ */
function renderProductsTable(filter) {
  if (filter !== undefined) currentFilter = filter;
  const wrap = document.getElementById('products-table-body');
  if (!wrap) return;

  let products = getProducts();

  /* تطبيق الفلتر */
  if (currentFilter === 'modern')   products = products.filter(p => p.category === 'modern-tech');
  if (currentFilter === 'old')      products = products.filter(p => p.category === 'old-tech');
  if (currentFilter === 'low')      products = products.filter(p => p.stock < 10 && p.stock > 0);
  if (currentFilter === 'out')      products = products.filter(p => p.stock === 0);
  if (currentFilter === 'disabled') products = products.filter(p => p.enabled === false);

  /* تطبيق البحث */
  const q = (document.getElementById('search-products')?.value || '').trim();
  if (q) products = products.filter(p =>
    p.name.includes(q) || (p.nameShort||'').includes(q) || String(p.id) === q
  );

  if (!products.length) {
    wrap.innerHTML = `
      <tr><td colspan="8" style="text-align:center;padding:3rem;color:var(--text-muted)">
        <span style="font-size:2rem;display:block;margin-bottom:0.75rem">📦</span>
        لا توجد منتجات تطابق البحث
      </td></tr>`;
    return;
  }

  wrap.innerHTML = products.map(p => {
    const img = p.image
      ? `<img src="${p.image}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:8px;border:1px solid var(--border)">`
      : `<span style="font-size:2rem;line-height:1">${p.emoji || '📦'}</span>`;

    const status = p.enabled === false
      ? '<span class="badge badge-red">معطّل</span>'
      : p.stock === 0
        ? '<span class="badge badge-red">نفد</span>'
        : p.stock < 10
          ? `<span class="badge badge-orange">منخفض ${p.stock}</span>`
          : `<span class="badge badge-green">${p.stock}</span>`;

    const save = p.oldPrice ? Math.round((1-p.price/p.oldPrice)*100) : 0;

    return `
    <tr id="row-${p.id}">
      <td class="td-img">${img}</td>
      <td class="td-name">
        <div class="prod-name-cell">
          <span class="prod-name">${p.name}</span>
          <span class="prod-cat">${p.category === 'old-tech' ? '🕹️ Old Tech' : '⚡ Modern Tech'}</span>
        </div>
      </td>
      <td class="td-price">
        <span class="price-cur">${p.price.toLocaleString('ar-EG')} ج.م</span>
        ${p.oldPrice ? `<span class="price-old">${p.oldPrice.toLocaleString('ar-EG')}</span>` : ''}
        ${save > 0 ? `<span class="price-save">-${save}%</span>` : ''}
      </td>
      <td class="td-stock">${status}</td>
      <td class="td-flags">
        ${p.featured    ? '<span class="flag">⭐</span>' : ''}
        ${p.bestseller  ? '<span class="flag">🔥</span>' : ''}
        ${p.isNew       ? '<span class="flag">✨</span>' : ''}
        ${p.limitedEdition ? '<span class="flag">💎</span>' : ''}
      </td>
      <td class="td-rating">
        <span style="color:#F59E0B">★</span> ${p.rating || 0}
        <span style="color:var(--text-subtle);font-size:0.75rem">(${(p.reviews||0).toLocaleString()})</span>
      </td>
      <td class="td-toggle">
        <label class="toggle-switch" title="${p.enabled===false ? 'تفعيل' : 'تعطيل'}">
          <input type="checkbox" ${p.enabled !== false ? 'checked' : ''}
            onchange="toggleProductEnabled(${p.id}, this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td class="td-actions">
        <button class="btn btn-icon btn-warning" onclick="openEditModal(${p.id})" title="تعديل">✏️</button>
        <button class="btn btn-icon btn-danger"  onclick="confirmDelete(${p.id})" title="حذف">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

/* تفعيل / تعطيل منتج من الجدول مباشرة */
function toggleProductEnabled(id, enabled) {
  updateProduct(id, { enabled });
  showToast(enabled ? 'تم تفعيل المنتج ✅' : 'تم تعطيل المنتج', enabled ? 'success' : 'info');
  loadStats();
}

/* ══════════════════════════════════════════════════════════
   7. نموذج الإضافة / التعديل
   ══════════════════════════════════════════════════════════ */
function openAddModal() {
  editingProductId = null;
  productImageB64  = '';
  resetProductForm();
  setEl('modal-product-title', '➕ إضافة منتج جديد');
  setEl('modal-save-btn-text', 'إضافة المنتج');
  openModal('modal-product');
}

function openEditModal(id) {
  const p = getProductById(id);
  if (!p) return;
  editingProductId = id;
  productImageB64  = p.image || '';
  fillProductForm(p);
  setEl('modal-product-title', `✏️ تعديل: ${p.nameShort || p.name}`);
  setEl('modal-save-btn-text', 'حفظ التعديلات');
  openModal('modal-product');
}

function fillProductForm(p) {
  setVal('f-name',        p.name         || '');
  setVal('f-name-short',  p.nameShort    || '');
  setVal('f-category',    p.category     || 'modern-tech');
  setVal('f-price',       p.price        || '');
  setVal('f-old-price',   p.oldPrice     || '');
  setVal('f-stock',       p.stock        || '');
  setVal('f-emoji',       p.emoji        || '📦');
  setVal('f-badge',       p.badge        || '');
  setVal('f-badge-color', p.badgeColor   || '');
  setVal('f-desc',        p.desc         || '');
  setVal('f-features',    (p.features    || []).join('\n'));
  setVal('f-rating',      p.rating       || 5);
  setVal('f-reviews',     p.reviews      || 0);
  setChk('f-featured',    p.featured     || false);
  setChk('f-bestseller',  p.bestseller   || false);
  setChk('f-new',         p.isNew        || false);
  setChk('f-limited',     p.limitedEdition || false);
  setChk('f-enabled',     p.enabled !== false);

  /* معاينة الصورة */
  const preview = document.getElementById('img-preview');
  if (p.image && preview) {
    preview.src = p.image;
    preview.classList.remove('hidden');
  } else if (preview) {
    preview.classList.add('hidden');
  }
}

function resetProductForm() {
  const fields = ['f-name','f-name-short','f-price','f-old-price','f-badge',
                  'f-badge-color','f-desc','f-features'];
  fields.forEach(id => setVal(id, ''));
  setVal('f-category',    'modern-tech');
  setVal('f-emoji',       '📦');
  setVal('f-stock',       0);
  setVal('f-rating',      5);
  setVal('f-reviews',     0);
  setChk('f-featured',    false);
  setChk('f-bestseller',  false);
  setChk('f-new',         false);
  setChk('f-limited',     false);
  setChk('f-enabled',     true);
  const preview = document.getElementById('img-preview');
  if (preview) { preview.classList.add('hidden'); preview.src = ''; }
  const fileInput = document.getElementById('f-image');
  if (fileInput) fileInput.value = '';
}

function saveProductForm() {
  /* جمع القيم */
  const name      = getVal('f-name').trim();
  const priceStr  = getVal('f-price').trim();
  const stockStr  = getVal('f-stock').trim();

  /* التحقق من الحقول الإلزامية */
  if (!name) { showToast('اسم المنتج مطلوب', 'error'); return; }
  if (!priceStr || isNaN(Number(priceStr))) { showToast('السعر غير صحيح', 'error'); return; }

  const featuresRaw = getVal('f-features').trim();
  const features = featuresRaw ? featuresRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const product = {
    name:          name,
    nameShort:     getVal('f-name-short').trim() || name,
    category:      getVal('f-category'),
    price:         Number(priceStr),
    oldPrice:      getVal('f-old-price') ? Number(getVal('f-old-price')) : null,
    stock:         Number(stockStr) || 0,
    emoji:         getVal('f-emoji') || '📦',
    image:         productImageB64 || '',
    badge:         getVal('f-badge').trim(),
    badgeColor:    getVal('f-badge-color'),
    desc:          getVal('f-desc').trim(),
    features,
    rating:        Number(getVal('f-rating')) || 5,
    reviews:       Number(getVal('f-reviews')) || 0,
    featured:      getChk('f-featured'),
    bestseller:    getChk('f-bestseller'),
    isNew:         getChk('f-new'),
    limitedEdition:getChk('f-limited'),
    enabled:       getChk('f-enabled'),
  };

  if (editingProductId) {
    updateProduct(editingProductId, product);
    showToast('تم تحديث المنتج بنجاح ✅', 'success');
  } else {
    addProduct(product);
    showToast('تم إضافة المنتج بنجاح ✅', 'success');
  }

  closeModal('modal-product');
  renderProductsTable();
  loadStats();
}

/* رفع صورة المنتج */
function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  /* حد أقصى للصورة: 2MB */
  if (file.size > 2 * 1024 * 1024) {
    showToast('الصورة كبيرة جداً — الحد الأقصى 2MB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    productImageB64 = e.target.result;
    const preview = document.getElementById('img-preview');
    if (preview) {
      preview.src = productImageB64;
      preview.classList.remove('hidden');
    }
    showToast('تم رفع الصورة ✅', 'success');
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  productImageB64 = '';
  const preview = document.getElementById('img-preview');
  if (preview) { preview.src = ''; preview.classList.add('hidden'); }
  const fi = document.getElementById('f-image');
  if (fi) fi.value = '';
  showToast('تم حذف الصورة', 'info');
}

/* ══════════════════════════════════════════════════════════
   8. حذف المنتج
   ══════════════════════════════════════════════════════════ */
let deleteTargetId = null;

function confirmDelete(id) {
  const p = getProductById(id);
  if (!p) return;
  deleteTargetId = id;
  setEl('delete-product-name', p.nameShort || p.name);
  openModal('modal-confirm-delete');
}

function doDelete() {
  if (!deleteTargetId) return;
  deleteProduct(deleteTargetId);
  closeModal('modal-confirm-delete');
  renderProductsTable();
  loadStats();
  showToast('تم حذف المنتج نهائياً 🗑', 'info');
  deleteTargetId = null;
}

/* ══════════════════════════════════════════════════════════
   9. إعدادات المتجر
   ══════════════════════════════════════════════════════════ */
function loadSettingsForm() {
  const s = getSettings();
  setVal('s-store-name',     s.storeName    || '');
  setVal('s-tagline',        s.storeTagline || '');
  setVal('s-whatsapp',       s.whatsapp     || '');
  setVal('s-wa-msg',         s.whatsappMsg  || '');
  setVal('s-email',          s.email        || '');
  setVal('s-phone',          s.phone        || '');
  setVal('s-facebook',       s.facebook     || '');
  setVal('s-instagram',      s.instagram    || '');
  setVal('s-tiktok',         s.tiktok       || '');
  setVal('s-primary-color',  s.primaryColor || '#0066FF');
  setVal('s-accent-color',   s.accentColor  || '#00CFFF');
  setVal('s-free-ship',      s.freeShippingMin || 500);
  setVal('s-ship-cost',      s.shippingCost || 60);
  setVal('s-currency',       s.currency     || 'ج.م');
  setVal('s-hero-headline',  s.heroHeadline || '');
  setVal('s-hero-sub',       s.heroSub      || '');
  setVal('s-offer-title',    s.offerTitle   || '');

  /* معاينة الألوان */
  applyLiveColors();
}

function saveSettings() {
  const s = getSettings();
  s.storeName       = getVal('s-store-name');
  s.storeTagline    = getVal('s-tagline');
  s.whatsapp        = getVal('s-whatsapp');
  s.whatsappMsg     = getVal('s-wa-msg');
  s.email           = getVal('s-email');
  s.phone           = getVal('s-phone');
  s.facebook        = getVal('s-facebook');
  s.instagram       = getVal('s-instagram');
  s.tiktok          = getVal('s-tiktok');
  s.primaryColor    = getVal('s-primary-color');
  s.accentColor     = getVal('s-accent-color');
  s.freeShippingMin = Number(getVal('s-free-ship')) || 500;
  s.shippingCost    = Number(getVal('s-ship-cost'))  || 60;
  s.currency        = getVal('s-currency');
  s.heroHeadline    = getVal('s-hero-headline');
  s.heroSub         = getVal('s-hero-sub');
  s.offerTitle      = getVal('s-offer-title');

  saveSettings(s);
  applyLiveColors();
  showToast('تم حفظ الإعدادات بنجاح ✅', 'success');
}

/* تطبيق الألوان المباشرة على لوحة التحكم نفسها */
function applyLiveColors() {
  const s = getSettings();
  if (s.primaryColor) {
    document.documentElement.style.setProperty('--primary', s.primaryColor);
    /* تحويل اللون لقيمة glow */
    const r = parseInt(s.primaryColor.slice(1,3),16);
    const g = parseInt(s.primaryColor.slice(3,5),16);
    const b = parseInt(s.primaryColor.slice(5,7),16);
    document.documentElement.style.setProperty('--primary-glow', `rgba(${r},${g},${b},0.4)`);
  }
}

/* تغيير كلمة المرور */
function changePassword() {
  const cur  = getVal('s-cur-pass').trim();
  const nw   = getVal('s-new-pass').trim();
  const conf = getVal('s-conf-pass').trim();

  if (!cur || !nw || !conf) { showToast('كل الحقول مطلوبة', 'error'); return; }
  const creds = JSON.parse(localStorage.getItem('zaptix_admin_creds') || '{}');
  if (cur !== creds.password) { showToast('كلمة المرور الحالية غلط', 'error'); return; }
  if (nw.length < 8) { showToast('كلمة المرور الجديدة قصيرة جداً (8 حروف على الأقل)', 'error'); return; }
  if (nw !== conf)   { showToast('كلمة المرور الجديدة غير متطابقة', 'error'); return; }

  creds.password = nw;
  localStorage.setItem('zaptix_admin_creds', JSON.stringify(creds));
  setVal('s-cur-pass', ''); setVal('s-new-pass', ''); setVal('s-conf-pass', '');
  showToast('تم تغيير كلمة المرور بنجاح 🔒', 'success');
}

/* ══════════════════════════════════════════════════════════
   10. النسخ الاحتياطية
   ══════════════════════════════════════════════════════════ */
function renderBackupInfo() {
  const products = getProducts();
  const settings = getSettings();
  setEl('backup-products-count', products.length + ' منتج');
  setEl('backup-settings-count', Object.keys(settings).length + ' إعداد');
  setEl('backup-date', new Date().toLocaleDateString('ar-EG', {
    year:'numeric', month:'long', day:'numeric',
    hour:'2-digit', minute:'2-digit'
  }));
}

function doExport() {
  const json = exportBackup();
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = new Date().toISOString().slice(0,10);
  a.href     = url;
  a.download = `zaptix-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('تم تصدير النسخة الاحتياطية ✅', 'success');
}

function doImport(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const result = importBackup(e.target.result);
    if (result.ok) {
      showToast('تم استيراد البيانات بنجاح ✅', 'success');
      renderProductsTable();
      loadStats();
      loadSettingsForm();
    } else {
      showToast('فشل الاستيراد: ' + result.error, 'error');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function resetToDefaults() {
  if (!confirm('⚠️ هيتم حذف كل التعديلات والرجوع للبيانات الافتراضية. متأكد؟')) return;
  localStorage.removeItem('zaptix_products');
  localStorage.removeItem('zaptix_settings');
  localStorage.removeItem('zaptix_last_edited');
  location.reload();
}

/* ══════════════════════════════════════════════════════════
   11. تسجيل الخروج
   ══════════════════════════════════════════════════════════ */
function doLogout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

/* ══════════════════════════════════════════════════════════
   12. الموديلات (Modals)
   ══════════════════════════════════════════════════════════ */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
/* إغلاق بالضغط خارج الموديل */
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id);
  }
});
/* إغلاق بـ Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});

/* ══════════════════════════════════════════════════════════
   13. الإشعارات (Toast)
   ══════════════════════════════════════════════════════════ */
function showToast(msg, type = 'info', sub = '') {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const icons = { success:'✅', error:'❌', info:'💡', warning:'⚠️' };
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `
    <span class="toast-icon">${icons[type] || '💡'}</span>
    <div class="toast-body">
      <div class="toast-title">${msg}</div>
      ${sub ? `<div class="toast-sub">${sub}</div>` : ''}
    </div>`;
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 3500);
}

/* ══════════════════════════════════════════════════════════
   14. أدوات مساعدة (Utilities)
   ══════════════════════════════════════════════════════════ */
function setEl(id, val)   { const e = document.getElementById(id); if (e) e.textContent = val; }
function setVal(id, val)  { const e = document.getElementById(id); if (e) e.value = val; }
function getVal(id)       { const e = document.getElementById(id); return e ? e.value : ''; }
function setChk(id, val)  { const e = document.getElementById(id); if (e) e.checked = !!val; }
function getChk(id)       { const e = document.getElementById(id); return e ? e.checked : false; }

/* تصفية الجدول عند الكتابة في البحث */
function filterTable() { renderProductsTable(); }

/* موبايل: فتح / إغلاق السايدبار */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
