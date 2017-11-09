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
    
            constructor() {
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
                        _StdOut.putText("Error: Disk not formatted! Please use the format command");
                        _StdOut.advanceLine();
                        _OsShell.putPrompt();
                    }
                }
            }

            private fetchNextDirLoc(): string {
                var mbr: string = _HDDAccessor.readFromHDD("0,0,0");
                return _HDDAccessor.getTSB(mbr[0], mbr[1], mbr[2]);
            }

            private fetchNextFileLoc(): string {
                var mbr: string = _HDDAccessor.readFromHDD("0,0,0");
                return _HDDAccessor.getTSB(mbr[3], mbr[4], mbr[5]);
            }

            private alterNextDirLoc(): void {
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

            private alterNextFileLoc() {
                var mbr: string = _HDDAccessor.readFromHDD("0,0,0");
                var mbrWorkingArray: string[] = mbr.split("");
                var located: boolean = false;

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
            }
        }
    }
    