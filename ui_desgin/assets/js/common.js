/* ==========================================================================
   common.js · 双端共用的轻量交互（无依赖、可 file:// 直接打开）
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-ready');

  var ICONS = {
    ok: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 6.5"/></svg>',
    info: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
    warn: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4z"/><path d="M12 9v5M12 17v.5"/></svg>',
    error: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>'
  };

  function toast(message, type, duration) {
    var stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    var el = document.createElement('div');
    var kind = type || 'ok';
    el.className = 'toast' + (kind === 'ok' ? '' : ' toast--' + kind);
    el.innerHTML = (ICONS[kind] || ICONS.ok) + '<span></span>';
    el.querySelector('span').textContent = message;
    stack.appendChild(el);
    var life = duration || 2600;
    window.setTimeout(function () {
      el.classList.add('is-leaving');
      window.setTimeout(function () { el.remove(); }, reduceMotion ? 20 : 220);
    }, life);
  }

  /* 任意按钮 data-toast="文案" 即可获得反馈 */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-toast]');
    if (trigger) {
      e.preventDefault();
      toast(trigger.getAttribute('data-toast'), trigger.getAttribute('data-toast-type') || 'ok');
      return;
    }
    var dummy = e.target.closest('a[href="#"]');
    if (dummy) e.preventDefault();
  });

  /* Esc 关闭上层弹层，并恢复页面滚动 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelectorAll('.drawer.is-open, .modal.is-open, .overlay.is-open, .sheet.is-open, .sheet-layer.is-open');
    if (!open.length) return;
    open.forEach(function (node) { node.classList.remove('is-open'); });
    document.body.style.overflow = '';
  });

  /* 焦点可见性提示：仅键盘 */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') document.documentElement.classList.add('using-keyboard');
  });
  document.addEventListener('mousedown', function () {
    document.documentElement.classList.remove('using-keyboard');
  });

  /* 演示用状态切换的统一入口（后台各表格调用） */
  function setListState(scope, state) {
    if (!scope) return;
    var states = scope.querySelectorAll('[data-list-state]');
    if (!states.length) return;
    states.forEach(function (el) {
      el.hidden = el.getAttribute('data-list-state') !== state;
    });
    var buttons = scope.querySelectorAll('[data-state-switch]');
    buttons.forEach(function (btn) {
      var on = btn.getAttribute('data-state-switch') === state;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  window.UI = {
    toast: toast,
    reduceMotion: reduceMotion,
    setListState: setListState
  };
})();
