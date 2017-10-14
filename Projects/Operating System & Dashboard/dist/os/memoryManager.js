///<reference path="../globals.ts" />
/* ------------
    memoryManager.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(partition) {
            if (partition === void 0) { partition = [
                { isFree: true, memoryIndex: 0, displayId: "#memory0Display", startIndex: 0 },
                { isFree: true, memoryIndex: 1, displayId: "#memory1Display", startIndex: 256 },
                { isFree: true, memoryIndex: 2, displayId: "#memory2Display", startIndex: 512 }
            ]; }
            this.partition = partition;
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
                pcb.instruction = _MemoryManager.readFromMemory(pcb.memoryIndex, pcb.PC);
                // Store in the process list
                _ProcessManager.processList.push(pcb);
                // Update the Memory Display
                TSOS.Control.updateMemoryDisplay(freePartition.memoryIndex);
                // Update the Process Display
                TSOS.Control.initializeProcessDisplay(pcb);
                // Print updated memory status
                console.log("_Memory Partition: " + freePartition.memoryIndex);
                console.log("_Memory Partition " + freePartition.memoryIndex + " is Free: " + freePartition.isFree);
                this.showAllPartitions();
                // console.log("PCBList", _ProcessManager.processList);
                // Output PID to canvas
                _StdOut.putText("Program Loaded Successfully. PID: " + pcb.programId);
            }
            else {
                _StdOut.putText("Memory partitions are full");
            }
        };
        MemoryManager.prototype.readFromMemory = function (memoryIndex, PC) {
            return _Memory.memoryArray[memoryIndex][PC];
        };
        MemoryManager.prototype.writeToMemory = function (memoryIndex, memoryLoc, val) {
            var status = false;
            // Check to see if memory location is still in scope, if not terminate the process
            if (memoryLoc <= _SegmentSize - 1) {
                // Write to Memory
                _Memory.memoryArray[memoryIndex][memoryLoc] = val;
                // Update the Memory Display
                var id = "#memory-cell-" + (memoryLoc + this.partition[memoryIndex].startIndex);
                $(id).html(val);
                // Set status of write success to true
                status = true;
            }
            return status;
        };
        MemoryManager.prototype.wipeParition = function (memoryIndex) {
            for (var i = 0; i < _Memory.singleMemSize; i++) {
                _Memory.memoryArray[memoryIndex][i] = "00";
            }
        };
        MemoryManager.prototype.wipeAllPartitions = function () {
            for (var i = 0; i < _Memory.singleMemSize; i++) {
                _Memory.memory0[i] = "00";
                _Memory.memory1[i] = "00";
                _Memory.memory2[i] = "00";
            }
        };
        MemoryManager.prototype.freePartition = function (memoryIndex) {
            this.partition[memoryIndex].isFree = true;
        };
        MemoryManager.prototype.showAllPartitions = function () {
            console.log("Memory0", _Memory.memoryArray[0]);
            console.log("Memory1", _Memory.memoryArray[1]);
            console.log("Memory2", _Memory.memoryArray[2]);
        };
        MemoryManager.prototype.checkFreePartition = function () {
            var freePartition = {};
            for (var i = 0; i < this.partition.length; i++) {
                if (this.partition[i].isFree === true) {
                    freePartition = this.partition[i];
                    break;
                }
            }
            return freePartition;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
