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

goog.provide('myphysicslab.sims.layout.CompareGraph');

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
goog.require('myphysicslab.lab.util.AbstractSubject');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.GenericEvent');
goog.require('myphysicslab.lab.util.GenericObserver');
goog.require('myphysicslab.lab.util.ParameterBoolean');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.ParameterString');
goog.require('myphysicslab.lab.util.Subject');
goog.require('myphysicslab.lab.util.SubjectList');
goog.require('myphysicslab.lab.util.Terminal');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.view.DrawingMode');
goog.require('myphysicslab.lab.view.HorizAlign');
goog.require('myphysicslab.lab.view.LabCanvas');
goog.require('myphysicslab.lab.view.LabView');
goog.require('myphysicslab.lab.view.SimView');
goog.require('myphysicslab.lab.view.VerticalAlign');
goog.require('myphysicslab.sims.layout.CommonControls');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var AutoScale = lab.graph.AutoScale;
var ButtonControl = lab.controls.ButtonControl;
var CheckBoxControl = lab.controls.CheckBoxControl;
var ChoiceControl = lab.controls.ChoiceControl;
var CommonControls = sims.layout.CommonControls;
var AbstractSubject = lab.util.AbstractSubject;
var DisplayGraph = lab.graph.DisplayGraph;
var DoubleRect = lab.util.DoubleRect;
var DrawingMode = myphysicslab.lab.view.DrawingMode;
var GenericEvent = lab.util.GenericEvent;
var GenericObserver = lab.util.GenericObserver;
var GraphLine = lab.graph.GraphLine;
var HorizAlign = lab.view.HorizAlign;
var LabCanvas = lab.view.LabCanvas;
var LabControl = lab.controls.LabControl;
var LabView = myphysicslab.lab.view.LabView;
var NumericControl = lab.controls.NumericControl;
var ParameterBoolean = lab.util.ParameterBoolean;
var ParameterNumber = lab.util.ParameterNumber;
var ParameterString = lab.util.ParameterString;
var SimController = lab.app.SimController;
var SimRunner = lab.app.SimRunner;
var SimView = lab.view.SimView;
var Subject = lab.util.Subject;
var SubjectList = lab.util.SubjectList;
var Terminal = lab.util.Terminal;
var UtilityCore = lab.util.UtilityCore;
var VerticalAlign = lab.view.VerticalAlign;

/** Creates a graph showing two GraphLines corresponding to two Simulations, where the
two GraphLines are showing the same variables. There is a single SimView and
DisplayGraph. Creates an AutoScale that ensures both GraphLines are visible. Creates
controls to modify the graph. The menu choices are only connected to the first
GraphLine. The second GraphLine should be externally synchronized to show the same
variables as the first GraphLine.

* @param {!GraphLine} line1 the first GraphLine to show
* @param {!GraphLine} line2 the second GraphLine to show
* @param {!LabCanvas} graphCanvas the LabCanvas where the graph should appear
* @param {!Element} div_controls the HTML div where controls should be added
* @param {!Element} div_graph the HTML div where the graphCanvas is located
* @param {!SimRunner} simRun the SimRunner controlling the overall app
* @constructor
* @final
* @extends {myphysicslab.lab.util.AbstractSubject}
* @implements {SubjectList}
* @struct
*/
myphysicslab.sims.layout.CompareGraph = function(line1, line2, graphCanvas,
    div_controls, div_graph, simRun) {
  AbstractSubject.call(this, 'GRAPH_LAYOUT');
  this.line1 = line1;
  this.line2 = line2;
  /** @type {!lab.view.LabCanvas} */
  this.canvas = graphCanvas;
  simRun.addCanvas(graphCanvas);

  /** @type {!lab.view.SimView} */
  this.view = new SimView('graph', new DoubleRect(0, 0, 1, 1));
  this.view.setHorizAlign(HorizAlign.FULL);
  this.view.setVerticalAlign(VerticalAlign.FULL);
  this.view.addMemo(line1);
  this.view.addMemo(line2);
  graphCanvas.addView(this.view);

  /** @type {!lab.graph.DisplayAxes} */
  this.axes = CommonControls.makeAxes(this.view);
  var updateAxes = goog.bind(function(evt) {
    if (evt.nameEquals(GraphLine.en.X_VARIABLE)) {
      this.axes.setHorizName(this.line1.getXVarName());
    }
    if (evt.nameEquals(GraphLine.en.Y_VARIABLE)) {
      this.axes.setVerticalName(this.line1.getYVarName());
    }
  }, this);
  new GenericObserver(line1, updateAxes, 'update axes names');
  updateAxes(new GenericEvent(line1, GraphLine.i18n.X_VARIABLE));

  /** @type {!lab.graph.AutoScale} */
  this.autoScale = new AutoScale('COMPARE_GRAPH_AUTO_SCALE', line1, this.view);
  this.autoScale.addGraphLine(line2);
  this.autoScale.extraMargin = 0.05;

  /** @type {!lab.graph.DisplayGraph} */
  this.displayGraph = new DisplayGraph(line1);
  this.displayGraph.addGraphLine(line2);
  this.displayGraph.setScreenRect(this.view.getScreenRect());
  // Use off-screen buffer because usually the autoScale doesn't change the area.
  this.displayGraph.setUseBuffer(true);
  this.view.getDisplayList().prepend(this.displayGraph);
  // inform displayGraph when the screen rect changes.
  new GenericObserver(this.view, goog.bind(function(evt) {
      if (evt.nameEquals(LabView.SCREEN_RECT_CHANGED)) {
        this.displayGraph.setScreenRect(this.view.getScreenRect());
      }
    }, this), 'resize DisplayGraph');

  /** @type {!Array<!LabControl>} */
  this.controls_ = [];
  /** @type {!Element} */
  this.div_controls = div_controls;
  this.addControl(CommonControls.makePlaybackControls(simRun));

  /** @type {!ParameterNumber} */
  var pn = line1.getParameterNumber(GraphLine.en.Y_VARIABLE);
  this.addControl(new ChoiceControl(pn, 'Y:'));
  pn = line1.getParameterNumber(GraphLine.en.X_VARIABLE);
  this.addControl(new ChoiceControl(pn, 'X:'));

  var bc = new ButtonControl(GraphLine.i18n.CLEAR_GRAPH,
      goog.bind(function() {
        line1.reset();
        line2.reset();
        this.autoScale.reset();
      }, this));
  this.addControl(bc);

  /** @type {!ParameterString} */
  var ps = line1.getParameterString(GraphLine.en.DRAWING_MODE);
  this.addControl(new ChoiceControl(ps));

  // use same drawing mode on line2
  new GenericObserver(line1, function(evt) {
    line2.setDrawingMode(line1.getDrawingMode());
  }, 'match drawing mode on GraphLine');

  /** SimController which pans the graph with no modifier keys pressed.
  * @type {!lab.app.SimController}
  */
  this.graphCtrl = new SimController(graphCanvas, /*eventHandler=*/null,
      /*panModifier=*/{alt:false, control:false, meta:false, shift:false});

  var panzoom = CommonControls.makePanZoomControls(this.view, /*overlay=*/true,
      /*resetFunc=*/goog.bind(function() {
        this.autoScale.setActive(true);
      },this));
  div_graph.appendChild(panzoom);
  /** @type {!ParameterBoolean} */
  var pb = CommonControls.makeShowPanZoomParam(panzoom, this);
  this.addControl(new CheckBoxControl(pb));
};
var CompareGraph = myphysicslab.sims.layout.CompareGraph;
goog.inherits(CompareGraph, AbstractSubject);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  CompareGraph.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        +', line1: '+this.line1.toStringShort()
        +', line2: '+this.line2.toStringShort()
        +', canvas: '+this.canvas.toStringShort()
        +', view: '+this.view.toStringShort()
        +', axes: '+this.axes.toStringShort()
        +', autoScale: '+this.autoScale.toStringShort()
        +', displayGraph: '+this.displayGraph.toStringShort()
        +', graphCtrl: '+this.graphCtrl.toStringShort()
        + CompareGraph.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
CompareGraph.prototype.getClassName = function() {
  return 'CompareGraph';
};

/** @inheritDoc */
CompareGraph.prototype.getSubjects = function() {
  return [ this, this.line1, this.line2, this.view, this.autoScale ];
};

/** Add the control to the set of simulation controls.
* @param {!LabControl} control
* @return {!LabControl} the control that was passed in
*/
CompareGraph.prototype.addControl = function(control) {
  var element = control.getElement();
  element.style.display = 'block';
  this.div_controls.appendChild(element);
  this.controls_.push(control);
  return control;
};

}); // goog.scope
