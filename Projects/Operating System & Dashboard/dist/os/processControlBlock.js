///<reference path="../globals.ts" />
/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(PC, Acc, Xreg, Yreg, Zflag, instruction, isExecuted, memoryIndex, hddTSB, state, programId, location, priority, waitTime, turnAroundTime, burstTime, predictedBurstTime) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (instruction === void 0) { instruction = null; }
            if (isExecuted === void 0) { isExecuted = false; }
            if (memoryIndex === void 0) { memoryIndex = null; }
            if (hddTSB === void 0) { hddTSB = null; }
            if (state === void 0) { state = "New"; }
            if (programId === void 0) { programId = _ProcessCount; }
            if (location === void 0) { location = null; }
            if (priority === void 0) { priority = 3; }
            if (waitTime === void 0) { waitTime = 0; }
            if (turnAroundTime === void 0) { turnAroundTime = 0; }
            if (burstTime === void 0) { burstTime = 0; }
            if (predictedBurstTime === void 0) { predictedBurstTime = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.instruction = instruction;
            this.isExecuted = isExecuted;
            this.memoryIndex = memoryIndex;
            this.hddTSB = hddTSB;
            this.state = state;
            this.programId = programId;
            this.location = location;
            this.priority = priority;
            this.waitTime = waitTime;
            this.turnAroundTime = turnAroundTime;
            this.burstTime = burstTime;
            this.predictedBurstTime = predictedBurstTime;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
