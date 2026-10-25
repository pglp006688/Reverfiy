(function () {
  if (window.__reverfiyLoaded) return;
  window.__reverfiyLoaded = true;

  var loadedAt = Date.now();

  var css = `
  #reverfiy-overlay{position:fixed;inset:0;z-index:2147483647;background:rgba(15,17,22,.55);
    backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;
    font-family:system-ui,-apple-system,"Segoe UI",sans-serif;transition:opacity .4s}
  #reverfiy-overlay .reverfiy-card{width:340px;max-width:calc(100vw - 32px);background:#fff;
    border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.35);padding:20px}
  #reverfiy-overlay .reverfiy-row{display:flex;gap:12px;align-items:flex-start}
  #reverfiy-overlay .reverfiy-icon{width:28px;height:28px;flex:0 0 28px;border-radius:50%;
    background:#f6821f;color:#fff;display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:15px}
  #reverfiy-overlay .reverfiy-host{font-size:13px;font-weight:600;color:#111;word-break:break-all}
  #reverfiy-overlay .reverfiy-msg{font-size:13px;color:#555;margin-top:4px;line-height:1.4}
  #reverfiy-overlay .reverfiy-btn{margin-top:16px;width:100%;padding:10px 14px;
    border:1px solid #d9d9d9;border-radius:6px;background:#f7f7f7;color:#111;font-size:14px;
    font-weight:600;cursor:pointer;transition:.2s}
  #reverfiy-overlay .reverfiy-btn:hover{background:#eee}
  #reverfiy-overlay .reverfiy-btn:disabled{opacity:.7;cursor:default}
  #reverfiy-overlay .reverfiy-btn.ok{background:#e8f5e9;border-color:#66bb6a;color:#2e7d32}
  #reverfiy-overlay .reverfiy-btn.err{background:#fdecea;border-color:#ef5350;color:#c62828}
  `;

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.id = 'reverfiy-overlay';
  overlay.innerHTML =
    '<div class="reverfiy-card">' +
      '<div class="reverfiy-row">' +
        '<div class="reverfiy-icon">✓</div>' +
        '<div>' +
          '<div class="reverfiy-host">' + location.hostname + '</div>' +
          '<div class="reverfiy-msg">本网站启用了 Reverfiy，请完成人机验证</div>' +
        '</div>' +
      '</div>' +
      '<button class="reverfiy-btn" id="reverfiy-btn">我是真人</button>' +
    '</div>';
  document.documentElement.appendChild(overlay);
  document.documentElement.style.overflow = 'hidden';

  var btn = overlay.querySelector('#reverfiy-btn');

  btn.addEventListener('click', function () {
    if (navigator.webdriver || Date.now() - loadedAt < 300) return fail();

    btn.disabled = true;
    btn.textContent = '验证中…';
    setTimeout(function () {
      btn.textContent = '验证成功';
      btn.classList.add('ok');
      setTimeout(function () {
        overlay.style.opacity = '0';
        setTimeout(function () {
          overlay.remove();
          document.documentElement.style.overflow = '';
        }, 400);
      }, 400);
    }, 600);
  });

  function fail() {
    btn.classList.add('err');
    btn.textContent = '验证失败，请重试';
    setTimeout(function () {
      btn.classList.remove('err');
      btn.textContent = '我是真人';
    }, 1500);
  }
})();
