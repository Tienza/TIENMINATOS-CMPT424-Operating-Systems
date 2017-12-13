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

        public fullFormat(): void {
            _HDD.hddRecovery = [];
            _HDD.init();
            Control.initializeHDDDisplay();
            // Print confirmation message
            _StdOut.printLongText("Hard Drive fully formatted, no recovery possible");
        }

        public quickFormat(): void {
            // Available Tracks
            var trackArray: string[] = ["0", "1", "2", "3"];
            // Delete all files on the HDD and store in recovery
            _krnFileSystemDriver.moveFilesToRecovery();
            // Initialize the first 4 bytes of each TSB
            for (var TSB in _HDD.storage) {
                if (trackArray.indexOf(TSB[0]) > -1) {
                    var quickFormatString: string = _krnFileSystemDriver.getVal(_HDDAccessor.readFromHDD(TSB));
                    quickFormatString = "0000" + quickFormatString;
                    _HDDAccessor.writeToHDD(TSB, quickFormatString);
                }
            }
            // Update the Master Boot Record
            _krnFileSystemDriver.alterNextDirLoc();
            _krnFileSystemDriver.alterNextFileLoc();
            // Print confirmation message
            _StdOut.putText("Quick format complete");
        }
    }
} 