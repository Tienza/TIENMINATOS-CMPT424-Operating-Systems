///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            if (this.buffer !== "" && !_CPU.isExecuting) {
                var xOffSet: number = _DrawingContext.measureText(this.currentFont, this.currentFontSize, "_");
                this.currentXPosition = this.currentXPosition - xOffSet;
                // Redraw the input in the console
                _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, this.currentXPosition + xOffSet, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            }
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr: string = _KernelInputQueue.dequeue();
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
            if (this.buffer !== "" && !_CPU.isExecuting)
                this.putText("_");
        }

        public tabComplete(key: string, array: string[]): string[] {
            // The variable results needs var in this case (without 'var' a global variable is created)
            var results = [];
            for (var i = 0; i < array.length; i++) {
                if (array[i].indexOf(key) === 0) {
                    results.push(array[i]);
                }
            }
            return results;
        }

        public printOSFeedBack(text: string): void {
            for (var i: number = 0; i < text.length; i++) {
                this.putText(text[i]);
            }
            this.advanceLine();
            _OsShell.putPrompt();
        }

        public printLongText(text: string): void {
            for (var i: number = 0; i < text.length; i++) {
                this.putText(text[i]);
            }
        }

        public verticalList(textList: string[]): void {
            for (var i: number = 0; i < textList.length; i ++) {
                this.printLongText(textList[i]);
                this.advanceLine();
            }
        }

        public putText(text: string): void {
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
                var offset: number = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
                // console.log("currentXPosition: " + this.currentXPosition);
                // console.log("currentYPosition: " + this.currentYPosition);
            }
            else if (text !== "" && text === "\n") {
                this.advanceLine();
            }
         }

        public handleLineWrap(): void {
            _WrappedPosition.push({ X: this.currentXPosition, Y: this.currentYPosition });
            this.advanceLine();
            this.currentXPosition = 0;
        }

        public handleScrolling(prevYPosition: number): void {
            // Clear the screen and reset the XY positions
            //var scrollBy: number = this.currentYPosition - _MaxYPosition;
            // console.log(scrollBy);
            var img = _DrawingContext.getImageData(0, 0, _MaxXPosition + 10, prevYPosition + 4);
            this.clearScreen();
            $('#display').attr('height', this.currentYPosition + 6);
            //this.currentYPosition -= scrollBy;
            // console.log(this.currentYPosition);
            _DrawingContext.putImageData(img, 0, 0);
            $('#canvasScroll').scrollTop($('#canvasScroll')[0].scrollHeight);
        }

        public handleBackSpace(): void {
            if (this.currentXPosition <= 0) {
                this.currentXPosition = _WrappedPosition[_WrappedPosition.length - 1].X;
                this.currentYPosition = _WrappedPosition[_WrappedPosition.length - 1].Y;
                _WrappedPosition.pop();
            }
            var lastChar: string = this.buffer[this.buffer.length - 1];
            var xOffSet: number = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);
            this.currentXPosition = this.currentXPosition - xOffSet;
            // Redraw the input in the console
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, this.currentXPosition + xOffSet, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            // Delete the last character from the buffer
            this.buffer = this.buffer.slice(0, -1);
        }

        public clearLine(): void {
            var bufferLength: number = 0;
            if (this.buffer !== "")
                bufferLength = this.buffer.split("").length;

            for (var i = 0; i < bufferLength; i++) {
                this.handleBackSpace();
            }
        }

        public advanceLine(): void {
            // Reset currentXPosition to the start of the console
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            var prevYPosition: number = this.currentYPosition; 
            this.currentYPosition += _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
            // TODO: Handle scrolling. (iProject 1)
            if (this.currentYPosition > _MaxYPosition) {
                this.handleScrolling(prevYPosition);
            }
        }
    }
 }
