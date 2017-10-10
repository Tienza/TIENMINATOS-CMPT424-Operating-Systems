///<reference path="../globals.ts" />

/* ------------
    memoryManager.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class MemoryManager {

        constructor(public partition: {[key: string]: any}[] = [
            {isFree: true, memoryIndex: 0, displayId: "#memory0Display", startIndex: 0}, 
            {isFree: true, memoryIndex: 1, displayId: "#memory1Display", startIndex: 256}, 
            {isFree: true, memoryIndex: 2, displayId: "#memory2Display", startIndex: 512}]) {
        }

        public loadProgram(userProgram: string[], pcb: PCB): void {
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
                // Update the Memory Display
                this.updateMemoryDisplay(freePartition.memoryIndex);
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

        public initializeMemoryDisplay(): void {
            for (var par: number = 0; par < this.partition.length; par++) {
                var workingPartition = this.partition[par];
                var memoryPartition = this.chunkPartition(_Memory.memoryArray[workingPartition.memoryIndex], 8);
                var memory0Display: string = "";
                var subPartitionCounter: number = -1;
                var workingSegment: number = workingPartition.startIndex;
                for (var i: number = 0; i < _SegmentSize; i++) {
                    if (i % 8 === 0) {
                        subPartitionCounter++;
                        var memoryLoc = workingSegment.toString(16);
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
                        workingSegment += 8;
                    }
                }
                $(workingPartition.displayId).html(memory0Display);
            }
        }

        public updateMemoryDisplay(memoryIndex: number): void {
            var workingPartition = this.partition[memoryIndex];
            var memoryPartition = this.chunkPartition(_Memory.memoryArray[memoryIndex], 8);
            var memory0Display: string = "";
            var subPartitionCounter: number = -1;
            var workingSegment: number = workingPartition.startIndex;
            var workingIndex: number = workingPartition.startIndex;
            for (var i: number = 0; i < _SegmentSize; i++) {
                if (i % 8 === 0) {
                    subPartitionCounter++;
                    var memoryLoc = workingSegment.toString(16);
                    if (memoryLoc.length < 3) {
                        for (var j: number = memoryLoc.length; j < 3; j++) {
                            memoryLoc = "0" + memoryLoc;
                        }
                    }
                    memoryLoc = "0x" + memoryLoc.toUpperCase();
                    memory0Display += "<tr id=\"memory-row-" + workingSegment + "\">";
                    memory0Display += "<td>" + memoryLoc + "</td>";
                    for (var k: number = 0; k < memoryPartition[subPartitionCounter].length; k++) {
                        memory0Display += "<td id=\"memory-cell-" + workingIndex + "\">" + memoryPartition[subPartitionCounter][k] + "</td>";
                        workingIndex++;
                    }
                    memory0Display += "</tr>";
                    workingSegment += 8;
                }
            }
            $(workingPartition.displayId).html(memory0Display);
        }

        public chunkPartition(myArray, chunk_size): any[] {
            var index: number = 0;
            var arrayLength: number = myArray.length;
            var tempArray: any[] = [];
            
            for (index = 0; index < arrayLength; index += chunk_size) {
                var myChunk: any = myArray.slice(index, index+chunk_size);
                // Do something if you want with the group
                tempArray.push(myChunk);
            }
        
            return tempArray;
        }

        public highlightMemory(memoryIndex: number, PC: number) {
            var id: string = "#memory-cell-" + PC;
            var id2: string = "#memory-cell-" + (PC + 1);

            $(id).attr('class', 'currentOp');
            $(id2).attr('class', 'currentOpNext');
        }

        public unhighlightAll(): void {
            for (var i: number = 0; i < _MemorySize; i++) {
                var id: string = "#memory-cell-" + i;
                $(id).attr('class', '""');
            }
        }
    }
} 