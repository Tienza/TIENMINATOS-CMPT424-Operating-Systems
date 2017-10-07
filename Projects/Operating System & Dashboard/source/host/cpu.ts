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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public instruction: string = "",
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.instruction = "";
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            // Execute instructions
            this.executeProgram(_ProcessManager.currentPCB);
        }

        public executeProgram(pcb: PCB) {
            this.instruction = _ProcessManager.fetchInstruction(pcb, this.PC);

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
                case "A2":
                    this.loadXWithConst();
                    break;
                case "A0":
                    this.loadYWithConst();
                    break;
                case "AC":
                    this.loadYFromMemo();
                    break;
                case "00":
                    this.breakProgram();
                    break;
                case "FF":
                    this.systemCall();
                    break;
                default:
                    this.PC++;
                    break;
            }
            this.updatePCB(_ProcessManager.currentPCB);
        }

        public updatePCB(pcb: PCB) {
            pcb.instruction = this.instruction;
            pcb.Acc = this.Acc;
            pcb.PC = this.PC;
            pcb.Xreg = this.Xreg;
            pcb.Yreg = this.Yreg;
            pcb.Zflag = this.Zflag;
        }
        
        public updateCPU() {
            this.instruction = _ProcessManager.currentPCB.instruction;
            this.Acc = _ProcessManager.currentPCB.Acc;
            this.PC = _ProcessManager.currentPCB.PC;
            this.Xreg =_ProcessManager.currentPCB.Xreg;
            this.Yreg = _ProcessManager.currentPCB.Yreg;
            this.Zflag = _ProcessManager.currentPCB.Zflag;
        }

        public consumeInstruction() {
            this.PC++;
        }

        /* 6502a Op Codes Functions */
        public loadAccWithConst() {
            // Pass over current Op Code
            this.consumeInstruction();
            // Assign the following constant to the Acc
            this.Acc = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC), 16);
            // Pass over current Op Code
            this.consumeInstruction();
        }

        public loadAccFromMemo() {
            // Pass over current Op Code
            this.consumeInstruction();
            // Fetch the memory location where we want to load the Accumulator with
            var address: string = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current OP Code
            this.consumeInstruction();
            // Convert the memory location to an index in the memory partition
            var memoryloc: number = parseInt(address, 16);
            // Assign the value at the memory location to the Accumulator
            this.Acc = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, memoryloc));
            this.consumeInstruction();
        }

        public storeAccInMemo() {
            // Pass over current Op Code
            this.consumeInstruction();
            // Fetch the memory location where we want to store the Accumulator
            var address: string = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current Op Code
            this.consumeInstruction();
            // Convert the memory address to an index in the memory partition
            var memoryloc: number = parseInt(address, 16);
            // Ready the value of the accumulator and format it if necessary
            var val: string = this.Acc.toString(16).toUpperCase();
            if (val.length < 2)
                val = "0" + val;
            // Wrtie the value to memory
            _ProcessManager.writeInstruction(_ProcessManager.currentPCB, memoryloc, val);
            // Pass over current Op Code
            this.consumeInstruction();
        }

        public loadXWithConst() {
            // Pass over current Op Code
            this.consumeInstruction();
            // Decode the current Op Code and assign it to the X Register
            this.Xreg = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC), 16);
            // Pass over current Op Code
            this.consumeInstruction();
        }

        public loadYWithConst() {
            // Pass over current OP Code
            this.consumeInstruction();
            // Decode the current Op Code and assign it to the Y Register
            this.Yreg = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC), 16);
            // Pass over current OP Code
            this.consumeInstruction();
        }

        public loadYFromMemo() {
            // Pass over current OP Code
            this.consumeInstruction();
            // Fetch the memory location that we want to load the Y Register with
            var address: string = _ProcessManager.fetchInstruction(_ProcessManager.currentPCB, this.PC);
            // Pass over current OP Code
            this.consumeInstruction();
            // Convert the memory location to an index in the memory partition
            var memoryloc: number = parseInt(address, 16);
            // Assign the value at the memory location to the Y Register
            this.Yreg = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, memoryloc));
            this.consumeInstruction();
        }

        public breakProgram() {
            // Pass over current OP Code
            this.consumeInstruction();
            // Break Line
            _StdOut.advanceLine();
            // Terminate the process
            _ProcessManager.terminateProcess(_ProcessManager.currentPCB);
            // Insert the prompt
            _OsShell.putPrompt();
        }
        public systemCall() {
            // Pass over current OP Code
            this.consumeInstruction();
            // If the X Register is 1 then print the constant in the Y Register
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            // If the X Register is 2 then keep printing from the memory location until 00
            else if (this.Xreg === 2) {
                var address = this.Yreg;
                var workingString = "";
                var code = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, address), 16);
                while (code !== 0) {
                    workingString += String.fromCharCode(code);
                    address++;
                    code = parseInt(_ProcessManager.fetchInstruction(_ProcessManager.currentPCB, address), 16);
                }
                _StdOut.putText(workingString);
            }
        }
    }
}
