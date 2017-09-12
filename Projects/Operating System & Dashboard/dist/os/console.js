///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // console.log(chr);
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).

                /* ------------------- Start Key Handling Section ------------------- */
                // Process Enter
                if (chr === "enter") {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // Push to CommandList for up && down key presses
                    if (this.buffer !== "" && _CommandList[_CommandList.length - 1] !== this.buffer)
                        _CommandList.push(this.buffer);
                    // Set CommandIndex to last command entered
                    _CommandIndex = _CommandList.length;
                    // ... and reset our buffer.
                    this.buffer = "";
                    // console.log(_CommandList);
                }
                // Process Tab
                else if (chr === "tab") {
                    this.clearLine();
                    // console.log("Old _TabCompleIndex: " + _TabCompleteIndex);
                    // Increment _TabCompleteIndex for Tab Completion - If end reached reset the index
                    if (_TabCompleteIndex < _TabCompleteList.length)
                        _TabCompleteIndex++;
                    else if (_TabCompleteIndex >= _TabCompleteList.length - 1)
                        _TabCompleteIndex = 0;
                    // console.log("New _TabCompleteIndex: " + _TabCompleteIndex);
                    // Enter the complete/predicted command into the console and set the buffer to the command
                    if (_TabCompleteIndex < _TabCompleteList.length) {
                        this.putText(_TabCompleteList[_TabCompleteIndex]);
                        this.buffer = _TabCompleteList[_TabCompleteIndex];
                    }
                    else {
                        this.putText("");
                        this.buffer = "";
                    }
                }
                // Process Backspace
                else if (chr === "backspace") {
                    if (this.buffer !== "")
                        this.handleBackSpace();
                    // Generate the _TabCompleteList && Reset _TabCompleteIndex
                    _TabCompleteList = this.tabComplete(this.buffer, _ShellCommandList);
                    _TabCompleteIndex = -1;
                    // console.log(_TabCompleteList);
                }
                // Process Up_Key && Down_Key
                else if (chr === "up_key" || chr === "down_key") {
                    this.clearLine();
                    // console.log("Ready to input previous command...");
                    
                    if (chr === "up_key") {
                        if (_CommandIndex > 0)
                            _CommandIndex--;
                    }
                    else {
                        if (_CommandIndex < _CommandList.length)
                            _CommandIndex++;

                    }
                    // console.log("_CommandIndex: " + _CommandIndex);
                    // Enter the command into the console and set the buffer to the command
                    if (_CommandIndex < _CommandList.length) {
                        this.putText(_CommandList[_CommandIndex]);
                        this.buffer = _CommandList[_CommandIndex];
                    }
                    else {
                        this.putText("");
                        this.buffer = "";
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                    // console.log(this.buffer);
                    // Generate the _TabCompleteList && Reset _TabCompleteIndex
                    _TabCompleteList = this.tabComplete(this.buffer, _ShellCommandList);
                    _TabCompleteIndex = -1;
                    // console.log(_TabCompleteList);
                }
            }
        };
        Console.prototype.tabComplete = function (key, array) {
            // The variable results needs var in this case (without 'var' a global variable is created)
            var results = [];
            for (var i = 0; i < array.length; i++) {
                if (array[i].indexOf(key) === 0) {
                    results.push(array[i]);
                }
            }
            return results;
        }
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "" && text !== "\n") {
                if (this.currentXPosition >= _MaxXPosition) {
                    this.handleLineWrap();
                }
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
                // console.log("currentXPosition: " + this.currentXPosition);
                // console.log("currentYPosition: " + this.currentYPosition);
            }
            else if (text !== "" && text === "\n") {
                this.advanceLine();
            }
        };
        Console.prototype.handleLineWrap = function () {
            _WrappedPosition.push({ X: this.currentXPosition, Y: this.currentYPosition });
            this.advanceLine();
            this.currentXPosition = 0;
            // console.log(_WrappedPosition);
        }
        Console.prototype.handleScrolling = function () {
            // Clear the screen and reset the XY positions
            var scrollBy = this.currentYPosition - _MaxYPosition;
            // console.log(scrollBy);
            var img = _DrawingContext.getImageData(0, 21, _MaxXPosition, _MaxYPosition);
            this.currentYPosition -= scrollBy;
            this.clearScreen();
            // console.log(this.currentYPosition);
            _DrawingContext.putImageData(img, 0, 0);

            /*this.clearScreen();
            this.resetXY();
            // Calculate where the first line break was and remove all elements before it
            var firstLineBreak = _ConsoleBuffer.indexOf("\n");
            for (var i = 0; i <= firstLineBreak; i++) {
                _ConsoleBuffer.shift();
            }
            //console.log(_ConsoleBuffer);
            // console.log(_ConsoleBuffer.length);
            // Set Scrolling to true to stop insertion into the _ConsoleBuffer
            _ConsoleScrolling = true;
            // Redraw the _ConsoleBuffer into the Console
            for (var j = 0; j < _ConsoleBuffer.length; j ++) {
                this.putText(_ConsoleBuffer[j]);
            }
            // Set Scrolling to false to restart insertion into the _ConsoleBuffer
            _ConsoleScrolling = false;*/

        }
        Console.prototype.handleBackSpace = function () {
            if (this.currentXPosition <= 0) {
                this.currentXPosition = _WrappedPosition[_WrappedPosition.length - 1].X;
                this.currentYPosition = _WrappedPosition[_WrappedPosition.length - 1].Y;
                _WrappedPosition.pop();
            }
            var lastChar = this.buffer[this.buffer.length - 1];
            var xOffSet = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);
            this.currentXPosition = this.currentXPosition - xOffSet;
            // Redraw the input in the console
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, this.currentXPosition + xOffSet, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            // Delete the last character from the buffer
            this.buffer = this.buffer.slice(0, -1);
            // console.log(this.buffer);
            // console.log("currentXPosition: " + this.currentXPosition);
            // console.log("currentYPosition: " + this.currentYPosition);
        };
        Console.prototype.clearLine = function () {
            var bufferLength = 0;
            if (this.buffer !== "")
                bufferLength = this.buffer.split("").length;

            for (var i = 0; i < bufferLength; i++) {
                this.handleBackSpace();
            }
        }
        Console.prototype.advanceLine = function () {
            // Reset currentXPosition to the start of the console
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
            // TODO: Handle scrolling. (iProject 1)
            if (this.currentYPosition > _MaxYPosition) {
                this.handleScrolling();
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
