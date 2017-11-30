///<reference path="../globals.ts" />
/* ------------
    memoryAccessor.ts

    Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var HDDAccessor = /** @class */ (function () {
        function HDDAccessor() {
        }
        HDDAccessor.prototype.getTSB = function (track, sector, block) {
            return track + "," + sector + "," + block;
        };
        HDDAccessor.prototype.readFromHDD = function (trackSectorBranch) {
            return _HDD.storage.getItem(trackSectorBranch);
        };
        HDDAccessor.prototype.writeToHDD = function (trackSectorBlock, bytes) {
            TSOS.Control.updateHDDDisplay(trackSectorBlock, bytes);
            return _HDD.storage.setItem(trackSectorBlock, bytes);
        };
        HDDAccessor.prototype.removeFromRecovery = function (fileName) {
            for (var i = 0; i < _HDD.hddRecovery.length; i++) {
                if (_HDD.hddRecovery[i].fileName === fileName)
                    _HDD.hddRecovery.splice(i, 1);
            }
        };
        return HDDAccessor;
    }());
    TSOS.HDDAccessor = HDDAccessor;
})(TSOS || (TSOS = {}));
