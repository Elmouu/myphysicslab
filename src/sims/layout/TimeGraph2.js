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

goog.provide('myphysicslab.sims.layout.TimeGraph2');

goog.require('myphysicslab.lab.app.SimController');
goog.require('myphysicslab.lab.app.SimRunner');
goog.require('myphysicslab.lab.controls.ButtonControl');
goog.require('myphysicslab.lab.controls.CheckBoxControl');
goog.require('myphysicslab.lab.controls.ChoiceControl');
goog.require('myphysicslab.lab.controls.LabControl');
goog.require('myphysicslab.lab.controls.NumericControl');
goog.require('myphysicslab.lab.graph.AutoScale');
goog.require('myphysicslab.lab.graph.DisplayGraph');
goog.require('myphysicslab.lab.graph.GraphLine');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.GenericObserver');
goog.require('myphysicslab.lab.util.ParameterBoolean');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.ParameterString');
goog.require('myphysicslab.lab.util.Printable');
goog.require('myphysicslab.lab.util.SubjectList');
goog.require('myphysicslab.lab.util.Terminal');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.view.HorizAlign');
goog.require('myphysicslab.lab.view.LabCanvas');
goog.require('myphysicslab.lab.view.LabView');
goog.require('myphysicslab.lab.view.SimView');
goog.require('myphysicslab.lab.view.VerticalAlign');
goog.require('myphysicslab.sims.layout.CommonControls');

goog.scope(function() {

var lab = myphysicslab.lab;

var AutoScale = lab.graph.AutoScale;
var ButtonControl = lab.controls.ButtonControl;
var CheckBoxControl = lab.controls.CheckBoxControl;
var ChoiceControl = lab.controls.ChoiceControl;
var CommonControls = myphysicslab.sims.layout.CommonControls;
var DisplayGraph = lab.graph.DisplayGraph;
var DoubleRect = lab.util.DoubleRect;
var GenericObserver = lab.util.GenericObserver;
var GraphLine = lab.graph.GraphLine;
var LabCanvas = lab.view.LabCanvas;
var LabControl = lab.controls.LabControl;
var LabView = myphysicslab.lab.view.LabView;
var NumericControl = lab.controls.NumericControl;
var ParameterBoolean = lab.util.ParameterBoolean;
var ParameterNumber = lab.util.ParameterNumber;
var ParameterString = lab.util.ParameterString;
var Printable = lab.util.Printable;
var SimView = lab.view.SimView;
var SubjectList = lab.util.SubjectList;
var UtilityCore = lab.util.UtilityCore;

/** Creates two independent graphs which have a common horizontal time axis, but the
graphs can have very different vertical scales. Each graph consists of a SimView,
GraphLine, DisplayGraph, AutoScale, DisplayAxes. This makes it possible to see together
two GraphLines with very different scales. The horizontal variable can be changed to
something other than time, but we ensure that both graphs have the same horizontal
variable.

Creates several controls to modify the graph (but no pan-zoom control because
it gets too confusing with the independent graphs).

Each graph has its own DisplayAxes, which are shown in the same color as the GraphLine.
One of the axes are placed on the right, and the other is on the left.

* @param {!lab.model.VarsList} varsList the VarsList to collect
*   data from
* @param {!lab.view.LabCanvas} graphCanvas the LabCanvas where the graph
*   should appear
* @param {!Element} div_controls the HTML div where controls should be added
* @param {!Element} div_graph the HTML div where the graphCanvas is located
* @param {!lab.app.SimRunner} simRun the SimRunner controlling the
*   overall app
* @constructor
* @final
* @implements {Printable}
* @implements {SubjectList}
* @struct
*/
myphysicslab.sims.layout.TimeGraph2 = function(varsList, graphCanvas, div_controls,
    div_graph, simRun) {
  /** @type {!myphysicslab.lab.view.LabCanvas} */
  this.canvas = graphCanvas;
  simRun.addCanvas(graphCanvas);
  /** @type {!lab.view.SimView} */
  this.view1 = new SimView('TIME_GRAPH_1', new DoubleRect(0, 0, 1, 1));
  this.view1.setHorizAlign(lab.view.HorizAlign.FULL);
  this.view1.setVerticalAlign(lab.view.VerticalAlign.FULL);
  graphCanvas.addView(this.view1);
  this.displayList1 = this.view1.getDisplayList();
  /** @type {!lab.graph.DisplayAxes} */
  this.axes1 = CommonControls.makeAxes(this.view1);
  this.axes1.setColor('lime');
  /** @type {!GraphLine} */
  this.line1 = new GraphLine('TIME_LINE_1', varsList);
  new GenericObserver(this.line1, goog.bind(function(evt) {
    if (evt.nameEquals(GraphLine.en.X_VARIABLE)) {
      this.axes1.setHorizName(this.line1.getXVarName());
    }
    if (evt.nameEquals(GraphLine.en.Y_VARIABLE)) {
      this.axes1.setVerticalName(this.line1.getYVarName());
    }
  }, this), 'update axes1 names');
  this.line1.setColor('lime');
  this.view1.addMemo(this.line1);
  /** @type {!AutoScale} */
  this.autoScale1 = new AutoScale('TIME_GRAPH_AUTO_SCALE_1', this.line1, this.view1);
  this.autoScale1.extraMargin = 0.05;
  /** @type {!DisplayGraph} */
  this.displayGraph1 = new DisplayGraph(this.line1);
  this.displayGraph1.setScreenRect(this.view1.getScreenRect());
  // Don't use off-screen buffer because the auto-scale causes graph to redraw
  // every frame.  Therefore no time savings from off-screen buffer.
  this.displayGraph1.setUseBuffer(false);
  this.displayList1.prepend(this.displayGraph1);
  // inform displayGraph1 when the screen rect changes.
  new GenericObserver(this.view1, goog.bind(function(evt) {
      if (evt.nameEquals(LabView.SCREEN_RECT_CHANGED)) {
        this.displayGraph1.setScreenRect(this.view1.getScreenRect());
      }
    }, this), 'resize DisplayGraph1');

  var timeIdx = this.line1.getVarsList().timeIndex();
  this.line1.setXVariable(timeIdx);
  this.line1.setYVariable(0);

  /** @type {!lab.view.SimView} */
  this.view2 = new SimView('TIME_GRAPH_2', new DoubleRect(0, 0, 1, 1));
  this.view2.setHorizAlign(lab.view.HorizAlign.FULL);
  this.view2.setVerticalAlign(lab.view.VerticalAlign.FULL);
  graphCanvas.addView(this.view2);
  this.displayList2 = this.view2.getDisplayList();
  /** @type {!lab.graph.DisplayAxes} */
  this.axes2 = CommonControls.makeAxes(this.view2);
  this.axes2.setColor('red');
  this.axes2.setYAxisAlignment(lab.view.HorizAlign.RIGHT);
  /** @type {!GraphLine} */
  this.line2 = new GraphLine('TIME_LINE_2', varsList);
  new GenericObserver(this.line2, goog.bind(function(evt) {
    if (evt.nameEquals(GraphLine.en.X_VARIABLE)) {
      this.axes2.setHorizName(this.line2.getXVarName());
    }
    if (evt.nameEquals(GraphLine.en.Y_VARIABLE)) {
      this.axes2.setVerticalName(this.line2.getYVarName());
    }
  }, this), 'update axes2 names');
  this.view2.addMemo(this.line2);
  this.line2.setXVariable(timeIdx);
  this.line2.setYVariable(1);
  this.line2.setColor('red');
  /** @type {!AutoScale} */
  this.autoScale2 = new AutoScale('TIME_GRAPH_AUTO_SCALE_2', this.line2, this.view2);
  this.autoScale2.extraMargin = 0.05;
  /** @type {!DisplayGraph} */
  this.displayGraph2 = new DisplayGraph(this.line2);
  this.displayGraph2.setScreenRect(this.view2.getScreenRect());
  // Don't use off-screen buffer because the auto-scale causes graph to redraw
  // every frame.  Therefore no time savings from off-screen buffer.
  this.displayGraph2.setUseBuffer(false);
  this.displayList2.prepend(this.displayGraph2);
  // inform displayGraph2 when the screen rect changes.
  new GenericObserver(this.view2, goog.bind(function(evt) {
      if (evt.nameEquals(LabView.SCREEN_RECT_CHANGED)) {
        this.displayGraph2.setScreenRect(this.view2.getScreenRect());
      }
    }, this), 'resize DisplayGraph2');

  /** @type {!Array<!LabControl>} */
  this.controls_ = [];
  /** @type {!Element} */
  this.div_controls = div_controls;

  this.addControl(CommonControls.makePlaybackControls(simRun));

  var pn = this.line1.getParameterNumber(GraphLine.en.Y_VARIABLE);
  this.addControl(new ChoiceControl(pn, TimeGraph2.i18n.LIME));
  pn = this.line2.getParameterNumber(GraphLine.en.Y_VARIABLE);
  this.addControl(new ChoiceControl(pn, TimeGraph2.i18n.RED));
  pn = this.line1.getParameterNumber(GraphLine.en.X_VARIABLE);
  this.addControl(new ChoiceControl(pn, 'X:'));
  pn = this.autoScale1.getParameterNumber(AutoScale.en.TIME_WINDOW)
  this.addControl(new NumericControl(pn));
  var bc = new ButtonControl(GraphLine.i18n.CLEAR_GRAPH,
      goog.bind(function() {
        this.line1.reset();
        this.line2.reset();
      }, this)
    );
  this.addControl(bc);
  /** GenericObserver ensures autoScale2 has same time window as autoScale1
  * @type {!lab.util.GenericObserver}
  */
  this.auto1Obs = new GenericObserver(this.autoScale1, goog.bind(function(e) {
      this.autoScale2.setTimeWindow(this.autoScale1.getTimeWindow());
    }, this), 'ensures autoScale2 has same time window as autoScale1');
  /** GenericObserver ensures line2 has same X variable as line1.
  * @type {!lab.util.GenericObserver}
  */
  this.line1Obs = new GenericObserver(this.line1, goog.bind(function(e) {
      // Don't use off-screen buffer with time variable because the auto-scale causes
      // graph to redraw every frame.
      var isTimeGraph = this.line1.getXVariable() == timeIdx;
      this.displayGraph1.setUseBuffer(!isTimeGraph);
      this.displayGraph2.setUseBuffer(!isTimeGraph);
      this.line2.setXVariable(this.line1.getXVariable());
    }, this), 'ensures line2 has same X variable as line1');
};
var TimeGraph2 = myphysicslab.sims.layout.TimeGraph2;

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  TimeGraph2.prototype.toString = function() {
    return 'TimeGraph2{'
      +'canvas: '+this.canvas.toStringShort()
      +', view1: '+this.view1.toStringShort()
      +', view2: '+this.view2.toStringShort()
      +', line1: '+this.line1.toStringShort()
      +', line2: '+this.line2.toStringShort()
      +', axes1: '+this.axes1.toStringShort()
      +', axes2: '+this.axes2.toStringShort()
      +', autoScale1: '+this.autoScale1.toStringShort()
      +', autoScale2: '+this.autoScale2.toStringShort()
      +', displayGraph1: '+this.displayGraph1.toStringShort()
      +', displayGraph2: '+this.displayGraph2.toStringShort()
      +'}';
  };

  /** @inheritDoc */
  TimeGraph2.prototype.toStringShort = function() {
    return 'TimeGraph2{}';
  };
};

/** Add the control to the set of simulation controls.
* @param {!LabControl} control
* @return {!LabControl} the control that was passed in
*/
TimeGraph2.prototype.addControl = function(control) {
  var element = control.getElement();
  element.style.display = 'block';
  this.div_controls.appendChild(element);
  this.controls_.push(control);
  return control;
};

/** @inheritDoc */
TimeGraph2.prototype.getSubjects = function() {
  return [ this.line1, this.line2, this.view1, this.view2, this.autoScale1,
      this.autoScale2 ];
};

/** Set of internationalized strings.
@typedef {{
  LIME: string,
  RED: string
  }}
*/
TimeGraph2.i18n_strings;

/**
@type {TimeGraph2.i18n_strings}
*/
TimeGraph2.en = {
  LIME: 'lime',
  RED: 'red'
};

/**
@private
@type {TimeGraph2.i18n_strings}
*/
TimeGraph2.de_strings = {
  LIME: 'hell gr\u00fcn',
  RED: 'rot'
};

/** Set of internationalized strings.
@type {TimeGraph2.i18n_strings}
*/
TimeGraph2.i18n = goog.LOCALE === 'de' ? TimeGraph2.de_strings :
    TimeGraph2.en;

}); // goog.scope
