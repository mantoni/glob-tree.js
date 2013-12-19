/*
 * glob-tree.js
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var inherits = require('inherits');
var liveTree = require('live-tree');
var iterator = require('./iterator');

function Node(name) {
  Node.super_.call(this, name);
}

inherits(Node, liveTree.Node);

Node.prototype._add = function (node) {
  Node.super_.prototype._add.call(this, node);
  node.path = this.path ? (this.path + '.' + node.name) : node.name;
};

Node.prototype.iterator = function (match) {
  return iterator.create(this, match);
};

exports.Node = Node;
