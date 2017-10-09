///<reference path="../globals.ts" />

/* ------------
    processManager.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class ProcessManager {

        constructor(public processList: {[key: string]: any}[] = []) {
        }

        public currentPCB: TSOS.PCB;
         
        public runProcess(pcb): void {
            this.currentPCB = pcb;
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
                _StdOut.putText("Memory Access Violation! Terminating Process " + pcb.programId);
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
            // Toggle CPU execution off
            _CPU.isExecuting = false;
            // Show Memory Partitions
            _MemoryManager.showAllPartitions();
            // Break Line
            _StdOut.advanceLine();
            // Insert the prompt
            _OsShell.putPrompt();
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