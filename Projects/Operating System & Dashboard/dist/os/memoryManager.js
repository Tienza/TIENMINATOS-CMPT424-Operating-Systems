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
                { isFree: true, memory: _Memory.memory0, memoryIndex: 0, displayId: "#memory0Display", startIndex: 0 },
                { isFree: true, memory: _Memory.memory1, memoryIndex: 1, displayId: "#memory1Display", startIndex: 256 },
                { isFree: true, memory: _Memory.memory2, memoryIndex: 2, displayId: "#memory2Display", startIndex: 512 }
            ]; }
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
                // Update the current instruction to the first instruction available for that memory block
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
            var status = false;
            // Check to see if memory location is still in scope, if not terminate the process
            if (memoryLoc < _SegmentSize - 1) {
                _Memory.memoryArray[memoryIndex][memoryLoc] = val;
                status = true;
            }
            return status;
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
        MemoryManager.prototype.initializeMemoryDisplay = function () {
            for (var par = 0; par < this.partition.length; par++) {
                var workingPartition = this.partition[par];
                var memoryPartition = chunkArray(workingPartition.memory, 8);
                var memory0Display = "";
                var subPartitionCounter = -1;
                var memoryIndex = workingPartition.startIndex;
                for (var i = 0; i < _SegmentSize; i++) {
                    if (i % 8 === 0) {
                        subPartitionCounter++;
                        var memoryLoc = memoryIndex.toString(16);
                        if (memoryLoc.length < 3) {
                            for (var j = memoryLoc.length; j < 3; j++) {
                                memoryLoc = "0" + memoryLoc;
                            }
                        }
                        memoryLoc = "0x" + memoryLoc.toUpperCase();
                        memory0Display += "<tr>";
                        memory0Display += "<td>" + memoryLoc + "</td>";
                        for (var k = 0; k < memoryPartition[subPartitionCounter].length; k++) {
                            memory0Display += "<td>" + memoryPartition[subPartitionCounter][k] + "</td>";
                        }
                        memory0Display += "</tr>";
                        memoryIndex += 8;
                    }
                }
                $(workingPartition.displayId).html(memory0Display);
            }
            // Function to break array into equal chunks
            function chunkArray(myArray, chunk_size) {
                var index = 0;
                var arrayLength = myArray.length;
                var tempArray = [];
                for (index = 0; index < arrayLength; index += chunk_size) {
                    var myChunk = myArray.slice(index, index + chunk_size);
                    // Do something if you want with the group
                    tempArray.push(myChunk);
                }
                return tempArray;
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
