/* ============================================================
 *  RADWIMPS 詞解 — 站点逻辑
 *  路由： #/           首页
 *        #/album/<id>  专辑页
 *        #/song/<id>   歌曲页
 *        #/search?q=   搜索
 * ============================================================ */

(function () {
  'use strict';

  /* 视为"汉字"的字符范围：CJK 汉字 + 々〆〇 */
  var KANJI = '\\u4e00-\\u9fff\\u3400-\\u4dbf\\u3005-\\u3007';
  var SPEAKER = {
    male: '他的话',
    female: '她的话',
    chorus: '副歌 / 合唱',
    solo: '独白',
    note: '注'
  };

  var state = {
    albums: window.RW_ALBUMS || [],
    songs: [],
    opts: { kana: true, ro: true, zh: true, an: true },
    openAlbum: null
  };

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* 假名简写 漢字(かな) → ruby */
  function renderJp(text, withKana) {
    var s = esc(text);
    var re = new RegExp('([' + KANJI + ']+)\\(([^\\)]+)\\)', 'g');
    s = s.replace(re, function (m, kana, ruby) {
      return withKana ? '<ruby>' + kana + '<rt>' + ruby + '</rt></ruby>' : kana;
    });
    return s.replace(/\(([^)]+)\)/g, '');
  }

  /* 去掉假名标记，得到纯文本（搜索用） */
  function plain(text) {
    return String(text == null ? '' : text)
      .replace(/\(([^)]+)\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ');
  }

  /* 专辑色相 */
  function albumColor(al) {
    return (al && al.accent) ? al.accent : '#b04a3c';
  }

  /* 封面：albums.js 填了 cover 就加载图片（加载失败自动退回生成式封面），
     否则直接用 accent + mark 生成。mark 始终在 DOM 里，作为降级内容。
     eager=true 用于首屏（舞台/专辑页头部），列表里一律懒加载。 */
  function coverHtml(al, size, eager) {
    var cls = 'cover ' + (size || 'm');
    var accent = albumColor(al);
    var mark = '<span class="mk">' + esc((al && al.mark) ? al.mark : '·') + '</span>';
    if (al && al.cover) {
      return '<span class="' + cls + ' photo" style="--album:' + accent + '">' +
             '<img src="' + esc(al.cover) + '" alt="' + esc(al.title) + ' 封面"' +
             (eager ? '' : ' loading="lazy"') +
             ' decoding="async"' +
             ' onerror="this.parentNode.classList.add(\'noimg\')">' +
             mark + '</span>';
    }
    return '<span class="' + cls + '" style="--album:' + accent + '" aria-hidden="true">' + mark + '</span>';
  }

  function songById(id) {
    for (var i = 0; i < state.songs.length; i++) {
      if (state.songs[i].id === id) return state.songs[i];
    }
    return null;
  }

  function albumById(id) {
    for (var i = 0; i < state.albums.length; i++) {
      if (state.albums[i].id === id) return state.albums[i];
    }
    return null;
  }

  function songCount(album) {
    var n = 0;
    state.songs.forEach(function (s) { if (s.album === album.id) n++; });
    return n;
  }

  function lineCount(song) {
    var n = 0;
    (song.sections || []).forEach(function (sec) { n += (sec.lines || []).length; });
    return n;
  }

  function slug(s) {
    return String(s).replace(/[^\w\u4e00-\u9fff-]/g, '-');
  }

  /* ---------------- 加载歌曲数据 ---------------- */
  function loadSongs(done) {
    var files = window.RW_FILES || [];
    var i = 0;
    (function next() {
      if (i >= files.length) {
        state.songs = window.RW_SONGS || [];
        return done();
      }
      var src = files[i++];
      var el = document.createElement('script');
      el.src = src;
      el.onload = next;
      el.onerror = function () { console.warn('加载失败：' + src); next(); };
      document.head.appendChild(el);
    })();
  }

  /* ---------------- 侧边栏 ---------------- */
  function renderSidebar() {
    var groups = [
      { name: 'ORIGINAL ALBUMS', kind: 'album' },
      { name: 'SOUNDTRACKS', kind: 'ost' },
      { name: 'SINGLES / 其他', kind: 'single' }
    ];
    var html = '<a class="side-home" href="#/">首页 · 全部收录</a>';

    groups.forEach(function (g) {
      var list = state.albums.filter(function (a) { return (a.kind || 'album') === g.kind; });
      if (!list.length) return;
      html += '<div class="side-group">' + g.name + '</div>';
      list.forEach(function (a) {
        var n = songCount(a);
        var open = state.openAlbum === a.id;
        html += '<div class="album-item' + (open ? ' open' : '') + '">';
        html += '<div class="album-head' + (open ? ' active' : '') + '" data-album="' + a.id + '">' +
          '<span class="swatch" style="background:' + albumColor(a) + '"></span>' +
          '<span class="t jpfont">' + esc(a.title) + '</span>' +
          (a.total ? '<span class="y">' + n + '/' + a.total + '</span>' : '<span class="y">' + a.year + '</span>') +
          '<span class="arrow">' + (open ? '▾' : '▸') + '</span>' +
          '</div>';
        html += '<div class="track-list">';
        if (a.tracks && a.tracks.length) {
          a.tracks.forEach(function (t) {
            if (t.songId && songById(t.songId)) {
              html += '<div class="track done" data-song="' + t.songId + '">' +
                '<span class="no">' + t.no + '</span><span class="t jpfont">' + esc(t.title) + '</span></div>';
            } else {
              html += '<div class="track"><span class="no">' + t.no + '</span>' +
                '<span class="t jpfont">' + esc(t.title) + '</span></div>';
            }
          });
        } else {
          html += '<div class="pending-note">曲目表待补充' + (a.total ? '（共 ' + a.total + ' 曲）' : '') + '</div>';
          state.songs.filter(function (s) { return s.album === a.id; }).forEach(function (s) {
            html += '<div class="track done" data-song="' + s.id + '">' +
              '<span class="no">' + (s.trackNo || '·') + '</span>' +
              '<span class="t jpfont">' + esc(s.title) + '</span></div>';
          });
        }
        html += '</div></div>';
      });
    });

    document.getElementById('sidebar').innerHTML = html;

    document.getElementById('sidebar').querySelectorAll('.album-head').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.dataset.album;
        if (state.openAlbum === id) state.openAlbum = null; else state.openAlbum = id;
        location.hash = '#/album/' + id;
      });
    });
    document.getElementById('sidebar').querySelectorAll('.track.done').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        location.hash = '#/song/' + el.dataset.song;
      });
    });
  }

  function markSidebarCurrent() {
    var main = document.getElementById('sidebar');
    var home = main.querySelector('.side-home');
    if (home) {
      var h = location.hash;
      home.classList.toggle('active', !h || h === '#/' || h === '#' || h.indexOf('#/search') === 0);
    }
    main.querySelectorAll('.album-head').forEach(function (el) {
      el.classList.toggle('active', location.hash.indexOf('#/album/' + el.dataset.album) === 0);
    });
    main.querySelectorAll('.track.done').forEach(function (el) {
      el.classList.toggle('active', location.hash.indexOf('#/song/' + el.dataset.song) === 0);
    });
  }

  /* ---------------- 首页 ---------------- */
  function renderHome() {
    var totalLines = state.songs.reduce(function (n, s) { return n + lineCount(s); }, 0);
    var albumsCovered = {};
    state.songs.forEach(function (s) { if (s.album) albumsCovered[s.album] = 1; });

    var html = '';
    html += '<div class="hero">' +
      '<div class="sub">RADWIMPS 歌詞ノート</div>' +
      '<h1>一句一句，把 RADWIMPS 读明白</h1>' +
      '<p>按专辑收录，逐句标注假名与罗马音，配上中文直译和写法解读。' +
      '想看原文就关掉译文，想自测就关掉假名。</p>' +
      '<div class="kpis">' +
        '<div class="kpi"><div class="n">' + state.songs.length + '</div><div class="l">已收录</div></div>' +
        '<div class="kpi"><div class="n">' + Object.keys(albumsCovered).length + '</div><div class="l">涉及专辑</div></div>' +
        '<div class="kpi"><div class="n">' + totalLines + '</div><div class="l">逐句解读</div></div>' +
        '<div class="kpi"><div class="n">' + state.albums.length + '</div><div class="l">专辑档案</div></div>' +
      '</div></div>';

    /* 专辑墙：已有收录的专辑 */
    var touched = state.albums.filter(function (a) { return songCount(a) > 0; });
    if (touched.length) {
      html += '<div class="sec-title">专辑</div><div class="album-wall">';
      touched.forEach(function (a) {
        var n = songCount(a);
        var pct = a.total ? Math.round(n / a.total * 100) : 0;
        html += '<div class="album-tile" data-album="' + a.id + '" style="--album:' + albumColor(a) + '">' +
          coverHtml(a, 'm') +
          '<div class="txt">' +
            '<div class="t jpfont">' + esc(a.title) + '</div>' +
            '<div class="y">' + esc(a.date) + (a.total ? ' ・ ' + n + '/' + a.total + ' 曲' : '') + '</div>' +
            (a.total ? '<div class="prog"><i style="width:' + pct + '%"></i></div>' : '') +
          '</div>' +
          '</div>';
      });
      html += '</div>';
    }

    if (state.songs.length) {
      html += '<div class="sec-title">已收录的歌</div><div class="cards">';
      state.songs.forEach(function (s) {
        var al = albumById(s.album);
        html += '<div class="card" data-song="' + s.id + '" style="--album:' + albumColor(al) + '">' +
          coverHtml(al, 'm') +
          '<div class="card-text">' +
            '<div><span class="jp jpfont">' + esc(s.title) + '</span>' +
            (s.kana ? '<span class="kana jpfont"> ' + esc(s.kana) + '</span>' : '') + '</div>' +
            '<div class="meta">' + esc(al ? al.title : '未归档') +
            (s.trackNo ? ' ・ Track ' + s.trackNo : '') + '</div>' +
            '<div class="desc">' + esc(plain(s.lead || '')) + '</div>' +
          '</div>' +
          '</div>';
      });
      html += '</div>';
    }

    html += '<div class="sec-title">怎么加新歌</div>' +
      '<div class="essay">' +
      '<p style="margin-top:0">三步：<b>①</b> 复制 <code>songs/_template.js</code> 另存为 <code>songs/专辑-曲号-曲名.js</code>；' +
      '<b>②</b> 填歌词与解读（假名用「漢字(かな)」简写，不用手写 ruby 标签）；' +
      '<b>③</b> 把新文件路径写进 <code>data/manifest.js</code>，' +
      '再到 <code>data/albums.js</code> 给对应曲目加上 <code>songId</code>，刷新即可。</p>' +
      '<p>细节见站点根目录的 <code>README.md</code>。</p>' +
      '</div>';

    html += foot();
    document.getElementById('main').innerHTML = html;
    bindCards();
  }

  /* ---------------- 专辑页 ---------------- */
  function renderAlbum(album) {
    var mine = state.songs.filter(function (s) { return s.album === album.id; });
    var html = '<div class="crumb"><a href="#/">首页</a> › 专辑</div>';

    var kindLabel = album.kind === 'ost' ? '影视原声' : album.kind === 'single' ? '单曲' : '原创专辑';
    var kindKicker = album.kind === 'ost' ? 'SOUNDTRACK' : album.kind === 'single' ? 'SINGLE' : 'ALBUM';

    html += '<div class="stage" style="--album:' + albumColor(album) + '">' +
      '<span class="bar"></span><span class="wash"></span>' +
      '<div class="head-row">' +
        coverHtml(album, 'l', true) +
        '<div class="head-text">' +
          '<div class="kicker">' + kindKicker + '</div>' +
          '<h1 class="jpfont">' + esc(album.title) + '</h1>' +
          '<div class="kana">' + esc(album.date) + '</div>' +
          '<div class="meta">' +
            '<span>' + kindLabel + '</span>' +
            (album.total ? '<span>全 ' + album.total + ' 曲</span>' : '') +
            '<span>已解读 ' + mine.length + ' 首</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '</div>' +
      (album.note
        ? '<div class="note-card"><div class="note-label">专辑备忘</div>' +
          '<div class="note-body">' + esc(album.note) + '</div></div>'
        : '');

    if (album.tracks && album.tracks.length) {
      html += '<div class="track-table">';
      album.tracks.forEach(function (t) {
        var s = t.songId ? songById(t.songId) : null;
        html += '<div class="track-row ' + (s ? 'done' : 'todo') + '"' + (s ? ' data-song="' + s.id + '"' : '') + '>' +
          '<span class="no">' + t.no + '</span>' +
          '<span class="t jpfont">' + esc(t.title) + '</span>' +
          (s ? '<span class="badge">已解读</span>' : '<span class="badge g">待补充</span>') +
          '</div>';
      });
      html += '</div>';
    } else {
      html += '<div class="track-table"><div class="track-row todo">' +
        '<span class="t">这张专辑的曲目表还没录入。可以在 <code>data/albums.js</code> 里补 tracks 数组，' +
        '也可以直接写歌，歌曲会挂到专辑下面。</span></div></div>';
      if (mine.length) {
        html += '<div class="sec-title">已解读</div><div class="track-table">';
        mine.forEach(function (s) {
          html += '<div class="track-row done" data-song="' + s.id + '">' +
            '<span class="no">' + (s.trackNo || '·') + '</span>' +
            '<span class="t jpfont">' + esc(s.title) + '</span>' +
            '<span class="badge">已解读</span></div>';
        });
        html += '</div>';
      }
    }

    html += foot();
    document.getElementById('main').innerHTML = html;
    bindCards();
  }

  /* ---------------- 歌曲页 ---------------- */
  function renderSong(song) {
    var al = albumById(song.album);
    var html = '<div class="crumb"><a href="#/">首页</a>' +
      (al ? ' › <a href="#/album/' + al.id + '">' + esc(al.title) + '</a>' : '') +
      ' › ' + esc(song.title) + '</div>';

    html += '<div class="stage" style="--album:' + albumColor(al) + '">' +
      '<span class="bar"></span><span class="wash"></span>' +
      '<div class="head-row">' +
        coverHtml(al, 'l', true) +
        '<div class="head-text">' +
          '<div class="kicker">' + esc(al ? al.title : '未归档') + '</div>' +
          '<h1 class="jpfont">' + esc(song.title) + '</h1>' +
          (song.kana || song.romaji
            ? '<div class="kana jpfont">' + esc(song.kana) +
              (song.romaji ? ' ／ ' + esc(song.romaji) : '') + '</div>'
            : '<div class="kana"></div>') +
          '<div class="meta">' +
            (song.trackNo ? '<span>Track ' + song.trackNo + '</span>' : '') +
            (song.year ? '<span>' + song.year + '</span>' : '') +
            '<span>' + lineCount(song) + ' 句</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '</div>' +
      (song.lead
        ? '<div class="note-card"><div class="note-label">导读</div>' +
          '<div class="note-body">' + song.lead + '</div></div>'
        : '');

    /* 显示控制 */
    html += '<div class="controls">' +
      '<span class="label">显示</span>' +
      '<button class="toggle on" data-opt="kana">假名</button>' +
      '<button class="toggle on" data-opt="ro">罗马音</button>' +
      '<button class="toggle on" data-opt="zh">中文</button>' +
      '<button class="toggle on" data-opt="an">解读</button>' +
      '<span class="spacer"></span>' +
      '<button class="toggle" id="jp-only">只看日文</button>' +
      '</div>';

    /* 目录 */
    if (song.sections && song.sections.length) {
      html += '<div class="toc"><div class="h">目录</div><ol>';
      song.sections.forEach(function (sec, i) {
        html += '<li><a href="#sec-' + i + '" data-sec="' + i + '">' + esc(sec.name) + '</a></li>';
      });
      html += '</ol></div>';
    }

    /* 逐句 */
    (song.sections || []).forEach(function (sec, i) {
      html += '<div class="section" id="sec-' + i + '">' +
        '<h2 class="section-title">' + esc(sec.name) + '</h2>' +
        (sec.note ? '<div class="section-note">' + esc(sec.note) + '</div>' : '');
      (sec.lines || []).forEach(function (ln) {
        html += '<div class="line ' + (ln.speaker || '') + '">';
        if (ln.speaker && SPEAKER[ln.speaker]) {
          html += '<div class="speaker">' + SPEAKER[ln.speaker] + '</div>';
        }
        (ln.jp || []).forEach(function (jp, k) {
          html += '<div class="jp' + (k ? ' sub' : '') + '" data-jp="' + esc(jp) + '">' +
            renderJp(jp, state.opts.kana) + '</div>';
        });
        if (ln.ro) html += '<div class="ro">' + esc(ln.ro) + '</div>';
        if (ln.zh) html += '<div class="zh">' + esc(ln.zh) + '</div>';
        if (ln.an) html += '<div class="an">' + ln.an + '</div>';
        html += '</div>';
      });
      html += '</div>';
    });

    /* 语言点 */
    if (song.points && song.points.length) {
      html += '<h2 class="section-title">可以带走的日语</h2>';
      song.points.forEach(function (p) {
        html += '<div class="point"><h4>' + p.h + '</h4><p>' + p.p + '</p></div>';
      });
    }

    /* 总评 */
    if (song.essay) {
      html += '<h2 class="section-title">整体解读</h2><div class="essay">' + song.essay + '</div>';
    }

    html += songNav(song);
    html += foot();
    document.getElementById('main').innerHTML = html;

    /* 控制条事件 */
    var controls = document.querySelector('.controls');
    if (controls) {
      controls.querySelectorAll('[data-opt]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var k = btn.dataset.opt;
          state.opts[k] = !state.opts[k];
          btn.classList.toggle('on', state.opts[k]);
          applyOpts();
        });
      });
      var jpOnly = document.getElementById('jp-only');
      if (jpOnly) {
        jpOnly.addEventListener('click', function () {
          var on = !jpOnly.classList.contains('on');
          ['ro', 'zh', 'an'].forEach(function (k) { state.opts[k] = !on; });
          jpOnly.classList.toggle('on', on);
          controls.querySelectorAll('[data-opt]').forEach(function (b) {
            b.classList.toggle('on', state.opts[b.dataset.opt]);
          });
          applyOpts();
        });
      }
    }

    /* 目录锚点 */
    document.querySelectorAll('.toc a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = document.getElementById('sec-' + a.dataset.sec);
        if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
      });
    });

    applyOpts();
  }

  function applyOpts() {
    var m = document.getElementById('main');
    m.classList.toggle('hide-ro', !state.opts.ro);
    m.classList.toggle('hide-zh', !state.opts.zh);
    m.classList.toggle('hide-an', !state.opts.an);
    m.querySelectorAll('[data-jp]').forEach(function (el) {
      el.innerHTML = renderJp(el.dataset.jp, state.opts.kana);
    });
  }

  /* ---------------- 搜索 ---------------- */
  function doSearch(q) {
    q = (q || '').trim();
    var html = '<div class="crumb"><a href="#/">首页</a> › 搜索</div>' +
      '<h2 class="section-title">“' + esc(q) + '” 的搜索结果</h2>';
    if (!q) {
      document.getElementById('main').innerHTML = html + '<div class="empty">输入关键词试试，比如「ちなみに」「距離」「七夕」</div>';
      return;
    }
    var hits = [];
    state.songs.forEach(function (s) {
      var fields = [];
      fields.push({ k: '曲名', v: s.title + ' ' + (s.kana || '') + ' ' + (s.romaji || '') });
      (s.sections || []).forEach(function (sec) {
        (sec.lines || []).forEach(function (ln) {
          (ln.jp || []).forEach(function (x) { fields.push({ k: '歌词', v: plain(x) }); });
          if (ln.ro) fields.push({ k: '罗马音', v: ln.ro });
          if (ln.zh) fields.push({ k: '译文', v: ln.zh });
          if (ln.an) fields.push({ k: '解读', v: plain(ln.an) });
        });
      });
      (s.points || []).forEach(function (p) { fields.push({ k: '语言点', v: plain(p.h) + ' ' + plain(p.p) }); });
      if (s.essay) fields.push({ k: '总评', v: plain(s.essay) });

      var first = null;
      fields.forEach(function (f) {
        var idx = f.v.toLowerCase().indexOf(q.toLowerCase());
        if (idx >= 0 && !first) {
          var start = Math.max(0, idx - 30);
          var ctx = (start > 0 ? '…' : '') + f.v.slice(start, idx + 70) + '…';
          first = { kind: f.k, ctx: ctx, q: q };
        }
      });
      if (first) hits.push({ song: s, hit: first });
    });

    if (!hits.length) {
      document.getElementById('main').innerHTML = html + '<div class="empty">没有找到。目前收录的歌还不多，慢慢会涨起来的。</div>';
      return;
    }
    hits.forEach(function (h) {
      var re = new RegExp('(' + h.hit.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      html += '<div class="result" data-song="' + h.song.id + '">' +
        '<div class="t jpfont">' + esc(h.song.title) +
        ' <span class="kana" style="font-size:12px;color:var(--ink-faint)">' + esc(h.hit.kind) + '</span></div>' +
        '<div class="ctx">' + esc(h.hit.ctx).replace(re, '<mark>$1</mark>') + '</div>' +
        '</div>';
    });
    document.getElementById('main').innerHTML = html + foot();
    bindCards();
  }

  /* 上一首 / 下一首 */
  function songNav(song) {
    var list = state.songs, i = -1, k;
    for (k = 0; k < list.length; k++) {
      if (list[k].id === song.id) { i = k; break; }
    }
    var prev = i > 0 ? list[i - 1] : null;
    var next = (i >= 0 && i < list.length - 1) ? list[i + 1] : null;
    if (!prev && !next) return '';
    var html = '<div class="songnav">';
    html += prev
      ? '<a class="nav" href="#/song/' + prev.id + '"><span class="dir">← 上一首</span>' +
        '<span class="t jpfont">' + esc(prev.title) + '</span></a>'
      : '<span class="nav empty"></span>';
    html += next
      ? '<a class="nav next" href="#/song/' + next.id + '"><span class="dir">下一首 →</span>' +
        '<span class="t jpfont">' + esc(next.title) + '</span></a>'
      : '<span class="nav empty"></span>';
    return html + '</div>';
  }

  /* ---------------- 通用 ---------------- */
  function foot() {
    return '<div class="foot">歌词与译文为学习用途的引用与解读，版权归 野田洋次郎 / RADWIMPS 及唱片公司所有。<br>' +
      '本站为个人学习笔记，不提供音频与歌词全文下载。</div>';
  }

  function bindCards() {
    var main = document.getElementById('main');
    main.querySelectorAll('[data-song]').forEach(function (el) {
      el.addEventListener('click', function () {
        location.hash = '#/song/' + el.dataset.song;
      });
    });
    main.querySelectorAll('[data-album]').forEach(function (el) {
      el.addEventListener('click', function () {
        location.hash = '#/album/' + el.dataset.album;
      });
    });
  }

  /* ---------------- 路由 ---------------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var m;
    var pageTitle = '逐句歌词解读笔记';
    renderSidebar();

    if ((m = h.match(/^song\/(.+)$/))) {
      var s = songById(m[1]);
      if (s) { renderSong(s); pageTitle = s.title + ' ' + (s.romaji || ''); }
      else { notFound('没有这首歌的数据：' + m[1]); }
    } else if ((m = h.match(/^album\/(.+)$/))) {
      var a = albumById(m[1]);
      if (a) { state.openAlbum = a.id; renderSidebar(); renderAlbum(a); pageTitle = a.title; }
      else { notFound('没有这张专辑：' + m[1]); }
    } else if ((m = h.match(/^search\?q=(.*)$/))) {
      var q = decodeURIComponent(m[1]);
      doSearch(q);
      pageTitle = '搜索：' + q;
    } else {
      renderHome();
    }
    markSidebarCurrent();
    document.title = pageTitle.replace(/\s+/g, ' ').trim() + ' — RADWIMPS 詞解';
    window.scrollTo(0, 0);
  }

  function notFound(msg) {
    document.getElementById('main').innerHTML =
      '<div class="empty">' + esc(msg) + '</div>';
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    /* 主题切换。localStorage 在部分环境（file:// 的 opaque origin、隐私模式、
       被策略禁用）会直接抛异常，所以读写都要兜住——否则整个初始化会中断、页面空白。 */
    var saved = null;
    try { saved = localStorage.getItem('rw-theme'); } catch (e) { saved = null; }
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('theme').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      try { localStorage.setItem('rw-theme', cur); } catch (e) { /* 存不了就算了 */ }
      this.textContent = cur === 'dark' ? '亮' : '暗';
    });
    document.getElementById('theme').textContent =
      document.documentElement.getAttribute('data-theme') === 'dark' ? '亮' : '暗';

    /* 搜索 */
    var input = document.getElementById('q');
    function go() {
      var v = input.value.trim();
      location.hash = v ? '#/search?q=' + encodeURIComponent(v) : '#/';
    }
    document.getElementById('btn-search').addEventListener('click', go);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });

    /* 侧边栏开关（窄屏） */
    var sidebar = document.getElementById('sidebar');
    document.getElementById('menu').addEventListener('click', function () {
      sidebar.classList.toggle('show');
    });
    /* 窄屏下点完导航自动收起 */
    sidebar.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.album-head, .track, .side-home')) sidebar.classList.remove('show');
    });

    /* 悬浮「回到首页」（向下滚动后出现） */
    var fab = document.getElementById('fab');
    if (fab) {
      var syncFab = function () {
        fab.classList.toggle('show', window.scrollY > 420);
      };
      window.addEventListener('scroll', syncFab);
      window.addEventListener('hashchange', function () { setTimeout(syncFab, 0); });
      fab.addEventListener('click', function () {
        var h = location.hash;
        if (!h || h === '#/' || h === '#') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          location.hash = '#/';
        }
      });
      syncFab();
    }

    loadSongs(function () {
      /* 统计 */
      var n = state.songs.length;
      var total = state.albums.reduce(function (s, a) { return s + (a.total || 0); }, 0);
      document.getElementById('stat').textContent = n + ' 首已解读 / ' + total + ' 曲在库';

      if (!n) {
        document.getElementById('main').innerHTML =
          '<div class="empty">没有加载到任何歌曲数据。<br>' +
          '请检查 data/manifest.js 里登记的文件路径是否正确。<br>' +
          '（若用 file:// 直接打开时浏览器拦截了本地脚本，可改用 <code>python -m http.server</code> 起一个本地服务）</div>';
        return;
      }

      /* 首屏默认展开第一首歌所在专辑 */
      if (!location.hash) {
        state.openAlbum = state.songs[0].album;
      }
      route();
    });

    window.addEventListener('hashchange', route);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
