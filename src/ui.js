/* ================= UI START ================= */
(function () {
  if (typeof document === "undefined") return;
  var $ = function (id) { return document.getElementById(id); };
  var sel = { region: null, wealth: null, asp: null };
  function buildOpts(el, items, key, labelFn) {
    var rndBtn = document.createElement("button");
    rndBtn.className = "opt rnd"; rndBtn.textContent = "随机";
    rndBtn.onclick = function () { sel[key] = null; refreshOpts(); rollWho(); };
    el.appendChild(rndBtn);
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.className = "opt"; b.textContent = labelFn(it); b.dataset.id = it.id;
      b.onclick = function () { sel[key] = it; refreshOpts(); rollWho(); };
      el.appendChild(b);
    });
    el._items = items; el._key = key;
  }
  function refreshOpts() {
    [["optRegion", "region"], ["optWealth", "wealth"], ["optAsp", "asp"]].forEach(function (pair) {
      var el = $(pair[0]);
      Array.prototype.forEach.call(el.children, function (b, i) {
        var cur = sel[pair[1]];
        b.classList.toggle("sel", i === 0 ? !cur : (cur && b.dataset.id === cur.id));
      });
    });
  }
  function curSetup() {
    return {
      region: sel.region || pick(REGIONS),
      wealth: sel.wealth || pick(WEALTHS),
      asp: sel.asp || pick(ASPS)
    };
  }
  function rollWho() {
    var s = curSetup(), w = $("whoami");
    w.style.display = "block";
    w.innerHTML = "这一世，你将出生在 <b>" + s.region.name + "</b>（" + s.region.place + "），家境 <b>" + s.wealth.name + "</b>——" +
      s.wealth.desc + "；你天生向往 <b>" + s.asp.name + "</b>——" + s.asp.desc + "。<br>点「开始这一生」，从出生那一夜开始。";
  }
  buildOpts($("optRegion"), REGIONS, "region", function (r) { return r.name; });
  buildOpts($("optWealth"), WEALTHS, "wealth", function (w) { return w.name; });
  buildOpts($("optAsp"), ASPS, "asp", function (a) { return a.name; });
  refreshOpts(); rollWho();
  $("optRegion").addEventListener("click", function () { setTimeout(rollWho, 0); });
  $("optWealth").addEventListener("click", function () { setTimeout(rollWho, 0); });
  $("optAsp").addEventListener("click", function () { setTimeout(rollWho, 0); });

  var G = null, curEv = null, birthStep = 0;
  var STATDEF = [["hp", "健康"], ["iq", "智力"], ["ch", "魅力"], ["we", "财富"], ["ha", "幸福"], ["fa", "声望"]];
  function renderStats() {
    $("ageRow").innerHTML = "<span id='agebox'>你 <b>" + Math.floor(G.age) + "</b> 岁 · " + STAGES[stageOf(G.age)].name + " · " + G.name + "</span>" +
      "<span class='rel'>亲情 " + G.rel.fam + "</span><span class='rel'>友情 " + G.rel.fri + "</span><span class='rel'>爱情 " + G.rel.lov + "</span>";
    $("statRow").innerHTML = STATDEF.map(function (d) {
      var v = G.st[d[0]];
      return "<span class='stat" + (v < 25 ? " low" : "") + "'>" + d[1] + "<span class='bar'><i style='width:" + v + "%'></i></span>" + v + "</span>";
    }).join("");
  }
  function renderLog() {
    $("log").innerHTML = G.log.slice().reverse().map(function (e) {
      return "<div><span class='yr'>" + e.age + " 岁</span>" + e.text + "</div>";
    }).join("");
  }
  var waitTimer = null;
  function stopWait() { if (waitTimer) { clearInterval(waitTimer); waitTimer = null; } }
  function startWait() {
    stopWait();
    var cap = $("sceneCap");
    var qi = Math.floor(Math.random() * QUOTES.length);
    var cards = (LOCALE_CARDS[G.region.id] || []).slice();
    var ci = Math.floor(Math.random() * cards.length);
    var flip = false;
    function tick() {
      cap.textContent = "正在生成相应图片，请等待……\n" + (flip ? cards[ci++ % cards.length] : QUOTES[qi++ % QUOTES.length]);
      flip = !flip;
    }
    tick();
    waitTimer = setInterval(tick, 5000);
  }
  function setScene(img, cap, motif) {
    stopWait();
    var w = $("sceneImgWrap");
    w.querySelectorAll("img").forEach(function (i) { i.remove(); });
    var m = $("sceneMotif");
    if (img) {
      var im = document.createElement("img"); im.src = img; im.alt = "";
      w.insertBefore(im, w.firstChild); m.style.display = "none";
    } else { m.style.display = "block"; m.textContent = motif || G.region.motif; }
    $("sceneCap").textContent = cap || "";
  }
  function showChoices(list, handler) {
    var box = $("choices"); box.innerHTML = "";
    $("nextBtn").style.display = "none";
    list.forEach(function (c, i) {
      var b = document.createElement("button");
      b.className = "choice"; b.innerHTML = c.t + (c.hint ? "<small>" + c.hint + "</small>" : "");
      b.onclick = function () { handler(i); };
      box.appendChild(b);
    });
  }
  function clearChoices(showNext) {
    $("choices").innerHTML = "";
    $("nextBtn").style.display = showNext ? "inline-block" : "none";
  }
  /* 出生漫画：4 格逐格点过，再抉择 */
  var BIRTH_PANELS_ASIA = ["assets/panels/panel1-rainy-night.jpg", "assets/panels/panel2-corridor.jpg", "assets/panels/panel3-doctor.jpg", "assets/panels/panel4-dawn.jpg"];
  var BIRTH_PANELS_EU = ["assets/panels/eu-panelA-rainy-night.jpg", "assets/panels/eu-panelB-doctor.jpg"];
  var BIRTH_CAPS = ["暴雨夜，妻子难产送医——父亲一路狂奔，冲进医院。", "产房外的走廊，钟走得格外慢，每一分钟都像一年。",
                    "医生：情况危急。保大人，还是保孩子？你必须马上决定。", "天快亮了。这一夜的选择，会跟着这个孩子走完一生。"];
  function startBirth() {
    var panels = G.region.pack === "eu" ? BIRTH_PANELS_EU : BIRTH_PANELS_ASIA;
    birthStep = 0;
    $("evtTitle").textContent = "样卡 001 · 出生 —— 难产";
    function showPanel() {
      var p = panels[Math.min(birthStep, panels.length - 1)];
      var cap = BIRTH_CAPS[Math.min(birthStep, BIRTH_CAPS.length - 1)];
      setScene(p, cap);
      $("narr").innerHTML = "你尚未出生。这一夜的决定，由你的家人替你做。<span class='who'>（点下面按钮看下一格）</span>";
      if (birthStep < panels.length - 1 + (panels === BIRTH_PANELS_EU ? 1 : 0) && birthStep < 3) {
        showChoices([{ t: "下一格 →" }], function () { birthStep++; showPanel(); });
      } else {
        $("narr").innerHTML = "医生把同意书递到父亲手里，笔尖在抖。<span class='who'>替父亲做决定：</span>";
        showChoices([
          { t: "A 保孩子", hint: "拼尽全力保住孩子，母亲可能不在了" },
          { t: "B 保产妇", hint: "先保住母亲，孩子自小体弱" },
          { t: "C 拼一把，连夜送大医院", hint: "两个都保的机会最大，家底掏空" }
        ], function (i) {
          startWait();
          var res = birthChoice(G, i);
          $("evtTitle").textContent = "你出生了";
          setScene(panels[panels.length - 1], "");
          $("narr").textContent = res + "\n\n你好，" + G.name + "。这一生，开始了。";
          clearChoices(true); renderStats(); renderLog();
        });
      }
    }
    showPanel();
  }
  /* 联网生成情景插图：选完人生、事件出现时才按需生成（只生成这一局遇到的），失败回退文字场景 */
  var imgCache = {}, sceneSeq = 0;
  function personPhrase() {
    var st = stageOf(G.age), f = G.gender === "f";
    return ["a small child with young parents", f ? "a teenage girl" : "a teenage boy",
            f ? "a young woman" : "a young man", f ? "a middle-aged woman" : "a middle-aged man",
            f ? "an older woman with grey hair" : "an older man with grey hair",
            f ? "a very old woman" : "a very old man"][st];
  }
  function sceneUrlFor(ev) {
    var base = IMG_PROMPTS[ev.title]; if (!base) return null;
    var prompt = "anime style cinematic illustration. " + base + ". Setting: " + REGION_IMG[G.region.id] +
      ". Main figure: " + personPhrase() + ", " + REGION_LOOK[G.region.id] +
      ", seen from behind or in silhouette, face not visible. Atmospheric lighting, muted colors, no text.";
    var h = 7, key = ev.title + "|" + G.region.id + "|" + G.gender;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000;
    return "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) +
      "?width=1024&height=576&seed=" + h + "&nologo=true";
  }
  function setSceneForEvent(ev) {
    var url = sceneUrlFor(ev);
    if (!url) { setScene(null, "", ev.motif || G.region.motif); return; }
    if (imgCache[url]) { setScene(url, ""); return; }
    setScene(null, "", ev.motif || G.region.motif); startWait();
    var my = ++sceneSeq;
    var im = new Image();
    im.onload = function () { imgCache[url] = 1; if (my === sceneSeq) setScene(url, ""); };
    im.onerror = function () { if (my === sceneSeq) setScene(null, "", ev.motif || G.region.motif); };
    im.src = url;
  }
  function step() {
    if (!G.alive) return;
    if (advance(G)) { renderStats(); renderLog(); return die(); }
    curEv = pickEvent(G);
    renderStats();
    if (!curEv) { $("evtTitle").textContent = ""; $("narr").textContent = "日子平平静静地往前走……"; setScene(null, "", G.region.motif); clearChoices(true); return; }
    $("evtTitle").textContent = curEv.title;
    setSceneForEvent(curEv);
    $("narr").textContent = curEv.scene;
    var chs = curEv.ch.filter(function (c) { return !c.condAsp || c.condAsp === G.asp.id || true; });
    showChoices(chs.map(function (c) { return { t: c.t }; }), function (i) {
      var realIdx = curEv.ch.indexOf(chs[i]);
      var res = doChoice(G, curEv, realIdx);
      $("narr").textContent = res;
      $("evtTitle").textContent = "";
      clearChoices(true); renderStats(); renderLog();
    });
  }
  function die() {
    $("setup").style.display = "none"; $("stage").style.display = "none";
    var s = $("summary"); s.style.display = "block";
    $("sumTitle").textContent = lifeTitle(G);
    $("sumAge").textContent = G.name + " · 终年 " + Math.floor(G.age) + " 岁 · " + G.cause + " · 出生于" + G.region.name;
    $("sumGrid").innerHTML =
      "<div>健康 " + G.st.hp + "　智力 " + G.st.iq + "　魅力 " + G.st.ch + "</div>" +
      "<div>财富 " + G.st.we + "　幸福 " + G.st.ha + "　声望 " + G.st.fa + "</div>" +
      "<div>亲情 " + G.rel.fam + "　友情 " + G.rel.fri + "　爱情 " + G.rel.lov + "</div>" +
      "<div>一生抉择 " + G.choices + " 次 · 志向：" + G.asp.name + "</div>";
    $("sumLog").innerHTML = G.log.map(function (e) { return "<div><span style='color:#ffd98a'>" + e.age + " 岁</span>　" + e.text + "</div>"; }).join("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $("startBtn").onclick = function () {
    var s = curSetup();
    G = newGame(s.region, s.wealth, s.asp, Math.random() < 0.5 ? "m" : "f");
    $("setup").style.display = "none";
    $("stage").style.display = "block"; $("statbar").style.display = "block";
    renderStats(); renderLog(); startBirth();
  };
  $("nextBtn").onclick = function () { startWait(); step(); };
  $("againBtn").onclick = function () { location.reload(); };
})();
/* 自检钩子：#auto 自动玩完一局（供无头截图/冒烟测试，正常游玩无影响） */
(function () {
  if (typeof location === "undefined") return;
  if (location.hash !== "#auto" && location.hash !== "#auto2") return;
  window.addEventListener("load", function () {
    setTimeout(function () { document.getElementById("startBtn").click(); }, 300);
    if (location.hash === "#auto2") return;
    var t = setInterval(function () {
      var sum = document.getElementById("summary");
      if (sum && sum.style.display === "block") { window.__autoDone = true; clearInterval(t); return; }
      var chs = document.querySelectorAll("#choices .choice");
      if (chs.length) { chs[Math.floor(Math.random() * chs.length)].click(); return; }
      var nb = document.getElementById("nextBtn");
      if (nb && nb.style.display !== "none") nb.click();
    }, 220);
  });
})();
/* ================= UI END ================= */
