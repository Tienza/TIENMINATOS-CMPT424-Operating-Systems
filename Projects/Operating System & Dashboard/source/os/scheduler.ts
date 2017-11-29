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
                        public aFullName: string[] = ["Round Robin", "Shortest Job First", "First Come First Serve", "Priority"],
                        public rolledOut: boolean = false) {
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
                if (this.counter >= this.roundRobinQuantum && _ProcessManager.readyQueue.q.length > 0)
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
                // Dequeue the first PCB on the Ready Queue and place it on the CPU
                _ProcessManager.currentPCB = _ProcessManager.readyQueue.dequeue();
                // Change the state of the PCB from "Ready" to "Running"
                _ProcessManager.currentPCB.state = _ProcessManager.processStates.running;

                // Roll in - If the next PCB is located on the HDD or previously there had been a roll out
                if (_ProcessManager.currentPCB.location === _ProcessManager.processLocations.hdd) {
                    // Faux Kernal Interrupt
                    _Kernel.krnTrace("Handling IRQ~" + FILE_SYSTEM_IRQ);
                    // Roll in the current PCB
                    _krnFileSystemDriver.rollIn(_ProcessManager.currentPCB.programId);
                    // Let the Scheduler know that a roll in was performed
                    this.rolledOut = false;
                }
                else if (this.rolledOut) {
                    // Faux Kernal Interrupt
                    _Kernel.krnTrace("Handling IRQ~" + FILE_SYSTEM_IRQ);
                    // Find any PCB that is currently on the HDD
                    var pcb: PCB = _ProcessManager.findPCBonDisk();
                    // Roll in that PCB
                    _krnFileSystemDriver.rollIn(pcb.programId);
                    // Update the Process Display accordingly
                    Control.updateProcessDisplay(pcb);
                    // Let the Scheduler know that a roll in was performed
                    this.rolledOut = false;
                }
                // Switch the Memory Tab and update the Process Display accordingly
                Control.switchMemoryTab(_ProcessManager.currentPCB);
                Control.updateProcessDisplay(_ProcessManager.currentPCB);
                // Update the CPU with the current PCB values
                _CPU.updateCPU();
            }

            public loadOutNewProcess(): void {
                // Change the state of the PCB from "Running" to "Ready"
                _ProcessManager.currentPCB.state = _ProcessManager.processStates.ready;

                // Check for free partitions
                var freePartition: {[key: string]: any} = _MemoryManager.checkFreePartition();
                // Roll out - If there are no free partitions and the ReadyQueue is longer has more than 2 PCBs
                if (freePartition.isFree === undefined && _ProcessManager.readyQueue.q.length > 2 && _ProcessManager.readyQueue.q[0].location === _ProcessManager.processLocations.hdd) {
                    // Faux Kernal Interrupt
                    _Kernel.krnTrace("Handling IRQ~" + FILE_SYSTEM_IRQ);
                    // Roll out the current PCB
                    _krnFileSystemDriver.rollOut(_ProcessManager.currentPCB.programId, _MemoryAccessor.fetchCodeFromMemory(_ProcessManager.currentPCB.memoryIndex));
                    // Let the Scheduler know that a roll out was performed
                    this.rolledOut = true;
                }
                // Take the PCB on the CPU and put it on the back of the Ready Queue
                _ProcessManager.readyQueue.enqueue(_ProcessManager.currentPCB);
                // Update the Process Display accordingly
                Control.updateProcessDisplay(_ProcessManager.currentPCB);
            }

            public contextSwitch(): void {
                var contextSwitchMessage: string = "Context Switch: ProgramId " + _ProcessManager.currentPCB.programId;
                // Remove the PCB from the CPU and put it on the back of the Ready Queue
                this.loadOutNewProcess();
                // Reset the cycle counter
                this.resetCounter();
                // Dequeue the first PCB on the Ready Queue and place it on the CPU
                this.loadInNewProcess();
                // Send the actions message to the log
                contextSwitchMessage += " to ProgramId " + _ProcessManager.currentPCB.programId;
                _Kernel.krnTrace(contextSwitchMessage);
            }

            public resetCounter(): void {
                this.counter = 0;
            }
        }
    }   