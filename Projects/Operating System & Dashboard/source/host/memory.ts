///<reference path="../globals.ts" />

/* ------------
    memory.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class Memory {

        constructor(public size: number = _MemorySize,
                    public singleMemSize: number = _SegmentSize,
                    public memory0: string[] = [],
                    public memory1: string[] = [],
                    public memory2: string[] = []) {
        }

        public memoryArray = [this.memory0, this.memory1, this.memory2];

        public init(): void {
            this.wipeMemoryAll();
        }

        public wipeMemoryAll(): void {
            for (var i: number = 0; i < this.singleMemSize; i++) {
                this.memory0[i] = "00";
                this.memory1[i] = "00";
                this.memory2[i] = "00";
            }
        }

        public wipeMemory(memoryIndex: number): void {
            for (var i: number = 0; i < this.singleMemSize; i++) {
                this.memoryArray[memoryIndex][i] = "00";
            }
        }

        public showAllPartitions(): void {
            console.log("Memory0", this.memoryArray[0]);
            console.log("Memory1", this.memoryArray[1]);
            console.log("Memory2", this.memoryArray[2]);
        }
    }
} 