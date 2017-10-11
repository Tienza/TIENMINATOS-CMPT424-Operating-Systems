///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }

        /* Memory Display Functions */

        public static highlightMemory(pcb: PCB, PC: number) {
            // Unhighlight all Op Codes
            Control.unhighlightAll();
            // Get the instruction to see how many characters we need to highlight
            var instruction: string = _ProcessManager.fetchInstruction(pcb, PC);
            // Check to see what offset we need for highlighting
            PC += _MemoryManager.partition[pcb.memoryIndex].startIndex;

            var id: string = "#memory-cell-" + PC;
            var id2: string = "#memory-cell-" + (PC + 1);
            var id3: string = "#memory-cell-" + (PC + 2);

            $(id).attr('class', 'currentOp');

            // Determines how many more Op Codes we need to highlight
            if (instruction !== "EA" && instruction !== "FF" && instruction !== "00")
                $(id2).attr('class', 'currentOpNext');
            if (instruction !== "A9" && instruction !== "A2" && instruction !== "A0" && instruction !== "D0" && instruction !== "EA" && instruction !== "FF" && instruction !== "00")
                $(id3).attr('class', 'currentOpNext');
        }

        public static unhighlightAll(): void {
            for (var i: number = 0; i < _MemorySize; i++) {
                var id: string = "#memory-cell-" + i;
                $(id).attr('class', '');
            }
        }

        public static switchMemoryTab(pcb: PCB): void {
            var id: string = "#memory-" + pcb.memoryIndex + "-tab";
            $(id).click();
        }

        public static updateMemoryDisplay(memoryIndex: number): void {
            // See initializeMemoryDisplay() similar but for a specific partition
            var workingPartition: {[key: string]: any} = _MemoryManager.partition[memoryIndex];
            // Break the array into collection of 8 instructions
            var memoryPartition: string[] = Control.chunkPartition(_Memory.memoryArray[memoryIndex], 8);
            // Initialize the display string
            var memoryDisplay: string = "";
            // For looping over the collection of 8 instructions
            var subPartitionCounter: number = -1;
            // The index of the beginning of each collection of 8 instructions
            var workingSegment: number = workingPartition.startIndex;
            // For keeping track of every instruction in this partition of memory
            var workingIndex: number = workingPartition.startIndex;
            // Repeat this actions for all the indices a partitions of memory
            for (var i: number = 0; i < _SegmentSize; i++) {
                if (i % 8 === 0) {
                    subPartitionCounter++;
                    // Format index into hexadecimal
                    var memoryLoc: string = workingSegment.toString(16);
                    // If not long enough add '0'
                    if (memoryLoc.length < 3) {
                        for (var j: number = memoryLoc.length; j < 3; j++) {
                            memoryLoc = "0" + memoryLoc;
                        }
                    }
                    // Format final segment address string
                    memoryLoc = "0x" + memoryLoc.toUpperCase();
                    // Display the segment address string
                    memoryDisplay += "<tr id=\"memory-row-" + workingSegment + "\">";
                    memoryDisplay += "<td>" + memoryLoc + "</td>";
                    // Print all the values in the current collection of 8 instructions
                    for (var k: number = 0; k < memoryPartition[subPartitionCounter].length; k++) {
                        memoryDisplay += "<td id=\"memory-cell-" + workingIndex + "\">" + memoryPartition[subPartitionCounter][k] + "</td>";
                        workingIndex++;
                    }
                    memoryDisplay += "</tr>";
                    // Increment to the next segment
                    workingSegment += 8;
                }
            }
            $(workingPartition.displayId).html(memoryDisplay);
        }

        public static initializeMemoryDisplay(): void {
            // For all three partitions, fill the display with zeros and the 8 bit addresses
            for (var par: number = 0; par < _MemoryManager.partition.length; par++) {
                var workingPartition: {[key: string]: any} = _MemoryManager.partition[par];
                // Break the array into collection of 8 instructions
                var memoryPartition: string[] = Control.chunkPartition(_Memory.memoryArray[workingPartition.memoryIndex], 8);
                // Initialize the display string
                var memoryDisplay: string = "";
                // For looping over the collection of 8 instructions
                var subPartitionCounter: number = -1;
                // The index of the beginning of each collection of 8 instructions
                var workingSegment: number = workingPartition.startIndex;
                // Repeat this actions for all the indices a partitions of memory
                for (var i: number = 0; i < _SegmentSize; i++) {
                    if (i % 8 === 0) {
                        subPartitionCounter++;
                        // Format index into hexadecimal
                        var memoryLoc: string = workingSegment.toString(16);
                        // If not long enough add '0'
                        if (memoryLoc.length < 3) {
                            for (var j: number = memoryLoc.length; j < 3; j++) {
                                memoryLoc = "0" + memoryLoc;
                            }
                        }
                        // Format final segment address string
                        memoryLoc = "0x" + memoryLoc.toUpperCase();
                        // Dispaly the segment address string
                        memoryDisplay += "<tr>";
                        memoryDisplay += "<td>" + memoryLoc + "</td>";
                        // Print all the values in the current collection of 8 instructions
                        for (var k: number = 0; k < memoryPartition[subPartitionCounter].length; k++) {
                            memoryDisplay += "<td>" + memoryPartition[subPartitionCounter][k] + "</td>";
                        }
                        memoryDisplay += "</tr>";
                        // Increment to the next segment
                        workingSegment += 8;
                    }
                }
                $(workingPartition.displayId).html(memoryDisplay);
            }
        }

        public static chunkPartition(myArray, chunk_size): any[] {
            var index: number = 0;
            var arrayLength: number = myArray.length;
            var tempArray: any[] = [];
            
            for (index = 0; index < arrayLength; index += chunk_size) {
                var myChunk: any = myArray.slice(index, index+chunk_size);
                // Do something if you want with the group
                tempArray.push(myChunk);
            }
        
            return tempArray;
        }

        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Activate DateTime Clock
            setInterval(updateClock, 1000);

            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...and other buttons
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("singleStepBtn")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // Initialize Memory Simulation
            _Memory = new Memory();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.

            // Start System Clock
            function updateClock(): void {
                var dateTime = Date().match(/(.*)\(/);
                $('#dateTime').html(dateTime[1]);
            }
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnEnableStep_click(btn): void {
            // Enable and Disable Single Step Mode
            _SingleStep = !_SingleStep;

            if (_SingleStep) {
                $('#singleStepBtn').attr('class', 'btn btn-danger');
                $('#singleStepBtn').html("Single Step Mode: ON");
                (<HTMLButtonElement>document.getElementById("stepOver")).disabled = false;
            }
            else {
                $('#singleStepBtn').attr('class', 'btn btn-success');
                $('#singleStepBtn').html("Single Step Mode: OFF");
                (<HTMLButtonElement>document.getElementById("stepOver")).disabled = true;
                if (!_CPU.isExecuting)
                    _CPU.isExecuting = true;
            }
        }

        public static hostBtnStep_click(btn): void {
            // Enable execution for one more instruction set
            _CPU.isExecuting = true;
            console.log("This Ran");
        }
    }
}
