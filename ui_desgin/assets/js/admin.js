/* ==========================================================================
   admin.js — 后台管理系统原型交互
   纯原生 JS，无依赖；所有数据为演示 Mock，可直接 file:// 打开
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var toast = function (msg, type) { window.UI.toast(msg, type); };

  /* ------------------------------------------------------------------
     演示数据
     ------------------------------------------------------------------ */

  var ROLE_NAMES = {
    super: '超级管理员',
    park: '园区管理员',
    audit: '审核员',
    staff: '核销员'
  };

  var ROLE_USERS = {
    super: { name: '陈静', initial: '陈' },
    park: { name: '李伟', initial: '李' },
    audit: { name: '周敏', initial: '周' },
    staff: { name: '吴涛', initial: '吴' }
  };

  var VIEW_META = {
    dash: '运营工作台',
    parks: '公园管理',
    versions: '地图版本与审批',
    editor: '地图编辑器',
    seats: '营位与价格',
    orders: '露营订单',
    verify: '露营核销',
    refunds: '退款管理',
    schedule: '排期与库存',
    report: '经营数据',
    acts: '活动管理',
    staff: '核销员与权限',
    logs: '操作日志'
  };

  /* 可用的演示图片（配图库），file:// 下仅使用本地 SVG */
  var PARK_IMAGES = ['park-cover-1.svg', 'park-cover-2.svg', 'park-cover-3.svg', 'park-map-1.svg'];
  var ACT_IMAGES = ['activity-cover.svg', 'park-cover-1.svg', 'park-cover-2.svg', 'park-cover-3.svg'];
  var PARK_TAGS = ['水乡', '亲子', '湿地', '观鸟', '骑行', '梯田', '日落', '星空', '可带宠物', '可烧烤', '可过夜'];
  var ACT_TAGS = ['亲子', '自然', '手作', '夜游', '农事', '含器材', '含工具', '含热饮', '周末', '雨天照常'];

  function buildParks() {
    return [
    {
      id: 'p2', name: '黄杨河湿地公园', code: 'PARK-002', cover: 'park-cover-2.svg',
      map: 'park-map-2.svg', mapW: 1120, mapH: 240, spanKm: 1.1,
      addr: '斗门区井岸镇黄杨河东堤', hours: '07:00 – 19:00', mode: '分时场',
      status: 'online', seatCount: 40,
      desc: '沿黄杨河绵延 1.1 公里的带状湿地营地，5 个营区共 40 个营位，安静少光污染。',
      intro: '营地沿河堤自西向东展开 1.1 公里，西侧芦苇荡为观鸟核心区，东侧浅滩为骑行与亲水区。' +
        '全线分入口草坪、芦苇观鸟、亲水栈道、林荫安静、浅滩骑行 5 个营区共 40 个营位，' +
        '设观鸟栈道 800 米、东西两处出入口与两处公共卫生间。因带状跨度大，后台地图编辑器支持缩放与拖动。',
      tags: ['湿地', '观鸟', '骑行', '带状营地'],
      gallery: ['park-cover-2.svg', 'park-cover-1.svg'],
      notice: '观鸟区禁止无人机；涨潮时段部分栈道临时关闭，请留意现场提示。',
      phone: '0756-5533 902', updated: '2026-03-14 10:22'
    },
    {
      id: 'p1', name: '斗门水乡公园', code: 'PARK-001', cover: 'park-cover-1.svg',
      map: 'park-map-1.svg', mapW: 1200, mapH: 800, spanKm: 0.42,
      addr: '斗门区斗门镇水乡大道 18 号', hours: '08:00 – 20:00', mode: '整日场',
      status: 'online', seatCount: 12,
      desc: '河涌环绕的水乡营地，草坪开阔，适合家庭野餐与轻量露营。',
      intro: '公园三面环水，保留原有河涌与老樟树。营地草坪约 6000 ㎡，设 12 个营位与公共洗手台；' +
        '东侧为亲子活动区，西侧为安静露营区。园区内可租借天幕与折叠桌椅，停车场可停 40 辆小车。',
      tags: ['水乡', '亲子', '可带宠物'],
      gallery: ['park-cover-1.svg', 'park-cover-3.svg'],
      notice: '请自备防蚊用品；22:00 后请勿使用外放音响；宠物须牵引并自行清理。',
      phone: '0756-5568 210', updated: '2026-03-15 16:40'
    },
    {
      id: 'p3', name: '霞山梯田营地', code: 'PARK-003', cover: 'park-cover-3.svg',
      map: 'park-map-3.svg', mapW: 1200, mapH: 800, spanKm: 0.36,
      addr: '斗门区白蕉镇霞山村梯田路', hours: '09:00 – 21:00', mode: '整日场',
      status: 'offline', seatCount: 9,
      desc: '梯田层叠的半山营地，视野开阔，是看日落与星空的热门机位。',
      intro: '营地依山而建，9 个营位随梯田分层布置，最上层为共享观景平台。' +
        '园区提供柴火灶与星空讲解活动，夜间光污染低，适合观星与小型夜谈会。',
      tags: ['梯田', '日落', '星空'],
      gallery: ['park-cover-3.svg'],
      notice: '山路较窄，20:00 后禁止车辆上山；用火须在指定柴火灶内，离场前确认熄灭。',
      phone: '0756-5598 771', updated: '2026-03-10 09:15'
    }
    ];
  }

  var PARKS = buildParks();

  function parkById(id) {
    for (var i = 0; i < PARKS.length; i++) if (PARKS[i].id === id) return PARKS[i];
    return PARKS[0];
  }

  function actById(id) {
    return ACTIVITIES.filter(function (a) { return a.id === id; })[0] || { title: '已下架活动', tiers: [] };
  }

  function actTier(actId, tierName) {
    var a = actById(actId);
    return (a.tiers || []).filter(function (t) { return tierName.indexOf(t.name) === 0; })[0] || null;
  }

  function actStats() {
    var tiers = 0, sold = 0;
    ACTIVITIES.forEach(function (a) {
      a.tiers.forEach(function (t) { tiers += 1; sold += t.sold; });
    });
    var actOrders = state.orders.filter(function (o) { return o.type === 'activity'; });
    var pending = actOrders.filter(function (o) { return o.status === 'unused'; })
      .reduce(function (n, o) { return n + o.qty; }, 0);
    var revenue = actOrders.filter(function (o) { return o.status === 'unused' || o.status === 'used'; })
      .reduce(function (n, o) { return n + o.amount; }, 0);
    var live = ACTIVITIES.filter(function (a) { return a.state === '进行中'; }).length;
    return { tiers: tiers, sold: sold, pending: pending, revenue: revenue, live: live };
  }

  function rectSeat(code, name, cap, price, state, x, y, w, h) {
    return { code: code, name: name, type: 'rect', cap: cap, price: price, state: state,
      x: x, y: y, w: w, h: h };
  }

  function buildSeats() {
    var map = {};

    map.p1 = [
      rectSeat('A01', '湿地营位', 4, 168, 'ok', 70, 110, 150, 96),
      rectSeat('A02', '湿地营位', 4, 168, 'ok', 240, 110, 150, 96),
      rectSeat('A03', '水岸营位', 6, 198, 'ok', 410, 110, 150, 96),
      rectSeat('A04', '水岸营位', 6, 198, 'maint', 580, 110, 150, 96),
      rectSeat('A05', '林间营位', 4, 158, 'ok', 750, 110, 150, 96),
      rectSeat('A06', '林间营位', 4, 158, 'locked', 920, 110, 150, 96),
      rectSeat('B01', '观鸟营位', 2, 128, 'ok', 70, 300, 130, 88),
      rectSeat('B02', '观鸟营位', 2, 128, 'ok', 220, 300, 130, 88),
      rectSeat('B03', '观鸟营位', 2, 128, 'ok', 370, 300, 130, 88),
      rectSeat('C01', '草地营位', 8, 228, 'ok', 690, 310, 176, 104),
      rectSeat('C02', '草地营位', 8, 228, 'ok', 890, 310, 176, 104),
      { code: 'C03', name: '家庭营位', type: 'poly', cap: 6, price: 188, state: 'ok',
        points: '540,520 640,486 726,534 690,626 566,612' }
    ];

    /* 黄杨河湿地公园：1.1 公里带状营地，5 个营区 × 8 个营位 = 40 个营位。
       坐标与小程序底图 park-map-2.svg（1120 × 240）完全一致。 */
    var p2 = [];
    var zones = [
      { code: 'A', x: 20, price: 138, name: '草坪营位' },
      { code: 'B', x: 238, price: 158, name: '观鸟营位' },
      { code: 'C', x: 456, price: 168, name: '栈道营位' },
      { code: 'D', x: 674, price: 148, name: '林荫营位' },
      { code: 'E', x: 892, price: 158, name: '浅滩营位' }
    ];
    zones.forEach(function (z) {
      for (var r = 0; r < 2; r++) {
        for (var c = 0; c < 4; c++) {
          var n = r * 4 + c + 1;
          var code = z.code + (n < 10 ? '0' + n : n);
          var state = 'ok';
          if (r === 0 && n === 3) state = 'maint';
          if (r === 1 && n === 5 && z.code === 'C') state = 'locked';
          p2.push(rectSeat(code, z.name, r === 0 ? 4 : 6, z.price, state,
            z.x + 6 + c * 48, r === 0 ? 52 : 110, 44, 30));
        }
      }
    });
    map.p2 = p2;

    var p3 = [];
    for (var i = 0; i < 9; i++) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      p3.push(rectSeat('T' + (i + 1 < 10 ? '0' + (i + 1) : i + 1), '梯田营位', i % 3 === 0 ? 8 : 4,
        198 + row * 30, i === 4 ? 'maint' : 'ok', 120 + col * 330, 130 + row * 210, 240, 140));
    }
    map.p3 = p3;

    return map;
  }

  var SEATS = buildSeats();

  /* 营位价格是系统唯一的价格来源：基础价 + 周末 / 节假日加价 */
  var WEEKEND_DELTA = 20;
  var HOLIDAY_DELTA = 40;

  Object.keys(SEATS).forEach(function (pid) {
    SEATS[pid].forEach(function (s) {
      if (typeof s.weekend !== 'number') s.weekend = WEEKEND_DELTA;
      if (typeof s.holiday !== 'number') s.holiday = HOLIDAY_DELTA;
    });
  });

  function seatPriceOn(seat, dayType) {
    var delta = dayType === 'holiday' ? seat.holiday : (dayType === 'weekend' ? seat.weekend : 0);
    return seat.price + (delta || 0);
  }

  function seatName(parkId, code) {
    var list = SEATS[parkId] || [];
    for (var i = 0; i < list.length; i++) if (list[i].code === code) return list[i].name;
    return '营位';
  }

  var SLOT_LABEL = { day: '整日场', am: '上午场', pm: '下午场' };

  var ORDER_STATUS = {
    unpaid: { label: '待支付', cls: 'badge--wheat' },
    unused: { label: '待使用', cls: 'badge--cyan' },
    used: { label: '已核销', cls: 'badge--leaf' },
    cancelled: { label: '已取消', cls: 'badge--neutral' },
    refunded: { label: '已退款', cls: 'badge--rust' },
    expired: { label: '已过期', cls: 'badge--neutral' }
  };

  function buildOrders() {
    return [
      { no: 'PB20260318001', guest: '张颖', phone: '138****6621', parkId: 'p1', seat: 'A03', date: '2026-03-18', slot: 'day', amount: 198, status: 'unused', created: '03-16 09:42' },
      { no: 'PB20260318002', guest: '黄一鸣', phone: '139****3310', parkId: 'p2', seat: 'W02', date: '2026-03-18', slot: 'am', amount: 148, status: 'unused', created: '03-16 09:18' },
      { no: 'PB20260317001', guest: '林清', phone: '137****8842', parkId: 'p1', seat: 'C01', date: '2026-03-17', slot: 'day', amount: 228, status: 'used', created: '03-15 20:02' },
      { no: 'PB20260317002', guest: '苏文轩', phone: '135****2093', parkId: 'p3', seat: 'T01', date: '2026-03-17', slot: 'day', amount: 198, status: 'unused', created: '03-15 18:36' },
      { no: 'PB20260316001', guest: '郑楠', phone: '136****7712', parkId: 'p1', seat: 'B02', date: '2026-03-16', slot: 'day', amount: 128, status: 'used', created: '03-14 11:20' },
      { no: 'PB20260316002', guest: '何雨', phone: '133****5520', parkId: 'p2', seat: 'W07', date: '2026-03-16', slot: 'pm', amount: 168, status: 'unused', created: '03-14 09:05' },
      { no: 'PB20260316003', guest: '吴桐', phone: '188****1104', parkId: 'p1', seat: 'A05', date: '2026-03-16', slot: 'day', amount: 158, status: 'unpaid', created: '03-16 08:12' },
      { no: 'PB20260315001', guest: '罗嘉', phone: '150****6628', parkId: 'p2', seat: 'W01', date: '2026-03-15', slot: 'am', amount: 128, status: 'used', created: '03-13 15:48' },
      { no: 'PB20260315002', guest: '梁思', phone: '132****9931', parkId: 'p1', seat: 'A01', date: '2026-03-15', slot: 'day', amount: 168, status: 'used', created: '03-13 10:12' },
      { no: 'PB20260314001', guest: '许安', phone: '186****2245', parkId: 'p3', seat: 'T05', date: '2026-03-14', slot: 'day', amount: 288, status: 'refunded', created: '03-12 19:30' },
      { no: 'PB20260314002', guest: '邓佳', phone: '131****7736', parkId: 'p1', seat: 'B03', date: '2026-03-14', slot: 'day', amount: 128, status: 'cancelled', created: '03-12 08:22' },
      { no: 'PB20260313001', guest: '范晓', phone: '159****4417', parkId: 'p2', seat: 'W09', date: '2026-03-13', slot: 'pm', amount: 168, status: 'refunded', created: '03-11 14:06' },
      { no: 'PB20260313002', guest: '王朗', phone: '137****3388', parkId: 'p1', seat: 'C02', date: '2026-03-13', slot: 'day', amount: 228, status: 'expired', created: '03-11 09:40' },
      { no: 'PB20260316004', guest: '严凯', phone: '138****9122', parkId: 'p3', seat: 'T02', date: '2026-03-19', slot: 'day', amount: 198, status: 'unpaid', created: '03-16 10:02' }
    ].map(function (o) { o.type = 'camp'; return o; });
  }

  /* 活动预约订单（与露营订单同模型，用 type 区分）*/
  function buildActOrders() {
    return [
      { no: 'AC20260318001', guest: '张颖', phone: '138****6621', actId: 'a1', parkId: 'p1', tierText: '成人票 ×1', qty: 1, date: '2026-03-23', time: '09:00–11:30', amount: 68, status: 'unused', created: '03-16 09:42', verified: '' },
      { no: 'AC20260318002', guest: '黄一鸣', phone: '139****3310', actId: 'a2', parkId: 'p2', tierText: '单人票 ×2', qty: 2, date: '2026-03-24', time: '06:30–08:30', amount: 90, status: 'unused', created: '03-16 09:18', verified: '' },
      { no: 'AC20260317001', guest: '林清', phone: '137****8842', actId: 'a1', parkId: 'p1', tierText: '成人票 ×2', qty: 2, date: '2026-03-22', time: '09:00–11:30', amount: 136, status: 'used', created: '03-15 20:02', verified: '03-22 09:06' },
      { no: 'AC20260317002', guest: '苏文轩', phone: '135****2093', actId: 'a3', parkId: 'p1', tierText: '市集通票 ×1', qty: 1, date: '2026-03-21', time: '14:00–17:00', amount: 30, status: 'used', created: '03-15 18:36', verified: '03-21 14:12' },
      { no: 'AC20260316001', guest: '郑楠', phone: '136****7712', actId: 'a1', parkId: 'p1', tierText: '儿童票 ×2', qty: 2, date: '2026-03-21', time: '09:00–11:30', amount: 76, status: 'used', created: '03-14 11:20', verified: '03-21 09:03' },
      { no: 'AC20260316002', guest: '何雨', phone: '133****5520', actId: 'a4', parkId: 'p3', tierText: '双人票 ×1', qty: 1, date: '2026-03-25', time: '19:00–21:30', amount: 158, status: 'unpaid', created: '03-16 08:12', verified: '' },
      { no: 'AC20260315001', guest: '罗嘉', phone: '150****6628', actId: 'a2', parkId: 'p2', tierText: '单人票 ×1', qty: 1, date: '2026-03-23', time: '06:30–08:30', amount: 45, status: 'used', created: '03-13 15:48', verified: '03-23 07:34' },
      { no: 'AC20260314001', guest: '许安', phone: '186****2245', actId: 'a1', parkId: 'p1', tierText: '亲子套票 ×2', qty: 2, date: '2026-03-20', time: '09:00–11:30', amount: 196, status: 'refunded', created: '03-12 19:30', verified: '' },
      { no: 'AC20260313001', guest: '范晓', phone: '159****4417', actId: 'a3', parkId: 'p1', tierText: '亲子套票 ×2', qty: 2, date: '2026-03-22', time: '14:00–17:00', amount: 100, status: 'cancelled', created: '03-11 14:06', verified: '' }
    ].map(function (o) { o.type = 'activity'; return o; });
  }

  function buildRefunds() {
    return [
      { id: 'RF-20260316-001', orderNo: 'PB20260316002', guest: '何雨', parkId: 'p2', seat: 'W07', date: '2026-03-16', amount: 168, reason: '临时有事，提前 2 天取消', state: 'pending', created: '03-16 08:40' },
      { id: 'RF-20260314-002', orderNo: 'PB20260314001', guest: '许安', parkId: 'p3', seat: 'T05', date: '2026-03-14', amount: 288, reason: '天气原因（暴雨预警）', state: 'done', created: '03-13 21:10' },
      { id: 'RF-20260313-003', orderNo: 'PB20260313001', guest: '范晓', parkId: 'p2', seat: 'W09', date: '2026-03-13', amount: 168, reason: '行程变更', state: 'done', created: '03-12 10:25' },
      { id: 'RF-20260312-004', orderNo: 'PB20260312001', guest: '崔乐', parkId: 'p1', seat: 'A02', date: '2026-03-12', amount: 168, reason: '已在现场使用后申请', state: 'rejected', created: '03-12 22:02' }
    ];
  }

  function buildVerifyLogs() {
    return [
      { at: '2026-03-16 09:41', no: 'PB20260316001', parkId: 'p1', seat: 'B02', staff: '吴涛', ok: true, note: '核销成功，已放行' },
      { at: '2026-03-16 09:38', no: 'PB20260316002', parkId: 'p1', seat: 'B02', staff: '吴涛', ok: false, note: '跨园区：订单属于黄杨河湿地公园' },
      { at: '2026-03-16 09:12', no: 'PB20260315002', parkId: 'p1', seat: 'A01', staff: '吴涛', ok: false, note: '重复核销：该码已于 03-15 10:20 核销' },
      { at: '2026-03-15 10:20', no: 'PB20260315002', parkId: 'p1', seat: 'A01', staff: '吴涛', ok: true, note: '核销成功，已放行' },
      { at: '2026-03-15 09:05', no: 'PB20260315001', parkId: 'p2', seat: 'W01', staff: '罗嘉明', ok: true, note: '核销成功，已放行' },
      { at: '2026-03-14 09:30', no: 'PB20260314002', parkId: 'p1', seat: 'B03', staff: '吴涛', ok: false, note: '订单已取消，不可核销' },
      { at: '2026-03-13 08:58', no: 'PB20260313002', parkId: 'p1', seat: 'C02', staff: '吴涛', ok: false, note: '订单已过期（使用日期 03-13 已结束）' }
    ];
  }

  function buildStaff() {
    return [
      { name: '吴涛', phone: '139****0031', parkId: 'p1', role: '核销员', state: '正常' },
      { name: '罗嘉明', phone: '137****8820', parkId: 'p2', role: '核销员', state: '正常' },
      { name: '何丽', phone: '135****4416', parkId: 'p3', role: '核销员', state: '已停用' },
      { name: '李伟', phone: '138****7710', parkId: 'p1', role: '园区管理员', state: '正常' },
      { name: '周敏', phone: '136****2205', parkId: '—', role: '审核员', state: '正常' }
    ];
  }

  function buildLogs() {
    return [
      { at: '2026-03-16 09:52', who: '陈静', role: '超级管理员', act: '地图审批', what: '通过 <b>斗门水乡公园</b> 地图 V2', ip: '10.12.8.31' },
      { at: '2026-03-16 09:41', who: '吴涛', role: '核销员', act: '订单', what: '核销订单 <b>PB20260316001</b>', ip: '172.20.4.66' },
      { at: '2026-03-16 09:20', who: '李伟', role: '园区管理员', act: '地图审批', what: '提交 <b>斗门水乡公园</b> 地图 V3 待审批', ip: '10.12.8.44' },
      { at: '2026-03-16 08:44', who: '李伟', role: '园区管理员', act: '价格调整', what: '设置 <b>斗门水乡公园</b> 3 月周末价 ¥168', ip: '10.12.8.44' },
      { at: '2026-03-15 18:02', who: '陈静', role: '超级管理员', act: '退款', what: '退款 <b>PB20260314001</b> ¥288.00', ip: '10.12.8.31' },
      { at: '2026-03-15 15:30', who: '陈静', role: '超级管理员', act: '账号', what: '新增核销员 <b>何丽</b>（霞山梯田营地）', ip: '10.12.8.31' },
      { at: '2026-03-15 11:12', who: '周敏', role: '审核员', act: '地图审批', what: '驳回 <b>霞山梯田营地</b> 地图 V2：营位重叠', ip: '10.12.8.77' },
      { at: '2026-03-14 20:15', who: '李伟', role: '园区管理员', act: '价格调整', what: '锁定 <b>斗门水乡公园</b> 3 月 18 日排期', ip: '10.12.8.44' },
      { at: '2026-03-14 09:03', who: '罗嘉明', role: '核销员', act: '订单', what: '核销订单 <b>PB20260313001</b>', ip: '172.20.4.72' },
      { at: '2026-03-13 16:48', who: '陈静', role: '超级管理员', act: '账号', what: '停用核销员 <b>何丽</b>', ip: '10.12.8.31' }
    ];
  }

  function buildActivities() {
    return [
      {
        id: 'a0', title: '我有一亩田', parkId: 'p1', cat: '平台主打', flagship: true,
        range: '2026-03-20 – 04-26', time: '09:00–16:00', state: '进行中', limit: 8,
        cover: 'activity-cover.svg', views: 18620,
        desc: '平台主打主题活动：认领属于自己的一亩田，从插秧、管水到收割全程参与，一年四季都有得玩。',
        intro: '「我有一亩田」是本平台的自有主题活动。参与者按季认领一块真实稻田，由本地农人带着完成插秧、' +
          '管水、除草与收割四个环节；每次到场都能带走当季收成（新米、蔬菜或稻草手作）。' +
          '单次体验票适合首次尝试，亲子套票含一大一小与农事工具包，季卡可全程参与并署名认领牌。' +
          '活动在斗门水乡公园的示范稻田举行，风雨照常（改为棚内农事课堂）。',
        tags: ['平台主打', '亲子', '农事', '含工具', '含午餐'],
        gallery: ['activity-cover.svg', 'park-cover-1.svg', 'park-cover-3.svg'],
        sessionStock: 80,
        dates: [
          { date: '2026-03-21', time: '09:00–16:00', state: '开放' },
          { date: '2026-03-22', time: '09:00–16:00', state: '开放' },
          { date: '2026-03-28', time: '09:00–16:00', state: '开放' },
          { date: '2026-03-29', time: '09:00–16:00', state: '开放' },
          { date: '2026-04-04', time: '09:00–16:00', state: '开放' },
          { date: '2026-04-05', time: '09:00–16:00', state: '停售' }
        ],
        tiers: [
          { name: '单人体验票', price: 88, stock: 40, sold: 26, state: '在售' },
          { name: '亲子套票（1 大 1 小）', price: 158, stock: 30, sold: 21, state: '在售' },
          { name: '一亩田季卡', price: 1980, stock: 10, sold: 4, state: '在售' }
        ]
      },
      {
        id: 'a1', title: '春耕插秧体验', parkId: 'p1', cat: '亲子',        range: '2026-03-20 – 03-29', time: '09:00–11:30', state: '进行中', limit: 6,
        cover: 'activity-cover.svg', views: 2841,
        desc: '跟着农人下田插秧，含秧苗、工具与农事讲解，适合 4 岁以上亲子家庭。',
        intro: '在水乡公园的稻田里，跟着当地农人学习插秧：分发秧苗、下水插秧、认识田埂与水渠，' +
          '并观察水田里的小生物。活动结束可品尝一碗新米糖水，每个名额含秧苗、手套、雨靴租借与保险。' +
          '请穿着便于下水的衣物，园区提供冲洗区。',
        tags: ['亲子', '农事', '含工具'],
        gallery: ['activity-cover.svg', 'park-cover-1.svg'],
        sessionStock: 40,
        dates: [
          { date: '2026-03-20', time: '09:00–11:30', state: '开放' },
          { date: '2026-03-21', time: '09:00–11:30', state: '开放' },
          { date: '2026-03-22', time: '09:00–11:30', state: '停售' },
          { date: '2026-03-28', time: '09:00–11:30', state: '开放' },
          { date: '2026-03-29', time: '09:00–11:30', state: '开放' }
        ],
        tiers: [
          { name: '成人票', price: 68, stock: 30, sold: 18, state: '在售' },
          { name: '儿童票', price: 38, stock: 20, sold: 14, state: '在售' },
          { name: '亲子套票', price: 98, stock: 15, sold: 9, state: '在售' }
        ]
      },
      {
        id: 'a2', title: '湿地观鸟晨课', parkId: 'p2', cat: '自然',
        range: '2026-03-20 – 03-29', time: '06:30–08:30', state: '进行中', limit: 4,
        cover: 'park-cover-2.svg', views: 1726,
        desc: '清晨跟着鸟导在芦苇荡观鸟，提供望远镜与鸟类图鉴。',
        intro: '由本地鸟导带队，沿黄杨河湿地栈道观察白鹭、黑翅长脚鹬等水鸟，讲解候鸟迁徙与湿地保护。' +
          '名额含双筒望远镜、图鉴借用与热豆浆一份。建议穿深色衣物、保持安静，不建议 6 岁以下儿童参加。',
        tags: ['自然', '含器材'],
        gallery: ['park-cover-2.svg'],
        sessionStock: 24,
        dates: [
          { date: '2026-03-20', time: '06:30–08:30', state: '开放' },
          { date: '2026-03-21', time: '06:30–08:30', state: '开放' },
          { date: '2026-03-22', time: '06:30–08:30', state: '停售' },
          { date: '2026-03-28', time: '06:30–08:30', state: '开放' }
        ],
        tiers: [
          { name: '单人票', price: 45, stock: 24, sold: 9, state: '在售' },
          { name: '双人票', price: 80, stock: 12, sold: 5, state: '在售' }
        ]
      },
      {
        id: 'a3', title: '稻田手作市集', parkId: 'p1', cat: '手作',
        range: '2026-03-21 – 03-22', time: '14:00–17:00', state: '进行中', limit: 6,
        cover: 'activity-cover.svg', views: 966,
        desc: '稻田边的周末市集，扎染、草编与米食手作一次玩够。',
        intro: '市集设在稻田边的林荫步道，20 个摊位分成扎染、草编、米食三个区域，凭通票可任选两项体验。' +
          '现场设休息区与儿童游乐角，雨天照常（棚内举行）。',
        tags: ['手作', '周末', '雨天照常'],
        gallery: ['activity-cover.svg', 'park-cover-3.svg'],
        sessionStock: 60,
        dates: [
          { date: '2026-03-21', time: '14:00–17:00', state: '开放' },
          { date: '2026-03-22', time: '14:00–17:00', state: '开放' }
        ],
        tiers: [
          { name: '市集通票', price: 30, stock: 60, sold: 20, state: '在售' },
          { name: '亲子套票', price: 50, stock: 30, sold: 11, state: '在售' }
        ]
      },
      {
        id: 'a4', title: '星空露营夜谈', parkId: 'p3', cat: '夜游',
        range: '2026-03-24 – 03-26', time: '19:00–21:30', state: '未开始', limit: 4,
        cover: 'park-cover-3.svg', views: 5120,
        desc: '梯田营地的夜间观察与故事会，含热饮与星图。',
        intro: '从梯田观景平台出发，先用指星笔认识当季星座，再围坐分享本地村落故事，提供热饮与星图卡。' +
          '名额含营地夜间入场与保险；夜间山路无路灯，建议携带手电并穿防滑鞋。',
        tags: ['夜游', '含热饮'],
        gallery: ['park-cover-3.svg'],
        sessionStock: 16,
        dates: [
          { date: '2026-03-24', time: '19:00–21:30', state: '开放' },
          { date: '2026-03-25', time: '19:00–21:30', state: '停售' },
          { date: '2026-03-26', time: '19:00–21:30', state: '开放' }
        ],
        tiers: [
          { name: '单人票', price: 88, stock: 16, sold: 13, state: '在售' },
          { name: '双人票', price: 158, stock: 8, sold: 6, state: '停售' }
        ]
      }
    ];
  }

  /* ---------- 活动内容 / 排期的派生展示 ---------- */
  function actSortedDates(a) {
    return (a.dates || []).slice().sort(function (x, y) { return x.date < y.date ? -1 : x.date > y.date ? 1 : 0; });
  }

  function fmtDateRange(list) {
    if (!list.length) return '未排期';
    var f = list[0], l = list[list.length - 1];
    if (f === l) return f;
    return f + ' – ' + (f.slice(0, 4) === l.slice(0, 4) ? l.slice(5) : l);
  }

  function actRange(a) {
    return fmtDateRange(actSortedDates(a).map(function (d) { return d.date; }));
  }

  function actTime(a) {
    var seen = {}, out = [];
    actSortedDates(a).forEach(function (d) {
      if (d.time && !seen[d.time]) { seen[d.time] = 1; out.push(d.time); }
    });
    return out.length ? out.join('、') : '待定';
  }

  function actOpenDates(a) {
    return actSortedDates(a).filter(function (d) { return d.state === '开放'; });
  }

  function actTierRange(a) {
    var on = (a.tiers || []).filter(function (t) { return t.state === '在售'; });
    if (!on.length) return '暂无在售票种';
    var prices = on.map(function (t) { return t.price; });
    var min = Math.min.apply(null, prices), max = Math.max.apply(null, prices);
    return min === max ? '¥' + min : '¥' + min + ' 起';
  }


  var ACTIVITIES = buildActivities();

  function buildVersions() {
    return {
    p1: [
      { v: 'V3', state: 'pending', by: '李伟', at: '2026-03-16 09:20', summary: '新增 C03 家庭营位，调整 A06 为锁定区',
        map: 'park-map-1.svg',
        diff: [
          { type: '新增', cls: 'diff--add', text: 'C03 家庭营位（多边形）' },
          { type: '新增', cls: 'diff--add', text: 'B04 观鸟营位（矩形）' },
          { type: '修改', cls: 'diff--mod', text: 'A06 由可预约改为锁定（施工中）' },
          { type: '删除', cls: 'diff--del', text: '旧版 A07（与步道重叠）' }
        ] },
      { v: 'V2', state: 'active', by: '李伟', at: '2026-02-20 14:05', summary: '重绘步道，补齐卫生间与出入口标注',
        map: 'park-map-1.svg', diff: [] },
      { v: 'V1', state: 'archived', by: '陈静', at: '2026-01-05 10:30', summary: '初版地图，12 个营位',
        map: 'park-map-1.svg', diff: [] }
    ],
    p2: [
      { v: 'V3', state: 'pending', by: '罗嘉明', at: '2026-03-15 17:40',
        summary: '底图改为 1.1 公里带状图，重划 A–E 五个营区共 40 个营位',
        map: 'park-map-2.svg',
        diff: [
          { type: '新增', cls: 'diff--add', text: '入口草坪区 A01–A08、芦苇观鸟区 B01–B08' },
          { type: '新增', cls: 'diff--add', text: '亲水栈道区 C01–C08、林荫安静区 D01–D08、浅滩骑行区 E01–E08' },
          { type: '修改', cls: 'diff--mod', text: '底图由 1200 × 800 改为 1120 × 240 带状，支持缩放平移编辑' },
          { type: '修改', cls: 'diff--mod', text: '东 / 西出入口与两处卫生间随带状路径重新定位' }
        ] },
      { v: 'V2', state: 'active', by: '李伟', at: '2026-02-20 14:05', summary: '补齐观鸟栈道与两处卫生间标注',
        map: 'park-map-2.svg', diff: [] },
      { v: 'V1', state: 'archived', by: '陈静', at: '2026-02-02 09:12', summary: '初版地图，16 个营位',
        map: 'park-map-2.svg', diff: [] }
    ],
    p3: [
      { v: 'V1', state: 'active', by: '陈静', at: '2026-02-14 11:00', summary: '初版地图，9 个梯田营位',
        map: 'park-map-3.svg', diff: [] }
    ]
    };
  }

  var VERSIONS = buildVersions();

  var VER_STATE = {
    pending: { label: '待审批', cls: 'badge--wheat' },
    active: { label: '已生效', cls: 'badge--leaf' },
    archived: { label: '已归档', cls: 'badge--neutral' },
    rejected: { label: '已驳回', cls: 'badge--rust' }
  };

  /* 运行期状态 */
  var state = {
    view: 'dash',
    role: 'super',
    trend: 'count',
    orders: buildOrders().concat(buildActOrders()),
    refunds: buildRefunds(),
    verifyLogs: buildVerifyLogs(),
    staff: buildStaff(),
    logs: buildLogs(),
    seatPark: 'p2',
    orderStatus: 'all',
    refundStatus: 'pending',
    actPane: 'tickets',
    actPark: 'all',
    aeTab: 'content',
    verPark: 'p2',
    verIndex: 0,
    selectedSeat: null,
    editorPark: 'p2',
    priceSeat: null,
    tool: 'select',
    schMonth: 2,      // 0-based，演示固定 2026 年
    schYear: 2026,
    schDay: 16,
    stock: {},
    pendingRefund: null,
    pendingVersion: null
  };

  /* ------------------------------------------------------------------
     工具
     ------------------------------------------------------------------ */

  function money(n) {
    return '¥' + Number(n).toLocaleString('zh-CN');
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function icon(id, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  function emptyRow(cols, title, desc) {
    return '<tr><td colspan="' + cols + '">' +
      '<div class="state" style="padding:var(--sp-8) 0">' +
        '<span class="state__icon">' + icon('i-search', 'icon--lg') + '</span>' +
        '<div class="state__title">' + title + '</div>' +
        '<p class="state__desc">' + desc + '</p>' +
      '</div></td></tr>';
  }

  function badge(text, cls) {
    return '<span class="badge ' + cls + '">' + text + '</span>';
  }

  function orderBadge(status) {
    var s = ORDER_STATUS[status] || ORDER_STATUS.unused;
    return badge(s.label, s.cls);
  }

  /* ------------------------------------------------------------------
     视图切换
     ------------------------------------------------------------------ */

  function go(view) {
    if (!VIEW_META[view]) return;
    state.view = view;
    $$('.ad-view').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-view') === view);
    });
    $$('.ad-nav__item').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-view') === view);
    });
    $('#crumb-cur').textContent = VIEW_META[view];
    document.title = VIEW_META[view] + ' · 我有一亩田后台原型';
    window.scrollTo({ top: 0, behavior: window.UI.reduceMotion ? 'auto' : 'smooth' });

    if (view === 'dash') renderDashboard();
    if (view === 'parks') renderParks();
    if (view === 'versions') renderVersions();
    if (view === 'editor') renderEditor();
    if (view === 'seats') renderSeats();
    if (view === 'orders') renderOrders();
    if (view === 'verify') renderVerifyLogs();
    if (view === 'refunds') renderRefunds();
    if (view === 'schedule') renderSchedule();
    if (view === 'report') renderReport();
    if (view === 'acts') renderActs();
    if (view === 'staff') renderStaff();
    if (view === 'logs') renderLogs();

    playEnter(view);
  }

  /* 视图入场编排：重播 CSS 动画并让 KPI 数字滚动 */
  function playEnter(view) {
    var el = $('.ad-view[data-view="' + view + '"]');
    if (!el) return;
    el.classList.remove('is-entering');
    void el.offsetWidth;
    el.classList.add('is-entering');
    window.UI.countUp(el);
  }

  /* ------------------------------------------------------------------
     角色切换（用于演示权限差异）
     ------------------------------------------------------------------ */

  function applyRole(role) {
    state.role = role;
    var user = ROLE_USERS[role];
    var roleName = ROLE_NAMES[role];

    $('#side-role').textContent = roleName;
    $('#top-role').textContent = roleName;
    $('#top-name').textContent = user.name;
    $$('.ad-avatar .avatar').forEach(function (el) { el.textContent = user.initial; });
    $$('.ad-user .avatar').forEach(function (el) { el.textContent = user.initial; });

    var currentAllowed = false;
    $$('.ad-nav__item').forEach(function (el) {
      var roles = (el.getAttribute('data-roles') || '').split(',');
      var allowed = roles.indexOf(role) > -1;
      el.hidden = !allowed;
      el.style.display = allowed ? '' : 'none';
      if (allowed && el.getAttribute('data-view') === state.view) currentAllowed = true;
    });

    if (!currentAllowed) go('dash');

    if (role === 'staff') {
      toast('核销员仅可访问工作台与露营核销', 'info');
    } else if (role === 'audit') {
      toast('审核员可审批地图版本，但不能编辑地图', 'info');
    } else {
      toast('已切换为' + roleName, 'ok');
    }
    updateBadges();
  }

  function updateBadges() {
    var pendingVer = 0;
    Object.keys(VERSIONS).forEach(function (k) {
      VERSIONS[k].forEach(function (v) { if (v.state === 'pending') pendingVer++; });
    });
    var pendingRefund = state.refunds.filter(function (r) { return r.state === 'pending'; }).length;

    var bv = $('#nav-badge-ver');
    bv.textContent = pendingVer;
    bv.style.display = pendingVer ? '' : 'none';

    var br = $('#nav-badge-refund');
    br.textContent = pendingRefund;
    br.style.display = pendingRefund ? '' : 'none';
  }

  /* ------------------------------------------------------------------
     图表（纯 SVG，轻量）
     ------------------------------------------------------------------ */

  function chartFrame(w, h, max, labels, gridCount) {
    var padL = 34, padR = 8, padT = 10, padB = 24;
    var innerW = w - padL - padR;
    var innerH = h - padT - padB;
    var out = '';
    for (var i = 0; i <= gridCount; i++) {
      var y = padT + (innerH / gridCount) * i;
      out += '<line class="grid-line" x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + y.toFixed(1) + '"/>';
      var val = Math.round(max - (max / gridCount) * i);
      out += '<text x="' + (padL - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end">' + val + '</text>';
    }
    labels.forEach(function (label, idx) {
      var x = padL + (innerW / labels.length) * (idx + 0.5);
      out += '<text x="' + x.toFixed(1) + '" y="' + (h - 6) + '" text-anchor="middle">' + label + '</text>';
    });
    return { padL: padL, padR: padR, padT: padT, padB: padB, innerW: innerW, innerH: innerH, svg: out };
  }

  function trendChart(mode) {
    var labels = ['3-10', '3-11', '3-12', '3-13', '3-14', '3-15', '3-16'];
    var cur = mode === 'amount' ? [9800, 12400, 11200, 15800, 21400, 18900, 18640] : [72, 86, 79, 104, 148, 132, 128];
    var prev = mode === 'amount' ? [9100, 10200, 11800, 13400, 17600, 16100, 15800] : [66, 74, 81, 92, 121, 109, 108];
    var w = 640, h = 220;
    var max = Math.max.apply(null, cur.concat(prev));
    var maxRounded = mode === 'amount' ? Math.ceil(max / 5000) * 5000 : Math.ceil(max / 40) * 40;
    var f = chartFrame(w, h, maxRounded, labels, 4);
    var groupW = f.innerW / labels.length;
    var barW = Math.min(18, groupW / 3.4);
    var bars = '';

    for (var i = 0; i < labels.length; i++) {
      var cx = f.padL + groupW * (i + 0.5);
      var hCur = (cur[i] / maxRounded) * f.innerH;
      var hPrev = (prev[i] / maxRounded) * f.innerH;
      bars += '<rect class="bar" x="' + (cx - barW - 2).toFixed(1) + '" y="' + (f.padT + f.innerH - hCur).toFixed(1) +
        '" width="' + barW.toFixed(1) + '" height="' + hCur.toFixed(1) + '" rx="3"><title>' + labels[i] + ' 本期 ' +
        (mode === 'amount' ? money(cur[i]) : cur[i] + ' 单') + '</title></rect>';
      bars += '<rect class="bar bar--alt" x="' + (cx + 2).toFixed(1) + '" y="' + (f.padT + f.innerH - hPrev).toFixed(1) +
        '" width="' + barW.toFixed(1) + '" height="' + hPrev.toFixed(1) + '" rx="3"><title>' + labels[i] + ' 上周 ' +
        (mode === 'amount' ? money(prev[i]) : prev[i] + ' 单') + '</title></rect>';
    }

    return '<svg class="chart__svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="近 7 日订单趋势">' +
      f.svg + bars + '</svg>';
  }

  function revenueChart() {
    var w = 640, h = 220;
    var points = [8200, 9400, 11200, 9800, 12600, 14800, 13200, 10800, 9600, 11800, 13400, 15600, 18200, 14200,
      12400, 13800, 15200, 16800, 21400, 18900, 16400, 14800, 13600, 15400, 17200, 19800, 22400, 20600, 17800, 16200, 14200];
    var max = 24000;
    var f = chartFrame(w, h, max, ['1', '5', '10', '15', '20', '25', '31'], 4);
    var stepX = f.innerW / (points.length - 1);
    var line = '';
    var area = 'M' + f.padL + ' ' + (f.padT + f.innerH);

    points.forEach(function (v, i) {
      var x = f.padL + stepX * i;
      var y = f.padT + f.innerH - (v / max) * f.innerH;
      line += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      area += 'L' + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    });
    area += 'L' + (f.padL + f.innerW) + ' ' + (f.padT + f.innerH) + 'Z';

    return '<svg class="chart__svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="3 月日营收趋势">' +
      '<defs><linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="var(--leaf-400)" stop-opacity="0.34"/>' +
        '<stop offset="100%" stop-color="var(--leaf-400)" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      f.svg +
      '<path class="area" d="' + area + '"/>' +
      '<path class="line" pathLength="2200" d="' + line + '"/>' +
      '<circle class="dot" cx="' + (f.padL + stepX * 18).toFixed(1) + '" cy="' +
        (f.padT + f.innerH - (points[18] / max) * f.innerH).toFixed(1) + '" r="4"/>' +
      '</svg>';
  }

  function parkChart() {
    var cats = ['斗门水乡', '黄杨河湿地', '霞山梯田'];
    var cur = [524, 612, 290];
    var prev = [478, 536, 312];
    var w = 640, h = 220;
    var max = 700;
    var f = chartFrame(w, h, max, cats, 4);
    var groupW = f.innerW / cats.length;
    var barW = 34;
    var out = '';

    for (var i = 0; i < cats.length; i++) {
      var cx = f.padL + groupW * (i + 0.5);
      var h1 = (cur[i] / max) * f.innerH;
      var h2 = (prev[i] / max) * f.innerH;
      out += '<rect class="bar" x="' + (cx - barW - 4).toFixed(1) + '" y="' + (f.padT + f.innerH - h1).toFixed(1) +
        '" width="' + barW + '" height="' + h1.toFixed(1) + '" rx="4"><title>' + cats[i] + ' 本周 ' + cur[i] + ' 单</title></rect>';
      out += '<rect class="bar bar--alt" x="' + (cx + 4).toFixed(1) + '" y="' + (f.padT + f.innerH - h2).toFixed(1) +
        '" width="' + barW + '" height="' + h2.toFixed(1) + '" rx="4"><title>' + cats[i] + ' 上周 ' + prev[i] + ' 单</title></rect>';
      out += '<text x="' + (cx - barW - 4 + barW / 2).toFixed(1) + '" y="' + (f.padT + f.innerH - h1 - 6).toFixed(1) +
        '" text-anchor="middle" style="fill:var(--text-strong)">' + cur[i] + '</text>';
    }

    return '<svg class="chart__svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="园区订单对比">' + f.svg + out + '</svg>';
  }

  function slotChart() {
    var data = [
      { label: '整日场', value: 62, color: 'var(--leaf-500)' },
      { label: '上午场', value: 18, color: 'var(--wheat-500)' },
      { label: '下午场', value: 20, color: 'var(--cyan-500)' }
    ];
    var size = 220, cx = 110, cy = 110, r = 74, sw = 26;
    var circ = 2 * Math.PI * r;
    var offset = 0;
    var arcs = '';

    data.forEach(function (d) {
      var len = (d.value / 100) * circ;
      arcs += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + d.color +
        '" stroke-width="' + sw + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (circ - len).toFixed(2) +
        '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')">' +
        '<title>' + d.label + ' ' + d.value + '%</title></circle>';
      offset += len;
    });

    var legend = data.map(function (d) {
      return '<div class="kv__row" style="display:flex;justify-content:space-between;padding:4px 0;font-size:var(--fs-caption)">' +
        '<span class="chart__key"><i class="chart__swatch" style="background:' + d.color + '"></i>' + d.label + '</span>' +
        '<b style="font-family:var(--font-num)">' + d.value + '%</b></div>';
    }).join('');

    return '<div class="u-row" style="gap:var(--sp-5);align-items:center;flex-wrap:wrap">' +
      '<svg class="chart__svg" viewBox="0 0 ' + size + ' ' + size + '" style="width:180px;flex:none" role="img" aria-label="时段分布">' +
        arcs +
        '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" style="font-size:11px;fill:var(--text-muted)">总计</text>' +
        '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" style="font-family:var(--font-num);font-size:20px;fill:var(--text-strong)">1,426</text>' +
      '</svg>' +
      '<div style="flex:1;min-width:160px">' + legend + '</div>' +
      '</div>';
  }

  function rankList(target, items) {
    var max = items[0].value;
    target.innerHTML = items.map(function (item, i) {
      return '<div class="rank">' +
        '<span class="rank__no' + (i < 3 ? ' rank__no--top' : '') + '">' + (i + 1) + '</span>' +
        '<div><div class="rank__name">' + item.name + '</div>' +
          '<div class="rank__bar"><div class="rank__fill" style="width:' + Math.round((item.value / max) * 100) + '%"></div></div></div>' +
        '<span class="rank__val">' + item.value + '</span>' +
      '</div>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     01 工作台
     ------------------------------------------------------------------ */

  function renderDashboard() {
    $('#chart-trend').innerHTML = trendChart(state.trend);

    var recent = state.orders.slice(0, 6);
    $('#dash-orders').innerHTML = recent.map(function (o) {
      var p = parkById(o.parkId);
      return '<tr>' +
        '<td class="u-mono" style="font-size:var(--fs-micro)">' + o.no + '</td>' +
        '<td>' + o.guest + '<div class="cell-main__meta">' + o.phone + '</div></td>' +
        '<td>' + p.name + ' · ' + o.seat + '</td>' +
        '<td class="u-mono">' + o.date.slice(5) + ' ' + SLOT_LABEL[o.slot] + '</td>' +
        '<td class="is-num">' + money(o.amount) + '</td>' +
        '<td>' + orderBadge(o.status) + '</td>' +
      '</tr>';
    }).join('');

    rankList($('#rank-list'), [
      { name: '黄杨河湿地公园', value: 612 },
      { name: '斗门水乡公园', value: 524 },
      { name: '霞山梯田营地', value: 290 }
    ]);
  }

  /* ------------------------------------------------------------------
     02 公园管理
     ------------------------------------------------------------------ */

  /* 图文内容完整度：一句话简介 / 详细介绍 / 配图相册 / 亮点标签 */
  function parkContent(p) {
    var checks = [
      !!(p.desc && p.desc.trim()),
      !!(p.intro && p.intro.trim()),
      (p.gallery || []).length >= 2,
      (p.tags || []).length > 0
    ];
    var done = checks.filter(Boolean).length;
    return { done: done, total: checks.length, ok: done === checks.length };
  }

  function renderParks() {
    var kw = ($('#park-search').value || '').trim().toLowerCase();
    var status = $('#park-status').value;
    var list = PARKS.filter(function (p) {
      var hitKw = !kw || p.name.toLowerCase().indexOf(kw) > -1 || p.code.toLowerCase().indexOf(kw) > -1;
      var hitStatus = status === 'all' || p.status === status;
      return hitKw && hitStatus;
    });

    $('#park-count').textContent = list.length;

    if (!list.length) {
      $('#park-rows').innerHTML = emptyRow(7, '没有匹配的公园', '试试调整关键词或状态筛选。');
      return;
    }

    $('#park-rows').innerHTML = list.map(function (p) {
      var online = p.status === 'online';
      var c = parkContent(p);
      return '<tr>' +
        '<td><div class="cell-main">' +
          '<img class="thumb" src="../assets/img/' + p.cover + '" alt=""/>' +
          '<div><div class="cell-main__name">' + p.name + '</div>' +
          '<div class="cell-main__meta">' + p.code + ' · ' + p.addr + '</div></div></div></td>' +
        '<td class="u-mono">' + p.hours + '</td>' +
        '<td class="is-num">' + p.seatCount + '</td>' +
        '<td>' + badge(p.mode, p.mode === '整日场' ? 'badge--leaf' : 'badge--cyan') + '</td>' +
        '<td><div class="cont-cell">' +
          badge(c.ok ? '图文完整' : '待完善', c.ok ? 'badge--leaf' : 'badge--wheat') +
          '<div class="cont-cell__meta">配图 ' + (p.gallery || []).length + ' 张 · 标签 ' + (p.tags || []).length +
            ' 个 · ' + c.done + '/' + c.total + '</div>' +
        '</div></td>' +
        '<td>' + (online ? badge('营业中', 'badge--leaf') : badge('已下架', 'badge--neutral')) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="link-btn" type="button" data-park-edit="' + p.id + '">编辑图文</button>' +
          '<button class="link-btn" type="button" data-park-map="' + p.id + '">地图</button>' +
          '<button class="link-btn ' + (online ? 'link-btn--muted' : '') + '" type="button" data-park-toggle="' + p.id + '">' +
            (online ? '下架' : '上架') + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     03 地图版本与审批
     ------------------------------------------------------------------ */

  function renderVersions() {
    var parkId = $('#ver-park').value;
    state.verPark = parkId;
    var list = VERSIONS[parkId] || [];
    if (state.verIndex >= list.length) state.verIndex = 0;

    $('#ver-list').innerHTML = list.map(function (v, i) {
      var s = VER_STATE[v.state];
      return '<button class="ver-item' + (i === state.verIndex ? ' is-active' : '') + '" type="button" data-ver="' + i + '">' +
        '<span style="font-family:var(--font-num);font-weight:600;color:var(--text-strong)">' + v.v + '</span>' +
        '<div class="ver-item__body">' +
          '<div class="ver-item__title">' + PARK_LABEL(parkId) + badge(s.label, s.cls) + '</div>' +
          '<div class="ver-item__meta">' + v.by + ' · ' + v.at + '</div>' +
        '</div>' +
        icon('i-chevron-right', 'icon--sm') +
      '</button>';
    }).join('');

    renderVersionDetail();
    updateBadges();
  }

  function PARK_LABEL(id) {
    return parkById(id).name;
  }

  function renderVersionDetail() {
    var list = VERSIONS[state.verPark] || [];
    var v = list[state.verIndex];
    if (!v) {
      $('#ver-detail').innerHTML = '<div class="state"><div class="state__title">该公园暂无地图版本</div></div>';
      return;
    }
    var s = VER_STATE[v.state];
    $('#ver-detail-sub').textContent = v.v + ' · ' + s.label;

    var diffHtml = v.diff.length
      ? '<div class="diff-list">' + v.diff.map(function (d) {
          return '<div class="diff ' + d.cls + '"><span class="diff__type">' + d.type + '</span><span>' + d.text + '</span></div>';
        }).join('') + '</div>'
      : '<p class="u-xs u-muted u-mt-3">该版本无可展示的差异项。</p>';

    var actions = '';
    if (v.state === 'pending') {
      actions = '<div class="u-row u-mt-5" style="gap:var(--sp-2)">' +
        '<button class="btn btn--primary btn--sm" type="button" id="ver-approve">' + icon('i-check', 'icon--sm') + '通过并发布</button>' +
        '<button class="btn btn--secondary btn--sm" type="button" id="ver-reject">驳回</button>' +
        '</div>' +
        '<p class="u-micro u-faint u-mt-3">审批通过后立即对小程序前台生效，旧版本自动归档。</p>';
    } else if (v.state === 'active') {
      actions = '<div class="u-row u-mt-5"><span class="badge badge--leaf">当前生效版本</span></div>';
    }

    $('#ver-detail').innerHTML =
      '<div class="ver-preview">' +
        '<img src="../assets/img/' + v.map + '" alt="' + PARK_LABEL(state.verPark) + ' 地图 ' + v.v + ' 预览"/>' +
        '<span class="ver-preview__tag">' + v.v + ' · ' + v.at.slice(0, 10) + '</span>' +
      '</div>' +
      '<div class="kv kv--list u-mt-4">' +
        '<div class="kv__row"><span class="kv__k">提交人</span><span class="kv__v">' + v.by + '</span></div>' +
        '<div class="kv__row"><span class="kv__k">提交时间</span><span class="kv__v">' + v.at + '</span></div>' +
        '<div class="kv__row"><span class="kv__k">变更摘要</span><span class="kv__v" style="max-width:60%">' + v.summary + '</span></div>' +
        '<div class="kv__row"><span class="kv__k">状态</span><span class="kv__v">' + badge(s.label, s.cls) + '</span></div>' +
      '</div>' +
      '<div class="detail-section u-mt-5"><div class="detail-section__title">变更明细</div>' + diffHtml + '</div>' +
      actions;

    if (v.state === 'pending') {
      $('#ver-approve').addEventListener('click', function () { approveVersion(); });
      $('#ver-reject').addEventListener('click', function () {
        state.pendingVersion = { list: list, index: state.verIndex };
        $('#mr-reason').value = '';
        $('#mr-error').classList.add('u-hide');
        openLayer('modal-reject');
      });
    }
  }

  function approveVersion() {
    var list = VERSIONS[state.verPark] || [];
    var v = list[state.verIndex];
    if (!v || v.state !== 'pending') return;
    v.state = 'active';
    list.forEach(function (other) {
      if (other !== v && other.state === 'active') other.state = 'archived';
    });
    state.logs.unshift({
      at: '2026-03-16 10:05', who: ROLE_USERS[state.role].name, role: ROLE_NAMES[state.role],
      act: '地图审批', what: '通过 <b>' + PARK_LABEL(state.verPark) + '</b> 地图 ' + v.v, ip: '10.12.8.31'
    });
    renderVersions();
    toast('地图 ' + v.v + ' 已通过并发布');
  }

  /* ------------------------------------------------------------------
     04 地图编辑器
     ------------------------------------------------------------------ */

  /* 底图视图状态：缩放 / 平移 / 当前编辑的公园 */
  var ED = { zoom: 1, tx: 0, ty: 0, park: '', ready: false, dragged: false };

  function edDims() {
    var park = parkById(state.editorPark);
    return { w: park.mapW || 1200, h: park.mapH || 800 };
  }

  function edSeats() {
    if (!SEATS[state.editorPark]) SEATS[state.editorPark] = [];
    return SEATS[state.editorPark];
  }

  function edFitZoom() {
    var box = $('#editor-canvas');
    var d = edDims();
    var vw = box.clientWidth || d.w;
    var vh = box.clientHeight || d.h;
    return Math.min(vw / d.w, vh / d.h);
  }

  function edApply(animate) {
    var pane = $('#editor-pane');
    if (!pane) return;
    var d = edDims();
    pane.style.width = d.w + 'px';
    pane.style.height = d.h + 'px';
    pane.style.transform = 'translate(' + ED.tx + 'px,' + ED.ty + 'px) scale(' + ED.zoom + ')';
    pane.classList.toggle('is-animating', !!animate);
    clearTimeout(ED.timer);
    if (animate) {
      ED.timer = setTimeout(function () { pane.classList.remove('is-animating'); }, 400);
    }
    $('#ed-zoom-val').textContent = '×' + ED.zoom.toFixed(2);
  }

  function edClamp() {
    var box = $('#editor-canvas');
    var d = edDims();
    var cw = d.w * ED.zoom;
    var ch = d.h * ED.zoom;
    ED.tx = cw <= box.clientWidth ? Math.round((box.clientWidth - cw) / 2)
      : Math.min(0, Math.max(box.clientWidth - cw, ED.tx));
    ED.ty = ch <= box.clientHeight ? Math.round((box.clientHeight - ch) / 2)
      : Math.min(0, Math.max(box.clientHeight - ch, ED.ty));
  }

  function edSetZoom(next, cx, cy, animate) {
    var box = $('#editor-canvas');
    var fit = edFitZoom();
    next = Math.max(fit, Math.min(fit * 6, next));
    if (cx == null) cx = box.clientWidth / 2;
    if (cy == null) cy = box.clientHeight / 2;
    var k = next / ED.zoom;
    ED.tx = cx - (cx - ED.tx) * k;
    ED.ty = cy - (cy - ED.ty) * k;
    ED.zoom = next;
    edClamp();
    edApply(animate);
  }

  function edReset(animate) {
    ED.zoom = edFitZoom();
    ED.tx = 0;
    ED.ty = 0;
    edClamp();
    edApply(animate);
  }

  /* 屏幕坐标 → 底图坐标 */
  function edPoint(e) {
    var rect = $('#editor-canvas').getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - ED.tx) / ED.zoom,
      y: (e.clientY - rect.top - ED.ty) / ED.zoom
    };
  }

  /* points 兼容 "x,y x,y" 与 "x,y,x,y" 两种写法 */
  function polyCenter(points) {
    var nums = (Array.isArray(points) ? points.join(',') : String(points)).split(/[^0-9.\-]+/);
    var sx = 0, sy = 0, n = 0;
    for (var i = 0; i + 1 < nums.length; i += 2) {
      var px = Number(nums[i]), py = Number(nums[i + 1]);
      if (isNaN(px) || isNaN(py)) continue;
      sx += px; sy += py; n++;
    }
    return n ? { x: sx / n, y: sy / n } : { x: 0, y: 0 };
  }

  function renderEditor() {
    var park = parkById(state.editorPark);
    var shapes = $('#editor-shapes');
    var seats = edSeats();
    var d = edDims();
    var html = '';

    shapes.setAttribute('viewBox', '0 0 ' + d.w + ' ' + d.h);

    var img = $('#editor-img');
    var file = park.map || 'park-map-1.svg';
    if (img.getAttribute('src').indexOf(file) === -1) {
      img.setAttribute('src', '../assets/img/' + file);
      img.setAttribute('alt', park.name + '底图');
    }

    var fs = 14;
    for (var si = 0; si < seats.length; si++) {
      if (seats[si].type !== 'poly') {
        fs = Math.max(11, Math.min(22, Math.round(Math.min(seats[si].w, seats[si].h) * 0.24)));
        break;
      }
    }

    seats.forEach(function (s) {
      var cls = 'eshape' + (s.type === 'poly' ? ' eshape--poly' : '') +
        (state.selectedSeat === s.code ? ' is-selected' : '');
      var center;
      if (s.type === 'poly') {
        html += '<polygon class="' + cls + '" data-seat="' + s.code + '" points="' + s.points + '"/>';
        center = polyCenter(s.points);
      } else {
        html += '<rect class="' + cls + '" data-seat="' + s.code + '" x="' + s.x + '" y="' + s.y +
          '" width="' + s.w + '" height="' + s.h + '" rx="6"/>';
        center = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
      }
      html += '<text x="' + center.x + '" y="' + center.y + '" text-anchor="middle" dominant-baseline="middle"' +
        ' font-size="' + fs + '" style="pointer-events:none;font-family:var(--font-num);font-weight:600;' +
        'fill:var(--forest-900)">' + s.code + '</text>';
    });

    shapes.innerHTML = html;

    $('#ed-seat-count').textContent = seats.length;
    $('#ed-hint-text').textContent = '底图 ' + d.w + ' × ' + d.h + ' px，跨度 ' + (park.spanKm || '—') +
      ' 公里；拖动平移、滚轮或按钮缩放，营位坐标以底图像素存储。';

    if (ED.park !== state.editorPark) {
      ED.park = state.editorPark;
      edReset(false);
    } else {
      edApply(false);
    }

    renderProp();
  }

  function selectedSeatObj() {
    var seats = edSeats();
    for (var i = 0; i < seats.length; i++) if (seats[i].code === state.selectedSeat) return seats[i];
    return null;
  }

  function renderProp() {
    var seat = selectedSeatObj();
    var body = $('#prop-body');
    var badgeEl = $('#prop-badge');

    if (!seat) {
      badgeEl.textContent = '未选中';
      badgeEl.className = 'badge';
      body.innerHTML = '<div class="prop__empty">在画布中点选营位，或使用「矩形营位」工具新增。<br/>右侧属性会实时同步。</div>';
      return;
    }

    badgeEl.textContent = seat.code;
    badgeEl.className = 'badge badge--leaf';

    body.innerHTML = '<div class="prop__body">' +
      '<div class="field"><label class="field__label" for="pp-code">营位编号</label>' +
        '<input class="input" id="pp-code" type="text" value="' + seat.code + '"/></div>' +
      '<div class="field"><label class="field__label" for="pp-name">营位名称</label>' +
        '<input class="input" id="pp-name" type="text" value="' + seat.name + '"/></div>' +
      '<div class="field"><label class="field__label" for="pp-state">状态</label>' +
        '<select class="select" id="pp-state">' +
          '<option value="ok"' + (seat.state === 'ok' ? ' selected' : '') + '>可预约</option>' +
          '<option value="maint"' + (seat.state === 'maint' ? ' selected' : '') + '>维护中</option>' +
          '<option value="locked"' + (seat.state === 'locked' ? ' selected' : '') + '>已锁定</option>' +
        '</select></div>' +
      '<div class="prop__divider"></div>' +
      '<div class="prop__row"><span class="prop__label">图形类型</span><span class="prop__val">' +
        (seat.type === 'poly' ? '多边形' : '矩形') + '</span></div>' +
      '<div class="prop__row"><span class="prop__label">坐标</span><span class="prop__val">' +
        (seat.type === 'poly' ? '5 个顶点' : seat.x + ', ' + seat.y) + '</span></div>' +
      '<div class="prop__row"><span class="prop__label">容纳人数</span><span class="prop__val">' + seat.cap + ' 人</span></div>' +
      '<div class="form-hint" style="margin-top:var(--sp-1)">' +
        icon('i-warning', 'icon--sm') + '修改编号会影响已售订单的展示，请谨慎操作。</div>' +
    '</div>';

    $('#pp-code').addEventListener('change', function () {
      var val = this.value.trim().toUpperCase();
      if (!val) { this.value = seat.code; return; }
      if (val !== seat.code && edSeats().some(function (s) { return s.code === val; })) {
        toast('营位编号 ' + val + ' 已存在', 'error');
        this.value = seat.code;
        return;
      }
      var old = seat.code;
      seat.code = val;
      if (state.selectedSeat === old) state.selectedSeat = val;
      renderEditor();
      toast('营位编号已更新为 ' + val);
    });

    $('#pp-name').addEventListener('change', function () {
      seat.name = this.value.trim() || seat.name;
      toast('营位名称已保存');
    });

    $('#pp-state').addEventListener('change', function () {
      seat.state = this.value;
      toast('营位状态已更新');
    });
  }

  function editorClick(e) {
    if (ED.dragged) return;
    var seatEl = e.target.closest('[data-seat]');

    if (state.tool === 'select') {
      if (seatEl) {
        state.selectedSeat = seatEl.getAttribute('data-seat');
        renderEditor();
      } else {
        state.selectedSeat = null;
        renderEditor();
      }
      return;
    }

    if (state.tool === 'road' || state.tool === 'gate' || state.tool === 'wc') {
      toast('设施标注将在后端 GIS 接口中落地，原型仅演示交互位置', 'info');
      return;
    }

    var p = edPoint(e);
    var d = edDims();
    var seats = edSeats();
    var used = {};
    seats.forEach(function (s) { used[s.code] = true; });
    var nextNum = seats.length + 1;
    var code = 'D' + pad(nextNum);
    while (used[code]) { nextNum += 1; code = 'D' + pad(nextNum); }

    if (state.tool === 'rect') {
      var seat = rectSeat(code, '新增营位', 4, 158, 'ok',
        Math.max(4, Math.min(d.w - 60, Math.round(p.x - 22))),
        Math.max(4, Math.min(d.h - 34, Math.round(p.y - 15))), 44, 30);
      seats.push(seat);
      state.selectedSeat = code;
      state.tool = 'select';
      syncTools();
      renderEditor();
      toast('已在画布中新增营位 ' + code + '，请补充编号与名称');
    } else if (state.tool === 'poly') {
      var cx = Math.max(60, Math.min(d.w - 60, Math.round(p.x)));
      var cy = Math.max(50, Math.min(d.h - 50, Math.round(p.y)));
      var poly = {
        code: code, name: '新增营位', type: 'poly', cap: 6, price: 188, state: 'ok',
        points: [cx - 50, cy - 22, cx + 14, cy - 34, cx + 56, cy - 8, cx + 38, cy + 30, cx - 44, cy + 26].join(',')
      };
      seats.push(poly);
      state.selectedSeat = code;
      state.tool = 'select';
      syncTools();
      renderEditor();
      toast('已新增多边形营位 ' + code);
    }
  }

  /* 底图缩放 / 平移交互 */
  (function () {
    var box = $('#editor-canvas');
    if (!box) return;
    var drag = null;

    box.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, tx: ED.tx, ty: ED.ty, moved: false };
    });

    box.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      var dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 5) {
        drag.moved = true;
        box.classList.add('is-panning');
        try { box.setPointerCapture(drag.id); } catch (err) {}
      }
      if (!drag.moved) return;
      ED.tx = drag.tx + dx;
      ED.ty = drag.ty + dy;
      edClamp();
      edApply(false);
    });

    function endDrag(e) {
      if (!drag) return;
      var moved = drag.moved;
      try { box.releasePointerCapture(drag.id); } catch (err) {}
      drag = null;
      box.classList.remove('is-panning');
      if (moved) {
        ED.dragged = true;
        setTimeout(function () { ED.dragged = false; }, 80);
      }
    }
    box.addEventListener('pointerup', endDrag);
    box.addEventListener('pointercancel', endDrag);

    box.addEventListener('wheel', function (e) {
      if (e.deltaY > 0 && ED.zoom <= edFitZoom() + 0.001) return;
      e.preventDefault();
      var rect = box.getBoundingClientRect();
      edSetZoom(ED.zoom * (e.deltaY < 0 ? 1.2 : 1 / 1.2),
        e.clientX - rect.left, e.clientY - rect.top, false);
    }, { passive: false });

    function zoomBy(k) { edSetZoom(ED.zoom * k, null, null, true); }
    $('#ed-zoom-in').addEventListener('click', function () { zoomBy(1.35); });
    $('#ed-zoom-out').addEventListener('click', function () { zoomBy(1 / 1.35); });
    $('#ed-zoom-fit').addEventListener('click', function () {
      edReset(true);
      toast('已回到全览视图');
    });

    var parkSel = $('#ed-park');
    if (parkSel) {
      parkSel.value = state.editorPark;
      parkSel.addEventListener('change', function () {
        state.editorPark = this.value;
        state.selectedSeat = null;
        renderEditor();
        toast('已切换到「' + parkById(this.value).name + '」底图');
      });
    }

    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        if (!box.clientWidth) return;
        if (!ED.ready) {
          ED.ready = true;
          edReset(false);
        } else {
          edClamp();
          edApply(false);
        }
      }).observe(box);
    }
    window.addEventListener('resize', function () {
      if (!box.clientWidth) return;
      edClamp();
      edApply(false);
    });
  })();

  function syncTools() {
    $$('.tool[data-tool]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-tool') === state.tool);
    });
  }

  function deleteSelected() {
    var seat = selectedSeatObj();
    if (!seat) {
      toast('请先选中一个营位', 'warn');
      return;
    }
    var sold = state.orders.some(function (o) {
      return o.parkId === state.editorPark && o.seat === seat.code;
    });
    if (sold) {
      toast('营位 ' + seat.code + ' 存在历史订单，已改为「已锁定」而非删除', 'warn');
      seat.state = 'locked';
      renderEditor();
      return;
    }
    SEATS[state.editorPark] = SEATS[state.editorPark].filter(function (s) { return s.code !== seat.code; });
    state.selectedSeat = null;
    renderEditor();
    toast('已删除营位 ' + seat.code);
  }

  /* ------------------------------------------------------------------
     05 营位与价格
     ------------------------------------------------------------------ */

  function renderSeats() {
    var parkId = $('#seat-park').value;
    var kw = ($('#seat-search').value || '').trim().toLowerCase();
    var stateFilter = $('#seat-state').value;
    var list = (SEATS[parkId] || []).filter(function (s) {
      var hitKw = !kw || s.code.toLowerCase().indexOf(kw) > -1 || s.name.toLowerCase().indexOf(kw) > -1;
      var hitState = stateFilter === 'all' || s.state === stateFilter;
      return hitKw && hitState;
    });

    $('#seat-count').textContent = list.length;

    if (!list.length) {
      $('#seat-rows').innerHTML = emptyRow(8, '没有匹配的营位', '调整筛选条件，或到地图编辑器中新增营位。');
      return;
    }

    $('#seat-rows').innerHTML = list.map(function (s) {
      var map = {
        ok: badge('可预约', 'badge--leaf'),
        maint: badge('维护中', 'badge--wheat'),
        locked: badge('已锁定', 'badge--neutral')
      };
      return '<tr>' +
        '<td class="u-mono" style="font-weight:600;color:var(--text-strong)">' + s.code + '</td>' +
        '<td>' + s.name + '</td>' +
        '<td>' + (s.type === 'poly' ? '多边形' : '矩形') + '</td>' +
        '<td class="is-num">' + s.cap + '</td>' +
        '<td class="is-num">' + money(s.price) + '</td>' +
        '<td class="is-num u-muted">+' + s.weekend + ' / +' + s.holiday + '</td>' +
        '<td>' + map[s.state] + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="link-btn" type="button" data-seat-price="' + s.code + '">改价</button>' +
          '<button class="link-btn" type="button" data-seat-edit="' + s.code + '">地图定位</button>' +
          '<button class="link-btn link-btn--muted" type="button" data-seat-maint="' + s.code + '">' +
            (s.state === 'maint' ? '恢复预约' : '设为维护') + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     06 露营订单
     ------------------------------------------------------------------ */

  function orderCounts() {
    var list = state.orders.filter(function (o) { return o.type !== 'activity'; });
    var counts = { all: list.length };
    Object.keys(ORDER_STATUS).forEach(function (k) { counts[k] = 0; });
    list.forEach(function (o) { counts[o.status]++; });
    return counts;
  }

  function filteredOrders() {
    var kw = ($('#order-search').value || '').trim().toLowerCase();
    var parkId = $('#order-park').value;
    var date = $('#order-date').value;

    return state.orders.filter(function (o) {
      if (o.type === 'activity') return false;
      var hitStatus = state.orderStatus === 'all' || o.status === state.orderStatus;
      var hitPark = parkId === 'all' || o.parkId === parkId;
      var hitDate = !date || o.date === date;
      var hitKw = !kw || o.no.toLowerCase().indexOf(kw) > -1 || o.guest.indexOf(kw) > -1 || o.phone.indexOf(kw) > -1;
      return hitStatus && hitPark && hitDate && hitKw;
    });
  }

  function renderOrders() {
    if (state.orderDemo === 'loading') { renderOrderLoading(); return; }
    if (state.orderDemo === 'error') { renderOrderError(); return; }

    var counts = orderCounts();
    $$('#order-tabs [data-count]').forEach(function (el) {
      el.textContent = counts[el.getAttribute('data-count')] || 0;
    });
    $$('#order-tabs .tabstrip__item').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-status') === state.orderStatus);
    });

    var list = filteredOrders();
    var campTotal = state.orders.filter(function (o) { return o.type !== 'activity'; }).length;
    $('#order-count').textContent = list.length;
    $('#order-total').textContent = campTotal;

    if (!list.length) {
      $('#order-rows').innerHTML = emptyRow(7, '没有符合条件的订单', '清空筛选条件，或换一个状态标签查看。');
      return;
    }

    $('#order-rows').innerHTML = list.map(function (o) {
      var p = parkById(o.parkId);
      var colBiz = p.name + '<div class="cell-main__meta">' + o.seat + ' · ' + seatName(o.parkId, o.seat) + '</div>';
      var colWhen = '<span class="u-mono">' + o.date + '</span><div class="cell-main__meta">' + SLOT_LABEL[o.slot] + '</div>';
      return '<tr data-order-row="' + o.no + '" style="cursor:pointer">' +
        '<td class="u-mono" style="font-size:var(--fs-micro)">' + o.no + '</td>' +
        '<td>' + o.guest + '<div class="cell-main__meta">' + o.phone + '</div></td>' +
        '<td>' + colBiz + '</td>' +
        '<td>' + colWhen + '</td>' +
        '<td class="is-num">' + money(o.amount) + '</td>' +
        '<td>' + orderBadge(o.status) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="link-btn" type="button" data-order-open="' + o.no + '">详情</button>' +
          (o.status === 'unused' ? '<button class="link-btn link-btn--danger" type="button" data-order-refund="' +
            o.no + '">退款</button>' : '') +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  /* 后台列表的加载 / 失败态演示：客户确认“网络异常与筛选无结果要分开表达”这条规则 */
  function renderOrderLoading() {
    var rows = '';
    for (var i = 0; i < 6; i++) {
      rows += '<tr class="skel-row">' +
        '<td><span class="skel skel--w70"></span></td>' +
        '<td><span class="skel skel--w50"></span></td>' +
        '<td><span class="skel"></span></td>' +
        '<td><span class="skel skel--w60"></span></td>' +
        '<td><span class="skel skel--w40"></span></td>' +
        '<td><span class="skel skel--w40"></span></td>' +
        '<td><span class="skel skel--w30"></span></td>' +
      '</tr>';
    }
    $('#order-rows').innerHTML = rows;
    $('#order-count').textContent = '—';
  }

  function renderOrderError() {
    $('#order-rows').innerHTML = '<tr><td colspan="7">' +
      '<div class="list-error" role="alert">' +
        '<div class="list-error__title">订单列表加载失败</div>' +
        '<p class="list-error__desc">请检查网络后重试；若持续失败，请持「请求号」联系技术支持。</p>' +
        '<button class="btn btn--secondary btn--sm" type="button" data-order-retry>重新加载</button>' +
      '</div></td></tr>';
    $('#order-count').textContent = '—';
  }

  function simulateOrderLoad(mode) {
    state.orderDemo = 'loading';
    renderOrders();
    window.setTimeout(function () {
      state.orderDemo = mode === 'error' ? 'error' : 'ready';
      renderOrders();
      playEnter('orders');
    }, 650);
  }

  function openOrder(no) {
    var o = state.orders.filter(function (x) { return x.no === no; })[0];
    if (!o) return;
    var p = parkById(o.parkId);
    var isAct = o.type === 'activity';
    var act = isAct ? actById(o.actId) : null;

    $('#od-sub').textContent = o.no + ' · ' + ORDER_STATUS[o.status].label;

    var steps = [
      { title: '创建订单', meta: o.created + ' · 小程序下单', done: true },
      { title: o.status === 'unpaid' ? '等待支付' : '支付成功', meta: o.status === 'unpaid' ? '订单将在 15 分钟后关闭' : '微信支付 · ' + money(o.amount), done: o.status !== 'unpaid' },
      { title: '到场核销', meta: o.status === 'used' ? '已核销' : (isAct ? '参与日期 ' + o.date : '使用日期 ' + o.date), done: o.status === 'used' }
    ];
    if (o.status === 'cancelled') steps.push({ title: '订单已取消', meta: '用户主动取消，未产生退款', done: true });
    if (o.status === 'refunded') steps.push({ title: '已退款', meta: '整单退款 ' + money(o.amount), done: true });
    if (o.status === 'expired') steps.push({ title: '订单已过期', meta: '使用日期结束仍未核销', done: true });

    $('#od-body').innerHTML =
      '<div class="detail-head">' +
        '<div><div class="detail-head__no">' + o.no + '</div>' +
        '<div class="detail-head__time">下单时间 ' + o.created + '</div></div>' +
        orderBadge(o.status) +
      '</div>' +
      '<div class="detail-section u-mt-5"><div class="detail-section__title">' + (isAct ? '活动预约信息' : '预约信息') + '</div>' +
        '<div class="kv kv--list">' +
          (isAct
            ? '<div class="kv__row"><span class="kv__k">业务类型</span><span class="kv__v">' + badge('活动', 'badge--wheat') + '</span></div>' +
              '<div class="kv__row"><span class="kv__k">活动</span><span class="kv__v">' + act.title + '</span></div>' +
              '<div class="kv__row"><span class="kv__k">举办公园</span><span class="kv__v">' + p.name + '</span></div>' +
              '<div class="kv__row"><span class="kv__k">票种与数量</span><span class="kv__v">' + o.tierText + '</span></div>' +
              '<div class="kv__row"><span class="kv__k">参与日期</span><span class="kv__v">' + o.date + ' · ' + o.time + '</span></div>'
            : '<div class="kv__row"><span class="kv__k">公园</span><span class="kv__v">' + p.name + '</span></div>' +
              '<div class="kv__row"><span class="kv__k">营位</span><span class="kv__v">' + o.seat + ' · ' + seatName(o.parkId, o.seat) + '</span></div>' +
              '<div class="kv__row"><span class="kv__k">使用日期</span><span class="kv__v">' + o.date + '</span></div>' +
              '<div class="kv__row"><span class="kv__k">时段</span><span class="kv__v">' + SLOT_LABEL[o.slot] + '</span></div>') +
          '<div class="kv__row"><span class="kv__k">订单金额</span><span class="kv__v kv__v--strong">' + money(o.amount) + '</span></div>' +
        '</div></div>' +
      '<div class="detail-section"><div class="detail-section__title">游客信息</div>' +
        '<div class="kv kv--list">' +
          '<div class="kv__row"><span class="kv__k">姓名</span><span class="kv__v">' + o.guest + '</span></div>' +
          '<div class="kv__row"><span class="kv__k">手机号</span><span class="kv__v">' + o.phone + '</span></div>' +
          '<div class="kv__row"><span class="kv__k">核销码</span><span class="kv__v u-mono">' + o.no.slice(-6) + '</span></div>' +
        '</div></div>' +
      '<div class="detail-section"><div class="detail-section__title">状态流转</div>' +
        '<div class="timeline">' + steps.map(function (s) {
          return '<div class="timeline__item' + (s.done ? ' is-current' : '') + '">' +
            '<span class="timeline__dot">' + icon(s.done ? 'i-check' : 'i-clock') + '</span>' +
            '<div class="timeline__body"><div class="timeline__title">' + s.title + '</div>' +
            '<div class="timeline__meta">' + s.meta + '</div></div></div>';
        }).join('') + '</div></div>';

    $('#od-foot').innerHTML = '<button class="btn btn--ghost btn--sm" type="button" data-close-layer>关闭</button>' +
      '<button class="btn btn--secondary btn--sm" type="button" data-copy="' + o.no + '">复制订单号</button>' +
      (o.status === 'unused'
        ? '<button class="btn btn--danger btn--sm" type="button" data-order-refund="' + o.no + '">发起退款</button>'
        : '');
    openLayer('drawer-order');
  }

  /* ------------------------------------------------------------------
     07 露营核销
     ------------------------------------------------------------------ */

  function renderVerifyLogs() {
    var kw = ($('#verify-search').value || '').trim().toLowerCase();
    var parkId = $('#verify-park').value;
    var result = $('#verify-result').value;

    var list = state.verifyLogs.filter(function (r) {
      var hitKw = !kw || r.no.toLowerCase().indexOf(kw) > -1 || r.staff.indexOf(kw) > -1;
      var hitPark = parkId === 'all' || r.parkId === parkId;
      var hitResult = result === 'all' || (result === 'ok' ? r.ok : !r.ok);
      return hitKw && hitPark && hitResult;
    });

    $('#verify-count').textContent = list.length;

    if (!list.length) {
      $('#verify-rows').innerHTML = emptyRow(6, '没有核销记录', '换一个公园或结果筛选试试。');
      return;
    }

    $('#verify-rows').innerHTML = list.map(function (r) {
      return '<tr>' +
        '<td class="u-mono" style="font-size:var(--fs-micro)">' + r.at + '</td>' +
        '<td class="u-mono" style="font-size:var(--fs-micro)">' + r.no + '</td>' +
        '<td>' + parkById(r.parkId).name + '<div class="cell-main__meta">' + r.seat + '</div></td>' +
        '<td>' + r.staff + '</td>' +
        '<td>' + (r.ok ? badge('核销成功', 'badge--leaf') : badge('核销失败', 'badge--rust')) + '</td>' +
        '<td class="u-muted">' + r.note + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     08 退款管理
     ------------------------------------------------------------------ */

  function renderRefunds() {
    var counts = { pending: 0, done: 0, rejected: 0 };
    state.refunds.forEach(function (r) { counts[r.state]++; });
    $$('#refund-tabs [data-rcount]').forEach(function (el) {
      el.textContent = counts[el.getAttribute('data-rcount')] || 0;
    });
    $$('#refund-tabs .tabstrip__item').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-rstatus') === state.refundStatus);
    });

    var list = state.refunds.filter(function (r) { return r.state === state.refundStatus; });

    if (!list.length) {
      $('#refund-rows').innerHTML = emptyRow(8, '暂无该状态的退款申请', '切换上方标签查看其他状态。');
      updateBadges();
      return;
    }

    var stateMap = {
      pending: badge('待处理', 'badge--wheat'),
      done: badge('已退款', 'badge--leaf'),
      rejected: badge('已驳回', 'badge--neutral')
    };

    $('#refund-rows').innerHTML = list.map(function (r) {
      return '<tr>' +
        '<td class="u-mono" style="font-size:var(--fs-micro)">' + r.created + '</td>' +
        '<td class="u-mono" style="font-size:var(--fs-micro)">' + r.orderNo + '</td>' +
        '<td>' + r.guest + '</td>' +
        '<td>' + parkById(r.parkId).name + '<div class="cell-main__meta">' + r.seat + '</div></td>' +
        '<td class="u-mono">' + r.date + '</td>' +
        '<td class="is-num">' + money(r.amount) + '</td>' +
        '<td class="u-muted">' + r.reason + '</td>' +
        '<td>' + (r.state === 'pending'
          ? '<div class="row-actions"><button class="link-btn" type="button" data-refund-do="' + r.id + '">处理</button></div>'
          : stateMap[r.state]) + '</td>' +
      '</tr>';
    }).join('');

    updateBadges();
  }

  function openRefund(id) {
    var r = state.refunds.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    state.pendingRefund = r;
    $('#mrf-sub').textContent = r.orderNo + ' · 整单退款 ' + money(r.amount);
    $('#mrf-info').innerHTML =
      '<div class="kv__row"><span class="kv__k">申请时间</span><span class="kv__v">' + r.created + '</span></div>' +
      '<div class="kv__row"><span class="kv__k">游客</span><span class="kv__v">' + r.guest + '</span></div>' +
      '<div class="kv__row"><span class="kv__k">公园 · 营位</span><span class="kv__v">' + parkById(r.parkId).name + ' · ' + r.seat + '</span></div>' +
      '<div class="kv__row"><span class="kv__k">使用日期</span><span class="kv__v">' + r.date + '</span></div>' +
      '<div class="kv__row"><span class="kv__k">退款金额</span><span class="kv__v kv__v--strong">' + money(r.amount) + '</span></div>' +
      '<div class="kv__row"><span class="kv__k">申请原因</span><span class="kv__v" style="max-width:60%">' + r.reason + '</span></div>';
    $('#mrf-note').value = '';
    openLayer('modal-refund');
  }

  function confirmRefund() {
    var r = state.pendingRefund;
    if (!r) return;
    r.state = 'done';
    var order = state.orders.filter(function (o) { return o.no === r.orderNo; })[0];
    if (order) order.status = 'refunded';
    state.logs.unshift({
      at: '2026-03-16 10:12', who: ROLE_USERS[state.role].name, role: ROLE_NAMES[state.role],
      act: '退款', what: '退款 <b>' + r.orderNo + '</b> ' + money(r.amount), ip: '10.12.8.31'
    });
    state.pendingRefund = null;
    closeLayers();
    renderRefunds();
    if (state.view === 'orders') renderOrders();
    toast('退款已提交，预计 1–3 个工作日到账');
  }

  /* ------------------------------------------------------------------
     09 排期与库存
     ------------------------------------------------------------------ */

  function parkDayPriceRange(parkId, dayType) {
    var seats = (SEATS[parkId] || []).filter(function (s) { return s.state !== 'locked'; });
    if (!seats.length) seats = SEATS[parkId] || [];
    var min = Infinity;
    var max = -Infinity;
    seats.forEach(function (s) {
      var p = seatPriceOn(s, dayType);
      if (p < min) min = p;
      if (p > max) max = p;
    });
    return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max };
  }

  function renderSchedule() {
    var park = parkById($('#sch-park').value);
    var y = state.schYear;
    var m = state.schMonth;

    $('#sch-month').textContent = y + '年' + (m + 1) + '月';

    var rangeNormal = parkDayPriceRange(park.id, 'normal');
    var rangeWeekend = parkDayPriceRange(park.id, 'weekend');

    var first = new Date(y, m, 1);
    var startOffset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var prevMonthDays = new Date(y, m, 0).getDate();

    var cells = '';
    var i;
    for (i = startOffset - 1; i >= 0; i--) {
      cells += '<div class="cal__day is-muted"><span class="cal__num">' + (prevMonthDays - i) + '</span></div>';
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(y, m, d);
      var wd = (date.getDay() + 6) % 7;
      var weekend = wd >= 5;
      var range = weekend ? rangeWeekend : rangeNormal;
      var full = [6, 7, 13, 14, 20, 21].indexOf(d) > -1;
      var locked = d === 18;

      cells += '<button class="cal__day' + (d === state.schDay ? ' is-sel' : '') + '" type="button" data-day="' + d + '">' +
        '<span class="cal__num">' + d + '</span>' +
        '<span class="cal__price">' + money(range.min) + ' 起</span>' +
        (locked ? '<span class="cal__tag">已锁定</span>' : '') +
        (!locked && full ? '<span class="cal__tag cal__tag--full">已约满</span>' : '') +
      '</button>';
    }

    var total = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    for (i = startOffset + daysInMonth; i < total; i++) {
      cells += '<div class="cal__day is-muted"><span class="cal__num">' + (i - startOffset - daysInMonth + 1) + '</span></div>';
    }

    $('#sch-grid').innerHTML = cells;

    var wdNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    var label = new Date(y, m, state.schDay);
    var selWeekend = (label.getDay() + 6) % 7 >= 5;
    var selRange = selWeekend ? rangeWeekend : rangeNormal;
    $('#sch-day-label').textContent = (m + 1) + ' 月 ' + state.schDay + ' 日 · ' + wdNames[(label.getDay() + 6) % 7];
    $('#sch-price-range').textContent = money(selRange.min) + ' – ' + money(selRange.max);
    $('#sch-price-source').textContent = selWeekend ? '营位基础价 + 周末加价' : '营位基础价';
    $('#sch-stock').value = state.stock[state.schDay] == null ? (selWeekend ? 10 : 12) : state.stock[state.schDay];
  }

  /* ------------------------------------------------------------------
     10 经营数据
     ------------------------------------------------------------------ */

  function renderReport() {
    $('#chart-revenue').innerHTML = revenueChart();
    $('#chart-park').innerHTML = parkChart();
    $('#chart-slot').innerHTML = slotChart();

    rankList($('#top-seats'), [
      { name: 'C01 草地营位（斗门水乡）', value: 86 },
      { name: 'W07 浅滩营位（黄杨河）', value: 74 },
      { name: 'A03 水岸营位（斗门水乡）', value: 68 },
      { name: 'T01 梯田营位（霞山梯田）', value: 52 },
      { name: 'B02 观鸟营位（斗门水乡）', value: 47 }
    ]);
  }

  /* ------------------------------------------------------------------
     11 活动管理
     ------------------------------------------------------------------ */

  function actRows() {
    var kw = ($('#act-search').value || '').trim().toLowerCase();
    var parkId = state.actPark;
    var rows = [];
    ACTIVITIES.forEach(function (a) {
      a.tiers.forEach(function (t) {
        var park = parkById(a.parkId);
        var hay = (a.title + ' ' + t.name + ' ' + park.name + ' ' + (a.desc || '')).toLowerCase();
        if (parkId !== 'all' && a.parkId !== parkId) return;
        if (kw && hay.indexOf(kw) === -1) return;
        rows.push({ act: a, tier: t, park: park });
      });
    });
    return rows;
  }

  function actOrders(kw, parkId) {
    return state.orders.filter(function (o) {
      if (o.type !== 'activity') return false;
      if (parkId !== 'all' && o.parkId !== parkId) return false;
      if (!kw) return true;
      var hay = (o.no + ' ' + o.guest + ' ' + o.phone + ' ' + actById(o.actId).title + ' ' + o.tierText).toLowerCase();
      return hay.indexOf(kw) > -1;
    });
  }

  function renderActs() {
    var kw = ($('#act-search').value || '').trim().toLowerCase();
    var st = actStats();

    $('#act-stat-live').innerHTML = st.live + '<small>个</small>';
    $('#act-stat-total').textContent = ACTIVITIES.length;
    $('#act-stat-tickets').innerHTML = st.sold + '<small>张</small>';
    $('#act-stat-pending').innerHTML = st.pending + '<small>张</small>';
    $('#act-stat-revenue').textContent = money(st.revenue);

    var tickets = actRows();
    var orders = actOrders(kw, state.actPark);
    var verified = orders.filter(function (o) { return !!o.verified; });

    $$('#act-tabs [data-acount]').forEach(function (el) {
      var k = el.getAttribute('data-acount');
      el.textContent = k === 'tickets' ? tickets.length : (k === 'orders' ? orders.length : verified.length);
    });
    $$('#act-tabs .tabstrip__item').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-pane') === state.actPane);
    });
    $$('.act-pane').forEach(function (pane) {
      pane.classList.toggle('is-active', pane.id === 'act-pane-' + state.actPane);
    });

    $('#act-cards').innerHTML = actCardsHtml(kw, state.actPark);

    $('#act-ticket-rows').innerHTML = tickets.length ? tickets.map(function (r) {
      var left = Math.max(0, r.tier.stock - r.tier.sold);
      var tierState = r.tier.state === '在售'
        ? (left === 0 ? badge('已售罄', 'badge--rust') : badge('在售', 'badge--leaf'))
        : badge('停售', 'badge--neutral');
      return '<tr>' +
        '<td>' + r.act.title + '<div class="cell-main__meta">' + actRange(r.act) + '</div></td>' +
        '<td>' + r.park.name + '<div class="cell-main__meta">' + actTime(r.act) + ' · ' + r.act.state + '</div></td>' +
        '<td>' + r.tier.name + '</td>' +
        '<td class="is-num">' + money(r.tier.price) + '</td>' +
        '<td class="is-num">' + r.tier.stock + '</td>' +
        '<td class="is-num">' + r.tier.sold + '</td>' +
        '<td class="u-muted">' + r.act.limit + ' 张 / 单</td>' +
        '<td>' + tierState + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="link-btn" type="button" data-act-edit="' + r.act.id + '" data-act-tab="tiers">编辑</button>' +
          '<button class="link-btn" type="button" data-act-tier="' + r.act.id + '" data-tier="' + r.tier.name + '">' +
            (r.tier.state === '在售' ? '停售' : '恢复') + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join('') : emptyRow(9, '没有匹配的活动票种', '换个公园或关键词试试。');

    $('#act-order-rows').innerHTML = orders.length ? orders.map(function (o) {
      return '<tr data-act-order="' + o.no + '" style="cursor:pointer">' +
        '<td class="u-mono" style="font-size:var(--fs-micro)">' + o.no + '</td>' +
        '<td>' + o.guest + '<div class="cell-main__meta">' + o.phone + '</div></td>' +
        '<td>' + actById(o.actId).title + '<div class="cell-main__meta">' + o.tierText + '</div></td>' +
        '<td><span class="u-mono">' + o.date + '</span><div class="cell-main__meta">' + o.time + '</div></td>' +
        '<td class="is-num">' + o.qty + '</td>' +
        '<td class="is-num">' + money(o.amount) + '</td>' +
        '<td>' + orderBadge(o.status) + '</td>' +
        '<td><div class="row-actions"><button class="link-btn" type="button" data-order-open="' + o.no + '">详情</button></div></td>' +
      '</tr>';
    }).join('') : emptyRow(8, '没有活动订单', '调整筛选条件或到小程序下一单。');

    var verifiers = ['王强', '李静', '何丽'];
    $('#act-verify-rows').innerHTML = verified.length ? verified.map(function (o, idx) {
      return '<tr>' +
        '<td class="u-mono" style="font-size:var(--fs-micro)">' + o.verified + '</td>' +
        '<td class="u-mono" style="font-size:var(--fs-micro)">' + o.no + '</td>' +
        '<td>' + actById(o.actId).title + '<div class="cell-main__meta">' + parkById(o.parkId).name + '</div></td>' +
        '<td>' + o.tierText + '</td>' +
        '<td class="is-num">' + o.qty + '</td>' +
        '<td>' + verifiers[idx % verifiers.length] + '</td>' +
      '</tr>';
    }).join('') : emptyRow(6, '暂无活动核销记录', '待活动开始后，现场扫码即可出现在这里。');

    var shown = state.actPane === 'tickets' ? tickets.length : (state.actPane === 'orders' ? orders.length : verified.length);
    $('#act-count').textContent = shown;
    $('#act-total').textContent = shown;
  }

  function toggleTier(actId, tierName) {
    var a = ACTIVITIES.filter(function (x) { return x.id === actId; })[0];
    if (!a) return;
    var t = a.tiers.filter(function (x) { return x.name === tierName; })[0];
    if (!t) return;
    t.state = t.state === '在售' ? '停售' : '在售';
    renderActs();
    toast('「' + a.title + ' · ' + t.name + '」已' + (t.state === '在售' ? '恢复售卖' : '停售'));
  }

  /* ------------------------------------------------------------------
     11.1 活动内容卡片（封面 / 描述 / 介绍 / 配图）
     ------------------------------------------------------------------ */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function stamp() {
    var d = new Date();
    var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
  }

  function actContent(a) {
    var checks = [
      !!(a.desc && a.desc.trim()),
      !!(a.intro && a.intro.trim()),
      (a.gallery || []).length >= 2,
      (a.tags || []).length > 0,
      (a.tiers || []).length > 0,
      (a.dates || []).length > 0
    ];
    var done = checks.filter(Boolean).length;
    return { done: done, total: checks.length, ok: done === checks.length };
  }

  function findAct(id) {
    return ACTIVITIES.filter(function (a) { return a.id === id; })[0] || null;
  }

  function actCardsHtml(kw, parkId) {
    var list = ACTIVITIES.filter(function (a) {
      if (parkId !== 'all' && a.parkId !== parkId) return false;
      if (!kw) return true;
      var hay = (a.title + ' ' + (a.desc || '') + ' ' + (a.tags || []).join(' ')).toLowerCase();
      return hay.indexOf(kw) > -1;
    });

    list.sort(function (x, y) {
      if (!!y.flagship !== !!x.flagship) return y.flagship ? 1 : -1;
      return 0;
    });

    if (!list.length) {
      return '<div class="act-cards__empty">没有匹配的活动内容，试试调整关键词或公园筛选。</div>';
    }

    return list.map(function (a) {
      var c = actContent(a);
      var left = a.tiers.reduce(function (n, t) {
        return n + (t.state === '在售' ? Math.max(0, t.stock - t.sold) : 0);
      }, 0);
      var openDays = actOpenDates(a).length;
      return '<article class="act-card2" data-act-card="' + a.id + '">' +
        '<div class="act-card2__cover">' +
          '<img src="../assets/img/' + a.cover + '" alt="' + esc(a.title) + ' 封面"/>' +
          (a.flagship ? '<span class="act-card2__flag">重点展示</span>' : '') +
          '<span class="act-card2__cat">' + esc(a.cat) + '</span>' +
          '<span class="act-card2__state">' +
            badge(a.state, a.state === '进行中' ? 'badge--leaf' : (a.state === '未开始' ? 'badge--wheat' : 'badge--neutral')) +
          '</span>' +
        '</div>' +
        '<div class="act-card2__body">' +
          '<div class="act-card2__head">' +
            '<h3 class="act-card2__title">' + esc(a.title) + '</h3>' +
            badge(c.ok ? '内容完整' : '待完善', c.ok ? 'badge--leaf' : 'badge--wheat') +
          '</div>' +
          '<p class="act-card2__desc">' + (a.desc ? esc(a.desc) : '<span class="u-faint">尚未填写一句话描述</span>') + '</p>' +
          '<div class="act-card2__tags">' +
            (a.tags || []).map(function (t) { return '<span class="chip chip--xs">' + esc(t) + '</span>'; }).join('') +
          '</div>' +
          '<dl class="act-card2__meta">' +
            '<div><dt>公园</dt><dd>' + esc(parkById(a.parkId).name) + '</dd></div>' +
            '<div><dt>日期</dt><dd>' + actRange(a) + ' · ' + actTime(a) + '</dd></div>' +
            '<div><dt>票种</dt><dd>' + a.tiers.length + ' 个 · 余 ' + left + ' 张 · ' + actTierRange(a) + '</dd></div>' +
            '<div><dt>上架</dt><dd>' + openDays + ' 个开放日期 · 配图 ' + (a.gallery || []).length + ' 张</dd></div>' +
          '</dl>' +
          '<div class="act-card2__foot">' +
            '<span class="act-card2__score">内容完整度 ' + c.done + '/' + c.total + '</span>' +
            '<div class="row-actions">' +
              '<button class="link-btn" type="button" data-act-edit="' + a.id + '" data-act-tab="content">内容</button>' +
              '<button class="link-btn" type="button" data-act-edit="' + a.id + '" data-act-tab="tiers">票种</button>' +
              '<button class="link-btn" type="button" data-act-edit="' + a.id + '" data-act-tab="dates">日期</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     11.2 公园图文内容编辑
     ------------------------------------------------------------------ */

  var peEdit = null;

  function splitHours(h) {
    var parts = String(h || '').split(/[–—]/);
    return { open: (parts[0] || '08:00').trim(), close: (parts[1] || '20:00').trim() };
  }

  function imgPickItem(file, attr, on) {
    return '<button class="img-pick__item' + (on ? ' is-on' : '') + '" type="button" ' + attr + '="' + file + '"' +
      ' aria-pressed="' + (on ? 'true' : 'false') + '">' +
      '<img src="../assets/img/' + file + '" alt="示例配图"/>' +
      '<span class="img-pick__tick"><svg class="icon icon--sm"><use href="#i-check"/></svg></span>' +
    '</button>';
  }

  function uploadTile() {
    return '<button class="img-pick__item img-pick__item--add" type="button" ' +
      'data-toast="原型内置 3 张示例图，上线后支持本地上传（≤2MB，JPG/PNG）">' +
      '<svg class="icon icon--sm"><use href="#i-plus"/></svg><span>上传</span>' +
    '</button>';
  }

  function renderPePickers() {
    $('#pe-cover-pick').innerHTML = PARK_IMAGES.map(function (f) {
      return imgPickItem(f, 'data-pe-cover', peEdit.cover === f);
    }).join('') + uploadTile();

    $('#pe-gallery-pick').innerHTML = PARK_IMAGES.map(function (f) {
      return imgPickItem(f, 'data-pe-gallery', peEdit.gallery.indexOf(f) > -1);
    }).join('') + uploadTile();

    $('#pe-gallery-count').textContent = peEdit.gallery.length + '/6';
  }

  function renderPeTags() {
    $('#pe-tags').innerHTML = PARK_TAGS.map(function (t) {
      var on = peEdit.tags.indexOf(t) > -1;
      return '<button class="chip chip--pick' + (on ? ' is-on' : '') + '" type="button" data-pe-tag="' + t + '"' +
        ' aria-pressed="' + (on ? 'true' : 'false') + '">' + t + '</button>';
    }).join('');
  }

  function syncPePreview() {
    var name = ($('#pe-name').value || '').trim();
    var desc = ($('#pe-desc').value || '').trim();
    var addr = ($('#pe-addr').value || '').trim();
    var open = $('#pe-open').value || '08:00';
    var close = $('#pe-close').value || '20:00';

    $('#pe-prev-name').textContent = name || '未命名公园';
    $('#pe-prev-img').src = '../assets/img/' + peEdit.cover;
    $('#pe-prev-meta').textContent = (addr ? addr + ' · ' : '') + open + '–' + close;
    $('#pe-prev-desc').textContent = desc || '一句话简介会显示在公园列表与详情页顶部';
    $('#pe-prev-tags').innerHTML = peEdit.tags.map(function (t) {
      return '<span class="chip chip--xs">' + esc(t) + '</span>';
    }).join('');
    $('#pe-prev-gallery').innerHTML = peEdit.gallery.map(function (f) {
      return '<img src="../assets/img/' + f + '" alt="相册配图"/>';
    }).join('');
    $('#pe-desc-count').textContent = ($('#pe-desc').value || '').length;
    $('#pe-intro-count').textContent = ($('#pe-intro').value || '').length;
  }

  function openParkEditor(id) {
    var p = FIND_PARK(id);
    if (!p) return;
    peEdit = { id: p.id, cover: p.cover, gallery: (p.gallery || []).slice(), tags: (p.tags || []).slice() };

    $('#pe-title').textContent = '编辑公园图文 · ' + p.name;
    $('#pe-sub').textContent = p.code + ' · 最后更新 ' + (p.updated || '—');
    $('#pe-updated').textContent = '最后更新：' + (p.updated || '—');

    $('#pe-name').value = p.name;
    $('#pe-code').value = p.code;
    $('#pe-addr').value = p.addr;
    var h = splitHours(p.hours);
    $('#pe-open').value = h.open;
    $('#pe-close').value = h.close;
    $('#pe-phone').value = p.phone || '';
    $('#pe-status').value = p.status;
    $('#pe-mode').value = p.mode.indexOf('分时') > -1 ? '分时场' : '整日场';
    $('#pe-desc').value = p.desc || '';
    $('#pe-intro').value = p.intro || '';
    $('#pe-notice').value = p.notice || '';

    renderPePickers();
    renderPeTags();
    syncPePreview();
    openLayer('drawer-park-edit');
  }

  function FIND_PARK(id) {
    return PARKS.filter(function (p) { return p.id === id; })[0] || null;
  }

  function savePark() {
    var p = FIND_PARK(peEdit.id);
    if (!p) return;

    var name = ($('#pe-name').value || '').trim();
    var desc = ($('#pe-desc').value || '').trim();

    if (!name) {
      toast('请填写公园名称', 'error');
      $('#pe-name').focus();
      return;
    }
    if (!desc) {
      toast('请填写一句话简介，小程序列表需要展示', 'error');
      $('#pe-desc').focus();
      return;
    }
    if (!peEdit.gallery.length) {
      toast('请至少选择 1 张相册配图', 'error');
      return;
    }

    p.name = name;
    p.code = ($('#pe-code').value || '').trim() || p.code;
    p.addr = ($('#pe-addr').value || '').trim();
    p.hours = ($('#pe-open').value || '08:00') + ' – ' + ($('#pe-close').value || '20:00');
    p.phone = ($('#pe-phone').value || '').trim();
    p.status = $('#pe-status').value;
    p.mode = $('#pe-mode').value;
    p.cover = peEdit.cover;
    p.gallery = peEdit.gallery.slice();
    p.tags = peEdit.tags.slice();
    p.desc = desc;
    p.intro = ($('#pe-intro').value || '').trim();
    p.notice = ($('#pe-notice').value || '').trim();
    p.updated = stamp();

    state.logs.unshift({
      at: p.updated, who: '陈静', role: '超级管理员', act: '内容维护',
      what: '更新 <b>' + p.name + '</b> 图文内容（封面 / 简介 / 相册）', ip: '10.12.8.31'
    });

    closeLayers();
    renderParks();
    renderLogs();
    toast('「' + p.name + '」图文内容已保存并发布到小程序');
  }

  /* ------------------------------------------------------------------
     11.3 活动编辑器：内容 / 票种 / 日期
     ------------------------------------------------------------------ */

  var aeEdit = null;

  function blankAct() {
    return {
      id: '', title: '', parkId: 'p1', cat: '亲子', state: '未开始', limit: 4, sessionStock: 20,
      cover: ACT_IMAGES[0], gallery: [], tags: [], desc: '', intro: '', views: 0,
      dates: [{ date: '2026-03-28', time: '09:00–11:30', state: '开放' }],
      tiers: [{ name: '单人票', price: 68, stock: 20, sold: 0, state: '在售' }]
    };
  }

  function openActEditor(id, tab) {
    var src = id ? findAct(id) : null;
    var draft = src ? JSON.parse(JSON.stringify(src)) : blankAct();
    aeEdit = { mode: src ? 'edit' : 'create', id: src ? src.id : '', draft: draft };

    $('#ae-title').textContent = src ? '编辑活动 · ' + src.title : '新建活动';
    $('#ae-sub').textContent = src
      ? src.id.toUpperCase() + ' · ' + parkById(src.parkId).name + ' · 查看 ' + src.views + ' 次'
      : '填写内容后，至少配置 1 个票种与 1 个日期才能保存';

    $('#ae-name').value = draft.title;
    $('#ae-cat').value = draft.cat;
    $('#ae-park').value = draft.parkId;
    $('#ae-state').value = draft.state;
    $('#ae-limit').value = draft.limit;
    $('#ae-stock').value = draft.sessionStock;
    $('#ae-desc').value = draft.desc;
    $('#ae-intro').value = draft.intro;

    $('#ae-save').textContent = src ? '保存活动' : '创建活动';

    renderAePickers();
    renderAeTags();
    renderAeTiers();
    renderAeDates();
    switchAeTab(tab || 'content');
    syncAePreview();
    openLayer('drawer-act-edit');
  }

  function switchAeTab(tab) {
    state.aeTab = tab;
    $$('#ae-tabs .tabstrip__item').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-aetab') === tab);
    });
    $$('.ae-pane').forEach(function (pane) {
      pane.classList.toggle('is-active', pane.id === 'ae-pane-' + tab);
    });
  }

  function renderAePickers() {
    var d = aeEdit.draft;
    $('#ae-cover-pick').innerHTML = ACT_IMAGES.map(function (f) {
      return imgPickItem(f, 'data-ae-cover', d.cover === f);
    }).join('') + uploadTile();
    $('#ae-gallery-pick').innerHTML = ACT_IMAGES.map(function (f) {
      return imgPickItem(f, 'data-ae-gallery', d.gallery.indexOf(f) > -1);
    }).join('') + uploadTile();
    $('#ae-gallery-count').textContent = d.gallery.length + '/6';
  }

  function renderAeTags() {
    var d = aeEdit.draft;
    $('#ae-tags').innerHTML = ACT_TAGS.map(function (t) {
      var on = d.tags.indexOf(t) > -1;
      return '<button class="chip chip--pick' + (on ? ' is-on' : '') + '" type="button" data-ae-tag="' + t + '"' +
        ' aria-pressed="' + (on ? 'true' : 'false') + '">' + t + '</button>';
    }).join('');
  }

  function readAeTiers() {
    var rows = $$('#ae-tier-rows tr[data-ae-tier-row]');
    if (!rows.length) return;
    aeEdit.draft.tiers = rows.map(function (tr) {
      var num = function (sel, dflt) {
        var v = parseFloat(tr.querySelector(sel).value);
        return isNaN(v) ? dflt : Math.round(v);
      };
      return {
        name: tr.querySelector('[data-ae-tn]').value.trim(),
        price: num('[data-ae-tp]', 0),
        stock: num('[data-ae-ts]', 0),
        sold: Number(tr.getAttribute('data-sold')) || 0,
        state: tr.querySelector('[data-ae-tst]').value
      };
    });
  }

  function renderAeTiers() {
    var d = aeEdit.draft;
    $('#ae-tier-rows').innerHTML = d.tiers.length ? d.tiers.map(function (t, i) {
      return '<tr data-ae-tier-row="' + i + '" data-sold="' + t.sold + '">' +
        '<td><input class="input input--sm" type="text" data-ae-tn value="' + esc(t.name) + '"' +
          ' aria-label="票种 ' + (i + 1) + ' 名称"/></td>' +
        '<td class="is-num"><input class="input input--sm is-num" type="number" min="0" step="1" data-ae-tp' +
          ' value="' + t.price + '" aria-label="票种 ' + (i + 1) + ' 单价"/></td>' +
        '<td class="is-num"><input class="input input--sm is-num" type="number" min="1" step="1" data-ae-ts' +
          ' value="' + t.stock + '" aria-label="票种 ' + (i + 1) + ' 库存"/></td>' +
        '<td class="is-num u-muted">' + t.sold + '</td>' +
        '<td><select class="select select--sm" data-ae-tst aria-label="票种 ' + (i + 1) + ' 状态">' +
          '<option' + (t.state === '在售' ? ' selected' : '') + '>在售</option>' +
          '<option' + (t.state !== '在售' ? ' selected' : '') + '>停售</option>' +
        '</select></td>' +
        '<td><button class="link-btn link-btn--danger" type="button" data-ae-tier-del="' + i + '">删除</button></td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="6" class="u-muted">还没有票种，请先新增 1 个票种。</td></tr>';
  }

  function readAeDates() {
    var rows = $$('#ae-date-rows tr[data-ae-date-row]');
    if (!rows.length) return;
    aeEdit.draft.dates = rows.map(function (tr) {
      return {
        date: tr.querySelector('[data-ae-dd]').value,
        time: tr.querySelector('[data-ae-dt]').value.trim(),
        state: tr.querySelector('[data-ae-ds]').value
      };
    });
  }

  function renderAeDates() {
    var d = aeEdit.draft;
    $('#ae-date-rows').innerHTML = d.dates.length ? d.dates.map(function (x, i) {
      return '<tr data-ae-date-row="' + i + '">' +
        '<td><input class="input input--sm" type="date" data-ae-dd value="' + esc(x.date) + '"' +
          ' aria-label="第 ' + (i + 1) + ' 个日期"/></td>' +
        '<td><input class="input input--sm" type="text" data-ae-dt value="' + esc(x.time) + '"' +
          ' placeholder="09:00–11:30" aria-label="第 ' + (i + 1) + ' 个场次时间"/></td>' +
        '<td><select class="select select--sm" data-ae-ds aria-label="第 ' + (i + 1) + ' 个日期状态">' +
          '<option' + (x.state === '开放' ? ' selected' : '') + '>开放</option>' +
          '<option' + (x.state !== '开放' ? ' selected' : '') + '>停售</option>' +
        '</select></td>' +
        '<td><button class="link-btn link-btn--danger" type="button" data-ae-date-del="' + i + '">删除</button></td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="4" class="u-muted">还没有日期，请至少新增 1 个日期。</td></tr>';
  }

  function syncAePreview() {
    var d = aeEdit.draft;
    var name = ($('#ae-name').value || '').trim();
    var desc = ($('#ae-desc').value || '').trim();
    var open = d.dates.filter(function (x) { return x.state === '开放'; });
    var stock = d.tiers.reduce(function (n, t) { return n + (Number(t.stock) || 0); }, 0);
    var sold = d.tiers.reduce(function (n, t) { return n + (Number(t.sold) || 0); }, 0);

    $('#ae-prev-name').textContent = name || '未命名活动';
    $('#ae-prev-img').src = '../assets/img/' + d.cover;
    $('#ae-prev-meta').textContent = $('#ae-cat').value + ' · ' + parkById($('#ae-park').value).name + ' · ' + actTierRange({ tiers: d.tiers });
    $('#ae-prev-desc').textContent = desc || '一句话描述会显示在活动列表卡片上';
    $('#ae-prev-tags').innerHTML = d.tags.map(function (t) {
      return '<span class="chip chip--xs">' + esc(t) + '</span>';
    }).join('');
    $('#ae-prev-tickets').innerHTML = d.tiers.length ? d.tiers.map(function (t) {
      return '<span class="mp-prev__ticket' + (t.state === '在售' ? '' : ' is-off') + '">' +
        esc(t.name || '未命名') + ' ¥' + (Number(t.price) || 0) + '</span>';
    }).join('') : '<span class="u-faint">尚未配置票种</span>';
    $('#ae-prev-dates').textContent = open.length
      ? '可选 ' + open.length + ' 个日期 · ' + (open[0].time || '场次待定')
      : '暂无可选日期';

    $('#ae-desc-count').textContent = ($('#ae-desc').value || '').length;
    $('#ae-intro-count').textContent = ($('#ae-intro').value || '').length;
    $('#ae-tier-sum').textContent = d.tiers.length + ' 个票种 · 库存 ' + stock + ' 张 · 已售 ' + sold + ' 张';
    $('#ae-date-sum').textContent = d.dates.length + ' 个日期 · 开放 ' + open.length + ' 个';
    $('#ae-foot-note').textContent = aeEdit.mode === 'create'
      ? '新建活动 · ' + d.tiers.length + ' 个票种 · ' + d.dates.length + ' 个日期'
      : d.id.toUpperCase() + ' · ' + d.tiers.length + ' 个票种 · ' + d.dates.length + ' 个日期';
  }

  function saveAct() {
    readAeTiers();
    readAeDates();

    var d = aeEdit.draft;
    d.title = ($('#ae-name').value || '').trim();
    d.desc = ($('#ae-desc').value || '').trim();
    d.intro = ($('#ae-intro').value || '').trim();
    d.cat = $('#ae-cat').value;
    d.parkId = $('#ae-park').value;
    d.state = $('#ae-state').value;
    d.limit = Math.max(1, parseInt($('#ae-limit').value, 10) || 1);
    d.sessionStock = Math.max(1, parseInt($('#ae-stock').value, 10) || 1);

    if (!d.title) {
      switchAeTab('content');
      toast('请填写活动名称', 'error');
      $('#ae-name').focus();
      return;
    }
    if (!d.desc) {
      switchAeTab('content');
      toast('请填写一句话描述', 'error');
      $('#ae-desc').focus();
      return;
    }
    if (!d.tiers.length) {
      switchAeTab('tiers');
      toast('请至少新增 1 个票种', 'error');
      return;
    }

    var names = {};
    for (var i = 0; i < d.tiers.length; i++) {
      var t = d.tiers[i];
      if (!t.name) {
        switchAeTab('tiers');
        toast('第 ' + (i + 1) + ' 个票种缺少名称', 'error');
        return;
      }
      if (names[t.name]) {
        switchAeTab('tiers');
        toast('票种名称「' + t.name + '」重复', 'error');
        return;
      }
      names[t.name] = 1;
      if (t.stock < 1) {
        switchAeTab('tiers');
        toast('「' + t.name + '」库存需 ≥ 1', 'error');
        return;
      }
      if (t.stock < t.sold) {
        switchAeTab('tiers');
        toast('「' + t.name + '」库存不得小于已售 ' + t.sold + ' 张', 'error');
        return;
      }
    }

    if (!d.dates.length) {
      switchAeTab('dates');
      toast('请至少新增 1 个日期', 'error');
      return;
    }
    var days = {};
    for (var j = 0; j < d.dates.length; j++) {
      var x = d.dates[j];
      if (!x.date) {
        switchAeTab('dates');
        toast('第 ' + (j + 1) + ' 个日期未填写', 'error');
        return;
      }
      if (days[x.date]) {
        switchAeTab('dates');
        toast('日期 ' + x.date + ' 重复', 'error');
        return;
      }
      days[x.date] = 1;
    }

    d.range = actRange(d);
    d.time = actTime(d);

    var msg;
    if (aeEdit.mode === 'create') {
      var nextNum = 1;
      ACTIVITIES.forEach(function (a) {
        var n = parseInt(String(a.id).replace(/[^0-9]/g, ''), 10) || 0;
        if (n >= nextNum) nextNum = n + 1;
      });
      d.id = 'a' + nextNum;
      d.views = 0;
      ACTIVITIES.push(d);
      msg = '活动「' + d.title + '」已创建，配置地图与审核后即可在小程序上架';
    } else {
      var target = findAct(d.id);
      if (target) {
        Object.keys(d).forEach(function (k) { target[k] = d[k]; });
      }
      msg = '活动「' + d.title + '」已保存';
    }

    state.logs.unshift({
      at: stamp(), who: '陈静', role: '超级管理员', act: '活动维护',
      what: (aeEdit.mode === 'create' ? '新建活动 <b>' : '更新活动 <b>') + d.title + '</b> 内容 / 票种 / 日期', ip: '10.12.8.31'
    });

    closeLayers();
    renderActs();
    renderLogs();
    toast(msg);
  }

  /* ------------------------------------------------------------------
     12 核销员与权限
     ------------------------------------------------------------------ */

  function renderStaff() {
    var kw = ($('#staff-search').value || '').trim();
    var list = state.staff.filter(function (s) {
      return !kw || s.name.indexOf(kw) > -1 || s.phone.indexOf(kw) > -1;
    });

    $('#staff-count').textContent = list.length;

    if (!list.length) {
      $('#staff-rows').innerHTML = emptyRow(6, '没有匹配的账号', '试试搜索姓名或手机号。');
      return;
    }

    $('#staff-rows').innerHTML = list.map(function (s) {
      return '<tr>' +
        '<td><div class="cell-main"><span class="avatar avatar--sm">' + s.name.slice(0, 1) + '</span>' +
          '<span class="cell-main__name">' + s.name + '</span></div></td>' +
        '<td class="u-mono">' + s.phone + '</td>' +
        '<td>' + (s.parkId === '—' ? '<span class="u-faint">不绑定</span>' : parkById(s.parkId).name) + '</td>' +
        '<td>' + badge(s.role, s.role === '核销员' ? 'badge--leaf' : 'badge--cyan') + '</td>' +
        '<td>' + (s.state === '正常' ? badge('正常', 'badge--leaf') : badge('已停用', 'badge--neutral')) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="link-btn" type="button" data-toast="原型未展开账号编辑">编辑</button>' +
          '<button class="link-btn link-btn--muted" type="button" data-staff-toggle="' + s.name + '">' +
            (s.state === '正常' ? '停用' : '启用') + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     13 操作日志
     ------------------------------------------------------------------ */

  function renderLogs() {
    var kw = ($('#log-search').value || '').trim();
    var act = $('#log-action').value;

    var list = state.logs.filter(function (l) {
      var plain = l.who + l.what.replace(/<[^>]+>/g, '');
      var hitKw = !kw || plain.indexOf(kw) > -1;
      var hitAct = act === 'all' || l.act === act;
      return hitKw && hitAct;
    });

    $('#log-count').textContent = list.length;

    if (!list.length) {
      $('#log-list').innerHTML = '<div class="state" style="padding:var(--sp-10) 0">' +
        '<span class="state__icon">' + icon('i-list', 'icon--lg') + '</span>' +
        '<div class="state__title">没有匹配的日志</div>' +
        '<p class="state__desc">调整关键词或动作类型后重试。</p></div>';
      return;
    }

    $('#log-list').innerHTML = list.map(function (l) {
      return '<div class="log-row">' +
        '<span class="log-row__time">' + l.at + '</span>' +
        '<span class="log-row__who">' + l.who + '<small>' + l.role + '</small></span>' +
        '<span class="log-row__what">' + badge(l.act, 'badge--neutral') + ' ' + l.what + '</span>' +
        '<span class="log-row__ip">' + l.ip + '</span>' +
      '</div>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     浮层控制
     ------------------------------------------------------------------ */

  function openLayer(id) {
    var target = document.getElementById(id);
    if (!target) return;
    $('#ad-overlay').classList.add('is-open');
    window.UI.openOverlay(target);
  }

  function closeLayers() {
    $('#ad-overlay').classList.remove('is-open');
    window.UI.closeOverlays();
  }

  /* ------------------------------------------------------------------
     事件绑定
     ------------------------------------------------------------------ */

  document.addEventListener('click', function (e) {
    var t = e.target;

    var navBtn = t.closest('.ad-nav__item');
    if (navBtn) { go(navBtn.getAttribute('data-view')); return; }

    var jump = t.closest('[data-view-jump]');
    if (jump) { go(jump.getAttribute('data-view-jump')); return; }

    if (t.closest('[data-close-layer]') || t === $('#ad-overlay')) { closeLayers(); return; }

    var drawerBtn = t.closest('[data-drawer]');
    if (drawerBtn) { openLayer(drawerBtn.getAttribute('data-drawer')); return; }

    var modalBtn = t.closest('[data-modal]');
    if (modalBtn) { openLayer(modalBtn.getAttribute('data-modal')); return; }

    var parkToggle = t.closest('[data-park-toggle]');
    if (parkToggle) {
      var pid = parkToggle.getAttribute('data-park-toggle');
      var park = parkById(pid);
      park.status = park.status === 'online' ? 'offline' : 'online';
      renderParks();
      toast(park.name + (park.status === 'online' ? ' 已上架' : ' 已下架，已售订单不受影响'));
      return;
    }

    var parkMap = t.closest('[data-park-map]');
    if (parkMap) { go('editor'); return; }

    var parkEdit = t.closest('[data-park-edit]');
    if (parkEdit) { openParkEditor(parkEdit.getAttribute('data-park-edit')); return; }

    var actEdit = t.closest('[data-act-edit]');
    if (actEdit) { openActEditor(actEdit.getAttribute('data-act-edit'), actEdit.getAttribute('data-act-tab')); return; }

    var aeTab = t.closest('[data-aetab]');
    if (aeTab) {
      readAeTiers();
      readAeDates();
      switchAeTab(aeTab.getAttribute('data-aetab'));
      syncAePreview();
      return;
    }

    if (t.closest('[data-order-reload]')) {
      simulateOrderLoad('ready');
      return;
    }

    if (t.closest('[data-order-fail]')) {
      simulateOrderLoad('error');
      return;
    }

    if (t.closest('[data-order-retry]')) {
      simulateOrderLoad('ready');
      toast('已重新拉取订单列表', 'ok');
      return;
    }

    var aeTierDel = t.closest('[data-ae-tier-del]');
    if (aeTierDel) {
      var tIdx = Number(aeTierDel.getAttribute('data-ae-tier-del'));
      var goneTier = aeEdit.draft.tiers[tIdx];
      if (!goneTier) return;
      window.UI.confirmAction({
        title: '删除票种',
        message: '确认删除票种「' + goneTier.name +
          '」？删除后需点「保存」才生效，已售出的票据不受影响。',
        confirmText: '删除票种',
        onConfirm: function () {
          readAeTiers();
          var list = aeEdit.draft.tiers;
          var i = list.indexOf(goneTier);
          if (i < 0) {
            for (var k = 0; k < list.length; k++) {
              if (list[k].name === goneTier.name) { i = k; break; }
            }
          }
          if (i > -1) list.splice(i, 1);
          renderAeTiers();
          syncAePreview();
          toast('票种「' + goneTier.name + '」已从草稿移除，保存后生效', 'info');
        }
      });
      return;
    }

    var aeDateDel = t.closest('[data-ae-date-del]');
    if (aeDateDel) {
      var dIdx = Number(aeDateDel.getAttribute('data-ae-date-del'));
      window.UI.confirmAction({
        title: '删除开放日期',
        message: '确认删除该开放日期？删除后该日期不可预约，已预约订单不受影响。',
        confirmText: '删除日期',
        onConfirm: function () {
          readAeDates();
          aeEdit.draft.dates.splice(dIdx, 1);
          renderAeDates();
          syncAePreview();
        }
      });
      return;
    }

    var peCover = t.closest('[data-pe-cover]');
    if (peCover) {
      peEdit.cover = peCover.getAttribute('data-pe-cover');
      renderPePickers();
      syncPePreview();
      return;
    }

    var peGal = t.closest('[data-pe-gallery]');
    if (peGal) {
      var pgFile = peGal.getAttribute('data-pe-gallery');
      var pgIdx = peEdit.gallery.indexOf(pgFile);
      if (pgIdx > -1) {
        peEdit.gallery.splice(pgIdx, 1);
      } else if (peEdit.gallery.length >= 6) {
        toast('相册最多 6 张配图，请先移除一张', 'error');
        return;
      } else {
        peEdit.gallery.push(pgFile);
      }
      renderPePickers();
      syncPePreview();
      return;
    }

    var peTag = t.closest('[data-pe-tag]');
    if (peTag) {
      var pgTag = peTag.getAttribute('data-pe-tag');
      var pgAt = peEdit.tags.indexOf(pgTag);
      if (pgAt > -1) peEdit.tags.splice(pgAt, 1);
      else if (peEdit.tags.length >= 5) { toast('标签最多选 5 个', 'error'); return; }
      else peEdit.tags.push(pgTag);
      renderPeTags();
      syncPePreview();
      return;
    }

    var aeCover = t.closest('[data-ae-cover]');
    if (aeCover) {
      aeEdit.draft.cover = aeCover.getAttribute('data-ae-cover');
      renderAePickers();
      syncAePreview();
      return;
    }

    var aeGal = t.closest('[data-ae-gallery]');
    if (aeGal) {
      var agFile = aeGal.getAttribute('data-ae-gallery');
      var agIdx = aeEdit.draft.gallery.indexOf(agFile);
      if (agIdx > -1) {
        aeEdit.draft.gallery.splice(agIdx, 1);
      } else if (aeEdit.draft.gallery.length >= 6) {
        toast('相册最多 6 张配图，请先移除一张', 'error');
        return;
      } else {
        aeEdit.draft.gallery.push(agFile);
      }
      renderAePickers();
      syncAePreview();
      return;
    }

    var aeTag = t.closest('[data-ae-tag]');
    if (aeTag) {
      var agTag = aeTag.getAttribute('data-ae-tag');
      var agAt = aeEdit.draft.tags.indexOf(agTag);
      if (agAt > -1) aeEdit.draft.tags.splice(agAt, 1);
      else if (aeEdit.draft.tags.length >= 5) { toast('标签最多选 5 个', 'error'); return; }
      else aeEdit.draft.tags.push(agTag);
      renderAeTags();
      syncAePreview();
      return;
    }

    var verBtn = t.closest('[data-ver]');
    if (verBtn) {
      state.verIndex = Number(verBtn.getAttribute('data-ver'));
      renderVersions();
      return;
    }

    var seatPriceBtn = t.closest('[data-seat-price]');
    if (seatPriceBtn) {
      var pcode = seatPriceBtn.getAttribute('data-seat-price');
      var pseat = (SEATS[$('#seat-park').value] || []).filter(function (s) { return s.code === pcode; })[0];
      if (pseat) {
        state.priceSeat = pcode;
        $('#msp-sub').textContent = PARK_LABEL($('#seat-park').value) + ' · ' + pcode + ' ' + pseat.name;
        $('#msp-base').value = pseat.price;
        $('#msp-weekend').value = pseat.weekend;
        $('#msp-holiday').value = pseat.holiday;
        openLayer('modal-seat-price');
      }
      return;
    }

    var seatEdit = t.closest('[data-seat-edit]');
    if (seatEdit) {
      var code = seatEdit.getAttribute('data-seat-edit');
      state.selectedSeat = code;
      go('editor');
      toast('已在地图编辑器中选中营位 ' + code);
      return;
    }

    var seatMaint = t.closest('[data-seat-maint]');
    if (seatMaint) {
      var scode = seatMaint.getAttribute('data-seat-maint');
      var seats = SEATS[$('#seat-park').value];
      var seat = seats.filter(function (s) { return s.code === scode; })[0];
      if (seat) {
        seat.state = seat.state === 'maint' ? 'ok' : 'maint';
        renderSeats();
        toast('营位 ' + scode + (seat.state === 'maint' ? ' 已设为维护中' : ' 已恢复可预约'));
      }
      return;
    }

    var tierBtn = t.closest('[data-act-tier]');
    if (tierBtn) {
      toggleTier(tierBtn.getAttribute('data-act-tier'), tierBtn.getAttribute('data-tier'));
      return;
    }

    var actOrder = t.closest('[data-act-order]');
    if (actOrder && !t.closest('button')) { openOrder(actOrder.getAttribute('data-act-order')); return; }

    var orderOpen = t.closest('[data-order-open]');
    if (orderOpen) { openOrder(orderOpen.getAttribute('data-order-open')); return; }

    var orderRow = t.closest('[data-order-row]');
    if (orderRow && !t.closest('button')) { openOrder(orderRow.getAttribute('data-order-row')); return; }

    var orderRefund = t.closest('[data-order-refund]');
    if (orderRefund) {
      var no = orderRefund.getAttribute('data-order-refund');
      state.refundStatus = 'pending';
      closeLayers();
      go('refunds');
      toast('已跳转到退款管理，订单 ' + no + ' 可在此发起退款', 'info');
      return;
    }

    var copyBtn = t.closest('[data-copy]');
    if (copyBtn) { toast('已复制订单号'); return; }

    var refundDo = t.closest('[data-refund-do]');
    if (refundDo) { openRefund(refundDo.getAttribute('data-refund-do')); return; }

    var staffToggle = t.closest('[data-staff-toggle]');
    if (staffToggle) {
      var name = staffToggle.getAttribute('data-staff-toggle');
      state.staff.forEach(function (s) {
        if (s.name === name) s.state = s.state === '正常' ? '已停用' : '正常';
      });
      renderStaff();
      toast('账号状态已更新');
      return;
    }

    var day = t.closest('[data-day]');
    if (day) {
      state.schDay = Number(day.getAttribute('data-day'));
      renderSchedule();
      return;
    }

    var tool = t.closest('.tool[data-tool]');
    if (tool) {
      state.tool = tool.getAttribute('data-tool');
      syncTools();
      return;
    }
  });

  /* 顶栏与侧栏的筛选、搜索 */
  document.addEventListener('input', function (e) {
    var id = e.target.id;
    if (id === 'park-search' || id === 'park-status') renderParks();
    if (id === 'seat-search' || id === 'seat-state' || id === 'seat-park') renderSeats();
    if (id === 'order-search') renderOrders();
    if (id === 'act-search') renderActs();
    if (id === 'verify-search') renderVerifyLogs();
    if (id === 'staff-search') renderStaff();
    if (id === 'log-search') renderLogs();
  });

  document.addEventListener('change', function (e) {
    var id = e.target.id;
    if (id === 'park-status') renderParks();
    if (id === 'seat-park' || id === 'seat-state') renderSeats();
    if (id === 'order-park' || id === 'order-date') renderOrders();
    if (id === 'act-park') { state.actPark = e.target.value; renderActs(); }
    if (id === 'verify-park' || id === 'verify-result') renderVerifyLogs();
    if (id === 'log-action') renderLogs();
    if (id === 'ver-park') { state.verIndex = 0; renderVersions(); }
    if (id === 'sch-park') renderSchedule();
    if (id === 'role-select') applyRole(e.target.value);
  });

  /* 活动管理分区标签 */
  $$('#act-tabs .tabstrip__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.actPane = btn.getAttribute('data-pane');
      renderActs();
    });
  });

  if ($('#act-clear')) {
    $('#act-clear').addEventListener('click', function () {
      $('#act-search').value = '';
      $('#act-park').value = 'all';
      state.actPark = 'all';
      renderActs();
      toast('活动筛选已清除');
    });
  }

  if ($('#act-create')) {
    $('#act-create').addEventListener('click', function () { openActEditor(null, 'content'); });
  }

  if ($('#pe-save')) $('#pe-save').addEventListener('click', savePark);

  if ($('#ae-save')) $('#ae-save').addEventListener('click', saveAct);

  if ($('#ae-add-tier')) {
    $('#ae-add-tier').addEventListener('click', function () {
      readAeTiers();
      aeEdit.draft.tiers.push({ name: '新票种', price: 68, stock: 20, sold: 0, state: '在售' });
      renderAeTiers();
      syncAePreview();
      var rows = $$('#ae-tier-rows tr[data-ae-tier-row]');
      var last = rows[rows.length - 1];
      if (last) {
        var inp = last.querySelector('[data-ae-tn]');
        inp.focus();
        inp.select();
      }
    });
  }

  if ($('#ae-add-date')) {
    $('#ae-add-date').addEventListener('click', function () {
      readAeDates();
      var lastDate = aeEdit.draft.dates.length
        ? aeEdit.draft.dates[aeEdit.draft.dates.length - 1]
        : null;
      aeEdit.draft.dates.push({
        date: lastDate ? lastDate.date : '',
        time: lastDate ? lastDate.time : '09:00–11:30',
        state: '开放'
      });
      renderAeDates();
      syncAePreview();
      var drows = $$('#ae-date-rows tr[data-ae-date-row]');
      if (drows.length) drows[drows.length - 1].querySelector('[data-ae-dd]').focus();
    });
  }

  if ($('#ae-tier-rows')) {
    $('#ae-tier-rows').addEventListener('input', function () {
      readAeTiers();
      syncAePreview();
    });
    $('#ae-tier-rows').addEventListener('change', function () {
      readAeTiers();
      syncAePreview();
    });
  }

  if ($('#ae-date-rows')) {
    $('#ae-date-rows').addEventListener('input', function () {
      readAeDates();
      syncAePreview();
    });
    $('#ae-date-rows').addEventListener('change', function () {
      readAeDates();
      syncAePreview();
    });
  }

  ['ae-name', 'ae-cat', 'ae-park', 'ae-state', 'ae-limit', 'ae-stock', 'ae-desc', 'ae-intro'].forEach(function (id) {
    var el = $('#' + id);
    if (el) el.addEventListener('input', syncAePreview);
  });
  if ($('#ae-park')) $('#ae-park').addEventListener('change', syncAePreview);
  if ($('#ae-cat')) $('#ae-cat').addEventListener('change', syncAePreview);

  ['pe-name', 'pe-addr', 'pe-open', 'pe-close', 'pe-desc', 'pe-intro'].forEach(function (id) {
    var el = $('#' + id);
    if (el) el.addEventListener('input', syncPePreview);
  });
  ['pe-open', 'pe-close'].forEach(function (id) {
    var el = $('#' + id);
    if (el) el.addEventListener('change', syncPePreview);
  });

  /* 订单状态标签 */
  $$('#order-tabs .tabstrip__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.orderStatus = btn.getAttribute('data-status');
      renderOrders();
    });
  });

  /* 退款状态标签 */
  $$('#refund-tabs .tabstrip__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.refundStatus = btn.getAttribute('data-rstatus');
      renderRefunds();
    });
  });

  /* 趋势维度切换 */
  $$('#trend-seg .segmented__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.trend = btn.getAttribute('data-trend');
      $$('#trend-seg .segmented__btn').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      $('#chart-trend').innerHTML = trendChart(state.trend);
    });
  });

  /* 订单筛选清空 */
  $('#order-clear').addEventListener('click', function () {
    $('#order-search').value = '';
    $('#order-park').value = 'all';
    $('#order-date').value = '';
    state.orderStatus = 'all';
    renderOrders();
    toast('已清除筛选条件');
  });

  /* 新增公园 */
  $('#btn-add-park').addEventListener('click', function () { openLayer('drawer-park'); });

  $('#np-save').addEventListener('click', function () {
    var name = $('#np-name').value.trim();
    var addr = $('#np-addr').value.trim();
    if (!name || !addr) {
      toast('请填写公园名称与地址', 'error');
      return;
    }
    var code = $('#np-code').value.trim() || 'PARK-00' + (PARKS.length + 1);
    var newId = 'p' + (PARKS.length + 1);
    PARKS.push({
      id: newId,
      name: name,
      code: code,
      cover: 'park-cover-1.svg',
      addr: addr,
      hours: ($('#np-open').value || '08:00') + ' – ' + ($('#np-close').value || '20:00'),
      mode: $('#np-mode').value.indexOf('分时') > -1 ? '分时场' : '整日场',
      status: 'offline',
      seatCount: 0,
      desc: $('#np-desc').value.trim(),
      intro: '',
      tags: [],
      gallery: ['park-cover-1.svg'],
      notice: '',
      phone: '',
      updated: stamp()
    });
    SEATS['p' + (PARKS.length)] = SEATS['p' + (PARKS.length)] || [];
    closeLayers();
    renderParks();
    toast('公园已创建，当前为「下架」状态');
    $('#np-name').value = '';
    $('#np-code').value = '';
    $('#np-addr').value = '';
    $('#np-desc').value = '';
  });

  /* 新增核销员 */
  $('#ns-save').addEventListener('click', function () {
    var name = $('#ns-name').value.trim();
    var phone = $('#ns-phone').value.trim();
    if (!name || !phone) {
      toast('请填写姓名与手机号', 'error');
      return;
    }
    var parkId = ['p1', 'p2', 'p3'][$('#ns-park').selectedIndex] || 'p1';
    state.staff.unshift({
      name: name, phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      parkId: parkId, role: '核销员', state: '正常'
    });
    closeLayers();
    renderStaff();
    toast('核销员已创建，初始密码将通过短信下发');
    $('#ns-name').value = '';
    $('#ns-phone').value = '';
  });

  /* 地图审批：通过 / 驳回 */
  $('#mr-confirm').addEventListener('click', function () {
    var reason = $('#mr-reason').value.trim();
    var err = $('#mr-error');
    if (!reason) {
      err.classList.remove('u-hide');
      $('#mr-reason').focus();
      return;
    }
    err.classList.add('u-hide');
    var pv = state.pendingVersion;
    if (pv) {
      var v = pv.list[pv.index];
      v.state = 'rejected';
      state.logs.unshift({
        at: '2026-03-16 10:08', who: ROLE_USERS[state.role].name, role: ROLE_NAMES[state.role],
        act: '地图审批', what: '驳回 <b>' + PARK_LABEL(state.verPark) + '</b> 地图 ' + v.v + '：' + reason,
        ip: '10.12.8.31'
      });
    }
    state.pendingVersion = null;
    closeLayers();
    renderVersions();
    toast('已驳回，原因将推送给提交人', 'warn');
  });

  /* 退款确认 */
  $('#mrf-confirm').addEventListener('click', confirmRefund);

  /* 营位改价 */
  $('#msp-confirm').addEventListener('click', function () {
    if (!state.priceSeat) { closeLayers(); return; }
    var parkId = $('#seat-park').value;
    var seat = (SEATS[parkId] || []).filter(function (s) { return s.code === state.priceSeat; })[0];
    if (!seat) { closeLayers(); return; }
    var base = Number($('#msp-base').value);
    var wk = Number($('#msp-weekend').value);
    var hd = Number($('#msp-holiday').value);
    if (!(base > 0) || !isFinite(wk) || !isFinite(hd) || wk < 0 || hd < 0) {
      toast('价格需为正数，加价不能为负', 'warn');
      return;
    }
    seat.price = base;
    seat.weekend = wk;
    seat.holiday = hd;
    state.priceSeat = null;
    closeLayers();
    renderSeats();
    renderSchedule();
    toast('营位 ' + seat.code + ' 价格已更新，仅对新订单生效');
  });

  /* 批量库存 */
  $('#mb-confirm').addEventListener('click', function () {
    var from = Number(($('#mb-from').value || '').slice(-2)) || 16;
    var to = Number(($('#mb-to').value || '').slice(-2)) || 31;
    var weekDay = Number($('#mb-week-day').value) || 12;
    var weekend = Number($('#mb-weekend').value) || 10;
    var n = 0;
    for (var d = from; d <= to; d++) {
      var wd = (new Date(state.schYear, state.schMonth, d).getDay() + 6) % 7;
      state.stock[d] = wd >= 5 ? weekend : weekDay;
      n++;
    }
    closeLayers();
    renderSchedule();
    toast('已将 ' + n + ' 天的库存更新为平日 ' + weekDay + ' / 周末 ' + weekend + ' 个营位');
  });

  /* 日历翻页 */
  $('#sch-prev').addEventListener('click', function () {
    state.schMonth--;
    if (state.schMonth < 0) { state.schMonth = 11; state.schYear--; }
    renderSchedule();
  });

  $('#sch-next').addEventListener('click', function () {
    state.schMonth++;
    if (state.schMonth > 11) { state.schMonth = 0; state.schYear++; }
    renderSchedule();
  });

  $('#sch-save').addEventListener('click', function () {
    var v = Number($('#sch-stock').value);
    if (!isFinite(v) || v < 0) { toast('库存需为 0 或正整数', 'warn'); return; }
    state.stock[state.schDay] = v;
    toast('当日库存已保存为 ' + v + ' 个营位，仅对新订单生效');
  });

  /* 编辑器 */
  $('#editor-canvas').addEventListener('click', editorClick);
  $('#btn-del-shape').addEventListener('click', deleteSelected);

  $$('[data-layer]').forEach(function (input) {
    input.addEventListener('change', function () {
      var layer = input.getAttribute('data-layer');
      var shapes = $('#editor-shapes');
      if (layer === 'seats') {
        shapes.style.display = input.checked ? '' : 'none';
      } else {
        toast('道路 / 出入口 / 卫生间图层为底图内置，原型不单独渲染', 'info');
        input.checked = true;
      }
    });
  });

  $('#btn-submit-map').addEventListener('click', function () {
    var today = new Date();
    var stamp = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate()) +
      ' ' + pad(today.getHours()) + ':' + pad(today.getMinutes());
    var pid = state.editorPark;
    var park = parkById(pid);
    var count = edSeats().length;
    VERSIONS[pid] = VERSIONS[pid] || [];
    VERSIONS[pid].unshift({
      v: 'V' + (VERSIONS[pid].length + 1),
      state: 'pending',
      by: ROLE_USERS[state.role].name,
      at: stamp,
      summary: '编辑器提交：' + park.name + ' 共 ' + count + ' 个营位，调整营位位置与状态',
      map: park.map || 'park-map-1.svg',
      diff: [{ type: '新增', cls: 'diff--add', text: '本次草稿共 ' + count + ' 个营位' }]
    });
    state.verPark = pid;
    state.verIndex = 0;
    go('versions');
    toast('已提交审批，等待审核员处理');
  });

  /* 全局搜索 / 重置 */
  $('#global-search').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var kw = this.value.trim();
    if (!kw) return;
    state.orderStatus = 'all';
    $('#order-search').value = kw;
    go('orders');
    toast('已在订单中检索「' + kw + '」');
  });

  $('#reset-demo').addEventListener('click', function () {
    state.orders = buildOrders().concat(buildActOrders());
    state.refunds = buildRefunds();
    state.verifyLogs = buildVerifyLogs();
    state.staff = buildStaff();
    state.logs = buildLogs();
    state.stock = {};
    state.orderStatus = 'all';
    state.actPane = 'tickets';
    state.actPark = 'all';
    state.refundStatus = 'pending';
    state.verIndex = 0;
    state.selectedSeat = null;
    state.tool = 'select';
    state.schMonth = 2;
    state.schYear = 2026;
    state.schDay = 16;
    SEATS = buildSeats();
    VERSIONS = buildVersions();
    ED.park = '';
    ED.ready = false;
    state.editorPark = 'p2';
    ACTIVITIES = buildActivities();
    PARKS = buildParks();
    state.aeTab = 'content';
    $('#order-search').value = '';
    $('#order-park').value = 'all';
    $('#order-date').value = '';
    $('#act-search').value = '';
    $('#act-park').value = 'all';
    $('#ver-park').value = 'p2';
    $('#seat-park').value = 'p2';
    if ($('#ed-park')) $('#ed-park').value = 'p2';
    $('#seat-search').value = '';
    $('#seat-state').value = 'all';
    $('#park-search').value = '';
    $('#park-status').value = 'all';
    $('#staff-search').value = '';
    $('#log-search').value = '';
    $('#log-action').value = 'all';
    $('#verify-search').value = '';
    $('#verify-park').value = 'all';
    $('#verify-result').value = 'all';
    $('#role-select').value = 'super';
    applyRole('super');
    go('dash');
    toast('演示数据已重置');
  });

  /* Esc 由 common.js 统一处理：只关最上层，保证二次确认弹出时不会连带关掉编辑抽屉 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (e.defaultPrevented) return;
    if (document.querySelector('.confirm-layer.is-open')) return;
    if (document.querySelector('.drawer.is-open') || document.querySelector('#ad-overlay.is-open')) closeLayers();
  });

  /* ------------------------------------------------------------------
     初始化
     ------------------------------------------------------------------ */

  applyRole('super');
  go('dash');
  updateBadges();
})();
