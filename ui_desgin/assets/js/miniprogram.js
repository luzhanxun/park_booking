/* 我有一亩田 · 小程序原型交互
 * 纯原生 JS，无构建、无外部依赖，可直接双击 index.html 运行。
 * 状态集中于 state，所有屏幕共享同一份演示数据。
 */
(function () {
  'use strict';

  var root = document.querySelector('.mp-page');
  if (!root) return;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------- 基础工具 ---------------- */

  var DOW = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function startOfDay(d) {
    var x = new Date(d.getTime());
    x.setHours(0, 0, 0, 0);
    return x;
  }

  var TODAY = startOfDay(new Date());

  function dayAt(offset) {
    var d = new Date(TODAY.getTime());
    d.setDate(d.getDate() + offset);
    return d;
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function dateInfo(d) {
    return {
      date: d,
      iso: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
      stamp: '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()),
      day: d.getDate() + ' 日',
      md: (d.getMonth() + 1) + '/' + d.getDate(),
      label: (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日',
      dow: DOW[d.getDay()]
    };
  }

  var DATES = [];
  for (var di = 0; di < 14; di++) DATES.push(dateInfo(dayAt(di)));

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function icon(id, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  var SEAT_STATE = {
    ok: { label: '可预约', cls: '', badge: 'badge--leaf', map: '', row: '' },
    low: { label: '剩余少量', cls: 'is-low', badge: 'badge--wheat', map: 'mseat--low', row: 'seat-row--low' },
    full: { label: '已约满', cls: 'is-full', badge: 'badge--neutral', map: 'mseat--full', row: 'seat-row--full' },
    maint: { label: '维护中', cls: 'is-maint', badge: 'badge--rust', map: 'mseat--maint', row: 'seat-row--maint' },
    closed: { label: '临时关闭', cls: 'is-closed', badge: 'badge--neutral', map: 'mseat--closed', row: 'seat-row--closed' }
  };

  var SLOTS = [
    { id: 'day', name: '整日场', time: '08:00–18:00' },
    { id: 'am', name: '上午场', time: '08:00–12:00' },
    { id: 'pm', name: '下午场', time: '13:00–18:00' }
  ];

  var STATUS = {
    unpaid: { label: '待支付', badge: 'badge--wheat' },
    unused: { label: '待使用', badge: 'badge--leaf' },
    used: { label: '已核销', badge: 'badge--cyan' },
    cancelled: { label: '已取消', badge: 'badge--neutral' },
    refunded: { label: '已退款', badge: 'badge--neutral' },
    expired: { label: '已过期', badge: 'badge--neutral' }
  };

  /* ---------------- 演示数据 ---------------- */

  function rectSeat(id, name, x, y, w, h, cap, extra) {
    var seat = { id: id, name: name, x: x, y: y, w: w, h: h, tx: x + w / 2, ty: y + h / 2, cap: cap, premium: 0, state: 'ok' };
    if (extra) for (var k in extra) seat[k] = extra[k];
    return seat;
  }

  var PARKS = [
    {
      id: 'p1',
      name: '斗门水乡公园',
      area: '斗门区',
      dist: '12.4km',
      hours: '08:00–18:00',
      kind: 'water',
      tags: ['水乡', '亲子', '可带宠物'],
      cover: '../assets/img/park-cover-1.svg',
      map: '../assets/img/park-map-1.svg',
      intro: '河涌环绕的水乡营地，草坪开阔，适合家庭野餐与轻量露营。',
      base: 118,
      facilities: {
        roads: ['M14,0 C14,90 46,150 46,239', 'M0,120 H358'],
        gates: [{ x: 336, y: 212, label: '入口' }],
        wcs: [{ x: 300, y: 6, w: 30, h: 20 }]
      },
      seats: [
        rectSeat('A01', '水岸营位', 26, 44, 54, 30, 4),
        rectSeat('A02', '水岸营位', 98, 44, 54, 30, 4),
        rectSeat('A03', '水岸营位', 170, 44, 54, 30, 4, { premium: 20 }),
        rectSeat('A04', '水岸营位', 242, 44, 54, 30, 6, { state: 'low' }),
        rectSeat('B01', '林间营位', 26, 96, 54, 30, 4, { state: 'full' }),
        rectSeat('B02', '林间营位', 98, 96, 54, 30, 4),
        rectSeat('B03', '林间营位', 170, 96, 54, 30, 4, { state: 'maint' }),
        rectSeat('B04', '林间营位', 242, 96, 54, 30, 6),
        rectSeat('C01', '草坪营位', 26, 148, 54, 30, 6),
        rectSeat('C02', '草坪营位', 98, 148, 54, 30, 6, { state: 'low' }),
        rectSeat('C03', '草坪营位', 170, 148, 54, 30, 8, { premium: 30 }),
        rectSeat('C04', '草坪营位', 242, 148, 54, 30, 8, { state: 'closed' })
      ]
    },
    {
      id: 'p2',
      name: '黄杨河湿地公园',
      area: '金湾区',
      dist: '21.6km',
      hours: '07:30–18:30',
      kind: 'wetland',
      tags: ['湿地', '观鸟', '骑行'],
      cover: '../assets/img/park-cover-2.svg',
      map: '../assets/img/park-map-2.svg',
      intro: '沿黄杨河而建的湿地营地，芦苇与观鸟栈道环绕，安静少光污染。',
      base: 138,
      facilities: {
        roads: ['M0,68 H358', 'M180,0 V239'],
        gates: [{ x: 22, y: 22, label: '入口' }],
        wcs: [{ x: 300, y: 196, w: 30, h: 20 }]
      },
      seats: [
        rectSeat('A01', '湿地营位', 22, 36, 56, 28, 4),
        rectSeat('A02', '湿地营位', 96, 36, 56, 28, 4, { state: 'low' }),
        rectSeat('A03', '湿地营位', 170, 36, 56, 28, 4),
        rectSeat('A04', '湿地营位', 244, 36, 56, 28, 4),
        rectSeat('B01', '观鸟营位', 22, 86, 56, 28, 4),
        rectSeat('B02', '观鸟营位', 96, 86, 56, 28, 4, { premium: 20 }),
        rectSeat('B03', '观鸟营位', 170, 86, 56, 28, 4, { state: 'full' }),
        rectSeat('B04', '观鸟营位', 244, 86, 56, 28, 4, { premium: 20 }),
        rectSeat('C01', '林荫营位', 22, 136, 56, 28, 6),
        rectSeat('C02', '林荫营位', 96, 136, 56, 28, 6),
        rectSeat('C03', '林荫营位', 170, 136, 56, 28, 6, { state: 'maint' }),
        rectSeat('C04', '林荫营位', 244, 136, 56, 28, 6),
        rectSeat('D01', '亲水营位', 22, 186, 56, 28, 6, { premium: 30 }),
        rectSeat('D02', '亲水营位', 96, 186, 56, 28, 6, { premium: 30 }),
        rectSeat('D03', '亲水营位', 170, 186, 56, 28, 6, { premium: 30, state: 'low' }),
        rectSeat('D04', '亲水营位', 244, 186, 56, 28, 6, { premium: 30, state: 'closed' })
      ]
    },
    {
      id: 'p3',
      name: '霞山梯田营地',
      area: '斗门区',
      dist: '28.9km',
      hours: '09:00–21:00',
      kind: 'terrace',
      tags: ['梯田', '日落', '篝火'],
      cover: '../assets/img/park-cover-3.svg',
      map: '../assets/img/park-map-3.svg',
      intro: '依山而建的梯田营地，视野开阔可看日落，夜间有集中篝火区。',
      base: 168,
      facilities: {
        roads: ['M0,232 C120,232 160,120 358,60'],
        gates: [{ x: 330, y: 208, label: '入口' }],
        wcs: [{ x: 24, y: 26, w: 30, h: 20 }]
      },
      seats: [
        rectSeat('A01', '梯田营位', 30, 40, 62, 30, 4),
        rectSeat('A02', '梯田营位', 116, 40, 62, 30, 4, { state: 'low' }),
        rectSeat('A03', '梯田营位', 202, 40, 62, 30, 4),
        rectSeat('B01', '梯田营位', 30, 100, 62, 30, 6, { premium: 20 }),
        rectSeat('B02', '梯田营位', 116, 100, 62, 30, 6, { premium: 20, state: 'full' }),
        rectSeat('B03', '梯田营位', 202, 100, 62, 30, 6, { premium: 20 }),
        { id: 'T1', name: '观景梯台', poly: '40,196 118,186 118,214 40,222', tx: 79, ty: 204, cap: 8, premium: 40, state: 'ok', price: true },
        { id: 'T2', name: '观景梯台', poly: '146,186 224,176 224,204 146,214', tx: 185, ty: 194, cap: 8, premium: 40, state: 'low' },
        { id: 'T3', name: '观景梯台', poly: '252,176 330,166 330,194 252,204', tx: 291, ty: 184, cap: 8, premium: 40, state: 'maint' }
      ]
    }
  ];

  var PARK_MAP = {};
  PARKS.forEach(function (p) { PARK_MAP[p.id] = p; });

  function getPark(id) { return PARK_MAP[id] || PARKS[0]; }

  function slotById(id) {
    for (var i = 0; i < SLOTS.length; i++) if (SLOTS[i].id === id) return SLOTS[i];
    return SLOTS[1];
  }

  /* 价格只维护在营位上：营位价 = 公园基础价 + 营位溢价，时段不再单独定价 */
  PARKS.forEach(function (p) {
    p.seats.forEach(function (s) {
      s.price = p.base + (s.premium || 0);
    });
    p.priceFrom = Math.min.apply(null, p.seats.map(function (s) { return s.price; }));
  });

  var WEEKEND_DELTA = 20;

  /* info 为 dateInfo 返回值；周末加价与后台营位规则一致 */
  function isWeekend(info) {
    var dow = info && info.date ? info.date.getDay() : 0;
    return dow === 0 || dow === 6;
  }

  function seatPrice(seat, info) {
    return seat.price + (isWeekend(info) ? WEEKEND_DELTA : 0);
  }

  /* 日期 / 时段变化时重新计算营位可约状态，让地图看起来是“实时”的 */
  function seatsFor(park, dateIdx, slotId) {
    var shift = (dateIdx + (slotId === 'pm' ? 1 : 0) + (slotId === 'day' ? 2 : 0)) % 3;
    var order = ['ok', 'low', 'full'];
    return park.seats.map(function (seat) {
      var next = seat.state;
      if (shift > 0 && order.indexOf(seat.state) >= 0) {
        next = order[(order.indexOf(seat.state) + shift) % 3];
      }
      var copy = {};
      for (var k in seat) copy[k] = seat[k];
      copy.state = next;
      return copy;
    });
  }

  /* ---------------- 活动数据 ---------------- */

  var ACTS = [
    {
      id: 'a0',
      title: '我有一亩田',
      parkId: 'p1',
      cat: 'flag',
      catName: '平台主打',
      flagship: true,
      time: '09:00–16:00',
      duration: '全天，含午餐',
      intro: '本平台自有主题活动：按季认领一块真实稻田，跟着农人完成插秧、管水、除草与收割，' +
        '每次到场都能带走当季收成。单次体验票适合首次尝试，季卡可全程参与并署名认领牌。',
      tags: ['平台主打', '亲子', '农事体验', '含工具', '含午餐'],
      saleFrom: 2, saleTo: 16, closed: [8], cap: 90, taken: 46, limit: 8,
      tiers: [
        { id: 'single', name: '单人体验票', note: '1 人入场，含工具与午餐', price: 88, stock: 40, sold: 26 },
        { id: 'family', name: '亲子套票', note: '1 大 1 小，含工具包', price: 158, stock: 30, sold: 21 },
        { id: 'season', name: '一亩田季卡', note: '全程 4 次到场，署名认领牌', price: 1980, stock: 10, sold: 4 }
      ]
    },
    {
      id: 'a1',
      title: '春耕插秧体验',
      parkId: 'p1',
      cat: 'family',
      catName: '亲子',
      time: '09:00–11:30',
      duration: '约 2.5 小时',
      intro: '跟着农人下田插秧，含秧苗、工具与农事讲解，结束后可带回一小把秧苗。',
      tags: ['亲子', '农事体验', '含物料'],
      saleFrom: 2, saleTo: 8, closed: [6], cap: 60, taken: 22, limit: 6,
      tiers: [
        { id: 'adult', name: '成人票', note: '1 人入场', price: 68, stock: 30, sold: 18 },
        { id: 'child', name: '儿童票', note: '3–12 岁，须成人陪同', price: 38, stock: 20, sold: 14 },
        { id: 'family', name: '亲子套票', note: '1 大 1 小，含物料', price: 98, stock: 15, sold: 9 }
      ]
    },
    {
      id: 'a2',
      title: '湿地观鸟晨课',
      parkId: 'p2',
      cat: 'nature',
      catName: '自然',
      time: '06:30–08:30',
      duration: '约 2 小时',
      intro: '由自然导师带队观察越冬候鸟，提供双筒望远镜与图鉴，安静观鸟不追不赶。',
      tags: ['自然课堂', '含望远镜', '限 20 人'],
      saleFrom: 1, saleTo: 6, closed: [], cap: 40, taken: 12, limit: 4,
      tiers: [
        { id: 'single', name: '单人票', note: '1 人入场，含望远镜', price: 45, stock: 24, sold: 9 },
        { id: 'double', name: '双人票', note: '2 人同行，含望远镜 ×2', price: 80, stock: 12, sold: 5 }
      ]
    },
    {
      id: 'a3',
      title: '稻田手作市集',
      parkId: 'p1',
      cat: 'craft',
      catName: '手作',
      time: '14:00–17:00',
      duration: '自由进场',
      intro: '稻田边的周末市集：草编、扎染与米食摊位，凭票可任选 1 项手作体验。',
      tags: ['手作', '市集', '可随到随玩'],
      saleFrom: 3, saleTo: 12, closed: [], cap: 120, taken: 30, limit: 6,
      tiers: [
        { id: 'adult', name: '市集通票', note: '含 1 项手作体验', price: 30, stock: 60, sold: 20 },
        { id: 'family', name: '亲子套票', note: '1 大 1 小，含 2 项手作', price: 50, stock: 30, sold: 11 }
      ]
    },
    {
      id: 'a4',
      title: '星空露营夜谈',
      parkId: 'p3',
      cat: 'night',
      catName: '夜游',
      time: '19:00–21:30',
      duration: '约 2.5 小时',
      intro: '梯田营地夜观星空，含热饮与营地故事分享，不含过夜营位。',
      tags: ['夜游', '含热饮', '限 30 人'],
      saleFrom: 4, saleTo: 10, closed: [8], cap: 30, taken: 24, limit: 4,
      tiers: [
        { id: 'single', name: '单人票', note: '1 人入场，含热饮', price: 88, stock: 16, sold: 13 },
        { id: 'double', name: '双人票', note: '2 人同行，含热饮 ×2', price: 158, stock: 8, sold: 6 }
      ]
    }
  ];

  var ACT_MAP = {};
  ACTS.forEach(function (a) { ACT_MAP[a.id] = a; });

  function getAct(id) { return ACT_MAP[id] || ACTS[0]; }

  function actLeft(act) {
    return act.tiers.reduce(function (sum, t) { return sum + Math.max(0, t.stock - t.sold); }, 0);
  }

  function actBadge(act) {
    var left = actLeft(act);
    if (!left) return { text: '已售罄', cls: 'badge--neutral' };
    if (left <= 20) return { text: '余票紧张', cls: 'badge--wheat' };
    return { text: '余票充足', cls: 'badge--leaf' };
  }

  function actSaleLabel(act) {
    return dateInfo(dayAt(act.saleFrom)).md + ' – ' + dateInfo(dayAt(act.saleTo)).md;
  }

  function actDateLeft(act, off) {
    if (act.closed.indexOf(off) >= 0) return 0;
    return Math.max(0, act.cap - act.taken - (off % 4) * 9);
  }

  function tierLeft(act, tier, off) {
    if (actDateLeft(act, off) <= 0) return 0;
    return Math.max(0, tier.stock - tier.sold - (off % 3) * 2);
  }

  /* 可售日期区间展开成日期条，索引与 state.actDate 对应 */
  function actDateList(act) {
    var list = [];
    for (var off = act.saleFrom; off <= act.saleTo; off++) {
      list.push({ off: off, info: dateInfo(dayAt(off)), left: actDateLeft(act, off) });
    }
    return list;
  }

  /* ---------------- 状态 ---------------- */

  var orderSeq = 128;

  function makeOrder(o) {
    orderSeq += 1;
    var base = o.date;
    return {
      type: 'camp',
      no: 'PB' + base.stamp + ('000' + orderSeq).slice(-3),
      code: 'PB-' + base.iso.replace(/-/g, '') + '-' + o.seatId,
      parkId: o.parkId,
      parkName: getPark(o.parkId).name,
      seatId: o.seatId,
      seatName: o.seatName,
      date: base,
      slotId: o.slotId,
      slotName: slotById(o.slotId).name,
      slotTime: slotById(o.slotId).time,
      people: o.people || 2,
      holder: o.holder || '林小满',
      phone: o.phone || '13800006621',
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt || (TODAY.getMonth() + 1 + ' 月 ' + TODAY.getDate() + ' 日 09:12'),
      verifiedAt: o.verifiedAt || '',
      remark: o.remark || ''
    };
  }

  function makeActOrder(o) {
    orderSeq += 1;
    var act = o.act;
    var base = dateInfo(dayAt(o.off));
    var qty = o.lines.reduce(function (n, l) { return n + l.qty; }, 0);
    var total = o.lines.reduce(function (n, l) { return n + l.price * l.qty; }, 0);
    return {
      type: 'activity',
      no: 'AC' + base.stamp + ('000' + orderSeq).slice(-3),
      code: 'AC-' + base.iso.replace(/-/g, '') + '-' + act.id.toUpperCase(),
      actId: act.id,
      actTitle: act.title,
      parkId: act.parkId,
      parkName: getPark(act.parkId).name,
      time: act.time,
      date: base,
      lines: o.lines,
      qty: qty,
      ticketText: o.lines.map(function (l) { return l.name + ' ×' + l.qty; }).join('、'),
      holder: o.holder || '林小满',
      phone: o.phone || '13800006621',
      amount: o.amount || total,
      status: o.status,
      createdAt: o.createdAt || ((TODAY.getMonth() + 1) + ' 月 ' + TODAY.getDate() + ' 日 10:26'),
      verifiedAt: o.verifiedAt || '',
      remark: o.remark || ''
    };
  }

  function seedOrders() {
    return [
      makeActOrder({ act: ACTS[0], off: 2, lines: [{ name: '亲子套票', price: 98, qty: 1 }], status: 'unused' }),
      makeOrder({ parkId: 'p1', seatId: 'A03', seatName: '水岸营位', date: DATES[2], slotId: 'am', people: 2, amount: 93, status: 'unused' }),
      makeActOrder({ act: ACTS[1], off: -6, lines: [{ name: '双人票', price: 80, qty: 1 }], status: 'used', verifiedAt: '3 月 10 日 06:38' }),
      makeOrder({ parkId: 'p2', seatId: 'B02', seatName: '观鸟营位', date: dateInfo(dayAt(-5)), slotId: 'am', people: 4, amount: 103, status: 'used', verifiedAt: '3 月 11 日 08:42' }),
      makeActOrder({ act: ACTS[2], off: 5, lines: [{ name: '市集通票', price: 30, qty: 2 }, { name: '亲子套票', price: 50, qty: 1 }], status: 'unpaid' }),
      makeOrder({ parkId: 'p3', seatId: 'T1', seatName: '观景梯台', date: DATES[1], slotId: 'pm', people: 6, amount: 143, status: 'unpaid' }),
      makeOrder({ parkId: 'p1', seatId: 'C01', seatName: '草坪营位', date: dateInfo(dayAt(-2)), slotId: 'day', people: 5, amount: 123, status: 'cancelled' }),
      makeActOrder({ act: ACTS[0], off: -3, lines: [{ name: '成人票', price: 68, qty: 2 }], status: 'refunded' }),
      makeOrder({ parkId: 'p2', seatId: 'A04', seatName: '湿地营位', date: dateInfo(dayAt(-12)), slotId: 'day', people: 3, amount: 143, status: 'refunded' }),
      makeOrder({ parkId: 'p3', seatId: 'T2', seatName: '观景梯台', date: dateInfo(dayAt(-20)), slotId: 'am', people: 2, amount: 133, status: 'expired' })
    ];
  }

  var state = {
    screen: 'home',
    parkId: 'p1',
    dateIdx: 0,
    slotId: 'am',
    seatId: null,
    view: 'map',
    zoom: 1,
    tx: 0,
    ty: 0,
    broken: false,
    empty: false,
    filter: 'all',
    typeFilter: 'all',
    actCat: 'all',
    actId: 'a1',
    actDate: 0,
    actQty: {},
    verifying: 'success',
    verifyDone: false,
    payFailed: false,
    orders: seedOrders(),
    records: [
      { seat: 'B02 · 观鸟营位', code: 'PB-20260311-B02', time: '08:42', ok: true },
      { seat: 'A01 · 湿地营位', code: 'PB-20260311-A01', time: '09:05', ok: true },
      { seat: 'B01 · 观鸟营位', code: 'PB-20260310-B01', time: '08:20', ok: true },
      { seat: 'C02 · 梯田营位', code: 'PB-20260310-C02', time: '14:10', ok: false }
    ],
    currentOrder: null,
    payOrder: null,
    countdown: 600,
    countdownTimer: null
  };

  /* ---------------- 屏幕路由 ---------------- */

  var NOTE = {
    home: {
      step: '01',
      title: '首页',
      desc: '品牌区 + 双入口大卡，“活动预约”与“公园露营”两条业务线并行。',
      list: [
        '底部 Tab 固定四项：首页、公园露营、我的预约、我的。',
        '“主题活动”与“公园露营”并列为主链路，入口直接进入活动列表。',
        '附近公园卡片直接展示余位与价格，减少一次点击。'
      ]
    },
    acts: {
      step: '02',
      title: '活动列表',
      desc: '活动与露营共用入口级别，列表直接给出可售日期与余票。',
      list: [
        '按分类筛选：亲子 / 手作 / 自然 / 夜游。',
        '卡片同时给出最低票价、可售日期区间与余票状态。',
        '售罄的活动仍可查看，但不允许下单。'
      ]
    },
    act: {
      step: '03',
      title: '活动详情 · 选票',
      desc: '一屏完成“选日期 → 选票种与数量”，并实时给出合计。',
      list: [
        '先选日期，不可售日期置灰且不可选。',
        '每个票种独立库存，数量受票种余票与每单限购双重约束。',
        '未选票时“下一步”不可点击，避免空单提交。'
      ]
    },
    actconfirm: {
      step: '04',
      title: '活动预约确认',
      desc: '确认日期、票种与联系人后提交并支付，支付成功即生成核销码。',
      list: [
        '联系人与手机号为必填，错误提示就地展示、不弹窗。',
        '费用明细按票种行列，与选票页金额一致。',
        '提交后复用统一支付页，与露营订单共用核销码体系。'
      ]
    },
    parks: {
      step: '05',
      title: '公园列表',
      desc: '按区域与特色筛选，卡片同时给出距离、开放时间与最低价。',
      list: [
        '搜索支持公园名、区域与特色标签。',
        '余位不足时在卡片上直接提示，不做二次弹窗。',
        '从卡片进入详情时携带当前公园，返回不丢失滚动位置。'
      ]
    },
    park: {
      step: '06',
      title: '公园详情 · 选营位',
      desc: '一张自定义平面图承担主要选位任务，并与列表视图共享状态。',
      list: [
        '先选日期与时段，再选营位；日期变化会刷新可约状态。',
        '营位状态优先级：维护 / 关闭 > 已约满 > 剩余少量 > 可预约。',
        '平面图加载失败时自动降级为列表，已选日期时段保留。',
        '支持缩放、拖动与复位，弹层确认后才写入已选营位。'
      ]
    },
    confirm: {
      step: '07',
      title: '订单确认',
      desc: '一屏完成联系人填写、费用核对与规则确认，并给出支付倒计时。',
      list: [
        '一个订单只包含 1 个日期、1 个时段、1 个营位。',
        '手机号与协议勾选为必填，错误提示就地展示。',
        '同行人数不得超过营位容纳上限。'
      ]
    },
    pay: {
      step: '08',
      title: '支付结果',
      desc: '支付成功即生成核销码；失败与超时保留订单并允许重新支付。',
      list: [
        '核销码 = 二维码 + 可人工输入的 16 位编码。',
        '失败态不重复创建订单，避免出现重复占位。',
        '成功后可直接进入“我的预约”查看。'
      ]
    },
    orders: {
      step: '09',
      title: '我的预约',
      desc: '六种订单状态一屏可辨，按状态筛选后再操作。',
      list: [
        '待支付 / 待使用 / 已核销 / 已取消 / 已退款 / 已过期。',
        '待支付可继续支付或取消；待使用可退款或查看核销码。',
        '退款与取消均需二次确认，原型中以提示代替真实流程。'
      ]
    },
    order: {
      step: '10',
      title: '订单详情',
      desc: '订单信息、核销码与状态时间轴集中在一屏，便于现场沟通。',
      list: [
        '只有“待使用”展示可用核销码。',
        '时间轴记录下单、支付、核销 / 退款节点。',
        '已核销订单展示核销时间与操作员。'
      ]
    },
    scan: {
      step: '11',
      title: '核销工作台',
      desc: '面向园区工作人员的极简入口：扫码或输码，一步进入校验结果。',
      list: [
        '核销员与公园绑定，页面顶部常驻当前园区。',
        '保留最近核销记录，便于现场回溯。',
        '扫码失败可改用编码输入，不阻断排队。'
      ]
    },
    verify: {
      step: '12',
      title: '核销确认 / 结果',
      desc: '五类校验结果统一视觉语言：成功绿、异常红、提示黄。',
      list: [
        '校验顺序：订单状态 → 园区权限 → 是否重复核销 → 有效期。',
        '成功需二次确认，避免误触放行。',
        '异常结果给出可执行建议，而不仅是报错。'
      ]
    },
    profile: {
      step: '13',
      title: '我的',
      desc: '普通用户与核销员共用一套账户，员工入口按权限显示。',
      list: [
        '统计卡直接反映待使用与已核销数量。',
        '“核销工作台”仅对核销员可见。',
        '客服与常见问题保留入口，原型中不展开。'
      ]
    }
  };

  var TAB_SCREENS = { home: 'home', parks: 'parks', orders: 'orders', profile: 'profile' };

  function setScreen(name) {
    if (!NOTE[name]) name = 'home';
    state.screen = name;
    if (name !== 'confirm' && name !== 'actconfirm') stopCountdown();

    $$('.screen').forEach(function (s) {
      s.classList.toggle('is-active', s.getAttribute('data-screen') === name);
    });

    var tab = TAB_SCREENS[name];
    $('#tabbar').classList.toggle('is-hidden', !tab);
    $$('#tabbar .tabbar__item').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-go') === tab);
    });

    var index = 1;
    $$('.mp-nav__item').forEach(function (b, i) {
      var active = b.getAttribute('data-nav') === name;
      b.classList.toggle('is-active', active);
      if (active) index = i + 1;
    });
    $('.mp-nav__title .u-mono').textContent = index + ' / ' + $$('.mp-nav__item').length;

    var note = NOTE[name];
    $('#note-step').textContent = '当前界面 ' + note.step;
    $('#note-title').textContent = note.title;
    $('#note-desc').textContent = note.desc;
    $('#note-list').innerHTML = note.list.map(function (t) { return '<li>' + t + '</li>'; }).join('');

    var scroll = $('.screen[data-screen="' + name + '"] .screen__scroll');
    if (scroll) scroll.scrollTop = 0;

    whenEnter(name);
  }

  function whenEnter(name) {
    if (name === 'acts') renderActs();
    if (name === 'act') renderAct();
    if (name === 'actconfirm') renderActConfirm();
    if (name === 'parks') renderParkList();
    if (name === 'park') renderParkScreen();
    if (name === 'confirm') renderConfirm();
    if (name === 'pay') renderPay();
    if (name === 'orders') renderOrders();
    if (name === 'order') renderOrderDetail();
    if (name === 'scan') renderScanRecords();
    if (name === 'verify') renderVerify();
    if (name === 'profile') renderProfile();
    if (name === 'home') { renderHomeParks(); renderHomeActs(); }
  }

  /* ---------------- 首页 / 列表 ---------------- */

  function parkCard(park) {
    var min = park.priceFrom;
    var free = park.seats.filter(function (s) { return s.state === 'ok' || s.state === 'low'; }).length;
    return '' +
      '<button class="park-card" type="button" data-park="' + park.id + '">' +
        '<img class="park-card__img" src="' + park.cover + '" alt="">' +
        '<span class="park-card__body">' +
          '<span class="park-card__name">' + esc(park.name) + '</span>' +
          '<span class="park-card__meta">' + esc(park.area) + ' · ' + park.dist + ' · ' + park.hours + '</span>' +
          '<span class="park-card__meta">' + park.tags.map(function (t) { return '#' + t; }).join(' ') + '</span>' +
          '<span class="park-card__foot">' +
            '<span class="price">¥' + min + '<small>起 / 场</small></span>' +
            '<span class="badge ' + (free > 4 ? 'badge--leaf' : 'badge--wheat') + '">' + free + ' 个可约</span>' +
          '</span>' +
        '</span>' +
      '</button>';
  }

  function renderHomeParks() {
    if (state.empty) {
      $('#home-parks').innerHTML = emptyState('暂无附近可约公园', '试试关闭空数据演示，或调整出行日期。');
      return;
    }
    $('#home-parks').innerHTML = PARKS.slice(0, 2).map(parkCard).join('');
  }

  function renderParkList() {
    var host = $('#park-list');
    var q = ($('#park-search').value || '').trim();
    var filter = $('#park-filters .is-active').getAttribute('data-filter');

    if (state.empty) {
      host.innerHTML = emptyState('暂无符合条件的公园', '试试切换筛选条件，或清空搜索关键词。');
      $('#park-count').textContent = '共 0 个公园';
      return;
    }

    var list = PARKS.filter(function (p) {
      var hitFilter = filter === 'all' || p.kind === filter || (filter === 'pet' && p.tags.indexOf('可带宠物') >= 0);
      var hay = p.name + p.area + p.tags.join('') + p.intro;
      return hitFilter && (!q || hay.indexOf(q) >= 0);
    });

    $('#park-count').textContent = '共 ' + list.length + ' 个公园';
    host.innerHTML = list.length ? list.map(parkCard).join('') : emptyState('没有找到匹配的公园', '换个关键词试试，例如“湿地”或“梯田”。');
  }

  function emptyState(title, desc) {
    return '' +
      '<div class="state">' +
        '<span class="state__icon">' + icon('i-leaf', 'icon--lg') + '</span>' +
        '<div class="state__title">' + title + '</div>' +
        '<div class="state__desc">' + desc + '</div>' +
      '</div>';
  }

  /* ---------------- 公园详情 / 地图 ---------------- */

  function renderParkScreen() {
    var park = getPark(state.parkId);
    $('#park-hero-img').src = park.cover;
    $('#park-name').textContent = park.name;
    $('#park-meta').textContent = '珠海 · ' + park.area + ' · 距你 ' + park.dist + ' · ' + park.hours;
    $('#park-tags').innerHTML = park.tags.map(function (t) {
      return '<span class="badge badge--forest">' + esc(t) + '</span>';
    }).join('');

    renderDates();
    renderSlots();
    renderMap();
    renderSeatList();
    syncMapMode();
    updateActionbar();
  }

  function renderDates() {
    var host = $('#date-strip');
    host.innerHTML = DATES.map(function (d, i) {
      return '<button class="date-pill' + (i === state.dateIdx ? ' is-active' : '') + '" type="button" role="radio" aria-checked="' + (i === state.dateIdx) + '" data-date="' + i + '">' +
        '<span class="date-pill__dow">' + (i === 0 ? '今天' : d.dow) + '</span>' +
        '<span class="date-pill__day">' + d.md + '</span>' +
      '</button>';
    }).join('');
  }

  function renderSlots() {
    var host = $('#slot-grid');
    var full = state.dateIdx === 0 ? 'pm' : '';
    host.innerHTML = SLOTS.map(function (s) {
      var isFull = s.id === full;
      return '<button class="slot' + (s.id === state.slotId ? ' is-active' : '') + (isFull ? ' is-full' : '') + '" type="button" role="radio" aria-checked="' + (s.id === state.slotId) + '" data-slot="' + s.id + '">' +
        '<span class="slot__name">' + s.name + '</span>' +
        '<span class="slot__time">' + (isFull ? '已约满' : s.time) + '</span>' +
      '</button>';
    }).join('');
  }

  function facilityMarkup(park) {
    var out = '';
    out += '<g class="facility facility--road" data-layer-group="road">' +
      park.facilities.roads.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</g>';
    out += '<g class="facility facility--gate" data-layer-group="gate">' +
      park.facilities.gates.map(function (g) {
        return '<circle cx="' + g.x + '" cy="' + g.y + '" r="9"/><text x="' + g.x + '" y="' + g.y + '">' + g.label + '</text>';
      }).join('') + '</g>';
    out += '<g class="facility facility--wc" data-layer-group="wc">' +
      park.facilities.wcs.map(function (w) {
        return '<rect x="' + w.x + '" y="' + w.y + '" width="' + w.w + '" height="' + w.h + '" rx="3"/>' +
          '<text x="' + (w.x + w.w / 2) + '" y="' + (w.y + w.h / 2) + '">卫生间</text>';
      }).join('') + '</g>';
    return out;
  }

  function currentSeats() {
    var park = getPark(state.parkId);
    return seatsFor(park, state.dateIdx, state.slotId);
  }

  function findSeat(id) {
    var seats = currentSeats();
    for (var i = 0; i < seats.length; i++) if (seats[i].id === id) return seats[i];
    return null;
  }

  function renderMap() {
    var park = getPark(state.parkId);
    $('#map-img').src = park.map;
    $('#map-facilities').innerHTML = facilityMarkup(park);

    var seats = currentSeats();
    $('#map-seats').innerHTML = seats.map(function (s) {
      var meta = SEAT_STATE[s.state] || SEAT_STATE.ok;
      var selected = s.id === state.seatId;
      var shape = s.poly
        ? '<polygon points="' + s.poly + '"/>'
        : '<rect x="' + s.x + '" y="' + s.y + '" width="' + s.w + '" height="' + s.h + '" rx="3"/>';
      var disabled = s.state === 'full' || s.state === 'maint' || s.state === 'closed';
      return '<g class="mseat ' + meta.map + (selected ? ' is-selected' : '') + '" data-seat="' + s.id + '" role="button" tabindex="0" ' +
        'aria-label="' + esc(s.id + ' ' + s.name + ' ' + meta.label) + '"' + (disabled ? ' aria-disabled="true"' : '') + '>' +
        shape + '<text x="' + s.tx + '" y="' + s.ty + '">' + s.id + '</text></g>';
    }).join('');

    $('#seat-count').textContent = seats.length + ' 个营位 · ' + seats.filter(function (s) { return s.state === 'ok' || s.state === 'low'; }).length + ' 个可约';
    applyTransform();
  }

  function renderSeatList() {
    var park = getPark(state.parkId);
    var seats = currentSeats();
    $('#seat-list').innerHTML = seats.map(function (s) {
      var meta = SEAT_STATE[s.state] || SEAT_STATE.ok;
      var price = seatPrice(s, DATES[state.dateIdx]);
      var selected = s.id === state.seatId;
      return '<button class="seat-row ' + meta.row + (selected ? ' is-selected' : '') + '" type="button" data-seat="' + s.id + '">' +
        '<span class="seat-row__tag">' + s.id + '</span>' +
        '<span class="seat-row__body">' +
          '<span class="seat-row__name">' + s.id + ' · ' + s.name + '</span>' +
          '<span class="seat-row__meta">可容纳 ' + s.cap + ' 人 · ' + meta.label + '</span>' +
        '</span>' +
        '<span class="seat-row__right">' +
          '<span class="price">¥' + price + '</span>' +
          '<span class="badge ' + meta.badge + '">' + (selected ? '已选' : meta.label) + '</span>' +
        '</span>' +
      '</button>';
    }).join('');
  }

  function syncMapMode() {
    var card = $('#map-card');
    card.classList.toggle('is-list', state.view === 'list');
    card.classList.toggle('is-broken', state.broken);
    $$('#view-seg .seg__btn').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-view') === state.view);
      b.disabled = state.broken;
    });
    $('#layers-toggle').disabled = state.broken;
    $('#map-layers').classList.remove('is-open');
    $('#layers-toggle').setAttribute('aria-expanded', 'false');
  }

  function applyTransform() {
    $('#map-canvas').style.transform = 'translate(' + state.tx + 'px,' + state.ty + 'px) scale(' + state.zoom + ')';
  }

  function clampPan() {
    var w = 358, h = 239;
    var maxX = 0, maxY = 0;
    var minX = -(state.zoom - 1) * w;
    var minY = -(state.zoom - 1) * h;
    if (state.tx > maxX) state.tx = maxX;
    if (state.ty > maxY) state.ty = maxY;
    if (state.tx < minX) state.tx = minX;
    if (state.ty < minY) state.ty = minY;
  }

  function setZoom(next) {
    state.zoom = Math.min(2.4, Math.max(1, Math.round(next * 100) / 100));
    if (state.zoom === 1) { state.tx = 0; state.ty = 0; }
    clampPan();
    applyTransform();
  }

  function openSeat(seat) {
    if (!seat) return;
    var meta = SEAT_STATE[seat.state] || SEAT_STATE.ok;
    var park = getPark(state.parkId);
    var date = DATES[state.dateIdx];
    var slot = slotById(state.slotId);
    var blocked = seat.state === 'full' || seat.state === 'maint' || seat.state === 'closed';

    $('#sheet-name').textContent = seat.id + ' · ' + seat.name;
    $('#sheet-meta').textContent = '可容纳 ' + seat.cap + ' 人 · ' + date.label + ' ' + date.dow + ' · ' + slot.name;
    $('#sheet-status').innerHTML = '<span class="badge ' + meta.badge + '">' + meta.label + '</span>';
    $('#sheet-price').textContent = '¥' + seatPrice(seat, date);
    var btn = $('#sheet-select');
    btn.disabled = blocked;
    btn.textContent = blocked ? meta.label : (seat.id === state.seatId ? '已选择该营位' : '选择此营位');
    btn.setAttribute('data-seat', seat.id);
    $('#seat-sheet').classList.add('is-open');
  }

  function closeSheet() {
    $('#seat-sheet').classList.remove('is-open');
  }

  function selectSeat(id) {
    var seat = findSeat(id);
    if (!seat) return;
    if (seat.state === 'full' || seat.state === 'maint' || seat.state === 'closed') {
      window.UI.toast('该营位' + (SEAT_STATE[seat.state] || {}).label + '，请选择其他营位');
      return;
    }
    state.seatId = id;
    closeSheet();
    renderMap();
    renderSeatList();
    updateActionbar();
    window.UI.toast('已选择 ' + id + ' · ' + seat.name);
  }

  function updateActionbar() {
    var seat = state.seatId ? findSeat(state.seatId) : null;
    if (seat && (seat.state === 'full' || seat.state === 'maint' || seat.state === 'closed')) seat = null;
    var date = DATES[state.dateIdx];
    var slot = slotById(state.slotId);
    var park = getPark(state.parkId);

    $('#next-btn').disabled = !seat;
    if (seat) {
      $('#sel-label').textContent = '已选 ' + seat.id + ' · ' + seat.name;
      $('#sel-value').innerHTML = date.label + ' ' + date.dow + ' · ' + slot.name + ' · ¥' + seatPrice(seat, date);
    } else {
      $('#sel-label').textContent = '未选择营位';
      $('#sel-value').innerHTML = '请选择日期与时段 <span class="u-faint">· 单次仅 1 个营位</span>';
    }
  }

  /* ---------------- 活动：列表 / 选票 / 确认 ---------------- */

  var ACT_COVER = '../assets/img/activity-cover.svg';

  /* 平台主打活动排在最前，其余保持原顺序 */
  function sortActs(list) {
    return list.slice().sort(function (x, y) {
      return (y.flagship ? 1 : 0) - (x.flagship ? 1 : 0);
    });
  }

  function actCard(a) {
    var min = Math.min.apply(null, a.tiers.map(function (t) { return t.price; }));
    var b = actBadge(a);
    return '' +
      '<button class="act-card' + (a.flagship ? ' act-card--flag' : '') + '" type="button" data-act="' + a.id + '">' +
        '<img class="act-card__img" src="' + ACT_COVER + '" alt="">' +
        '<span class="act-card__body">' +
          '<span class="act-card__tags">' +
            (a.flagship ? '<span class="act-card__flag">重点展示</span>' : '') +
            '<span class="act-card__cat">' + esc(a.catName) + '</span>' +
          '</span>' +
          '<span class="act-card__title">' + esc(a.title) + '</span>' +
          '<span class="act-card__meta">' + esc(getPark(a.parkId).name) + ' · ' + a.time + '</span>' +
          '<span class="act-card__meta">可售 ' + actSaleLabel(a) + ' · 每单限 ' + a.limit + ' 张</span>' +
          '<span class="act-card__foot">' +
            '<span class="price">¥' + min + '<small>起 / 张</small></span>' +
            '<span class="badge ' + b.cls + '">' + b.text + '</span>' +
          '</span>' +
        '</span>' +
      '</button>';
  }

  function renderActs() {
    var host = $('#act-list');
    if (!host) return;
    var kw = ($('#act-search').value || '').trim();
    var list = ACTS.filter(function (a) {
      if (state.actCat !== 'all' && a.cat !== state.actCat) return false;
      if (!kw) return true;
      return (a.title + getPark(a.parkId).name + a.catName + a.tags.join('')).indexOf(kw) >= 0;
    });
    list = sortActs(list);
    $('#act-count').textContent = '共 ' + list.length + ' 场活动';
    $$('#act-filters .chip').forEach(function (c) {
      c.classList.toggle('is-active', c.getAttribute('data-cat') === state.actCat);
    });
    if (!list.length) {
      host.innerHTML = emptyState('没有符合条件的活动', '换个分类，或清空搜索关键词。');
      return;
    }
    host.innerHTML = list.map(actCard).join('');
  }

  function renderHomeActs() {
    var host = $('#home-acts');
    if (!host) return;
    if (state.empty) {
      host.innerHTML = emptyState('本周暂无活动', '试试关闭空数据演示，或切换活动分类。');
      return;
    }
    host.innerHTML = sortActs(ACTS).slice(0, 2).map(function (a) {
      return '<button class="activity-card" type="button" data-act="' + a.id + '">' +
        '<img src="' + ACT_COVER + '" alt="">' +
        '<span class="activity-card__body">' +
          '<span class="activity-card__title">' + esc(a.title) + ' · ' + dateInfo(dayAt(a.saleFrom)).md + ' 起</span>' +
          '<span class="activity-card__meta">' + esc(getPark(a.parkId).name) + ' · ' + a.catName + ' · ' + actBadge(a).text + '</span>' +
        '</span>' +
      '</button>';
    }).join('');
  }

  function resetActQty(act) {
    var q = {};
    act.tiers.forEach(function (t) { q[t.id] = 0; });
    state.actQty = q;
    state.actQtyFor = act.id;
  }

  function actDraft() {
    var act = getAct(state.actId);
    if (state.actQtyFor !== act.id) resetActQty(act);
    var dates = actDateList(act);
    if (!(state.actDate >= 0 && state.actDate < dates.length)) state.actDate = 0;
    var date = dates[state.actDate] || dates[0];
    var lines = [];
    var count = 0;
    var total = 0;
    act.tiers.forEach(function (t) {
      var n = Number(state.actQty[t.id]) || 0;
      if (n > 0) {
        lines.push({ id: t.id, name: t.name, price: t.price, qty: n });
        count += n;
        total += n * t.price;
      }
    });
    return { act: act, dates: dates, date: date, lines: lines, count: count, total: total, off: date.off };
  }

  function renderAct() {
    var d = actDraft();
    var a = d.act;
    var park = getPark(a.parkId);

    $('#ad-img').src = ACT_COVER;
    $('#ad-title').textContent = a.title;
    $('#ad-sub').textContent = park.name + ' · ' + a.time;
    $('#ad-tags').innerHTML = a.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    $('#ad-park').textContent = park.name;
    $('#ad-time').textContent = a.time + ' · ' + a.duration;
    $('#ad-sale').textContent = actSaleLabel(a);
    $('#ad-left').textContent = '剩余 ' + actLeft(a) + ' 张';
    $('#ad-intro').textContent = a.intro;
    $('#ad-limit-hint').textContent = '每单最多 ' + a.limit + ' 张';
    $('#ad-date-hint').textContent = '可选 ' + d.dates.length + ' 天';

    $('#ad-dates').innerHTML = d.dates.map(function (item, i) {
      var full = item.left <= 0;
      return '<button class="date-pill' + (i === state.actDate ? ' is-active' : '') + (full ? ' is-off' : '') + '"' +
        ' type="button" data-act-date="' + i + '" role="button"' + (full ? ' aria-disabled="true"' : '') + '>' +
        '<span class="date-pill__dow">' + item.info.dow + '</span>' +
        '<span class="date-pill__day">' + item.info.md + '</span>' +
        '<span class="date-pill__left">' + (full ? '已满' : '余 ' + item.left) + '</span>' +
      '</button>';
    }).join('');

    $('#ad-tickets').innerHTML = a.tiers.map(function (t) {
      var left = tierLeft(a, t, d.off);
      var n = Number(state.actQty[t.id]) || 0;
      var soldOut = left <= 0;
      return '<div class="ticket-row' + (soldOut ? ' is-off' : '') + '" data-ticket-row="' + t.id + '">' +
        '<div class="ticket-row__main">' +
          '<div class="ticket-row__name">' + esc(t.name) + '</div>' +
          '<div class="ticket-row__meta">' + esc(t.note) + ' · ' + (soldOut ? '本日已售罄' : '剩余 ' + left + ' 张') + '</div>' +
        '</div>' +
        '<div class="ticket-row__side">' +
          '<div class="ticket-row__price">¥' + t.price + '</div>' +
          '<div class="stepper">' +
            '<button class="stepper__btn" type="button" data-ticket-dec="' + t.id + '"' + (n <= 0 ? ' disabled' : '') + ' aria-label="减少' + esc(t.name) + '">−</button>' +
            '<span class="stepper__val">' + n + '</span>' +
            '<button class="stepper__btn" type="button" data-ticket-inc="' + t.id + '"' + (soldOut || n >= left ? ' disabled' : '') + ' aria-label="增加' + esc(t.name) + '">+</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    syncActTotals();
  }

  function syncActTotals() {
    var d = actDraft();
    $('#ad-qty').textContent = d.count;
    $('#ad-total').textContent = '¥' + d.total;
    $('#ad-total-bar').textContent = '¥' + d.total;
    var next = $('#act-next');
    next.disabled = d.count < 1;
    next.setAttribute('aria-disabled', String(d.count < 1));
  }

  /* 只更新受影响的票种行与合计，避免整屏重绘导致焦点丢失 */
  function syncTicketRows() {
    var d = actDraft();
    var a = d.act;
    a.tiers.forEach(function (t) {
      var row = $('#ad-tickets [data-ticket-row="' + t.id + '"]');
      if (!row) return;
      var left = tierLeft(a, t, d.off);
      var n = Number(state.actQty[t.id]) || 0;
      var soldOut = left <= 0;
      row.className = 'ticket-row' + (soldOut ? ' is-off' : '');
      var meta = row.querySelector('.ticket-row__meta');
      if (meta) meta.textContent = t.note + ' · ' + (soldOut ? '本日已售罄' : '剩余 ' + left + ' 张');
      var val = row.querySelector('.stepper__val');
      if (val) val.textContent = n;
      var dec = row.querySelector('[data-ticket-dec]');
      var inc = row.querySelector('[data-ticket-inc]');
      if (dec) dec.disabled = n <= 0;
      if (inc) inc.disabled = soldOut || n >= left;
    });
    syncActTotals();
  }

  /* 切换日期后按新日期的余量收敛已选数量 */
  function clampActQty() {
    var a = getAct(state.actId);
    var trimmed = false;
    var first = actDraft();
    a.tiers.forEach(function (t) {
      var left = tierLeft(a, t, first.off);
      var n = Number(state.actQty[t.id]) || 0;
      if (n > left) { state.actQty[t.id] = Math.max(0, left); trimmed = true; }
    });
    var excess = actDraft().count - a.limit;
    for (var i = a.tiers.length - 1; i >= 0 && excess > 0; i--) {
      var id = a.tiers[i].id;
      var n = Number(state.actQty[id]) || 0;
      if (n > 0) {
        var cut = Math.min(n, excess);
        state.actQty[id] = n - cut;
        excess -= cut;
        trimmed = true;
      }
    }
    return trimmed;
  }

  function changeQty(tierId, delta) {
    var d = actDraft();
    var a = d.act;
    var tier = null;
    a.tiers.forEach(function (t) { if (t.id === tierId) tier = t; });
    if (!tier) return;

    var left = tierLeft(a, tier, d.off);
    var cur = Number(state.actQty[tierId]) || 0;
    var next = cur + delta;

    if (next < 0) next = 0;
    if (next > left) {
      next = left;
      window.UI.toast('该票种本日仅剩 ' + left + ' 张');
    }
    if (next > cur && d.count + (next - cur) > a.limit) {
      next = Math.max(cur, a.limit - (d.count - cur));
      window.UI.toast('每单最多购买 ' + a.limit + ' 张');
    }
    state.actQty[tierId] = next;
    syncTicketRows();
  }

  function renderActConfirm() {
    var d = actDraft();
    var a = d.act;
    $('#ac-img').src = ACT_COVER;
    $('#ac-title').textContent = a.title;
    $('#ac-date').textContent = d.date.info.label + ' ' + d.date.info.dow;
    $('#ac-time').textContent = a.time;
    $('#ac-park').textContent = getPark(a.parkId).name;
    $('#ac-tickets').textContent = d.lines.map(function (l) { return l.name + ' ×' + l.qty; }).join('、') || '未选票种';
    $('#ac-fee-list').innerHTML = d.lines.map(function (l) {
      return '<div class="row"><dt>' + esc(l.name) + ' ×' + l.qty + '</dt><dd>¥' + (l.price * l.qty) + '</dd></div>';
    }).join('') + '<div class="row"><dt>服务费</dt><dd>¥0</dd></div>';
    $('#ac-total').textContent = '¥' + d.total;
    $('#ac-pay-amount').textContent = '¥' + d.total;
    if (!$('#ac-name').value) $('#ac-name').value = '林小满';
    if (!$('#ac-phone').value) $('#ac-phone').value = '13800006621';
    startCountdown();
  }

  function validateActBooking() {
    var d = actDraft();
    if (d.count < 1) { window.UI.toast('请至少选择 1 张票'); return false; }

    var ok = true;
    var name = $('#ac-name');
    var phone = $('#ac-phone');

    if (!name.value.trim()) { name.parentNode.classList.add('is-invalid'); ok = false; }
    else name.parentNode.classList.remove('is-invalid');

    if (!/^1[3-9]\d{9}$/.test(phone.value.trim())) { phone.parentNode.classList.add('is-invalid'); ok = false; }
    else phone.parentNode.classList.remove('is-invalid');

    if (!ok) { window.UI.toast('请检查联系人姓名与手机号'); return false; }

    if (!$('#ac-agree').checked) {
      window.UI.toast('请先阅读并勾选《活动预约须知》');
      return false;
    }
    return true;
  }

  function submitActOrder() {
    if (!validateActBooking()) return;
    var d = actDraft();
    var btn = $('#ac-pay-btn');
    if (btn.disabled) return;
    btn.classList.add('is-loading');
    btn.disabled = true;

    setTimeout(function () {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      stopCountdown();

      var order = makeActOrder({
        act: d.act,
        off: d.off,
        lines: d.lines,
        holder: $('#ac-name').value.trim(),
        phone: $('#ac-phone').value.trim(),
        remark: $('#ac-remark').value.trim(),
        status: 'unpaid'
      });
      state.orders.unshift(order);
      state.payOrder = order;
      state.currentOrder = order.no;
      state.payFailed = false;
      state.actQtyFor = null;

      setTimeout(function () {
        if (!state.payFailed) order.status = 'unused';
        setScreen('pay');
      }, 450);
    }, 700);
  }

  /* ---------------- 订单确认 ---------------- */

  function bookingDraft() {
    var park = getPark(state.parkId);
    var seat = findSeat(state.seatId) || park.seats[0];
    var date = DATES[state.dateIdx];
    var slot = slotById(state.slotId);
    var fee = seatPrice(seat, date);
    return { park: park, seat: seat, date: date, slot: slot, fee: fee, total: fee + 5 };
  }

  function renderConfirm() {
    var d = bookingDraft();
    $('#cf-img').src = d.park.cover;
    $('#cf-park').textContent = d.park.name;
    $('#cf-date').textContent = d.date.label + ' ' + d.date.dow;
    $('#cf-slot').textContent = d.slot.name + ' ' + d.slot.time;
    $('#cf-seat').textContent = d.seat.id + ' · ' + d.seat.name;
    $('#cf-cap').textContent = d.seat.cap + ' 人';
    $('#cf-fee').textContent = '¥' + d.fee;
    $('#cf-total').textContent = '¥' + d.total;
    $('#cf-count').max = d.seat.cap;
    $('#cf-count-hint').textContent = '不超过营位容纳上限 ' + d.seat.cap + ' 人';
    if (Number($('#cf-count').value) > d.seat.cap) $('#cf-count').value = d.seat.cap;
    if (!$('#cf-name').value) $('#cf-name').value = '林小满';
    if (!$('#cf-phone').value) $('#cf-phone').value = '13800006621';
    startCountdown();
  }

  function startCountdown() {
    stopCountdown();
    state.countdown = 600;
    paintCountdown();
    state.countdownTimer = setInterval(function () {
      state.countdown -= 1;
      if (state.countdown <= 0) {
        state.countdown = 0;
        paintCountdown();
        stopCountdown();
        window.UI.toast('支付已超时，订单已保留在“待支付”');
        return;
      }
      paintCountdown();
    }, 1000);
  }

  function paintCountdown() {
    var text = pad(Math.floor(state.countdown / 60)) + ':' + pad(state.countdown % 60);
    if ($('#countdown')) $('#countdown').textContent = text;
    if ($('#ac-countdown')) $('#ac-countdown').textContent = text;
  }

  function stopCountdown() {
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
  }

  function validateBooking() {
    var ok = true;
    var name = $('#cf-name');
    var phone = $('#cf-phone');
    var d = bookingDraft();

    if (!name.value.trim()) { name.parentNode.classList.add('is-invalid'); ok = false; }
    else name.parentNode.classList.remove('is-invalid');

    if (!/^1[3-9]\d{9}$/.test(phone.value.trim())) { phone.parentNode.classList.add('is-invalid'); ok = false; }
    else phone.parentNode.classList.remove('is-invalid');

    var count = Number($('#cf-count').value);
    if (!count || count < 1 || count > d.seat.cap) { $('#cf-count').parentNode.classList.add('is-invalid'); ok = false; }
    else $('#cf-count').parentNode.classList.remove('is-invalid');

    if (!$('#cf-agree').checked) {
      ok = false;
      window.UI.toast('请先阅读并勾选《预订须知》');
    }
    if (!ok && $('#cf-agree').checked) window.UI.toast('请检查联系人与同行人数');
    return ok;
  }

  function submitOrder() {
    if (!validateBooking()) return;
    var d = bookingDraft();
    var btn = $('#pay-btn');
    btn.classList.add('is-loading');
    btn.disabled = true;

    setTimeout(function () {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      stopCountdown();

      var order = makeOrder({
        parkId: d.park.id,
        seatId: d.seat.id,
        seatName: d.seat.name,
        date: d.date,
        slotId: d.slot.id,
        people: Number($('#cf-count').value) || 1,
        holder: $('#cf-name').value.trim(),
        phone: $('#cf-phone').value.trim(),
        amount: d.total,
        remark: $('#cf-remark').value.trim(),
        status: 'unpaid'
      });
      state.orders.unshift(order);
      state.payOrder = order;
      state.currentOrder = order.no;
      state.payFailed = false;

      /* 模拟支付回调 */
      setTimeout(function () {
        if (!state.payFailed) order.status = 'unused';
        setScreen('pay');
      }, 450);
    }, 700);
  }

  /* ---------------- 支付结果 ---------------- */

  function renderPay() {
    var order = state.payOrder;
    if (!order) {
      order = state.orders.filter(function (o) { return o.status === 'unpaid'; })[0] || state.orders[0];
      state.payOrder = order;
    }
    var fail = state.payFailed;
    var hero = $('#pay-hero');
    hero.classList.toggle('result-hero--fail', fail);
    $('#pay-icon').innerHTML = '<use href="#' + (fail ? 'i-close' : 'i-check') + '"/>';
    $('#pay-title').textContent = fail ? '支付未完成' : '支付成功';
    $('#pay-desc').textContent = fail
      ? '支付已超时或被取消，订单已保留 10 分钟，可重新发起支付。'
      : '核销码已生成，请在入园时出示。订单可在“我的预约”中查看。';
    $('#pay-qr-wrap').style.display = fail ? 'none' : '';
    $('#pay-code').textContent = order.code;
    $('#pay-order-no').textContent = order.no;
    var isAct = order.type === 'activity';
    $('#pay-park').textContent = isAct ? order.actTitle : order.parkName;
    $('#pay-amount').textContent = '¥' + order.amount;

    $('#pay-park-label').textContent = isAct ? '活动' : '公园';
    $('#pay-time-label').textContent = isAct ? '参与时间' : '使用时间';
    $('#pay-seat-label').textContent = isAct ? '票种' : '营位';
    $('#pay-time').textContent = isAct
      ? order.date.label + ' ' + order.date.dow + ' · ' + order.time
      : order.date.label + ' ' + order.date.dow + ' · ' + order.slotName;
    $('#pay-seat').textContent = isAct ? order.ticketText : order.seatId + ' · ' + order.seatName;
    $('#pay-fail-btn').textContent = fail ? '重新发起支付（演示成功）' : '演示支付失败 / 超时';
  }

  /* ---------------- 我的预约 ---------------- */

  function actOrderActions(o) {
    if (o.status === 'unpaid') {
      return '<button class="btn btn--secondary btn--sm" type="button" data-order-act="cancel" data-no="' + o.no + '">取消预约</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-order-act="pay" data-no="' + o.no + '">去支付</button>';
    }
    if (o.status === 'unused') {
      return '<button class="btn btn--secondary btn--sm" type="button" data-order-act="refund" data-no="' + o.no + '">申请退款</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-order-act="detail" data-no="' + o.no + '">查看核销码</button>';
    }
    if (o.status === 'used') {
      return '<button class="btn btn--secondary btn--sm" type="button" data-order-act="again" data-no="' + o.no + '">再次预约</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-order-act="detail" data-no="' + o.no + '">订单详情</button>';
    }
    return '<button class="btn btn--secondary btn--sm" type="button" data-order-act="again" data-no="' + o.no + '">再次预约</button>';
  }

  function actOrderCard(o) {
    var st = STATUS[o.status];
    return '' +
      '<div class="order-card" data-order="' + o.no + '">' +
        '<div class="order-card__head">' +
          '<span class="order-card__park"><span class="badge badge--wheat" style="margin-right:6px">活动</span>' + esc(o.actTitle) + '</span>' +
          '<span class="badge ' + st.badge + '">' + st.label + '</span>' +
        '</div>' +
        '<div class="order-card__body">' +
          '<span class="order-card__thumb order-card__thumb--act">' + o.qty + ' 张<br>' + o.date.md + '</span>' +
          '<span class="order-card__info">' +
            '<span class="order-card__line">' + o.date.label + ' ' + o.date.dow + ' · ' + o.time + '</span>' +
            '<span class="order-card__line u-faint">' + esc(o.parkName) + '</span>' +
            '<span class="order-card__line u-faint">' + esc(o.ticketText) + '</span>' +
            '<span class="order-card__line u-faint u-mono">' + o.no + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="order-card__foot">' +
          '<span class="order-card__amount">实付 <b>¥' + o.amount + '</b></span>' +
          '<span class="order-card__actions">' + actOrderActions(o) + '</span>' +
        '</div>' +
      '</div>';
  }

  function orderCard(o) {
    if (o.type === 'activity') return actOrderCard(o);
    var st = STATUS[o.status];
    var actions = '';
    if (o.status === 'unpaid') {
      actions = '<button class="btn btn--secondary btn--sm" type="button" data-order-act="cancel" data-no="' + o.no + '">取消订单</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-order-act="pay" data-no="' + o.no + '">去支付</button>';
    } else if (o.status === 'unused') {
      actions = '<button class="btn btn--secondary btn--sm" type="button" data-order-act="refund" data-no="' + o.no + '">申请退款</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-order-act="detail" data-no="' + o.no + '">查看核销码</button>';
    } else if (o.status === 'used') {
      actions = '<button class="btn btn--secondary btn--sm" type="button" data-order-act="again" data-no="' + o.no + '">再次预订</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-order-act="detail" data-no="' + o.no + '">订单详情</button>';
    } else {
      actions = '<button class="btn btn--secondary btn--sm" type="button" data-order-act="again" data-no="' + o.no + '">再次预订</button>';
    }

    return '' +
      '<div class="order-card" data-order="' + o.no + '">' +
        '<div class="order-card__head">' +
          '<span class="order-card__park">' + esc(o.parkName) + '</span>' +
          '<span class="badge ' + st.badge + '">' + st.label + '</span>' +
        '</div>' +
        '<div class="order-card__body">' +
          '<span class="order-card__thumb">' + o.seatId + '<br>' + o.date.md + '</span>' +
          '<span class="order-card__info">' +
            '<span class="order-card__line">' + o.date.label + ' ' + o.date.dow + ' · ' + o.slotName + '</span>' +
            '<span class="order-card__line u-faint">' + o.seatId + ' · ' + o.seatName + ' · ' + o.people + ' 人</span>' +
            '<span class="order-card__line u-faint u-mono">' + o.no + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="order-card__foot">' +
          '<span class="order-card__amount">实付 <b>¥' + o.amount + '</b></span>' +
          '<span class="order-card__actions">' + actions + '</span>' +
        '</div>' +
      '</div>';
  }

  function renderOrders() {
    var host = $('#order-list');
    var list = state.orders.filter(function (o) {
      if (state.typeFilter !== 'all' && o.type !== state.typeFilter) return false;
      return state.filter === 'all' || o.status === state.filter;
    });
    $('#order-count').textContent = '共 ' + list.length + ' 个订单';

    $$('#order-type-filters .seg__btn').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-type') === state.typeFilter);
    });

    if (state.empty) {
      host.innerHTML = emptyState('还没有预约记录', '去挑一个公园，地图上直接点选营位；或报名一场主题活动。');
      return;
    }
    if (!list.length) {
      host.innerHTML = emptyState('该筛选下暂无订单', '切换上方业务类型或状态筛选，或去公园露营看看。');
      return;
    }
    host.innerHTML = list.map(orderCard).join('');
  }

  /* ---------------- 订单详情 ---------------- */

  function orderByNo(no) {
    for (var i = 0; i < state.orders.length; i++) if (state.orders[i].no === no) return state.orders[i];
    return null;
  }

  function renderActOrderDetail(o) {
    var host = $('#order-detail');
    var st = STATUS[o.status];

    var qr = '';
    if (o.status === 'unused') {
      qr = '<div class="qr-card u-mt-3">' +
        '<img src="../assets/img/qr-placeholder.svg" alt="核销二维码">' +
        '<div class="code-text">' + o.code + '</div>' +
        '<div class="qr-card__hint">入场时由工作人员扫码或输入编码核销</div>' +
        '</div>';
    } else if (o.status === 'used') {
      qr = '<div class="mp-card u-mt-3 u-center">' +
        '<span class="badge badge--cyan">已于 ' + (o.verifiedAt || '—') + ' 核销</span>' +
        '<p class="u-micro u-faint u-mt-2">核销后不可重复使用，如需再次参加请重新预约。</p>' +
        '</div>';
    }

    var actions = '';
    if (o.status === 'unpaid') {
      actions = '<button class="btn btn--secondary btn--block" type="button" data-order-act="cancel" data-no="' + o.no + '">取消预约</button>' +
        '<button class="btn btn--primary btn--block u-mt-2" type="button" data-order-act="pay" data-no="' + o.no + '">继续支付 ¥' + o.amount + '</button>';
    } else if (o.status === 'unused') {
      actions = '<button class="btn btn--secondary btn--block" type="button" data-order-act="refund" data-no="' + o.no + '">申请退款</button>' +
        '<button class="btn btn--primary btn--block u-mt-2" type="button" data-toast="已放大核销码，现场扫码即可">放大核销码</button>';
    } else {
      actions = '<button class="btn btn--primary btn--block" type="button" data-order-act="again" data-no="' + o.no + '">再约一次</button>';
    }

    var timeline = [
      { title: '预约创建', meta: o.createdAt, icon: 'i-ticket', on: true },
      { title: o.status === 'unpaid' ? '等待支付' : '支付成功', meta: o.status === 'unpaid' ? '请在 10 分钟内完成支付' : '支付方式：微信支付（演示）', icon: 'i-wallet', on: o.status !== 'unpaid' },
      { title: o.status === 'used' ? '已核销' : (o.status === 'cancelled' ? '预约已取消' : (o.status === 'refunded' ? '退款已完成' : '待现场核销')), meta: o.status === 'used' ? (o.verifiedAt || '') : (o.status === 'cancelled' ? '用户取消，票量已释放' : (o.status === 'refunded' ? '退款原路返回，1–3 个工作日到账' : '凭核销码在 ' + o.date.label + ' ' + o.time + ' 入场')), icon: o.status === 'cancelled' || o.status === 'refunded' ? 'i-close' : (o.status === 'used' ? 'i-check' : 'i-scan'), on: o.status !== 'expired' }
    ];

    host.innerHTML = '' +
      '<div class="detail-head">' +
        '<h2>' + st.label + '</h2>' +
        '<p class="u-mono">' + o.no + '</p>' +
        '<div class="detail-head__amount">¥' + o.amount + '</div>' +
        '<div class="detail-head__actions">' +
          '<span class="badge badge--wheat">活动</span>' +
          '<span class="badge badge--forest">' + o.date.label + ' ' + o.date.dow + '</span>' +
          '<span class="badge badge--forest">' + o.time + '</span>' +
        '</div>' +
      '</div>' +
      qr +
      '<div class="mp-card u-mt-3">' +
        '<div class="summary-card__title">' + esc(o.actTitle) + '</div>' +
        '<div class="rows u-mt-2">' +
          '<div class="row"><dt>活动地点</dt><dd>' + esc(o.parkName) + '</dd></div>' +
          '<div class="row"><dt>场次时间</dt><dd>' + o.time + '</dd></div>' +
          '<div class="row"><dt>票种与数量</dt><dd>' + esc(o.ticketText) + '（共 ' + o.qty + ' 张）</dd></div>' +
          '<div class="row"><dt>联系人</dt><dd>' + esc(o.holder) + ' · ' + o.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') + '</dd></div>' +
          (o.remark ? '<div class="row"><dt>备注</dt><dd>' + esc(o.remark) + '</dd></div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="mp-card u-mt-3">' +
        '<div class="u-xs" style="font-weight:600;margin-bottom:var(--sp-3)">预约进度</div>' +
        '<div class="timeline">' + timeline.map(function (t) {
          return '<div class="timeline__item">' +
            '<span class="timeline__dot">' + icon(t.icon) + '</span>' +
            '<div class="timeline__body">' +
              '<div class="timeline__title">' + t.title + '</div>' +
              '<div class="timeline__meta">' + t.meta + '</div>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="mp-card u-mt-3">' +
        '<div class="u-xs" style="font-weight:600;margin-bottom:var(--sp-2)">费用与退改</div>' +
        '<div class="rows">' + o.lines.map(function (l) {
          return '<div class="row"><dt>' + esc(l.name) + ' ×' + l.qty + '</dt><dd>¥' + (l.price * l.qty) + '</dd></div>';
        }).join('') +
          '<div class="row"><dt>服务费</dt><dd>¥0</dd></div>' +
          '<div class="row"><dt>实付</dt><dd>¥' + o.amount + '</dd></div>' +
        '</div>' +
        '<p class="u-micro u-faint u-mt-2">活动开始前 24 小时可免费取消；逾期不支持退款；雨天活动改期或全额退款。</p>' +
      '</div>' +
      '<div class="u-mt-4">' + actions + '</div>';
  }

  function renderOrderDetail() {
    var o = orderByNo(state.currentOrder) || state.orders[0];
    var host = $('#order-detail');
    if (!o) { host.innerHTML = emptyState('没有可展示的订单', '先完成一次预约。'); return; }
    state.currentOrder = o.no;
    if (o.type === 'activity') { renderActOrderDetail(o); return; }
    var st = STATUS[o.status];
    var wrap = getPark(o.parkId);

    var qr = '';
    if (o.status === 'unused') {
      qr = '<div class="qr-card u-mt-3">' +
        '<img src="../assets/img/qr-placeholder.svg" alt="核销二维码">' +
        '<div class="code-text">' + o.code + '</div>' +
        '<div class="qr-card__hint">入场时由工作人员扫码或输入编码核销</div>' +
        '</div>';
    } else if (o.status === 'used') {
      qr = '<div class="mp-card u-mt-3 u-center">' +
        '<span class="badge badge--cyan">已于 ' + (o.verifiedAt || '—') + ' 核销</span>' +
        '<p class="u-micro u-faint u-mt-2">核销后不可重复使用，如需再次入园请重新预约。</p>' +
        '</div>';
    }

    var actions = '';
    if (o.status === 'unpaid') {
      actions = '<button class="btn btn--secondary btn--block" type="button" data-order-act="cancel" data-no="' + o.no + '">取消订单</button>' +
        '<button class="btn btn--primary btn--block u-mt-2" type="button" data-order-act="pay" data-no="' + o.no + '">继续支付 ¥' + o.amount + '</button>';
    } else if (o.status === 'unused') {
      actions = '<button class="btn btn--secondary btn--block" type="button" data-order-act="refund" data-no="' + o.no + '">申请退款</button>' +
        '<button class="btn btn--primary btn--block u-mt-2" type="button" data-toast="已放大核销码，现场扫码即可">放大核销码</button>';
    } else {
      actions = '<button class="btn btn--primary btn--block" type="button" data-order-act="again" data-no="' + o.no + '">再订一次</button>';
    }

    var timeline = [
      { title: '订单创建', meta: o.createdAt, icon: 'i-ticket', on: true },
      { title: o.status === 'unpaid' ? '等待支付' : '支付成功', meta: o.status === 'unpaid' ? '请在 10 分钟内完成支付' : '支付方式：微信支付（演示）', icon: 'i-wallet', on: o.status !== 'unpaid' },
      { title: o.status === 'used' ? '已核销' : (o.status === 'cancelled' ? '订单已取消' : (o.status === 'refunded' ? '退款已完成' : '待入园核销')), meta: o.status === 'used' ? (o.verifiedAt || '') : (o.status === 'cancelled' ? '用户取消，未占用营位' : (o.status === 'refunded' ? '退款原路返回，1–3 个工作日到账' : '凭核销码在 ' + o.date.label + ' ' + o.slotName + ' 入场')), icon: o.status === 'cancelled' || o.status === 'refunded' ? 'i-close' : (o.status === 'used' ? 'i-check' : 'i-scan'), on: o.status !== 'expired' }
    ];

    host.innerHTML = '' +
      '<div class="detail-head">' +
        '<h2>' + st.label + '</h2>' +
        '<p class="u-mono">' + o.no + '</p>' +
        '<div class="detail-head__amount">¥' + o.amount + '</div>' +
        '<div class="detail-head__actions">' +
          '<span class="badge badge--forest">' + o.date.label + ' ' + o.date.dow + '</span>' +
          '<span class="badge badge--forest">' + o.slotName + '</span>' +
        '</div>' +
      '</div>' +
      qr +
      '<div class="mp-card u-mt-3">' +
        '<div class="summary-card__title">' + esc(o.parkName) + '</div>' +
        '<div class="rows u-mt-2">' +
          '<div class="row"><dt>营位</dt><dd>' + o.seatId + ' · ' + o.seatName + '</dd></div>' +
          '<div class="row"><dt>入园时段</dt><dd>' + o.slotName + ' ' + o.slotTime + '</dd></div>' +
          '<div class="row"><dt>同行人数</dt><dd>' + o.people + ' 人</dd></div>' +
          '<div class="row"><dt>联系人</dt><dd>' + esc(o.holder) + ' · ' + o.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') + '</dd></div>' +
          '<div class="row"><dt>园区地址</dt><dd>珠海市' + wrap.area + '（示意）</dd></div>' +
          (o.remark ? '<div class="row"><dt>备注</dt><dd>' + esc(o.remark) + '</dd></div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="mp-card u-mt-3">' +
        '<div class="u-xs" style="font-weight:600;margin-bottom:var(--sp-3)">订单进度</div>' +
        '<div class="timeline">' + timeline.map(function (t) {
          return '<div class="timeline__item">' +
            '<span class="timeline__dot">' + icon(t.icon) + '</span>' +
            '<div class="timeline__body">' +
              '<div class="timeline__title">' + t.title + '</div>' +
              '<div class="timeline__meta">' + t.meta + '</div>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="mp-card u-mt-3">' +
        '<div class="u-xs" style="font-weight:600;margin-bottom:var(--sp-2)">费用与退改</div>' +
        '<div class="rows">' +
          '<div class="row"><dt>营位费</dt><dd>¥' + (o.amount - 5) + '</dd></div>' +
          '<div class="row"><dt>保险费</dt><dd>¥5</dd></div>' +
          '<div class="row"><dt>实付</dt><dd>¥' + o.amount + '</dd></div>' +
        '</div>' +
        '<p class="u-micro u-faint u-mt-2">开场前 24 小时可免费取消；开场后未到场视为已使用；恶劣天气闭园全额退款。</p>' +
      '</div>' +
      '<div class="u-mt-4">' + actions + '</div>';
  }

  /* ---------------- 核销 ---------------- */

  function renderScanRecords() {
    var park = getPark('p1');
    $('#scan-park').textContent = park.name + ' · 核销员';
    $('#scan-records').innerHTML = state.records.map(function (r) {
      return '<div class="record-row">' +
        '<span class="badge ' + (r.ok ? 'badge--leaf' : 'badge--rust') + '">' + (r.ok ? '成功' : '失败') + '</span>' +
        '<div class="record-row__body">' +
          '<div class="record-row__title">' + esc(r.seat) + '</div>' +
          '<div class="record-row__meta">' + esc(r.code) + '</div>' +
        '</div>' +
        '<span class="record-row__time">' + r.time + '</span>' +
      '</div>';
    }).join('');
  }

  var VERIFY = {
    success: {
      kind: 'ok',
      icon: 'i-check',
      title: '可以核销',
      desc: '订单有效，园区匹配，且未使用。确认后向游客放行。',
      checks: [
        { ok: true, text: '订单状态：待使用', note: '未被取消、退款或过期' },
        { ok: true, text: '园区权限：斗门水乡公园', note: '核销员与订单园区一致' },
        { ok: true, text: '使用记录：未核销', note: '首次核销' },
        { ok: true, text: '有效期：3 月 16 日 上午场', note: '当前在有效时段内' }
      ]
    },
    duplicate: {
      kind: 'fail',
      icon: 'i-close',
      title: '该订单已核销',
      desc: '同一核销码只能使用一次。请勿重复放行，必要时联系园区管理员。',
      checks: [
        { ok: true, text: '订单状态：待使用', note: '' },
        { ok: true, text: '园区权限：斗门水乡公园', note: '' },
        { ok: false, text: '使用记录：已核销', note: '今天 08:42 · 操作员 陈立' },
        { ok: true, text: '有效期：3 月 16 日 上午场', note: '' }
      ]
    },
    forbidden: {
      kind: 'fail',
      icon: 'i-shield',
      title: '无权限核销该订单',
      desc: '该订单属于「黄杨河湿地公园」。跨园区核销会被记录到操作日志。',
      checks: [
        { ok: true, text: '订单状态：待使用', note: '' },
        { ok: false, text: '园区权限：不匹配', note: '你的权限：斗门水乡公园' },
        { ok: true, text: '使用记录：未核销', note: '' },
        { ok: true, text: '有效期：3 月 16 日 上午场', note: '' }
      ]
    },
    cancelled: {
      kind: 'fail',
      icon: 'i-close',
      title: '订单已取消',
      desc: '游客已取消该预约，营位已释放。请引导游客重新下单。',
      checks: [
        { ok: false, text: '订单状态：已取消', note: '3 月 14 日 18:20 由游客取消' },
        { ok: true, text: '园区权限：斗门水乡公园', note: '' },
        { ok: true, text: '使用记录：未核销', note: '' },
        { ok: false, text: '有效期：不适用', note: '订单已失效' }
      ]
    },
    expired: {
      kind: 'warn',
      icon: 'i-warning',
      title: '核销码已过期',
      desc: '该订单的使用时段已结束，系统按“过期未使用”处理，无法核销。',
      checks: [
        { ok: false, text: '订单状态：已过期', note: '使用时段结束后自动流转' },
        { ok: true, text: '园区权限：斗门水乡公园', note: '' },
        { ok: true, text: '使用记录：未核销', note: '' },
        { ok: false, text: '有效期：3 月 9 日 上午场', note: '已超过使用时段 7 天' }
      ]
    }
  };

  function verifyOrder() {
    var list = state.orders.filter(function (o) { return o.status === 'unused'; });
    return list[0] || state.orders[0] || null;
  }

  function renderVerify() {
    var v = VERIFY[state.verifying] || VERIFY.success;
    $$('#verify-tabs .chip').forEach(function (c) {
      c.classList.toggle('is-active', c.getAttribute('data-result') === state.verifying);
    });

    var kindClass = v.kind === 'ok' ? '' : (v.kind === 'warn' ? 'verify-result--warn' : 'verify-result--fail');
    var order = verifyOrder();
    var vAct = !!(order && order.type === 'activity');
    var vTitle = order ? (vAct ? order.actTitle : order.parkName) : '斗门水乡公园';
    var vItemLabel = vAct ? '票种' : '营位';
    var vItem = order ? (vAct ? order.ticketText : order.seatId + ' · ' + order.seatName) : 'A03 · 水岸营位';
    var vWhen = order ? (vAct ? order.date.label + ' · ' + order.time : order.date.label + ' · ' + order.slotName) : '今天 · 上午场';
    var vWho = order ? (esc(order.holder) + ' · ' + (vAct ? order.qty + ' 张' : order.people + ' 人')) : '林小满 · 2 人';

    var cta = v.kind === 'ok'
      ? (state.verifyDone
        ? '<div class="u-center u-mt-3"><span class="badge badge--cyan">本次核销已完成</span></div>'
        : '<button class="btn btn--primary btn--lg btn--block u-mt-4" type="button" id="verify-confirm">确认核销并放行</button>')
      : '<div class="u-row u-mt-4">' +
          '<button class="btn btn--secondary btn--block" type="button" data-back="scan">重新扫码</button>' +
          '<button class="btn btn--ghost btn--block" type="button" data-toast="已记录该异常，可在后台操作日志中查看">上报异常</button>' +
        '</div>';

    $('#verify-body').innerHTML = '' +
      '<div class="verify-result ' + kindClass + '">' +
        '<div class="verify-result__icon">' + icon(v.icon, 'icon--lg') + '</div>' +
        '<h2>' + v.title + '</h2>' +
        '<p>' + v.desc + '</p>' +
      '</div>' +
      '<div class="mp-card">' +
        '<div class="summary-card__title">' + vTitle + '</div>' +
        '<div class="rows u-mt-2">' +
          '<div class="row"><dt>' + vItemLabel + '</dt><dd>' + vItem + '</dd></div>' +
          '<div class="row"><dt>使用时间</dt><dd>' + vWhen + '</dd></div>' +
          '<div class="row"><dt>游客</dt><dd>' + vWho + '</dd></div>' +
          '<div class="row"><dt>核销编码</dt><dd class="u-mono">' + (order ? order.code : 'PB-20260316-A03') + '</dd></div>' +
        '</div>' +
        '<div class="check-list u-mt-3">' + v.checks.map(function (c) {
          return '<div class="check-row' + (c.ok ? '' : ' check-row--fail') + '">' +
            icon(c.ok ? 'i-check' : 'i-warning') +
            '<span>' + c.text + (c.note ? '<span class="check-row__note">' + c.note + '</span>' : '') + '</span>' +
          '</div>';
        }).join('') + '</div>' +
      '</div>' +
      cta;
  }

  function confirmVerify() {
    var order = verifyOrder();
    if (order) {
      order.status = 'used';
      order.verifiedAt = '今天 09:41';
    }
    state.records.unshift({
      seat: order ? (order.type === 'activity' ? order.actTitle : order.seatId + ' · ' + order.seatName) : 'A03 · 水岸营位',
      code: order ? order.code : 'PB-20260316-A03',
      time: '09:41',
      ok: true
    });
    state.verifyDone = true;
    renderVerify();
    window.UI.toast('核销成功，已记录操作日志');
  }

  /* ---------------- 我的 ---------------- */

  function renderProfile() {
    var all = state.orders;
    $('#me-unused').textContent = all.filter(function (o) { return o.status === 'unused'; }).length;
    $('#me-used').textContent = all.filter(function (o) { return o.status === 'used'; }).length;
    $('#me-all').textContent = all.length;
  }

  /* ---------------- 骨架屏 ---------------- */

  function playSkeleton() {
    var host = state.screen === 'orders' ? $('#order-list') : $('#park-list');
    if (!host) return;
    var rows = '';
    for (var i = 0; i < 3; i++) {
      rows += '<div class="mp-card" style="margin-top:var(--sp-3)">' +
        '<div class="skeleton" style="width:60%;height:14px"></div>' +
        '<div class="skeleton u-mt-2" style="width:90%;height:10px"></div>' +
        '<div class="skeleton u-mt-1" style="width:40%;height:10px"></div>' +
      '</div>';
    }
    host.innerHTML = rows;
    setTimeout(function () {
      if (state.screen === 'orders') renderOrders(); else if (state.screen === 'parks') renderParkList();
    }, 1400);
  }

  /* ---------------- 事件绑定 ---------------- */

  function go(name) { setScreen(name); }

  document.addEventListener('click', function (e) {
    var target = e.target;

    var nav = target.closest('[data-nav]');
    if (nav) { go(nav.getAttribute('data-nav')); return; }

    var goEl = target.closest('[data-go]');
    if (goEl) { go(goEl.getAttribute('data-go')); return; }

    var back = target.closest('[data-back]');
    if (back) { go(back.getAttribute('data-back')); return; }

    var actEl = target.closest('[data-act]');
    if (actEl) {
      state.actId = actEl.getAttribute('data-act');
      state.actDate = 0;
      state.actQtyFor = null;
      go('act');
      return;
    }

    var actDateEl = target.closest('[data-act-date]');
    if (actDateEl) {
      if (actDateEl.getAttribute('aria-disabled') === 'true') {
        window.UI.toast('该日期票量已售罄，请选择其他日期');
        return;
      }
      state.actDate = Number(actDateEl.getAttribute('data-act-date'));
      if (clampActQty()) window.UI.toast('该日期部分票种余量不足，已为你调整数量');
      renderAct();
      return;
    }

    var incEl = target.closest('[data-ticket-inc]');
    if (incEl) {
      if (incEl.disabled) return;
      changeQty(incEl.getAttribute('data-ticket-inc'), 1);
      return;
    }

    var decEl = target.closest('[data-ticket-dec]');
    if (decEl) {
      if (decEl.disabled) return;
      changeQty(decEl.getAttribute('data-ticket-dec'), -1);
      return;
    }

    var catChip = target.closest('#act-filters [data-cat]');
    if (catChip) {
      state.actCat = catChip.getAttribute('data-cat');
      renderActs();
      return;
    }

    var typeChip = target.closest('#order-type-filters [data-type]');
    if (typeChip) {
      state.typeFilter = typeChip.getAttribute('data-type');
      renderOrders();
      return;
    }

    var parkEl = target.closest('[data-park]');
    if (parkEl) {
      state.parkId = parkEl.getAttribute('data-park');
      state.dateIdx = 0;
      state.slotId = 'am';
      state.seatId = null;
      state.view = state.broken ? 'list' : 'map';
      state.zoom = 1; state.tx = 0; state.ty = 0;
      go('park');
      return;
    }

    var dateEl = target.closest('[data-date]');
    if (dateEl) {
      state.dateIdx = Number(dateEl.getAttribute('data-date'));
      var keep = state.seatId;
      if (keep && !findSeat(keep)) {
        state.seatId = null;
        window.UI.toast('该营位在所选日期不可约，已为你清空选择');
      }
      renderDates();
      renderSlots();
      renderMap();
      renderSeatList();
      updateActionbar();
      return;
    }

    var slotEl = target.closest('[data-slot]');
    if (slotEl) {
      if (slotEl.classList.contains('is-full')) { window.UI.toast('该时段已约满，请选择其他时段'); return; }
      var prev = state.slotId;
      state.slotId = slotEl.getAttribute('data-slot');
      if (prev !== state.slotId && state.seatId) {
        state.seatId = null;
        window.UI.toast('已切换时段，请重新选择营位');
      }
      renderSlots();
      renderMap();
      renderSeatList();
      updateActionbar();
      return;
    }

    if (target.closest('[data-sheet-close]')) { closeSheet(); return; }

    var seatEl = target.closest('[data-seat]');
    if (seatEl && !seatEl.closest('#sheet-select')) {
      openSeat(findSeat(seatEl.getAttribute('data-seat')));
      return;
    }

    var orderAct = target.closest('[data-order-act]');
    if (orderAct) {
      e.stopPropagation();
      var no = orderAct.getAttribute('data-no');
      var act = orderAct.getAttribute('data-order-act');
      var order = orderByNo(no);
      if (!order) return;
      if (act === 'pay') {
        state.payOrder = order;
        state.payFailed = false;
        order.status = 'unused';
        go('pay');
      } else if (act === 'detail') {
        state.currentOrder = no;
        go('order');
      } else if (act === 'cancel') {
        order.status = 'cancelled';
        window.UI.toast('订单已取消，营位已释放');
        renderOrders();
        if (state.screen === 'order') { renderOrderDetail(); }
      } else if (act === 'refund') {
        order.status = 'refunded';
        window.UI.toast('退款已提交，1–3 个工作日原路退回');
        renderOrders();
        if (state.screen === 'order') { renderOrderDetail(); }
      } else if (act === 'again') {
        if (order.type === 'activity') {
          state.actId = order.actId;
          state.actDate = 0;
          state.actQtyFor = null;
          go('act');
        } else {
          state.parkId = order.parkId;
          state.seatId = null;
          go('park');
        }
      }
      return;
    }

    var card = target.closest('[data-order]');
    if (card) {
      state.currentOrder = card.getAttribute('data-order');
      go('order');
      return;
    }

    var chipStatus = target.closest('#order-filters [data-status]');
    if (chipStatus) {
      state.filter = chipStatus.getAttribute('data-status');
      $$('#order-filters .chip').forEach(function (c) { c.classList.toggle('is-active', c === chipStatus); });
      renderOrders();
      return;
    }

    var chipFilter = target.closest('#park-filters [data-filter]');
    if (chipFilter) {
      $$('#park-filters .chip').forEach(function (c) { c.classList.toggle('is-active', c === chipFilter); });
      renderParkList();
      return;
    }

    var viewBtn = target.closest('[data-view]');
    if (viewBtn && !viewBtn.disabled) {
      state.view = viewBtn.getAttribute('data-view');
      syncMapMode();
      return;
    }

    var verifyTab = target.closest('#verify-tabs [data-result]');
    if (verifyTab) {
      state.verifying = verifyTab.getAttribute('data-result');
      state.verifyDone = false;
      renderVerify();
      return;
    }

    if (target.closest('#verify-confirm')) { confirmVerify(); return; }
  });

  /* 键盘：地图营位支持回车 / 空格触发 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest('.mseat');
    if (!el) return;
    e.preventDefault();
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  $('#sheet-select').addEventListener('click', function () {
    var id = this.getAttribute('data-seat');
    if (id) selectSeat(id);
  });

  $('#next-btn').addEventListener('click', function () {
    if (this.disabled) return;
    go('confirm');
  });

  $('#pay-btn').addEventListener('click', submitOrder);

  $('#act-next').addEventListener('click', function () {
    if (this.disabled) return;
    go('actconfirm');
  });

  $('#ac-pay-btn').addEventListener('click', submitActOrder);

  $('#act-search').addEventListener('input', renderActs);

  $('#pay-fail-btn').addEventListener('click', function () {
    if (state.payFailed) {
      state.payFailed = false;
      if (state.payOrder) state.payOrder.status = 'unused';
      renderPay();
      window.UI.toast('已重新支付成功');
    } else {
      state.payFailed = true;
      if (state.payOrder) state.payOrder.status = 'unpaid';
      renderPay();
    }
  });

  $('#park-search').addEventListener('input', renderParkList);

  $('#zoom-in').addEventListener('click', function () { setZoom(state.zoom + 0.3); });
  $('#zoom-out').addEventListener('click', function () { setZoom(state.zoom - 0.3); });
  $('#zoom-reset').addEventListener('click', function () {
    state.zoom = 1; state.tx = 0; state.ty = 0; applyTransform();
  });

  $('#layers-toggle').addEventListener('click', function () {
    var open = $('#map-layers').classList.toggle('is-open');
    this.setAttribute('aria-expanded', String(open));
  });

  $('#map-reload').addEventListener('click', function () {
    renderMap();
    renderSeatList();
    window.UI.toast('已刷新营位状态');
  });

  $$('#map-layers input[data-layer]').forEach(function (box) {
    box.addEventListener('change', function () {
      var group = $('#map-overlay [data-layer-group="' + box.getAttribute('data-layer') + '"]');
      if (group) group.classList.toggle('layer-off', !box.checked);
    });
  });

  /* 地图拖动 */
  (function () {
    var vp = $('#map-viewport');
    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    vp.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY; ox = state.tx; oy = state.ty;
      vp.classList.add('is-panning');
      if (vp.setPointerCapture) { try { vp.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    vp.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      state.tx = ox + (e.clientX - sx);
      state.ty = oy + (e.clientY - sy);
      clampPan();
      applyTransform();
    });
    function end() { dragging = false; vp.classList.remove('is-panning'); }
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    vp.addEventListener('pointerleave', function () { if (dragging) end(); });
  })();

  /* 扫码 / 输码 */
  $('#scan-demo').addEventListener('click', function () {
    $('#scan-input').value = 'PB-20260316A03';
    state.verifying = 'success';
    state.verifyDone = false;
    go('verify');
  });

  $('#scan-submit').addEventListener('click', function () {
    var code = $('#scan-input').value.trim();
    if (!code) { window.UI.toast('请输入核销编码或点击扫码'); return; }
    var existing = state.records.filter(function (r) { return r.code.replace(/-/g, '').indexOf(code.replace(/-/g, '')) >= 0; })[0];
    state.verifying = existing ? 'duplicate' : 'success';
    state.verifyDone = false;
    go('verify');
  });

  /* 演示开关 */
  $('#sw-map-fail').addEventListener('change', function () {
    state.broken = this.checked;
    if (state.broken) {
      state.view = 'list';
      renderSeatList();
      if (state.screen !== 'park') go('park');
      window.UI.toast('已模拟地图加载失败，自动降级为列表');
    } else if (state.screen === 'park') {
      renderMap();
    }
    syncMapMode();
    updateActionbar();
  });

  $('#sw-empty').addEventListener('change', function () {
    state.empty = this.checked;
    if (state.screen === 'parks') renderParkList();
    if (state.screen === 'orders') renderOrders();
    if (state.screen === 'home') renderHomeParks();
    window.UI.toast(this.checked ? '已开启空数据演示' : '已恢复演示数据');
  });

  $('#btn-slow').addEventListener('click', function () {
    if (state.screen !== 'parks' && state.screen !== 'orders') go('parks');
    playSkeleton();
    this.disabled = true;
    var btn = this;
    setTimeout(function () { btn.disabled = false; }, 1500);
  });

  $('#reset-demo').addEventListener('click', function () {
    var defaults = {
      parkId: 'p1', dateIdx: 0, slotId: 'am', seatId: null, view: 'map',
      zoom: 1, tx: 0, ty: 0, broken: false, empty: false, filter: 'all',
      typeFilter: 'all', actCat: 'all', actId: 'a1', actDate: 0, actQtyFor: null, actQty: {},
      verifying: 'success', verifyDone: false, payFailed: false,
      currentOrder: null, payOrder: null
    };
    for (var k in defaults) state[k] = defaults[k];
    state.orders = seedOrders();
    $('#sw-map-fail').checked = false;
    $('#sw-empty').checked = false;
    $('#park-search').value = '';
    $('#act-search').value = '';
    $('#scan-input').value = '';
    $('#cf-agree').checked = false;
    $('#ac-agree').checked = false;
    $$('#park-filters .chip').forEach(function (c, i) { c.classList.toggle('is-active', i === 0); });
    $$('#order-filters .chip').forEach(function (c, i) { c.classList.toggle('is-active', i === 0); });
    $$('#order-type-filters .seg__btn').forEach(function (c, i) { c.classList.toggle('is-active', i === 0); });
    $$('#act-filters .chip').forEach(function (c, i) { c.classList.toggle('is-active', i === 0); });
    go('home');
    window.UI.toast('演示数据已重置');
  });

  /* 首屏 */
  renderHomeParks();
  renderHomeActs();
  setScreen('home');
})();
