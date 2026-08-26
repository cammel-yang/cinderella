const pptxgen = require('pptxgenjs');
const p = new pptxgen();
p.defineLayout({ name: 'W', width: 13.333, height: 7.5 });
p.layout = 'W';
const pages = [];

// ---- palette ----
const DARK = '0C3A44';     // dark teal bg
const INK = '13323A';      // text on light
const TEAL = '1C7293';
const SEA = '2A9D8F';
const AMBER = 'E4A11B';    // key numbers
const CORAL = 'C34A36';    // warnings / pathologic
const WHITE = 'FFFFFF';
const CARD = 'F1F6F7';
const MUTED = '5E7076';
const LINE = 'D7E2E4';
const HFONT = '微软雅黑';
const BFONT = '微软雅黑';

const W = 13.333, H = 7.5, M = 0.6;
function sh() { return { type: 'outer', color: '9BB3B8', blur: 8, offset: 3, angle: 90, opacity: 0.35 }; }
// text wrapper: shrink-to-fit so nothing overflows its box in PowerPoint
function T(sl, text, opts) {
  if (opts.fit === undefined) opts.fit = 'shrink';
  if (opts.margin === undefined) opts.margin = [2, 3, 2, 3];
  if (opts.valign === undefined) opts.valign = 'top';
  return sl.addText(text, opts);
}

function patchSlide(sl) {
  const orig = sl.addText.bind(sl);
  sl.addText = function(text, opts) {
    if (opts && opts.fit === undefined) opts.fit = 'shrink';
    return orig(text, opts);
  };
  return sl;
}
function bgLight(s) { patchSlide(s); s.background = { color: WHITE }; pages.push({ s, dark: false }); }
function bgDark(s) { patchSlide(s); s.background = { color: DARK }; pages.push({ s, dark: true }); }

// content slide header (no underline, no bars)
function header(s, kicker, title, tcolor) {
  s.addText(kicker.toUpperCase(), { x: M, y: 0.34, w: W - 2 * M, h: 0.3, fontFace: BFONT, fontSize: 12, color: SEA, bold: true, charSpacing: 2 });
  s.addText(title, { x: M, y: 0.6, w: W - 2 * M, h: 0.75, fontFace: HFONT, fontSize: 30, bold: true, color: tcolor || INK });
}

// rounded card
function card(s, x, y, w, h, fill) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.09, fill: { color: fill || CARD }, line: { color: LINE, width: 1 }, shadow: sh() });
}
// numbered circle
function circle(s, x, y, d, txt, fill, tcol) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { type: 'none' } });
  s.addText(txt, { x, y, w: d, h: d, align: 'center', valign: 'middle', fontFace: HFONT, fontSize: 15, bold: true, color: tcol || WHITE });
}

// ============ 1. TITLE ============
let s = p.addSlide(); bgDark(s);
s.addShape(p.ShapeType.ellipse, { x: 10.3, y: -1.6, w: 4.6, h: 4.6, fill: { color: '134956' }, line: { type: 'none' } });
s.addShape(p.ShapeType.ellipse, { x: 11.6, y: 4.7, w: 3.4, h: 3.4, fill: { color: '0F434F' }, line: { type: 'none' } });
s.addText('国家卫生健康委员会 · 临床指南', { x: M, y: 2.0, w: 9, h: 0.4, fontFace: BFONT, fontSize: 15, color: SEA, bold: true, charSpacing: 1 });
s.addText('《近视防治指南》', { x: M, y: 2.5, w: 11, h: 1.1, fontFace: HFONT, fontSize: 52, bold: true, color: WHITE });
s.addText('（2026 年版）· 要点解读', { x: M, y: 3.62, w: 11, h: 0.7, fontFace: HFONT, fontSize: 26, color: 'CFE3E6' });
s.addText('面向眼科医护与门诊团队的专业解读', { x: M, y: 4.5, w: 11, h: 0.5, fontFace: BFONT, fontSize: 16, color: 'AFC9CD' });
s.addText('定义分类 · 影响因素与预防 · 相关检查 · 矫正与控制 · 病理性近视治疗 · 成人手术', { x: M, y: 6.5, w: 10.4, h: 0.4, fontFace: BFONT, fontSize: 12, color: '86A6AB' });

// ============ 2. 概览 ============
s = p.addSlide(); bgLight(s);
header(s, 'Overview', '指南结构 · 六大部分');
const parts = [
  ['01', '定义、分类与分期', '屈光/轴性；单纯性/病理性；度数分级；四期防控'],
  ['02', '影响因素及预防', '环境行为、遗传、基因-环境交互与重点人群'],
  ['03', '相关检查', '建档筛查、眼轴、眼底、睫状肌麻痹验光、远视储备'],
  ['04', '矫正与控制', '框架镜、接触镜/OK镜、低浓度阿托品、随访'],
  ['05', '病理性近视及并发症治疗', '激光光凝、抗 VEGF、手术'],
  ['06', '成人近视手术矫正', '激光角膜屈光手术、有晶体眼 IOL 植入'],
];
let cx = M, cy = 1.65, cw = (W - 2 * M - 2 * 0.35) / 3, ch = 2.2;
parts.forEach((it, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = M + col * (cw + 0.35), y = cy + row * (ch + 0.3);
  card(s, x, y, cw, ch);
  circle(s, x + 0.28, y + 0.28, 0.72, it[0], TEAL);
  s.addText(it[1], { x: x + 0.28, y: y + 1.12, w: cw - 0.56, h: 0.6, fontFace: HFONT, fontSize: 16, bold: true, color: INK });
  s.addText(it[2], { x: x + 0.28, y: y + 1.62, w: cw - 0.56, h: 0.5, fontFace: BFONT, fontSize: 11.5, color: MUTED });
});

// ============ 3. 背景与意义 ============
s = p.addSlide(); bgLight(s);
header(s, 'Background', '背景与意义');
s.addText([
  { text: '我国近视患病率居高不下，已成为影响国民、尤其是儿童青少年眼健康的重大公共卫生问题。', options: { bullet: { code: '2022' }, breakLine: true, paraSpaceAfter: 10 } },
  { text: '流行病学显示：病理性近视相关眼底病变，已成为我国不可逆性致盲眼病的主要原因之一。', options: { bullet: { code: '2022' }, breakLine: true, paraSpaceAfter: 10 } },
  { text: '防治核心：早筛查、早建档、早干预，全程延缓进展、防控高度与病理性近视。', options: { bullet: { code: '2022' } } },
], { x: M, y: 1.7, w: 7.0, h: 3.6, fontFace: BFONT, fontSize: 16, color: INK, lineSpacingMultiple: 1.25, valign: 'top' });
// right stat cards
const st = [['致盲主因', '病理性近视眼底病变\n= 不可逆致盲主要原因之一', CORAL], ['防控关键期', '儿童青少年\n远视储备的保护与消耗速度', TEAL]];
let sy = 1.7;
st.forEach((t) => { card(s, 8.1, sy, 4.6, 1.7, CARD); s.addText(t[0], { x: 8.35, y: sy + 0.18, w: 4.1, h: 0.4, fontFace: HFONT, fontSize: 17, bold: true, color: t[2] }); s.addText(t[1], { x: 8.35, y: sy + 0.66, w: 4.1, h: 0.9, fontFace: BFONT, fontSize: 13.5, color: INK }); sy += 1.9; });

// ============ 4. 定义与分类 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 01 · 定义与分类', '定义 · 按屈光成分/病程分类');
card(s, M, 1.6, 5.9, 1.35, CARD);
s.addText('定义', { x: M + 0.25, y: 1.72, w: 5.4, h: 0.35, fontFace: HFONT, fontSize: 15, bold: true, color: TEAL });
s.addText('调节放松时，平行光线经眼球屈光系统聚焦于视网膜之前，属屈光不正的一种。', { x: M + 0.25, y: 2.06, w: 5.4, h: 0.8, fontFace: BFONT, fontSize: 13.5, color: INK });
card(s, M, 3.15, 5.9, 3.6, WHITE);
s.addText('按屈光成分', { x: M + 0.25, y: 3.3, w: 5.4, h: 0.35, fontFace: HFONT, fontSize: 15, bold: true, color: TEAL });
s.addText([
  { text: '屈光性近视：角膜/晶状体屈光力过大或屈光指数异常，眼轴基本正常（含曲率性、屈光指数性、调节性）', options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
  { text: '轴性近视：眼轴延长超出正常，其他屈光成分基本正常 —— 临床最常见类型', options: { bullet: true } },
], { x: M + 0.25, y: 3.7, w: 5.4, h: 2.9, fontFace: BFONT, fontSize: 13.5, color: INK, valign: 'top' });

card(s, 6.9, 1.6, 5.83, 5.15, WHITE);
s.addText('按病程进展与病理变化', { x: 7.15, y: 1.75, w: 5.3, h: 0.35, fontFace: HFONT, fontSize: 15, bold: true, color: TEAL });
s.addText([
  { text: '单纯性近视', options: { bold: true, color: SEA, breakLine: true, paraSpaceAfter: 3, fontSize: 15 } },
  { text: '多见于生长发育期，一般 ≤600 度；眼底多无病理变化，配镜可矫正至正常。', options: { breakLine: true, paraSpaceAfter: 12, fontSize: 13.5 } },
  { text: '病理性近视', options: { bold: true, color: CORAL, breakLine: true, paraSpaceAfter: 3, fontSize: 15 } },
  { text: '近视持续进展、眼轴持续延长，伴眼底退行性病变；后巩膜葡萄肿、视盘旁萎缩弧、豹纹状眼底、Fuchs 斑、脉络膜萎缩等。', options: { breakLine: true, paraSpaceAfter: 6, fontSize: 13.5 } },
  { text: '并发症风险显著升高：视网膜裂孔/脱离、黄斑 CNV 与出血、早发白内障、玻璃体混浊及后脱离、开角型青光眼等。', options: { fontSize: 13, color: MUTED } },
], { x: 7.15, y: 2.15, w: 5.35, h: 4.5, fontFace: BFONT, color: INK, valign: 'top' });

// ============ 5. 度数分级 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 01 · 度数分级', '按度数分类（睫状肌麻痹后 SE）');
const deg = [['低度近视', '-3.00 D < SE ≤ -0.50 D', '50 ~ 300 度', SEA], ['中度近视', '-6.00 D < SE ≤ -3.00 D', '300 ~ 600 度', TEAL], ['高度近视', 'SE ≤ -6.00 D', '＞ 600 度', CORAL]];
let dx = M, dw = (W - 2 * M - 2 * 0.4) / 3;
deg.forEach((d, i) => {
  const x = M + i * (dw + 0.4);
  card(s, x, 1.75, dw, 3.0, CARD);
  s.addText(d[2], { x: x + 0.2, y: 2.05, w: dw - 0.4, h: 1.0, align: 'center', fontFace: HFONT, fontSize: 40, bold: true, color: d[3] });
  s.addText(d[0], { x: x + 0.2, y: 3.15, w: dw - 0.4, h: 0.5, align: 'center', fontFace: HFONT, fontSize: 20, bold: true, color: INK });
  s.addText(d[1], { x: x + 0.2, y: 3.75, w: dw - 0.4, h: 0.6, align: 'center', fontFace: BFONT, fontSize: 14, color: MUTED });
});
card(s, M, 5.05, W - 2 * M, 1.35, WHITE);
s.addText('等效球镜（SE）', { x: M + 0.3, y: 5.2, w: 3, h: 0.4, fontFace: HFONT, fontSize: 15, bold: true, color: TEAL });
s.addText('SE = 球镜度数 + 1/2 × 柱镜度数。分级须以睫状肌麻痹（散瞳）验光结果为准。', { x: M + 0.3, y: 5.62, w: W - 2 * M - 0.6, h: 0.7, fontFace: BFONT, fontSize: 15, color: INK });

// ============ 6. 四期分期 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 01 · 公共卫生分期', '四期防控分期与关键阈值');
const stage = [
  ['近视前驱期', '尚未近视，但远视储备已低于同龄下限（远视储备不足）', '高危窗口：增加户外、减少近距离负荷可延缓/避免发生', SEA],
  ['近视发展期', '已近视，年进展 ＞50 度 或 眼轴 ＞0.20 mm/年，未达高度', '防控高度近视关键期：行为干预 + 医生指导下矫正与控制', TEAL],
  ['高度近视期', '度数 ＞600 度 或 眼轴 ＞26.00 mm', '定期监测 BCVA、眼轴、眼底，警惕向病理性进展', AMBER],
  ['病理性近视期', '后巩膜葡萄肿、脉络膜视网膜萎缩、劈裂、裂孔、漆裂纹、CNV 等', '视力骤降/视物变形/黑影骤增/固定暗影/持续闪光 → 立即就医', CORAL],
];
let ty = 1.62, th = 1.24;
stage.forEach((t, i) => {
  card(s, M, ty, W - 2 * M, th, i === 3 ? 'FBF1EF' : CARD);
  circle(s, M + 0.28, ty + (th - 0.72) / 2, 0.72, String(i + 1), t[3]);
  s.addText(t[0], { x: M + 1.2, y: ty + 0.14, w: 3.1, h: 0.9, valign: 'middle', fontFace: HFONT, fontSize: 18, bold: true, color: t[3] });
  s.addText(t[1], { x: M + 4.2, y: ty + 0.12, w: 4.7, h: th - 0.24, valign: 'middle', fontFace: BFONT, fontSize: 12.5, color: INK });
  s.addText(t[2], { x: M + 9.05, y: ty + 0.12, w: 3.05, h: th - 0.24, valign: 'middle', fontFace: BFONT, fontSize: 12, color: MUTED });
  ty += th + 0.12;
});

// ============ 7. 临床表现与诊断 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 01 · 临床与诊断', '临床表现与诊断要点');
s.addText('诊断应基于病史采集、屈光检查与眼部评估综合判断', { x: M, y: 1.55, w: 11, h: 0.4, fontFace: HFONT, fontSize: 15, bold: true, color: TEAL });
const dd = [
  ['视觉症状', '远视力模糊、近视力多不受影响；初期远视力波动、看远眯眼'],
  ['屈光检查', '客观 + 主觉验光综合判定；必要时睫状肌麻痹验光获真实屈光'],
  ['生物参数', '眼轴长度、角膜曲率、晶状体厚度等'],
  ['综合评估', '双眼视功能、近视性质、进展速度及相关并发症'],
  ['高度近视者', '除远视力差外，常伴飞蚊症、漂浮物感、闪光感及不同程度眼底改变'],
];
let yy = 2.1;
dd.forEach((d, i) => {
  card(s, M, yy, W - 2 * M, 0.82, i === 4 ? 'FBF1EF' : CARD);
  s.addText(d[0], { x: M + 0.3, y: yy, w: 2.6, h: 0.82, valign: 'middle', fontFace: HFONT, fontSize: 15, bold: true, color: i === 4 ? CORAL : TEAL });
  s.addText(d[1], { x: M + 3.0, y: yy, w: W - 2 * M - 3.3, h: 0.82, valign: 'middle', fontFace: BFONT, fontSize: 14, color: INK });
  yy += 0.94;
});

// ============ 8. 环境行为因素 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 02 · 影响因素', '环境与行为因素（可干预）');
const env = [
  ['近距离用眼', '危险因素', '单次 30–40 分钟休息 10–20 分钟；阅读距离 ≥33cm。电视≥4×对角线、电脑≥50cm、手机≥40cm'],
  ['户外活动', '保护因素', '学龄前每日 3 小时；中小学生 2 小时（或每周 ≥14 小时）。预防发生并延缓进展'],
  ['读写习惯', '危险因素', '一尺（33cm）· 一拳（6–7cm）· 一寸（3.3cm）；坐姿端正，不在行走/乘车/躺卧时阅读'],
  ['采光照明', '危险因素', '桌面平均照度 ≥300 lux；夜间入睡卧室 ＜10 lux（理想全暗）'],
  ['其他', '需关注', '不科学使用电子产品、夜间光暴露、睡眠不足、节律紊乱、高糖/营养不均衡'],
];
let ex = M, ew = (W - 2 * M - 0.35) / 2;
env.forEach((e, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  if (i === 4) { card(s, M, 1.62 + 2 * (1.55 + 0.2), W - 2 * M, 1.35, CARD); const x0 = M; const y0 = 1.62 + 2 * (1.55 + 0.2);
    s.addText(e[0], { x: x0 + 0.28, y: y0 + 0.15, w: 2.4, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: INK });
    s.addText(e[1], { x: x0 + 2.7, y: y0 + 0.17, w: 1.5, h: 0.35, fontFace: BFONT, fontSize: 12, bold: true, color: AMBER });
    s.addText(e[2], { x: x0 + 0.28, y: y0 + 0.6, w: W - 2 * M - 0.56, h: 0.7, fontFace: BFONT, fontSize: 13, color: MUTED }); return; }
  const x = M + col * (ew + 0.35), y = 1.62 + row * (1.55 + 0.2);
  const prot = e[1] === '保护因素';
  card(s, x, y, ew, 1.55, prot ? 'EAF5F1' : CARD);
  s.addText(e[0], { x: x + 0.28, y: y + 0.16, w: 3.4, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: INK });
  s.addText(e[1], { x: x + ew - 1.7, y: y + 0.18, w: 1.45, h: 0.35, align: 'right', fontFace: BFONT, fontSize: 12, bold: true, color: prot ? SEA : CORAL });
  s.addText(e[2], { x: x + 0.28, y: y + 0.58, w: ew - 0.56, h: 0.9, fontFace: BFONT, fontSize: 12.5, color: MUTED });
});

// ============ 9. 遗传 + 基因环境 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 02 · 影响因素', '遗传因素与基因-环境交互');
card(s, M, 1.7, 5.9, 4.9, CARD);
s.addText('遗传因素', { x: M + 0.28, y: 1.9, w: 5.3, h: 0.4, fontFace: HFONT, fontSize: 17, bold: true, color: TEAL });
s.addText([
  { text: '低中度近视：受环境与遗传共同影响。', options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
  { text: '父母屈光状态与子代近视风险显著相关，风险随父母近视度数升高而增加。', options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
  { text: '高度近视——尤其早发性高度近视与病理性近视，遗传作用更为显著。', options: { bullet: true } },
], { x: M + 0.28, y: 2.4, w: 5.35, h: 4.0, fontFace: BFONT, fontSize: 14, color: INK, valign: 'top' });

card(s, 6.9, 1.7, 5.83, 4.9, WHITE);
s.addText('基因-环境交互', { x: 7.18, y: 1.9, w: 5.3, h: 0.4, fontFace: HFONT, fontSize: 17, bold: true, color: TEAL });
s.addText([
  { text: '风险位点（GJD2、ZMAT4、RBFOX1、VIPR2）与环境因素（教育、近距离工作、户外时长）存在交互效应。', options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
  { text: '携带风险基因型者，若长期近距离负荷过重、户外不足，易感性显著升高。', options: { bullet: true } },
], { x: 7.18, y: 2.4, w: 5.35, h: 2.3, fontFace: BFONT, fontSize: 14, color: INK, valign: 'top' });
card(s, 7.18, 4.85, 5.28, 1.55, 'FBF1EF');
s.addText('重点人群', { x: 7.42, y: 5.0, w: 4.8, h: 0.35, fontFace: HFONT, fontSize: 14, bold: true, color: CORAL });
s.addText('父母高度近视或携带致病基因的儿童：严格控制近距离用眼、保证每日充足户外，最大限度减少危险因素暴露。', { x: 7.42, y: 5.38, w: 4.85, h: 0.95, fontFace: BFONT, fontSize: 12.5, color: INK });

// ============ 10. 预防要点速记 ============
s = p.addSlide(); bgDark(s);
header(s, 'Part 02 · 预防', '预防要点 · 关键数字速记', WHITE);
const nums = [
  ['3h / 2h', '学龄前每日户外 3 小时；\n中小学生 2 小时（周 ≥14h）'],
  ['30–40 min', '单次近距离用眼上限，\n之后休息 10–20 分钟'],
  ['33 cm', '书本离眼一尺；\n阅读距离下限'],
  ['≥300 lux', '桌面平均照度；\n夜间卧室 ＜10 lux'],
  ['1尺1拳1寸', '眼距书本一尺、胸距桌一拳、\n指距笔尖一寸'],
  ['4×/50/40', '电视≥4倍对角线、\n电脑≥50cm、手机≥40cm'],
];
let nx = M, nw = (W - 2 * M - 2 * 0.35) / 3, nh = 2.0;
nums.forEach((n, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = M + col * (nw + 0.35), y = 1.75 + row * (nh + 0.3);
  s.addShape(p.ShapeType.roundRect, { x, y, w: nw, h: nh, rectRadius: 0.09, fill: { color: '10454F' }, line: { color: '1E5A66', width: 1 } });
  s.addText(n[0], { x: x + 0.15, y: y + 0.2, w: nw - 0.3, h: 0.75, align: 'center', fontFace: HFONT, fontSize: 30, bold: true, color: AMBER });
  s.addText(n[1], { x: x + 0.15, y: y + 1.02, w: nw - 0.3, h: 0.85, align: 'center', fontFace: BFONT, fontSize: 12.5, color: 'D8E8EA' });
});

// ============ 11. 检查总览 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 03 · 相关检查', '筛查、建档与一般检查');
card(s, M, 1.62, W - 2 * M, 1.3, 'EAF5F1');
s.addText('建档管理', { x: M + 0.28, y: 1.75, w: 2.4, h: 0.4, fontFace: HFONT, fontSize: 15, bold: true, color: SEA });
s.addText('24 月龄起屈光筛查；自幼儿园起定期查视力、屈光度、眼轴、角膜曲率并监测眼底；建立视力与屈光发育档案，分档管理、个性化干预；高度近视家族史者重点随访。', { x: M + 0.28, y: 2.15, w: W - 2 * M - 0.56, h: 0.7, fontFace: BFONT, fontSize: 13.5, color: INK });
const g = [
  ['视力检查', '早期发现首选。5 米距离、中等光亮；先右后左。正常下限：3岁 0.5 / 4–5岁 0.6 / 6岁及以上 0.7'],
  ['裂隙灯', '眼睑、结膜、角膜、虹膜、前房、瞳孔、晶状体等'],
  ['眼位检查', '是否伴斜视及斜视度'],
];
let gy = 3.15;
g.forEach((it) => { card(s, M, gy, W - 2 * M, 1.02, CARD); s.addText(it[0], { x: M + 0.3, y: gy, w: 2.4, h: 1.02, valign: 'middle', fontFace: HFONT, fontSize: 15, bold: true, color: TEAL }); s.addText(it[1], { x: M + 2.9, y: gy, w: W - 2 * M - 3.2, h: 1.02, valign: 'middle', fontFace: BFONT, fontSize: 13.5, color: INK }); gy += 1.14; });

// ============ 12. 眼轴 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 03 · 相关检查', '眼轴长度：发育参考与增长界值');
const ax = [['出生', '≈ 16 mm'], ['6 岁', '≈ 22.5 mm'], ['15 岁', '≈ 23.4 mm']];
let axx = M, axw = (W - 2 * M - 2 * 0.4) / 3;
ax.forEach((a, i) => { const x = M + i * (axw + 0.4); card(s, x, 1.72, axw, 1.7, CARD); s.addText(a[0], { x: x + 0.2, y: 1.9, w: axw - 0.4, h: 0.45, align: 'center', fontFace: HFONT, fontSize: 17, bold: true, color: INK }); s.addText(a[1], { x: x + 0.2, y: 2.35, w: axw - 0.4, h: 0.9, align: 'center', fontFace: HFONT, fontSize: 30, bold: true, color: TEAL }); });
card(s, M, 3.72, W - 2 * M, 2.7, WHITE);
s.addText('生理性增长参考界值（超出提示进展风险高，需重点监测干预）', { x: M + 0.3, y: 3.9, w: W - 2 * M - 0.6, h: 0.4, fontFace: HFONT, fontSize: 15, bold: true, color: TEAL });
s.addText([
  { text: '6–10 岁：平均每年 ≤ 0.2 mm（或半年 ≤ 0.1 mm）；6 岁以下可略高于此值', options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } },
  { text: '10 岁以上：应低于上述值', options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } },
  { text: '12 岁以上青少年：每年 ≤ 0.1 mm', options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } },
  { text: '需结合年龄与屈光状态综合判断，鉴别生理性与病理性增长', options: { bullet: true, color: MUTED } },
], { x: M + 0.3, y: 4.35, w: W - 2 * M - 0.6, h: 2.0, fontFace: BFONT, fontSize: 14, color: INK, valign: 'top' });

// ============ 13. 眼底检查 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 03 · 相关检查', '眼底检查与散瞳指征');
card(s, M, 1.7, 5.9, 4.9, CARD);
s.addText('方法与标准', { x: M + 0.28, y: 1.88, w: 5.3, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: TEAL });
s.addText([
  { text: '彩色眼底照相、直接/间接检眼镜、前置镜等。', options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } },
  { text: '彩照标准：以视盘-黄斑中心连线中点为拍摄中心，曝光适中、对焦清晰。', options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } },
  { text: '＞300 度或已有近视性眼底病变（视盘旁萎缩弧、豹纹状眼底、Fuchs 斑、后巩膜葡萄肿、周边病变）者定期监测。', options: { bullet: true } },
], { x: M + 0.28, y: 2.35, w: 5.35, h: 4.1, fontFace: BFONT, fontSize: 13.5, color: INK, valign: 'top' });
card(s, 6.9, 1.7, 5.83, 4.9, 'FBF1EF');
s.addText('散瞳眼底检查重点指征', { x: 7.18, y: 1.88, w: 5.3, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: CORAL });
s.addText([
  { text: '视力低下、矫正不达同龄下限者', options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } },
  { text: '高度近视者', options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } },
  { text: '突发漂浮物感或闪光感者', options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } },
  { text: '屈光介质混浊、玻璃体色素颗粒/混浊，或高度近视合并视网膜脱离者', options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } },
  { text: '单眼确诊视网膜变性/裂孔/脱离，必须详查对侧眼', options: { bullet: true, bold: true } },
], { x: 7.18, y: 2.35, w: 5.35, h: 4.1, fontFace: BFONT, fontSize: 13.5, color: INK, valign: 'top' });

// ============ 14. 睫状肌麻痹验光 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 03 · 相关检查', '睫状肌麻痹验光（诊断金标准）');
s.addText('12 岁以下（尤其初次验光），或伴远视、斜视、弱视、较大散光，或调节不稳定/矫正视力异常难以解释者，应行睫状肌麻痹验光。结果为制定方案的重要依据，但并非最终处方。', { x: M, y: 1.55, w: W - 2 * M, h: 0.75, fontFace: BFONT, fontSize: 14, color: INK });
const dr = [
  ['1% 阿托品\n眼膏/凝胶', '麻痹最强、持续久，瞳孔恢复慢', '＜6 岁；远视/斜视/弱视优先', SEA],
  ['1% 环喷托酯\n滴眼液', '麻痹次之，作用时间较短', '不耐受阿托品者替代；7–12 岁', TEAL],
  ['复方托吡卡胺\n滴眼液', '持续短、麻痹最弱', '12–40 岁；也可用于 7–12 岁', AMBER],
];
let drx = M, drw = (W - 2 * M - 2 * 0.4) / 3;
dr.forEach((d, i) => { const x = M + i * (drw + 0.4); card(s, x, 2.45, drw, 3.55, CARD);
  s.addText(d[0], { x: x + 0.2, y: 2.65, w: drw - 0.4, h: 0.9, align: 'center', fontFace: HFONT, fontSize: 17, bold: true, color: d[3] });
  s.addText('特点', { x: x + 0.25, y: 3.65, w: drw - 0.5, h: 0.3, fontFace: BFONT, fontSize: 11, bold: true, color: MUTED });
  s.addText(d[1], { x: x + 0.25, y: 3.95, w: drw - 0.5, h: 0.85, fontFace: BFONT, fontSize: 13, color: INK });
  s.addText('适用', { x: x + 0.25, y: 4.85, w: drw - 0.5, h: 0.3, fontFace: BFONT, fontSize: 11, bold: true, color: MUTED });
  s.addText(d[2], { x: x + 0.25, y: 5.15, w: drw - 0.5, h: 0.8, fontFace: BFONT, fontSize: 13, color: INK });
});
s.addText('用药前排除禁忌证，告知畏光/视物模糊等及持续时间；用药后避免强光、指导安全用眼。', { x: M, y: 6.15, w: W - 2 * M, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED });

// ============ 15. 远视储备 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 03 · 相关检查', '远视储备参考与视功能');
s.addText('远视储备参考标准（睫状肌麻痹后）', { x: M, y: 1.55, w: 11, h: 0.4, fontFace: HFONT, fontSize: 15, bold: true, color: TEAL });
const rs = [['6 岁', '≈ +1.38 D', '约 138 度\n（另一参考 ≈150 度 / +1.50 D）'], ['年均消耗', '≈ +0.12 D', '约 12 度/年\n（另一参考 ≈25 度 / +0.25 D）'], ['8–9 岁', '消耗高峰', '≈ 37 度/年'], ['15 岁', '≈ +0.31 D', '约 31 度']];
let rx = M, rw = (W - 2 * M - 3 * 0.3) / 4;
rs.forEach((r, i) => { const x = M + i * (rw + 0.3); card(s, x, 2.0, rw, 2.05, CARD);
  s.addText(r[0], { x: x + 0.1, y: 2.14, w: rw - 0.2, h: 0.4, align: 'center', fontFace: HFONT, fontSize: 15, bold: true, color: INK });
  s.addText(r[1], { x: x + 0.1, y: 2.54, w: rw - 0.2, h: 0.58, align: 'center', fontFace: HFONT, fontSize: 21, bold: true, color: TEAL });
  s.addText(r[2], { x: x + 0.08, y: 3.16, w: rw - 0.16, h: 0.78, align: 'center', valign: 'top', fontFace: BFONT, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.0 });
});
s.addText('注：两组远视储备参考值分别见于指南不同章节，此处一并列出。', { x: M, y: 4.12, w: W - 2 * M, h: 0.3, fontFace: BFONT, fontSize: 10.5, italic: true, color: MUTED });
card(s, M, 4.5, W - 2 * M, 1.05, 'EAF5F1');
s.addText('关键：不盲目追求高远视储备，重在减缓消耗速度（户外、课间休息、良好用眼习惯）。储备超上限警惕远视/弱视。', { x: M + 0.3, y: 4.5, w: W - 2 * M - 0.6, h: 1.05, valign: 'middle', fontFace: BFONT, fontSize: 13.5, color: INK });
card(s, M, 5.7, W - 2 * M, 0.9, WHITE);
s.addText('视功能检查', { x: M + 0.3, y: 5.7, w: 2.4, h: 0.9, valign: 'middle', fontFace: HFONT, fontSize: 15, bold: true, color: TEAL });
s.addText('调节幅度、调节灵活度等。', { x: M + 2.9, y: 5.7, w: 8, h: 0.9, valign: 'middle', fontFace: BFONT, fontSize: 14, color: INK });

// ============ 16. 框架眼镜 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 04 · 矫正与控制', '框架眼镜');
card(s, M, 1.7, 5.9, 4.9, CARD);
s.addText('单焦框架眼镜', { x: M + 0.28, y: 1.9, w: 5.3, h: 0.4, fontFace: HFONT, fontSize: 17, bold: true, color: TEAL });
s.addText([
  { text: '临床最常见类型，最简单、安全的矫正器具。', options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
  { text: '近视患儿至少每半年复查一次。', options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
  { text: '避免过矫——过矫可诱发调节过度、加速近视发展。', options: { bullet: true, bold: true, color: CORAL } },
], { x: M + 0.28, y: 2.4, w: 5.35, h: 4.0, fontFace: BFONT, fontSize: 14, color: INK, valign: 'top' });
card(s, 6.9, 1.7, 5.83, 4.9, 'EAF5F1');
s.addText('特殊光学设计（如周边离焦）', { x: 7.18, y: 1.9, w: 5.3, h: 0.4, fontFace: HFONT, fontSize: 17, bold: true, color: SEA });
s.addText('适用人群', { x: 7.18, y: 2.42, w: 5.3, h: 0.3, fontFace: BFONT, fontSize: 12, bold: true, color: MUTED });
s.addText('进展性近视的儿童青少年；有强烈近视防控需求的屈光不正者。目前无绝对年龄限制。', { x: 7.18, y: 2.72, w: 5.35, h: 1.0, fontFace: BFONT, fontSize: 13.5, color: INK });
s.addText('主要禁忌证', { x: 7.18, y: 3.85, w: 5.3, h: 0.3, fontFace: BFONT, fontSize: 12, bold: true, color: CORAL });
s.addText('显性斜视或间歇性外斜视、双眼视功能异常、无法耐受屈光参差的框架配戴、弱视、矫正视力不佳等。', { x: 7.18, y: 4.15, w: 5.35, h: 2.2, fontFace: BFONT, fontSize: 13.5, color: INK, valign: 'top' });

// ============ 17. 接触镜 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 04 · 矫正与控制', '角膜接触镜');
const cl = [
  ['软性接触镜', SEA, '可矫正近视，部分可恢复双眼视功能、促进视觉发育；多焦软镜可一定程度延缓进展。以控近为目的者需排除其他眼部/全身禁忌，自理欠佳者由家长协助护理并定期复查。'],
  ['硬性透气性接触镜 RGP', TEAL, '适用近视、远视、散光及屈光参差；特别推荐圆锥角膜、角膜瘢痕所致不规则散光。综合年龄、适应证、依从性与护理能力审慎评估。'],
  ['角膜塑形镜 OK 镜', AMBER, '逆几何设计 RGP，暂时性降低近视度数，属非手术物理矫正，可有效延缓眼轴增长。适用 8 岁及以上；须严格随访、监护人配合、规范护理，预防感染，不适立即就诊。'],
];
let cy2 = 1.62;
cl.forEach((c) => { card(s, M, cy2, W - 2 * M, 1.55, CARD);
  s.addText(c[0], { x: M + 0.3, y: cy2 + 0.14, w: 3.3, h: 1.3, valign: 'top', fontFace: HFONT, fontSize: 17, bold: true, color: c[1] });
  s.addText(c[2], { x: M + 3.8, y: cy2 + 0.12, w: W - 2 * M - 4.1, h: 1.32, valign: 'middle', fontFace: BFONT, fontSize: 13, color: INK });
  cy2 += 1.67; });

// ============ 18. 药物 + 中医 + 随访 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 04 · 矫正与控制', '药物、中医与随访管理');
card(s, M, 1.62, 7.7, 3.35, CARD);
s.addText('低浓度阿托品滴眼液（处方药，唯一循证有效延缓进展药物）', { x: M + 0.28, y: 1.78, w: 7.2, h: 0.4, fontFace: HFONT, fontSize: 15, bold: true, color: TEAL });
s.addText([
  { text: '适用：6–12 岁、100–400 度、散光 ≤150 度、屈光参差 ≤150 度。', options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
  { text: '眼科医师指导下个体化；每 3–6 个月复查屈光度、眼轴、瞳孔、调节及不良反应。', options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
  { text: '停药/减量警惕反弹；年进展 ≥50 度可重启或联合。', options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
  { text: '进展迅速（≥75 度/年 或 眼轴 ≥0.40 mm/年）可与光学矫正联合。', options: { bullet: true } },
], { x: M + 0.28, y: 2.2, w: 7.25, h: 2.7, fontFace: BFONT, fontSize: 13, color: INK, valign: 'top' });
card(s, 8.5, 1.62, 4.23, 3.35, WHITE);
s.addText('中医防控', { x: 8.75, y: 1.78, w: 3.7, h: 0.4, fontFace: HFONT, fontSize: 15, bold: true, color: SEA });
s.addText('眼保健操可改善调节功能、缓解视疲劳，有助延缓发生发展；需专业指导下取穴准确、手法得当、长期坚持。亦可用中医穴位电刺激等外治法。', { x: 8.75, y: 2.2, w: 3.75, h: 2.7, fontFace: BFONT, fontSize: 13, color: INK, valign: 'top' });
card(s, M, 5.15, W - 2 * M, 1.35, 'EAF5F1');
s.addText('随访管理', { x: M + 0.3, y: 5.3, w: 2.4, h: 0.4, fontFace: HFONT, fontSize: 15, bold: true, color: SEA });
s.addText('建议每半年随访评估控制效果。控制良好标准：眼轴增长 ≤0.20 mm/年 或 屈光年进展 ≤50 度/年；欠佳者需查因并针对性调整方案。', { x: M + 0.3, y: 5.7, w: W - 2 * M - 0.6, h: 0.7, fontFace: BFONT, fontSize: 13.5, color: INK });

// ============ 19. 病理性近视治疗 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 05 · 病理性近视', '并发症的治疗措施');
s.addText('眼轴持续增长、后巩膜葡萄肿进展，继发漆裂纹、CNV、黄斑萎缩/劈裂/裂孔、视网膜下出血、变性及孔源性视网膜脱离，并增加青光眼、白内障、斜视风险。', { x: M, y: 1.55, w: W - 2 * M, h: 0.75, fontFace: BFONT, fontSize: 13.5, color: MUTED });
const tx = [
  ['激光光凝', '周边视网膜裂孔、变性和/或玻璃体牵引 → 预防性视网膜激光，降低视网膜脱离风险', SEA],
  ['抗 VEGF', '病理性近视继发黄斑下脉络膜新生血管（CNV）→ 玻璃体腔注射抗 VEGF，有效', TEAL],
  ['手术治疗', '后巩膜加固术（PSR，证据等级有限、非常规推荐，严格掌握适应证）；巩膜扣带术；玻璃体手术（复杂 RD、黄斑裂孔性 RD 等）', CORAL],
];
let txy = 2.4;
tx.forEach((t) => { card(s, M, txy, W - 2 * M, 1.28, t[2] === CORAL ? 'FBF1EF' : CARD);
  s.addText(t[0], { x: M + 0.3, y: txy, w: 2.9, h: 1.28, valign: 'middle', fontFace: HFONT, fontSize: 17, bold: true, color: t[2] });
  s.addText(t[1], { x: M + 3.3, y: txy + 0.1, w: W - 2 * M - 3.6, h: 1.08, valign: 'middle', fontFace: BFONT, fontSize: 13, color: INK });
  txy += 1.4; });

// ============ 20. 成人手术 ============
s = p.addSlide(); bgLight(s);
header(s, 'Part 06 · 成人近视', '成人手术矫正');
card(s, M, 1.62, W - 2 * M, 1.15, 'FBF1EF');
s.addText('原则', { x: M + 0.3, y: 1.62, w: 1.6, h: 1.15, valign: 'middle', fontFace: HFONT, fontSize: 15, bold: true, color: CORAL });
s.addText('主要适用 18 岁以上、屈光稳定人群（≥2 年、每年变化 ≤50 度）。手术仅矫正屈光度，未治愈近视——术后仍需重视用眼卫生并定期监测眼底。', { x: M + 2.0, y: 1.62, w: W - 2 * M - 2.3, h: 1.15, valign: 'middle', fontFace: BFONT, fontSize: 13.5, color: INK });
card(s, M, 2.95, 5.9, 3.65, CARD);
s.addText('激光角膜屈光手术', { x: M + 0.28, y: 3.12, w: 5.3, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: TEAL });
s.addText([
  { text: '板层手术：LASIK / FS-LASIK（制作角膜瓣）、SMILE（飞秒微小切口透镜取出）', options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
  { text: '表层手术：PRK（准分子激光屈光性角膜切削）', options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
  { text: '需符合角膜厚度/形态、屈光度及切削深度等标准', options: { bullet: true, color: MUTED } },
], { x: M + 0.28, y: 3.56, w: 5.35, h: 2.9, fontFace: BFONT, fontSize: 13.5, color: INK, valign: 'top' });
card(s, 6.9, 2.95, 5.83, 3.65, WHITE);
s.addText('有晶状体眼人工晶状体植入（ICL）', { x: 7.18, y: 3.12, w: 5.3, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: SEA });
s.addText('适用于近视度数较高、不愿配戴框架镜、但角膜条件不适合激光手术且符合适应证者。保留自然晶状体，于后房植入负度数人工晶状体矫正近视。', { x: 7.18, y: 3.6, w: 5.35, h: 2.8, fontFace: BFONT, fontSize: 13.5, color: INK, valign: 'top' });

// ============ 21. 总结 ============
s = p.addSlide(); bgDark(s);
s.addShape(p.ShapeType.ellipse, { x: 11.5, y: -2.2, w: 3.6, h: 3.6, fill: { color: '0F434F' }, line: { type: 'none' } });
s.addText('要点回顾', { x: M, y: 0.55, w: 10, h: 0.4, fontFace: BFONT, fontSize: 13, color: SEA, bold: true, charSpacing: 2 });
s.addText('核心要点速记', { x: M, y: 0.95, w: 11, h: 0.7, fontFace: HFONT, fontSize: 32, bold: true, color: WHITE });
const sum = [
  ['早筛早建档', '24 月龄起屈光筛查，建立屈光发育档案，分档管理'],
  ['分期防控', '前驱→发展→高度→病理；发展期年进展>50度或眼轴>0.20mm/年'],
  ['保护远视储备', '重在减缓消耗：户外 3h/2h、控近距离、良好用眼习惯'],
  ['金标准验光', '睫状肌麻痹验光；按年龄选阿托品/环喷托酯/托吡卡胺'],
  ['三大控制手段', '特殊光学设计镜、OK镜（≥8岁）、低浓度阿托品（6–12岁）'],
  ['随访标准', '每半年；控制良好=眼轴≤0.20mm/年 或 度数≤50度/年'],
];
let smy = 1.95, smw = (W - 2 * M - 0.4) / 2;
sum.forEach((t, i) => { const col = i % 2, row = Math.floor(i / 2); const x = M + col * (smw + 0.4), y = smy + row * 1.5;
  s.addShape(p.ShapeType.roundRect, { x, y, w: smw, h: 1.32, rectRadius: 0.08, fill: { color: '10454F' }, line: { color: '1E5A66', width: 1 } });
  circle(s, x + 0.25, y + 0.3, 0.72, String(i + 1), SEA);
  s.addText(t[0], { x: x + 1.15, y: y + 0.16, w: smw - 1.3, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: AMBER });
  s.addText(t[1], { x: x + 1.15, y: y + 0.58, w: smw - 1.35, h: 0.65, fontFace: BFONT, fontSize: 12.5, color: 'D8E8EA' });
});
s.addText('资料来源：《近视防治指南（2026 年版）》· 国家卫生健康委员会', { x: M, y: 7.05, w: 10.4, h: 0.35, fontFace: BFONT, fontSize: 10.5, color: '86A6AB' });

// ---- page numbers on every slide ----
pages.forEach((o, i) => {
  o.s.addText(String(i + 1), { x: 12.5, y: 7.02, w: 0.63, h: 0.34, align: 'right', fontFace: BFONT, fontSize: 11, color: o.dark ? '9BBFC4' : MUTED });
});

p.writeFile({ fileName: '/tmp/claude-0/-home-user-cinderella/f3a0804c-4e87-50fd-919d-4b62bfca90a7/scratchpad/myopia_guideline_2026.pptx' }).then(f => console.log('OK', f));
