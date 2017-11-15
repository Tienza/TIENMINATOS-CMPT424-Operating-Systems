/* --------
   Utils.ts

   Utility functions.
   -------- */
var TSOS;
(function (TSOS) {
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.toHex = function (input) {
            var hexVal = "";
            for (var i = 0; i < input.length; i++) {
                hexVal += "" + input.charCodeAt(i).toString(16).toUpperCase();
            }
            return hexVal;
        };
        Utils.isHex = function (userInput) {
            var testInput = userInput.replace(/ /g, "");
            var testInputArray = testInput.split("");
            var isHex = true;
            for (var i = 0; i < testInputArray.length; i++) {
                var processedString = parseInt(testInputArray[i], 16);
                if ((processedString.toString(16) === testInputArray[i].toLowerCase()) === false) {
                    isHex = false;
                    break;
                }
            }
            return { isHex: isHex, hexVal: userInput };
        };
        Utils.cleanInput = function (userInput) {
            var workingString = userInput.replace(new RegExp(" ", 'g'), "");
            var workingArray = workingString.match(/.{1,2}/g);
            if (workingArray.length <= _SegmentSize) {
                // Append 00 to end of code for standardization
                for (var i = workingArray.length; i < _SegmentSize; i++) {
                    workingArray.push("00");
                }
                workingString = workingArray.join(" ").toUpperCase();
            }
            else {
                workingString = "Overflow";
            }
            return workingString;
        };
        Utils.trim = function (str) {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        };
        Utils.rot13 = function (str) {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal = "";
            for (var i in str) {
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13; // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13; // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                }
                else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        };
        return Utils;
    }());
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
