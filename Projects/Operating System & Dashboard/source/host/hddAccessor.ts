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

        public writeToHDD(trackSectorBlock: string, bytes: string): void {
            Control.updateHDDDisplay(trackSectorBlock, bytes);
            return _HDD.storage.setItem(trackSectorBlock, bytes);
        }
    }
} 