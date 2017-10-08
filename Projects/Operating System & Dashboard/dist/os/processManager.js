///<reference path="../globals.ts" />
/* ------------
    processManager.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager(processList) {
            if (processList === void 0) { processList = []; }
            this.processList = processList;
        }
        ProcessManager.prototype.runProcess = function (pcb) {
            this.currentPCB = pcb;
            _CPU.updateCPU();
            _CPU.isExecuting = true;
        };
        ProcessManager.prototype.fetchInstruction = function (pcb, PC) {
            return _MemoryManager.readFromMemory(pcb.memoryIndex, PC);
        };
        ProcessManager.prototype.writeInstruction = function (pcb, memoryLoc, val) {
            _MemoryManager.writeToMemory(pcb.memoryIndex, memoryLoc, val);
        };
        ProcessManager.prototype.terminateProcess = function (pcb) {
            // Wipe the associated memory partition
            _MemoryManager.wipeParition(pcb.memoryIndex);
            // Free the associated memory partition
            _MemoryManager.freePartition(pcb.memoryIndex);
            // Toggle CPU execution off
            _CPU.isExecuting = false;
        };
        ProcessManager.prototype.getPCB = function (programId) {
            var pcb;
            // Retrieve the PCB specified by the user
            for (var i = 0; i < this.processList.length; i++) {
                if (this.processList[i].programId === programId)
                    pcb = this.processList[i];
            }
            return pcb;
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
