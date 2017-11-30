///<reference path="../globals.ts" />

/* ------------
    hdd.ts

    Requires global.ts.
------------ */

module TSOS {
    
    export class HDD {

        constructor(public tracks: number = 3,
                    public sectors: number = 7,
                    public blocks: number = 7,
                    public bytes: number = 64,
                    public blockSize: number = 60,
                    public storage: Storage = sessionStorage,
                    public isFormatted: boolean = false,
                    public hddRecovery: {[key: string]: any}[] = []) {
        }

        public init() {
            this.storage.clear();
            for (var track: number = 0; track <= this.tracks; track++) {
                for (var sector: number = 0; sector <= this.sectors; sector++) {
                    for (var block: number = 0; block <= this.blocks; block++) {
                        var bytes: string = "";
                        if (track === 0 && sector === 0 && block === 0) {
                            bytes += "001100"; // Set first available dir entry and file entry (0,0,1 and 1,0,0) for MBR
                            for (var i = 0; i < this.bytes - 6; i++)
                                bytes += 0; // set rest to 0
                        }
                        else {
                            for (var i = 0; i < this.bytes; i++)
                                bytes += 0;
                        }
                        this.storage.setItem(_HDDAccessor.getTSB(track, sector, block), bytes); // Set everything to 0
                    }
                }
            }
            this.isFormatted = true;
        }
    }
} 