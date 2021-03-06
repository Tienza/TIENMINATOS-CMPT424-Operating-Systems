///<reference path="../globals.ts" />

/* ------------
    memoryManager.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class MemoryManager {

        constructor(public partitions: {[key: string]: any}[] = [
            {isFree: true, memoryIndex: 0, displayId: "#memory0Display", base: 0, limit: 255}, 
            {isFree: true, memoryIndex: 1, displayId: "#memory1Display", base: 256, limit: 511}, 
            {isFree: true, memoryIndex: 2, displayId: "#memory2Display", base: 512, limit: 767}]) {
        }

        public init(): void {
            this.wipeAllPartitions();
        }

        public loadProgram(pcb: PCB, userProgram: string[]): void {
            var freePartition: {[key: string]: any} = this.checkFreePartition();
            
            if (freePartition.isFree !== undefined) {
                // Operate on the partition returned
                freePartition.isFree = false;
                // Load the process in to the memory partition returned
                _Memory.memoryArray[freePartition.memoryIndex] = userProgram;
                // Record which memory index the process was loaded into
                pcb.memoryIndex = freePartition.memoryIndex;
                // Update the current instruction to the first instruction available for that memory block
                pcb.instruction = _MemoryAccessor.readFromMemory(pcb.memoryIndex, pcb.PC).toUpperCase();
                // Update the current location of the PCB to Memory
                pcb.location = _ProcessManager.processLocations.memory;
                // Predict the bust time
                pcb.predictedBurstTime = _Scheduler.removeAllZeros(userProgram).length + _Scheduler.addWeightedD0(userProgram);
                // Store in the process list
                _ProcessManager.processList.push(pcb);
                // Update the Memory Display
                Control.updateMemoryDisplay(freePartition.memoryIndex);
                // Update the Process Display
                Control.initializeProcessDisplay(pcb);
                /*// Print updated memory status
                console.log("_Memory Partition: " + freePartition.memoryIndex);
                console.log("_Memory Partition " + freePartition.memoryIndex + " is Free: " + freePartition.isFree)
                this.showAllPartitions();*/
                // Output PID to canvas
                _StdOut.printLongText("Program Loaded Successfully Into Memory. PID: " + pcb.programId);
            }
            else if (_HDD.isFormatted) {
                // Update the current instruction to the first instruction available for that memory block
                pcb.instruction = userProgram[0];
                // Update the current location of hte PCB to HDD
                pcb.location = _ProcessManager.processLocations.hdd;
                // Predict the bust time
                pcb.predictedBurstTime = _Scheduler.removeAllZeros(userProgram).length + _Scheduler.addWeightedD0(userProgram);
                // Store in the process list
                _ProcessManager.processList.push(pcb);
                // Update the Process Display
                Control.initializeProcessDisplay(pcb);
                // Roll Out to the HDD
                _krnFileSystemDriver.rollOut(pcb.programId, userProgram);
                // Output PID to canvas
                _StdOut.printLongText("Program Loaded Successfully Into HDD. PID: " + pcb.programId);
            }
            else {
                _StdOut.putText("Memory partitions are full");
                // Visual Feedback
                Control.shakeOS();
            }
        }

        public loadProgramFromHDD(pcb: PCB, userProgram: string[]) {
            var freePartition: {[key: string]: any} = this.checkFreePartition();

            if (freePartition.isFree !== undefined) {
                // Operate on the partition returned
                freePartition.isFree = false;
                // Load the process in to the memory partition returned
                _Memory.memoryArray[freePartition.memoryIndex] = userProgram;
                // Record which memory index the process was loaded into
                pcb.memoryIndex = freePartition.memoryIndex;
                // Update the current location of the PCB to Memory
                pcb.location = _ProcessManager.processLocations.memory;
                // Update the Memory Display
                Control.updateMemoryDisplay(freePartition.memoryIndex);
                // Update the Process Display
                Control.updateProcessDisplay(pcb);
                /*// Print updated memory status
                console.log("_Memory Partition: " + freePartition.memoryIndex);
                console.log("_Memory Partition " + freePartition.memoryIndex + " is Free: " + freePartition.isFree)
                this.showAllPartitions();*/
            }
            else {
                _StdOut.putText("Memory partitions are full");
            }
        }

        public wipeParition(memoryIndex: number): void {
            for (var i: number = 0; i < _Memory.singleMemSize; i++) {
                _Memory.memoryArray[memoryIndex][i] = "00";
            }
        }

        public wipeAllPartitions(): void {
            // Zero fill all partitions
            for (var i: number = 0; i < _Memory.singleMemSize; i++) {
                _Memory.memoryArray[0][i] = "00";
                _Memory.memoryArray[1][i] = "00";
                _Memory.memoryArray[2][i] = "00";
            }
            
            // Remove all associated process displays
            for (var i: number = 0; i < _ProcessManager.processList.length; i++) {
                Control.removeProcessDisplay(_ProcessManager.processList[i].programId);
            }
            _ProcessManager.processList = [];

            // Free all partitions
            this.freeAllPartitions();
        }

        public freePartition(memoryIndex: number): void {
            this.partitions[memoryIndex].isFree = true;
        }

        public freeAllPartitions() {
            this.freePartition(0);
            this.freePartition(1);
            this.freePartition(2);
        }

        public showAllPartitions(): void {
            console.log("Memory0", _Memory.memoryArray[0]);
            console.log("Memory1", _Memory.memoryArray[1]);
            console.log("Memory2", _Memory.memoryArray[2]);
        }

        public checkFreePartition(): {[key: string]: any} {
            var freePartition: {[key: string]: any} = {};

            for (var i: number = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isFree === true) {
                    freePartition = this.partitions[i];
                    break;
                }
            }

            return freePartition;
        }
    }
} 