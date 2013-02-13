(function (hb) {
  "use strict";

  var x = -3;
  var y = -3;
  var w = 7;
  var h = 7;
  var sz = 100;
  var svg = flexo.$svg({ viewBox: "%0 %1 %2 %3"
    .fmt((x - 0.5) * sz, (y - 0.5) * sz, (w + 1) * sz, (h + 1) * sz)
  });
  document.querySelector("div.expand").appendChild(svg);

  var grid = svg.appendChild(flexo.$g({ stroke: "black", fill: "none" }));
  for (var i = 0; i <= w; ++i) {
    grid.appendChild(flexo.$line({ x1: (x + i) * sz, x2: (x + i) * sz,
      y1: y * sz, y2: (y + h) * sz }));
  }
  for (var j = 0; j <= h; ++j) {
    grid.appendChild(flexo.$line({ y1: (y + j) * sz, y2: (y + j) * sz,
      x1: x * sz, x2: (x + w) * sz }));
  }

  var pc = svg.appendChild(flexo.$rect({ fill: "none", stroke: "black",
    "stroke-width": 8, "stroke-linejoin": "round", width: sz, height: sz }));
  flexo.make_property(pc, "x", function (x_) {
    var x__ = flexo.clamp(x_, x, x + w - 1);
    this.setAttribute("x", x__ * sz);
    return x__;
  });
  flexo.make_property(pc, "y", function (y_) {
    var y__ = flexo.clamp(y_, y, y + h - 1);
    this.setAttribute("y", y__ * sz);
    return y__;
  });
  pc.x = 0;
  pc.y = 0;

  for (var i = 0; i < w; ++i) {
    for (var j = 0; j < h; ++j) {
      (function (i_, j_) {
        var mask = svg.appendChild(flexo.$rect({ "fill-opacity": 0, width: sz,
          height: sz, x: (x + i_) * sz, y: (y + j_) * sz }));
        vs.addPointerListener(mask, vs.POINTER_END, function () {
          pc.x = x + i_;
          pc.y = y + j_;
        }, false);
      }(i, j));
    }
  }

}(this.hb = {}));
