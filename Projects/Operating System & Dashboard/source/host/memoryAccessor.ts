///<reference path="../globals.ts" />

/* ------------
    memoryAccessor.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class MemoryAccessor {

        constructor() {}

        public readFromMemory(memoryIndex: number, PC: number): string {
            return _Memory.memoryArray[memoryIndex][PC];
        }
        
        public writeToMemory(memoryIndex: number, memoryLoc: number, val: string): boolean {
            var status: boolean = false;
            // Check to see if memory location is still in scope, if not terminate the process
            if (memoryLoc < _SegmentSize) {
                // Write to Memory
                _Memory.memoryArray[memoryIndex][memoryLoc] = val;
                // Update the Memory Display
                var id: string = "#memory-cell-" + (memoryLoc + _MemoryManager.partitions[memoryIndex].base);
                $(id).html(val);
                $(id).attr('class', 'writeToLoc');
                // Set status of write success to true
                status = true;
            }

            return status;
        }

        public fetchCodeFromMemory(memoryIndex: number): string[] {
            return _Memory.memoryArray[memoryIndex];
        }
    }
} 