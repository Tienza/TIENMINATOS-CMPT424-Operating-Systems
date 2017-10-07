///<reference path="../globals.ts" />

/* ------------
    processControlBlock.ts

    Requires global.ts.
------------ */

module TSOS {

    export class PCB {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public instruction: string = "",
                    public isExecuting: boolean = false,
                    public memoryIndex: any = null,
                    public programId: number = _ProcessCount) {
        }
    }
}        