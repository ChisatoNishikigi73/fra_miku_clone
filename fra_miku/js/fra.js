var __extends =
    (this && this.__extends) ||
    function (g, d) {
      function f() {
        this.constructor = g;
      }
      for (var c in d) d.hasOwnProperty(c) && (g[c] = d[c]);
      g.prototype =
        null === d ? Object.create(d) : ((f.prototype = d.prototype), new f());
    },
  aidnlib;
(function (g) {
  var d = (function () {
    function c() {}
    c.get = function (c) {
      return this._data[c];
    };
    c.add = function (c, k) {
      this._data[c] = k;
    };
    c._data = {};
    return c;
  })();
  g.Assets = d;
  var f = (function () {
    function d() {
      this.listeners = {};
    }
    d.prototype.dispatchEvent = function (c) {
      var k;
      c instanceof p ? (k = c.type) : ((k = c), (c = new p(k)));
      if (null != this.listeners[k]) {
        c.currentTarget = this;
        for (
          var l = this.listeners[k].length, d = 0;
          d < l && this.listeners[k];
          d++
        ) {
          var f = this.listeners[k][d];
          try {
            f.handler(c);
          } catch (z) {
            window.console && console.error(z.stack);
          }
        }
      }
    };
    d.prototype.addEventListener = function (d, k, l) {
      void 0 === l && (l = 0);
      null == this.listeners[d] && (this.listeners[d] = []);
      this.listeners[d].push(new c(d, k, l));
      this.listeners[d].sort(function (c, k) {
        return k.priolity - c.priolity;
      });
    };
    d.prototype.removeEventListener = function (c, k) {
      if (this.hasEventListener(c, k))
        for (var l = 0; l < this.listeners[c].length; l++) {
          var d = this.listeners[c][l];
          if (d.equalCurrentListener(c, k)) {
            d.handler = null;
            this.listeners[c].splice(l, 1);
            break;
          }
        }
    };
    d.prototype.clearEventListener = function () {
      this.listeners = {};
    };
    d.prototype.containEventListener = function (c) {
      return null == this.listeners[c] ? !1 : 0 < this.listeners[c].length;
    };
    d.prototype.hasEventListener = function (c, k) {
      if (null == this.listeners[c]) return !1;
      for (var d = 0; d < this.listeners[c].length; d++)
        if (this.listeners[c][d].equalCurrentListener(c, k)) return !0;
      return !1;
    };
    return d;
  })();
  g.EventDispatcher = f;
  var c = (function () {
      function c(d, k, l) {
        void 0 === d && (d = null);
        void 0 === k && (k = null);
        void 0 === l && (l = 0);
        this.type = d;
        this.handler = k;
        this.priolity = l;
      }
      c.prototype.equalCurrentListener = function (c, d) {
        return this.type == c && this.handler == d ? !0 : !1;
      };
      return c;
    })(),
    p = (function () {
      return function (c, d) {
        void 0 === c && (c = null);
        void 0 === d && (d = null);
        this.type = c;
        this.data = d;
      };
    })();
  g.Event = p;
  f = (function (c) {
    function d() {
      c.call(this);
      this._loaded = !1;
    }
    __extends(d, c);
    d.prototype.execute = function () {};
    d.prototype.cancel = function () {};
    d.prototype._dispatchComplete = function () {
      this._loaded = !0;
      this.dispatchEvent(new n(n.COMPLETE));
    };
    d.prototype._dispatchFailed = function () {
      this.dispatchEvent(new n(n.FAILED));
    };
    d.prototype._dispatchProgress = function (c) {
      var d = new n(n.PROGRESS);
      d.progress = c;
      this.dispatchEvent(d);
    };
    return d;
  })(f);
  g.CommandBase = f;
  var n = (function (c) {
    function d(k) {
      c.call(this, k);
    }
    __extends(d, c);
    d.COMPLETE = "complete";
    d.FAILED = "failed";
    d.PROGRESS = "progress";
    return d;
  })(p);
  g.CommandEvent = n;
  var t = (function (c) {
    function d(k) {
      void 0 === k && (k = 1);
      c.call(this);
      this._rates = [];
      this._sum = 0;
      this._commands = [];
      this._compnum = this._total = this._now = 0;
      this._compflags = [];
      this._connectionNum = k;
    }
    __extends(d, c);
    d.prototype.execute = function () {
      this._loaded = !1;
      this._now = this._compnum = this._compRate = 0;
      this._compflags = [];
      this._progRates = [];
      if (this._total <= this._compnum)
        this._dispatchProgress(1), this._dispatchComplete();
      else
        for (
          var c = Math.min(this._total, this._connectionNum), d = 0;
          d < c;
          d++
        )
          this._execute();
    };
    d.prototype.cancel = function () {
      if (!(this._total <= this._compnum))
        for (var c = 0; c < this._total; c++)
          try {
            var d = this._commands[c];
            this._removeEvents(d);
            d.cancel();
          } catch (f) {}
    };
    d.prototype.add = function (c, d) {
      void 0 === d && (d = 1);
      this._commands[this._total] = c;
      this._rates[this._total] = d;
      this._sum += d;
      this._total++;
    };
    d.prototype._execute = function () {
      var c = this;
      if (this._now < this._total) {
        this._rates[this._now] /= this._sum;
        this._progRates[this._now] = 0;
        var d = this._commands[this._now];
        d.__id = this._now;
        d.addEventListener(n.COMPLETE, function (d) {
          return c._complete(d);
        });
        d.addEventListener(n.PROGRESS, function (d) {
          return c._progress(d);
        });
        d.addEventListener(n.FAILED, function (d) {
          return c._failed(d);
        });
        d.execute();
        this._now++;
      } else
        this._total <= this._compnum &&
          (this._dispatchProgress(1), this._dispatchComplete());
    };
    d.prototype._removeEvents = function (c) {
      c.clearEventListener();
    };
    d.prototype._completeCommand = function (c, d) {};
    d.prototype._complete = function (c) {
      c = c.currentTarget.__id;
      var d = this._commands[c];
      this._removeEvents(d);
      this._compRate += this._rates[c];
      this._compflags[c] = !0;
      this.__progress();
      this._completeCommand(d, c);
      this._compnum++;
      this._execute();
    };
    d.prototype._progress = function (c) {
      var d = c.currentTarget.__id;
      this._progRates[d] = c.progress * this._rates[d];
      this.__progress();
    };
    d.prototype.__progress = function () {
      for (var c = 0, d = 0; d < this._now; d++)
        this._compflags[d] || (c += this._progRates[d]);
      this._dispatchProgress(this._compRate + c);
    };
    d.prototype._failed = function (c) {
      this._removeEvents(this._commands[c.currentTarget.__id]);
      this._dispatchFailed();
    };
    Object.defineProperty(d.prototype, "loaded", {
      get: function () {
        return this._loaded;
      },
      enumerable: !0,
      configurable: !0,
    });
    return d;
  })(f);
  g.SequentialCommand = t;
  t = (function (c) {
    function f(d, l, g, m) {
      void 0 === l && (l = null);
      void 0 === g && (g = !1);
      void 0 === m && (m = -1);
      c.call(this);
      this._id = l;
      this._url = d;
      this._isplay = g;
      this._trimvol = m;
    }
    __extends(f, c);
    f.prototype.execute = function () {
      var c = this,
        d = function () {
          c._complete();
        };
      this._audio = new aidn.AutoAudio(null);
      this._isplay
        ? (this._audio.load([this._url], null, this._trimvol),
          this._audio.play(0, !1, d, 0, 0))
        : this._audio.load([this._url], d, this._trimvol);
    };
    f.prototype._complete = function () {
      this._isplay && this._audio.stop();
      var c = this._id;
      c || (c = this._url);
      d.add(c, this._audio);
      this._dispatchComplete();
    };
    return f;
  })(f);
  g.AudioLoadCommand = t;
  var v = (function () {
    function c() {}
    c.PIXI = 0;
    c.THREE = 1;
    return c;
  })();
  g.JsonBase64Type = v;
  f = (function (c) {
    function f(d, l, g) {
      void 0 === l && (l = 0);
      void 0 === g && (g = 0.3);
      c.call(this);
      this._keys = [];
      this._url = d;
      this._type = l;
      this._jsonRate = g;
    }
    __extends(f, c);
    f.prototype.execute = function () {
      var c = this;
      $.ajax({
        method: "GET",
        url: this._url,
        dataType: "json",
        success: function (d) {
          c._complete(d);
        },
        xhr: function () {
          var d = $.ajaxSettings.xhr();
          d.onprogress = function (d) {
            c._dispatchProgress((d.loaded / d.total) * c._jsonRate);
          };
          return d;
        },
      });
    };
    f.prototype._complete = function (c) {
      this._data = c;
      var d = 0,
        f;
      for (f in c) this._keys[d++] = f;
      this._now = -1;
      this._len = d;
      this._next();
    };
    f.prototype._next = function () {
      this._now++;
      if (this._now < this._len) {
        this._dispatchProgress(
          this._jsonRate + (this._now / this._len) * (1 - this._jsonRate)
        );
        var c = this,
          f = this._keys[this._now],
          g = this._data[f];
        if (0 < f.lastIndexOf(".mp3") || 0 < f.lastIndexOf(".ogg"))
          if (aidn.util.webaudio) {
            var m = new aidn.WebAudio();
            d.add(f, m);
            m.load(g, function () {
              c._next();
            });
          } else
            setTimeout(function () {
              c._next();
            }, 10);
        else {
          var n = new Image();
          n.onload =
            this._type == v.PIXI
              ? function () {
                  var g = new PIXI.Texture(new PIXI.BaseTexture(n));
                  PIXI.Texture.addTextureToCache(g, f);
                  d.add(f, g);
                  setTimeout(function () {
                    c._next();
                  }, 10);
                }
              : this._type == v.THREE
              ? function () {
                  var g = new THREE.Texture(n);
                  g.needsUpdate = !0;
                  d.add(f, g);
                  setTimeout(function () {
                    c._next();
                  }, 10);
                }
              : function () {
                  d.add(f, n);
                  setTimeout(function () {
                    c._next();
                  }, 10);
                };
          n.src = g;
        }
      } else this._dispatchComplete();
    };
    return f;
  })(f);
  g.JsonBase64LoadCommand = f;
})(aidnlib || (aidnlib = {}));
var __extends =
    (this && this.__extends) ||
    function (g, d) {
      function f() {
        this.constructor = g;
      }
      for (var c in d) d.hasOwnProperty(c) && (g[c] = d[c]);
      g.prototype =
        null === d ? Object.create(d) : ((f.prototype = d.prototype), new f());
    },
  fra;
(function (g) {
  g.checkLoop = function () {
    "undefined" == typeof jQuery ||
    "undefined" == typeof PIXI ||
    "undefined" == typeof Matter ||
    "undefined" == typeof TweenMax ||
    "undefined" == typeof aidn
      ? setTimeout(g.checkLoop, 10)
      : $(function () {
          g.active();
        });
  };
  g.active = function () {
    new G().init();
  };
  var d = (function () {
      function b() {}
      b.TOP = 0;
      b.READY = 1;
      b.MAIN = 2;
      b.LOADING = 3;
      b.KOTOBA = 4;
      b.HOWTO = 6;
      b.ABOUT = 7;
      b.END = 5;
      return b;
    })(),
    f = (function () {
      function b() {}
      b.FL_BOX = 0;
      b.FL_CIR = 1;
      b.OBJ_CIR = 2;
      b.FIX_BOX = 3;
      b.FIX_CIR = 4;
      return b;
    })(),
    c = (function () {
      function b() {}
      b.state = d.TOP;
      b.stateBt = f.FL_BOX;
      b.delta = 0;
      b._debug = !1;
      return b;
    })(),
    p = (function () {
      function b() {}
      b.alpha = 0.82;
      b.ALPHA_FL = 0.35;
      b.BGM_PATH = "data/fom.mp3";
      b.SHARE_URL = "https://aidn.jp/fra_miku/";
      return b;
    })(),
    n = (function () {
      function b() {}
      b.init = function () {
        for (var a = 0; a < this.list.length; a++)
          this.listDatas[a] = new l(a, this.list[a]);
      };
      b.list = [
        {
          name: "wokka",
          text: "\u541b\u306e\u304a\u304b\u3052\u3067<br>\u97f3\u697d\u304c\u5927\u597d\u304d\u306b\u306a\u3063\u305f\u3093\u3060",
        },
        {
          name: "\u307f\u3093\u3066\u3045",
          text: "\u30cd\u30ae\u30cd\u30ae\u306b\u3083\u3093\u306b\u3083\u3093\u307f\u3063\u304f\u307f\u304f",
        },
        {
          name: "N\u30d3\u30ec\u6c0f",
          text: "\u521d\u97f3\u30df\u30af\u306e\u5fc3\u81d3\u3092\u6b62\u3081\u306a\u3044\u3067",
        },
        {
          name: "\u661f\u83ef",
          text: "\u3042\u306a\u305f\u306b\u51fa\u4f1a\u3063\u3066\u304b\u3089<br>\u4e16\u754c\u304c\u5909\u308f\u308a\u307e\u3057\u305f\u3002<br>\u3053\u308c\u304b\u3089\u3082\u3069\u3046\u305e\u3088\u308d\u3057\u304f\u306d\uff01",
        },
        {
          name: "\u3001\u30a3\u30ed",
          text: "\u30c4\u30a4\u30f3\u30c6\u30e2\u30d5\u30e2\u30d5\u3057\u305f\u3044",
        },
        {
          name: "\u3075\u308f\u3044",
          text: "\u308f\u305f\u3057\u306e\u30cf\u30b8\u30e1\u30c6\u30ce\u30aa\u30c8\u306f<br>\u541b\u3067\u3057\u305f",
        },
        {
          name: "\u3057\u308d\u3044\u304f\u307e",
          text: "\u6700\u521d\u306f\u541b\u306e\u3053\u3068\u3001<br>\u82e6\u624b\u3060\u3063\u305f\u3093\u3060\u3002<br>\u3051\u3069\u3002",
        },
        {
          name: "\u305b\u3089",
          text: "\u65b0\u5e79\u7dda\u306f\u3084\u3076\u3055\u3092\u898b\u308b\u3068\u3001<br>\u541b\u306e\u3053\u3068\u3092\u601d\u3044\u51fa\u3059\u3002",
        },
        {
          name: "\u3048\u3053\u22bf",
          text: "\u30df\u30af\u3055\u3093\u306e\u305f\u3081\u306a\u3089\u3001<br>\u3069\u306e\u4e16\u754c\u307e\u3067\u3082\u4ed8\u3044\u3066\u3044\u304f",
        },
        {
          name: "Eji",
          text: "2039\u5e743\u67089\u65e5\u3001<br>\u30df\u30af\u3055\u3093\u3068\u4e00\u7dd2\u306b\u3001<br>\u30b7\u30f3\u30ae\u30e5\u30e9\u30ea\u30c6\u30a3\uff08\u4eba\u985e\u306e\u6607\u83ef\uff09<br>\u3092\u8fce\u3048\u305f\u3044",
        },
        {
          name: "tk",
          text: '20\u5e74\u5c11\u3057\u751f\u304d\u3066\u304d\u3066<br>\u3053\u3053\u307e\u3067\u611b\u3057\u305f"\u58f0"\u3092\u77e5\u3089\u306a\u3044',
        },
        {
          name: "\u304d\u3064\u306d\u3065\u304b",
          text: "\u30df\u30af\u3055\u3093\u306f\u3001<br>\u6368\u3066\u53bb\u3063\u3066\u3044\u305f\u5927\u4e8b\u306a\u601d\u3044\u3092<br>\u30b5\u30eb\u30d9\u30fc\u30b8\u3057\u3066\u304f\u308c\u305f<br>\u672c\u5f53\u306e\u5929\u4f7f",
        },
        {
          name: "\u30c6\u30eb",
          text: "\u9752\u6625\u6642\u4ee3\u3092\u30df\u30af\u3055\u3093\u3068\u904e\u3054\u3057\u305f\u3002",
        },
        {
          name: "\u6625\u96e8",
          text: "\u541b\u306e\u58f0\u304c\u4e16\u754c\u3092\u5f69\u3063\u305f\u3088",
        },
        {
          name: "T.Akaishi",
          text: "\u30df\u30af\u3055\u3093\u306e\u305f\u3081\u306a\u3089<br>\u751f\u30cd\u30ae\u3092\u304b\u3058\u308b\u3053\u3068\u3082<br>\u3084\u3076\u3055\u304b\u3067\u306f\u306a\u3044\u3002",
        },
        {
          name: "\u306f\u3064\u306d",
          text: "\u541b\u306e\u30c4\u30a4\u30f3\u30c6\u30fc\u30eb\u304b\u3089<br>\u5168\u3066\u306f\u59cb\u307e\u3063\u305f\u3002",
        },
        {
          name: "\u3086\u3045",
          text: "\u304d\u307f\u3068\u3044\u308c\u3070\u307c\u304f\u306f\u6700\u5f37\u3060",
        },
        {
          name: "gin_0648",
          text: "\u6016\u304b\u3063\u305f\u96fb\u5b50\u97f3\u3001<br>\u4eca\u3067\u306f\u6795\u306e\u4e0a\u3002",
        },
        {
          name: "\u304f\u3055\u3070",
          text: "\u6ed1\u3089\u304b\u306a\u58f0\u3082<br>\u30d4\u30b3\u30d4\u30b3\u3057\u305f\u58f0\u3082<br>\u597d\u304d",
        },
        {
          name: "\u307e\u3061\u3085\u304a",
          text: "\u6982\u5ff5\u3060\u3063\u305f\u541b\u306f\u6982\u5ff5\u3092\u8d85\u3048<br>\u4eca\u78ba\u304b\u306b\u5b58\u5728\u3057\u3066\u3044\u308b",
        },
        {
          name: "\u6d77\u9bae\u4e3c",
          text: "\u30b9\u30da\u30b7\u30e3\u30eb\u30cd\u30ae\u30bd\u30d5\u30c8\u3092<br>\u4e00\u7dd2\u306b\u98df\u3079\u3066\u3001<br>\u300c\u7f8e\u5473\u3057\u3044\u3088\u306d\u300d\u3063\u3066<br>\u7b11\u3044\u3042\u3044\u305f\u3044\u3002",
        },
        {
          name: "\u305d\u3046",
          text: "\u307c\u304f\u304c\u6c34\u8272\u304b\u3089\u9023\u60f3\u3059\u308b\u3082\u306e\u3001<br>\u5b66\u751f\u6642\u4ee3\u304b\u3089\u596e\u8d77\u3059\u308b\u3082\u306e\u3002<br>\u597d\u304d\u3067\u3059\u3001\u30df\u30af\u3055\u3093\u3002",
        },
        {
          name: "Tr@vis",
          text: "\u30df\u30af\u3055\u3093\u3068\u4e00\u7dd2\u306a\u3089\u3070\u3001<br>\u4f55\u3067\u3082\u3067\u304d\u308b\u3068\u601d\u3046\uff01<br>\u5929\u4f7f\u3060\u304b\u3089\u306d\uff01",
        },
        {
          name: "aoto",
          text: "\u9752\u6625\u6642\u4ee3\u306b\u541b\u304c\u3044\u305f",
        },
        {
          name: "\u9be8\u5c71",
          text: "10\u5e74\u7d4c\u3063\u305f\u4eca\u3060\u3063\u3066\u3001<br>\u541b\u306e\u6b4c\u58f0\u306b\u30cf\u30c3\u3068\u3055\u305b\u3089\u308c\u308b",
        },
        {
          name: "CHANY",
          text: "\u30df\u30af\u3061\u3083\u3093\u306e\u304a\u304b\u3052\u3067<br>\u4eca\u65e5\u3082\u9811\u5f35\u308c\u308b",
        },
        {
          name: "\u307f\u3086\u304d",
          text: "\u3069\u308c\u307b\u3069\u591a\u304f\u306e\u4eba\u306e\u5922\u3092<br>\u3042\u306a\u305f\u306f\u53f6\u3048\u3066\u304f\u308c\u305f\u306e\u3060\u308d\u3046",
        },
        {
          name: "\u304f\u307c\u3067\u3093",
          text: "\u521d\u3081\u3066\u898b\u305f\u6642\u3001<br>\u300c\u3057\u3087\u304a\u3093\u30df\u30af\u300d\u3063\u3066<br>\u8aad\u3093\u3058\u3083\u3063\u3066\u3054\u3081\u3093\u306a\u3055\u3044\u3001<br>\u30df\u30af\u3055\u3093",
        },
        {
          name: "\u8996\u8074\u8005",
          text: "\u305a\u3063\u3068\u611b\u3057\u3066\u308b",
        },
        {
          name: "Kuni",
          text: "\u30df\u30af\u3061\u3083\u3093\u304b\u308f\u3044\u3044",
        },
        {
          name: "\u30d2\u30ba\u30df",
          text: "\u541b\u306e\u304a\u304b\u3052\u3067\u30cd\u30ae\u304c\u597d\u304d\u306b\u306a\u3063\u305f",
        },
        {
          name: "soft",
          text: "\u4e16\u754c\u4e2d\u306e\u8ab0\u3088\u308a\u3082<br>\u6b4c\u3046\u30dc\u30fc\u30ab\u30ea\u30b9\u30c8",
        },
        {
          name: "\u7530\u4e2d\u4e09\u4e5d\u90ce",
          text: "\u541b\u306f\u50d5\u306e\u9752\u6625\u3060\u3063\u305f",
        },
        {
          name: "SONE",
          text: "\u3064\u306d\u307f\u304f\u306f\u3000\u306d\u307f\u304f\u306f\u3064<br>\u307f\u304f\u306f\u3064\u306d\u3000\u304f\u306f\u3064\u306d\u307f<br>\u306f\u3064\u306d\u307f\u304f",
        },
        {
          name: "\u7690\u6708\u3046\u3055\u304e",
          text: "\u3044\u3064\u3060\u3063\u3066\u3069\u3093\u306a\u3068\u304d\u3060\u3063\u3066<br>\u3053\u308c\u304b\u3089\u3060\u3063\u3066<br>\u305a\u3063\u3068\u305a\u3063\u3068\u96a3\u3067\u5504\u3063\u3066\u306d",
        },
        {
          name: "Phosphine",
          text: "\u541b\u304c\u6765\u3066\u304b\u3089\u6570\u30f6\u6708\u3002<br>\u51ac\u3002<br>\u541b\u306e\u77e5\u3089\u306a\u3044<br>\u5b63\u7bc0\u304c\u3084\u3063\u3066\u304d\u305f\u3002",
        },
        {
          name: "\u5fa1\u7530",
          text: "\u5b66\u751f\u6642\u4ee3\u306e\u983c\u308a\u306a\u3044\u5fc3\u306b<br>\u5bc4\u308a\u6dfb\u3063\u3066\u304f\u308c\u305f\u306e\u306f\u3001<br>\u521d\u97f3\u30df\u30af\u306e\u6b4c\u58f0\u3060\u3063\u305f\u3002",
        },
        {
          name: "\u30de",
          text: "\u521d\u97f3\u30df\u30af\u306e\u6b4c\u304c\u7d42\u308f\u308b\u6642\u3001<br>\u97f3\u697d\u3082\u7d42\u308f\u308b\u3002",
        },
        {
          name: "\u516b\u89d2",
          text: "\u30df\u30af\u3055\u3093\u306f\u3001\u307f\u3093\u306a\u306e\u60f3\u3044\u306e\u7a4d\u5c64<br>\u307f\u3093\u306a\u306e\u5922 \u672a\u6765 \u3064\u307e\u308a\u5929\u4f7f",
        },
        {
          name: "\u548c\u97f3",
          text: "\u50d5\u306e\u601d\u3044\u51fa\u306e\u7247\u9685\u306b\u306f<br>\u3044\u3064\u3082\u541b\u304c\u3044\u305f",
        },
        {
          name: "T[9]",
          text: "\u30ad\u30df\u306e\u9aea\u8272\u306f\u3001<br>\u4eca\u3001\u50d5\u306e\u751f\u304d\u65b9\u3068\u5171\u306b\u3002",
        },
        {
          name: "\u30ab\u30a4\u30eb\u30fb\u30a2\u30fc\u30c7\u30eb\u30d9\u30eb\u30f3",
          text: "\u300c\u521d\u97f3\u30df\u30af\u300d\u3068\u3044\u3046\u3001<br>\u5c11\u5973\u306e\u59ff\u3092\u3057\u305f\u30df\u30fc\u30e0",
        },
        {
          name: "\u3044\u3069",
          text: "\u30df\u30af\u30c1\u30e3\u30f3\u304c\u6d88\u3048\u305f\u306a\u3089<br>\u6ce3\u304d\u305d\u3046\u3068\u601d\u3046\u3002",
        },
        {
          name: "\u521d\u97f3\u751f\u65e5\u5feb\u6a02",
          text: "\u521d\u97f3\u5341\u9031\u5e74\u5feb\u6a02\u6211\u611b\u4f60\u4e00\u8f29\u5b50",
        },
        {
          name: "\u3042\u305a\u304d",
          text: "\u4f55\u6c17\u306a\u304f\u9078\u3076\u8272\u306f\u3001<br>\u3044\u3064\u3082\u30df\u30af\u8272\u3002",
        },
        {
          name: "\u3057\u30fc\u304f\u3093",
          text: "\u30df\u30af\u3055\u3093\u3078\u58f0\u306b\u51fa\u3057\u3066<br>\uff6239!\uff63<br>\u3068\u8a00\u3044\u305f\u3044",
        },
        {
          name: "O-:K",
          text: "\u30df\u30af\u3055\u3093\u306b\u4f1a\u3063\u3066\u304b\u3089\u3001<br>\u97f3\u697d\u304c\u8eab\u8fd1\u306b\u306a\u3063\u305f\u3002<br>\u697d\u3057\u3044\u3088\u3002",
        },
        { name: "\u30df\u30af", text: "\u805e\u3053\u3048\u307e\u3059\u304b" },
        {
          name: "\u304a\u308a\u304c\u307f",
          text: "\u4e00\u4eba\u306e\u5c11\u5973\u304b\u3089<br>\u7121\u9650\u306e\u97f3\u304c\u751f\u307e\u308c\u305f",
        },
        {
          name: "\u30c8\u30ea\u30a4",
          text: "\u6b7b\u306c\u307e\u3067\u4e00\u7dd2\u306b\u3044\u3088\u3046\u3001<br>\u6b7b\u3093\u3060\u3089\u4e00\u7dd2\u306b\u306a\u308d\u3046\u3002",
        },
        {
          name: "aoto",
          text: "\u53cb\u9054\u306e\u4f1a\u8a71\u306e\u4e2d\u306b\u3082\u541b\u304c\u3044\u305f",
        },
        { name: "Henry", text: "\u5929\u4f7f\u7684\u58f0\u97f3" },
        {
          name: "HeyCube",
          text: "10\u5e74\u5927\u597d\u304d\u3001<br>\u591a\u5206\u3053\u308c\u304b\u3089\u3082\u305a\u3063\u3068\u3002",
        },
        {
          name: "\u3086",
          text: "\u3082\u3046\u30df\u30af\u3057\u304b\u306a\u3044",
        },
        {
          name: "\u307d\u304b\u3089",
          text: "\u30df\u30af\u306b\u5fc3\u306f\u306a\u3044\u304c\u3001<br>\u3042\u306e\u6642\u3001\u79c1\u306e\u5fc3\u306f\u52d5\u304b\u3055\u308c\u305f\u3002",
        },
        {
          name: "\u30df\u30a2",
          text: "\u3042\u306e\u58f0\u3092\u8074\u3044\u305f\u6642\u304b\u3089<br>\u79c1\u306e\u4eba\u751f\u306e\u5e38\u8b58\u304c\u5909\u308f\u3063\u305f\u3002",
        },
        {
          name: "\u307f\u3058",
          text: "\u521d\u3081\u3066\u30cb\u30e4\u3064\u304f\u3068\u3044\u3046<br>\u611f\u60c5\u3092\u304f\u308c\u305f\u306e\u306f\u521d\u97f3\u30df\u30af",
        },
        {
          name: "\u767d\u96ea ",
          text: "\u8ab0\u306e\u7d75\u3067\u3082\u3001<br>\u8ab0\u306e\u8a00\u8449\u3067\u3082\u3001<br>\u3059\u3050\u8cb4\u5973\u3060\u3068\u308f\u304b\u308b\u3088\u3002",
        },
        {
          name: "abara",
          text: "\u307c\u304f\u306e\u60f3\u3044<br>\u4ee3\u308f\u308a\u306b\u4f1d\u3048\u3066\u304f\u308c\u308b<br>\u541b\u306e\u58f0\u304c\u5fc3\u306b\u97ff\u304f",
        },
        {
          name: "hira",
          text: "\u305d\u306e\u5b50\u5341 \u751f\u307e\u308c\u3057\u6ce2\u5f62\u306f<br>\u3064\u306d\u6210\u308a\u3066 \u97f3\u304d\u308c\u308b\u6642\u306f<br>\u672a\u3060\u6765\u305f\u3089\u305a",
        },
        { name: "\u3061\u3050", text: "\u4ffa\u306e\u9752\u6625" },
        {
          name: "\u3044\u308a\u3048",
          text: "\u306d\u304e\u304a\u3044\u3057\u3044\u3002",
        },
        {
          name: "Sah",
          text: "\u521d\u97f3\u30df\u30af\u304c\u6765\u305f<br>\u30d0\u30ec\u30f3\u30bf\u30a4\u30f3\u30c7\u30fc\u306e\u65e5\u3001<br>\u30db\u30c3\u30c8\u30c1\u30e7\u30b3\u306e\u3088\u3046\u306b<br>\u5fc3\u304c\u6696\u304b\u304b\u3063\u305f\u3002",
        },
        {
          name: "adt",
          text: "\u9752\u7dd1\u3002<br>\u9aea\u306e\u5857\u308a\u306e\u96e3\u3057\u3055\u3002<br>\u9aea\u306e\u5857\u308a\u306e\u9762\u767d\u3055\u3002",
        },
        {
          name: "\u25ce",
          text: "\u5fc3\u3092\u6301\u305f\u306a\u3044\u541b\u306e\u3053\u3048\u306b\u3001<br>\u3069\u3046\u3057\u3066\u5fc3\u60f9\u304b\u308c\u3066<br>\u3057\u307e\u3046\u306e\u3060\u308d\u3046",
        },
        {
          name: "\u30ab\u30a4\u30e9",
          text: "\u521d\u3081\u3066\u77e5\u3063\u305f\u30dc\u30ab\u30ed\u306e\u97f3\u306f\u3001<br>\u521d\u97f3\u3060\u3063\u305f",
        },
        {
          name: "\u5de6\u99ac",
          text: "\u541b\u304c\u6765\u3066\u304b\u3089\u3001<br>\u672a\u6765\u304c\u5c11\u3057\u697d\u3057\u307f\u306b\u306a\u3063\u305f\u3002",
        },
        {
          name: "\u308d\u3080",
          text: "\u305f\u3063\u305f\u4e00\u672c\u306eCM\u3092\u898b\u3066\u3001<br>\u70b9\u306f\u7dda\u306b\u306a\u308a\u3001<br>\u4ffa\u306e\u5168\u3066\u304c\u59cb\u307e\u3063\u305f",
        },
        {
          name: "japan",
          text: "\u30df\u30af\u3055\u3093\u306e\u30cd\u30ae\u98df\u3079\u305f\u3044",
        },
        {
          name: "\u30bf\u30ed\u30a6",
          text: "\u30ad\u30df\u3092\u77e5\u3063\u305f\u65e5\u3001<br>\u521d\u3081\u3066\u6b4c\u3092\u597d\u304d\u3068\u601d\u3063\u305f\u3002",
        },
        {
          name: "\u5bdd\u305f\u304d\u308a\u592a\u90ce",
          text: "\u307f\u3063\u304f\u307f\u304f\u306b\u3055\u308c\u307e\u3057\u305f",
        },
        {
          name: "\u9761\u304b\u305b\u308b\u96fb\u5b50\u306e\u98a8",
          text: "\u305d\u306e\u30c4\u30a4\u30f3\u30c6\u30fc\u30eb\u306f\u9577\u304f\u3001<br>\u3069\u3053\u307e\u3067\u3082\u7d9a\u3044\u3066\u3044\u304f",
        },
        {
          name: "\u308d\u3044\u3068",
          text: "\u30df\u30af\u3055\u3093\u306e\u8272\u306b\u56f2\u307e\u308c\u3066\u751f\u304d\u305f\u3044",
        },
        {
          name: "\u3064\u30fc",
          text: "\u6700\u521d\u306f\u7532\u9ad8\u3044\u58f0\u306b\u6163\u308c\u306a\u304b\u3063\u305f\u3002<br>\u3067\u3082\u3001\u305d\u306e\u3046\u3061\u306b<br>\u611f\u60c5\u304c\u3042\u308b\u3063\u3066\u308f\u304b\u3063\u305f\u3002",
        },
        {
          name: "\u307a\u3093\u304e\u3093\u307a\u305f\u307a\u305f",
          text: "\u307f\u3063\u304f\u307f\u3063\u304f\u306b\u3055\u308c\u307e\u3057\u305f<br>(\u043e\u00b4\u2200`\u043e)",
        },
        {
          name: "\u6d77\u5cb8\u7dda",
          text: "\u5909\u308f\u3089\u306c\u594f\u3001<br>\u30dc\u30fc\u30ab\u30ed\u30a4\u30c9",
        },
        {
          name: "\u3075\u3041\u30fc\u308c",
          text: "\u30cd\u30ae\u3092\u98df\u3079\u306a\u304c\u3089\u6b4c\u3044\u51fa\u3059",
        },
        {
          name: "\u306a\u304e\u8336",
          text: "\u4f55\u3067\u3082\u30df\u30af\u8272\u306e\u3082\u306e\u3092<br>\u9078\u3093\u3067\u3057\u307e\u3046",
        },
        { name: "Zack 109 ", text: "Hatsune Miku<br>For Ever!!!" },
        {
          name: "\u6d17\u5264",
          text: "\u30cd\u30ae\u304c\u98df\u3048\u306d\u3047\u30fc",
        },
        {
          name: "1\u4eba\u306e\u66b4\u8d70\u4fe1",
          text: "\u221e\u3084\u7d42\u70b9\u306e\u305d\u306e\u5148\u307e\u3067\u3001<br>\u6b62\u307e\u3089\u306a\u304b\u3063\u305f\u8cb4\u5973\u3078<br>\u3064\u3044\u3066\u884c\u304d\u307e\u3059",
        },
        {
          name: "\u30df\u30af\u9244\u9053",
          text: "\u30df\u30af\u3055\u3093\u3068\u4e00\u7dd2\u306a\u3089<br>\u3069\u3053\u307e\u3067\u3082\u884c\u3051\u308b\u3002",
        },
        {
          name: "\u3084\u3079",
          text: "\u9752\u304f\u7f8e\u3057\u3044\u9aea\u3068<br>\u9752\u304f\u7acb\u6d3e\u306a\u8471",
        },
        {
          name: "\u3074\u3093\u3065\u3082",
          text: "\u6211\u521d\u97f3\u30df\u30af\u3092\u601d\u3046\u3001<br>\u6545\u306b\u521d\u97f3\u30df\u30af\u5728\u308a\u3002",
        },
        {
          name: "\u30aa\u30fc\u30b9\u30c8\u30ea\u30a2\u4eba",
          text: "\u30df\u30af\u4e07\u6b73",
        },
        {
          name: "\u5317\u56fd \u73e0",
          text: "\u541b\u306b\u51fa\u4f1a\u3048\u3066\u3001<br>\u4eba\u751f\u304c\u5909\u308f\u3063\u305f\u3002<br>\u3053\u308c\u304b\u3089\u3082\u3001<br>\u307f\u3093\u306a\u306e\u4e8b\u307f\u3063\u304f\u307f\u304f\u306b\u3057\u3066\u306d\u3002",
        },
        {
          name: "\u771f\u6728",
          text: "\u63fa\u308c\u308b\u9aea\u3092<br>\u305f\u3060\u305f\u3060\u898b\u3064\u3081\u3066\u3044\u305f\u3044",
        },
        {
          name: "nokia",
          text: "\u672a\u6765\u306e\u97f3\u3001<br>\u3082\u3063\u3068\u8074\u304b\u305b\u3066",
        },
        {
          name: "MNK",
          text: "\u3082\u306f\u3084\u521d\u97f3\u30df\u30af\u306b\u306a\u308a\u305f\u3044",
        },
        {
          name: "\u3084\u3086\u3088",
          text: "\u4eba\u9593\u306e\u58f0\u304c\u82e6\u624b\u3060\u3063\u305f\u3051\u3069<br>\u521d\u3081\u3066\u6b4c\u3092\u597d\u304d\u306b\u306a\u308c\u305f",
        },
        {
          name: "\u304f\u308a\u3085",
          text: "\u30df\u30af\u3055\u3093\u304c\u6765\u3066<br>\u79c1\u304c\u5909\u308f\u3063\u305f\u306e\u304b<br>\u4e16\u754c\u304c\u5909\u308f\u3063\u305f\u306e\u304b",
        },
        {
          name: "\u7a7a",
          text: "\u30cf\u30b8\u30e1\u30c6\u30ce\u604b\u306f\u3001<br>\u30cd\u30ae\u306e\u5473\u3060\u3063\u305f\u3002",
        },
        {
          name: "\u305d\u306c\u304d",
          text: "\u30df\u30af\u306e\u58f0\u3092\u8074\u3044\u305f\u305d\u306e\u77ac\u9593<br>\u672a\u6765\u306f\u59cb\u307e\u3063\u305f",
        },
        {
          name: "\u706f\u7089\u6a5f",
          text: "\u30df\u30af\u3055\u3093\u306e\u6b4c\u58f0\u304c\u8074\u3053\u3048\u308b\u304b\u3089\u3001<br>\u4eca\u65e5\u3082\u9811\u5f35\u308c\u308b",
        },
        {
          name: "\u30a6\u30aa\u30df\u30fc",
          text: "\u30c4\u30a4\u30f3\u30c6\u30fc\u30eb\u306e\u304a\u59eb\u69d8\u306b<br>\u6700\u9ad8\u306e\u795d\u798f\u3092",
        },
        {
          name: "\u3042\u30fc\u306d",
          text: "\u30df\u30af\u30df\u30af\u306b\u3055\u305b\u3089\u308c\u3066\u3093\u3088\uff01\u2661",
        },
        {
          name: "\u30a2\u30aa\u30eb\u30fc",
          text: "16\u6b73\u3002<br>\u540c\u3044\u5e74\u3067\u3044\u3089\u308c\u308b\u306e\u3082\u3042\u3068\u5c11\u3057",
        },
        {
          name: "\u3070\u306a\u306a\u3042\u3044\u3059",
          text: "\u541b\u306b\u4f55\u56de\u3082\u4f55\u56de\u3082\u6551\u308f\u308c\u305f\u3002<br>\u30df\u30af\u3001\u3042\u308a\u304c\u3068\u3046\u3002",
        },
        {
          name: "Ena\u4e38",
          text: "\u521d\u97f3\u30df\u30af\u3063\u3066\u3001<br>\u306a\u3093\u3067\u3042\u3093\u306a\u53ef\u611b\u3044\u306e\uff1f<br>\u795e\u306a\u306e\uff1f\u5929\u4f7f\u306a\u306e\uff1f",
        },
        {
          name: "\u307e\u3057\u307e\u308d",
          text: "\u30cd\u30ae\u304b\u3058\u308a\u305f\u3044\u306a",
        },
        {
          name: "\u679d\u8c46\u91ce\u90ce",
          text: "\u6c17\u3065\u3044\u305f\u3089\u4eba\u751f\u534a\u5206\u541b\u306e\u865c\u3001<br>\u304d\u3063\u3068\u305a\u3063\u3068\u611b\u3057\u3066\u308b",
        },
        {
          name: "\u304a\u306b\u304e\u308a\u3055\u3093",
          text: "\u541b\u306e\u6b4c\u3046\u8a00\u8449\u306f<br>\u5168\u90e8\u9b54\u6cd5\u306b\u306a\u308b\u3093\u3060\u3088",
        },
        {
          name: "\u3042\u3063\u3061\u3083\u3093",
          text: "\u6b4c\u59eb\u3068\u3059\u3054\u3057\u305f\u9752\u6625\u306e\u65e5\u3005\u3092\u3001<br>\u50d5\u306f\u305a\u3063\u3068\u5fd8\u308c\u306a\u3044\u3002",
        },
        {
          name: "\u30dc\u30ab\u30ed\u4e16\u4ee3\u306e\u30b4\u30ea\u30e9",
          text: "\u3082\u3063\u3068\u8f1d\u3044\u3066<br>\u8272\u3093\u306a\u4eba\u306b\u5e78\u305b\u3092\u5c4a\u3051\u3066\uff01",
        },
        {
          name: "\u306f\u30fc\u3082",
          text: "\u304b\u308f\u3044\u3044(\u76f4\u7403)",
        },
        {
          name: "\u3042\u3093\u305a",
          text: "\u30df\u30af\u3055\u3093\u306e\u6b4c\u58f0\u3067<br>\u307f\u3093\u306a\u306b\u7b11\u9854\u3092\uff01\uff01",
        },
        {
          name: "\u5c71\u7530\u592a\u90ce",
          text: "\u6c17\u304c\u3064\u3051\u3070\u305d\u3070\u306b\u3044\u305f",
        },
        {
          name: "\u304f\u3041w\u305bdrftgy\u3075\u3058\u3053lp",
          text: "\u30df\u30af\u306e\u8f1d\u304d\u306f\u6c38\u9060\u306b\u4e0d\u6ec5\u3060\u3002",
        },
        {
          name: "asuca",
          text: "\u541b\u304c\u3044\u306a\u3044\u4e16\u754c\u306f\u8003\u3048\u3089\u308c\u306a\u3044",
        },
        {
          name: "\u30ea\u30f3\u5ec3",
          text: "\u30df\u30af\u3055\u3093\u30cf\u30a1\u30cf\u30a1\u2026",
        },
        {
          name: "\u306a\u3064",
          text: "\u30df\u30af\u3061\u3083\u3093\u5927\u597d\u304d\uff01",
        },
        { name: "ykl", text: "\u521d\u97f3\u6211\u5ac1" },
        {
          name: "\u30df\u30af\u3055\u3093\u3092\u5fdc\u63f4\u3057\u3066\u3044\u308b\u6570\u5b5763",
          text: "\u30df\u30af\u3055\u3093\u306f\u4e16\u754c\u3092\u5909\u3048\u308b!<br>...\u304b\u3082\u3057\u308c\u306a\u3044",
        },
        {
          name: "Sail",
          text: "\u5b87\u5b99\u7b2c\u4e00\u7684\u516c\u4e3b\u6bbf\u4e0b",
        },
        {
          name: "\u677e\u679c",
          text: "\u521d\u97f3\u6211\u7231\u4f60\uff01\uff01\uff01\uff01",
        },
        {
          name: "pindu-mo",
          text: "\u3075\u3068\u898b\u305fGoogle\u306eCM<br>\u4f55\u304b\u304c\u982c\u3092\u4f1d\u3063\u305f<br>\u300c\u521d\u3081\u3066\u300d\u3068\u306e\u51fa\u4f1a\u3044\u3060\u3063\u305f",
        },
        {
          name: "\u307f\u3081",
          text: "\u751f\u304d\u3066\u308b\u3001<br>\u3063\u3066\u610f\u5473\u3092\u6559\u3048\u3066\u304f\u308c\u305f\u3002",
        },
        {
          name: "\u78a7\u96f2",
          text: "\u30df\u30af\u3068\u5171\u306b\u6b69\u3093\u3067\u304d\u305f\u9752\u6625",
        },
        {
          name: "\u30df\u30af\u306e\u30d5\u30a1\u30f3",
          text: "\u30df\u30af\u30ab\u30ef\u30a4\u30a4",
        },
        {
          name: "\u30ab\u30ef\u30c0",
          text: "\u541b\u306e\u30c4\u30a4\u30f3\u30c6\u30fc\u30eb\u306b<br>\u50d5\u306f\u306a\u308a\u305f\u3044",
        },
        {
          name: "\u9752\u7530",
          text: "\u30df\u30af\u304c\u30cd\u30ae\u3092\u3057\u3087\u3063\u3066\u304f\u308b",
        },
        {
          name: "\u3084\u307e\u305b",
          text: "\u541b\u306e\u3044\u308b\u590f\u306f<br>\u541b\u306e\u3044\u306a\u3044\u590f\u3088\u308a<br>\u305a\u3063\u3068\u7d20\u6575\u3060",
        },
        {
          name: "\u3068\u3089",
          text: "\u30c4\u30a4\u30f3\u30c6\u30fc\u30eb\u306b\u5dfb\u304b\u308c\u3066\u751f\u304d\u305f\u3044",
        },
        {
          name: "\u30b3\u30c0\u30de",
          text: "\u4eba\u751f\u306e\u534a\u5206\u306f\u30df\u30af\u3067\u3067\u304d\u3066\u3044\u308b",
        },
        {
          name: "ABZ",
          text: "\u305a\u3063\u3068\u30df\u30af\u3068\u4e00\u7dd2\u3002<br>\u3053\u308c\u304b\u3089\u3082\u3002",
        },
        {
          name: "\u901a\u308a\u3059\u304c\u308a",
          text: "\u77b3\u3092\u9589\u3058\u3066\u6d6e\u304b\u3076\u306e\u306f\u3044\u3064\u3082<br>\u541b\u306e\u9577\u3044\u30c4\u30a4\u30f3\u30c6\u30fc\u30eb",
        },
        {
          name: "\u3084\u307e\u305b",
          text: "\u541b\u306e\u6b4c\u58f0\u3092\u3082\u3063\u3068\u8074\u304b\u305b\u3066",
        },
        {
          name: "\u5922\u898b\u308b\u5c11\u5973",
          text: "\u30df\u30af\u306e\u96a3\u3067<br>\u3044\u3064\u304b\u79c1\u3082\u6b4c\u3044\u305f\u3044",
        },
      ];
      b.listDatas = [];
      return b;
    })(),
    t = (function () {
      function b() {}
      b.init = function () {
        for (var a = 0; a < this.list.length; a++)
          this.listDatas[a] = new k(a, this.list[a]);
      };
      b.list = [
        {
          points: [
            [0.5, 0.28],
            [0.5, 0.72],
          ],
          floors: [],
        },
        {
          points: [
            [0.72, 0.37],
            [0.28, 0.63],
          ],
          floors: [],
        },
        {
          points: [
            [0.22, 0.48],
            [0.78, 0.7],
            [0.22, 0.22],
          ],
          floors: [],
        },
        {
          points: [
            [0.28, 0.48],
            [0.56, 0.81],
            [0.83, 0.26],
          ],
          floors: [],
        },
        {
          points: [
            [0.5, 0.3],
            [0.78, 0.7],
            [0.78, 0.22],
            [0.22, 0.78],
          ],
          floors: [],
        },
        {
          points: [
            [0.5, 0.33],
            [0.5, 0.67],
          ],
          floors: [{ h: 0.04, y: 0.5, w: 0.28, angle: 0, x: 0.5 }],
        },
        {
          points: [
            [0.33, 0.19],
            [0.67, 0.74],
          ],
          floors: [{ h: 0.04, y: 0.37, w: 0.28, angle: -38, x: 0.39 }],
        },
        {
          points: [
            [0.72, 0.22],
            [0.22, 0.74],
          ],
          floors: [{ h: 0.04, y: 0.33, w: 0.44, angle: 45, x: 0.56 }],
        },
        {
          points: [
            [0.28, 0.19],
            [0.72, 0.41],
            [0.39, 0.81],
          ],
          floors: [
            { h: 0.04, y: 0.3, w: 0.22, angle: 0, x: 0.28 },
            { h: 0.04, y: 0.52, w: 0.22, angle: 0, x: 0.72 },
          ],
        },
        {
          points: [
            [0.28, 0.26],
            [0.28, 0.78],
          ],
          floors: [{ h: 0.04, y: 0.52, w: 0.56, angle: 0, x: 0.28 }],
        },
        {
          points: [
            [0.28, 0.52],
            [0.72, 0.52],
          ],
          floors: [],
        },
        {
          points: [
            [0.5, 0.33],
            [0.22, 0.7],
            [0.78, 0.7],
          ],
          floors: [],
        },
        {
          points: [
            [0.28, 0.7],
            [0.72, 0.7],
            [0.28, 0.3],
            [0.72, 0.3],
          ],
          floors: [],
        },
        {
          points: [
            [0.28, 0.3],
            [0.72, 0.74],
            [0.83, 0.85],
            [0.17, 0.19],
          ],
          floors: [{ h: 0.04, y: 0.52, w: 0.22, angle: -35, x: 0.5 }],
        },
        {
          points: [
            [0.5, 0.37],
            [0.5, 0.67],
            [0.78, 0.22],
            [0.78, 0.81],
            [0.22, 0.52],
          ],
          floors: [],
        },
        {
          points: [
            [0.5, 0.3],
            [0.5, 0.7],
          ],
          floors: [
            { y: 0.5, h: 0.03, sx: 0.5, w: 0.25, angle: 0, mx: 0.4, x: 0.3 },
          ],
        },
        {
          points: [
            [0.8, 0.27],
            [0.2, 0.73],
          ],
          floors: [
            { my: 0.4, y: 0.3, sy: 0.5, h: 0.03, w: 0.25, angle: 0, x: 0.5 },
          ],
        },
        {
          points: [
            [0.5, 0.27],
            [0.5, 0.73],
          ],
          floors: [
            { y: 0.5, h: 0.15, sx: 1, w: 0.3, angle: 0, mx: 0.7, x: 0.15 },
          ],
        },
        {
          points: [
            [0.4, 0.2],
            [0.6, 0.8],
          ],
          floors: [
            { y: 0.4, h: 0.13, sx: 0.9, w: 0.05, angle: 0, mx: 0.6, x: 0.2 },
            { y: 0.6, h: 0.13, sx: 0.71, w: 0.05, angle: 0, mx: -0.6, x: 0.8 },
          ],
        },
        {
          points: [
            [0.5, 0.23],
            [0.5, 0.77],
            [0.5, 0.5],
          ],
          floors: [
            { y: 0.37, h: 0.03, sx: 1.01, w: 0.2, angle: 0, mx: 0.4, x: 0.3 },
            { y: 0.63, h: 0.03, sx: 0.77, w: 0.3, angle: 0, mx: 0.4, x: 0.3 },
          ],
        },
        {
          points: [
            [0.5, 0.23],
            [0.5, 0.77],
          ],
          floors: [{ y: 0.5, angle: 0, r: 0.18, x: 0.5 }],
        },
        {
          points: [
            [0.2, 0.2],
            [0.8, 0.8],
          ],
          floors: [
            {
              my: -0.2,
              y: 0.6,
              r: 0.15,
              sy: 0.6,
              sx: 0.6,
              angle: 0,
              mx: 0.2,
              x: 0.4,
            },
          ],
        },
        {
          points: [
            [0.35, 0.2],
            [0.65, 0.8],
          ],
          floors: [
            { my: 0.2, y: 0.4, angle: 0, sy: 0.55, r: 0.15, x: 0.5 },
            { y: 0.43, angle: 0, r: 0.12, x: 0.95 },
            { y: 0.57, angle: 0, r: 0.13, x: 0.05 },
          ],
        },
        {
          points: [
            [0.5, 0.23],
            [0.5, 0.77],
          ],
          floors: [{ y: 0.5, r: 0.1, sx: 0.9, angle: 0, mx: 0.4, x: 0.3 }],
        },
        {
          points: [
            [0.25, 0.2],
            [0.25, 0.83],
            [0.85, 0.43],
          ],
          floors: [{ my: 0.5, y: 0.33, angle: 0, sy: 0.6, r: 0.1, x: 0.53 }],
        },
        {
          points: [
            [0.5, 0.23],
            [0.8, 0.77],
            [0.2, 0.77],
          ],
          floors: [
            { my: 0.25, y: 0.3, sy: 0.5, h: 0.33, w: 0.05, angle: 0, x: 0.35 },
            { my: 0.25, y: 0.3, sy: 0.5, h: 0.33, w: 0.05, angle: 0, x: 0.65 },
          ],
        },
        {
          points: [
            [0.2, 0.2],
            [0.8, 0.8],
            [0.8, 0.37],
            [0.2, 0.63],
          ],
          floors: [
            { my: 0.1, y: 0.33, sy: 0.5, h: 0.03, w: 0.45, angle: 0, x: 0.23 },
            { my: 0.1, y: 0.6, sy: 0.5, h: 0.03, w: 0.45, angle: 0, x: 0.78 },
          ],
        },
        {
          points: [
            [0.25, 0.23],
            [0.25, 0.77],
            [0.8, 0.4],
            [0.8, 0.6],
          ],
          floors: [
            { my: 0.5, y: 0.25, sy: 0.85, h: 0.17, w: 0.05, angle: 0, x: 0.45 },
            { my: 0.5, y: 0.25, sy: 0.61, h: 0.17, w: 0.05, angle: 0, x: 0.55 },
          ],
        },
        {
          points: [
            [0.5, 0.2],
            [0.2, 0.83],
            [0.8, 0.73],
          ],
          floors: [
            { y: 0.43, h: 0.03, sx: 0.7, w: 0.3, angle: 0, mx: -0.4, x: 0.7 },
            { y: 0.53, h: 0.03, sx: 0.7, w: 0.3, angle: 0, mx: 0.4, x: 0.3 },
            { my: -0.25, y: 0.87, sy: 0.45, h: 0.03, w: 0.3, angle: 0, x: 0.5 },
          ],
        },
        {
          points: [
            [0.5, 0.37],
            [0.5, 0.63],
            [0.8, 0.5],
            [0.2, 0.23],
            [0.2, 0.77],
          ],
          floors: [
            { my: 0.6, y: 0.2, sy: 0.77, h: 0.23, w: 0.05, angle: 0, x: 0.35 },
            { my: 0.4, y: 0.3, sy: 0.99, h: 0.23, w: 0.05, angle: 0, x: 0.65 },
          ],
        },
        {
          points: [
            [0.5, 0.23],
            [0.5, 0.77],
          ],
          floors: [{ y: 0.5, h: 0.03, rot: 120, w: 0.45, angle: 0, x: 0.5 }],
        },
        {
          points: [
            [0.7, 0.17],
            [0.3, 0.83],
          ],
          floors: [
            { y: 0.4, h: 0.03, rot: 30, w: 0.35, angle: 0, x: 0.65 },
            { y: 0.53, h: 0.03, rot: -30, w: 0.35, angle: 0, x: 0.35 },
          ],
        },
        {
          points: [
            [0.23, 0.2],
            [0.78, 0.8],
          ],
          floors: [{ y: 0.5, h: 0.3, rot: -60, w: 0.45, angle: 0, x: 0.5 }],
        },
        {
          points: [
            [0.8, 0.2],
            [0.2, 0.8],
          ],
          floors: [{ y: 0.5, h: 0.03, rot: -38, w: 1, angle: 0, x: 0.5 }],
        },
        {
          points: [
            [0.5, 0.23],
            [0.25, 0.77],
            [0.75, 0.77],
          ],
          floors: [
            { y: 0.53, h: 0.03, rot: 45, w: 0.5, angle: 0, x: 0.25 },
            { y: 0.53, h: 0.03, rot: -33, w: 0.5, angle: 0, x: 0.75 },
          ],
        },
        {
          points: [
            [0.8, 0.23],
            [0.8, 0.77],
            [0.2, 0.5],
          ],
          floors: [
            { y: 0.5, h: 0.17, rot: 55, w: 0.25, angle: 0, x: 0.65 },
            { y: 0.23, h: 0.17, rot: -65, w: 0.25, angle: 0, x: 0.35 },
            { y: 0.77, h: 0.17, rot: -75, w: 0.25, angle: 0, x: 0.35 },
          ],
        },
        {
          points: [
            [0.5, 0.2],
            [0.2, 0.83],
            [0.8, 0.73],
          ],
          floors: [
            { y: 0.35, h: 0.03, sx: 0.82, w: 0.4, angle: 0, mx: 0.4, x: 0.3 },
            { y: 0.47, h: 0.03, sx: 1.1, w: 0.2, angle: 0, mx: 0.6, x: 0.2 },
            { y: 0.58, h: 0.03, sx: 0.66, w: 0.3, angle: 0, mx: 0.6, x: 0.2 },
            { y: 0.83, h: 0.03, rot: 25, w: 0.37, angle: 0, x: 0.5 },
          ],
        },
        {
          points: [
            [0.2, 0.17],
            [0.2, 0.65],
            [0.8, 0.33],
            [0.8, 0.83],
          ],
          floors: [
            { y: 0.5, h: 0.03, sx: 0.55, w: 0.35, angle: 0, mx: 0.6, x: 0.2 },
            {
              my: 0.6,
              y: 0.2,
              sy: 0.3,
              h: 0.3,
              rot: -47,
              w: 0.05,
              angle: 0,
              x: 0.5,
            },
          ],
        },
        {
          points: [
            [0.8, 0.2],
            [0.2, 0.8],
            [0.7, 0.5],
            [0.3, 0.5],
          ],
          floors: [
            {
              my: 0.4,
              y: 0.3,
              sy: 0.45,
              h: 0.03,
              rot: -20,
              w: 0.3,
              angle: 0,
              x: 0.25,
            },
            {
              my: -0.4,
              y: 0.7,
              sy: 0.45,
              h: 0.03,
              rot: 20,
              w: 0.3,
              angle: 0,
              x: 0.75,
            },
          ],
        },
        {
          points: [
            [0.5, 0.4],
            [0.5, 0.6],
          ],
          floors: [],
        },
      ];
      b.listDatas = [];
      return b;
    })(),
    v = (function () {
      function b() {
        this._key = "framiku";
        var a = localStorage.getItem(this._key);
        this._obj = {};
        this._obj.stage = 0;
        this._obj.words = [];
        this._obj.times = [];
        this._obj.kotobas = [];
        this._wordMax = n.list.length;
        try {
          a && (this._obj = JSON.parse(a));
        } catch (e) {}
      }
      b.prototype.getStage = function () {
        return 0 <= this._obj.stage ? this._obj.stage : 0;
      };
      b.prototype.setStage = function (a) {
        this._obj.stage < a && ((this._obj.stage = a), this._update());
      };
      b.prototype.getTimes = function () {
        return this._obj.times;
      };
      b.prototype.getTime = function (a) {
        return this._obj.times[a];
      };
      b.prototype.setTime = function (a, e) {
        if (e < this._obj.times[a] || !this._obj.times[a])
          (this._obj.times[a] = e), this._update();
      };
      b.prototype.getWordNums = function () {
        return this._obj.kotobas;
      };
      b.prototype.getWordMax = function () {
        return this._wordMax;
      };
      b.prototype.checkComplete = function () {
        return this.getWordMax() == this.getWordNums().length;
      };
      b.prototype.getNewWord = function () {
        var a = c.storage.getNewWordId();
        return n.listDatas[a];
      };
      b.prototype.getNewWordId = function () {
        for (
          var a = aidn.math.randInt(0, this._wordMax - 1), e = 0;
          e < this._wordMax;
          e++
        ) {
          var h = (e + a) % this._wordMax;
          if (!this._obj.words[h])
            return (
              this._obj.kotobas.length < this._wordMax &&
                this._obj.kotobas.push(h),
              (this._obj.words[h] = 1),
              this._update(),
              h
            );
        }
        this._obj.words = [];
        return 0 < this._wordMax ? this.getNewWordId() : null;
      };
      b.prototype._update = function () {
        var a = JSON.stringify(this._obj);
        try {
          localStorage.setItem(this._key, a);
        } catch (e) {}
      };
      return b;
    })(),
    z = (function () {
      function b() {
        this.stageClearNum = c.storage.getStage();
        this.stageMax = t.list.length - 1;
        var a = aidn.util.getQuery();
        1 == parseInt(a.debug) && (this.stageClearNum = this.stageMax);
        this.stageNow = this.stageClearNum;
        this.clearRate = 0;
        for (a = this.stageMax; 0 <= a; a--)
          if (c.storage.getTime(a)) {
            this.clearRate = a / this.stageMax;
            break;
          }
        this._setClearNum(this.stageClearNum);
      }
      b.prototype._setClearNum = function (a) {
        this.stageClearNum <= a &&
          a <= this.stageMax &&
          ((this.stageClearNum = a),
          c.storage.getTime(a) && (this.clearRate = a / this.stageMax),
          c.storage.setStage(a));
      };
      return b;
    })(),
    E = (function () {
      return function (b) {
        0 < b.r
          ? ((this.isCircle = !0), (this.r = b.r))
          : ((this.isCircle = !1), (this.w = b.w), (this.h = b.h));
        this.rot = this.mx = this.sx = this.my = this.sy = this.x = this.y = 0;
        isNaN(b.x) || (this.x = b.x);
        isNaN(b.y) || (this.y = b.y);
        this.angle = 0;
        isNaN(b.angle) || (this.angle = aidn.math.toRad(b.angle));
        isNaN(b.rot) || (this.rot = aidn.math.toRad(b.rot));
        isNaN(b.mx) || (this.mx = b.mx);
        isNaN(b.sx) || (this.sx = b.sx);
        isNaN(b.my) || (this.my = b.my);
        isNaN(b.sy) || (this.sy = b.sy);
        this.isStatic = !0;
        if (0 < this.sx || 0 < this.sy || 0 > this.rot || 0 < this.rot)
          this.isStatic = !1;
      };
    })(),
    k = (function () {
      return function (b, a) {
        this.id = b;
        this.points = [];
        this.floors = [];
        this.offset = aidn.math.randInt(0, m.SE_HITS.length - 1);
        for (var e = a.points, h = e.length, c = 0; c < h; c++)
          this.points[c] = new x(e[c][0], e[c][1]);
        if (a.floors)
          for (h = a.floors.length, c = 0; c < h; c++)
            this.floors[c] = new E(a.floors[c]);
      };
    })(),
    l = (function () {
      return function (b, a) {
        this.id = b;
        this.text = a.text;
        this.name = a.name;
      };
    })(),
    F = (function (b) {
      function a() {
        b.call(this);
        var a = aidn.init.basepath,
          h = "?" + aidn.init.ver;
        this.add(
          new aidnlib.JsonBase64LoadCommand(
            a + "data/sound/main.json" + h,
            aidnlib.JsonBase64Type.PIXI
          ),
          20
        );
        this.add(new aidnlib.AudioLoadCommand(a + p.BGM_PATH + h, p.BGM_PATH));
      }
      __extends(a, b);
      return a;
    })(aidnlib.SequentialCommand),
    m = (function () {
      function b() {}
      b.init = function () {
        aidn.util.shuffleArray(this.SE_HITS);
      };
      b.play = function (a) {
        var e = aidnlib.Assets.get(a);
        if (e) {
          var h = 1;
          switch (a) {
            case this.SE_FIX_OBJ:
            case this.SE_FIX_FL:
              h *= 0.9;
              break;
            case this.SE_CHANGE_BT:
              h *= 0.35;
          }
          for (var b = this.SE_HITS.length, c = 0; c < b; c++)
            a == this.SE_HITS[c] && (h *= 1.35);
          e.volume = h;
          e.stop();
          e.play();
        }
      };
      b.playDisp = function (a) {
        void 0 === a && (a = -1);
        0 > a && (a = aidn.math.randInt(0, r.colorTotal - 1));
        0.5 > Math.random() && (a += r.colorTotal);
        var e = aidnlib.Assets.get(a + ".mp3");
        if (e) {
          e.volume = 0.9;
          switch (a) {
            case 1:
              e.volume = 1.3 * 0.9;
              break;
            case 2:
              e.volume = 1.6 * 0.9;
              break;
            case 3:
              e.volume = 1.3 * 0.9;
              break;
            case 5:
              e.volume = 1.53;
              break;
            case 9:
              e.volume = 0.8 * 0.9;
              break;
            case 17:
              e.volume = 0.8 * 0.9;
              break;
            case 22:
              e.volume = 0.81;
              break;
            case 25:
              e.volume = 0.63;
              break;
            case 29:
              e.volume = 1.08;
          }
          e.stop();
          e.play();
        }
      };
      b.SE_FIX_OBJ = "fix_obj.mp3";
      b.SE_FIX_FL = "fix_fl.mp3";
      b.SE_CHANGE_BT = "change_bt.mp3";
      b.SE_HIT_POINT = "hit_point.mp3";
      b.SE_HIT_POINT_LAST = "hit_point_last.mp3";
      b.SE_HITS = [
        "hit_point.mp3",
        "hit_point_last.mp3",
        "hit_point2.mp3",
        "hit_point3.mp3",
        "hit_point4.mp3",
      ];
      return b;
    })(),
    r = (function () {
      function b() {}
      Object.defineProperty(b, "colorTotal", {
        get: function () {
          return this._cols.length;
        },
        enumerable: !0,
        configurable: !0,
      });
      b.getRandomId = function (a) {
        var e = -1;
        switch (a) {
          case f.OBJ_CIR:
            e = Math.floor(this._cols.length * Math.random());
        }
        return e;
      };
      b.getColor = function (a, e) {
        return this._cols[e];
      };
      b._cols = [
        13430510, 8965324, 9099756, 961181, 1089457, 34969, 13934238, 16110792,
        15488645, 16531063, 6905703, 5327693, 16777215, 6737100, 15493013,
        10088157,
      ];
      return b;
    })(),
    q = (function () {
      function b() {}
      b.keta = function (a, e, h) {
        void 0 === h && (h = " ");
        a += "";
        for (var b = a.length; b < e; b++) a = h + a;
        return a;
      };
      b.getSpanText = function (a, e) {
        void 0 === e && (e = null);
        if (e) {
          for (var h = a.split(e), b = "", c = h.length, d = 0; d < c; d++)
            (b += this.getSpanText(h[d])), d < c - 1 && (b += e);
          return b;
        }
        c = a.length;
        h = "";
        for (d = 0; d < c; d++)
          (b = a.charAt(d)),
            (h =
              " " == b || "\u3000" == b
                ? h + b
                : h + ("<span>" + b + "</span>"));
        return h;
      };
      b.getTimeText = function (a) {
        a = a.toString().split(".");
        var e = a[1],
          e = e ? (2 <= e.length ? e.substr(0, 2) : e + "0") : "00";
        return a[0] + "." + e;
      };
      return b;
    })(),
    H = (function () {
      function b() {
        this._cols = [
          13430510, 8965324, 9099756, 961181, 1089457, 34969, 13934238,
          16110792, 15488645, 16531063, 6905703, 5327693,
        ];
        this._list = [
          "Amiri",
          "Comfortaa",
          "Baloo",
          "Barrio",
          "Architects Daughter",
        ];
        this._interval = 0.06;
        this._mikuComplete = !1;
        var a = "";
        this._em = $("#top h1");
        for (
          var e = this._em.html().split('<br class="bl">'), h = e.length, b = 0;
          b < h;
          b++
        ) {
          for (var c = e[b].length, d = 0; d < c; d++)
            var f = e[b].charAt(d),
              a = " " == f ? a + f : a + ("<span>" + f + "</span>");
          b < h - 1 && (a += '<br class="bl">');
        }
        this._em.html(a);
        this._tg = $("#top h1 span");
      }
      b.prototype.start = function () {
        var a = this;
        this._time = 0;
        c.main.removeUpdate(this._updateId);
        this._updateId = c.main.addUpdate(function () {
          return a._update();
        });
      };
      b.prototype.stop = function () {
        c.main.removeUpdate(this._updateId);
      };
      b.prototype._update = function () {
        this._time += c.delta;
        if (!(this._time < this._interval)) {
          this._time -= this._interval;
          for (var a = 0; 4 > a; a++) this.__update();
        }
      };
      b.prototype.__update = function () {
        var a = this._tg.length,
          e = Math.floor(Math.random() * a),
          a = Math.floor(Math.random() * this._list.length),
          e = $(this._tg.get(e));
        e.css("font-family", this._list[a]);
        Math.random();
        0.4 > Math.random()
          ? e.css("color", "#fff")
          : 0.8 > Math.random() &&
            ((a = this._cols[Math.floor(this._cols.length * Math.random())]),
            e.css("color", "#" + a.toString(16)));
      };
      return b;
    })(),
    I = (function () {
      function b() {
        this._randmStr = "=\u25a0\u25a1@#$%&0123456789";
        this._interval = 0.06;
        this.__ft = 1.2;
        this._em = $("#stage_title");
      }
      b.prototype.show = function (a) {
        var e = this;
        this._str = a;
        this._len = a.length;
        this._time = this.__t = 0;
        this._em.stop().fadeIn(0);
        a = q.getSpanText(this._str);
        this._em.html(a);
        this._emSpan = this._em.children("span");
        c.main.removeUpdate(this._updateId);
        this._updateId = c.main.addUpdate(function () {
          return e._update();
        });
      };
      b.prototype._update = function () {
        this.__t += c.delta;
        this._time += c.delta;
        if (!(this._time < this._interval)) {
          this._time -= this._interval;
          for (var a = this._len, e = 0; e < a; e++) this.__update(e);
          this.__ft <= this.__t &&
            (c.main.removeUpdate(this._updateId),
            this._em.stop().delay(1500).fadeOut(400, "linear"));
        }
      };
      b.prototype.__update = function (a) {
        var e = $(this._emSpan.get(a));
        if (this.__t < this.__ft) {
          a = this._randmStr;
          var h = aidn.math.rand(-50, 50),
            b = aidn.math.rand(-50, 50);
          e.text(a.charAt(aidn.math.randInt(0, a.length - 1)));
          e.css({ left: b, top: h });
        } else e.text(this._str.charAt(a)), e.css({ left: 0, top: 0 });
      };
      return b;
    })(),
    A = (function () {
      function b(a) {
        this._randmStr = "=\u25a0\u25a1@#$%&0123456789";
        this._interval = 0.036;
        this._em = a;
      }
      b.prototype.init = function (a) {
        this._str = a
          .split("<br>")
          .join("")
          .split(" ")
          .join("")
          .split("\u3000")
          .join("");
        this._len = this._str.length;
        a = q.getSpanText(a, "<br>");
        this._em.html(a);
        this._emSpan = this._em.children("span");
        this._w = 1.1 * parseFloat(this._em.css("font-size"));
        a = this._emSpan.length;
        for (var e = 0; e < a; e++) {
          var h = $(this._emSpan.get(e));
          h.css("visibility", "hidden");
          h.css("width", this._w);
        }
        this._em.css("visibility", "hidden");
      };
      b.prototype.show = function (a) {
        var e = this;
        this._em.css("visibility", "visible");
        this._complete = a;
        this._ct = this._now = this._time = 0;
        c.main.removeUpdate(this._updateId);
        this._updateId = c.main.addUpdate(function () {
          return e._update();
        });
      };
      b.prototype.skip = function () {
        c.main.removeUpdate(this._updateId);
      };
      b.prototype._update = function () {
        this._time += c.delta;
        if (!(this._time < this._interval)) {
          this._time -= this._interval;
          this._ct++;
          for (
            var a = 1.3 * this._w,
              e = this._randmStr,
              h = $(this._emSpan.get(this._now)),
              b = 1;
            0 <= b;
            b--
          ) {
            var d = aidn.math.rand(-a, a),
              f = aidn.math.rand(-a, a),
              g = aidn.math.rand(2, 8);
            if (0 == b)
              if (3 > this._ct)
                h.text(e.charAt(aidn.math.randInt(0, e.length - 1))),
                  h.css({
                    top: d,
                    left: f,
                    visibility: "visible",
                    transform: "scale(" + g + ")",
                  });
              else {
                h.text(this._str.charAt(this._now));
                h.css({ top: 0, left: 0, transform: "scale(1)" });
                this._now++;
                this._ct = 0;
                if (
                  this._len - 2 == this._now ||
                  (0 >= this._len - 2 && 1 == this._now)
                ) {
                  this._complete();
                  break;
                }
                if (this._len <= this._now) {
                  c.main.removeUpdate(this._updateId);
                  break;
                }
              }
            else
              this._now + b < this._len &&
                ($(this._emSpan.get(this._now + b)),
                h.text(e.charAt(aidn.math.randInt(0, e.length - 1))),
                h.css({
                  top: d,
                  left: f,
                  visibility: "visible",
                  transform: "scale(" + g + ")",
                }));
          }
        }
      };
      return b;
    })(),
    B = (function () {
      function b(a) {
        void 0 === a && (a = !1);
        var e = "#words";
        a && (e = "#kotoba");
        this._isKotoba = a;
        this._em = $(e);
        this._subText = new A($(e + " .text"));
        this._subName = new A($(e + " .name"));
      }
      b.prototype.ready = function () {
        this._data = c.storage.getNewWord();
      };
      b.prototype.setData = function (a) {
        void 0 === a && (a = -1);
        0 <= a && a < n.list.length && (this._data = n.listDatas[a]);
      };
      b.prototype.show = function (a) {
        void 0 === a && (a = null);
        this._complete = a;
        this._show();
      };
      b.prototype.skip = function () {
        this._subName.skip();
        this._subText.skip();
        this._em.stop().fadeOut(200, "linear", this._complete);
        this._complete = null;
      };
      b.prototype._show = function () {
        var a = this;
        this._subText.init(this._data.text);
        this._subName.init(this._data.name);
        this._subText.show(function () {
          return a._completeText();
        });
        this._em.stop().fadeIn(0);
      };
      b.prototype._completeText = function () {
        var a = this;
        this._subName.show(function () {
          return a._completeName();
        });
      };
      b.prototype._completeName = function () {
        this._isKotoba ||
          this._em.stop().delay(2500).fadeOut(300, "linear", this._complete);
      };
      return b;
    })(),
    J = (function () {
      function b() {
        this._emTime = $("#time");
        this._emTimeEnd = $("#time_end");
      }
      b.prototype.start = function () {
        var a = this;
        this._stime = aidn.util.getTime();
        c.main.removeUpdate(this._updateId);
        this._updateId = c.main.addUpdate(function () {
          return a._update();
        });
      };
      b.prototype.getBest = function () {
        var a = c.storage.getTime(c.user.stageNow);
        return a ? q.getTimeText(a) : "-";
      };
      b.prototype.end = function () {
        c.main.removeUpdate(this._updateId);
        this._update(!0);
      };
      b.prototype.stop = function () {
        c.main.removeUpdate(this._updateId);
      };
      b.prototype._update = function (a) {
        void 0 === a && (a = !1);
        var e = aidn.util.getTime() - this._stime;
        this._setTime(e, a);
      };
      b.prototype._setTime = function (a, e) {
        void 0 === e && (e = !1);
        a = Math.floor(a / 10) / 100;
        var b = q.getTimeText(a);
        this._emTime.text(b);
        e && (this._emTimeEnd.text(b), c.storage.setTime(c.user.stageNow, a));
      };
      return b;
    })(),
    G = (function () {
      function b() {
        this._loaded = !1;
        this._preTime = 0;
        this.__updateId = -1;
        this.__updateFuncs = {};
        this._kotobaNow = 0;
      }
      Object.defineProperty(b.prototype, "audio", {
        get: function () {
          return this._audio;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "pixi", {
        get: function () {
          return this._pixi;
        },
        enumerable: !0,
        configurable: !0,
      });
      b.prototype.init = function () {
        var a = this;
        PIXI.utils.skipHello();
        c.ok = aidn.util.webaudio;
        c.main = this;
        c.isMobile = aidn.util.checkMobile();
        aidn.util.needExpandArea(!0);
        aidn.window.addDummyDiv();
        aidn.window.resize(function () {
          return a._resize();
        });
        n.init();
        t.init();
        var e = p.SHARE_URL;
        $("#bt_github").click(function (a) {
          window.open("https://github.com/ChisatoNishikigi73/fra_miku_clone", "_blank");
        });
        $("#bt_tw").click(function (a) {
          aidn.social.shareTw(e, !0, document.title, "daniwell_aidn");
        });
        $("#bt_fb").click(function (a) {
          aidn.social.shareFb(e, !0);
        });
        $("#bt_gp").click(function (a) {
          aidn.social.shareGp(e, !0);
        });
        $("#bt_back").click(function (e) {
          return a._clickBack(e);
        });
        aidn.util.enabledFullscreen() &&
          ($("#bt_full").css("display", "block"),
          $("#bt_full").click(function (e) {
            return a._clickFull(e);
          }));
        c.isMobile
          ? $(".pc").css("display", "none")
          : $(".mobile").css("display", "none");
        if (c.ok) {
          m.init();
          c.storage = new v();
          c.user = new z();
          $(".ng").css("display", "none");
          $("#bt_play").click(function (e) {
            return a._clickPlay(e);
          });
          $("#bt_kotoba").click(function (e) {
            return a._clickKotoba(e);
          });
          $("#bt_start").click(function (e) {
            return a._clickStart(e);
          });
          $("#bt_howto").click(function (e) {
            return a._clickHowto(e);
          });
          $("#bt_about").click(function (e) {
            return a._clickAbout(e);
          });
          $("#bt_retry").click(function (e) {
            return a._clickRetry(e);
          });
          $("#bt_next").click(function (e) {
            return a._clickNext(e);
          });
          $("#bt_back2").click(function (e) {
            return a._clickBack2(e);
          });
          $("#bt_left").on("mousedown touchstart", function (e) {
            return a._clickLeft(e);
          });
          $("#bt_right").on("mousedown touchstart", function (e) {
            return a._clickRight(e);
          });
          $("#bt_left_k").on("mousedown touchstart", function (e) {
            return a._clickLeftK(e);
          });
          $("#bt_right_k").on("mousedown touchstart", function (e) {
            return a._clickRightK(e);
          });
          var b = this;
          $("#footer p").on("mousedown touchstart", function (a) {
            var e = $("#footer p").index(this);
            b._clickFooterBt(a, e);
          });
          $($("#footer p")[1]).hide();
          c.storage.checkComplete() &&
            ($("body").attr("id", "miku"), $("#miku_bg").fadeIn(300, "linear"));
          this._time = new J();
          this._pixi = new K();
          this._pixi.init();
          this._stageTitle = new I();
          this._mikuWords = new B();
          this._mikuKotoba = new B(!0);
          this._updateStagenum();
          this._update();
        } else $(".ok").css("display", "none"), $("#attx").text("");
        aidn.util.checkJapanese()
          ? $(".en").css("display", "none")
          : $(".ja").css("display", "none");
        $("#loading_first").fadeOut(200, "linear");
        $("#top").fadeIn(300, "linear");
        this._titleAnim = new H();
        this._titleAnim.start();
      };
      b.prototype.showState = function (a) {
        var e = c.state;
        c.state = a;
        this._pixi.showState(e);
        switch (a) {
          case d.TOP:
            this._showTop(e);
            break;
          case d.LOADING:
            this._showLoading();
            break;
          case d.MAIN:
            this._showMain();
            break;
          case d.END:
            this._showEnd();
        }
      };
      b.prototype._showTop = function (a) {
        var e = this;
        c.storage.checkComplete() &&
          ($("body").attr("id", "miku"), $("#miku_bg").fadeIn(300, "linear"));
        this._titleAnim.start();
        this._audioPlaying = !1;
        $("#top").stop().fadeIn(300, "linear");
        $("#ready,#kotoba,#kotoba_head,#howto,#about")
          .stop()
          .fadeOut(200, "linear");
        $("#main,#footer,#time").stop().fadeOut(200, "linear");
        $("#end,#words").stop().fadeOut(200, "linear");
        $("#view").off("mousedown touchstart");
        this._time.stop();
        this._updateStagenum();
        switch (a) {
          case d.MAIN:
          case d.END:
            TweenMax.to(this._audio, 1, {
              volume: 0,
              ease: Power2.easeOut,
              onComplete: function () {
                return e._audioComplete();
              },
            }).play(),
              aidn.util.enabledFullscreen() &&
                $("#bt_full").fadeIn(300, "linear");
        }
      };
      b.prototype._showLoading = function () {
        var a = this;
        c.storage.checkComplete() && $("#miku_bg").fadeOut(200, "linear");
        $("#ready").stop().fadeOut(200, "linear");
        $("#loading").stop().fadeIn(300, "linear");
        $("#loading").width(0);
        this._loaded
          ? this._initComplete(null)
          : ((this._initCmd = new F()),
            this._initCmd.addEventListener(
              aidnlib.CommandEvent.COMPLETE,
              function (e) {
                return a._initComplete(e);
              }
            ),
            this._initCmd.addEventListener(
              aidnlib.CommandEvent.PROGRESS,
              function (e) {
                return a._initProgress(e);
              }
            ),
            this._initCmd.execute());
      };
      b.prototype._showMain = function () {
        this._stageTitle.show(q.keta(c.user.stageNow, 2, "0"));
        if (!this._audioPlaying) {
          try {
            TweenMax.killTweensOf(this._audio), this._audio.stop();
          } catch (a) {}
          this._audio.play(0, !0);
          this._audio.volume = 0;
          TweenMax.to(this._audio, 1.5, {
            volume: 1,
            ease: Power2.easeIn,
          }).play();
        }
        this._audioPlaying = !0;
        this._selectBt(f.FL_BOX);
        $("#main,#footer,#time").stop().fadeIn(300, "linear");
        this._time.start();
        aidn.util.enabledFullscreen() && $("#bt_full").fadeOut(300, "linear");
      };
      b.prototype._showEnd = function () {
        this._mikuWords.ready();
        this._time.end();
        $("#main,#footer").stop().fadeOut(300, "linear");
      };
      b.prototype.__showEndCover = function () {
        var a = this;
        $("#time").stop().fadeOut(0);
        c.state == d.END &&
          (this._mikuWords.show(function () {
            return a._hideCover();
          }),
          $("#view").on("mousedown touchstart", function (e) {
            return a.__showEndSkip(e);
          }));
      };
      b.prototype.__showEndSkip = function (a) {
        a.preventDefault();
        this._mikuWords.skip();
        $("#view").off("mousedown touchstart");
      };
      b.prototype._hideCover = function () {
        if (c.state == d.END) {
          $("#view").off("mousedown touchstart");
          $("#end").stop().fadeIn(0);
          var a = c.user,
            e = q.keta(a.stageNow, 2, "0");
          $("#end h2").text(e);
          var e = c.storage.getWordMax(),
            b = c.storage.getWordNums().length,
            e = "ARCHIVE: " + Math.round((b / e) * 1e3) / 10 + " %";
          $("#end h3").text(e);
          a.stageNow < a.stageMax
            ? (a._setClearNum(a.stageNow + 1),
              $("#bt_next").show(),
              $("#bt_retry").hide())
            : ($("#bt_next").hide(), $("#bt_retry").show());
          c.main.pixi.__hideCover();
        }
      };
      b.prototype.addUpdate = function (a) {
        this.__updateId++;
        this.__updateFuncs[this.__updateId] = a;
        return this.__updateId;
      };
      b.prototype.removeUpdate = function (a) {
        this.__updateFuncs[a] && delete this.__updateFuncs[a];
      };
      b.prototype._initProgress = function (a) {
        $("#loading").width(Math.round(100 * a.progress) + "%");
      };
      b.prototype._initComplete = function (a) {
        this._loaded = !0;
        $("#loading").stop().fadeOut(200, "linear");
        this._audio || (this._audio = aidnlib.Assets.get(p.BGM_PATH));
        this.showState(d.MAIN);
      };
      b.prototype._clickPlay = function (a) {
        c.state == d.TOP &&
          (this._titleAnim.stop(),
          (c.state = d.READY),
          $("#top").stop().fadeOut(200, "linear"),
          $("#ready").stop().fadeIn(300, "linear"),
          (a = new aidn.WebAudio()),
          a.load("../shared/sound/blank.mp3"),
          a.play(),
          c.storage.checkComplete() && $("#miku_bg").fadeOut(200, "linear"));
      };
      b.prototype._clickKotoba = function (a) {
        c.state = d.KOTOBA;
        $("#top").stop().fadeOut(200, "linear");
        $("#kotoba_head").stop().fadeIn(300, "linear");
        $("#kotoba").stop().fadeIn(300, "linear");
        this._initKotoba();
        c.storage.checkComplete() && $("#miku_bg").fadeOut(200, "linear");
      };
      b.prototype._clickHowto = function (a) {
        a.preventDefault();
        c.state = d.HOWTO;
        $("#top").stop().fadeOut(200, "linear");
        $("#howto").stop().fadeIn(300, "linear");
        c.storage.checkComplete() && $("#miku_bg").fadeOut(200, "linear");
      };
      b.prototype._clickAbout = function (a) {
        a.preventDefault();
        c.state = d.ABOUT;
        $("#top").stop().fadeOut(200, "linear");
        $("#about").stop().fadeIn(300, "linear");
        c.storage.checkComplete() && $("#miku_bg").fadeOut(200, "linear");
      };
      b.prototype._clickStart = function (a) {
        c.state == d.READY && this.showState(d.LOADING);
      };
      b.prototype._clickRetry = function (a) {
        $("#end").stop().fadeOut(200, "linear");
        this.showState(d.LOADING);
        a.preventDefault();
      };
      b.prototype._clickNext = function (a) {
        this._addStagenum(1);
        $("#end").stop().fadeOut(200, "linear");
        this.showState(d.LOADING);
        a.preventDefault();
      };
      b.prototype._clickBack2 = function (a) {
        this.showState(d.TOP);
        a.preventDefault();
      };
      b.prototype._clickLeftK = function (a) {
        this.__setupKotobanumLR(-1);
        a.preventDefault();
      };
      b.prototype._clickRightK = function (a) {
        this.__setupKotobanumLR(1);
        a.preventDefault();
      };
      b.prototype.__setupKotobanumLR = function (a) {
        var e = this;
        this._addKotobanum(a);
        this._kotobanumFlag = !0;
        this._kotobanumTime = 0;
        this._kotobanumVal = a;
        this._kotobanumCt = 0;
        $(window).on("mouseup touchend", function (a) {
          return e.__endKotobanumLR(a);
        });
      };
      b.prototype.__endKotobanumLR = function (a) {
        a.preventDefault();
        this._kotobanumFlag = !1;
        $(window).off("mouseup touchend");
      };
      b.prototype._initKotoba = function () {
        var a = c.storage.getWordMax();
        this._kotobaNums = c.storage.getWordNums();
        a = Math.round((this._kotobaNums.length / a) * 1e3) / 10 + " %";
        $("#kotoba_p").text(a);
        this._kotobaNow = 0;
        this._updateKotobanum();
      };
      b.prototype._addKotobanum = function (a) {
        a = this._kotobaNow + a;
        this._kotobaNums.length <= a && (a = this._kotobaNums.length);
        0 > a && (a = 0);
        this._kotobaNow != a &&
          ((this._kotobaNow = a), this._updateKotobanum());
      };
      b.prototype._updateKotobanum = function () {
        0 != this._kotobaNow
          ? (this._mikuKotoba.setData(this._kotobaNums[this._kotobaNow - 1]),
            this._mikuKotoba.skip(),
            this._mikuKotoba.show())
          : (this._mikuKotoba.setData(-1), this._mikuKotoba.skip());
        0 < this._kotobaNow
          ? $("#bt_left_k").addClass("on")
          : $("#bt_left_k").removeClass("on");
        this._kotobaNow < this._kotobaNums.length
          ? $("#bt_right_k").addClass("on")
          : $("#bt_right_k").removeClass("on");
        var a = q.keta(this._kotobaNow, 2, "0");
        "00" == a && (a = "--");
        a += " / " + q.keta(this._kotobaNums.length, 2, "0");
        $("#kotoba_num").text(a);
      };
      b.prototype._addStagenum = function (a) {
        a = c.user.stageNow + a;
        0 > a && (a = 0);
        c.user.stageClearNum < a && (a = c.user.stageClearNum);
        c.user.stageNow = a;
        this._updateStagenum();
        return a;
      };
      b.prototype._updateStagenum = function () {
        var a = c.user;
        0 < a.stageNow
          ? $("#bt_left").addClass("on")
          : $("#bt_left").removeClass("on");
        a.stageNow < a.stageClearNum
          ? $("#bt_right").addClass("on")
          : $("#bt_right").removeClass("on");
        a = q.keta(a.stageNow, 2, "0");
        $("#stage_num").text(a);
        $("#time_ready").text(this._time.getBest());
      };
      b.prototype._clickLeft = function (a) {
        this.__setupStagenumLR(-1);
      };
      b.prototype._clickRight = function (a) {
        this.__setupStagenumLR(1);
      };
      b.prototype.__setupStagenumLR = function (a) {
        var e = this;
        this._addStagenum(a);
        this._stagenumFlag = !0;
        this._stagenumTime = 0;
        this._stagenumVal = a;
        this._stagenumCt = 0;
        $(window).on("mouseup touchend", function (a) {
          return e.__endStagenumLR(a);
        });
      };
      b.prototype.__endStagenumLR = function (a) {
        a.preventDefault();
        this._stagenumFlag = !1;
        $(window).off("mouseup touchend");
      };
      b.prototype._clickBack = function (a) {
        switch (c.state) {
          case d.HOWTO:
          case d.ABOUT:
          case d.KOTOBA:
          case d.READY:
          case d.MAIN:
          case d.END:
            this.showState(d.TOP);
            break;
          default:
            location.href = "../contents/";
        }
      };
      b.prototype._audioComplete = function () {
        this._audio.stop();
      };
      b.prototype._clickFull = function (a) {
        aidn.util.fullscreen();
      };
      b.prototype._clickFooterBt = function (a, e) {
        a.preventDefault();
        m.play(m.SE_CHANGE_BT);
        this._selectBt(e);
      };
      b.prototype._selectBt = function (a) {
        c.stateBt = a;
        for (var e = $("#footer p"), b = e.length, d = 0; d < b; d++)
          d == a ? $(e[d]).css("opacity", 1) : $(e[d]).css("opacity", 0.4);
      };
      b.prototype._update = function () {
        var a = this,
          e = aidn.util.getTime() / 1e3;
        c.delta = e - this._preTime;
        this._preTime = e;
        this._stagenumFlag &&
          ((this._stagenumTime += c.delta),
          (e = 0.15),
          3 <= this._stagenumCt && (e = 0.05),
          e < this._stagenumTime &&
            (this._stagenumCt++,
            (this._stagenumTime -= e),
            this._addStagenum(this._stagenumVal)));
        this._kotobanumFlag &&
          ((this._kotobanumTime += c.delta),
          (e = 0.15),
          3 <= this._kotobanumCt && (e = 0.05),
          e < this._kotobanumTime &&
            (this._kotobanumCt++,
            (this._kotobanumTime -= e),
            this._addKotobanum(this._kotobanumVal)));
        for (var b in this.__updateFuncs) this.__updateFuncs[b]();
        this._pixi.update();
        window.requestAnimFrame(function () {
          return a._update();
        });
      };
      b.prototype._resize = function () {
        var a = aidn.window.width(),
          e = aidn.window.height();
        c.stw = a;
        c.sth = e;
        this._pixi && this._pixi.resize();
      };
      return b;
    })(),
    u = (function () {
      function b(a, e) {
        void 0 === e && (e = null);
        this._target = a;
        e && e.addChild(a);
      }
      b.prototype.addChild = function (a) {
        this._target.addChild(a);
      };
      Object.defineProperty(b.prototype, "x", {
        get: function () {
          return this._target.x;
        },
        set: function (a) {
          this._target.x = a;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "y", {
        get: function () {
          return this._target.y;
        },
        set: function (a) {
          this._target.y = a;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "scale", {
        get: function () {
          return this._target.scale.x;
        },
        set: function (a) {
          this._target.scale.set(a, a);
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "scaleX", {
        get: function () {
          return this._target.scale.x;
        },
        set: function (a) {
          this._target.scale.x = a;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "scaleY", {
        get: function () {
          return this._target.scale.y;
        },
        set: function (a) {
          this._target.scale.y = a;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "rotation", {
        get: function () {
          return this._target.rotation;
        },
        set: function (a) {
          this._target.rotation = a;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "visible", {
        get: function () {
          return this._target.visible;
        },
        set: function (a) {
          this._target.visible = a;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "alpha", {
        get: function () {
          return this._target.alpha;
        },
        set: function (a) {
          this._target.alpha = a;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "target", {
        get: function () {
          return this._target;
        },
        enumerable: !0,
        configurable: !0,
      });
      return b;
    })(),
    C = (function (b) {
      function a(a) {
        var h = new PIXI.Graphics();
        b.call(this, h, a);
        this._gra = h;
        this._col = 16777215;
        this.visible = !1;
      }
      __extends(a, b);
      a.prototype.init = function (a, b) {
        void 0 === b && (b = 1);
        this._col = a;
        this._alp = b;
        return this;
      };
      a.prototype.show = function (a, b, c) {
        void 0 === a && (a = 0.4);
        void 0 === b && (b = 0);
        void 0 === c && (c = null);
        this.resize();
        this.visible = !0;
        this.y = this.scaleY = 0;
        b = { scaleY: 1, ease: Power2.easeOut, delay: b };
        c &&
          (b.onComplete = function () {
            return c();
          });
        TweenMax.to(this, a, b).play();
      };
      a.prototype.hide = function (a, b) {
        var d = this;
        void 0 === a && (a = 0.4);
        void 0 === b && (b = 0);
        var f = {
          y: c.sth,
          scaleY: 0,
          ease: Power2.easeOut,
          delay: b,
          onComplete: function () {
            return d._hideComplete();
          },
        };
        TweenMax.killTweensOf(this);
        TweenMax.to(this, a, f).play();
      };
      a.prototype._hideComplete = function () {
        this.visible = !1;
      };
      a.prototype.resize = function () {
        var a = this._gra;
        a.clear();
        a.beginFill(this._col, this._alp);
        a.drawRect(0, 0, c.stw, c.sth);
      };
      return a;
    })(u),
    K = (function () {
      function b() {
        this._que = [];
        this._disps = [];
        this._idrotation = this._identifier = -1;
      }
      Object.defineProperty(b.prototype, "stage", {
        get: function () {
          return this._stage;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "matter", {
        get: function () {
          return this._matter;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "effect", {
        get: function () {
          return this._effectMng;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "mouseX", {
        get: function () {
          return this._renderer.plugins.interaction.eventData.data.global.x;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(b.prototype, "mouseY", {
        get: function () {
          return this._renderer.plugins.interaction.eventData.data.global.y;
        },
        enumerable: !0,
        configurable: !0,
      });
      b.prototype.init = function () {
        var a = this,
          e = 1;
        1 < window.devicePixelRatio && (e = 2);
        this._renderer = PIXI.autoDetectRenderer(c.stw, c.sth, {
          backgroundColor: 0,
          antialias: !0,
          resolution: e,
        });
        document.getElementById("view").appendChild(this._renderer.view);
        this._stage = new PIXI.Container();
        this._effectMng = new L(this._stage);
        this._dispContainer = new PIXI.Container();
        this._stage.addChild(this._dispContainer);
        e = new PIXI.Container();
        this._stage.addChild(e);
        this._floorMng = new M(e);
        this._coverBk = new C(this._stage).init(0, 0.55);
        this._cover = new C(this._stage).init(16777215);
        this._matter = new N();
        this._matter.init(c._debug);
        this._matter.start();
        this._isStarting = !1;
        c.isMobile ||
          aidn.event.addMouseWheel("view", function (e) {
            return a._wheel(e);
          });
      };
      b.prototype._wheel = function (a) {
        this._tmp &&
          (0 < aidn.event.getWheelDelta(a)
            ? this._addTmpH(3)
            : this._addTmpH(-3));
      };
      b.prototype._addTmpH = function (a) {
        this._tmpH += a;
        a = -Math.min(c.stw, c.sth) / 60;
        var e = Math.min(c.stw, c.sth) / 3;
        this._tmpH < a && (this._tmpH = a);
        e < this._tmpH && (this._tmpH = e);
        this._tmp &&
          this._pe &&
          this._tmp.updatePre(this._ps, this._pe, this._tmpH);
      };
      b.prototype.showState = function (a) {
        switch (c.state) {
          case d.TOP:
            this._stop();
            break;
          case d.LOADING:
            this._stop();
            break;
          case d.MAIN:
            this._start();
            break;
          case d.END:
            this._showEnd();
        }
      };
      b.prototype._start = function () {
        var a = this;
        this._isStarting ||
          ((this._isStarting = !0),
          $("#view").on("mousedown touchstart", function (e) {
            return a._touchStart(e);
          }),
          this._floorMng.start());
      };
      b.prototype._stop = function () {
        if (this._isStarting) {
          this._isStarting = !1;
          this.__stopProcess();
          this._floorMng.stop();
          this._coverBk.hide(0.8);
          this._cover.hide();
          for (var a = this._disps.length, e = 0; e < a; e++) {
            var b = this._disps.splice(0, 1)[0];
            b.remove();
            this._que.push(b);
          }
          this._dispEnd &&
            (this._dispEnd.remove(),
            this._que.push(this._dispEnd),
            (this._dispEnd = null));
        }
      };
      b.prototype._showEnd = function () {
        var a = this;
        this.__stopProcess();
        for (var e = this._disps.length, b = 0; b < e; b++)
          if (!this._disps[b].isFloor) {
            var c = this._disps.splice(b, 1)[0];
            c.hide();
            this._que.push(c);
            b--;
            e--;
          }
        this._dispEnd.startEndDraw(function () {
          return a._showEnd2();
        });
      };
      b.prototype._showEnd2 = function () {
        var a = this;
        c.state == d.END &&
          this._cover.show(0.6, 0, function () {
            return a._coverShowComplete();
          });
      };
      b.prototype.__stopProcess = function () {
        $("#view").off("mousedown touchstart");
        $(window).off("mousemove touchmove");
        $(window).off("mouseup touchend");
        this._tmp &&
          (this._tmp.remove(), this._que.push(this._tmp), (this._tmp = null));
        this._idrotation = this._identifier = -1;
      };
      b.prototype._coverShowComplete = function () {
        this._floorMng.hide();
        for (var a = this._disps.length, e = 0; e < a; e++) {
          var b = this._disps.splice(0, 1)[0];
          b.remove();
          this._que.push(b);
        }
        c.state == d.END && (c.main.__showEndCover(), this._coverBk.show(0, 0));
      };
      b.prototype.__hideCover = function () {
        this._cover.hide(0.6);
      };
      b.prototype.update = function () {
        switch (c.state) {
          case d.MAIN:
            this._updateMain();
            break;
          case d.END:
            this._updateEnd();
        }
        this._renderer.render(this._stage);
      };
      b.prototype._updateMain = function () {
        this._floorMng.update();
        for (var a = this._disps.length, e = 0; e < a; e++) {
          var b = this._disps[e];
          if (!b.isFloor) {
            if (b.hitcheckPoints(this._floorMng.points)) {
              this._dispEnd = this._disps.splice(e, 1)[0];
              c.main.showState(d.END);
              break;
            }
            b.update() ||
              ((b = this._disps.splice(e, 1)[0]),
              b.remove(),
              this._que.push(b),
              e--,
              a--);
          }
        }
      };
      b.prototype._updateEnd = function () {
        this._floorMng.update();
        this._dispEnd.update();
      };
      b.prototype.remove = function (a) {
        for (var e = this._disps.length, b = 0; b < e; b++)
          if (this._disps[b].id == a) {
            a = this._disps.splice(b, 1)[0];
            a.remove();
            this._que.push(a);
            break;
          }
      };
      b.prototype.hit = function (a, e) {
        for (var b = this._disps.length, c = 0; c < b; c++)
          if (this._disps[c].id == a.id) {
            this._disps[c].hit(e);
            break;
          }
        this._floorMng.hit(a.id);
      };
      b.prototype.resize = function () {
        this._coverBk.resize();
        this._cover.resize();
        this._matter.resize();
        this._renderer.resize(c.stw, c.sth);
        this._floorMng.resize();
      };
      b.prototype._touchStart = function (a) {
        var e = this;
        a.preventDefault();
        if (c.state == d.MAIN) {
          if (a.originalEvent.changedTouches) {
            var b = a.originalEvent.changedTouches,
              w = b[0].identifier;
            if (-1 != this._identifier) {
              if (-1 != this._idrotation) return;
              this._pr = new x(b[0].pageX, b[0].pageY);
              this._idrotation = w;
              return;
            }
            this._identifier = w;
          }
          $(window).on("mousemove touchmove", function (a) {
            return e._touchMove(a);
          });
          $(window).on("mouseup touchend", function (a) {
            return e._touchEnd(a);
          });
          this._ps = aidn.event.getPos(a);
          this._pe = null;
          this._tmpH = 0;
          this._tmp =
            0 < this._que.length ? this._que.pop() : new O(this._dispContainer);
          this._tmp.init(c.stateBt, r.getRandomId(c.stateBt));
        }
      };
      b.prototype._touchMove = function (a) {
        a.preventDefault();
        if (a.originalEvent.changedTouches) {
          var e = a.originalEvent.changedTouches;
          if (this._idrotation == e[0].identifier) {
            if (!this._tmp) return;
            var b = new x(e[0].pageX, e[0].pageY);
            this._addTmpH((this._pr.y - b.y) / 2);
            this._pr = b;
          }
          if (this._identifier != e[0].identifier) return;
        }
        this._pe = aidn.event.getPos(a);
        this._tmp.updatePre(this._ps, this._pe, this._tmpH);
      };
      b.prototype._touchEnd = function (a) {
        a.preventDefault();
        if (
          a.originalEvent.changedTouches &&
          ((a = a.originalEvent.changedTouches),
          this._idrotation == a[0].identifier && (this._idrotation = -1),
          this._identifier != a[0].identifier)
        )
          return;
        $(window).off("mousemove touchmove");
        $(window).off("mouseup touchend");
        this._tmp &&
          (this._tmp.fix(this._ps, this._pe, this._tmpH)
            ? this._disps.push(this._tmp)
            : (this._tmp.remove(), this._que.push(this._tmp)));
        this._tmp = null;
        this._idrotation = this._identifier = -1;
      };
      return b;
    })(),
    P = (function (b) {
      function a(a) {
        var c = new PIXI.Graphics();
        b.call(this, c, a);
        this._gra = c;
        this._tR = this._tG = this._tB = 255;
        c = new PIXI.Graphics();
        this.addChild(c);
        c.visible = !1;
        this._graCir = c;
        this._colR = this._colG = this._colB = 255;
        this.colorProgress = 1;
      }
      __extends(a, b);
      Object.defineProperty(a.prototype, "id", {
        get: function () {
          return this._id;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(a.prototype, "colorProgress", {
        get: function () {
          return this._colorProgress;
        },
        set: function (a) {
          this._colorProgress = a;
          this._colR = Math.floor((255 - this._tR) * a + this._tR);
          this._colG = Math.floor((255 - this._tG) * a + this._tG);
          this._colB = Math.floor((255 - this._tB) * a + this._tB);
          this._col = (this._colR << 16) + (this._colG << 8) + this._colB;
          this._cr = 1 + 2 * (1 - a);
          this.resize();
        },
        enumerable: !0,
        configurable: !0,
      });
      a.prototype.init = function (a, b) {
        this._id = a;
        this._pt = b;
        this.visible = !0;
        this.resize();
        this._time = 0;
      };
      a.prototype.hit = function (a) {
        var b = this;
        void 0 === a && (a = 16711680);
        this._tR = (a >> 16) & 255;
        this._tG = (a >> 8) & 255;
        this._tB = a & 255;
        a = this._graCir;
        a.scale.set(0, 0);
        a.visible = !0;
        a.alpha = 1;
        this.colorProgress = 0;
        TweenMax.killTweensOf(this);
        TweenMax.killTweensOf(a.scale);
        TweenMax.killTweensOf(a);
        TweenMax.to(this, 0.8, {
          colorProgress: 1,
          ease: Power0.easeNone,
        }).play();
        TweenMax.to(a.scale, 0.8, {
          x: 1.5,
          y: 1.5,
          ease: Power2.easeOut,
        }).play();
        TweenMax.to(a, 0.8, {
          alpha: 0,
          ease: Power0.easeNone,
          onComplete: function () {
            return b._hitComplete();
          },
        }).play();
      };
      a.prototype._hitComplete = function () {
        this._graCir.visible = !1;
      };
      a.prototype.update = function () {
        this._time += c.delta;
        0.06 <= this._time &&
          ((this._time -= 0.06), (this.alpha = 1 == this.alpha ? 0.5 : 1));
        new PIXI.filters.ColorMatrixFilter();
      };
      a.prototype.remove = function () {
        this.visible = !1;
      };
      a.prototype.resize = function () {
        if (this._pt) {
          var a = this._pt;
          this.x = a.x * c.stw;
          this.y = a.y * c.sth;
          var a = Math.min(c.stw, c.sth) / 90,
            b = this._gra;
          b.clear();
          b.beginFill(this._col);
          b.drawCircle(0, 0, a * this._cr);
          b.beginFill(0, 0);
          b.lineStyle(1, this._col);
          b.drawCircle(0, 0, 2.5 * a * this._cr);
          b = this._graCir;
          b.clear();
          b.beginFill(this._col);
          b.drawCircle(0, 0, 13 * a);
        }
      };
      return a;
    })(u),
    Q = (function (b) {
      function a(a) {
        var c = new PIXI.Graphics();
        b.call(this, c, a);
        this._gra = c;
      }
      __extends(a, b);
      Object.defineProperty(a.prototype, "id", {
        get: function () {
          return this._body ? this._body.id : -1;
        },
        enumerable: !0,
        configurable: !0,
      });
      a.prototype.init = function (a) {
        this.visible = !0;
        this.scale = this.alpha = 1;
        this._data = a;
        var b = { isStatic: !0, restitution: 0.8, friction: 0, angle: a.angle };
        a.isCircle
          ? ((this._body = Matter.Bodies.circle(0, 0, 100, b)),
            (this._body.label = f.FIX_CIR.toString()))
          : ((this._body = Matter.Bodies.rectangle(0, 0, 100, 100, b)),
            (this._body.label = f.FIX_BOX.toString()));
        this.__scw = this.__sch = this.__scr = 1;
        this.__progX = this.__progY = 0;
        this._sx = a.sx;
        this._sy = a.sy;
        this.rotation = this._rot = a.angle;
        c.main.pixi.matter.add(this._body);
        this.resize();
      };
      a.prototype.update = function () {
        this._update(c.delta);
      };
      a.prototype._update = function (a) {
        void 0 === a && (a = 0);
        var b = this._data;
        0 != b.rot &&
          ((this.rotation = this._rot += b.rot * a),
          Matter.Body.setAngle(this._body, this._rot));
        if (0 != b.mx || 0 != b.my) {
          var d = Matter.Vector.create(b.x * c.stw, b.y * c.sth);
          if (0 != b.mx) {
            this.__progX += this._sx * a;
            0 >= this.__progX
              ? ((this._sx = -this._sx), (this.__progX -= this.__progX))
              : 1 <= this.__progX &&
                ((this._sx = -this._sx), (this.__progX = 2 - this.__progX));
            var f = (b.x + b.mx * this.__progX) * c.stw;
            this.x = f;
            d.x = f;
          }
          0 != b.my &&
            ((this.__progY += this._sy * a),
            0 >= this.__progY
              ? ((this._sy = -this._sy), (this.__progY -= this.__progY))
              : 1 <= this.__progY &&
                ((this._sy = -this._sy), (this.__progY = 2 - this.__progY)),
            (this.y = a = (b.y + b.my * this.__progY) * c.sth),
            (d.y = a));
          Matter.Body.setPosition(this._body, d);
        }
      };
      a.prototype.hit = function () {
        this._gra.alpha = 0.2;
        TweenMax.killTweensOf(this._gra);
        TweenMax.to(this._gra, 0.15, { alpha: 1, ease: Linear.easeNone });
      };
      a.prototype.remove = function () {
        this._body &&
          (c.main.pixi.matter.remove(this._body), (this._body = null));
        this._gra.clear();
        this.visible = !1;
      };
      a.prototype.resize = function () {
        if (this._body) {
          var a = c.stw,
            b = c.sth,
            d = this._data,
            f = this._gra;
          f.clear();
          f.lineStyle(1, 16777215, 0.8);
          var g = d.x * a,
            k = d.y * b,
            l = Matter.Vector.create();
          l.x = g;
          l.y = k;
          Matter.Body.setPosition(this._body, l);
          this.x = g;
          this.y = k;
          Matter.Body.setAngle(this._body, 0);
          d.isCircle
            ? ((b = d.r * Math.min(a, b)),
              f.drawCircle(0, 0, b),
              Matter.Body.scale(
                this._body,
                b / 100 / this.__scr,
                b / 100 / this.__scr
              ),
              (this.__scr = b / 100))
            : ((a *= d.w),
              (b *= d.h),
              f.drawRect(-a / 2, -b / 2, a, b),
              Matter.Body.scale(
                this._body,
                a / 100 / this.__scw,
                b / 100 / this.__sch
              ),
              (this.__scw = a / 100),
              (this.__sch = b / 100));
          Matter.Body.setAngle(this._body, d.angle);
          this._update();
        }
      };
      return a;
    })(u),
    M = (function () {
      function b(a) {
        this._isStarting = !1;
        this._que = [];
        this._disps = [];
        this._parent = a;
        this._points = [];
        this._pointQue = [];
      }
      Object.defineProperty(b.prototype, "points", {
        get: function () {
          return this._points;
        },
        enumerable: !0,
        configurable: !0,
      });
      b.prototype.start = function () {
        for (
          var a = (this._stageData = t.listDatas[c.user.stageNow]),
            e = a.points.length,
            b = 0;
          b < e;
          b++
        ) {
          var d;
          d =
            0 < this._pointQue.length
              ? this._pointQue.pop()
              : new P(this._parent);
          d.init(b + a.offset, a.points[b]);
          this._points.push(d);
        }
        e = a.floors.length;
        for (b = 0; b < e; b++)
          (d = 0 < this._que.length ? this._que.pop() : new Q(this._parent)),
            d.init(a.floors[b]),
            this._disps.push(d);
        this._isStarting = !0;
        this.resize();
      };
      b.prototype.stop = function () {
        this._isStarting = !1;
        for (var a = this._points.length, e = 0; e < a; e++) {
          var b = this._points.pop();
          b.remove();
          this._pointQue.push(b);
        }
        this.hide();
      };
      b.prototype.hide = function () {
        for (var a = this._disps.length, e = 0; e < a; e++) {
          var b = this._disps.splice(0, 1)[0];
          b.remove();
          this._que.push(b);
        }
      };
      b.prototype.hit = function (a) {
        for (var b = this._disps.length, c = 0; c < b; c++)
          if (this._disps[c].id == a) {
            this._disps[c].hit();
            break;
          }
      };
      b.prototype.resize = function () {
        for (var a = this._points.length, b = 0; b < a; b++)
          this._points[b].resize();
        a = this._disps.length;
        for (b = 0; b < a; b++) this._disps[b].resize();
      };
      b.prototype.update = function () {
        for (var a = this._points.length, b = 0; b < a; b++)
          this._points[b].update();
        a = this._disps.length;
        for (b = 0; b < a; b++) this._disps[b].update();
      };
      return b;
    })(),
    y = (function (b) {
      function a(a, c, d) {
        b.call(this, a, c);
        this._id = d;
      }
      __extends(a, b);
      Object.defineProperty(a.prototype, "id", {
        get: function () {
          return this._id;
        },
        enumerable: !0,
        configurable: !0,
      });
      a.prototype.show = function (a) {
        this._disp = a;
      };
      a.prototype.hide = function () {};
      a.prototype.update = function () {
        return !0;
      };
      return a;
    })(u),
    R = (function (b) {
      function a(a) {
        void 0 === a && (a = null);
        var c = new PIXI.Graphics();
        b.call(this, c, a);
        this._gra = c;
      }
      __extends(a, b);
      a.prototype.setParams = function (a, b, c, d) {
        this._p0 = a;
        this._p1 = b;
        this._w = c;
        this._col = d;
        this._p1t = this._p1.clone();
      };
      a.prototype.start = function (a, b, c) {
        var d = this;
        void 0 === c && (c = null);
        this.visible = !0;
        this._complete = c;
        this._time = a;
        this._p1.x = this._p0.x;
        this._p1.y = this._p0.y;
        TweenMax.to(this._p1, a, {
          x: this._p1t.x,
          y: this._p1t.y,
          onUpdate: function () {
            return d._update();
          },
          ease: Power2.easeOut,
        }).play();
        TweenMax.delayedCall(b, function () {
          return d._end();
        });
      };
      a.prototype._end = function () {
        var a = this;
        TweenMax.to(this._p0, this._time, {
          x: this._p1t.x,
          y: this._p1t.y,
          onUpdate: function () {
            return a._update();
          },
          onComplete: function () {
            return a._endComplete();
          },
          ease: Power2.easeOut,
        }).play();
      };
      a.prototype._endComplete = function () {
        this.visible = !1;
        this._complete && this._complete();
      };
      a.prototype._update = function () {
        var a = this._gra;
        a.clear();
        a.lineStyle(this._w, this._col, p.alpha);
        a.moveTo(this._p0.x, this._p0.y);
        a.lineTo(this._p1.x, this._p1.y);
      };
      return a;
    })(u),
    S = (function (b) {
      function a(a) {
        void 0 === a && (a = null);
        var c = new PIXI.Graphics();
        b.call(this, c, a);
        this._gra = c;
      }
      __extends(a, b);
      a.prototype.setParam = function (a, b, c) {
        void 0 === c && (c = !1);
        var d = this._gra;
        d.clear();
        d.lineStyle(1, b, p.alpha);
        c ? d.drawCircle(0, 0, 0.5 * a) : d.drawRect(0.5 * -a, 0.5 * -a, a, a);
      };
      a.prototype.start = function (a, b, d, f) {
        var g = this;
        void 0 === f && (f = null);
        this.visible = !0;
        this._dx = a;
        this._dy = b;
        this._ay = d;
        this._complete = f;
        this._updateId = c.main.addUpdate(function () {
          return g._update();
        });
      };
      a.prototype._update = function () {
        this.x += this._dx * c.delta;
        this.y += this._dy * c.delta;
        this._dy += this._ay * c.delta;
        1.2 * c.sth < this.y &&
          (c.main.removeUpdate(this._updateId),
          (this.visible = !1),
          this._complete && this._complete());
      };
      return a;
    })(u),
    T = (function (b) {
      function a(a, c) {
        void 0 === c && (c = 0);
        var d = new R();
        b.call(this, d.target, a, c);
        this._line = d;
      }
      __extends(a, b);
      a.prototype.show = function (a) {
        var d = this;
        b.prototype.show.call(this, a);
        this._hideFlag = !1;
        this.visible = !0;
        var w = this._line,
          f = new x(a.x, a.y),
          g = new x();
        0.5 > Math.random()
          ? ((g.x = Math.random() * c.stw),
            0.5 > Math.random() ? (g.y = -20) : (g.y = c.sth + 20))
          : ((g.y = Math.random() * c.sth),
            0.5 > Math.random() ? (g.x = -20) : (g.x = c.stw + 20));
        w.setParams(f, g, 1, a.color);
        a = aidn.math.rand(0.4, 0.6);
        f = aidn.math.rand(0.2, 0.6);
        w.start(a, f, function () {
          return d._complete();
        });
      };
      a.prototype.hide = function () {
        this.visible = !1;
      };
      a.prototype.update = function () {
        return this._hideFlag ? !1 : !0;
      };
      a.prototype._complete = function () {
        this._hideFlag = !0;
      };
      return a;
    })(y),
    U = (function (b) {
      function a(a, c) {
        void 0 === c && (c = 0);
        var d = new PIXI.Container();
        b.call(this, d, a, c);
        this._pts = [];
      }
      __extends(a, b);
      a.prototype.show = function (a) {
        var d = this;
        b.prototype.show.call(this, a);
        this.visible = !0;
        this._compCt = 0;
        this._hideFlag = !1;
        this._len = aidn.math.randInt(3, 9);
        for (
          var f = 0.4 > Math.random(), g = (c.stw + c.sth) / 1e3, k = 0;
          k < this._len;
          k++
        ) {
          var l;
          l = this._pts[k] ? this._pts[k] : new S(this.target);
          var m = aidn.math.rand(7, 39) * g;
          l.x = a.x;
          l.y = a.y;
          l.rotation = Math.random() * Math.PI;
          l.setParam(m, a.color, f);
          var m = aidn.math.rand(-170, 170) * g,
            n = aidn.math.rand(-350, -250) * g,
            p = aidn.math.rand(700, 500) * g;
          l.start(m, n, p, function () {
            return d._complete();
          });
          this._pts[k] = l;
        }
      };
      a.prototype._complete = function () {
        this._compCt++;
        this._len <= this._compCt && (this._hideFlag = !0);
      };
      a.prototype.hide = function () {
        this.visible = !1;
      };
      a.prototype.update = function () {
        return this._hideFlag ? !1 : !0;
      };
      return a;
    })(y),
    V = (function (b) {
      function a(a, c) {
        void 0 === c && (c = 0);
        var d = new PIXI.Graphics();
        b.call(this, d, a, c);
        this._gra = d;
        this._interval = 0.05;
      }
      __extends(a, b);
      a.prototype.show = function (a) {
        this.visible = !0;
        this.alpha = 1;
        this._isTate = 0.5 > Math.random();
        b.prototype.show.call(this, a);
        this.y = this.x = 0;
        this._isTate ? (this.x = this._disp.x) : (this.y = this._disp.y);
        this._time = 0;
        this._ct = aidn.math.randInt(3, 6);
      };
      a.prototype.hide = function () {
        this.visible = !1;
      };
      a.prototype.update = function () {
        this._time += c.delta;
        if (this._interval <= this._time) {
          var a = this._gra;
          a.clear();
          a.lineStyle(1, this._disp.color, p.alpha);
          var b = 15,
            b = aidn.math.rand(-b, b);
          this._isTate
            ? (a.moveTo(b, 0), a.lineTo(b, c.sth))
            : (a.moveTo(0, b), a.lineTo(c.stw, b));
          this._time -= this._interval;
          this._ct--;
          if (0 > this._ct) return !1;
        }
        return !0;
      };
      return a;
    })(y),
    W = (function (b) {
      function a(a, c) {
        void 0 === c && (c = 0);
        var d = new PIXI.Graphics();
        b.call(this, d, a, c);
        this._gra = d;
      }
      __extends(a, b);
      a.prototype.show = function (a) {
        var c = this;
        this.visible = !0;
        this.alpha = 1;
        this._hideFlag = !1;
        b.prototype.show.call(this, a);
        this.x = this._disp.x;
        this.y = this._disp.y;
        var d = this._gra;
        d.clear();
        d.lineStyle(1, this._disp.color, p.alpha);
        a = a.rect;
        var f = aidn.math.rand(1.4, 2.6);
        d.drawRect(-a.hw * f, -a.hh * f, a.w * f, a.h * f);
        this.rotation = aidn.math.rand(0, Math.PI);
        d = aidn.math.rand(0.5 * Math.PI, 1.5 * Math.PI);
        d = 0.5 > Math.random() ? this.rotation + d : this.rotation - d;
        a = aidn.math.rand(0.5, 0.9);
        TweenMax.to(this, a, {
          rotation: d,
          ease: Power1.easeOut,
          onComplete: function () {
            return c._end();
          },
        }).play();
      };
      a.prototype.hide = function () {
        this.visible = !1;
      };
      a.prototype._end = function () {
        this._hideFlag = !0;
      };
      a.prototype.update = function () {
        return this._hideFlag ? !1 : !0;
      };
      return a;
    })(y),
    X = (function (b) {
      function a(a, c) {
        void 0 === c && (c = 0);
        var d = new PIXI.Graphics();
        b.call(this, d, a, c);
        this._gra = d;
        this._interval = 0.05;
      }
      __extends(a, b);
      a.prototype.show = function (a) {
        this.visible = !0;
        this.alpha = 1;
        b.prototype.show.call(this, a);
        this.x = this._disp.x;
        this.y = this._disp.y;
        this._time = 0;
        this._ct = aidn.math.randInt(4, 8);
      };
      a.prototype.hide = function () {
        this.visible = !1;
      };
      a.prototype.update = function () {
        this._time += c.delta;
        if (this._interval <= this._time) {
          var a = this._gra;
          a.clear();
          a.lineStyle(1, this._disp.color, p.alpha);
          var b = this._disp.rect.r * aidn.math.rand(1.4, 2.5),
            d = aidn.math.rand(-10, 10),
            f = aidn.math.rand(-10, 10);
          a.drawCircle(d, f, b);
          this._time -= this._interval;
          this._ct--;
          if (0 > this._ct) return !1;
        }
        return !0;
      };
      return a;
    })(y),
    L = (function () {
      function b(a) {
        this._updateId = -1;
        var b = new PIXI.Container();
        a.addChild(b);
        this._container = b;
        this._effects = [];
        this._que = [];
        this._effectClass = [X, W, V, T, U];
        a = this._effectClass.length;
        for (b = 0; b < a; b++) this._que[b] = [];
      }
      b.prototype.show = function (a) {
        var b = this._effectClass.length,
          c = Math.floor(Math.random() * b);
        3 == c && 0.7 > Math.random() && (c = Math.floor(Math.random() * b));
        b =
          0 < this._que[c].length
            ? this._que[c].pop()
            : new this._effectClass[c](this._container, c);
        b.show(a);
        this._effects.push(b);
        this._startUpdate();
      };
      b.prototype._startUpdate = function () {
        var a = this;
        0 > this._updateId &&
          (this._updateId = c.main.addUpdate(function () {
            return a._update();
          }));
      };
      b.prototype._stopUpdate = function () {
        c.main.removeUpdate(this._updateId);
        this._updateId = -1;
      };
      b.prototype._update = function () {
        for (var a = this._effects.length, b = 0; b < a; b++)
          if (!this._effects[b].update()) {
            var c = this._effects.splice(b, 1)[0];
            c.hide();
            this._que[c.id].push(c);
            b--;
            a--;
          }
      };
      return b;
    })(),
    O = (function (b) {
      function a(a) {
        var c = this;
        b.call(this, new PIXI.Container(), a);
        this._preTime = -1;
        this.__py = this._linetime = 0;
        this.__isEndDrawing = !1;
        this._graLine = new PIXI.Graphics();
        a.addChild(this._graLine);
        this._gra = new PIXI.Graphics();
        this.addChild(this._gra);
        a = new PIXI.Graphics();
        this.addChild(a);
        a.interactive = !0;
        a.buttonMode = !0;
        a.on("pointerdown", function (a) {
          return c._pointerDown(a);
        });
        a.on("pointerup", function (a) {
          return c._pointerUp(a);
        });
        this._graHit = a;
      }
      __extends(a, b);
      Object.defineProperty(a.prototype, "body", {
        get: function () {
          return this._body;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(a.prototype, "type", {
        get: function () {
          return this._type;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(a.prototype, "rect", {
        get: function () {
          return this._rect;
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(a.prototype, "color", {
        get: function () {
          return r.getColor(this._type, this._did);
        },
        enumerable: !0,
        configurable: !0,
      });
      Object.defineProperty(a.prototype, "isFloor", {
        get: function () {
          return this._type == f.FL_BOX || this._type == f.FL_CIR ? !0 : !1;
        },
        enumerable: !0,
        configurable: !0,
      });
      a.prototype.init = function (a, b) {
        this._type = a;
        this._did = b;
        this.visible = !0;
        this.alpha = 1;
        this.rotation = 0;
        this.scale = 1;
        this._hitPtFlags = [];
        this._hitPtCount = 0;
        this._hitPts = [];
        this._isPtComplete = !1;
        this._graLine.visible = !0;
      };
      a.prototype._pointerDown = function (a) {
        this._downX = c.main.pixi.mouseX;
        this._downY = c.main.pixi.mouseY;
      };
      a.prototype._pointerUp = function (a) {
        a = c.main.pixi.mouseX - this._downX;
        var b = c.main.pixi.mouseY - this._downY;
        20 > a * a + b * b && c.main.pixi.remove(this._body.id);
      };
      a.prototype.hide = function () {
        var a = this;
        TweenMax.killTweensOf(this);
        var b = Back.easeIn.config(1.5),
          c = aidn.math.rand(0.3, 0.9);
        TweenMax.to(this, c, {
          scale: 0,
          ease: b,
          onComplete: function () {
            return a.remove();
          },
        }).play();
      };
      a.prototype.hitcheckPoints = function (a) {
        var b = a.length;
        if (0 < b && b <= this._hitPtCount)
          return (this._isPtComplete = !0), this.update(), !0;
        for (var c = 0; c < b; c++) {
          var d = a[c];
          if (!this._hitPtFlags[c]) {
            var f = d.x - this.x,
              g = d.y - this.y;
            f * f + g * g < this._rect.r * this._rect.r &&
              ((this._hitPtFlags[c] = !0),
              this._hitPtCount++,
              (f = r.getColor(this._type, this._did)),
              d.hit(f),
              this._hitPts.push(d),
              m.playDisp(-1));
          }
        }
        return !1;
      };
      a.prototype.hit = function (a) {
        if (this.isFloor)
          (this.scale = this.alpha = 1),
            TweenMax.killTweensOf(this),
            TweenMax.to(this, 0.5, {
              alpha: 0.5,
              ease: Power0.easeNone,
            }).play();
        else {
          a.label == f.FIX_CIR.toString() &&
            (console.log(this._body.velocity, this._body.force),
            (a = Matter.Vector.create(
              this._body.velocity.x,
              this._body.velocity.y
            )),
            0.2 <= Math.abs(a.x) && (a.x *= 1.5),
            -0.2 > a.y && (a.y *= 5),
            Matter.Body.setVelocity(this._body, a));
          a = aidn.util.getTime();
          var b = a - this._preTime;
          this._preTime = a;
          240 < b &&
            ((this.scale = 0.5),
            (a = Back.easeOut.config(1.7)),
            TweenMax.to(this, 0.5, { scale: 1, ease: a }).play(),
            m.playDisp(this._did),
            c.main.pixi.effect.show(this),
            this._changeColor());
        }
      };
      a.prototype._changeColor = function () {
        this._did = r.getRandomId(this._type);
        this._draw();
      };
      a.prototype._normalizeRect = function (a) {
        if (this._type == f.OBJ_CIR) {
          var b = Math.min(c.stw, c.sth) / 13;
          b < a.r && (a.r = b);
        }
        return a;
      };
      a.prototype.updatePre = function (a, b, c) {
        void 0 === c && (c = 0);
        a = this._normalizeRect(new D(a, b, this._type != f.FL_BOX, c));
        b = this._gra;
        b.clear();
        b.lineStyle(1, 10066329);
        switch (this._type) {
          case f.FL_CIR:
          case f.OBJ_CIR:
            b.drawCircle(0, 0, a.r);
            break;
          case f.FL_BOX:
            b.drawRect(-a.hw, -a.hh, a.w, a.h);
        }
        this.x = a.x;
        this.y = a.y;
        this.rotation = a._rad;
      };
      a.prototype.fix = function (a, b, d) {
        void 0 === d && (d = 0);
        if (!b) return !1;
        this._rect = a = this._normalizeRect(
          new D(a, b, this._type != f.FL_BOX, d)
        );
        if (3 >= a.w || 3 >= a.h || 8 >= a.w + a.h) return !1;
        b = {};
        var g = this._rect._rad;
        this._draw();
        d = 0.5;
        switch (this._type) {
          case f.FL_CIR:
          case f.FL_BOX:
            this.alpha = p.ALPHA_FL;
            d = 0.3;
            b = { isStatic: !0, restitution: 0.8, friction: 0, angle: g };
            m.play(m.SE_FIX_FL);
            break;
          case f.OBJ_CIR:
            (this.alpha = 1),
              (b = { restitution: 0.4, friction: 0, angle: g }),
              m.play(m.SE_FIX_OBJ);
        }
        this.scale = 0;
        g = Back.easeOut.config(1.5);
        TweenMax.killTweensOf(this);
        TweenMax.to(this, d, { scale: 1, ease: g }).play();
        switch (this._type) {
          case f.FL_CIR:
          case f.OBJ_CIR:
            this._body = Matter.Bodies.circle(a.x, a.y, a.r, b);
            break;
          case f.FL_BOX:
            this._body = Matter.Bodies.rectangle(a.x, a.y, a.w, a.h, b);
        }
        this._body.label = this._type.toString();
        c.main.pixi.matter.add(this._body);
        this.id = this._body.id;
        this.x = a.x;
        this.y = a.y;
        return !0;
      };
      a.prototype._draw = function (a) {
        void 0 === a && (a = !0);
        var b = this._rect,
          d = this._gra;
        a && d.clear();
        switch (this._type) {
          case f.FL_CIR:
            d.beginFill(16777215, 0.3);
            d.lineStyle(1, 16777215);
            d.drawCircle(0, 0, b.r);
            break;
          case f.FL_BOX:
            d.beginFill(16777215, 0.3);
            d.lineStyle(1, 16777215);
            d.drawRect(-b.hw, -b.hh, b.w, b.h);
            break;
          case f.OBJ_CIR:
            (a = r.getColor(this._type, this._did)),
              d.beginFill(a),
              d.drawCircle(0, 0, b.r);
        }
        d = this._graHit;
        d.clear();
        d.beginFill(0, 0);
        switch (this._type) {
          case f.FL_CIR:
            a = Math.min(c.stw, c.sth) / 30;
            d.drawCircle(0, 0, b.r + a);
            break;
          case f.FL_BOX:
            a = Math.min(c.stw, c.sth) / 30;
            d.drawRect(-b.hw - a, -b.hh - a, b.w + 2 * a, b.h + 2 * a);
            break;
          case f.OBJ_CIR:
            d.drawCircle(0, 0, b.r);
        }
      };
      a.prototype.update = function () {
        this.x = this._body.position.x;
        this.y = this._body.position.y;
        this.rotation = this._body.angle;
        if (
          0 < this._hitPtCount &&
          ((this._linetime += c.delta),
          0.06 <= this._linetime &&
            ((this._linetime -= 0.06),
            (this._graLine.visible = !this._graLine.visible)),
          !this.__isEndDrawing)
        ) {
          var a = this._hitPts.length;
          if (0 < a) {
            var b = this._graLine;
            b.clear();
            b.lineStyle(1, 16777215, 0.7);
            for (var d = 0; d < a; d++) {
              var f = this._hitPts[d];
              0 != d ? b.lineTo(f.x, f.y) : b.moveTo(f.x, f.y);
            }
            this._isPtComplete || b.lineTo(this.x, this.y);
          }
        }
        return c.sth < this.y - 2 * this._rect.h ? !1 : !0;
      };
      a.prototype.startEndDraw = function (a) {
        var b = this,
          c = 0.38 * (this._hitPts.length - 1);
        this.__isEndDrawing = !0;
        this.__rate = this.__now = 0;
        this.__complete = a;
        TweenMax.killTweensOf(this);
        TweenMax.to(this, c, {
          delay: 0.9,
          __rate: 1,
          ease: Power0.easeNone,
          onComplete: function () {
            return b.__completeEndDraw();
          },
          onUpdate: function () {
            return b.__updateEndDraw();
          },
          onStart: function () {
            return b.__startEndDraw();
          },
        }).play();
      };
      a.prototype.__startEndDraw = function () {
        this.__isEndDrawing = !0;
      };
      a.prototype.__updateEndDraw = function () {
        var a = this.__rate,
          b = this._hitPts.length,
          c = 1 / (b - 1),
          d = this._graLine;
        d.clear();
        d.lineStyle(1, 16777215, 0.7);
        for (var f = 0, g = 0; g < b - 1; g++) {
          var k = (a - f) / c;
          1 <= k && (k = 1);
          if (0 >= k) break;
          var l = this._hitPts[g],
            m = this._hitPts[g + 1];
          this.__now == g && (this.__now++, this.__hitEnd(l));
          d.moveTo(l.x, l.y);
          d.lineTo(l.x + (m.x - l.x) * k, l.y + (m.y - l.y) * k);
          f += c;
        }
      };
      a.prototype.__completeEndDraw = function () {
        this.__isEndDrawing = !1;
        c.state == d.END &&
          (this.__hitEnd(this._hitPts[this._hitPts.length - 1], !0),
          TweenMax.delayedCall(1.3, this.__complete));
      };
      a.prototype.__hitEnd = function (a, b) {
        void 0 === b && (b = !1);
        a.scale = 3.5;
        var c = Elastic.easeOut.config(1, 0.3);
        TweenMax.killTweensOf(a);
        TweenMax.to(a, 0.7, { scale: 1, esae: c }).play();
        c = m.SE_HITS[a.id % m.SE_HITS.length];
        b ? m.play(m.SE_HIT_POINT_LAST) : m.play(c);
      };
      a.prototype.remove = function () {
        this._body &&
          (c.main.pixi.matter.remove(this._body), (this._body = null));
        this._gra.clear();
        this._graHit.clear();
        this.visible = !1;
        this._graLine.clear();
        this._graLine.visible = !1;
      };
      return a;
    })(u),
    D = (function () {
      return function (b, a, d, f) {
        void 0 === d && (d = !0);
        void 0 === f && (f = 0);
        this._rad = 0;
        if (d)
          (this.x = b.x),
            (this.y = b.y),
            (this.w = 2 * Math.abs(b.x - a.x)),
            (this.h = 2 * Math.abs(b.y - a.y)),
            (this.hw = 0.5 * this.w),
            (this.hh = 0.5 * this.h);
        else {
          this.x = 0.5 * (b.x + a.x);
          this.y = 0.5 * (b.y + a.y);
          d = b.x - a.x;
          var g = b.y - a.y;
          this.w = Math.sqrt(d * d + g * g);
          this.h = Math.min(c.stw, c.sth) / 35 + f;
          this.hw = 0.5 * this.w;
          this.hh = 0.5 * this.h;
          this._rad = Math.atan2(a.y - b.y, a.x - b.x);
        }
        this.r = 0.5 * Math.sqrt(this.w * this.w + this.h * this.h);
      };
    })(),
    x = (function () {
      function b(a, b) {
        void 0 === a && (a = 0);
        void 0 === b && (b = 0);
        this.x = a;
        this.y = b;
      }
      b.prototype.clone = function () {
        return new b(this.x, this.y);
      };
      return b;
    })(),
    N = (function () {
      function b() {}
      b.prototype.init = function (a) {
        var b = this;
        void 0 === a && (a = !1);
        this._debug = a;
        this._engine = Matter.Engine.create();
        if (this._debug) {
          a = document.createElement("div");
          a.id = "matter";
          var d = a.style;
          d.position = "absolute";
          d.zIndex = "10";
          d.pointerEvents = "none";
          d.opacity = "0.4";
          document.body.appendChild(a);
          this._render = Matter.Render.create({
            element: a,
            engine: this._engine,
            options: { width: c.stw, height: c.sth },
          });
        }
        Matter.Events.on(this._engine, "collisionEnd", function (a) {
          return b._collisionStart(a);
        });
      };
      b.prototype._collisionStart = function (a) {
        for (var b = a.pairs.length, d = 0; d < b; d++) {
          var f = a.pairs[d].bodyA,
            g = a.pairs[d].bodyB;
          c.main.pixi.hit(f, g);
          c.main.pixi.hit(g, f);
        }
      };
      b.prototype.start = function () {
        Matter.Engine.run(this._engine);
        this._debug && Matter.Render.run(this._render);
      };
      b.prototype.add = function (a) {
        Matter.World.add(this._engine.world, a);
      };
      b.prototype.remove = function (a) {
        Matter.World.remove(this._engine.world, a);
      };
      b.prototype.resize = function () {
        this._debug &&
          ((this._render.canvas.width = c.stw),
          (this._render.canvas.height = c.sth));
      };
      return b;
    })();
})(fra || (fra = {}));
fra.checkLoop();
