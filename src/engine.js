/* ================= LOGIC START ================= */
function newGame(rg, wl, asp, gender) {
  var name = gender === "f" ? pick(rg.girls) : pick(rg.boys);
  var g = {
    region: rg, wealthTier: wl, asp: asp, gender: gender, name: name,
    age: 0, stage: 0, alive: true, cause: "", choices: 0,
    st: { hp: 62 + (wl.hp||0) + (asp.hp||0), iq: 50 + (asp.iq||0) + (wl.iq||0),
          ch: 50 + (asp.charm||0), we: wl.wealth, ha: 55 + (asp.happy||0), fa: 30 },
    rel: { fam: 70, fri: 40, lov: 0 },
    seen: {}, log: [], born: false, motherAlive: true, frail: false,
    life: { school: true, work: false, married: false, kids: false, away: false, house: false }
  };
  g.log.push({ age: 0, text: "你出生在" + rg.place + "，父亲是" + rg.fatherJob + "，母亲是" + rg.motherJob + "，家境" + wl.name + "。" });
  return g;
}
function applyFx(g, fx) {
  if (!fx) return;
  var map = { hp:"hp", iq:"iq", ch:"ch", we:"we", ha:"ha", fa:"fa" };
  for (var k in fx) {
    if (map[k]) g.st[map[k]] = clamp(g.st[map[k]] + fx[k]);
    else if (k === "fam") g.rel.fam = clamp(g.rel.fam + fx[k]);
    else if (k === "fri") g.rel.fri = clamp(g.rel.fri + fx[k]);
    else if (k === "lov") g.rel.lov = clamp(g.rel.lov + fx[k]);
  }
}
function deathRisk(age, hp, years) {
  /* 年死亡率（ hazard ）随年龄指数上升，健康差成倍放大；按本次推进年数折算 */
  var h;
  if (age < 18) h = 0.0008;
  else h = 0.00045 * Math.exp(Math.max(0, age - 20) / 12.5);
  if (hp < 30) h *= 2.2; if (hp < 15) h *= 4; if (hp <= 0) return 1;
  if (age >= 105) h = Math.max(h, 0.45);
  return Math.min(1, 1 - Math.exp(-h * (years || 2.5)));
}
function causeOf(g) {
  if (g.st.hp <= 5) return "病逝";
  if (g.age < 40 && Math.random() < 0.3) return "意外离世";
  if (g.age >= 75) return "寿终正寝";
  return "病逝";
}
/* 出生事件：难产抉择（家人替做），返回结果说明 */
function birthChoice(g, idx) {
  g.born = true; g.choices++;
  if (idx === 0) { /* 保孩子 */
    g.motherAlive = false; applyFx(g, { hp: 3, fam: -12, ha: -6 });
    g.log.push({ age: 0, text: "难产之夜，家人选择拼尽全力保你——母亲没能挺过来。你在没有母亲的家里长大，这件事成年后才知道。" });
    return "产房的灯亮了一整夜。天亮时，你活了下来，母亲走了。";
  } else if (idx === 1) { /* 保产妇 */
    g.frail = true; applyFx(g, { hp: -14, fam: 10, ha: 2 });
    g.log.push({ age: 0, text: "难产之夜，家人选择先保母亲。你活了下来，但自小体弱多病。" });
    return "医生先保住了母亲。你也活了下来，只是身子骨从小就弱。";
  } else { /* 送大医院 */
    applyFx(g, { hp: 6, we: -14, fam: 4 });
    if (g.st.we < 15) g.st.we = 15;
    g.log.push({ age: 0, text: "难产之夜，家人连夜把母亲送往大医院，母子平安——家里为此掏空了积蓄。" });
    return "连夜的转院救了两个人。天亮时母子平安，只是家里的积蓄见了底。";
  }
}
/* 事件/选项条件检查：req 里每个 状态键:期望值 都要与 g.life 对上（期望 false 表示「该状态不成立才行」） */
function condPass(g, req) {
  if (!req) return true;
  for (var k in req) { if (!!g.life[k] !== !!req[k]) return false; }
  return true;
}
function pickEvent(g) {
  var stg = stageOf(g.age); g.stage = stg;
  /* 志向事件：青年/中年各最多触发一次（创业事件要求未婚单干者不成立即可——打工者/创业者都可，需在工作） */
  var ae = ASP_EVENTS[g.asp.id];
  if (ae && (stg === 2 || stg === 3) && !g.seen["asp"] && g.life.work && Math.random() < 0.4) { g.seen["asp"] = 1; return Object.assign({ aspEv: true }, ae); }
  var pool = EVENTS.filter(function (e) {
    if (e.st !== stg || g.seen[e.title]) return false;
    if (e.cond && g.age < e.cond.minAge) return false;
    if (!condPass(g, e.req)) return false;
    return true;
  });
  if (pool.length && Math.random() < 0.78) { var e = pick(pool); g.seen[e.title] = 1; return e; }
  var rp = RANDOM_EVENTS.filter(function (e) { return !g.seen["r:" + e.title]; });
  if (rp.length) { var r = pick(rp); g.seen["r:" + r.title] = 1; return r; }
  if (pool.length) { var e2 = pick(pool); g.seen[e2.title] = 1; return e2; }
  return null;
}
function doChoice(g, ev, idx) {
  var c = ev.ch[idx]; if (!c) return "";
  if (c.condAsp && g.asp.id !== c.condAsp) { /* 不合志向的选项降级为普通效果 */ }
  if (c.set) for (var k in c.set) g.life[k] = c.set[k];
  g.lastChoiceIdx = idx; g.lastEventTitle = ev.title;
  applyFx(g, c.fx); g.choices++;
  g.log.push({ age: Math.floor(g.age), text: c.log });
  return c.log;
}
/* 推进一格时间；返回 {died:boolean} */
function advance(g) {
  var s = STAGES[stageOf(g.age)];
  var yrs = rnd(s.stepMin, s.stepMax);
  g.age += yrs;
  if (g.age > 45) g.st.hp = clamp(g.st.hp - rnd(0, 1.6));
  if (g.age > 65) g.st.hp = clamp(g.st.hp - rnd(0.6, 2.4));
  if (Math.random() < deathRisk(g.age, g.st.hp, yrs)) {
    g.alive = false; g.cause = causeOf(g);
    g.log.push({ age: Math.floor(g.age), text: "你在" + Math.floor(g.age) + "岁那年" + g.cause + "，这一生落幕。" });
    return true;
  }
  return false;
}
function lifeTitle(g) {
  var s = g.st;
  if (g.age >= 90) return "长寿圆满 · 人瑞";
  if (s.fa >= 78) return "声名远扬的一生";
  if (s.we >= 85) return "富甲一方的一生";
  if (g.asp.id === "sci" && s.iq >= 75) return "求索真理的一生";
  if (g.asp.id === "trav" && s.ha >= 70) return "走遍天下的一生";
  if (g.rel.fam >= 88) return "儿孙满堂的一生";
  if (s.ha >= 80) return "快活自在的一生";
  if (g.age < 35) return "戛然而止的一生";
  return "平凡而真实的一生";
}
/* 无界面自动模拟：随机一局，返回终年 */
function simulateOne() {
  var g = newGame(pick(REGIONS), pick(WEALTHS), pick(ASPS), Math.random() < 0.5 ? "m" : "f");
  birthChoice(g, ri(0, 2));
  var guard = 0;
  while (g.alive && guard++ < 500) {
    if (advance(g)) break;
    var ev = pickEvent(g);
    if (ev) doChoice(g, ev, ri(0, ev.ch.length - 1));
  }
  if (guard >= 500) throw new Error("simulation guard tripped");
  return g;
}
function simulate(n) {
  var ages = [], titles = {};
  for (var i = 0; i < n; i++) { var g = simulateOne(); ages.push(g.age); var t = lifeTitle(g); titles[t] = (titles[t] || 0) + 1; }
  ages.sort(function (a, b) { return a - b; });
  return { n: n, min: Math.floor(ages[0]), max: Math.floor(ages[ages.length - 1]),
           avg: Math.round(ages.reduce(function (a, b) { return a + b; }, 0) / n), titles: titles };
}
if (typeof window !== "undefined") window.__simulate = simulate;
if (typeof module !== "undefined") module.exports = { simulate: simulate, newGame: newGame };
/* ================= LOGIC END ================= */
