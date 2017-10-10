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
            var writeSuccess = _MemoryManager.writeToMemory(pcb.memoryIndex, memoryLoc, val);
            // If the writing to memory failed then terminate the process
            if (!writeSuccess) {
                _StdOut.putText("Memory Access Violation! Terminating Process " + pcb.programId);
                this.terminateProcess(pcb);
            }
        };
        ProcessManager.prototype.hilightMemory = function (pcb, PC) {
            // Unhighlight all Op Codes
            _MemoryManager.unhighlightAll();
            // Highlight the current Op Code and working Memory Code
            _MemoryManager.highlightMemory(pcb.memoryIndex, PC);
        };
        ProcessManager.prototype.switchMemoryTab = function (pcb) {
            _MemoryManager.switchMemoryTab(pcb.memoryIndex);
        };
        ProcessManager.prototype.terminateProcess = function (pcb) {
            // Wipe the associated memory partition
            _MemoryManager.wipeParition(pcb.memoryIndex);
            // Free the associated memory partition
            _MemoryManager.freePartition(pcb.memoryIndex);
            // Remove the process from the processList
            this.removePCB(pcb.programId);
            // Toggle CPU execution off
            _CPU.isExecuting = false;
            // Update the Memory Display
            _MemoryManager.updateMemoryDisplay(pcb.memoryIndex);
            // Show Memory Partitions
            _MemoryManager.showAllPartitions();
            // Break Line
            _StdOut.advanceLine();
            // Insert the prompt
            _OsShell.putPrompt();
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
        ProcessManager.prototype.removePCB = function (programId) {
            // Find the PCB with the programId and remove it from the processList
            for (var i = 0; i < this.processList.length; i++) {
                if (this.processList[i].programId === programId) {
                    this.processList.splice(i, 1);
                }
            }
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
