///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var CPU = /** @class */ (function () {
        function CPU(PC, Acc, Xreg, Yreg, Zflag, instruction, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (instruction === void 0) { instruction = "--"; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.instruction = instruction;
            this.isExecuting = isExecuting;
        }
        CPU.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.instruction = "--";
        };
        CPU.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // Update Memory Display
            TSOS.Control.highlightMemory(_ProcessManager.currentPCB, this.PC);
            // Update Process Display
            TSOS.Control.updateProcessDisplay(_ProcessManager.currentPCB);
            // Update CPU Display
            TSOS.Control.updateCPUDisplay(_CPU);
            // Update Wait Time of programs in readyQueue
            _ProcessManager.updateWaitTime();
            // Update Turn Around Time of programs
            _ProcessManager.updateTurnAroundTime();
            // Update Burst Time of current PCB
            _ProcessManager.updateBurstTime();
            // Execute instructions
            this.executeProgram(_ProcessManager.currentPCB);
            // Stop after one instruction if Single Step Mode is enabled
            if (_SingleStep)
                this.isExecuting = false;
        };
        CPU.prototype.resetCPU = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.instruction = "";
        };
        CPU.prototype.executeProgram = function (pcb) {
            this.instruction = _ProcessManager.fetchInstruction(pcb, this.PC);
            var cellId = "#memory-cell-" + (this.PC + _MemoryManager.partitions[pcb.memoryIndex].base);
            if (_Debuggers.indexOf(cellId) > -1 && _SingleStep === false) {
                $('#singleStepBtn').click();
            }
            switch (this.instruction) {
                case "A9":
                    this.loadAccWithConst();
                    break;
                case "AD":
                    this.loadAccFromMemo();
                    break;
                case "8D":
                    this.storeAccInMemo();
                    break;
                case "6D":
                    this.addWithCarry();
                    break;
                case "A2":
                    this.loadXWithConst();
                    break;
                case "AE":
                    this.loadXFromMemo();
                    break;
                case "A0":
                    this.loadYWithConst();
                    break;
                case "AC":
                    this.loadYFromMemo();
                    break;
                case "EA":
                    this.noOperation();
                    break;
                case "00":
                    this.breakProgram();
                    break;
                case "EC":
                    this.compareMemoToX();
                    break;
                case "D0":
                    this.branchNBytes();
                    break;
                case "EE":
                    this.incrementByte();
                    break;
                case "FF":
                    this.systemCall();
                    break;
                default:
                    _StdOut.putText("Invalid Op Code '" + this.instruction + "', Terminating Process " + _ProcessManager.currentPCB.programId);
                    _ProcessManager.terminateProcess(_ProcessManager.currentPCB);
                    break;
            }
            this.updatePCB(_ProcessManager.currentPCB);
        };
        CPU.prototype.updatePCB = function (pcb) {
            pcb.instruction = this.instruction;
            pcb.Acc = this.Acc;
            pcb.PC = this.PC;
            pcb.Xreg = this.Xreg;
            pcb.Yreg = this.Yreg;
            pcb.Zflag = this.Zflag;
        };
        CPU.prototype.updateCPU = function () {
            this.instruction = _ProcessManager.currentPCB.instruction;
            this.Acc = _ProcessManager.currentPCB.Acc;
            this.PC = _ProcessManager.currentPCB.PC;
            this.Xreg = _ProcessManager.currentPCB.Xreg;
            this.Yreg = _ProcessManager.currentPCB.Yreg;
            this.Zflag = _ProcessManager.currentPCB.Zflag;
        };
        CPU.prototype.consumeInstruction = function () {
            this.PC++;
        };
        /****************************** 6502a Op Codes Functions ******************************/
        CPU.prototype.loadAccWithConst = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Assign the following constant to the Acc
            this.Acc = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC), 16);
            // Pass over current Op Code
            this.consumeInstruction();
        };
        CPU.prototype.loadAccFromMemo = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Fetch the memory location where we want to load the Accumulator with
            var address = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current Op Code
            this.consumeInstruction();
            // Convert the memory location to an index on the memory partition
            var memoryloc = parseInt(address, 16);
            // Assign the value at the memory location to the Accumulator
            this.Acc = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, memoryloc));
            this.consumeInstruction();
        };
        CPU.prototype.storeAccInMemo = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Fetch the memory location where we want to store the Accumulator
            var address = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current Op Code
            this.consumeInstruction();
            // Convert the memory address to an index in the memory partition
            var memoryloc = parseInt(address, 16);
            // Ready the value of the accumulator and format it if necessary
            var val = this.Acc.toString(16).toUpperCase();
            if (val.length < 2)
                val = "0" + val;
            // Write the value to memory
            _ProcessManager.writeInstruction(_ProcessManager.currentPCB, memoryloc, val);
            // Pass over current Op Code
            this.consumeInstruction();
        };
        CPU.prototype.addWithCarry = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Fetch the memory location where we want to add to the Accumulator
            var address = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current Op Code
            this.consumeInstruction();
            // Convert the memory address to an index in the memory partition
            var memoryloc = parseInt(address, 16);
            // Add the value returned from the memory location to the Accumulator
            this.Acc += parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, memoryloc), 16);
            // Pass over current Op Code
            this.consumeInstruction();
        };
        CPU.prototype.loadXWithConst = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Decode the current Op Code and assign it to the X Register
            this.Xreg = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC), 16);
            // Pass over current Op Code
            this.consumeInstruction();
        };
        CPU.prototype.loadXFromMemo = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Fetch the memory location that we want to load the X Register with
            var address = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current Op Code
            this.consumeInstruction();
            // Convert the memory location to an index on the memory partition
            var memoryloc = parseInt(address, 16);
            // Assign the value at the memory location to the X Register
            this.Xreg = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, memoryloc), 16);
            // Pass over current Op Code
            this.consumeInstruction();
        };
        CPU.prototype.loadYWithConst = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Decode the current Op Code and assign it to the Y Register
            this.Yreg = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC), 16);
            // Pass over current Op Code
            this.consumeInstruction();
        };
        CPU.prototype.loadYFromMemo = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Fetch the memory location that we want to load the Y Register with
            var address = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current Op Code
            this.consumeInstruction();
            // Convert the memory location to an index on the memory partition
            var memoryloc = parseInt(address, 16);
            // Assign the value at the memory location to the Y Register
            this.Yreg = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, memoryloc), 16);
            // Pass over current Op Code
            this.consumeInstruction();
        };
        CPU.prototype.noOperation = function () {
            // Pass over current Op Code
            this.consumeInstruction();
        };
        CPU.prototype.breakProgram = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Terminate the process
            _ProcessManager.terminateProcess(_ProcessManager.currentPCB);
        };
        CPU.prototype.compareMemoToX = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // Fetch the memory location that we want to compare with the X Register
            var address = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current Op Code
            this.consumeInstruction();
            // Convert the memory location to an index on the memory partition
            var memoryloc = parseInt(address, 16);
            // Compare the value returned from the memory location with the value stored in the X Register
            this.Zflag = (parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, memoryloc), 16) === this.Xreg) ? 1 : 0;
            // Pass over current Op Code
            this.consumeInstruction();
        };
        CPU.prototype.branchNBytes = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            if (this.Zflag === 0) {
                var numBytes = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC), 16);
                // Pass over current Op Code
                this.consumeInstruction();
                // Calculate the jump disctance
                var workingPC = this.PC + numBytes;
                // If the jump distance is larger than the segment size, then loop to the beginning and jump the difference
                if (workingPC > _SegmentSize - 1) {
                    this.PC = workingPC - _SegmentSize;
                }
                else {
                    this.PC = workingPC;
                }
            }
            else {
                // Pass over current Op code
                this.consumeInstruction();
            }
        };
        CPU.prototype.incrementByte = function () {
            // Pass over current Op code
            this.consumeInstruction();
            // Fetch the memory location that we want to increment
            var address = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current Op Code
            this.consumeInstruction();
            // Convert the memory location to an index on the memory partition
            var memoryloc = parseInt(address, 16);
            // Assign the value at the memory location locally to be manipulated
            var val = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, memoryloc), 16);
            // Increment the local value
            val++;
            // Convert the value back to hex
            var hex = val.toString().toUpperCase();
            if (hex.length < 2)
                hex = "0" + hex;
            // Write the value to memory
            _ProcessManager.writeInstruction(_ProcessManager.currentPCB, memoryloc, hex);
            // Pass over current Op code
            this.consumeInstruction();
        };
        CPU.prototype.systemCall = function () {
            // Pass over current Op Code
            this.consumeInstruction();
            // If the X Register is 1 then print the constant in the Y Register
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                var address = this.Yreg;
                var workingString = "";
                var code = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, address), 16);
                while (code !== 0) {
                    workingString += String.fromCharCode(code);
                    address++;
                    code = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, address), 16);
                }
                // Print the individual letters so that putText can calculate word wrap
                for (var i = 0; i < workingString.length; i++) {
                    _StdOut.putText(workingString[i]);
                }
            }
        };
        return CPU;
    }());
    TSOS.CPU = CPU;
})(TSOS || (TSOS = {}));
