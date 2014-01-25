/*
 * glob-tree.js
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var inherits    = require('inherits');
var MinIterator = require('min-iterator');
var liveTree    = require('live-tree');

/*
 * Iterator for no match.
 */
var NULL_ITERATOR = new MinIterator();


/*
 * Iterator for single node match.
 */
function SingleNodeIterator(node) {
  this.n = node;
}

inherits(SingleNodeIterator, MinIterator);

SingleNodeIterator.prototype.next = function () {
  var n = this.n;
  delete this.n;
  return n;
};


/*
 * Iterator for child node matches.
 */
function ChildrenIterator(node) {
  this.i = node.children.iterator();
}

inherits(ChildrenIterator, MinIterator);

ChildrenIterator.prototype.next = function () {
  var n;
  while ((n = this.i.next()) !== undefined) {
    if (n.value) {
      return n;
    }
  }
};


/*
 * Iterator for single start expressions like "*.a".
 */
function SingleStarIterator(node, match) {
  this.q = node.children.toArray();
  this.m = match;
}

inherits(SingleStarIterator, MinIterator);

SingleStarIterator.prototype.next = function () {
  var n;
  while (this.q.length) {
    n = this.q.shift().node(this.m);
    if (n && n.value) {
      return n;
    }
  }
};


/*
 * Iterator for double star expressions like "**.a".
 */
function DoubleStarIterator(node, match, p) {
  this.i = node.children.iterator();
  this.q = [];
  this.p = p;
  this.m = match.substring(2);
}

inherits(DoubleStarIterator, MinIterator);

DoubleStarIterator.prototype.next = function () {
  var n, s, p;
  while (true) {
    while ((n = this.i.next()) !== undefined) {
      if (n.children.length) {
        this.q.push(n.children.iterator());
      } else {
        s = n.path.substring(this.p);
        p = s.indexOf(this.m);
        if (p !== -1 && p === s.length - this.m.length) {
          return n;
        }
      }
    }
    if (!this.q.length) {
      return;
    }
    this.i = this.q.shift();
  }
};


function create(node, match) {
  if (!match) {
    return new liveTree.Iterator(node);
  }
  var p = match.indexOf('*');
  if (p === -1) {
    node = node.node(match);
    return node && node.value ? new SingleNodeIterator(node) : NULL_ITERATOR;
  }
  if (p !== 0) {
    node = node.node(match.substring(0, p - 1));
    if (!node) {
      return NULL_ITERATOR;
    }
    match = match.substring(p);
  }
  if (match === '*') {
    return new ChildrenIterator(node);
  }
  if (match === '**') {
    return new liveTree.Iterator(node);
  }
  if (match.indexOf('**') === -1) {
    return new SingleStarIterator(node, match.substring(2));
  }
  return new DoubleStarIterator(node, match, p);
}


exports.create = create;


function nextChild(it, c, x) {
  var m = it.m, p;
  while (!c) {
    p = m.indexOf('.');
    if (p === -1 || (c = it.n = it.n._map[m.substring(0, p)]) === undefined) {
      return;
    }
    m = it.m = m.substring(p + 1);
    c = c._map[x];
  }
  return c;
}


/*
 * Iterator for listeners containing "**".
 */
function DoubleMatcherIterator(node, match) {
  this.n = node;
  this.m = match;
  this.p = match.length;
  this.c = node._map['**'];
}

DoubleMatcherIterator.prototype.next = function () {
  var c = this.c;
  var p = this.p;
  while (true) {
    if (!c) {
      if ((c = this.c = nextChild(this, c, '**')) === undefined) {
        return;
      }
      p = this.m.length;
    } else if (p !== this.m.length) {
      c = c.node(this.m.substring(p + 1));
    }
    if ((p = this.p = this.m.lastIndexOf('.', p - 1)) === -1) {
      this.c = null;
    }
    if (c && c.value) {
      return c;
    }
  }
};

/*
 * Iterator for listeners containing "*".
 */
function SingleMatcherIterator(node, match) {
  this.n = node;
  this.m = match;
  this.f = true;
}

SingleMatcherIterator.prototype.next = function () {
  var c, p;
  if (this.f) {
    c = this.n._map['*'];
    this.f = false;
  }
  while (true) {
    if ((c = nextChild(this, c, '*')) === undefined) {
      return;
    }
    p = this.m.indexOf('.');
    if (p !== -1 && (c = c.node(this.m.substring(p + 1))) === undefined) {
      return;
    }
    if (c.value) {
      return c;
    }
  }
};

/*
 * Iterator for matchers.
 */
function MatcherIterator(node, match) {
  this.a = [new DoubleMatcherIterator(node, match),
            new SingleMatcherIterator(node, match)];
}

inherits(MatcherIterator, MinIterator);

MatcherIterator.prototype.next = function () {
  var a = this.a, v;
  while (a.length) {
    v = a[0].next();
    if (v) {
      return v;
    }
    a.shift();
  }
};


function matcher(node, match) {
  return new MatcherIterator(node, match);
}

exports.matcher = matcher;
