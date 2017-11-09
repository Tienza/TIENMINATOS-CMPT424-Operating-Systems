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

        public memoryArray: any[] = [this.memory0, this.memory1, this.memory2];
    }
} 