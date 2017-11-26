///<reference path="../globals.ts" />

/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */

module TSOS {
    
        export class Scheduler {
    
            constructor(public roundRobinQuantum: number = 6,
                        public maxInt: number = Math.pow(2, 53) - 1,
                        public counter: number = 0,
                        public algorithm: string = "rr",
                        public algoType: string[] = ["rr", "sjf", "fcfs", "priority"],
                        public aFullName: string[] = ["Round Robin", "Shortest Job First", "First Come First Serve", "Priority"]) {
            }

            public checkSchedule(): void {
                this.counter++;
                switch(this.algorithm) {
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
            }

            public processRoundRobin(): void {
                if (this.counter >= this.roundRobinQuantum)
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
            }

            public processShortestJobFirst(): void {
                // Sort the ready queue by predicted Burst Time
                _ProcessManager.readyQueue.q.sort(function (a, b) {
                    // If a has lower predicted Burst Time, a comes first
                    if (a.predictedBurstTime < b.predictedBurstTime)
                        return -1;
                    // If a has higher predicted Burst Time, b comes first
                    if (a.predictedBurstTime > b.predictedBurstTime)
                        return 1;
                    return 0
                });
                // Prempt if a process with lower predicted Burst Time is in the queue
                if (_ProcessManager.currentPCB !== undefined && _ProcessManager.currentPCB !== null && _ProcessManager.readyQueue.q[0] !== undefined && _ProcessManager.readyQueue.q[0] !== null) {
                    if (_ProcessManager.readyQueue.q[0].priority < _ProcessManager.currentPCB.priority)
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
                }
            }

            public processFirstComeFirstServe(): void {
                if (this.counter >= this.maxInt)
                    _KernelInputQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
            }

            public processPriority(): void {
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
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
                }
            }

            public removeAllZeros(userProgram: string[]): string[] {
                var predictedBurstProgram = userProgram.filter(function(a){return a !== '00'});
                
                return predictedBurstProgram;
            }

            public addWeightedD0(userProgram: string[]): number {
                var weightedD0: number = 0;

                for (var i: number = 0; i < userProgram.length; i++) {
                    weightedD0 += (userProgram[i] === "D0") ? 50 : 0;
                }

                return weightedD0;
            }

            public loadInNewProcess(): void {
                _ProcessManager.currentPCB = _ProcessManager.readyQueue.dequeue();
                _ProcessManager.currentPCB.state = _ProcessManager.processStates.running;

                // Roll in
                if (_ProcessManager.currentPCB.location === _ProcessManager.processLocations.hdd)
                    _krnFileSystemDriver.rollIn(_ProcessManager.currentPCB.programId);

                Control.switchMemoryTab(_ProcessManager.currentPCB);
                Control.updateProcessDisplay(_ProcessManager.currentPCB);
                _CPU.updateCPU();
            }

            public loadOutNewProcess(): void {
                _ProcessManager.currentPCB.state = _ProcessManager.processStates.ready;

                // Roll out
                if (_ProcessManager.currentPCB.location === _ProcessManager.processLocations.memory)
                    _krnFileSystemDriver.rollOut(_ProcessManager.currentPCB.programId, _MemoryAccessor.fetchCodeFromMemory(_ProcessManager.currentPCB.memoryIndex));

                _ProcessManager.readyQueue.enqueue(_ProcessManager.currentPCB);
                Control.updateProcessDisplay(_ProcessManager.currentPCB);
            }

            public contextSwitch(): void {
                var contextSwitchMessage: string = "Context Switch: ProgramId " + _ProcessManager.currentPCB.programId;
                this.loadOutNewProcess();
                this.resetCounter();
                this.loadInNewProcess();
                contextSwitchMessage += " to ProgramId " + _ProcessManager.currentPCB.programId;
                _Kernel.krnTrace(contextSwitchMessage);
            }

            public resetCounter(): void {
                this.counter = 0;
            }
        }
    }   