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
         
        public runProcess(pcb) {
            this.currentPCB = pcb;
            _CPU.updateCPU();
            _CPU.isExecuting = true;
        }

        public fetchInstruction(pcb: PCB, PC: number): string {
            return _MemoryManager.readFromMemory(pcb.memoryIndex, PC);
        }

        public writeInstruction(pcb: PCB, memoryLoc: number, val: string): void {
            _MemoryManager.writeToMemory(pcb.memoryIndex, memoryLoc, val);
        }

        public terminateProcess(pcb: PCB) {
            // Wipe the associated memory partition
            _MemoryManager.wipeParition(pcb.memoryIndex);
            // Free the associated memory partition
            _MemoryManager.freePartition(pcb.memoryIndex);
            // Toggle CPU execution off
            _CPU.isExecuting = false;
            _MemoryManager.showAllPartitions();
        }

        public getPCB(programId) {
            var pcb

            // Retrieve the PCB specified by the user
            for (var i: number = 0; i < this.processList.length; i++) {
                if (this.processList[i].programId === programId)
                    pcb = this.processList[i];
            }

            return pcb;
        }
    }
} 