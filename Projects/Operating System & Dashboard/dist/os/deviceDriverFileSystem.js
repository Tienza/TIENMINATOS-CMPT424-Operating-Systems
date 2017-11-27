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
        function DeviceDriverFs(isFull, noSuchFile, seperator, seperatorHex) {
            // Override the base method pointers.
            if (isFull === void 0) { isFull = "u,u,u"; }
            if (noSuchFile === void 0) { noSuchFile = "FILE DOES NOT EXIST"; }
            if (seperator === void 0) { seperator = "`"; }
            if (seperatorHex === void 0) { seperatorHex = TSOS.Utils.toHex(seperator); }
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this) || this;
            _this.isFull = isFull;
            _this.noSuchFile = noSuchFile;
            _this.seperator = seperator;
            _this.seperatorHex = seperatorHex;
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
                        case "write":
                            this.writeFile(fileName, data);
                            break;
                        case "delete":
                            this.deleteFile(fileName);
                            break;
                        case "read":
                            this.readFile(fileName);
                            break;
                    }
                }
                else {
                    _StdOut.printOSFeedBack("Error: Disk not formatted! Please use the format command");
                }
            }
        };
        DeviceDriverFs.prototype.listFiles = function (arg) {
            var ll = false;
            var filesFound = false;
            var fileInfo = [];
            if (arg === "-l")
                ll = true;
            for (var TSB in _HDD.storage) {
                // Check if the TSB is in the 0 track and if it is currently in use
                if (TSB[0] === "0" && _HDDAccessor.readFromHDD(TSB)[0] === "1") {
                    var directoryVal = _HDDAccessor.readFromHDD(TSB);
                    var translatedVal = this.translateDirectoryInformation(directoryVal);
                    if (ll) {
                        fileInfo.push("[File Name: " + translatedVal[0] + " | Create Date: " + translatedVal[1] + " | File Size: " + translatedVal[2] + " Bytes]");
                    }
                    else if (!/^\./.test(translatedVal[0]) && !/^\~/.test(translatedVal[0])) {
                        fileInfo.push("[" + translatedVal[0] + "]");
                    }
                    filesFound = true;
                }
            }
            if (filesFound) {
                fileInfo = fileInfo.sort();
                if (ll) {
                    _StdOut.verticalList(fileInfo);
                }
                else {
                    var fileInfoString = fileInfo.join(" | ");
                    if (fileInfoString !== "")
                        _StdOut.printLongText(fileInfoString);
                    else
                        _StdOut.putText("No files found on HDD");
                }
            }
            else {
                _StdOut.putText("No files found on HDD");
            }
        };
        DeviceDriverFs.prototype.deleteFile = function (fileName) {
            var directoryTSB = this.checkFileExists(fileName);
            if (directoryTSB !== this.noSuchFile) {
                var directoryVal = _HDDAccessor.readFromHDD(directoryTSB);
                var fileTSB = this.getTSBFromVal(directoryVal);
                // Wipe the file sections
                do {
                    var fileVal = _HDDAccessor.readFromHDD(fileTSB);
                    _HDDAccessor.writeToHDD(fileTSB, "0000" + EMPTY_FILE_DATA);
                    fileTSB = this.getTSBFromVal(fileVal);
                } while (fileTSB !== "u,u,u");
                // Wipe the directory section
                _HDDAccessor.writeToHDD(directoryTSB, "0000" + EMPTY_FILE_DATA);
                // Update the Master Boot Record
                this.alterNextDirLoc();
                this.alterNextFileLoc();
                // Print confirmation message
                _StdOut.printLongText("File '" + fileName + "' successfully removed");
            }
            else {
                _StdOut.printLongText("File '" + fileName + "' does not exist. Please try again");
            }
        };
        DeviceDriverFs.prototype.wipeFile = function (fileName) {
            var directoryTSB = this.checkFileExists(fileName);
            if (directoryTSB !== this.noSuchFile) {
                var directoryVal = _HDDAccessor.readFromHDD(directoryTSB);
                var fileTSB = this.getTSBFromVal(directoryVal);
                var firstFileVal = true;
                do {
                    // Retrieve the value stored before we start over writing
                    var fileVal = _HDDAccessor.readFromHDD(fileTSB);
                    // Do a clear wipe and remove all references to other TSB if it is the first file Val
                    if (firstFileVal) {
                        _HDDAccessor.writeToHDD(fileTSB, "1uuu" + EMPTY_FILE_DATA);
                        firstFileVal = false;
                    }
                    else {
                        _HDDAccessor.writeToHDD(fileTSB, "0000" + EMPTY_FILE_DATA);
                    }
                    // Fetch and format the next file TSB from the file Val
                    fileTSB = this.getTSBFromVal(fileVal);
                } while (fileTSB !== "u,u,u");
            }
            else {
                _StdOut.printLongText("File '" + fileName + "' does not exist. Please try again");
            }
        };
        DeviceDriverFs.prototype.readFile = function (fileName) {
            var directoryTSB = this.checkFileExists(fileName);
            if (directoryTSB !== this.noSuchFile) {
                // Fetch the TSB of the file from the first file block stored in the directory
                var directoryVal = _HDDAccessor.readFromHDD(directoryTSB);
                var fileTSB = this.getTSBFromVal(directoryVal);
                // Read the value of the first fileTSB
                var fileVal = this.getVal(_HDDAccessor.readFromHDD(fileTSB));
                // Check to see if file isn't empty, if it is then stop reading
                if (fileVal !== EMPTY_FILE_DATA) {
                    // Buffer for file content
                    var fileContent = "";
                    do {
                        var fileVal = _HDDAccessor.readFromHDD(fileTSB);
                        var data = this.getVal(fileVal);
                        fileContent += TSOS.Utils.fromHex(data);
                        fileTSB = this.getTSBFromVal(fileVal);
                    } while (fileTSB !== "u,u,u");
                    // Print file contents to the console
                    _StdOut.printLongText(fileContent);
                }
                else {
                    _StdOut.printLongText("File '" + fileName + "' is empty. Please write to the file or specify another file to read");
                }
            }
            else {
                _StdOut.printLongText("File '" + fileName + "' does not exist. Please try again");
            }
        };
        DeviceDriverFs.prototype.writeFile = function (fileName, data) {
            var directoryTSB = this.checkFileExists(fileName);
            if (directoryTSB !== this.noSuchFile) {
                // Format the file and write over the currently allocated space
                this.wipeFile(fileName);
                // Get the file TSB from the directory TSB
                var directoryVal = _HDDAccessor.readFromHDD(directoryTSB);
                var fileTSB = this.getTSBFromVal(directoryVal);
                // Remove the open and closing quotes from the string and convert to hex
                var hexData = TSOS.Utils.toHex(data.slice(1, -1));
                var hexDataSize = hexData.length;
                // Placeholder for the next TSB
                var nextTSB = "";
                // File writing process
                while (hexData.length > 0) {
                    // Assemble the substring that will be written to the current TSB
                    var workingData = hexData.substring(0, _HDD.blockSize);
                    // Remove the data that will be written
                    hexData = hexData.substring(_HDD.blockSize);
                    // Fetch and format the next working TSB - If length 0 means EOF
                    if (hexData.length > 0) {
                        var workingTSB = this.fetchNextFreeFileLoc();
                        if (workingTSB === "u,u,u") {
                            nextTSB = "uuu";
                            _StdOut.printLongText("File partially written. HDD is at capacity.");
                            data = "";
                        }
                        else {
                            nextTSB = this.removeCommaFromTSB(workingTSB);
                        }
                    }
                    else {
                        nextTSB = "uuu";
                    }
                    // Write to the HDD
                    var fileVal = "1" + nextTSB + workingData + EMPTY_FILE_DATA.substring(workingData.length);
                    _HDDAccessor.writeToHDD(fileTSB, fileVal);
                    // Reserve space for the next TSB
                    if (nextTSB !== "uuu")
                        _HDDAccessor.writeToHDD(_HDDAccessor.getTSB(nextTSB[0], nextTSB[1], nextTSB[2]), "1uuu" + EMPTY_FILE_DATA);
                    // Update the Master Boot Record
                    this.alterNextFileLoc();
                    // Update the file TSB to the next working TSB
                    fileTSB = _HDDAccessor.getTSB(nextTSB[0], nextTSB[1], nextTSB[2]);
                }
                // Translate the value of the directoryVal
                var translatedVal = this.translateDirectoryInformation(directoryVal);
                // Update the file size section
                translatedVal[2] = hexDataSize.toString();
                // Get the directoryVal header
                var directoryHeader = this.getHeader(directoryVal);
                // Reform the string for the directoryVal
                var updatedVal = translatedVal.join(this.seperator);
                // Prepend the header to the directory string and append 0's to the end
                updatedVal = directoryHeader + TSOS.Utils.toHex(updatedVal);
                updatedVal = this.zeroFillTSBVal(updatedVal.length, updatedVal);
                // Write the updatedVal back to the directoryTSB
                _HDDAccessor.writeToHDD(directoryTSB, updatedVal);
                // Print confirmation
                _StdOut.printLongText("Successfully wrote to file '" + fileName + "'");
            }
            else {
                _StdOut.printLongText("File '" + fileName + "' does not exist. Please try again");
            }
        };
        DeviceDriverFs.prototype.createFile = function (fileName) {
            var directoryTSB = this.fetchNextFreeDirectoryLoc();
            var fileTSB = this.fetchNextFreeFileLoc();
            if (directoryTSB === this.isFull || fileTSB === this.isFull) {
                _StdOut.printLongText("HDD is at full capacity. Please delete files or format the disk");
            }
            else if (this.checkFileExists(fileName) !== "FILE DOES NOT EXIST") {
                _StdOut.printLongText("A file named " + fileName + " already exists. Please rename and try again");
            }
            else {
                var directoryVal = "";
                var fileTSBString = "1" + this.removeCommaFromTSB(fileTSB);
                var fileNameHex = TSOS.Utils.toHex(fileName);
                var dateTime = TSOS.Utils.getDateTime();
                var dateTimeHex = TSOS.Utils.toHex(dateTime);
                var fileSize = TSOS.Utils.toHex("0");
                // Assign all the associated variables to directoryVal
                directoryVal = fileTSBString + fileNameHex + this.seperatorHex + dateTimeHex + this.seperatorHex + fileSize + this.seperatorHex;
                var directoryValSize = directoryVal.length;
                if (directoryValSize <= _HDD.bytes) {
                    // Zero fill directory data
                    directoryVal = this.zeroFillTSBVal(directoryValSize, directoryVal);
                    console.log("diractoryVal Size: " + directoryVal.length);
                    console.log("directoryVal: " + directoryVal);
                    var translatedVal = this.translateDirectoryInformation(directoryVal);
                    console.log("File Name: " + translatedVal[0], "Create Date: " + translatedVal[1], "Size: " + translatedVal[2]);
                    // Create the file - Notate as in-use, final file location, and empty data
                    var fileInfo = "1uuu" + EMPTY_FILE_DATA;
                    // Write to the HDD - Directory first then file
                    _HDDAccessor.writeToHDD(directoryTSB, directoryVal);
                    _HDDAccessor.writeToHDD(fileTSB, fileInfo);
                    // Update the directory and file information
                    this.alterNextDirLoc();
                    this.alterNextFileLoc();
                    // Confirm file creation
                    _StdOut.printLongText("File '" + fileName + "' successfully created");
                }
                else {
                    _StdOut.printLongText("File name exceeds allocated memory. Please shorten and try again");
                }
            }
        };
        DeviceDriverFs.prototype.rollOut = function (programId, userProgram) {
            // Send the actions message to the log
            var rollOutMessage = "Rolling Out ProgramId " + programId + " To HDD";
            _Kernel.krnTrace(rollOutMessage);
            // Get the associated PCB from the programId
            var pcb = _ProcessManager.getPCB(programId);
            var hexData = userProgram.join("");
            // If program is coming from memory, then free that partition of memory
            if (pcb.location === _ProcessManager.processLocations.memory)
                _MemoryManager.freePartition(pcb.memoryIndex);
            // Assign the PCB the next free file location
            var hddTSB = this.fetchNextFreeFileLoc();
            // Update the PCB values
            pcb.hddTSB = hddTSB;
            pcb.location = _ProcessManager.processLocations.hdd;
            // Update the PCB display
            TSOS.Control.updateProcessDisplay(pcb);
            // Reserve the file location
            _HDDAccessor.writeToHDD(hddTSB, "1uuu" + EMPTY_FILE_DATA);
            // Update the next available file location
            this.alterNextFileLoc();
            // Placeholder for the next TSB
            var nextTSB = "";
            // File writing process
            while (hexData.length > 0) {
                // Assemble the substring that will be written to the current TSB
                var workingData = hexData.substring(0, _HDD.blockSize);
                // Remove the data that will be written
                hexData = hexData.substring(_HDD.blockSize);
                // Fetch and format the next working TSB - If length 0 means EOF
                if (hexData.length > 0) {
                    var workingTSB = this.fetchNextFreeFileLoc();
                    if (workingTSB === "u,u,u") {
                        nextTSB = "uuu";
                        _StdOut.printLongText("File partially written. HDD is at capacity.");
                        hexData = "";
                    }
                    else {
                        nextTSB = this.removeCommaFromTSB(workingTSB);
                    }
                }
                else {
                    nextTSB = "uuu";
                }
                // Write to the HDD
                var fileVal = "1" + nextTSB + workingData + EMPTY_FILE_DATA.substring(workingData.length);
                _HDDAccessor.writeToHDD(hddTSB, fileVal);
                // Reserve space for the next TSB
                if (nextTSB !== "uuu")
                    _HDDAccessor.writeToHDD(_HDDAccessor.getTSB(nextTSB[0], nextTSB[1], nextTSB[2]), "1uuu" + EMPTY_FILE_DATA);
                // Update the Master Boot Record
                this.alterNextFileLoc();
                // Update the file TSB to the next working TSB
                hddTSB = _HDDAccessor.getTSB(nextTSB[0], nextTSB[1], nextTSB[2]);
            }
        };
        DeviceDriverFs.prototype.rollIn = function (programId) {
            // Send the actions message to the log
            var rollInMessage = "Rolling In ProgramId " + programId + " From HDD";
            _Kernel.krnTrace(rollInMessage);
            // Get the associated PCB from the programId
            var pcb = _ProcessManager.getPCB(programId);
            var hddTSB = pcb.hddTSB;
            var userCode = "";
            // Assemble the userCode string and wipe the file sections as you go
            do {
                var fileVal = _HDDAccessor.readFromHDD(hddTSB);
                // Append the OP Codes
                userCode += this.getVal(fileVal);
                // Wipe the TSB file section
                _HDDAccessor.writeToHDD(hddTSB, "0000" + EMPTY_FILE_DATA);
                hddTSB = this.getTSBFromVal(fileVal);
            } while (hddTSB !== "u,u,u");
            // Update the Master Boot Record
            this.alterNextFileLoc();
            // Filter out the garbage data - Twice the size of memory because these are individual characters
            userCode = userCode.substring(0, _Memory.singleMemSize * 2);
            var userProgram = TSOS.Utils.cleanInput(userCode).split(" ");
            // Update PCB values
            pcb.hddTSB = null;
            pcb.location = _ProcessManager.processLocations.memory;
            // Load the program into Memory
            _MemoryManager.loadProgramFromHDD(pcb, userProgram);
        };
        DeviceDriverFs.prototype.fetchNextFreeDirectoryLoc = function () {
            var mbr = _HDDAccessor.readFromHDD("0,0,0");
            return _HDDAccessor.getTSB(mbr[0], mbr[1], mbr[2]);
        };
        DeviceDriverFs.prototype.fetchNextFreeFileLoc = function () {
            var mbr = _HDDAccessor.readFromHDD("0,0,0");
            return _HDDAccessor.getTSB(mbr[3], mbr[4], mbr[5]);
        };
        DeviceDriverFs.prototype.removeCommaFromTSB = function (TSB) {
            return TSB[0] + TSB[2] + TSB[4];
        };
        DeviceDriverFs.prototype.alterNextDirLoc = function () {
            var mbr = _HDDAccessor.readFromHDD("0,0,0");
            var mbrWorkingArray = mbr.split("");
            var located = false;
            for (var TSB in _HDD.storage) {
                // If the TSB is NOT the Master Boot Record, located ON the 0 Track, and NOT in use
                if (TSB !== "0,0,0" && TSB[0] === "0" && _HDDAccessor.readFromHDD(TSB)[0] === "0") {
                    located = true;
                    // Assign the value of TSB to mbrWorkingArray, the provided indexes are used to skip over the commas in the string
                    mbrWorkingArray[0] = TSB[0];
                    mbrWorkingArray[1] = TSB[2];
                    mbrWorkingArray[2] = TSB[4];
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
            for (var TSB in _HDD.storage) {
                // If the file block is NOT on the 0 Track and NOT in use
                if (parseInt(TSB[0]) > 0 && _HDDAccessor.readFromHDD(TSB)[0] !== "1") {
                    located = true;
                    // Assign the value of TSB to mbrWorkingArray, the provided indexes are used to skip over the commas in the string
                    mbrWorkingArray[3] = TSB[0];
                    mbrWorkingArray[4] = TSB[2];
                    mbrWorkingArray[5] = TSB[4];
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
        DeviceDriverFs.prototype.checkFileExists = function (fileName) {
            var trackSectorBlock = this.noSuchFile;
            for (var TSB in _HDD.storage) {
                // Check if the TSB is in the 0 track and if it is currently in use
                if (TSB[0] === "0" && _HDDAccessor.readFromHDD(TSB)[0] === "1") {
                    var directoryVal = _HDDAccessor.readFromHDD(TSB);
                    var translatedVal = this.translateDirectoryInformation(directoryVal);
                    var existingFileNameAscii = translatedVal[0];
                    if (fileName === existingFileNameAscii) {
                        trackSectorBlock = TSB;
                        break;
                    }
                }
            }
            return trackSectorBlock;
        };
        DeviceDriverFs.prototype.getHeader = function (tsbVal) {
            return tsbVal.substring(0, 4);
        };
        DeviceDriverFs.prototype.getTSBFromVal = function (tsbVal) {
            return _HDDAccessor.getTSB(tsbVal[1], tsbVal[2], tsbVal[3]);
        };
        DeviceDriverFs.prototype.getVal = function (tsbVal) {
            return tsbVal.substring(4);
        };
        DeviceDriverFs.prototype.zeroFillTSBVal = function (inputLength, input) {
            for (var i = inputLength; i < _HDD.bytes; i++) {
                input += "0";
            }
            return input;
        };
        DeviceDriverFs.prototype.translateDirectoryInformation = function (directoryVal) {
            return TSOS.Utils.fromHex(directoryVal.substring(4)).split(this.seperator);
        };
        return DeviceDriverFs;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFs = DeviceDriverFs;
})(TSOS || (TSOS = {}));
