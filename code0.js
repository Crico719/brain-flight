
// --- Hablemos Claro: auto-fit question panel text ---
(function() {
  var proto = gdjs.TextRuntimeObject && gdjs.TextRuntimeObject.prototype;
  if (!proto || proto.__hcFitPatched) return;
  var raw = proto.setText;
  proto.setText = function(t) {
    raw.call(this, t);
    var name = this.getName ? this.getName() : "";
    try {
      if (name === "QuestionText") {
        var maxW = this.getWidth();
        var maxH = this.getHeight();
        this.setTextAlignment("center");
        this.setVerticalTextAlignment("center");
        this.setWrapping(true);
        this.setWrappingWidth(maxW);
        var size = 22;
        for (var g = 0; g < 22; g++) {
          this.setCharacterSize(size);
          if ((this.getHeight() <= maxH && this.getWidth() <= maxW + 1) || size <= 12) break;
          size -= 1;
        }
      } else if (name === "QuestionFeedback") {
        this.setTextAlignment("center");
        this.setWrapping(true);
        this.setWrappingWidth(this.getWidth());
        this.setCharacterSize(18);
      } else if (name === "HUD_Vidas" || name === "HUD_Puntaje" || name === "HUD_XP" || name === "HUD_Preguntas") {
        this.setWrapping(false);
        this.setCharacterSize(22);
        this.setTextAlignment("left");
      }
    } catch (e) {}
  };
  proto.__hcFitPatched = true;
})();
// --- end auto-fit ---
// --- Brain Flight: Flappy controller (suave, sin Platformer) ---
var __flappyVY = 0;
var __flappyPrevJump = false;
var __flappyInit = false;
var __flappyLastLives = -1;
var __quizErrors = 0;
var __quizWrongAt = 0;
function __flappyJumpHeld(runtimeScene) {
  try {
    if (gdjs.evtTools.input.isKeyPressed(runtimeScene, "Space")) return true;
    if (gdjs.evtTools.input.isKeyPressed(runtimeScene, "w")) return true;
    if (gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left")) return true;
  } catch (e) {}
  return false;
}
function __quizWrong(runtimeScene) {
  try {
    var t = Date.now();
    if (t - __quizWrongAt < 400) return;
    __quizWrongAt = t;
    __quizErrors++;
    if (__quizErrors >= 2) {
      __quizErrors = 0;
      try { gdjs.evtTools.sound.playSound(runtimeScene, "Lose 2.aac", false, 90, 1); } catch (e) {}
      gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, gdjs.evtTools.runtimeScene.getSceneName(runtimeScene), false);
    } else {
      var qf = runtimeScene.getObjects("QuestionFeedback");
      for (var qi = 0; qi < qf.length; ++qi) {
        try { qf[qi].getBehavior("Text").setText("❌ No es correcta. ¡Te queda 1 intento!"); } catch (e2) {}
      }
    }
  } catch (e) {}
}
function __flappyStep(runtimeScene) {
  try {
    var vars = runtimeScene.getScene().getVariables();
    var gameActive = vars.getFromIndex(1).getAsBoolean();
    var questionActive = vars.getFromIndex(5).getAsBoolean();
    var victory = vars.getFromIndex(0).getAsBoolean();
    var lives = vars.getFromIndex(11).getAsNumber();
    if (vars.getFromIndex(4).getAsNumber() == 1) { __quizErrors = 0; }
    var objs = runtimeScene.getObjects("Player");
    if (!objs || objs.length === 0) { __flappyPrevJump = __flappyJumpHeld(runtimeScene); return; }
    var p = objs[0];
    if (gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene)) {
      __flappyVY = 0; __flappyPrevJump = false; __flappyInit = false; __flappyLastLives = lives; __quizErrors = 0;
    }
    if (!__flappyInit) {
      try { p.activateBehavior("PlatformerObject", false); } catch (e) {}
      try { p.setX(250); p.setY(300); } catch (e) {}
      __flappyVY = 0; __flappyInit = true; __flappyLastLives = lives;
      __flappyPrevJump = __flappyJumpHeld(runtimeScene);
      return;
    }
    try { p.activateBehavior("PlatformerObject", false); } catch (e) {}
    var timeScale = 1;
    try { timeScale = gdjs.evtTools.runtimeScene.getTimeScale(runtimeScene); } catch (e) {}
    var playing = (timeScale == 1) && gameActive && !questionActive && !victory && (lives > 0);
    var held = __flappyJumpHeld(runtimeScene);
    var justPressed = held && !__flappyPrevJump;
    __flappyPrevJump = held;
    if (__flappyLastLives !== lives) { __flappyVY = 0; __flappyLastLives = lives; }
    if (!playing) { return; }
    var dt = 0.016;
    try { dt = gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene) || 0.016; } catch (e) {}
    if (dt > 0.05) dt = 0.05;
    var GRAV = 2100, JUMP = -600, MAXFALL = 950, MAXRISE = -650;
    if (justPressed) {
      __flappyVY = JUMP;
      try { gdjs.evtTools.sound.playSound(runtimeScene, "Jump_Start_02.wav", false, 70, gdjs.randomFloatInRange(0.9, 1.1)); } catch (e) {}
    } else {
      __flappyVY += GRAV * dt;
    }
    if (__flappyVY > MAXFALL) __flappyVY = MAXFALL;
    if (__flappyVY < MAXRISE) __flappyVY = MAXRISE;
    var y = p.getY() + __flappyVY * dt;
    var TOP = 70, BOTTOM = 630;
    if (y < TOP) { y = TOP; if (__flappyVY < 0) __flappyVY = 0; }
    if (y > BOTTOM) { y = BOTTOM; if (__flappyVY > 0) __flappyVY = 0; }
    try { p.setY(y); } catch (e) {}
    try {
      var ang = __flappyVY / 40;
      if (ang < -25) ang = -25;
      if (ang > 35) ang = 35;
      p.setAngle(ang);
    } catch (e) {}
  } catch (e) {}
}
// --- end Flappy controller ---
gdjs.Game_32SceneCode = {};
gdjs.Game_32SceneCode.localVariables = [];
gdjs.Game_32SceneCode.idToCallbackMap = new Map();
gdjs.Game_32SceneCode.GDBtnAObjects1_1final = [];

gdjs.Game_32SceneCode.GDBtnBObjects1_1final = [];

gdjs.Game_32SceneCode.GDBtnCObjects1_1final = [];

gdjs.Game_32SceneCode.GDBtnDObjects1_1final = [];

gdjs.Game_32SceneCode.GDPlayerObjects1= [];
gdjs.Game_32SceneCode.GDPlayerObjects2= [];
gdjs.Game_32SceneCode.GDPlayerObjects3= [];
gdjs.Game_32SceneCode.GDBackgroundObjects1= [];
gdjs.Game_32SceneCode.GDBackgroundObjects2= [];
gdjs.Game_32SceneCode.GDBackgroundObjects3= [];
gdjs.Game_32SceneCode.GDBoundaryObjects1= [];
gdjs.Game_32SceneCode.GDBoundaryObjects2= [];
gdjs.Game_32SceneCode.GDBoundaryObjects3= [];
gdjs.Game_32SceneCode.GDSpikeObstacleObjects1= [];
gdjs.Game_32SceneCode.GDSpikeObstacleObjects2= [];
gdjs.Game_32SceneCode.GDSpikeObstacleObjects3= [];
gdjs.Game_32SceneCode.GDHazardSpawnerObjects1= [];
gdjs.Game_32SceneCode.GDHazardSpawnerObjects2= [];
gdjs.Game_32SceneCode.GDHazardSpawnerObjects3= [];
gdjs.Game_32SceneCode.GDHUD_9595VidasObjects1= [];
gdjs.Game_32SceneCode.GDHUD_9595VidasObjects2= [];
gdjs.Game_32SceneCode.GDHUD_9595VidasObjects3= [];
gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects1= [];
gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects2= [];
gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects3= [];
gdjs.Game_32SceneCode.GDHUD_9595XPObjects1= [];
gdjs.Game_32SceneCode.GDHUD_9595XPObjects2= [];
gdjs.Game_32SceneCode.GDHUD_9595XPObjects3= [];
gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects1= [];
gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects2= [];
gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects3= [];
gdjs.Game_32SceneCode.GDQuestionPanelObjects1= [];
gdjs.Game_32SceneCode.GDQuestionPanelObjects2= [];
gdjs.Game_32SceneCode.GDQuestionPanelObjects3= [];
gdjs.Game_32SceneCode.GDQuestionTextObjects1= [];
gdjs.Game_32SceneCode.GDQuestionTextObjects2= [];
gdjs.Game_32SceneCode.GDQuestionTextObjects3= [];
gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1= [];
gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2= [];
gdjs.Game_32SceneCode.GDQuestionFeedbackObjects3= [];
gdjs.Game_32SceneCode.GDBtnAObjects1= [];
gdjs.Game_32SceneCode.GDBtnAObjects2= [];
gdjs.Game_32SceneCode.GDBtnAObjects3= [];
gdjs.Game_32SceneCode.GDBtnBObjects1= [];
gdjs.Game_32SceneCode.GDBtnBObjects2= [];
gdjs.Game_32SceneCode.GDBtnBObjects3= [];
gdjs.Game_32SceneCode.GDBtnCObjects1= [];
gdjs.Game_32SceneCode.GDBtnCObjects2= [];
gdjs.Game_32SceneCode.GDBtnCObjects3= [];
gdjs.Game_32SceneCode.GDBtnDObjects1= [];
gdjs.Game_32SceneCode.GDBtnDObjects2= [];
gdjs.Game_32SceneCode.GDBtnDObjects3= [];
gdjs.Game_32SceneCode.GDGO_9595PanelObjects1= [];
gdjs.Game_32SceneCode.GDGO_9595PanelObjects2= [];
gdjs.Game_32SceneCode.GDGO_9595PanelObjects3= [];
gdjs.Game_32SceneCode.GDGO_9595TitleObjects1= [];
gdjs.Game_32SceneCode.GDGO_9595TitleObjects2= [];
gdjs.Game_32SceneCode.GDGO_9595TitleObjects3= [];
gdjs.Game_32SceneCode.GDGO_9595StatsObjects1= [];
gdjs.Game_32SceneCode.GDGO_9595StatsObjects2= [];
gdjs.Game_32SceneCode.GDGO_9595StatsObjects3= [];
gdjs.Game_32SceneCode.GDBtnRetryObjects1= [];
gdjs.Game_32SceneCode.GDBtnRetryObjects2= [];
gdjs.Game_32SceneCode.GDBtnRetryObjects3= [];
gdjs.Game_32SceneCode.GDV_9595PanelObjects1= [];
gdjs.Game_32SceneCode.GDV_9595PanelObjects2= [];
gdjs.Game_32SceneCode.GDV_9595PanelObjects3= [];
gdjs.Game_32SceneCode.GDV_9595TitleObjects1= [];
gdjs.Game_32SceneCode.GDV_9595TitleObjects2= [];
gdjs.Game_32SceneCode.GDV_9595TitleObjects3= [];
gdjs.Game_32SceneCode.GDV_9595StatsObjects1= [];
gdjs.Game_32SceneCode.GDV_9595StatsObjects2= [];
gdjs.Game_32SceneCode.GDV_9595StatsObjects3= [];
gdjs.Game_32SceneCode.GDBtnAgainObjects1= [];
gdjs.Game_32SceneCode.GDBtnAgainObjects2= [];
gdjs.Game_32SceneCode.GDBtnAgainObjects3= [];
gdjs.Game_32SceneCode.GDConfettiObjects1= [];
gdjs.Game_32SceneCode.GDConfettiObjects2= [];
gdjs.Game_32SceneCode.GDConfettiObjects3= [];


gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDPlayerObjects1Objects = Hashtable.newFrom({"Player": gdjs.Game_32SceneCode.GDPlayerObjects1});
gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDBoundaryObjects1ObjectsGDgdjs_9546Game_959532SceneCode_9546GDSpikeObstacleObjects1Objects = Hashtable.newFrom({"Boundary": gdjs.Game_32SceneCode.GDBoundaryObjects1, "SpikeObstacle": gdjs.Game_32SceneCode.GDSpikeObstacleObjects1});
gdjs.Game_32SceneCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(11).getAsNumber() <= 0);
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("BtnRetry"), gdjs.Game_32SceneCode.GDBtnRetryObjects1);
gdjs.copyArray(runtimeScene.getObjects("GO_Panel"), gdjs.Game_32SceneCode.GDGO_9595PanelObjects1);
gdjs.copyArray(runtimeScene.getObjects("GO_Stats"), gdjs.Game_32SceneCode.GDGO_9595StatsObjects1);
gdjs.copyArray(runtimeScene.getObjects("GO_Title"), gdjs.Game_32SceneCode.GDGO_9595TitleObjects1);
/* Reuse gdjs.Game_32SceneCode.GDPlayerObjects1 */
{runtimeScene.getScene().getVariables().getFromIndex(1).setBoolean(false);
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDPlayerObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDPlayerObjects1[i].activateBehavior("PlatformerObject", false);
}
}
{gdjs.evtTools.sound.playSound(runtimeScene, "Lose 2.aac", false, 90, 1);
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDGO_9595StatsObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDGO_9595StatsObjects1[i].getBehavior("Text").setText("Puntaje: " + gdjs.evtTools.common.toString(runtimeScene.getScene().getVariables().getFromIndex(12).getAsNumber()) + gdjs.evtTools.string.newLine() + "XP: " + gdjs.evtTools.common.toString(runtimeScene.getScene().getVariables().getFromIndex(10).getAsNumber()) + gdjs.evtTools.string.newLine() + "Preguntas: " + gdjs.evtTools.common.toString(runtimeScene.getScene().getVariables().getFromIndex(7).getAsNumber()) + "/20");
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDGO_9595PanelObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDGO_9595PanelObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDGO_9595TitleObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDGO_9595TitleObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDGO_9595StatsObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDGO_9595StatsObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnRetryObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnRetryObjects1[i].hide(false);
}
}
}

}


};gdjs.Game_32SceneCode.eventsList1 = function(runtimeScene) {

{

gdjs.copyArray(gdjs.Game_32SceneCode.GDSpikeObstacleObjects1, gdjs.Game_32SceneCode.GDSpikeObstacleObjects2);


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDSpikeObstacleObjects2.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDSpikeObstacleObjects2[i].getY() > 0 ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDSpikeObstacleObjects2[k] = gdjs.Game_32SceneCode.GDSpikeObstacleObjects2[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDSpikeObstacleObjects2.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.Game_32SceneCode.GDSpikeObstacleObjects2 */
{for(var i = 0, len = gdjs.Game_32SceneCode.GDSpikeObstacleObjects2.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDSpikeObstacleObjects2[i].setY(runtimeScene.getScene().getVariables().getFromIndex(8).getAsNumber());
}
}
}

}


{

/* Reuse gdjs.Game_32SceneCode.GDSpikeObstacleObjects1 */

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDSpikeObstacleObjects1.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[i].getY() < 0 ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[k] = gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDSpikeObstacleObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.Game_32SceneCode.GDSpikeObstacleObjects1 */
{for(var i = 0, len = gdjs.Game_32SceneCode.GDSpikeObstacleObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[i].setY(runtimeScene.getScene().getVariables().getFromIndex(8).getAsNumber() - 640);
}
}
}

}


};gdjs.Game_32SceneCode.eventsList2 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Correct").getAsString() == "A");
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2);
{runtimeScene.getScene().getVariables().getFromIndex(10).add(10);
}
{runtimeScene.getScene().getVariables().getFromIndex(7).add(1);
}
{runtimeScene.getScene().getVariables().getFromIndex(4).setNumber(1);
}
{gdjs.evtTools.runtimeScene.resetTimer(runtimeScene, "QuestionTimer");
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2[i].getBehavior("Text").setText("¡Correcto! +10 XP. " + runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Expl").getAsString());
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !(runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Correct").getAsString() == "A");
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1);
{__quizWrong(runtimeScene);
}
}

}


};gdjs.Game_32SceneCode.eventsList3 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Correct").getAsString() == "B");
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2);
{runtimeScene.getScene().getVariables().getFromIndex(10).add(10);
}
{runtimeScene.getScene().getVariables().getFromIndex(7).add(1);
}
{runtimeScene.getScene().getVariables().getFromIndex(4).setNumber(1);
}
{gdjs.evtTools.runtimeScene.resetTimer(runtimeScene, "QuestionTimer");
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2[i].getBehavior("Text").setText("¡Correcto! +10 XP. " + runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Expl").getAsString());
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !(runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Correct").getAsString() == "B");
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1);
{__quizWrong(runtimeScene);
}
}

}


};gdjs.Game_32SceneCode.eventsList4 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Correct").getAsString() == "C");
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2);
{runtimeScene.getScene().getVariables().getFromIndex(10).add(10);
}
{runtimeScene.getScene().getVariables().getFromIndex(7).add(1);
}
{runtimeScene.getScene().getVariables().getFromIndex(4).setNumber(1);
}
{gdjs.evtTools.runtimeScene.resetTimer(runtimeScene, "QuestionTimer");
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2[i].getBehavior("Text").setText("¡Correcto! +10 XP. " + runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Expl").getAsString());
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !(runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Correct").getAsString() == "C");
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1);
{__quizWrong(runtimeScene);
}
}

}


};gdjs.Game_32SceneCode.eventsList5 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Correct").getAsString() == "D");
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2);
{runtimeScene.getScene().getVariables().getFromIndex(10).add(10);
}
{runtimeScene.getScene().getVariables().getFromIndex(7).add(1);
}
{runtimeScene.getScene().getVariables().getFromIndex(4).setNumber(1);
}
{gdjs.evtTools.runtimeScene.resetTimer(runtimeScene, "QuestionTimer");
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2[i].getBehavior("Text").setText("¡Correcto! +10 XP. " + runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Expl").getAsString());
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !(runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Correct").getAsString() == "D");
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1);
{__quizWrong(runtimeScene);
}
}

}


};gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDConfettiObjects1Objects = Hashtable.newFrom({"Confetti": gdjs.Game_32SceneCode.GDConfettiObjects1});
gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDConfettiObjects1Objects = Hashtable.newFrom({"Confetti": gdjs.Game_32SceneCode.GDConfettiObjects1});
gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDConfettiObjects1Objects = Hashtable.newFrom({"Confetti": gdjs.Game_32SceneCode.GDConfettiObjects1});
gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDConfettiObjects1Objects = Hashtable.newFrom({"Confetti": gdjs.Game_32SceneCode.GDConfettiObjects1});
gdjs.Game_32SceneCode.eventsList6 = function(runtimeScene) {
__flappyStep(runtimeScene);

{

gdjs.copyArray(runtimeScene.getObjects("Player"), gdjs.Game_32SceneCode.GDPlayerObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDPlayerObjects1.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDPlayerObjects1[i].getBehavior("PlatformerObject").isFalling() ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDPlayerObjects1[k] = gdjs.Game_32SceneCode.GDPlayerObjects1[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDPlayerObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.Game_32SceneCode.GDPlayerObjects1 */
{for(var i = 0, len = gdjs.Game_32SceneCode.GDPlayerObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDPlayerObjects1[i].getBehavior("PlatformerObject").setCanJump();
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{let isConditionTrue_1 = false;
isConditionTrue_0 = false;
{
isConditionTrue_1 = gdjs.evtTools.input.isKeyPressed(runtimeScene, "Space");
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
}
}
{
isConditionTrue_1 = gdjs.evtTools.input.isKeyPressed(runtimeScene, "w");
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
}
}
{
isConditionTrue_1 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
}
}
{
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("Player"), gdjs.Game_32SceneCode.GDPlayerObjects1);
{for(var i = 0, len = gdjs.Game_32SceneCode.GDPlayerObjects1.length ;i < len;++i) {
    try { gdjs.Game_32SceneCode.GDPlayerObjects1[i].getBehavior("PlatformerObject").simulateControl("Jump"); } catch (e) {}
}
}
/* Flappy: el sonido del salto lo reproduce __flappyStep una sola vez por salto */
}

}

{

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.getTimeScale(runtimeScene) == 1;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = !runtimeScene.getScene().getVariables().getFromIndex(5).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(1).getAsBoolean();
}
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("Background"), gdjs.Game_32SceneCode.GDBackgroundObjects1);
gdjs.copyArray(runtimeScene.getObjects("Boundary"), gdjs.Game_32SceneCode.GDBoundaryObjects1);
gdjs.copyArray(runtimeScene.getObjects("SpikeObstacle"), gdjs.Game_32SceneCode.GDSpikeObstacleObjects1);
{runtimeScene.getScene().getVariables().getFromIndex(9).setNumber(Math.min(300 + runtimeScene.getScene().getVariables().getFromIndex(12).getAsNumber() * 12, 780));
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDSpikeObstacleObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[i].setX(gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[i].getX() - (runtimeScene.getScene().getVariables().getFromIndex(9).getAsNumber() * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBackgroundObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBackgroundObjects1[i].setXOffset(gdjs.Game_32SceneCode.GDBackgroundObjects1[i].getXOffset() + (runtimeScene.getScene().getVariables().getFromIndex(9).getAsNumber() * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene) / 3));
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBoundaryObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBoundaryObjects1[i].setXOffset(gdjs.Game_32SceneCode.GDBoundaryObjects1[i].getXOffset() + (runtimeScene.getScene().getVariables().getFromIndex(9).getAsNumber() * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene) / 2));
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.resetTimer(runtimeScene, "HitCooldown");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("Boundary"), gdjs.Game_32SceneCode.GDBoundaryObjects1);
gdjs.copyArray(runtimeScene.getObjects("Player"), gdjs.Game_32SceneCode.GDPlayerObjects1);
gdjs.copyArray(runtimeScene.getObjects("SpikeObstacle"), gdjs.Game_32SceneCode.GDSpikeObstacleObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDPlayerObjects1Objects, gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDBoundaryObjects1ObjectsGDgdjs_9546Game_959532SceneCode_9546GDSpikeObstacleObjects1Objects, false, runtimeScene, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.getTimerElapsedTimeInSecondsOrNaN(runtimeScene, "HitCooldown") > 1;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = !runtimeScene.getScene().getVariables().getFromIndex(5).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(1).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(10004812);
}
}
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.Game_32SceneCode.GDPlayerObjects1 */
{runtimeScene.getScene().getVariables().getFromIndex(11).sub(1);
}
{gdjs.evtTools.sound.playSound(runtimeScene, "assets/Collision.wav", false, 90, gdjs.randomFloatInRange(0.7, 0.9));
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDPlayerObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDPlayerObjects1[i].getBehavior("ShakeObject_PositionAngle").ShakeObject_PositionAngle(2, gdjs.randomWithStep(-5, 5, 10), gdjs.randomWithStep(-5, 5, 10), gdjs.randomWithStep(-5, 5, 10), 0.025, false, null);
}
}
{gdjs.evtTools.runtimeScene.resetTimer(runtimeScene, "HitCooldown");
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDPlayerObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDPlayerObjects1[i].setPosition(250,300);
}
}

{ //Subevents
gdjs.Game_32SceneCode.eventsList0(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("SpikeObstacle"), gdjs.Game_32SceneCode.GDSpikeObstacleObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDSpikeObstacleObjects1.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[i].getAABBRight() < 0 ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[k] = gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDSpikeObstacleObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("HazardSpawner"), gdjs.Game_32SceneCode.GDHazardSpawnerObjects1);
/* Reuse gdjs.Game_32SceneCode.GDSpikeObstacleObjects1 */
{runtimeScene.getScene().getVariables().getFromIndex(12).add(1);
}
{runtimeScene.getScene().getVariables().getFromIndex(8).setNumber(gdjs.randomInRange(320, 540));
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDSpikeObstacleObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDSpikeObstacleObjects1[i].setX((( gdjs.Game_32SceneCode.GDHazardSpawnerObjects1.length === 0 ) ? 0 :gdjs.Game_32SceneCode.GDHazardSpawnerObjects1[0].getPointX("")));
}
}

{ //Subevents
gdjs.Game_32SceneCode.eventsList1(runtimeScene);} //End of subevents
}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("HUD_Preguntas"), gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects1);
gdjs.copyArray(runtimeScene.getObjects("HUD_Puntaje"), gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects1);
gdjs.copyArray(runtimeScene.getObjects("HUD_Vidas"), gdjs.Game_32SceneCode.GDHUD_9595VidasObjects1);
gdjs.copyArray(runtimeScene.getObjects("HUD_XP"), gdjs.Game_32SceneCode.GDHUD_9595XPObjects1);
{for(var i = 0, len = gdjs.Game_32SceneCode.GDHUD_9595VidasObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDHUD_9595VidasObjects1[i].getBehavior("Text").setText("Vidas: " + gdjs.evtTools.common.toString(runtimeScene.getScene().getVariables().getFromIndex(11).getAsNumber()));
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects1[i].getBehavior("Text").setText("Puntaje: " + gdjs.evtTools.common.toString(runtimeScene.getScene().getVariables().getFromIndex(12).getAsNumber()));
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDHUD_9595XPObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDHUD_9595XPObjects1[i].getBehavior("Text").setText("XP: " + gdjs.evtTools.common.toString(runtimeScene.getScene().getVariables().getFromIndex(10).getAsNumber()));
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects1[i].getBehavior("Text").setText("Preguntas: " + gdjs.evtTools.common.toString(runtimeScene.getScene().getVariables().getFromIndex(7).getAsNumber()) + "/20");
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(12).getAsNumber() >= runtimeScene.getScene().getVariables().getFromIndex(2).getAsNumber());
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(7).getAsNumber() < 20);
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(1).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = !runtimeScene.getScene().getVariables().getFromIndex(5).getAsBoolean();
}
}
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("BtnA"), gdjs.Game_32SceneCode.GDBtnAObjects1);
gdjs.copyArray(runtimeScene.getObjects("BtnB"), gdjs.Game_32SceneCode.GDBtnBObjects1);
gdjs.copyArray(runtimeScene.getObjects("BtnC"), gdjs.Game_32SceneCode.GDBtnCObjects1);
gdjs.copyArray(runtimeScene.getObjects("BtnD"), gdjs.Game_32SceneCode.GDBtnDObjects1);
gdjs.copyArray(runtimeScene.getObjects("Player"), gdjs.Game_32SceneCode.GDPlayerObjects1);
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1);
gdjs.copyArray(runtimeScene.getObjects("QuestionPanel"), gdjs.Game_32SceneCode.GDQuestionPanelObjects1);
gdjs.copyArray(runtimeScene.getObjects("QuestionText"), gdjs.Game_32SceneCode.GDQuestionTextObjects1);
{runtimeScene.getScene().getVariables().getFromIndex(5).setBoolean(true);
}
{runtimeScene.getScene().getVariables().getFromIndex(3).setNumber(runtimeScene.getScene().getVariables().getFromIndex(7).getAsNumber());
}
{runtimeScene.getScene().getVariables().getFromIndex(4).setNumber(0);
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDPlayerObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDPlayerObjects1[i].activateBehavior("PlatformerObject", false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionTextObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionTextObjects1[i].getBehavior("Text").setText(runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("Q").getAsString());
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnAObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnAObjects1[i].SetLabelTextOp("A) " + runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("A").getAsString(), null);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnBObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnBObjects1[i].SetLabelTextOp("B) " + runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("B").getAsString(), null);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnCObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnCObjects1[i].SetLabelTextOp("C) " + runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("C").getAsString(), null);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnDObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnDObjects1[i].SetLabelTextOp("D) " + runtimeScene.getScene().getVariables().getFromIndex(6).getChild(runtimeScene.getScene().getVariables().getFromIndex(3).getAsNumber()).getChild("D").getAsString(), null);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1[i].getBehavior("Text").setText("");
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionPanelObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionPanelObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionTextObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionTextObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnAObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnAObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnBObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnBObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnCObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnCObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnDObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnDObjects1[i].hide(false);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BtnA"), gdjs.Game_32SceneCode.GDBtnAObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnAObjects1.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnAObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDBtnAObjects1[k] = gdjs.Game_32SceneCode.GDBtnAObjects1[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnAObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(5).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(4).getAsNumber() == 0);
}
}
}
if (isConditionTrue_0) {

{ //Subevents
gdjs.Game_32SceneCode.eventsList2(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BtnB"), gdjs.Game_32SceneCode.GDBtnBObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnBObjects1.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnBObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDBtnBObjects1[k] = gdjs.Game_32SceneCode.GDBtnBObjects1[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnBObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(5).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(4).getAsNumber() == 0);
}
}
}
if (isConditionTrue_0) {

{ //Subevents
gdjs.Game_32SceneCode.eventsList3(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BtnC"), gdjs.Game_32SceneCode.GDBtnCObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnCObjects1.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnCObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDBtnCObjects1[k] = gdjs.Game_32SceneCode.GDBtnCObjects1[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnCObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(5).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(4).getAsNumber() == 0);
}
}
}
if (isConditionTrue_0) {

{ //Subevents
gdjs.Game_32SceneCode.eventsList4(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BtnD"), gdjs.Game_32SceneCode.GDBtnDObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnDObjects1.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnDObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDBtnDObjects1[k] = gdjs.Game_32SceneCode.GDBtnDObjects1[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnDObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(5).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(4).getAsNumber() == 0);
}
}
}
if (isConditionTrue_0) {

{ //Subevents
gdjs.Game_32SceneCode.eventsList5(runtimeScene);} //End of subevents
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(4).getAsNumber() == 1);
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.getTimerElapsedTimeInSecondsOrNaN(runtimeScene, "QuestionTimer") > 3;
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("BtnA"), gdjs.Game_32SceneCode.GDBtnAObjects1);
gdjs.copyArray(runtimeScene.getObjects("BtnB"), gdjs.Game_32SceneCode.GDBtnBObjects1);
gdjs.copyArray(runtimeScene.getObjects("BtnC"), gdjs.Game_32SceneCode.GDBtnCObjects1);
gdjs.copyArray(runtimeScene.getObjects("BtnD"), gdjs.Game_32SceneCode.GDBtnDObjects1);
gdjs.copyArray(runtimeScene.getObjects("Player"), gdjs.Game_32SceneCode.GDPlayerObjects1);
gdjs.copyArray(runtimeScene.getObjects("QuestionFeedback"), gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1);
gdjs.copyArray(runtimeScene.getObjects("QuestionPanel"), gdjs.Game_32SceneCode.GDQuestionPanelObjects1);
gdjs.copyArray(runtimeScene.getObjects("QuestionText"), gdjs.Game_32SceneCode.GDQuestionTextObjects1);
{runtimeScene.getScene().getVariables().getFromIndex(4).setNumber(0);
}
{runtimeScene.getScene().getVariables().getFromIndex(5).setBoolean(false);
}
{runtimeScene.getScene().getVariables().getFromIndex(2).setNumber(runtimeScene.getScene().getVariables().getFromIndex(12).getAsNumber() + 5);
}
{/* Flappy: Platformer se mantiene desactivado; la fisica la lleva __flappyStep */
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionPanelObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionPanelObjects1[i].hide();
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionTextObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionTextObjects1[i].hide();
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1[i].hide();
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnAObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnAObjects1[i].hide();
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnBObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnBObjects1[i].hide();
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnCObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnCObjects1[i].hide();
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnDObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnDObjects1[i].hide();
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(7).getAsNumber() >= 20);
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = !runtimeScene.getScene().getVariables().getFromIndex(0).getAsBoolean();
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("BtnAgain"), gdjs.Game_32SceneCode.GDBtnAgainObjects1);
gdjs.copyArray(runtimeScene.getObjects("Player"), gdjs.Game_32SceneCode.GDPlayerObjects1);
gdjs.copyArray(runtimeScene.getObjects("V_Panel"), gdjs.Game_32SceneCode.GDV_9595PanelObjects1);
gdjs.copyArray(runtimeScene.getObjects("V_Stats"), gdjs.Game_32SceneCode.GDV_9595StatsObjects1);
gdjs.copyArray(runtimeScene.getObjects("V_Title"), gdjs.Game_32SceneCode.GDV_9595TitleObjects1);
gdjs.Game_32SceneCode.GDConfettiObjects1.length = 0;

{runtimeScene.getScene().getVariables().getFromIndex(0).setBoolean(true);
}
{runtimeScene.getScene().getVariables().getFromIndex(1).setBoolean(false);
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDPlayerObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDPlayerObjects1[i].activateBehavior("PlatformerObject", false);
}
}
{gdjs.evtTools.sound.playSound(runtimeScene, "Powerup 8.aac", false, 100, 1);
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDV_9595StatsObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDV_9595StatsObjects1[i].getBehavior("Text").setText("¡Respondiste las 20 preguntas!" + gdjs.evtTools.string.newLine() + "Puntaje: " + gdjs.evtTools.common.toString(runtimeScene.getScene().getVariables().getFromIndex(12).getAsNumber()) + "   XP: " + gdjs.evtTools.common.toString(runtimeScene.getScene().getVariables().getFromIndex(10).getAsNumber()));
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDV_9595PanelObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDV_9595PanelObjects1[i].getBehavior("Opacity").setOpacity(0);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDV_9595PanelObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDV_9595PanelObjects1[i].getBehavior("Tween").addObjectOpacityTween2("vin", 255, "easeOutQuad", 0.5, false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDV_9595PanelObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDV_9595PanelObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDV_9595TitleObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDV_9595TitleObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDV_9595StatsObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDV_9595StatsObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDBtnAgainObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDBtnAgainObjects1[i].hide(false);
}
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDConfettiObjects1Objects, 640, 200, "UI");
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDConfettiObjects1Objects, 340, 400, "UI");
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDConfettiObjects1Objects, 940, 400, "UI");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BtnRetry"), gdjs.Game_32SceneCode.GDBtnRetryObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnRetryObjects1.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnRetryObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDBtnRetryObjects1[k] = gdjs.Game_32SceneCode.GDBtnRetryObjects1[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnRetryObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(11).getAsNumber() <= 0);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, gdjs.evtTools.runtimeScene.getSceneName(runtimeScene), false);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BtnAgain"), gdjs.Game_32SceneCode.GDBtnAgainObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnAgainObjects1.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnAgainObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.Game_32SceneCode.GDBtnAgainObjects1[k] = gdjs.Game_32SceneCode.GDBtnAgainObjects1[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnAgainObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(0).getAsBoolean();
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, gdjs.evtTools.runtimeScene.getSceneName(runtimeScene), false);
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(5).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(10179524);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("QuestionPanel"), gdjs.Game_32SceneCode.GDQuestionPanelObjects1);
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionPanelObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionPanelObjects1[i].getBehavior("Opacity").setOpacity(0);
}
}
{for(var i = 0, len = gdjs.Game_32SceneCode.GDQuestionPanelObjects1.length ;i < len;++i) {
    gdjs.Game_32SceneCode.GDQuestionPanelObjects1[i].getBehavior("Tween").addObjectOpacityTween2("qopen", 255, "easeOutQuad", 0.3, false);
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(4).getAsNumber() == 1);
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(9807196);
}
}
if (isConditionTrue_0) {
gdjs.Game_32SceneCode.GDConfettiObjects1.length = 0;

{gdjs.evtTools.sound.playSound(runtimeScene, "Confirm_03.aac", false, 90, 1);
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.Game_32SceneCode.mapOfGDgdjs_9546Game_959532SceneCode_9546GDConfettiObjects1Objects, 640, 360, "UI");
}
}

}


{

gdjs.Game_32SceneCode.GDBtnAObjects1.length = 0;

gdjs.Game_32SceneCode.GDBtnBObjects1.length = 0;

gdjs.Game_32SceneCode.GDBtnCObjects1.length = 0;

gdjs.Game_32SceneCode.GDBtnDObjects1.length = 0;


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{gdjs.Game_32SceneCode.GDBtnAObjects1_1final.length = 0;
gdjs.Game_32SceneCode.GDBtnBObjects1_1final.length = 0;
gdjs.Game_32SceneCode.GDBtnCObjects1_1final.length = 0;
gdjs.Game_32SceneCode.GDBtnDObjects1_1final.length = 0;
let isConditionTrue_1 = false;
isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("BtnA"), gdjs.Game_32SceneCode.GDBtnAObjects2);
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnAObjects2.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnAObjects2[i].IsClicked(null) ) {
        isConditionTrue_1 = true;
        gdjs.Game_32SceneCode.GDBtnAObjects2[k] = gdjs.Game_32SceneCode.GDBtnAObjects2[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnAObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.Game_32SceneCode.GDBtnAObjects2.length; j < jLen ; ++j) {
        if ( gdjs.Game_32SceneCode.GDBtnAObjects1_1final.indexOf(gdjs.Game_32SceneCode.GDBtnAObjects2[j]) === -1 )
            gdjs.Game_32SceneCode.GDBtnAObjects1_1final.push(gdjs.Game_32SceneCode.GDBtnAObjects2[j]);
    }
}
}
{
gdjs.copyArray(runtimeScene.getObjects("BtnB"), gdjs.Game_32SceneCode.GDBtnBObjects2);
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnBObjects2.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnBObjects2[i].IsClicked(null) ) {
        isConditionTrue_1 = true;
        gdjs.Game_32SceneCode.GDBtnBObjects2[k] = gdjs.Game_32SceneCode.GDBtnBObjects2[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnBObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.Game_32SceneCode.GDBtnBObjects2.length; j < jLen ; ++j) {
        if ( gdjs.Game_32SceneCode.GDBtnBObjects1_1final.indexOf(gdjs.Game_32SceneCode.GDBtnBObjects2[j]) === -1 )
            gdjs.Game_32SceneCode.GDBtnBObjects1_1final.push(gdjs.Game_32SceneCode.GDBtnBObjects2[j]);
    }
}
}
{
gdjs.copyArray(runtimeScene.getObjects("BtnC"), gdjs.Game_32SceneCode.GDBtnCObjects2);
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnCObjects2.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnCObjects2[i].IsClicked(null) ) {
        isConditionTrue_1 = true;
        gdjs.Game_32SceneCode.GDBtnCObjects2[k] = gdjs.Game_32SceneCode.GDBtnCObjects2[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnCObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.Game_32SceneCode.GDBtnCObjects2.length; j < jLen ; ++j) {
        if ( gdjs.Game_32SceneCode.GDBtnCObjects1_1final.indexOf(gdjs.Game_32SceneCode.GDBtnCObjects2[j]) === -1 )
            gdjs.Game_32SceneCode.GDBtnCObjects1_1final.push(gdjs.Game_32SceneCode.GDBtnCObjects2[j]);
    }
}
}
{
gdjs.copyArray(runtimeScene.getObjects("BtnD"), gdjs.Game_32SceneCode.GDBtnDObjects2);
for (var i = 0, k = 0, l = gdjs.Game_32SceneCode.GDBtnDObjects2.length;i<l;++i) {
    if ( gdjs.Game_32SceneCode.GDBtnDObjects2[i].IsClicked(null) ) {
        isConditionTrue_1 = true;
        gdjs.Game_32SceneCode.GDBtnDObjects2[k] = gdjs.Game_32SceneCode.GDBtnDObjects2[i];
        ++k;
    }
}
gdjs.Game_32SceneCode.GDBtnDObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.Game_32SceneCode.GDBtnDObjects2.length; j < jLen ; ++j) {
        if ( gdjs.Game_32SceneCode.GDBtnDObjects1_1final.indexOf(gdjs.Game_32SceneCode.GDBtnDObjects2[j]) === -1 )
            gdjs.Game_32SceneCode.GDBtnDObjects1_1final.push(gdjs.Game_32SceneCode.GDBtnDObjects2[j]);
    }
}
}
{
gdjs.copyArray(gdjs.Game_32SceneCode.GDBtnAObjects1_1final, gdjs.Game_32SceneCode.GDBtnAObjects1);
gdjs.copyArray(gdjs.Game_32SceneCode.GDBtnBObjects1_1final, gdjs.Game_32SceneCode.GDBtnBObjects1);
gdjs.copyArray(gdjs.Game_32SceneCode.GDBtnCObjects1_1final, gdjs.Game_32SceneCode.GDBtnCObjects1);
gdjs.copyArray(gdjs.Game_32SceneCode.GDBtnDObjects1_1final, gdjs.Game_32SceneCode.GDBtnDObjects1);
}
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getScene().getVariables().getFromIndex(5).getAsBoolean();
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = (runtimeScene.getScene().getVariables().getFromIndex(4).getAsNumber() == 0);
}
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.sound.playSound(runtimeScene, "Denied_02.aac", false, 80, 1);
}
}

}


};

gdjs.Game_32SceneCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.Game_32SceneCode.GDPlayerObjects1.length = 0;
gdjs.Game_32SceneCode.GDPlayerObjects2.length = 0;
gdjs.Game_32SceneCode.GDPlayerObjects3.length = 0;
gdjs.Game_32SceneCode.GDBackgroundObjects1.length = 0;
gdjs.Game_32SceneCode.GDBackgroundObjects2.length = 0;
gdjs.Game_32SceneCode.GDBackgroundObjects3.length = 0;
gdjs.Game_32SceneCode.GDBoundaryObjects1.length = 0;
gdjs.Game_32SceneCode.GDBoundaryObjects2.length = 0;
gdjs.Game_32SceneCode.GDBoundaryObjects3.length = 0;
gdjs.Game_32SceneCode.GDSpikeObstacleObjects1.length = 0;
gdjs.Game_32SceneCode.GDSpikeObstacleObjects2.length = 0;
gdjs.Game_32SceneCode.GDSpikeObstacleObjects3.length = 0;
gdjs.Game_32SceneCode.GDHazardSpawnerObjects1.length = 0;
gdjs.Game_32SceneCode.GDHazardSpawnerObjects2.length = 0;
gdjs.Game_32SceneCode.GDHazardSpawnerObjects3.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595VidasObjects1.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595VidasObjects2.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595VidasObjects3.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects1.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects2.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects3.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595XPObjects1.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595XPObjects2.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595XPObjects3.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects1.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects2.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects3.length = 0;
gdjs.Game_32SceneCode.GDQuestionPanelObjects1.length = 0;
gdjs.Game_32SceneCode.GDQuestionPanelObjects2.length = 0;
gdjs.Game_32SceneCode.GDQuestionPanelObjects3.length = 0;
gdjs.Game_32SceneCode.GDQuestionTextObjects1.length = 0;
gdjs.Game_32SceneCode.GDQuestionTextObjects2.length = 0;
gdjs.Game_32SceneCode.GDQuestionTextObjects3.length = 0;
gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1.length = 0;
gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2.length = 0;
gdjs.Game_32SceneCode.GDQuestionFeedbackObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnAObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnAObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnAObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnBObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnBObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnBObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnCObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnCObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnCObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnDObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnDObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnDObjects3.length = 0;
gdjs.Game_32SceneCode.GDGO_9595PanelObjects1.length = 0;
gdjs.Game_32SceneCode.GDGO_9595PanelObjects2.length = 0;
gdjs.Game_32SceneCode.GDGO_9595PanelObjects3.length = 0;
gdjs.Game_32SceneCode.GDGO_9595TitleObjects1.length = 0;
gdjs.Game_32SceneCode.GDGO_9595TitleObjects2.length = 0;
gdjs.Game_32SceneCode.GDGO_9595TitleObjects3.length = 0;
gdjs.Game_32SceneCode.GDGO_9595StatsObjects1.length = 0;
gdjs.Game_32SceneCode.GDGO_9595StatsObjects2.length = 0;
gdjs.Game_32SceneCode.GDGO_9595StatsObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnRetryObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnRetryObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnRetryObjects3.length = 0;
gdjs.Game_32SceneCode.GDV_9595PanelObjects1.length = 0;
gdjs.Game_32SceneCode.GDV_9595PanelObjects2.length = 0;
gdjs.Game_32SceneCode.GDV_9595PanelObjects3.length = 0;
gdjs.Game_32SceneCode.GDV_9595TitleObjects1.length = 0;
gdjs.Game_32SceneCode.GDV_9595TitleObjects2.length = 0;
gdjs.Game_32SceneCode.GDV_9595TitleObjects3.length = 0;
gdjs.Game_32SceneCode.GDV_9595StatsObjects1.length = 0;
gdjs.Game_32SceneCode.GDV_9595StatsObjects2.length = 0;
gdjs.Game_32SceneCode.GDV_9595StatsObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnAgainObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnAgainObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnAgainObjects3.length = 0;
gdjs.Game_32SceneCode.GDConfettiObjects1.length = 0;
gdjs.Game_32SceneCode.GDConfettiObjects2.length = 0;
gdjs.Game_32SceneCode.GDConfettiObjects3.length = 0;

gdjs.Game_32SceneCode.eventsList6(runtimeScene);
gdjs.Game_32SceneCode.GDPlayerObjects1.length = 0;
gdjs.Game_32SceneCode.GDPlayerObjects2.length = 0;
gdjs.Game_32SceneCode.GDPlayerObjects3.length = 0;
gdjs.Game_32SceneCode.GDBackgroundObjects1.length = 0;
gdjs.Game_32SceneCode.GDBackgroundObjects2.length = 0;
gdjs.Game_32SceneCode.GDBackgroundObjects3.length = 0;
gdjs.Game_32SceneCode.GDBoundaryObjects1.length = 0;
gdjs.Game_32SceneCode.GDBoundaryObjects2.length = 0;
gdjs.Game_32SceneCode.GDBoundaryObjects3.length = 0;
gdjs.Game_32SceneCode.GDSpikeObstacleObjects1.length = 0;
gdjs.Game_32SceneCode.GDSpikeObstacleObjects2.length = 0;
gdjs.Game_32SceneCode.GDSpikeObstacleObjects3.length = 0;
gdjs.Game_32SceneCode.GDHazardSpawnerObjects1.length = 0;
gdjs.Game_32SceneCode.GDHazardSpawnerObjects2.length = 0;
gdjs.Game_32SceneCode.GDHazardSpawnerObjects3.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595VidasObjects1.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595VidasObjects2.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595VidasObjects3.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects1.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects2.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PuntajeObjects3.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595XPObjects1.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595XPObjects2.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595XPObjects3.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects1.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects2.length = 0;
gdjs.Game_32SceneCode.GDHUD_9595PreguntasObjects3.length = 0;
gdjs.Game_32SceneCode.GDQuestionPanelObjects1.length = 0;
gdjs.Game_32SceneCode.GDQuestionPanelObjects2.length = 0;
gdjs.Game_32SceneCode.GDQuestionPanelObjects3.length = 0;
gdjs.Game_32SceneCode.GDQuestionTextObjects1.length = 0;
gdjs.Game_32SceneCode.GDQuestionTextObjects2.length = 0;
gdjs.Game_32SceneCode.GDQuestionTextObjects3.length = 0;
gdjs.Game_32SceneCode.GDQuestionFeedbackObjects1.length = 0;
gdjs.Game_32SceneCode.GDQuestionFeedbackObjects2.length = 0;
gdjs.Game_32SceneCode.GDQuestionFeedbackObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnAObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnAObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnAObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnBObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnBObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnBObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnCObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnCObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnCObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnDObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnDObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnDObjects3.length = 0;
gdjs.Game_32SceneCode.GDGO_9595PanelObjects1.length = 0;
gdjs.Game_32SceneCode.GDGO_9595PanelObjects2.length = 0;
gdjs.Game_32SceneCode.GDGO_9595PanelObjects3.length = 0;
gdjs.Game_32SceneCode.GDGO_9595TitleObjects1.length = 0;
gdjs.Game_32SceneCode.GDGO_9595TitleObjects2.length = 0;
gdjs.Game_32SceneCode.GDGO_9595TitleObjects3.length = 0;
gdjs.Game_32SceneCode.GDGO_9595StatsObjects1.length = 0;
gdjs.Game_32SceneCode.GDGO_9595StatsObjects2.length = 0;
gdjs.Game_32SceneCode.GDGO_9595StatsObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnRetryObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnRetryObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnRetryObjects3.length = 0;
gdjs.Game_32SceneCode.GDV_9595PanelObjects1.length = 0;
gdjs.Game_32SceneCode.GDV_9595PanelObjects2.length = 0;
gdjs.Game_32SceneCode.GDV_9595PanelObjects3.length = 0;
gdjs.Game_32SceneCode.GDV_9595TitleObjects1.length = 0;
gdjs.Game_32SceneCode.GDV_9595TitleObjects2.length = 0;
gdjs.Game_32SceneCode.GDV_9595TitleObjects3.length = 0;
gdjs.Game_32SceneCode.GDV_9595StatsObjects1.length = 0;
gdjs.Game_32SceneCode.GDV_9595StatsObjects2.length = 0;
gdjs.Game_32SceneCode.GDV_9595StatsObjects3.length = 0;
gdjs.Game_32SceneCode.GDBtnAgainObjects1.length = 0;
gdjs.Game_32SceneCode.GDBtnAgainObjects2.length = 0;
gdjs.Game_32SceneCode.GDBtnAgainObjects3.length = 0;
gdjs.Game_32SceneCode.GDConfettiObjects1.length = 0;
gdjs.Game_32SceneCode.GDConfettiObjects2.length = 0;
gdjs.Game_32SceneCode.GDConfettiObjects3.length = 0;


return;

}

gdjs['Game_32SceneCode'] = gdjs.Game_32SceneCode;
