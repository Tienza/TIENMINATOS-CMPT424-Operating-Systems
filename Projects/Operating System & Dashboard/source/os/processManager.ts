///<reference path="../globals.ts" />

/* ------------
    processManager.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class ProcessManager {

        constructor(public processList: PCB[] = [],
                    public terminatedList: PCB[] = [],
                    public readyQueue: Queue = new Queue(),
                    public isRunningAll: boolean = false) {
        }

        public currentPCB: TSOS.PCB;

        public processStates: {[key: string]: any} = {
            "new": "New",
            "ready": "Ready",
            "running": "Running",
            "terminated": "Terminated"
        }
         
        public runProcess(pcb: PCB): void {
            if (!this.isRunningAll) {
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
        }

        public runAllProcess(): void {
            // Set the isRunningAll boolean to true, for load/run processing
            this.isRunningAll = true;
            for (var i: number = 0; i < this.processList.length; i++) {
                var pcb: PCB = this.processList[i];
                if (pcb.state === this.processStates.new) {
                    pcb.state = this.processStates.ready;
                    this.readyQueue.enqueue(pcb);
                }
            }

            // If Shorted Job First then reorder the readyQueue
            if (_Scheduler.algorithm === "sjf")
                _Scheduler.processShortestJobFirst();
            // If Priority then reorder the readyQueue
            else if (_Scheduler.algorithm === "priority")
                _Scheduler.processPriority();

            this.currentPCB = this.readyQueue.dequeue();

            Control.switchMemoryTab(this.currentPCB);

            _CPU.updateCPU();
            _CPU.isExecuting = true;
        }

        public fetchInstruction(pcb: PCB, PC: number): string {
            return _MemoryAccessor.readFromMemory(pcb.memoryIndex, PC);
        }

        public writeInstruction(pcb: PCB, memoryLoc: number, val: string): void {
            var writeSuccess: boolean = _MemoryAccessor.writeToMemory(pcb.memoryIndex, memoryLoc, val);

            // If the writing to memory failed then terminate the process
            if (!writeSuccess) {
                var accessViolationMsg = "Memory Access Violation! Terminating Process " + pcb.programId;
                // Break apart string to account for line wrapping
                for (var i: number = 0; i < accessViolationMsg.length; i++) {
                    _StdOut.putText(accessViolationMsg[i]);
                }
                this.terminateProcess(pcb);
            }
        }

        public terminateProcess(pcb: PCB): void {
            // Set PCB isExecuted to true
            pcb.isExecuted = true;
            // Wipe the associated memory partition
            _MemoryManager.wipeParition(pcb.memoryIndex);
            // Free the associated memory partition
            _MemoryManager.freePartition(pcb.memoryIndex);
            // Add the process to the terminatedList
            this.terminatedList.push(pcb);
            // Remove the process from the processList
            this.removePCB(pcb.programId);
            // Update the Memory Display
            Control.updateMemoryDisplay(pcb.memoryIndex);
            // Remove the Process Display
            Control.removeProcessDisplay(pcb.programId);
            // Show Memory Partitions
            _MemoryManager.showAllPartitions();
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
        }

        public printWTTAT(): void {
            if (_CalculateWTTAT) {
                var divider: string = "~~~~~~~~~~~~~~~~~~~~~~~~~";
                // Declare variables for effeciency test
                var totalWaitTime: number = 0;
                var totalTurnAroundTime: number = 0;
                // Print Wait Time and Turn Around Time
                _StdOut.advanceLine();
                _StdOut.putText(divider);
                for (var i: number = 0; i < this.terminatedList.length; i++) {
                    var pcb: PCB = this.terminatedList[i];
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
        }

        public updateWaitTime(): void {
            for (var i: number = 0; i < this.readyQueue.getSize(); i++) {
                this.readyQueue.q[i].waitTime += 1;
            }
        }

        public updateTurnAroundTime(): void {
            // Update Turn Around Time of programs in the readyQueue
            for (var i: number = 0; i < this.readyQueue.getSize(); i++) {
                this.readyQueue.q[i].turnAroundTime += 1;
            }
            // Update Turn Around Time of current program
            this.currentPCB.turnAroundTime += 1;
        }

        public updateBurstTime(): void {
            // Update Burst Time of current PCB
            this.currentPCB.burstTime += 1;
        }

        public getPCB(programId): PCB {
            var pcb: PCB;
            // Retrieve the PCB specified by the user
            for (var i: number = 0; i < this.processList.length; i++) {
                if (this.processList[i].programId === programId)
                    pcb = this.processList[i];
            }
            return pcb;
        }

        public getPCBbyParition(memoryIndex: number) {
            var pcb: PCB;
            // Retrieve the PCB at the specified partition
            for (var i: number = 0; i < this.processList.length; i++) {
                if (this.processList[i].memoryIndex === memoryIndex)
                    pcb = this.processList[i]
            }
            return pcb;
        }

        public removePCB(programId: number): void {
            // Find the PCB with the programId and remove it from the processList
            for (var i: number = 0; i < this.processList.length; i++) {
                if (this.processList[i].programId === programId) {
                    this.processList.splice(i, 1);
                }
            }
        }

        public removePCBFromReadyQueue(programId: number): void {
            // FInd the PCB with the programId and remove it from the readyQueue
            for (var i: number = 0; i < this.readyQueue.q.length; i++) {
                if (this.readyQueue.q[i].programId === programId) {
                    this.readyQueue.q.splice(i, 1);
                }
            } 
        }
    }
} 