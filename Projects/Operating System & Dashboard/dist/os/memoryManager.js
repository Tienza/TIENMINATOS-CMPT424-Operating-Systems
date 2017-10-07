///<reference path="../globals.ts" />
/* ------------
    memoryManager.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(partition) {
            if (partition === void 0) { partition = [{ isFree: true, memory: _Memory.memory0, memoryIndex: 0 }, { isFree: true, memory: _Memory.memory1, memoryIndex: 1 }, { isFree: true, memory: _Memory.memory2, memoryIndex: 2 }]; }
            this.partition = partition;
        }
        MemoryManager.prototype.loadProgram = function (userProgram, pcb) {
            var freePartition = this.checkFreePartition();
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
                console.log("_Memory Partition " + freePartition.memoryIndex + " is Free: " + freePartition.isFree);
                _Memory.showAllPartitions();
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
            _Memory.memoryArray[memoryIndex][memoryLoc] = val;
        };
        MemoryManager.prototype.wipeParition = function (memoryIndex) {
            _Memory.wipeMemory(memoryIndex);
        };
        MemoryManager.prototype.freePartition = function (memoryIndex) {
            this.partition[memoryIndex].isFree = true;
        };
        MemoryManager.prototype.showAllPartitions = function () {
            _Memory.showAllPartitions();
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
