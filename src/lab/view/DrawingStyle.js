// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('myphysicslab.lab.view.DrawingStyle');

goog.require('myphysicslab.lab.view.DrawingMode');
goog.require('myphysicslab.lab.util.UtilityCore');

goog.scope(function() {

var DrawingMode = myphysicslab.lab.view.DrawingMode;
var UtilityCore = myphysicslab.lab.util.UtilityCore;

/** Specifies drawing style including: whether to draw dots or lines; color; thickness;
line dash.

* @param {!myphysicslab.lab.view.DrawingMode} drawMode whether to draw dots or lines,
*     a value from {@link myphysicslab.lab.view.DrawingMode}
* @param {string} color a CSS color specification
* @param {number} lineWidth  thickness to use when drawing the graph line, in screen
*     coordinates, so a unit is a screen pixel.
* @param {!Array<number>=} opt_lineDash Line dash array used when drawing the line.
*     Corresponds to lengths of dash and spaces, in screen coordinates.
*     For example, `[3, 5]` alternates dashes of length 3 with spaces of length 5.
*     Empty array indicates solid line (which is the default).
* @constructor
* @final
* @struct
*/
myphysicslab.lab.view.DrawingStyle = function(drawMode, color, lineWidth, opt_lineDash) {
  /** Whether to draw dots or lines, a value from
  * {@link myphysicslab.lab.view.DrawingMode}
  * @type {!myphysicslab.lab.view.DrawingMode}
  */
  this.drawMode = drawMode;
  /** a CSS color specification
  * @type {string}
  */
  this.color = color;
  /** thickness to use when drawing the line, or size of dots, in screen coordinates,
  * so a unit is a screen pixel.
  * @type {number}
  */
  this.lineWidth = lineWidth;
  /** Line dash array used when drawing the line.  Corresponds to lengths of dash
  * and spaces, in screen coordinates. For example, `[3, 5]` alternates dashes of
  * length 3 with spaces of length 5. Empty array indicates solid line.
  * @type {!Array<number>}
  */
  this.lineDash = opt_lineDash || [];
};
var DrawingStyle = myphysicslab.lab.view.DrawingStyle;

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  DrawingStyle.prototype.toString = function() {
    return 'DrawingStyle{drawMode: '+this.drawMode
        +', color:"'+this.color+'"'
        +', lineWidth: '+this.lineWidth
        +', lineDash: ['
        + UtilityCore.array2string(this.lineDash, UtilityCore.NF0)
        +']}';
  };
};

/** Returns a DrawingStyle for drawing dots with the given color and dot size.
* @param {string} color a CSS color specification
* @param {number} dotSize size of dots in screen coordinates, so a unit is a screen
*     pixel.
* @return {!DrawingStyle} a DrawingStyle for drawing dots with the given color and dot size
*/
DrawingStyle.dotStyle = function(color, dotSize) {
  return new DrawingStyle(DrawingMode.DOTS, color, dotSize);
};

/** Returns a DrawingStyle for drawing a line with the given color, line width and
optional line dash.
* @param {string} color a CSS color specification
* @param {number} lineWidth  thickness to use when drawing the graph line, in screen
*     coordinates, so a unit is a screen pixel.
* @param {!Array<number>=} opt_lineDash Line dash array used when drawing the line.
*     Corresponds to lengths of dash and spaces, in screen coordinates.
*     For example, `[3, 5]` alternates dashes of length 3 with spaces of length 5.
*     Empty array indicates solid line (which is the default).
* @return {!DrawingStyle} a DrawingStyle for drawing a line with the given color, line width
*     and optional line dash
*/
DrawingStyle.lineStyle = function(color, lineWidth, opt_lineDash) {
  return new DrawingStyle(DrawingMode.LINES, color, lineWidth, opt_lineDash);
};

});  // goog.scope
