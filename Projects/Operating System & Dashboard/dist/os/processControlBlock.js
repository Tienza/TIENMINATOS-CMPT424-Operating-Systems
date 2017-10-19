///<reference path="../globals.ts" />
/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(PC, Acc, Xreg, Yreg, Zflag, instruction, isExecuting, memoryIndex, state, programId) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (instruction === void 0) { instruction = ""; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (memoryIndex === void 0) { memoryIndex = null; }
            if (state === void 0) { state = "New"; }
            if (programId === void 0) { programId = _ProcessCount; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.instruction = instruction;
            this.isExecuting = isExecuting;
            this.memoryIndex = memoryIndex;
            this.state = state;
            this.programId = programId;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
