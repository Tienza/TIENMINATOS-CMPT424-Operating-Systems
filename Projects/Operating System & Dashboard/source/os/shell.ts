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
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Verify user input and load into memory.");
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
            sc = new TSOS.ShellCommand(this.shellShiWoHoShii, "shiwohoshii", "- End It All.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
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
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
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

        public shellLoad(arg) {
            var userInput = $('#taProgramInput').val();
            var isHexValid: boolean = isHex(userInput).isHex;
            var message: string = "";

            if (isHexValid && userInput !== "")
                message = "Program is valid HEX, and will be loaded soon.";
            else
                message = "Please enter valid HEX and try again."

            _StdOut.putText(message);

            function isHex(userInput): { [key: string]: any} {
                var testInput: string = userInput.replace(/ /g, "");
                var testInputArray: string[] = testInput.split("");
                var isHex: boolean = true;
                for (var i = 0; i < testInputArray.length; i++) {
                    var processedString = parseInt(testInputArray[i], 16);
                    if ((processedString.toString(16) === testInputArray[i].toLowerCase()) === false) {
                        isHex = false;
                        break;
                    }
                }
                return { isHex: isHex, userInput: userInput };
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
            _StdOut.clearScreen();
            _StdOut.putText("Initializing Death of Operating System");
            // Call Kernel traperror routine.
            _Kernel.krnTrapError("In death we are all equal...");
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
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
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
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
