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

        public removeFromRecovery(fileName: string): void {
            for (var i: number = 0; i < _HDD.hddRecovery.length; i++) {
                if (_HDD.hddRecovery[i].fileName === fileName)
                    _HDD.hddRecovery.splice(i, 1);
            }
        }
    }
} 