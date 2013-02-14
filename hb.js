(function (hb) {
  "use strict";

  var step_ms = 500;
  var x = -3;
  var y = -3;
  var w = 7;
  var h = 7;
  var sz = 100;
  var svg = document.querySelector("svg");
  svg.setAttribute("viewBox", "%0 %1 %2 %3"
    .fmt((x - 0.5) * sz, (y - 0.5) * sz, (w + 1) * sz, (h + 1) * sz));

  function icon(id) {
    var use = flexo.$use({ "xlink:href": "#" + id });
    flexo.make_property(use, "_x", function (x_) {
      var x__ = flexo.clamp(x_, x, x + w - 1);
      this.setAttribute("x", x__ * sz);
      return x__;
    });
    flexo.make_property(use, "_y", function (y_) {
      var y__ = flexo.clamp(y_, y, y + h - 1);
      this.setAttribute("y", y__ * sz);
      return y__;
    });
    use._x = 0;
    use._y = 0;
    return use;
  }

  var grid = svg.appendChild(flexo.$g({ stroke: "black", fill: "none" }));
  for (var i = 0; i <= w; ++i) {
    grid.appendChild(flexo.$line({ x1: (x + i) * sz, x2: (x + i) * sz,
      y1: y * sz, y2: (y + h) * sz }));
  }
  for (var j = 0; j <= h; ++j) {
    grid.appendChild(flexo.$line({ y1: (y + j) * sz, y2: (y + j) * sz,
      x1: x * sz, x2: (x + w) * sz }));
  }

  var list = Array.prototype.slice.call(document.querySelectorAll("defs > *"));
  list.push("");
  var icons = svg.appendChild(flexo.$g());
  var cursor;

  var masks = svg.appendChild(flexo.$g());
  for (var i = 0; i < w; ++i) {
    for (var j = 0; j < h; ++j) {
      (function (i_, j_) {
        var mask = masks.appendChild(flexo.$rect({ "fill-opacity": 0,
          "stroke": "yellow", "stroke-linejoin": "round",
          width: sz, height: sz,
          x: (x + i_) * sz, y: (y + j_) * sz }));
        flexo.make_readonly(mask, "_x", i_ + x);
        flexo.make_readonly(mask, "_y", j_ + y);
        flexo.make_property(mask, "highlighted", function (h) {
          this.setAttribute("stroke-width", h ? 8 : 0);
          return h;
        });
        flexo.make_property(mask, "icon", function (icon, prev) {
          flexo.safe_remove(prev);
          if (icon) {
            icons.appendChild(icon);
            icon._x = this._x;
            icon._y = this._y;
          }
          return icon;
        });
        vs.addPointerListener(mask, vs.POINTER_END, function () {
          var elem = flexo.random_element(list);
          mask.icon = elem && icon(elem.getAttribute("id"));
        }, false);
        if (i_ === -x && j_ === -y) {
          cursor = mask;
          mask.highlighted = true;
        } else {
          mask.highlighted = false;
        }
      }(i, j));
    }
  }

  var actions = {
    "#primitive-up": function (cursor) {
      move_cursor(0, -1);
    },
    "#primitive-right": function (cursor) {
      move_cursor(1, 0);
    },
    "#primitive-down": function (cursor) {
      move_cursor(0, 1);
    },
    "#primitive-left": function (cursor) {
      move_cursor(-1, 0);
    },
  }

  function move_cursor(dx, dy) {
    cursor.highlighted = false;
    var x_ = flexo.clamp(cursor._x + dx, x, x + w - 1);
    var y_ = flexo.clamp(cursor._y + dy, y, y + h - 1);
    cursor = flexo.find_first(Array.prototype.slice.call(masks.childNodes),
        function (m) {
          return m._x === x_ && m._y === y_;
        });
    cursor.highlighted = true;
    console.log(cursor.icon);
  }

  (function step() {
    if (cursor.icon) {
      actions[cursor.icon.getAttributeNS(flexo.ns.xlink, "href")]();
    }
    window.setTimeout(step, step_ms);
  }());

  document.addEventListener("touchstart", function (e) {
    e.preventDefault();
  }, false);

}(this.hb = {}));
