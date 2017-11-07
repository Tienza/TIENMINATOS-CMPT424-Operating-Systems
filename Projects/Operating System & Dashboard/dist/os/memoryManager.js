///<reference path="../globals.ts" />
/* ------------
    memoryManager.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(partitions) {
            if (partitions === void 0) { partitions = [
                { isFree: true, memoryIndex: 0, displayId: "#memory0Display", base: 0, limit: 255 },
                { isFree: true, memoryIndex: 1, displayId: "#memory1Display", base: 256, limit: 511 },
                { isFree: true, memoryIndex: 2, displayId: "#memory2Display", base: 512, limit: 767 }
            ]; }
            this.partitions = partitions;
        }
        MemoryManager.prototype.init = function () {
            this.wipeAllPartitions();
        };
        MemoryManager.prototype.loadProgram = function (userProgram, pcb) {
            var freePartition = this.checkFreePartition();
            if (freePartition.isFree !== undefined) {
                // Operate on the partition returned
                freePartition.isFree = false;
                // Load the process in to the memory partition returned
                _Memory.memoryArray[freePartition.memoryIndex] = userProgram;
                // Record which memory index the process was loaded into
                pcb.memoryIndex = freePartition.memoryIndex;
                // Update the current instruction to the first instruction available for that memory block
                pcb.instruction = _MemoryAccessor.readFromMemory(pcb.memoryIndex, pcb.PC).toUpperCase();
                // Store in the process list
                _ProcessManager.processList.push(pcb);
                // Predict the bust time
                pcb.predictedBurstTime = _Scheduler.removeAllZeros(userProgram).length + _Scheduler.addWeightedD0(userProgram);
                // Update the Memory Display
                TSOS.Control.updateMemoryDisplay(freePartition.memoryIndex);
                // Update the Process Display
                TSOS.Control.initializeProcessDisplay(pcb);
                // Print updated memory status
                console.log("_Memory Partition: " + freePartition.memoryIndex);
                console.log("_Memory Partition " + freePartition.memoryIndex + " is Free: " + freePartition.isFree);
                this.showAllPartitions();
                // Output PID to canvas
                _StdOut.putText("Program Loaded Successfully. PID: " + pcb.programId);
            }
            else {
                _StdOut.putText("Memory partitions are full");
            }
        };
        MemoryManager.prototype.wipeParition = function (memoryIndex) {
            for (var i = 0; i < _Memory.singleMemSize; i++) {
                _Memory.memoryArray[memoryIndex][i] = "00";
            }
        };
        MemoryManager.prototype.wipeAllPartitions = function () {
            // Zero fill all partitions
            for (var i = 0; i < _Memory.singleMemSize; i++) {
                _Memory.memoryArray[0][i] = "00";
                _Memory.memoryArray[1][i] = "00";
                _Memory.memoryArray[2][i] = "00";
            }
            // Remove all associated process displays
            for (var i = 0; i < _ProcessManager.processList.length; i++) {
                TSOS.Control.removeProcessDisplay(_ProcessManager.processList[i].programId);
            }
            _ProcessManager.processList = [];
            // Free all partitions
            this.freeAllPartitions();
        };
        MemoryManager.prototype.freePartition = function (memoryIndex) {
            this.partitions[memoryIndex].isFree = true;
        };
        MemoryManager.prototype.freeAllPartitions = function () {
            this.freePartition(0);
            this.freePartition(1);
            this.freePartition(2);
        };
        MemoryManager.prototype.showAllPartitions = function () {
            console.log("Memory0", _Memory.memoryArray[0]);
            console.log("Memory1", _Memory.memoryArray[1]);
            console.log("Memory2", _Memory.memoryArray[2]);
        };
        MemoryManager.prototype.checkFreePartition = function () {
            var freePartition = {};
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isFree === true) {
                    freePartition = this.partitions[i];
                    break;
                }
            }
            return freePartition;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
