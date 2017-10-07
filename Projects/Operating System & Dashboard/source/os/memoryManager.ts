///<reference path="../globals.ts" />

/* ------------
    memoryManager.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class MemoryManager {

        constructor(public partition: {[key: string]: any}[] = [{isFree: true, memory: _Memory.memory0, memoryIndex: 0}, {isFree: true, memory: _Memory.memory1, memoryIndex: 1}, {isFree: true, memory: _Memory.memory2, memoryIndex: 2}]) {
        }

        public loadProgram(userProgram: string[], pcb: PCB) {
            var freePartition: {[key: string]: any} = this.checkFreePartition();
            
            if (freePartition.isFree !== undefined) {
                // Operate on the partition returned
                freePartition.isFree = false;
                // Load the process in to the memory partition returned
                _Memory.memoryArray[freePartition.memoryIndex] = userProgram;
                // Record which memory index the process was loaded into
                pcb.memoryIndex = freePartition.memoryIndex;
                // Update the current instruction to the first instruction available for that memeory block
                pcb.instruction = _MemoryManager.readFromMemory(pcb.memoryIndex, pcb.PC);
                // Store in the process list
                _ProcessManager.processList.push(pcb);
                // Print updated memory status
                console.log("_Memory Partition: " + freePartition.memoryIndex);
                console.log("_Memory Partition " + freePartition.memoryIndex + " is Free: " + freePartition.isFree)
                _Memory.showAllPartitions();
                // console.log("PCBList", _ProcessManager.processList);
                // Output PID to canvas
                _StdOut.putText("Program Loaded Successfully. PID: " + pcb.programId);
            }
            else {
                _StdOut.putText("Memory partitions are full");
            }
        }

        public readFromMemory(memoryIndex: number, PC: number): string {
            return _Memory.memoryArray[memoryIndex][PC];
        }

        public writeToMemory(memoryIndex: number, memoryLoc: number, val: string): void {
            _Memory.memoryArray[memoryIndex][memoryLoc] = val;
        }

        public wipeParition(memoryIndex: number): void {
            _Memory.wipeMemory(memoryIndex);
        }

        public freePartition(memoryIndex: number): void {
            this.partition[memoryIndex].isFree = true;
        }

        public showAllPartitions() {
            _Memory.showAllPartitions();
        }

        public checkFreePartition(): {[key: string]: any} {
            var freePartition: {[key: string]: any} = {};

            for (var i: number = 0; i < this.partition.length; i++) {
                if (this.partition[i].isFree === true) {
                    freePartition = this.partition[i];
                    break;
                }
            }

            return freePartition;
        }
    }
} 