"use strict";

var ACTIONS = {
  DOWN: function (program) {
    program.cursor.vx = 0;
    program.cursor.vy = 1;
  },
  LEFT: function (program) {
    program.cursor.vx = -1;
    program.cursor.vy = 0;
  },
  RIGHT: function (program) {
    program.cursor.vx = 1;
    program.cursor.vy = 0;
  },
  STOP: function (program) {
    program.cursor.vx = 0;
    program.cursor.vy = 0;
  },
  UP: function (program) {
    program.cursor.vx = 0;
    program.cursor.vy = -1;
  },
};

document.getElementById("STOP").setAttribute("points",
    flexo.svg_polygon_points(8, 35, Math.PI / 8));

var Cursor = {};

Cursor.action = function () {
  var mask = this.program.mask_at(this.x, this.y);
  if (mask.icon) {
    if (typeof mask.icon.action === "function") {
      mask.icon.action(program);
    } else {
      program.push(mask.icon);
    }
  }
  mask.highlighted = false;
  this.x = flexo.clamp(this.x + this.vx, this.program.x,
      this.program.x + this.program.w - 1);
  this.y = flexo.clamp(this.y + this.vy, this.program.y,
      this.program.y + this.program.h - 1);
  this.program.mask_at(this.x, this.y).highlighted = true;
};

var Program = {};

Program.step = function () {
  this.cursor.action();
  window.setTimeout(this.step.bind(this), this.rate_ms);
}

Program.mask_at = function (x, y) {
  return this.masks[y - this.y][x - this.x];
}

var program = (function () {
  var program = Object.create(Program);
  program.rate_ms = 350;
  flexo.make_readonly(program, "x", -3);
  flexo.make_readonly(program, "y", -3);
  flexo.make_readonly(program, "w", 7);
  flexo.make_readonly(program, "h", 7);
  flexo.make_readonly(program, "cursor", (function () {
    var cursor = Object.create(Cursor);
    cursor.x = 0;
    cursor.y = 0;
    cursor.vx = 0;
    cursor.vy = 0;
    flexo.make_readonly(cursor, "program", program);
    return cursor;
  }()));
  return program;
}());

var step_ms = 500;
var sz = 100;
var svg = document.querySelector("svg");
svg.setAttribute("viewBox", "%0 %1 %2 %3".fmt((program.x - 0.5) * sz,
    (program.y - 0.5) * sz, (program.w + 1) * sz, (program.h + 1) * sz));

// Draw the grid
var grid = document.getElementById("grid");
for (var i = 0; i <= program.w; ++i) {
  grid.appendChild(flexo.$line({ x1: (program.x + i) * sz,
    x2: (program.x + i) * sz, y1: program.y * sz,
    y2: (program.y + program.h) * sz }));
}
for (var j = 0; j <= program.h; ++j) {
  grid.appendChild(flexo.$line({ y1: (program.y + j) * sz,
    y2: (program.y + j) * sz, x1: program.x * sz,
    x2: (program.x + program.w) * sz }));
}

// Icons layer
var defs = Array.prototype.slice.call(document.querySelectorAll("defs > *"));
var icons = document.getElementById("icons");

// Draw the masks
var masks = document.getElementById("masks");
program.masks = [];
for (var j = 0; j < program.h; ++j) {
  program.masks.push([]);
  for (var i = 0; i < program.w; ++i) {
    (function (i_, j_) {
      var mask = masks.appendChild(flexo.$rect({ width: sz, height: sz,
        x: (program.x + i_) * sz, y: (program.y + j_) * sz }));
      program.masks[j].push(mask);
      flexo.make_readonly(mask, "_x", i_ + program.x);
      flexo.make_readonly(mask, "_y", j_ + program.y);
      flexo.make_property(mask, "highlighted", function (h) {
        this.setAttribute("stroke-width", h ? 8 : 0);
        return h;
      });
      flexo.make_property(mask, "counter", function (k, p) {
        flexo.safe_remove(this.icon);
        if (k > defs.length) {
          k = 0;
          delete this.icon;
        }
        if (k > 0) {
          var id = defs[k - 1].id;
          this.icon = icons.appendChild(flexo.$use({ "xlink:href": "#" + id,
            x: (program.x + i_) * sz,
            y: (program.y + j_) * sz }));
          mask.icon.action = ACTIONS[id];
        }
        return k;
      });
      mask.counter = 0;
      vs.addPointerListener(mask, vs.POINTER_END, function () {
        ++mask.counter;
      }, false);
      mask.highlighted = false;
    }(i, j));
  }
}

document.addEventListener("touchstart", function (e) {
  e.preventDefault();
}, false);

program.step();
