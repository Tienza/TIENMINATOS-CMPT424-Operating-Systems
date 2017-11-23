/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static getDateTime(): string {
            var now = new Date();
            var year = "" + now.getFullYear();
            var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
            var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
            var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
            var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
            var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
            
            return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        }

        public static toHex(input: string): string {
            var hexVal: string = "";

            for(var i: number = 0; i < input.length; i++) {
                hexVal += input.charCodeAt(i).toString(16).toUpperCase();
            }
            
            return hexVal;
        }

        public static fromHex(input: string): string {
            var asciiVal: string = "";

            for (var i: number = 0; i < input.length; i += 2) {
                asciiVal += String.fromCharCode(parseInt(input.substr(i, 2), 16));
            }

            return asciiVal;
        }

        public static isHex(userInput): {[key: string]: any} {
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
            return { isHex: isHex, hexVal: userInput };
        }

        public static cleanInput(userInput): string {
            var workingString: string = userInput.replace(new RegExp(" ", 'g'), "");
            var workingArray: string[] = workingString.match(/.{1,2}/g);
            if (workingArray.length <= _SegmentSize) {
                // Append 00 to end of code for standardization
                for (var i: number = workingArray.length; i < _SegmentSize; i++) {
                    workingArray.push("00");
                }
                workingString = workingArray.join(" ").toUpperCase();
            }
            else {
                workingString = "Overflow";
            }

            return workingString;
        }

        public static trim(str): string {
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
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }
    }
}
