///<reference path="../globals.ts" />

/* ------------
    processManager.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class ProcessManager {

        constructor(public processList: PCB[] = [],
                    public terminatedList: PCB[] = [],
                    public readyQueue = new Queue()) {
        }

        public currentPCB: TSOS.PCB;

        public processStates: {[key: string]: any} = {
            "new": "New",
            "ready": "Ready",
            "running": "Running",
            "terminated": "Terminated"
        }
         
        public runProcess(pcb: PCB): void {
            // Set PCB state to running
            pcb.state = this.processStates.running;
            // Update _ProcessManager and CPU
            this.currentPCB = pcb;
            _CPU.updateCPU();
            _CPU.isExecuting = true;
        }

        public runAllProcess(): void {
            for (var i: number = 0; i < this.processList.length; i++) {
                var pcb: PCB = this.processList[i];
                if (pcb.state === this.processStates.new) {
                    pcb.state = this.processStates.ready;
                    this.readyQueue.enqueue(pcb);
                }
            }
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
                _StdOut.advanceLine();
                _StdOut.putText("~~~~~~~~~~~~~~~~~~~~~");
                for (var i: number = 0; i < this.terminatedList.length; i++) {
                    var pcb: PCB = this.terminatedList[i];
                    _StdOut.advanceLine();
                    _StdOut.putText("PID: " + pcb.programId);
                    _StdOut.advanceLine();
                    _StdOut.putText("Wait Time: " + pcb.waitTime + " cycles");
                    _StdOut.advanceLine();
                    _StdOut.putText("Turn Around Time: " + pcb.turnAroundTime + " cycles");
                    _StdOut.advanceLine();
                    _StdOut.putText("~~~~~~~~~~~~~~~~~~~~~");
                }
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

        public getPCB(programId): PCB {
            var pcb

            // Retrieve the PCB specified by the user
            for (var i: number = 0; i < this.processList.length; i++) {
                if (this.processList[i].programId === programId)
                    pcb = this.processList[i];
            }

            return pcb;
        }

        public removePCB(programId): void {
            // Find the PCB with the programId and remove it from the processList
            for (var i: number = 0; i < this.processList.length; i++) {
                if (this.processList[i].programId === programId) {
                    this.processList.splice(i, 1);
                }
            }
        }
    }
} 