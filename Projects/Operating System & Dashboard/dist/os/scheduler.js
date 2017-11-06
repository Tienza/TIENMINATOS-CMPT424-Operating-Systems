///<reference path="../globals.ts" />
/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(roundRobinQuantum, maxInt, counter, algorithm, algoType, aFullName) {
            if (roundRobinQuantum === void 0) { roundRobinQuantum = 6; }
            if (maxInt === void 0) { maxInt = Math.pow(2, 53) - 1; }
            if (counter === void 0) { counter = 0; }
            if (algorithm === void 0) { algorithm = "rr"; }
            if (algoType === void 0) { algoType = ["rr", "sjf", "fcfs", "priority"]; }
            if (aFullName === void 0) { aFullName = ["Round Robin", "Shortest Job First", "First Come First Serve", "Priority"]; }
            this.roundRobinQuantum = roundRobinQuantum;
            this.maxInt = maxInt;
            this.counter = counter;
            this.algorithm = algorithm;
            this.algoType = algoType;
            this.aFullName = aFullName;
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
        };
        Scheduler.prototype.processFirstComeFirstServe = function () {
            if (this.counter >= this.maxInt)
                _KernelInputQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0));
        };
        Scheduler.prototype.loadInNewProcess = function () {
            _ProcessManager.currentPCB = _ProcessManager.readyQueue.dequeue();
            _ProcessManager.currentPCB.state = _ProcessManager.processStates.running;
            TSOS.Control.switchMemoryTab(_ProcessManager.currentPCB);
            TSOS.Control.updateProcessDisplay(_ProcessManager.currentPCB);
            _CPU.updateCPU();
        };
        Scheduler.prototype.loadOutNewProcess = function () {
            _ProcessManager.currentPCB.state = _ProcessManager.processStates.ready;
            TSOS.Control.updateProcessDisplay(_ProcessManager.currentPCB);
            _ProcessManager.readyQueue.enqueue(_ProcessManager.currentPCB);
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
