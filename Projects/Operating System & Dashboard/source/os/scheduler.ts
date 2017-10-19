///<reference path="../globals.ts" />

/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */

module TSOS {
    
        export class Scheduler {
    
            constructor(public roundRobinQuantum: number = 6,
                        public counter: number = 0,
                        public algorithm: string = "roundRobin") {
            }

            public checkSchedule(): void {
                this.counter++;
                switch(this.algorithm) {
                    case "roundRobin":
                        this.processRoundRobin();
                        break;
                }
            }

            public processRoundRobin(): void {
                if (this.counter > this.roundRobinQuantum)
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
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
                this.loadOutNewProcess();
                this.resetCounter();
                this.loadInNewProcess();
            }

            public resetCounter(): void {
                this.counter = 0;
            }
        }
    }   