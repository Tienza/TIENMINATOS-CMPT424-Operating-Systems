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
                    public instruction: string = null,
                    public isExecuted: boolean = false,
                    public memoryIndex: number = null,
                    public hddTSB: string = null,
                    public state: string = "New",
                    public programId: number = _ProcessCount,
                    public location: string = null,
                    public priority: number = 50,
                    public waitTime: number = 0,
                    public turnAroundTime: number = 0,
                    public burstTime: number = 0,
                    public predictedBurstTime: number = 0) {
        }
    }
}        