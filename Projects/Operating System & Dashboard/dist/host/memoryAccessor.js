///<reference path="../globals.ts" />
/* ------------
    memoryAccessor.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.readFromMemory = function (memoryIndex, PC) {
            return _Memory.memoryArray[memoryIndex][PC];
        };
        MemoryAccessor.prototype.writeToMemory = function (memoryIndex, memoryLoc, val) {
            var status = false;
            // Check to see if memory location is still in scope, if not terminate the process
            if (memoryLoc < _SegmentSize) {
                // Write to Memory
                _Memory.memoryArray[memoryIndex][memoryLoc] = val;
                // Update the Memory Display
                var id = "#memory-cell-" + (memoryLoc + _MemoryManager.partitions[memoryIndex].base);
                $(id).html(val);
                $(id).attr('class', 'writeToLoc');
                // Set status of write success to true
                status = true;
            }
            return status;
        };
        MemoryAccessor.prototype.fetchCodeFromMemory = function (memoryIndex) {
            return _Memory.memoryArray[memoryIndex];
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
