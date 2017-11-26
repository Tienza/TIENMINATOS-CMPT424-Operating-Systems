///<reference path="../globals.ts" />
/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(roundRobinQuantum, maxInt, counter, algorithm, algoType, aFullName, rolledOut) {
            if (roundRobinQuantum === void 0) { roundRobinQuantum = 6; }
            if (maxInt === void 0) { maxInt = Math.pow(2, 53) - 1; }
            if (counter === void 0) { counter = 0; }
            if (algorithm === void 0) { algorithm = "rr"; }
            if (algoType === void 0) { algoType = ["rr", "sjf", "fcfs", "priority"]; }
            if (aFullName === void 0) { aFullName = ["Round Robin", "Shortest Job First", "First Come First Serve", "Priority"]; }
            if (rolledOut === void 0) { rolledOut = false; }
            this.roundRobinQuantum = roundRobinQuantum;
            this.maxInt = maxInt;
            this.counter = counter;
            this.algorithm = algorithm;
            this.algoType = algoType;
            this.aFullName = aFullName;
            this.rolledOut = rolledOut;
        }
        Scheduler.prototype.checkSchedule = function () {
            this.counter++;
            switch (this.algorithm) {
                case "rr":
                    this.processRoundRobin();
                    break;
                case "sjf":
                    this.processShortestJobFirst();
                    break;
                case "fcfs":
                    this.processFirstComeFirstServe();
                    break;
                case "priority":
                    this.processPriority();
                    break;
            }
        };
        Scheduler.prototype.processRoundRobin = function () {
            if (this.counter >= this.roundRobinQuantum)
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0));
        };
        Scheduler.prototype.processShortestJobFirst = function () {
            // Sort the ready queue by predicted Burst Time
            _ProcessManager.readyQueue.q.sort(function (a, b) {
                // If a has lower predicted Burst Time, a comes first
                if (a.predictedBurstTime < b.predictedBurstTime)
                    return -1;
                // If a has higher predicted Burst Time, b comes first
                if (a.predictedBurstTime > b.predictedBurstTime)
                    return 1;
                return 0;
            });
            // Prempt if a process with lower predicted Burst Time is in the queue
            if (_ProcessManager.currentPCB !== undefined && _ProcessManager.currentPCB !== null && _ProcessManager.readyQueue.q[0] !== undefined && _ProcessManager.readyQueue.q[0] !== null) {
                if (_ProcessManager.readyQueue.q[0].priority < _ProcessManager.currentPCB.priority)
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0));
            }
        };
        Scheduler.prototype.processFirstComeFirstServe = function () {
            if (this.counter >= this.maxInt)
                _KernelInputQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0));
        };
        Scheduler.prototype.processPriority = function () {
            // Sort the ready queue by priority
            _ProcessManager.readyQueue.q.sort(function (a, b) {
                // If a has higher priority (lower int), a comes first
                if (a.priority < b.priority)
                    return -1;
                // If a has lower priority (higher int), b comes first
                if (a.priority > b.priority)
                    return 1;
                return 0;
            });
            // Prempt if a process with higher priority (lower int) is in the queue
            if (_ProcessManager.currentPCB !== undefined && _ProcessManager.currentPCB !== null && _ProcessManager.readyQueue.q[0] !== undefined && _ProcessManager.readyQueue.q[0] !== null) {
                if (_ProcessManager.readyQueue.q[0].priority < _ProcessManager.currentPCB.priority)
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0));
            }
        };
        Scheduler.prototype.removeAllZeros = function (userProgram) {
            var predictedBurstProgram = userProgram.filter(function (a) { return a !== '00'; });
            return predictedBurstProgram;
        };
        Scheduler.prototype.addWeightedD0 = function (userProgram) {
            var weightedD0 = 0;
            for (var i = 0; i < userProgram.length; i++) {
                weightedD0 += (userProgram[i] === "D0") ? 50 : 0;
            }
            return weightedD0;
        };
        Scheduler.prototype.loadInNewProcess = function () {
            _ProcessManager.currentPCB = _ProcessManager.readyQueue.dequeue();
            _ProcessManager.currentPCB.state = _ProcessManager.processStates.running;
            // Roll in - If the next PCB is located on the HDD or previously there had been a roll out
            if (_ProcessManager.currentPCB.location === _ProcessManager.processLocations.hdd) {
                _krnFileSystemDriver.rollIn(_ProcessManager.currentPCB.programId);
            }
            else if (this.rolledOut) {
                var pcb = _ProcessManager.findPCBonDisk();
                _krnFileSystemDriver.rollIn(pcb.programId);
                TSOS.Control.updateProcessDisplay(pcb);
                this.rolledOut = false;
            }
            TSOS.Control.switchMemoryTab(_ProcessManager.currentPCB);
            TSOS.Control.updateProcessDisplay(_ProcessManager.currentPCB);
            _CPU.updateCPU();
        };
        Scheduler.prototype.loadOutNewProcess = function () {
            _ProcessManager.currentPCB.state = _ProcessManager.processStates.ready;
            // Check for free partitions
            var freePartition = _MemoryManager.checkFreePartition();
            // Roll out - If there are no free partitions and the ReadyQueue is longer has more than 2 PCBs
            if (freePartition.isFree === undefined && _ProcessManager.readyQueue.q.length > 2) {
                _krnFileSystemDriver.rollOut(_ProcessManager.currentPCB.programId, _MemoryAccessor.fetchCodeFromMemory(_ProcessManager.currentPCB.memoryIndex));
                this.rolledOut = true;
            }
            _ProcessManager.readyQueue.enqueue(_ProcessManager.currentPCB);
            TSOS.Control.updateProcessDisplay(_ProcessManager.currentPCB);
        };
        Scheduler.prototype.contextSwitch = function () {
            var contextSwitchMessage = "Context Switch: ProgramId " + _ProcessManager.currentPCB.programId;
            this.loadOutNewProcess();
            this.resetCounter();
            this.loadInNewProcess();
            contextSwitchMessage += " to ProgramId " + _ProcessManager.currentPCB.programId;
            _Kernel.krnTrace(contextSwitchMessage);
        };
        Scheduler.prototype.resetCounter = function () {
            this.counter = 0;
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
