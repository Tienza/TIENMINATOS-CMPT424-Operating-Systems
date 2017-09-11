///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            _super.call(this, this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            // console.log("Key Code: " + keyCode);
            // console.log("Shifted: " + isShifted);
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed. - Letters
            if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            // Numbers and Their Shifted Equivalents
            else if (((keyCode >= 48) && (keyCode <= 57)) || (keyCode >= 186) && (keyCode <= 222) || (keyCode == 32)) {
                // Literal Symbols
                if ((keyCode >= 186) && (keyCode <= 222) && !isShifted) {
                    if (keyCode === 186)
                        chr = ";";
                    else if (keyCode === 187)
                        chr = "=";
                    else if (keyCode === 188)
                        chr = ",";
                    else if (keyCode === 189)
                        chr = "-";
                    else if (keyCode === 190)
                        chr = ".";
                    else if (keyCode === 191)
                        chr = "/";
                    else if (keyCode === 192)
                        chr = "`";
                    else if (keyCode === 219)
                        chr = "[";
                    else if (keyCode === 220)
                        chr = "\\";
                    else if (keyCode === 221)
                        chr = "]";
                    else if (keyCode === 222)
                        chr = "'";
                }
                // Check the shift key and re-adjust
                else if (isShifted) {
                    // Number Row Symbols - Shifted
                    if (keyCode === 48)
                        chr = ")";
                    else if (keyCode === 49)
                        chr = "!";
                    else if (keyCode === 50)
                        chr = "@";
                    else if (keyCode === 51)
                        chr = "#";
                    else if (keyCode === 52)
                        chr = "$";
                    else if (keyCode === 53)
                        chr = "%";
                    else if (keyCode === 54)
                        chr = "^";
                    else if (keyCode === 55)
                        chr = "&";
                    else if (keyCode === 56)
                        chr = "*";
                    else if (keyCode === 57)
                        chr = "(";
                    // Literal Symbols - Shifted
                    else if (keyCode === 186)
                        chr = ":";
                    else if (keyCode === 187)
                        chr = "+";
                    else if (keyCode === 188)
                        chr = "<";
                    else if (keyCode === 189)
                        chr = "_";
                    else if (keyCode === 190)
                        chr = ">";
                    else if (keyCode === 191)
                        chr = "?";
                    else if (keyCode === 192)
                        chr = "~";
                    else if (keyCode === 219)
                        chr = "{";
                    else if (keyCode === 220)
                        chr = "|";
                    else if (keyCode === 221)
                        chr = "}";
                    else if (keyCode === 222)
                        chr = "\"";
                }
                else
                    chr = String.fromCharCode(keyCode);

                // Send to Kernel Input
                _KernelInputQueue.enqueue(chr);
            }
            // Process Backspace
            else if (keyCode === 8) {
                chr = "backspace";
                _KernelInputQueue.enqueue(chr);
            }
            // Process Tab
            else if (keyCode === 9) {
                chr = "tab";
                _KernelInputQueue.enqueue(chr);
            }
            // Process Enter
            else if (keyCode === 13) {
                chr = "enter";
                _KernelInputQueue.enqueue(chr);
            }
            // Process Up_Key
            else if (keyCode === 38) {
                chr = "up_key";
                _KernelInputQueue.enqueue(chr);
            }
            // Process Down_Key
            else if (keyCode === 40) {
                chr = "down_key";
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
