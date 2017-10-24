///<reference path="../globals.ts" />
/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(roundRobinQuantum, counter, algorithm) {
            if (roundRobinQuantum === void 0) { roundRobinQuantum = 6; }
            if (counter === void 0) { counter = 0; }
            if (algorithm === void 0) { algorithm = "roundRobin"; }
            this.roundRobinQuantum = roundRobinQuantum;
            this.counter = counter;
            this.algorithm = algorithm;
        }
        Scheduler.prototype.checkSchedule = function () {
            this.counter++;
            switch (this.algorithm) {
                case "roundRobin":
                    this.processRoundRobin();
                    break;
            }
        };
        Scheduler.prototype.processRoundRobin = function () {
            if (this.counter >= this.roundRobinQuantum)
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0));
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
