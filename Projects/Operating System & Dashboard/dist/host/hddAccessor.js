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
        HDDAccessor.prototype.fullFormat = function () {
            _HDD.hddRecovery = [];
            _HDD.init();
            TSOS.Control.initializeHDDDisplay();
            // Print confirmation message
            _StdOut.printLongText("Hard Drive fully formatted, no recovery possible");
        };
        HDDAccessor.prototype.quickFormat = function () {
            // Available Tracks
            var trackArray = ["0", "1", "2", "3"];
            // Delete all files on the HDD and store in recovery
            _krnFileSystemDriver.moveFilesToRecovery();
            // Initialize the first 4 bytes of each TSB
            for (var TSB in _HDD.storage) {
                if (trackArray.indexOf(TSB[0]) > -1) {
                    var quickFormatString = _krnFileSystemDriver.getVal(_HDDAccessor.readFromHDD(TSB));
                    quickFormatString = "0000" + quickFormatString;
                    _HDDAccessor.writeToHDD(TSB, quickFormatString);
                }
            }
            // Update the Master Boot Record
            _krnFileSystemDriver.alterNextDirLoc();
            _krnFileSystemDriver.alterNextFileLoc();
            // Print confirmation message
            _StdOut.putText("Quick format complete");
        };
        return HDDAccessor;
    }());
    TSOS.HDDAccessor = HDDAccessor;
})(TSOS || (TSOS = {}));
