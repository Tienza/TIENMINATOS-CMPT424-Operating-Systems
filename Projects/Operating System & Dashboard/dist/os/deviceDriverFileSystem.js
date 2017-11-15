///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFs = /** @class */ (function (_super) {
        __extends(DeviceDriverFs, _super);
        function DeviceDriverFs(isFull) {
            // Override the base method pointers.
            if (isFull === void 0) { isFull = "u,u,u"; }
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this) || this;
            _this.isFull = isFull;
            _this.driverEntry = _this.krnFsDriverEntry;
            _this.isr = _this.krnFsDispatchKeyPress;
            return _this;
        }
        DeviceDriverFs.prototype.krnFsDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverFs.prototype.krnFsDispatchKeyPress = function (params) {
            var operation = params[0];
            var fileName = params[1];
            var data = params[2];
            if (operation === "format") {
                _HDD.init();
            }
            else {
                if (_HDD.isFormatted) {
                    switch (operation) {
                        case "create":
                            this.createFile(fileName);
                            break;
                        case "ls":
                            break;
                        case "write":
                            break;
                        case "delete":
                            break;
                        case "read":
                            break;
                        case "rollOut":
                            break;
                        case "rollIn":
                            break;
                    }
                }
                else {
                    _StdOut.printOSFeedBack("Error: Disk not formatted! Please use the format command");
                }
            }
        };
        DeviceDriverFs.prototype.createFile = function (fileName) {
            var directoryTSB = this.fetchNextFreeDirectoryLoc();
            var fileTSB = this.fetchNextFreeFileLoc();
            if (directoryTSB === this.isFull || fileTSB === this.isFull) {
                _StdOut.printOSFeedBack("HDD is at full capacity. Please delete files or format the disk");
            }
            else {
                var directoryTSBVal = "1" + this.fetchFileTSBVal(fileTSB);
                var fileNameHex = TSOS.Utils.toHex(fileName);
                var directoryTSBValSize = directoryTSBVal.length + fileNameHex.length;
                if (directoryTSBValSize <= _HDD.bytes) {
                    console.log(directoryTSBVal);
                    console.log(fileNameHex);
                }
                else {
                    _StdOut.printOSFeedBack("File name exceeds allocated memory. Please shorten and try again");
                }
            }
        };
        DeviceDriverFs.prototype.fetchNextFreeDirectoryLoc = function () {
            var mbr = _HDDAccessor.readFromHDD("0,0,0");
            return _HDDAccessor.getTSB(mbr[0], mbr[1], mbr[2]);
        };
        DeviceDriverFs.prototype.fetchNextFreeFileLoc = function () {
            var mbr = _HDDAccessor.readFromHDD("0,0,0");
            return _HDDAccessor.getTSB(mbr[3], mbr[4], mbr[5]);
        };
        DeviceDriverFs.prototype.fetchFileTSBVal = function (fileTSB) {
            return fileTSB[0] + fileTSB[2] + fileTSB[4];
        };
        DeviceDriverFs.prototype.alterNextDirLoc = function () {
            var mbr = _HDDAccessor.readFromHDD("0,0,0");
            var mbrWorkingArray = mbr.split("");
            var located = false;
            for (var tsb in _HDD.storage) {
                // If the tsb is NOT the Master Boot Record, located ON the 0 Track, and NOT in use
                if (tsb !== "0,0,0" && tsb[0] === "0" && _HDDAccessor.readFromHDD(tsb)[0] === "0") {
                    located = true;
                    // Assign the value of tsb to mbrWorkingArray, the provided indexes are used to skip over the commas in the string
                    mbrWorkingArray[0] = tsb[0];
                    mbrWorkingArray[1] = tsb[2];
                    mbrWorkingArray[2] = tsb[4];
                    // Write the changes the Master Boot Record
                    _HDDAccessor.writeToHDD("0,0,0", mbrWorkingArray.join(""));
                    // Break out of the operation
                    break;
                }
            }
            // If we cannot locate it then that means that there are no dir blocks left (u,u,u)
            if (!located) {
                mbrWorkingArray[0] = "u";
                mbrWorkingArray[1] = "u";
                mbrWorkingArray[2] = "u";
                _HDDAccessor.writeToHDD("0,0,0", mbrWorkingArray.join(""));
            }
        };
        DeviceDriverFs.prototype.alterNextFileLoc = function () {
            var mbr = _HDDAccessor.readFromHDD("0,0,0");
            var mbrWorkingArray = mbr.split("");
            var located = false;
            for (var tsb in _HDD.storage) {
                // If the file block is NOT on the 0 Track and NOT in use
                if (parseInt(tsb[0]) > 0 && _HDDAccessor.readFromHDD(tsb)[0] !== "0") {
                    located = true;
                    // Assign the value of tsb to mbrWorkingArray, the provided indexes are used to skip over the commas in the string
                    mbrWorkingArray[3] = tsb[0];
                    mbrWorkingArray[4] = tsb[2];
                    mbrWorkingArray[5] = tsb[4];
                    // Write the changes ot the Master Boot Record
                    _HDDAccessor.writeToHDD("0,0,0", mbrWorkingArray.join(""));
                    // Break out of the operation
                    break;
                }
                // If we cannot locate it then that means that there are no dir blocks left (u,u,u)
                if (!located) {
                    mbrWorkingArray[3] = "u";
                    mbrWorkingArray[4] = "u";
                    mbrWorkingArray[5] = "u";
                    _HDDAccessor.writeToHDD("0,0,0", mbrWorkingArray.join(""));
                }
            }
        };
        return DeviceDriverFs;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFs = DeviceDriverFs;
})(TSOS || (TSOS = {}));
