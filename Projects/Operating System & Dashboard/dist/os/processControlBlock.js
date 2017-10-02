///<reference path="../globals.ts" />
/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(PC, Acc, Xreg, Yreg, Zflag, isExecuting, opCodes, programId) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (opCodes === void 0) { opCodes = []; }
            if (programId === void 0) { programId = _ProgramCount; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.opCodes = opCodes;
            this.programId = programId;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
