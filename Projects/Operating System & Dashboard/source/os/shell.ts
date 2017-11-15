///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = "TienminatOS$~";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.
            // alan
            sc = new TSOS.ShellCommand(this.shellAlan, "alan", "- A place of wonders!");
            this.commandList[this.commandList.length] = sc;
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " < [empty] | [int] > - Verify user input and load user program into memory. If priority null, default is 3");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "< PID > - Run the designated program.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "Run all programs in memory.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "Display PID of all active processes.");
            this.commandList[this.commandList.length] = sc;
            // kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "< PID > - Kill the designated process.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", "Clear all memory partitions.");
            this.commandList[this.commandList.length] = sc;
            // quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "< int > - Modify the quantum of Round Robin Scheudling");
            this.commandList[this.commandList.length] = sc;
            // scheduler
            sc = new TSOS.ShellCommand(this.shellScheduler, "scheduler", "< [empty] | rr | sjf | fcfs | priority > - Get/Set the scheduling algoritm");
            this.commandList[this.commandList.length] = sc;
            // toggle
            sc = new TSOS.ShellCommand(this.shellToggle, "toggle", "< wttat | ssm > - Toggle the various modes of the operating system");
            this.commandList[this.commandList.length] = sc;
            // create
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "< filename > - Creates a file on the hard disk");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;
            // time
            sc = new TSOS.ShellCommand(this.shellTime, "time", "- Displays the current time.");
            this.commandList[this.commandList.length] = sc;
            // datetime
            sc = new TSOS.ShellCommand(this.shellDateTime, "datetime", "- Displays the current datetime.");
            this.commandList[this.commandList.length] = sc;
            // latlong
            sc = new TSOS.ShellCommand(this.shellLatLong, "latlong", "- Displays user's current latlong.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Where are you?");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // 死を欲しい - death - shiohoshii
            sc = new TSOS.ShellCommand(this.shellShiWoHoShii, "shiwohoshii", "- End It All (Soft Audio Warning).");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // clear
            sc = new TSOS.ShellCommand(this.shellCls, "clear", "- Alias for \"cls\".");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the status.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public loadCommands(): string[] {
            var ShellCommandList: string[] = []
            // Add all the command strings to the global command list
            for (var i: number = 0; i < this.commandList.length; i++) {
                ShellCommandList.push(this.commandList[i].command);
            }

            return ShellCommandList;
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } 
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } 
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                }
                else if (buffer === "") {
                    _StdOut.advanceLine();
                    this.putPrompt();
                } 
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);

            // 2. Lower-case it. - Unless it is the 'status' command
            if (!/^status/.test(buffer))
                buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.

            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }

            return retVal;;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        }

        public shellAlan(args) {
            _StdOut.putText("I apologies...It had to be done");
            _StdOut.advanceLine();

            var win = window.open('http://www-03.ibm.com/software/products/en/ibmnotes', '_blank');
            if (win) {
                _StdOut.putText("My Gift To Thee :D");
                _StdOut.advanceLine();
                //Browser has allowed it to be opened
                win.focus();
            }
            else {
                //Browser has blocked it
                _StdOut.putText("Damn it! Please allow popups for this feature.");
                _StdOut.advanceLine();
            }
        }

        public shellVer(args) {
            var version: string = APP_NAME + " version " + APP_VERSION + ": " + USER_AGENT;
            var messageArray: string[] = version.split("");
            for (var i = 0; i < messageArray.length; i++) {
                _StdOut.putText(messageArray[i]);
            }
        }

        public shellLoad(args) {
            var userInput = $('#taProgramInput').val();
            userInput = TSOS.Utils.cleanInput(userInput);
            var hexObj: { [key: string]: any } = TSOS.Utils.isHex(userInput);
            var isHexValid: boolean = hexObj.isHex;
            
            if (userInput !== "Overflow") {
                if (isHexValid && userInput !== "") {
                    hexObj.hexVal = hexObj.hexVal.split(" ");
                    // Declare a new PCB for the program
                    var pcb = new PCB();
                    // If priority is provided then set the priority of the program
                    if (args.length > 0 && /\d+/.test(args[0])) {
                        pcb.priority = parseInt(args[0]);
                        _StdOut.putText("Program priority set to " + args[0]);
                        _StdOut.advanceLine();
                    }
                    else if (args.length === 0) {
                        // Do Nothing
                    }
                    else {
                        _StdOut.putText("Invalid priority argument. Defaulting to 3");
                    }
                    // Increment the _ProcessCount
                    _ProcessCount++;
                    _MemoryManager.loadProgram(hexObj.hexVal, pcb);
                    // Switch to active Memory Tab
                    Control.switchMemoryTab(pcb);
                }
                else
                    _StdOut.putText("Please enter valid HEX and try again.");
            }
            else {
                _StdOut.putText("User input is too large, please reduce size and try again");
            }
        }

        public shellRun(args) {
            if (args.length > 0) {
                var pcb: PCB = _ProcessManager.getPCB(parseInt(args[0]));
                if (pcb) {
                    Control.switchMemoryTab(pcb);
                    _ProcessManager.runProcess(pcb);
                }
                else {
                    _StdOut.putText("Specified PID does not exist.");
                }
            }
            else 
                _StdOut.putText("Missing/Invalid PID. Please try again");
        }

        public shellRunAll(args) {
            if (_ProcessManager.processList.length > 0) {
                _ProcessManager.runAllProcess();
            }
            else
                _StdOut.putText("Memory is empty! Please load processes and try again");
        }

        public shellPS(args) {
            // Format the list of active processes
            var ps: string = ""
            for (var i: number = 0; i < _ProcessManager.processList.length; i++) {
                var currentPCB: PCB = _ProcessManager.processList[i]
                ps += "[PID: " + currentPCB.programId + ", State: " + currentPCB.state + "] | ";
            }
            ps = ps.substr(0, ps.length - 3);

            // Print out the active processes
           _StdOut.printLongText(ps);
        }

        public shellKill(args) {
            if (args.length > 0) {
                var pcb: PCB = _ProcessManager.getPCB(parseInt(args[0]));
                if (pcb) {
                    _ProcessManager.terminateProcess(pcb);
                    if (_ProcessManager.isRunningAll) {
                        _ProcessManager.removePCBFromReadyQueue(pcb.programId);
                    }
                    _StdOut.putText("Process PID: " + pcb.programId + " Successfully Killed");
                }
                else {
                    _StdOut.putText("Specified PID is not active or does not exist")
                }
            }
            else {
                _StdOut.putText("Missing/Invalid PID. Please try again");
            }
        }

        public shellClearmem(args) {
            if (args.length > 0 && /\d+/.test(args[0])) {
                var partition: number = parseInt(args[0]);
                var pcb: PCB = _ProcessManager.getPCBbyParition(partition);
                if ([0, 1, 2].indexOf(partition) > -1 && pcb) {
                    _MemoryManager.wipeParition(partition);
                    _MemoryManager.showAllPartitions();
                    _MemoryManager.freePartition(partition)
                    // Remove the PCB stored at that location
                    _ProcessManager.removePCB(pcb.programId);
                    Control.removeProcessDisplay(pcb.programId)
                    // Update Memory Display
                    Control.updateMemoryDisplay(partition);
                    _StdOut.putText("Memory partition " + partition + " successfully cleared");
                }
                else {
                    _StdOut.putText("Invalid partition number: " + partition + ". Please try again")
                }
            }
            else {
                _MemoryManager.wipeAllPartitions();
                _MemoryManager.showAllPartitions();
                // Update Memory Display
                Control.initializeMemoryDisplay();
                _StdOut.putText("All memory partitions successfully cleared");
            }
        }

        public shellQuantum(args) {
            if (args.length > 0 && /\d+/.test(args[0])) {
                _StdOut.putText("Quantum changed from " + _Scheduler.roundRobinQuantum + " cycles to " + args[0] + " cycles")
                _Scheduler.roundRobinQuantum = parseInt(args[0]);
            }
            else {
                _StdOut.putText("Current Quantum: " + _Scheduler.roundRobinQuantum + " cycles");
            }
        }

        public shellScheduler(args) {
            if (args.length > 0) {
                var scheduleIndex = _Scheduler.algoType.indexOf(args[0]);
                if (scheduleIndex > -1) {
                    // Set the scheduling algorithm
                    _Scheduler.algorithm = args[0];
                    _StdOut.putText("Scheduling algorithm set to: " + _Scheduler.aFullName[scheduleIndex]);
                    // Change the schedule display
                    $('#schedulingAlgo').html(_Scheduler.aFullName[scheduleIndex]);
                }
                else {
                    _StdOut.putText("Invalid scheduling algorithm. Please try again");
                }
            }
            else {
                _StdOut.putText("Current scheduling algorithm: " + _Scheduler.aFullName[_Scheduler.algoType.indexOf(_Scheduler.algorithm)]);
            }
        }

        public shellToggle(args) {
            if (args.length > 0) {
                var modes: string[] = ["wttat", "ssm"];
                var mode: string = args[0];
                if (modes.indexOf(mode) > -1) {
                    switch(mode) {
                        case "wttat":
                            $('#showWTTAT').click();
                            break;
                        case "ssm":
                            $('#singleStepBtn').click();
                            break;
                    }
                }
                else {
                    _StdOut.putText("Invalid mode. Please try again");
                }
            }
            else {
                _StdOut.putText("< Print WT/TAT: " + _CalculateWTTAT.toString().toUpperCase() + " | Single Step Mode: " + _SingleStep.toString().toUpperCase() + " >");
            }
        }

        public shellCreate(args) {
            if (args.length > 0) {
                var fileName: string = args[0];
                var parameters: string[] = ["create", fileName];
                console.log(FILE_SYSTEM_IRQ);
                _KernelInterruptQueue.enqueue(new Interrupt(FILE_SYSTEM_IRQ, parameters));
            }
            else {
                _StdOut.putText("Please provide a file name and try again");
            }
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                var command: string = "  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description;
                var commandDetails: string[] = command.split("");
                for (var j in commandDetails)
                    _StdOut.putText(commandDetails[j]);
            }
        }

        public shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellShiWoHoShii(args) {
            // Trunkate the Canvas
            $('#display').attr('height', 414);
            $('#canvasScroll').css('background-color', '#000000');
            // Declare variables for seal and sound
            var heresy = document.getElementById("heresy");
            var fetchAudio = document.getElementById("fetch");

            // Black out the Canvas
            _DrawingContext.fillStyle = "#000000";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.drawImage(heresy, 100, 30);

            fetchAudio.play();

            _Kernel.krnTrapError("In death we are all equal...");
        }

        public shellCls(args) {
            $('#display').attr('height', 414);
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                var description: string = undefined;
                // Cycle through command list to get the description of the command
                for (var i: number = 0; i < _OsShell.commandList.length; i++) {
                    if (topic === _OsShell.commandList[i].command) {
                        description = _OsShell.commandList[i].description;
                        break;
                    }
                }
                // Print out the description
                if (description) {
                    _StdOut.printLongText(description);
                }
                else {
                    _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } 
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellStatus(args) {
            if (args.length > 0) {
                var status = "";
                for (var i = 0; i < args.length; i++) {
                    status += (i !== args.length - 1) ? args[i] + " " : args[i];
                }
                $('#status').html(encodeHTML(status));
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }

            function encodeHTML(string: string) {
                return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
            }
        }

        public shellDate(args) {
            var today: Date = new Date();
            var dd: number = today.getDate();
            var mm: number = today.getMonth() + 1; //January is 0!
            var year = today.getFullYear();
            var month: string = "" + mm;
            var day: string = "" + dd;

            if (dd < 10) {
                day = "0" + dd
            }

            if (mm < 10) {
                month = "0" + mm
            }

            var todayDate: string = year + "-" + month + "-" + day;
            _StdOut.putText(todayDate);
        }

        public shellTime(args) {
            var d = new Date();

            var hh = (d.getHours() < 10 ? "0" : "") + d.getHours();
            var mm = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
            var ss = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();

            var time = hh + ":" + mm + ":" + ss;

            _StdOut.putText(time);
        }

        public shellDateTime(args) {
            _StdOut.putText(Date());
        }

        public shellLatLong(args) {
            getLocation();

            function getLocation(): void {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(showPosition);
                } else {
                    _StdOut.putText("Geolocation is not supported by this browser.");
                }
                function showPosition(position) {
                    if (position.coords.latitude && position.coords.longitude)
                        _StdOut.putText("Latitude: " + position.coords.latitude + " / Longitude: " + position.coords.longitude);
                    else
                        _StdOut.putText("User apparently does not want to be stalked... :(");
                }
            }
        }

        public shellWhereAmI(args) {
            var existentialCrisis: string = "Where are any of us really? Is there even a point to contemplate such a moot point? We are here, we are there, we can be anywhere we want if we change our point of reference. So the question becomes - Should you ask where you are to the rest of the world or where the rest of the world is to you? For the real answer type 'latlong'";
            var message: string[] = existentialCrisis.split("");
            // Sends the message to the console
            for (var i = 0; i < message.length; i++) {
                _StdOut.putText(message[i]);
            }
        }
    }
}
