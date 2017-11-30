///<reference path="../globals.ts" />
/* ------------
    processManager.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager(processList, terminatedList, readyQueue, isRunningAll) {
            if (processList === void 0) { processList = []; }
            if (terminatedList === void 0) { terminatedList = []; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            if (isRunningAll === void 0) { isRunningAll = false; }
            this.processList = processList;
            this.terminatedList = terminatedList;
            this.readyQueue = readyQueue;
            this.isRunningAll = isRunningAll;
            this.processStates = {
                "new": "New",
                "ready": "Ready",
                "running": "Running",
                "terminated": "Terminated"
            };
            this.processLocations = {
                "memory": "Memory",
                "hdd": "HDD"
            };
        }
        ProcessManager.prototype.runProcess = function (pcb) {
            if (!this.isRunningAll) {
                // Check if the PCB resides on the HDD
                if (pcb.location === this.processLocations.hdd) {
                    var freePartition = _MemoryManager.checkFreePartition();
                    // If there is no space, then roll out the last PCB on Memory
                    if (freePartition.isFree === undefined) {
                        var rollOutPCB = this.getPCBbyParition(2);
                        // Roll Out
                        _krnFileSystemDriver.rollOut(rollOutPCB.programId, _MemoryAccessor.fetchCodeFromMemory(rollOutPCB.memoryIndex));
                        // Roll In
                        _krnFileSystemDriver.rollIn(pcb.programId);
                    }
                    else {
                        _krnFileSystemDriver.rollIn(pcb.programId);
                    }
                }
                // Set PCB state to running
                pcb.state = this.processStates.running;
                // Update _ProcessManager and CPU
                this.currentPCB = pcb;
                _CPU.updateCPU();
                _CPU.isExecuting = true;
            }
            else {
                pcb.state = this.processStates.ready;
                this.readyQueue.enqueue(pcb);
            }
        };
        ProcessManager.prototype.runAllProcess = function () {
            // Set the isRunningAll boolean to true, for load/run processing
            this.isRunningAll = true;
            for (var i = 0; i < this.processList.length; i++) {
                var pcb = this.processList[i];
                if (pcb.state === this.processStates["new"]) {
                    pcb.state = this.processStates.ready;
                    this.readyQueue.enqueue(pcb);
                }
            }
            // If Shorted Job First then reorder the readyQueue
            if (_Scheduler.algorithm === "sjf")
                _Scheduler.processShortestJobFirst();
            else if (_Scheduler.algorithm === "priority")
                _Scheduler.processPriority();
            this.currentPCB = this.readyQueue.dequeue();
            TSOS.Control.switchMemoryTab(this.currentPCB);
            _CPU.updateCPU();
            _CPU.isExecuting = true;
        };
        ProcessManager.prototype.fetchInstruction = function (pcb, PC) {
            return _MemoryAccessor.readFromMemory(pcb.memoryIndex, PC);
        };
        ProcessManager.prototype.writeInstruction = function (pcb, memoryLoc, val) {
            var writeSuccess = _MemoryAccessor.writeToMemory(pcb.memoryIndex, memoryLoc, val);
            // If the writing to memory failed then terminate the process
            if (!writeSuccess) {
                var accessViolationMsg = "Memory Access Violation! Terminating Process " + pcb.programId;
                // Break apart string to account for line wrapping
                for (var i = 0; i < accessViolationMsg.length; i++) {
                    _StdOut.putText(accessViolationMsg[i]);
                }
                this.terminateProcess(pcb);
            }
        };
        ProcessManager.prototype.terminateProcess = function (pcb) {
            // Set PCB isExecuted to true
            pcb.isExecuted = true;
            if (pcb.location === _ProcessManager.processLocations.memory) {
                // Wipe the associated memory partition
                _MemoryManager.wipeParition(pcb.memoryIndex);
                // Free the associated memory partition
                _MemoryManager.freePartition(pcb.memoryIndex);
                // Update the Memory Display
                TSOS.Control.updateMemoryDisplay(pcb.memoryIndex);
            }
            else {
                // Delete process from the HDD
                _krnFileSystemDriver.deleteProgramFromHDD(pcb);
            }
            // Remove the Process Display
            TSOS.Control.removeProcessDisplay(pcb.programId);
            // Add the process to the terminatedList
            this.terminatedList.push(pcb);
            // Remove the process from the processList
            this.removePCB(pcb.programId);
            /*// Show Memory Partitions
            _MemoryManager.showAllPartitions();*/
            // Toggle CPU execution off
            if (this.readyQueue.isEmpty()) {
                _CPU.isExecuting = false;
                // Toggle isRunningAll to false
                this.isRunningAll = false;
                // Remove All Debuggers
                _Debuggers = [];
                // Print Wait Time and Turn Around Time
                this.printWTTAT();
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
        ProcessManager.prototype.printWTTAT = function () {
            if (_CalculateWTTAT) {
                var divider = "~~~~~~~~~~~~~~~~~~~~~~~~~";
                // Declare variables for effeciency test
                var totalWaitTime = 0;
                var totalTurnAroundTime = 0;
                // Print Wait Time and Turn Around Time
                _StdOut.advanceLine();
                _StdOut.putText(divider);
                for (var i = 0; i < this.terminatedList.length; i++) {
                    var pcb = this.terminatedList[i];
                    _StdOut.advanceLine();
                    _StdOut.putText("PID: " + pcb.programId);
                    _StdOut.advanceLine();
                    _StdOut.putText("Wait Time: " + pcb.waitTime + " cycles");
                    _StdOut.advanceLine();
                    _StdOut.putText("Burst Time: " + pcb.burstTime + " cycles");
                    _StdOut.advanceLine();
                    _StdOut.putText("Turn Around Time: " + pcb.turnAroundTime + " cycles");
                    _StdOut.advanceLine();
                    _StdOut.putText(divider);
                    // Add calculated values to total calculation
                    totalWaitTime += pcb.waitTime;
                    totalTurnAroundTime += pcb.turnAroundTime;
                }
                _StdOut.advanceLine();
                _StdOut.putText("Total Wait Time: " + totalWaitTime + " cycles");
                _StdOut.advanceLine();
                _StdOut.putText("Total Turn Around Time: " + totalTurnAroundTime + " cycles");
                _StdOut.advanceLine();
                _StdOut.putText(divider);
            }
            // Clear terminated process list
            this.terminatedList = [];
        };
        ProcessManager.prototype.updateWaitTime = function () {
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                this.readyQueue.q[i].waitTime += 1;
            }
        };
        ProcessManager.prototype.updateTurnAroundTime = function () {
            // Update Turn Around Time of programs in the readyQueue
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                this.readyQueue.q[i].turnAroundTime += 1;
            }
            // Update Turn Around Time of current program
            this.currentPCB.turnAroundTime += 1;
        };
        ProcessManager.prototype.updateBurstTime = function () {
            // Update Burst Time of current PCB
            this.currentPCB.burstTime += 1;
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
        ProcessManager.prototype.getPCBbyParition = function (memoryIndex) {
            var pcb;
            // Retrieve the PCB at the specified partition
            for (var i = 0; i < this.processList.length; i++) {
                if (this.processList[i].memoryIndex === memoryIndex)
                    pcb = this.processList[i];
            }
            return pcb;
        };
        ProcessManager.prototype.findPCBonDisk = function () {
            var pcb = null;
            for (var i = 0; i < this.readyQueue.q.length; i++) {
                if (this.readyQueue.q[i].location === this.processLocations.hdd)
                    pcb = this.readyQueue.q[i];
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
        ProcessManager.prototype.removePCBFromReadyQueue = function (programId) {
            // FInd the PCB with the programId and remove it from the readyQueue
            for (var i = 0; i < this.readyQueue.q.length; i++) {
                if (this.readyQueue.q[i].programId === programId) {
                    this.readyQueue.q.splice(i, 1);
                }
            }
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
