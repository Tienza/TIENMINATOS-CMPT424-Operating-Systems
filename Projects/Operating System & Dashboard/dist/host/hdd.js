///<reference path="../globals.ts" />
/* ------------
    hdd.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var HDD = /** @class */ (function () {
        function HDD(tracks, sectors, blocks, bytes, blockSize, storage, isFormatted) {
            if (tracks === void 0) { tracks = 3; }
            if (sectors === void 0) { sectors = 7; }
            if (blocks === void 0) { blocks = 7; }
            if (bytes === void 0) { bytes = 64; }
            if (blockSize === void 0) { blockSize = 60; }
            if (storage === void 0) { storage = sessionStorage; }
            if (isFormatted === void 0) { isFormatted = false; }
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.bytes = bytes;
            this.blockSize = blockSize;
            this.storage = storage;
            this.isFormatted = isFormatted;
        }
        HDD.prototype.init = function () {
            this.storage.clear();
            for (var track = 0; track <= this.tracks; track++) {
                for (var sector = 0; sector <= this.sectors; sector++) {
                    for (var block = 0; block <= this.blocks; block++) {
                        var bytes = "";
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
        };
        return HDD;
    }());
    TSOS.HDD = HDD;
})(TSOS || (TSOS = {}));
