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
            var now: Date = new Date();
            
            // Determine what lable type we want
            var lableType: string = (source === "HOST") ? "label-danger" : "label-info";

            // Format the Log Entry
            var str: string = "<div class=\"logEntry\"><div class=\"panel-body logMsg\"><small class=\"text-muted pull-left\"><strong class=\"date\">" + now + "</strong></small><small class=\"text-muted pull-right\"><strong class=\"clockPulse\">" + clock + "</strong></small></div><div class=\"panel-body logMsg\"><span class=\"source label " + lableType + " col-lg-2\">" + source + "</span><span class=\"msg col-lg-10\">" + msg + "</span></div></div><hr class=\"logLine\">";

            // See if we remove the first entry and replace it or not
            if (msg === _LastLogMsg) {
                $('.logEntry').first().remove();
                $('.logLine').first().remove();
            }

            $('#taHostLog').prepend(str);

            // Set _LastLogMsg to the current msg
            _LastLogMsg = msg;

            // TODO in the future: Optionally update a log database or some streaming service.
        }

        /* Memory Display Functions */
        public static placeDebugger(id: string) {
            var opCodes: string[] = ["A9", "AD", "8D", "6D", "A2", "AE", "A0", "AC", "EA", "EC", "D0", "EE", "FF"];
            var workingIndex: number = _Debuggers.indexOf(id);
            if (workingIndex < 0) {
                if (opCodes.indexOf($(id).html()) > -1) {
                    $(id).addClass('debugger');
                    _Debuggers.push(id);
                }
            }
            else {
                $(id).removeClass('debugger');
                _Debuggers.splice(workingIndex, 1);
            }
        }

        public static scrollToMemory(pcb: PCB, id: string) {
            // Format Memory Cell Id
            id = id.substr(1);
            // Format scrolling div id
            var scrollingId: string = "memoryScrolling" + pcb.memoryIndex;
            // Get the position of the current memory cell
            var position: number = document.getElementById(id).offsetTop;
            // Scroll to position
            document.getElementById(scrollingId).scrollTop = position;
        }

        public static highlightMemory(pcb: PCB, PC: number) {
            // Single highlight Op Codes
            var sh: string[] = ["FF", "00", "EA"];
            // Double highlight Op Codes
            var dh: string[] = ["A9", "A0", "A2", "D0"];
            // Unhighlight all Op Codes
            Control.unhighlightAll();
            // Get the instruction to see how many characters we need to highlight
            var instruction: string = _ProcessManager.fetchInstruction(pcb, PC);
            // Check to see what offset we need for highlighting
            PC += _MemoryManager.partitions[pcb.memoryIndex].base;

            var id: string = "#memory-cell-" + PC;
            var id2: string = "#memory-cell-" + (PC + 1);
            var id3: string = "#memory-cell-" + (PC + 2);

            // Determines how many more Op Codes we need to highlight
            if (sh.indexOf(instruction) > -1) {
                $(id).addClass('currentOp');

            }
            else if (dh.indexOf(instruction) > -1) {
                $(id).addClass('currentOp');
                $(id2).addClass('currentOpNext');
            }
            else {
                $(id).addClass('currentOp');
                $(id2).addClass('currentOpNext');
                $(id3).addClass('currentOpNext');
            }

            // Scoll to highlighted Op Code
            Control.scrollToMemory(pcb, id);
        }

        public static unhighlightAll(): void {
            for (var i: number = 0; i < _MemorySize; i++) {
                var id: string = "#memory-cell-" + i;
                var debugId: string = undefined;
                // Check if cell is debugger
                if ($(id).hasClass('debugger'))
                    debugId = id;

                $(id).attr('class', '');

                // If debugger is defined then highlight the background
                if (debugId)
                    $(debugId).attr('class', 'debugger');
            }
        }

        public static switchMemoryTab(pcb: PCB): void {
            var id: string = "#memory-" + pcb.memoryIndex + "-tab";
            $(id).click();
        }

        public static updateMemoryDisplay(memoryIndex: number): void {
            // See initializeMemoryDisplay() similar but for a specific partition
            var workingPartition: {[key: string]: any} = _MemoryManager.partitions[memoryIndex];
            // Break the array into collection of 8 instructions
            var memoryPartition: string[] = Control.chunkPartition(_Memory.memoryArray[memoryIndex], 8);
            // Initialize the display string
            var memoryDisplay: string = "";
            // For looping over the collection of 8 instructions
            var subPartitionCounter: number = -1;
            // The index of the beginning of each collection of 8 instructions
            var workingSegment: number = workingPartition.base;
            // For keeping track of every instruction in this partition of memory
            var workingIndex: number = workingPartition.base;
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
                        memoryDisplay += "<td id=\"memory-cell-" + workingIndex + "\" onclick=\"TSOS.Control.placeDebugger('#memory-cell-" + workingIndex + "')\">" + memoryPartition[subPartitionCounter][k].toUpperCase() + "</td>";
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
            for (var par: number = 0; par < _MemoryManager.partitions.length; par++) {
                var workingPartition: {[key: string]: any} = _MemoryManager.partitions[par];
                // Break the array into collection of 8 instructions
                var memoryPartition: string[] = Control.chunkPartition(_Memory.memoryArray[workingPartition.memoryIndex], 8);
                // Initialize the display string
                var memoryDisplay: string = "";
                // For looping over the collection of 8 instructions
                var subPartitionCounter: number = -1;
                // The index of the beginning of each collection of 8 instructions
                var workingSegment: number = workingPartition.base;
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
                            memoryDisplay += "<td>" + memoryPartition[subPartitionCounter][k].toUpperCase() + "</td>";
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

        /* CPU && Process Display Functions */
        public static updateCPUDisplay(cpu: CPU) {
            var cpuDisplay: string = "<tr><td>" + Control.formatHex(cpu.PC) + "</td><td>" + cpu.instruction + "</td><td>" + Control.formatHex(cpu.Acc) + "</td><td>" + Control.formatHex(cpu.Xreg) + "</td><td>" + Control.formatHex(cpu.Yreg) + "</td><td>" + Control.formatHex(cpu.Zflag) + "</td></tr>";

            $("#cpuDisplay").html(cpuDisplay);
        }

        public static initializeProcessDisplay(pcb: PCB): void {
            var rowId: string = "process-row-" + pcb.programId;
            var processDisplay: string = "<tr id=\"" + rowId + "\"><td>" + Control.formatHex(pcb.programId) + "</td><td>" + Control.formatHex(pcb.priority) + "</td><td>" + pcb.state + "</td><td>" + Control.formatHex(pcb.PC) + "</td><td>" + pcb.instruction + "</td><td>" + Control.formatHex(pcb.Acc) + "</td><td>" + Control.formatHex(pcb.Xreg) + "</td><td>" + Control.formatHex(pcb.Yreg) + "</td><td>" + Control.formatHex(pcb.Zflag) + "</td></tr>";

            $('#processDisplay').append(processDisplay);
        }

        public static updateProcessDisplay(pcb: PCB): void {
            var rowId: string = "#process-row-" + pcb.programId;
            var processDisplay: string = "<td>" + Control.formatHex(pcb.programId) + "</td><td>" + Control.formatHex(pcb.priority) + "</td><td>" + pcb.state + "</td><td>" + Control.formatHex(pcb.PC) + "</td><td>" + pcb.instruction + "</td><td>" + Control.formatHex(pcb.Acc) + "</td><td>" + Control.formatHex(pcb.Xreg) + "</td><td>" + Control.formatHex(pcb.Yreg) + "</td><td>" + Control.formatHex(pcb.Zflag) + "</td></tr>";

            $(rowId).html(processDisplay);
        }

        public static removeProcessDisplay(programId: number): void {
            var rowId: string = "#process-row-" + programId;
            $(rowId).remove();
        }

        public static formatHex(input: any): string {
            var hex: string = input.toString(16);
            if (hex.length < 2)
                hex = "0" + hex;
            return hex.toUpperCase();                
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
            (<HTMLButtonElement>document.getElementById("showWTTAT")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new CPU();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            
            // Initialize CPU Display
            Control.updateCPUDisplay(_CPU);

            // Initialize Memory Simulation
            _Memory = new Memory();
            
            // Initialize Memory Accessor
            _MemoryAccessor = new MemoryAccessor();

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
            Control.hostLog("Emergency halt", "HOST");
            Control.hostLog("Attempting Kernel shutdown.", "HOST");
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
                $('#singleStepBtn').attr('class', 'btn btn-success');
                $('#singleStepBtn').html("Single Step Mode: <b>ON</b>");
                (<HTMLButtonElement>document.getElementById("stepOver")).disabled = false;
            }
            else {
                $('#singleStepBtn').attr('class', 'btn btn-danger');
                $('#singleStepBtn').html("Single Step Mode: <b>OFF</b>");
                (<HTMLButtonElement>document.getElementById("stepOver")).disabled = true;
                if (!_CPU.isExecuting)
                    _CPU.isExecuting = true;
            }
        }

        public static hostBtnStep_click(btn): void {
            // Enable execution for one more instruction set
            _CPU.isExecuting = true;
        }

        public static hostBtnWTTAT_click(btn): void {
            _CalculateWTTAT = !_CalculateWTTAT;

            if (_CalculateWTTAT) {
                $('#showWTTAT').attr('class', 'btn btn-success');
                $('#showWTTAT').html("Show WT/TAT: <b>ON</b>");
            }
            else {
                $('#showWTTAT').attr('class', 'btn btn-danger');
                $('#showWTTAT').html("Show WT/TAT: <b>OFF</b>");
            }
        }
    }
}
