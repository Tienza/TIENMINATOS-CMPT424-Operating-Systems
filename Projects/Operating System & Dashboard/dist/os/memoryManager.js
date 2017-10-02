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
                // Operate on the parition returned
                freePartition.isFree = false;
                freePartition.memory = userProgram;
                _Memory.memoryArray[freePartition.memoryIndex] = userProgram;
                _PCBList.push(pcb);
                // Print updated memory status
                console.log("_Memory Partition: " + freePartition.memoryIndex);
                console.log("_Memory Partition " + freePartition.memoryIndex + " is Free: " + freePartition.isFree);
                _Memory.showAllPartitions();
                console.log("PCBList", _PCBList);
            }
            else {
                console.log("Memory partitions are full");
            }
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
