///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

   module TSOS {
    
        // Extends DeviceDriver
        export class DeviceDriverFs extends DeviceDriver {
    
            constructor(public isFull: string = "u,u,u",
                        public seperator: string = "`",
                        public seperatorHex: string = TSOS.Utils.toHex(seperator)) {
                // Override the base method pointers.
    
                // The code below cannot run because "this" can only be
                // accessed after calling super.
                //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
                super();
                this.driverEntry = this.krnFsDriverEntry;
                this.isr = this.krnFsDispatchKeyPress;
            }
    
            public krnFsDriverEntry() {
                // Initialization routine for this, the kernel-mode File System Device Driver.
                this.status = "loaded";
                // More?
            }
    
            public krnFsDispatchKeyPress(params) {
                var operation: string = params[0];
                var fileName: string = params[1];
                var data: string = params[2];

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
            }

            public createFile(fileName: string): void {
                var directoryTSB: string = this.fetchNextFreeDirectoryLoc();
                var fileTSB: string = this.fetchNextFreeFileLoc();

                if (directoryTSB === this.isFull || fileTSB === this.isFull) {
                    _StdOut.printOSFeedBack("HDD is at full capacity. Please delete files or format the disk");
                }
                else if (this.checkFileExists(fileName) !== "FILE DOES NOT EXIST") {
                    _StdOut.printOSFeedBack("A file named " + fileName + " already exists. Please rename and try again");
                }
                else {
                    var directoryTSBVal: string = "1" + this.fetchFileTSBVal(fileTSB);
                    var fileNameHex: string = TSOS.Utils.toHex(fileName);
                    var dateTime: string = TSOS.Utils.getDateTime();
                    var dateTimeHex: string = TSOS.Utils.toHex(dateTime);
                    var fileSize: string = TSOS.Utils.toHex("0");
                    var directoryInfo: string = directoryTSBVal + fileNameHex + this.seperatorHex + dateTimeHex + this.seperatorHex + fileSize + this.seperatorHex;
                    var directoryTSBValSize = directoryInfo.length;

                    if (directoryTSBValSize <= _HDD.bytes) {
                        // Zero fill directory data
                        for (var i: number = directoryTSBValSize; i < _HDD.bytes; i++) {
                            directoryInfo += "0";
                        }
                        console.log("diractoryTSBVal Size: " + directoryInfo.length);
                        console.log("directoryTSBVal: " + directoryInfo);
                        var translatedVal: string[] = TSOS.Utils.fromHex(directoryInfo.substring(4)).split(this.seperator);
                        console.log("File Name: " + translatedVal[0], "Create Date: " + translatedVal[1], "Size: " + translatedVal[2]);
                        // Create the file - Notate as in-use, final file location, and empty data
                        var fileInfo: string = "1uuu" + EMPTY_FILE_DATA;
                        // Write to the HDD - Directory first then file
                        _HDDAccessor.writeToHDD(directoryTSB, directoryInfo)
                        _HDDAccessor.writeToHDD(fileTSB, fileInfo);
                        // Update the directory and file information
                        this.alterNextDirLoc();
                        this.alterNextFileLoc();
                        // Confirm file creation
                        _StdOut.printOSFeedBack("File " + fileName + " successfully created at " + dateTime);

                    }
                    else {
                        _StdOut.printOSFeedBack("File name exceeds allocated memory. Please shorten and try again");
                    }

                }
            } 

            public fetchNextFreeDirectoryLoc(): string {
                var mbr: string = _HDDAccessor.readFromHDD("0,0,0");
                return _HDDAccessor.getTSB(mbr[0], mbr[1], mbr[2]);
            }

            public fetchNextFreeFileLoc(): string {
                var mbr: string = _HDDAccessor.readFromHDD("0,0,0");
                return _HDDAccessor.getTSB(mbr[3], mbr[4], mbr[5]);
            }

            public fetchFileTSBVal(fileTSB) {
                return fileTSB[0] + fileTSB[2] + fileTSB[4];
            }

            public alterNextDirLoc(): void {
                var mbr: string = _HDDAccessor.readFromHDD("0,0,0");
                var mbrWorkingArray: string[] = mbr.split("");
                var located: boolean = false;
                
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
            }

            public alterNextFileLoc(): void {
                var mbr: string = _HDDAccessor.readFromHDD("0,0,0");
                var mbrWorkingArray: string[] = mbr.split("");
                var located: boolean = false;

                for (var tsb in _HDD.storage) {
                    // If the file block is NOT on the 0 Track and NOT in use
                    if (parseInt(tsb[0]) > 0 && _HDDAccessor.readFromHDD(tsb)[0] !== "1") {
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
            }

            public checkFileExists(fileName: string): string {
                var trackSectorBlock = "FILE DOES NOT EXIST";

                for (var tsb in _HDD.storage) {
                    // Check if the tsb is in the 0 track and if it is currently in use
                    if (tsb[0] === "0" && _HDDAccessor.readFromHDD(tsb)[0] === "1") {
                        var existingFileNameHex = _HDDAccessor.readFromHDD(tsb).substring(4);
                        var existingFileNameAscii = TSOS.Utils.fromHex(existingFileNameHex);
                        if (fileName === existingFileNameAscii) {
                            trackSectorBlock = tsb;
                            break;
                        }
                    }
                }

                return trackSectorBlock;
            } 
        }
    }
    