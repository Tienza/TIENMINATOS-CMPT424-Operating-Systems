///<reference path="../globals.ts" />

/* ------------
    memoryManager.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class MemoryManager {

        constructor(public partition: {[key: string]: any}[] = [
            {isFree: true, memory: _Memory.memory0, memoryIndex: 0, displayId: "#memory0Display", startIndex: 0}, 
            {isFree: true, memory: _Memory.memory1, memoryIndex: 1, displayId: "#memory1Display", startIndex: 256}, 
            {isFree: true, memory: _Memory.memory2, memoryIndex: 2, displayId: "#memory2Display", startIndex: 512}]) {
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
                // Update the current instruction to the first instruction available for that memory block
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

        public writeToMemory(memoryIndex: number, memoryLoc: number, val: string): boolean {
            var status: boolean = false;

            // Check to see if memory location is still in scope, if not terminate the process
            if (memoryLoc < _SegmentSize - 1) {
                _Memory.memoryArray[memoryIndex][memoryLoc] = val;
                status = true;
            }

            return status;
        }

        public wipeParition(memoryIndex: number): void {
            _Memory.wipeMemory(memoryIndex);
        }

        public freePartition(memoryIndex: number): void {
            this.partition[memoryIndex].isFree = true;
        }

        public showAllPartitions(): void {
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

        public initializeMemoryDisplay() {
            for (var par: number = 0; par < this.partition.length; par++) {
                var workingPartition = this.partition[par];
                var memoryPartition = chunkArray(workingPartition.memory, 8);
                var memory0Display: string = "";
                var subPartitionCounter: number = -1;
                var memoryIndex: number = workingPartition.startIndex;
                for (var i: number = 0; i < _SegmentSize; i++) {
                    if (i % 8 === 0) {
                        subPartitionCounter++;
                        var memoryLoc = memoryIndex.toString(16);
                        if (memoryLoc.length < 3) {
                            for (var j: number = memoryLoc.length; j < 3; j++) {
                                memoryLoc = "0" + memoryLoc;
                            }
                        }
                        memoryLoc = "0x" + memoryLoc.toUpperCase();
                        memory0Display += "<tr>";
                        memory0Display += "<td>" + memoryLoc + "</td>";
                        for (var k: number = 0; k < memoryPartition[subPartitionCounter].length; k++) {
                            memory0Display += "<td>" + memoryPartition[subPartitionCounter][k] + "</td>";
                        }
                        memory0Display += "</tr>";
                        memoryIndex += 8;
                    }
                }
                $(workingPartition.displayId).html(memory0Display);
            }

            // Function to break array into equal chunks
            function chunkArray(myArray, chunk_size){
                var index = 0;
                var arrayLength = myArray.length;
                var tempArray = [];
                
                for (index = 0; index < arrayLength; index += chunk_size) {
                    var myChunk = myArray.slice(index, index+chunk_size);
                    // Do something if you want with the group
                    tempArray.push(myChunk);
                }
            
                return tempArray;
            }
        }
    }
} 