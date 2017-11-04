///<reference path="../globals.ts" />

/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */

module TSOS {
    
        export class Scheduler {
    
            constructor(public roundRobinQuantum: number = 6,
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
                }
            }

            public processRoundRobin(): void {
                if (this.counter >= this.roundRobinQuantum)
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
            }

            public processShortestJobFirst() {
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
            }

            public loadInNewProcess(): void {
                _ProcessManager.currentPCB = _ProcessManager.readyQueue.dequeue();
                _ProcessManager.currentPCB.state = _ProcessManager.processStates.running;
                Control.switchMemoryTab(_ProcessManager.currentPCB);
                Control.updateProcessDisplay(_ProcessManager.currentPCB);
                _CPU.updateCPU();
            }

            public loadOutNewProcess(): void {
                _ProcessManager.currentPCB.state = _ProcessManager.processStates.ready;
                Control.updateProcessDisplay(_ProcessManager.currentPCB);
                _ProcessManager.readyQueue.enqueue(_ProcessManager.currentPCB);
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