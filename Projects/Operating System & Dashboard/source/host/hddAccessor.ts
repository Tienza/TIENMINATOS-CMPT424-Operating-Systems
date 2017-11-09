///<reference path="../globals.ts" />

/* ------------
    memoryAccessor.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class HDDAccessor {

        constructor() {}

        public getTSB(track: any, sector: any, block: any): string {
            return track + "," + sector + "," + block;
        }

        public readFromHDD(trackSectorBranch: string): string {
            return _HDD.storage.getItem(trackSectorBranch);
        }

        public writeToHDD(trackSectorBranch: string, bytes: string): void {
            return _HDD.storage.setItem(trackSectorBranch, bytes);
        }
    }
} 