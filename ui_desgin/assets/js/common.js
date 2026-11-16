/* ==========================================================================
   common.js · 双端共用的轻量交互（无依赖、可 file:// 直接打开）
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-ready');

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

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

  /* ---------------- 浮层：滚动锁 / 焦点 / Esc ---------------- */
  var OVERLAY_SEL = '.drawer.is-open, .modal.is-open, .overlay.is-open, .sheet.is-open, .sheet-layer.is-open';
  var lastFocus = null;

  function overlayStack() {
    return Array.prototype.slice.call(document.querySelectorAll(OVERLAY_SEL));
  }

  function focusables(root) {
    return Array.prototype.slice
      .call(root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }

  function openOverlay(layer, opts) {
    if (!layer) return;
    var o = opts || {};
    if (o.origin) lastFocus = o.origin;
    else if (!overlayStack().length && document.activeElement && document.activeElement !== document.body) {
      lastFocus = document.activeElement;
    }
    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var panel = layer.querySelector('[data-autofocus]') ||
      layer.querySelector('.modal__panel, .drawer, .sheet') || layer;
    var list = focusables(panel);
    var target = o.focus || list[0];
    if (target) target.focus({ preventScroll: true });
  }

  function closeOverlay(layer) {
    if (!layer || !layer.classList.contains('is-open')) return;
    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');
    /* 临时浮层（如动态确认框）自行清理，避免重复 id 与孤立节点 */
    layer.dispatchEvent(new CustomEvent('ui:overlayclose'));

    var rest = overlayStack();
    if (rest.length) {
      /* 仍有下层浮层：仅当焦点已丢失时才回填，避免抢走刚恢复的焦点 */
      var ae = document.activeElement;
      if (!ae || ae === document.body) {
        var top = rest[rest.length - 1];
        var panel = top.querySelector('[data-autofocus]') || top.querySelector('.modal__panel, .drawer, .sheet') || top;
        var list = focusables(panel);
        if (list[0]) list[0].focus({ preventScroll: true });
      }
      return;
    }
    document.body.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function closeTopOverlay() {
    var stack = overlayStack();
    if (!stack.length) return;
    closeOverlay(stack[stack.length - 1]);
  }

  function closeOverlays() {
    var stack = overlayStack();
    for (var i = stack.length - 1; i >= 0; i--) closeOverlay(stack[i]);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!overlayStack().length) return;
      e.preventDefault();
      closeTopOverlay();
      return;
    }
    if (e.key !== 'Tab') return;
    var stack = overlayStack();
    if (!stack.length) return;
    var top = stack[stack.length - 1];
    var list = focusables(top);
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ---------------- 危险操作二次确认 ---------------- */
  function confirmAction(opts) {
    var o = opts || {};
    var layer = document.createElement('div');
    layer.className = 'modal confirm-layer';
    layer.setAttribute('role', 'presentation');
    layer.innerHTML =
      '<div class="modal__panel" role="alertdialog" aria-modal="true" aria-labelledby="cfm-title" aria-describedby="cfm-desc">' +
      '<div class="modal__head"><h2 class="modal__title" id="cfm-title"></h2></div>' +
      '<div class="modal__body"><p class="modal__desc" id="cfm-desc"></p></div>' +
      '<div class="modal__foot">' +
      '<button class="btn btn--secondary" type="button" data-cfm="no">' + (o.cancelText || '取消') + '</button>' +
      '<button class="btn btn--danger" type="button" data-cfm="yes" data-autofocus>' + (o.confirmText || '确认删除') + '</button>' +
      '</div></div>';
    layer.querySelector('.modal__title').textContent = o.title || '确认操作';
    layer.querySelector('.modal__desc').textContent = o.message || '';
    document.body.appendChild(layer);
    var trigger = document.activeElement;
    layer.addEventListener('ui:overlayclose', function () {
      layer.remove();
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
    }, { once: true });
    openOverlay(layer);

    function done(ok) {
      closeOverlay(layer);
      if (ok && typeof o.onConfirm === 'function') o.onConfirm();
    }
    layer.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cfm]');
      if (b) { done(b.getAttribute('data-cfm') === 'yes'); return; }
      if (e.target === layer) done(false);
    });
    return layer;
  }

  /* ---------------- 数字滚动（仪表盘用） ---------------- */
  function countUp(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-countup]');
    if (!nodes.length) return;
    nodes.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-countup'));
      if (isNaN(target)) return;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var comma = el.hasAttribute('data-comma');
      var dec = (String(el.getAttribute('data-countup')).split('.')[1] || '').length;
      function fmt(v) {
        var n = dec ? Number(v).toFixed(dec) : String(Math.round(v));
        if (comma) n = dec ? Number(n).toLocaleString('en-US', { minimumFractionDigits: dec }) : Number(n).toLocaleString('en-US');
        return prefix + n + suffix;
      }
      if (reduceMotion) { el.textContent = fmt(target); return; }
      var start = null;
      var dur = 900;
      function step(now) {
        if (start === null) start = now;
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased);
        if (p < 1) window.requestAnimationFrame(step);
        else el.textContent = fmt(target);
      }
      window.requestAnimationFrame(step);
    });
  }

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

  /* ------------------------------------------------------------------
     语义同步：tabstrip 补 aria-selected，radio 组补 radiogroup 角色
     各视图会重绘 innerHTML，因此用 MutationObserver 增量补齐。
     ------------------------------------------------------------------ */

  function syncSemantics() {
    $$('.tabstrip').forEach(function (strip) {
      if (!strip.hasAttribute('role')) strip.setAttribute('role', 'tablist');
      strip.querySelectorAll('.tabstrip__item').forEach(function (tab) {
        if (!tab.hasAttribute('role')) tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', tab.classList.contains('is-active') ? 'true' : 'false');
      });
    });
    $$('[role="radio"]').forEach(function (radio) {
      var group = radio.parentElement;
      if (group) {
        var gr = group.getAttribute('role');
        if (!gr || gr === 'group') group.setAttribute('role', 'radiogroup');
      }
      radio.setAttribute('aria-checked', radio.classList.contains('is-active') ? 'true' : 'false');
    });
  }

  function semanticsRelevant(node) {
    if (!node || node.nodeType !== 1) return false;
    if (node.classList.contains('is-active')) return true;
    return !!(node.classList.contains('tabstrip') || node.querySelector('.tabstrip, [role="radio"]'));
  }

  var semanticsObserver = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === 'childList') {
        for (var j = 0; j < m.addedNodes.length; j++) {
          if (semanticsRelevant(m.addedNodes[j])) { syncSemantics(); return; }
        }
      } else if (m.target.closest && m.target.closest('.tabstrip, [role="radiogroup"]')) {
        syncSemantics();
        return;
      }
    }
  });

  syncSemantics();
  semanticsObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  window.UI = {
    toast: toast,
    reduceMotion: reduceMotion,
    setListState: setListState,
    openOverlay: openOverlay,
    closeOverlays: closeOverlays,
    confirmAction: confirmAction,
    countUp: countUp,
    syncSemantics: syncSemantics
  };
})();
