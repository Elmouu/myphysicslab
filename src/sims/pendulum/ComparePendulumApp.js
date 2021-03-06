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

goog.provide('myphysicslab.sims.pendulum.ComparePendulumApp');

goog.require('goog.array');
goog.require('myphysicslab.lab.app.EventHandler');
goog.require('myphysicslab.lab.app.SimController');
goog.require('myphysicslab.lab.app.SimRunner');
goog.require('myphysicslab.lab.controls.CheckBoxControl');
goog.require('myphysicslab.lab.controls.ChoiceControl');
goog.require('myphysicslab.lab.controls.LabControl');
goog.require('myphysicslab.lab.controls.NumericControl');
goog.require('myphysicslab.lab.controls.SliderControl');
goog.require('myphysicslab.lab.graph.AutoScale');
goog.require('myphysicslab.lab.graph.DisplayGraph');
goog.require('myphysicslab.lab.graph.GraphLine');
goog.require('myphysicslab.lab.graph.DisplayAxes');
goog.require('myphysicslab.lab.graph.VarsHistory'); // for possible use in Terminal
goog.require('myphysicslab.lab.model.Arc');
goog.require('myphysicslab.lab.model.ConcreteLine');
goog.require('myphysicslab.lab.model.PointMass');
goog.require('myphysicslab.lab.model.SimList');
goog.require('myphysicslab.lab.model.SimpleAdvance');
goog.require('myphysicslab.lab.model.Simulation');
goog.require('myphysicslab.lab.util.Clock');
goog.require('myphysicslab.lab.util.AbstractSubject');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.GenericObserver');
goog.require('myphysicslab.lab.util.Observer');
goog.require('myphysicslab.lab.util.Parameter');
goog.require('myphysicslab.lab.util.ParameterBoolean');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.ParameterString');
goog.require('myphysicslab.lab.util.EasyScriptParser');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.lab.view.DisplayArc');
goog.require('myphysicslab.lab.view.DisplayClock');
goog.require('myphysicslab.lab.view.DisplayLine');
goog.require('myphysicslab.lab.view.DisplayShape');
goog.require('myphysicslab.lab.view.DrawingMode');
goog.require('myphysicslab.lab.graph.EnergyBarGraph');
goog.require('myphysicslab.lab.view.SimView');
goog.require('myphysicslab.sims.layout.CommonControls');
goog.require('myphysicslab.sims.layout.CompareGraph');
goog.require('myphysicslab.sims.layout.CompareTimeGraph');
goog.require('myphysicslab.sims.layout.TabLayout');
goog.require('myphysicslab.sims.pendulum.PendulumSim');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var CheckBoxControl = lab.controls.CheckBoxControl;
var ChoiceControl = lab.controls.ChoiceControl;
var NumericControl = lab.controls.NumericControl;
var SliderControl = lab.controls.SliderControl;
var Arc = myphysicslab.lab.model.Arc;
var AutoScale = lab.graph.AutoScale;
var Clock = lab.util.Clock;
var CommonControls = sims.layout.CommonControls;
var CompareGraph = sims.layout.CompareGraph;
var CompareTimeGraph = sims.layout.CompareTimeGraph;
var AbstractSubject = lab.util.AbstractSubject;
var DisplayArc = myphysicslab.lab.view.DisplayArc;
var DisplayClock = lab.view.DisplayClock;
var DisplayGraph = lab.graph.DisplayGraph;
var DisplayLine = lab.view.DisplayLine;
var DisplayShape = lab.view.DisplayShape;
var DoubleRect = lab.util.DoubleRect;
var DrawingMode = lab.view.DrawingMode;
var EnergyBarGraph = lab.graph.EnergyBarGraph;
var EventHandler = lab.app.EventHandler;
var GenericObserver = lab.util.GenericObserver;
var GraphLine = lab.graph.GraphLine;
var ConcreteLine = lab.model.ConcreteLine;
var LabControl = lab.controls.LabControl;
var Parameter = lab.util.Parameter;
var ParameterBoolean = lab.util.ParameterBoolean;
var ParameterNumber = lab.util.ParameterNumber;
var ParameterString = lab.util.ParameterString;
var PendulumSim = sims.pendulum.PendulumSim;
var PointMass = lab.model.PointMass;
var EasyScriptParser = lab.util.EasyScriptParser;
var SimController = lab.app.SimController;
var SimList = lab.model.SimList;
var SimpleAdvance = lab.model.SimpleAdvance;
var SimRunner = lab.app.SimRunner;
var Simulation = lab.model.Simulation;
var SimView = lab.view.SimView;
var DisplayAxes = lab.graph.DisplayAxes;
var TabLayout = sims.layout.TabLayout;
var UtilityCore = lab.util.UtilityCore;
var Vector = lab.util.Vector;

/** Runs two chaotic pendulum simulations simultaneously with the same settings except
for a slight difference of initial conditions. This demonstrates the sensitivity of
chaotic systems to initial condtions.  The driven pendulum simulation used is
{@link myphysicslab.sims.pendulum.PendulumSim PendulumSim}.

Creates instance objects such as the simulation and display objects;
defines regular expressions for easy Terminal scripting of these objects using short
names instead of fully qualified property names.

The constructor takes an argument that specifies the names of the HTML elementId's to
look for in the HTML document; these elements are where the user interface of the
simulation is created. This allows for having two separate simulation apps running
concurrently on a single page.

No global variables are created other than two root global variables: the
`myphysicslab` global holds all of the myPhysicsLab classes; and a global variable is
created for this application instance. This application global is created outside of
this file in the HTML where the constructor is called. The name of that global variable
holding the application is passed to defineNames() method so that short-names in scripts
can be properly expanded.

* @param {!TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @constructor
* @final
* @struct
* @extends {AbstractSubject}
* @export
*/
myphysicslab.sims.pendulum.ComparePendulumApp = function(elem_ids) {
  UtilityCore.setErrorHandler();
  AbstractSubject.call(this, 'APP');
  /** @type {!TabLayout} */
  this.layout = new TabLayout(elem_ids);
  this.layout.simCanvas.setBackground('black');
  this.layout.simCanvas.setAlpha(CommonControls.SHORT_TRAILS);
  // keep reference to terminal to make for shorter 'expanded' names
  this.terminal = this.layout.terminal;
  var simCanvas = this.layout.simCanvas;

  /** difference between two start angles
  * @type {number}
  */
  this.angleDelta = 0.001;
  /** @type {!PendulumSim} */
  this.sim1 = new PendulumSim('SIM_1');
  var startAngle = Math.PI/4;
  var va1 = this.sim1.getVarsList();
  va1.setValue(0, startAngle);
  this.sim1.saveInitialState();
  /** @type {!lab.model.SimList} */
  this.simList = this.sim1.getSimList();
  // Ensure that changes to parameters or variables cause display to update
  new GenericObserver(this.sim1, goog.bind(function(evt) {
    this.sim1.modifyObjects();
  }, this), 'modifyObjects after parameter or variable change');
  /** @type {!PendulumSim} */
  this.sim2 = new PendulumSim('SIM_2');
  this.terminal.setAfterEval(goog.bind(function() {
      this.sim1.modifyObjects();
      this.sim2.modifyObjects();
    }, this));
  // Ensure that changes to parameters or variables cause display to update
  new GenericObserver(this.sim2, goog.bind(function(evt) {
    this.sim2.modifyObjects();
  }, this), 'modifyObjects after parameter or variable change');
  var va2 = this.sim2.getVarsList();
  va2.setValue(0, startAngle + this.angleDelta);
  this.sim2.saveInitialState();
  /** @type {!lab.model.SimList} */
  this.simList2 = this.sim2.getSimList();
  /** @type {!lab.app.SimController} */
  this.simCtrl = new SimController(simCanvas, /*eventHandler=*/this.sim1);
  this.advance1  = new SimpleAdvance(this.sim1);
  this.advance2 = new SimpleAdvance(this.sim2);
  /** @type {!lab.util.DoubleRect} */
  this.simRect = new DoubleRect(-2, -2.2, 2, 1.5);
  /** @type {!lab.view.SimView} */
  this.simView = new SimView('simView', this.simRect);
  this.displayList = this.simView.getDisplayList();
  simCanvas.addView(this.simView);
  /** @type {!lab.view.SimView} */
  this.statusView = new SimView('status', new DoubleRect(-10, -10, 10, 10));
  simCanvas.addView(this.statusView);
  /** @type {!lab.graph.DisplayAxes} */
  this.axes = CommonControls.makeAxes(this.simView);
  /** @type {!lab.app.SimRunner} */
  this.simRun = new SimRunner(this.advance1);
  this.simRun.addStrategy(this.advance2);
  this.simRun.addCanvas(simCanvas);
  /** @type {!lab.util.Clock} */
  this.clock = this.simRun.getClock();

  /** @type {!lab.view.DisplayLine} */
  var displayRod2 = new DisplayLine(this.simList2.getConcreteLine('rod'));
  this.displayList.add(displayRod2);
  this.bob2 = this.simList2.getPointMass('bob');
  var displayBob2 = new DisplayShape(this.bob2).setFillStyle('red');
  this.displayList.add(displayBob2);
  displayBob2.setDragable(false);

  this.bob1 = this.simList.getPointMass('bob');
  var displayBob = new DisplayShape(this.bob1).setFillStyle('blue');
  this.displayList.add(displayBob);
  var displayRod = new DisplayLine(this.simList.getConcreteLine('rod'));
  this.displayList.add(displayRod);
  var displayDrive = new DisplayArc(this.simList.getArc('drive'));
  this.displayList.add(displayDrive);

  /** @type {!myphysicslab.lab.util.ParameterBoolean} */
  var pb;
  /** @type {!myphysicslab.lab.util.ParameterNumber} */
  var pn;
  /** @type {!myphysicslab.lab.util.ParameterString} */
  var ps;

  this.addControl(CommonControls.makePlaybackControls(this.simRun));

  pn = new ParameterNumber(this, ComparePendulumApp.en.ANGLE_DELTA,
      ComparePendulumApp.i18n.ANGLE_DELTA,
      this.getAngleDelta, this.setAngleDelta).setDecimalPlaces(7);
  this.addParameter(pn);
  this.addControl(new NumericControl(pn));

  pn = this.sim1.getParameterNumber(PendulumSim.en.LENGTH);
  this.addControl(new SliderControl(pn, 0.1, 10.1, /*multiply=*/true));

  pn = this.sim1.getParameterNumber(PendulumSim.en.DAMPING);
  this.addControl(new SliderControl(pn, 0, 10, /*multiply=*/false));

  pn = this.sim1.getParameterNumber(PendulumSim.en.MASS);
  this.addControl(new SliderControl(pn, 0.2, 10.2, /*multiply=*/true));

  pn = this.sim1.getParameterNumber(PendulumSim.en.DRIVE_AMPLITUDE);
  this.addControl(new SliderControl(pn, 0, 10, /*multiply=*/false));

  pn = this.sim1.getParameterNumber(PendulumSim.en.DRIVE_FREQUENCY);
  this.addControl(new SliderControl(pn, 0, 10, /*multiply=*/false));

  pn = this.sim1.getParameterNumber(PendulumSim.en.GRAVITY);
  this.addControl(new SliderControl(pn, 0, 20, /*multiply=*/false));

  /** @type {!EnergyBarGraph} */
  this.energyGraph = new EnergyBarGraph(this.sim1);
  /** @type {!ParameterBoolean} */
  this.showEnergyParam = CommonControls.makeShowEnergyParam(this.energyGraph,
      this.statusView, this);
  this.addControl(new CheckBoxControl(this.showEnergyParam));

  /** @type {!lab.view.DisplayClock} */
  this.displayClock = new DisplayClock(goog.bind(this.sim1.getTime, this.sim1),
      goog.bind(this.clock.getRealTime, this.clock), /*period=*/2, /*radius=*/2);
  this.displayClock.setPosition(new Vector(8, 4));
  pb = CommonControls.makeShowClockParam(this.displayClock, this.statusView, this);
  this.addControl(new CheckBoxControl(pb));

  var panzoom_simview = CommonControls.makePanZoomControls(this.simView,
      /*overlay=*/true,
      goog.bind(function () { this.simView.setSimRect(this.simRect); }, this));
  this.layout.div_sim.appendChild(panzoom_simview);
  pb = CommonControls.makeShowPanZoomParam(panzoom_simview, this);
  pb.setValue(false);
  this.addControl(new CheckBoxControl(pb));

  pn = this.simRun.getParameterNumber(SimRunner.en.TIME_STEP);
  this.addControl(new NumericControl(pn));
  pn = this.simRun.getClock().getParameterNumber(Clock.en.TIME_RATE);
  this.addControl(new NumericControl(pn));
  var bm = CommonControls.makeBackgroundMenu(this.layout.simCanvas);
  this.addControl(bm);

  /** @type {!lab.graph.GraphLine} */
  var line1 = new GraphLine('GRAPH_LINE_1', va1);
  line1.setXVariable(0);
  line1.setYVariable(1);
  line1.setColor('blue');
  line1.setDrawingMode(DrawingMode.DOTS);

  /** @type {!lab.graph.GraphLine} */
  var line2 = new GraphLine('GRAPH_LINE_2', va2);
  line2.setXVariable(0);
  line2.setYVariable(1);
  line2.setColor('red');
  line2.setDrawingMode(DrawingMode.DOTS);

  // keep line2's X and Y variable in sync with line1
  var paramY = line1.getParameterNumber(GraphLine.en.Y_VARIABLE);
  var paramX = line1.getParameterNumber(GraphLine.en.X_VARIABLE);
  var py2 = line2.getParameterNumber(GraphLine.en.Y_VARIABLE);
  var px2 = line2.getParameterNumber(GraphLine.en.X_VARIABLE);
  new GenericObserver(line1, function(evt) {
    if (evt == paramY) {
      py2.setValue(paramY.getValue());
    } else if (evt == paramX) {
      px2.setValue(paramX.getValue());
    }
  }, 'keep line2\'s X and Y variable in sync with line1');

  /** @type {!sims.layout.CompareGraph} */
  this.graph = new CompareGraph(line1, line2,
      this.layout.graphCanvas,
      this.layout.graph_controls, this.layout.div_graph, this.simRun);

  var timeLine1 = new GraphLine('TIME_LINE_1', va1);
  timeLine1.setYVariable(0);
  timeLine1.setColor('blue');
  timeLine1.setDrawingMode(DrawingMode.DOTS);
  var timeLine2 = new GraphLine('TIME_LINE_2', va2);
  timeLine2.setYVariable(0);
  timeLine2.setColor('red');
  timeLine2.setDrawingMode(DrawingMode.DOTS);
  // keep timeLine2's Y variable in sync with timeLine1
  var timeParamY = timeLine1.getParameterNumber(GraphLine.en.Y_VARIABLE);
  var time_py2 = timeLine2.getParameterNumber(GraphLine.en.Y_VARIABLE);
  new GenericObserver(timeLine1, function(evt) {
    if (evt == timeParamY) {
      time_py2.setValue(timeParamY.getValue());
    }
  }, 'keep timeLine2\'s Y variable in sync with timeLine1');
  /** @type {!sims.layout.CompareTimeGraph} */
  this.timeGraph = new CompareTimeGraph(timeLine1, timeLine2,
      this.layout.timeGraphCanvas,
      this.layout.time_graph_controls, this.layout.div_time_graph, this.simRun);

  new GenericObserver(this.sim1, goog.bind(function(evt) {
    if (evt instanceof ParameterNumber) {
      // match the parameters on sim2 to those of sim
      var pn = this.sim2.getParameterNumber(evt.getName());
      pn.setValue(evt.getValue());
    } else if (evt.nameEquals(EventHandler.START_DRAG)) {
      // prevent sim2 from calculating ODE while dragging
      this.sim2.setIsDragging(true);
    } else if (evt.nameEquals(EventHandler.MOUSE_DRAG)) {
      // set sim2 to match position of sim1 (plus angleDelta)
      va2.setValue(0, va1.getValue(0) + this.angleDelta);
      va2.setValue(1, va1.getValue(1));
      // modify sim2 objects in case we are currently paused
      this.sim2.modifyObjects();
    } else if (evt.nameEquals(EventHandler.FINISH_DRAG)) {
      // restore calculation of ODE in sim2
      this.sim2.setIsDragging(false);
      // save initial state with time=0
      va2.setTime(0);
      this.sim2.saveInitialState();
      va1.setTime(0);
      this.sim1.saveInitialState();
      // restart from initial state
      this.simRun.reset();
    } else if (evt.nameEquals(Simulation.RESET)) {
      this.sim2.reset();
    }
  }, this), 'sim2 follows sim1 when mouse dragging');

  var subjects = [
    this,
    this.sim1,
    this.sim2,
    this.simRun,
    this.clock,
    this.simView,
    this.statusView,
    this.sim1.getVarsList(),
    this.sim2.getVarsList()
  ];
  subjects = goog.array.concat(subjects, this.layout.getSubjects(),
      this.graph.getSubjects(), this.timeGraph.getSubjects());
  this.easyScript = CommonControls.makeEasyScript(subjects, [], this.simRun);
  this.terminal.setParser(this.easyScript);
  this.addControl(CommonControls.makeURLScriptButton(this.easyScript, this.simRun));
  this.graph.addControl(
    CommonControls.makeURLScriptButton(this.easyScript, this.simRun));
  this.timeGraph.addControl(
    CommonControls.makeURLScriptButton(this.easyScript, this.simRun));
};
var ComparePendulumApp = myphysicslab.sims.pendulum.ComparePendulumApp;
goog.inherits(ComparePendulumApp, AbstractSubject);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  ComparePendulumApp.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        +', sim1: '+this.sim1.toStringShort()
        +', sim2: '+this.sim2.toStringShort()
        +', terminal: '+this.terminal
        +', graph: '+this.graph
        +', timeGraph: '+this.timeGraph
        + ComparePendulumApp.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
ComparePendulumApp.prototype.getClassName = function() {
  return 'ComparePendulumApp';
};

/** Define short-cut name replacement rules.  For example 'sim' is replaced
* by 'app.sim' when `myName` is 'app'.
* @param {string} myName  the name of this object, valid in global Javascript context.
* @export
*/
ComparePendulumApp.prototype.defineNames = function(myName) {
  if (UtilityCore.ADVANCED)
    return;
  this.terminal.addWhiteList(myName);
  this.terminal.addRegex('advance1|advance2|axes|clock|displayClock|displayList'
      +'|energyGraph|graph|layout|sim1|sim2|simCtrl|simList|simList2'
      +'|simRect|simRun|simView|statusView|timeGraph|easyScript|terminal',
      myName);
  this.terminal.addRegex('simCanvas',
      myName+'.layout');
};

/** Add the control to the set of simulation controls.
* @param {!LabControl} control
* @return {!LabControl} the control that was passed in
*/
ComparePendulumApp.prototype.addControl = function(control) {
  return this.layout.addControl(control);
};

/**
* @return {undefined}
* @export
*/
ComparePendulumApp.prototype.setup = function() {
  this.clock.resume();
  this.terminal.parseURLorRecall();
  this.sim1.saveInitialState();
  this.sim1.modifyObjects();
};

/** Start the application running.
* @return {undefined}
* @export
*/
ComparePendulumApp.prototype.start = function() {
  this.simRun.startFiring();
  //console.log(UtilityCore.prettyPrint(this.toString()));
};

/**
* @param {string} script
* @return {*}
* @export
*/
ComparePendulumApp.prototype.eval = function(script) {
  try {
    return this.terminal.eval(script);
  } catch(ex) {
    alert(ex);
  }
};

/**
* @return {number}
*/
ComparePendulumApp.prototype.getAngleDelta = function() {
  return this.angleDelta;
};

/**
* @param {number} value
*/
ComparePendulumApp.prototype.setAngleDelta = function(value) {
  if (this.angleDelta != value) {
    this.angleDelta = value;
    this.simRun.reset();
    var startAngle = this.sim1.getVarsList().getValue(0);
    this.sim2.getVarsList().setValue(0, startAngle + this.angleDelta);
    this.sim2.saveInitialState();
    this.broadcastParameter(ComparePendulumApp.en.ANGLE_DELTA);
  }
};

/** Set of internationalized strings.
@typedef {{
  ANGLE_DELTA: string
  }}
*/
ComparePendulumApp.i18n_strings;

/**
@type {ComparePendulumApp.i18n_strings}
*/
ComparePendulumApp.en = {
  ANGLE_DELTA: 'angle difference'
};

/**
@private
@type {ComparePendulumApp.i18n_strings}
*/
ComparePendulumApp.de_strings = {
  ANGLE_DELTA: 'Winkeldifferenz'
};

/** Set of internationalized strings.
@type {ComparePendulumApp.i18n_strings}
*/
ComparePendulumApp.i18n = goog.LOCALE === 'de' ? ComparePendulumApp.de_strings :
    ComparePendulumApp.en;

}); // goog.scope
