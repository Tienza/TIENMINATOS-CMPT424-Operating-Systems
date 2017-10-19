///<reference path="../globals.ts" />
/* ------------
    processManager.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager(processList, readyQueue) {
            if (processList === void 0) { processList = []; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            this.processList = processList;
            this.readyQueue = readyQueue;
            this.processStates = {
                "new": "New",
                "ready": "Ready",
                "running": "Running",
                "terminated": "Terminated"
            };
        }
        ProcessManager.prototype.runProcess = function (pcb) {
            this.currentPCB = pcb;
            _CPU.updateCPU();
            _CPU.isExecuting = true;
        };
        ProcessManager.prototype.runAllProcess = function () {
            for (var i = 0; i < this.processList.length; i++) {
                var pcb = this.processList[i];
                if (pcb.state === this.processStates["new"]) {
                    pcb.state = this.processStates.ready;
                    this.readyQueue.enqueue(pcb);
                }
            }
            this.currentPCB = this.readyQueue.dequeue();
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
        ProcessManager.prototype.terminateProcess = function (pcb) {
            // Wipe the associated memory partition
            _MemoryManager.wipeParition(pcb.memoryIndex);
            // Free the associated memory partition
            _MemoryManager.freePartition(pcb.memoryIndex);
            // Remove the process from the processList
            this.removePCB(pcb.programId);
            // Update the Memory Display
            TSOS.Control.updateMemoryDisplay(pcb.memoryIndex);
            // Remove the Process Display
            TSOS.Control.removeProcessDisplay(pcb.programId);
            // Show Memory Partitions
            _MemoryManager.showAllPartitions();
            // Toggle CPU execution off
            console.log(_ProcessManager.readyQueue.toString());
            if (this.readyQueue.isEmpty()) {
                _CPU.isExecuting = false;
                // Break Line
                _StdOut.advanceLine();
                // Insert the prompt
                _OsShell.putPrompt();
            }
            else if (this.currentPCB.programId === pcb.programId) {
                // Switch In New Process
                _Scheduler.loadInNewProcess();
            }
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
