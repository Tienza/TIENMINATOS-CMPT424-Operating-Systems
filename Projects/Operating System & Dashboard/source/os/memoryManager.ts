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
                // Operate on the parition returned
                freePartition.isFree = false;
                freePartition.memory = userProgram;
                _Memory.memoryArray[freePartition.memoryIndex] = userProgram;
                _PCBList.push(pcb);
                // Print updated memory status
                console.log("_Memory Partition: " + freePartition.memoryIndex);
                console.log("_Memory Partition " + freePartition.memoryIndex + " is Free: " + freePartition.isFree)
                _Memory.showAllPartitions();
                console.log("PCBList", _PCBList);
            }
            else {
                console.log("Memory partitions are full")
            }
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