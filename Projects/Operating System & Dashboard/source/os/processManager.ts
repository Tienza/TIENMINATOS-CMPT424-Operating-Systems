///<reference path="../globals.ts" />

/* ------------
    processManager.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class ProcessManager {

        constructor(public processList: PCB[] = [],
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
            return _MemoryManager.readFromMemory(pcb.memoryIndex, PC);
        }

        public writeInstruction(pcb: PCB, memoryLoc: number, val: string): void {
            var writeSuccess: boolean = _MemoryManager.writeToMemory(pcb.memoryIndex, memoryLoc, val);

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
            // Wipe the associated memory partition
            _MemoryManager.wipeParition(pcb.memoryIndex);
            // Free the associated memory partition
            _MemoryManager.freePartition(pcb.memoryIndex);
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