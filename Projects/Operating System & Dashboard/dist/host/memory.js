///<reference path="../globals.ts" />
/* ------------
    memory.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(size, singleMemSize, memory0, memory1, memory2) {
            if (size === void 0) { size = _MemorySize; }
            if (singleMemSize === void 0) { singleMemSize = _SegmentSize; }
            if (memory0 === void 0) { memory0 = []; }
            if (memory1 === void 0) { memory1 = []; }
            if (memory2 === void 0) { memory2 = []; }
            this.size = size;
            this.singleMemSize = singleMemSize;
            this.memory0 = memory0;
            this.memory1 = memory1;
            this.memory2 = memory2;
            this.memoryArray = [this.memory0, this.memory1, this.memory2];
        }
        Memory.prototype.init = function () {
            this.wipeMemory();
        };
        Memory.prototype.wipeMemory = function () {
            for (var i = 0; i < this.singleMemSize; i++) {
                this.memory0[i] = "00";
                this.memory1[i] = "00";
                this.memory2[i] = "00";
            }
        };
        Memory.prototype.showAllPartitions = function () {
            console.log("Memory0", this.memoryArray[0]);
            console.log("Memory1", this.memoryArray[1]);
            console.log("Memory2", this.memoryArray[2]);
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
