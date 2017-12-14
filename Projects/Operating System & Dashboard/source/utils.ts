/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static findSimilarCommands(command: string) {
            var similarObjects: {[key: string]: any} = [];
            var suggestedCommands: string[] = [];

            /* Find similar commands to suggest to the user */
            for (var i: number = 0; i < _ShellCommandList.length; i++) {
                var suggestedCommand: string =  _ShellCommandList[i];
                var similarity = TSOS.Utils.similarity(command,suggestedCommand);
                // Find the similarity and add to list if greater than 0.5
                if (similarity >= 0.5)
                    similarObjects.push({command: suggestedCommand, similarity: similarity});
            }
            // Sort the array of command objects in order of similarity
            similarObjects.sort(function (a, b) {
                // If a has higher similarity, a comes first
                if (a.similarity > b.similarity)
                    return -1;
                // If a has lower similarity Burst Time, b comes first
                if (a.similarity < b.similarity)
                    return 1;
                return 0
            });
            // Assemble the suggestedCommands array
            for (var i: number = 0; i < similarObjects.length; i++) {
                suggestedCommands.push("[" + similarObjects[i].command + "]");
            }

            // Format the suggested command array into a string
            var suggestedCommandsString: string = suggestedCommands.join(" | ");

            if (suggestedCommandsString === "")
                suggestedCommandsString = "I literally cannot even begin to comprehend what you want...";

            return "Suggested Commands: " + suggestedCommandsString;
        }

        public static isProperWriteData(data: string[]): boolean {
            var isProper = false;
            var firstWord: string = data[0];
            var lastWord: string = data[data.length - 1];
            
            if ((/^\"/.test(firstWord) && /\"$/.test(lastWord)) || (/^\'/.test(firstWord) && /\'$/.test(lastWord)))
                isProper = true;
            
            return isProper;
        }

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
                if (input[i] === "0" && input[i + 1] === "0")
                    break;
                else
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

        public static similarity(s1, s2) {
            var longer = s1;
            var shorter = s2;
            if (s1.length < s2.length) {
              longer = s2;
              shorter = s1;
            }
            var longerLength = longer.length;
            if (longerLength === 0) {
              return 1.0;
            }
            return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
            
            function editDistance(s1, s2) {
                s1 = s1.toLowerCase();
                s2 = s2.toLowerCase();
                
                var costs = [];
                for (var i = 0; i <= s1.length; i++) {
                    var lastValue = i;
                    for (var j = 0; j <= s2.length; j++) {
                        if (i === 0)
                            costs[j] = j;
                        else {
                            if (j > 0) {
                                var newValue = costs[j - 1];
                                if (s1.charAt(i - 1) != s2.charAt(j - 1))
                                newValue = Math.min(Math.min(newValue, lastValue),
                                    costs[j]) + 1;
                                costs[j - 1] = lastValue;
                                lastValue = newValue;
                            }
                        }
                    }
                    if (i > 0)
                        costs[s2.length] = lastValue;
                }

                return costs[s2.length];
            }
        }

        public static insertProgram(id: number): void {
            var opCodes: string = "";
            switch (id) {
                case 0:
                    opCodes = "00 66 61 6C 73 65 00 74 72 75 65 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 1:
                    opCodes = "AD 17 00 A0 17 8D 2A 00 A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 74 68 65 72 65 20 69 73 20 6E 6F 20 73 70 6F 6F 6E 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 2:
                    opCodes = "A9 00 8D 69 00 A9 00 8D 6A 00 A9 00 8D 6E 00 A9 05 8D 69 00 A9 01 8D 6A 00 A9 63 8D 6E 00 AC 6E 00 A2 02 FF A9 00 8D 6B 00 A9 5F 8D 6B 00 AC 6B 00 A2 02 FF A2 01 EC 6A 00 A0 54 D0 02 A0 5A A2 02 FF AD 61 00 A0 61 8D 6D 00 A2 02 FF AC 69 00 A2 01 FF 00 66 61 6C 73 65 00 74 72 75 65 00 20 00 20 00 69 6E 74 61 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 3:
                    opCodes = "A9 00 8D A6 00 A9 00 8D A7 00 A9 00 8D A6 00 A9 00 8D A7 00 A9 03 8D A8 00 AE A6 00 EC A8 00 A2 00 D0 02 A2 01 EC FF 00 D0 5D AC A6 00 A2 01 FF A9 03 8D A9 00 AE A7 00 EC A9 00 A2 00 D0 02 A2 01 EC FF 00 D0 2D AC A7 00 A2 01 FF A9 01 6D A7 00 8D A7 00 A9 02 8D AA 00 AE A7 00 EC AA 00 D0 0B AD 93 00 A0 93 8D AB 00 A2 02 FF A2 01 EC FF 00 D0 BD A9 00 8D A7 00 A9 01 6D A6 00 8D A6 00 A2 01 EC FF 00 D0 8D 00 66 61 6C 73 65 00 74 72 75 65 00 74 68 65 72 65 20 69 73 20 6E 6F 20 73 70 6F 6F 6E 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 4:
                    opCodes = "A9 00 8D C8 00 A9 01 8D C8 00 A9 01 8D C9 00 A2 01 EC C8 00 D0 16 A9 02 8D C8 00 AD 9E 00 A0 9E 8D CD 00 A2 02 FF AC C8 00 A2 01 FF A9 01 8D CA 00 AE C8 00 EC CA 00 A2 00 D0 02 A2 01 EC FF 00 D0 16 A9 03 8D C8 00 AD A8 00 A0 A8 8D CE 00 A2 02 FF AC C8 00 A2 01 FF A9 01 8D CB 00 AE C8 00 EC CA 00 D0 10 A9 03 8D C8 00 AD B3 00 A0 B3 8D CF 00 A2 02 FF AD 8C 00 A0 8C 8D CC 00 A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 20 74 68 69 73 20 77 6F 72 6B 73 20 72 69 67 68 74 00 61 20 69 73 20 6E 6F 77 20 00 20 61 20 69 73 20 6E 6F 77 20 00 74 68 69 73 20 64 6F 65 73 20 6E 6F 74 20 70 72 69 6E 74 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 5:
                    opCodes = "A9 00 8D D5 00 A9 00 8D D6 00 A9 D2 8D D6 00 A9 00 8D D7 00 A9 08 8D D7 00 A9 00 8D D8 00 A9 06 8D D8 00 A9 01 8D D5 00 A2 01 EC D5 00 A0 C7 D0 02 A0 CD A2 02 FF AC D6 00 A2 02 FF A9 00 8D D5 00 A2 01 EC D5 00 A0 C7 D0 02 A0 CD A2 02 FF AC D6 00 A2 02 FF A9 08 8D DA 00 AE D7 00 EC DA 00 A2 00 D0 02 A2 01 EC FF 00 A0 C7 D0 02 A0 CD A2 02 FF AC D6 00 A2 02 FF A9 02 6D D8 00 8D DB 00 AE D7 00 EC DB 00 A0 C7 D0 02 A0 CD A2 02 FF AE D8 00 EC D7 00 A2 00 D0 02 A2 01 EC FF 00 D0 0E A9 02 6D D8 00 8D D8 00 AC D6 00 A2 02 FF AE D7 00 EC D8 00 A2 00 D0 02 A2 01 EC FF 00 A0 C7 D0 02 A0 CD A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 20 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 6:
                    opCodes = "A9 00 8D 75 00 A9 00 8D 76 00 A9 01 8D 76 00 A9 6F 8D 75 00 A9 00 8D 77 00 A9 02 8D 77 00 AC 77 00 A2 01 FF A9 05 8D 79 00 AE 76 00 EC 79 00 A2 00 D0 02 A2 01 EC FF 00 D0 15 A9 01 6D 76 00 8D 76 00 AC 76 00 A2 01 FF A2 01 EC FF 00 D0 D5 A9 03 6D 76 00 8D 7A 00 AC 7A 00 A2 01 FF AC 75 00 A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 6D 65 6F 77 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 7:
                    opCodes = "A9 00 8D 99 00 A9 00 8D 9A 00 A9 00 8D 99 00 A9 00 8D 9A 00 A9 03 8D 9B 00 AE 99 00 EC 9B 00 A2 00 D0 02 A2 01 EC FF 00 D0 5D AC 99 00 A2 01 FF A9 03 8D 9C 00 AE 9A 00 EC 9C 00 A2 00 D0 02 A2 01 EC FF 00 D0 2D AC 9A 00 A2 01 FF A9 01 6D 9A 00 8D 9A 00 A9 02 8D 9D 00 AE 9A 00 EC 9D 00 D0 0B AD 93 00 A0 93 8D 9E 00 A2 02 FF A2 01 EC FF 00 D0 BD A9 00 8D 9A 00 A9 01 6D 99 00 8D 99 00 A2 01 EC FF 00 D0 8D 00 66 61 6C 73 65 00 74 72 75 65 00 6D 65 6F 77 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 8:
                    opCodes = "A9 00 8D DF 00 A9 00 8D DF 00 A9 05 8D E2 00 AE DF 00 EC E2 00 A2 00 D0 02 A2 01 EC FF 00 D0 15 AC DF 00 A2 01 FF A9 01 6D DF 00 8D DF 00 A2 01 EC FF 00 D0 D5 A9 01 8D E3 00 A2 01 EC E3 00 D0 0B AD C6 00 A0 C6 8D E6 00 A2 02 FF A9 01 8D E4 00 A2 00 EC E4 00 D0 0B AD D6 00 A0 D6 8D E7 00 A2 02 FF A9 00 8D E0 00 A9 C0 8D E0 00 A0 BB A2 02 FF AC E0 00 A2 02 FF A0 B5 A2 02 FF A9 00 8D E1 00 A9 00 8D E1 00 AC E0 00 A2 02 FF A2 01 EC E1 00 A0 B5 D0 02 A0 BB A2 02 FF A9 01 8D E1 00 AC E0 00 A2 02 FF A2 01 EC E1 00 A0 B5 D0 02 A0 BB A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 20 61 6E 64 20 00 74 68 65 79 20 61 72 65 20 65 71 75 61 6C 20 00 6E 6F 20 64 69 63 65 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 9:
                    opCodes = "A9 00 8D F1 00 A9 00 8D F1 00 A9 01 8D F2 00 AE F1 00 EC F2 00 A0 E5 D0 02 A0 EB A2 02 FF A2 01 EC F1 00 A0 E5 D0 02 A0 EB A2 02 FF A9 00 8D F3 00 AE F1 00 EC F3 00 A0 E5 D0 02 A0 EB A2 02 FF A2 00 EC F1 00 A0 E5 D0 02 A0 EB A2 02 FF A9 01 8D F4 00 AE F1 00 EC F4 00 A2 00 D0 02 A2 01 EC FF 00 A0 E5 D0 02 A0 EB A2 02 FF A2 01 EC F1 00 A2 00 D0 02 A2 01 EC FF 00 A0 E5 D0 02 A0 EB A2 02 FF A9 00 8D F5 00 AE F1 00 EC F5 00 A2 00 D0 02 A2 01 EC FF 00 A0 E5 D0 02 A0 EB A2 02 FF A2 00 EC F1 00 A2 00 D0 02 A2 01 EC FF 00 A0 E5 D0 02 A0 EB A2 02 FF A2 01 EC F1 00 A0 E5 D0 02 A0 EB A2 02 FF A9 00 8D F6 00 AE F1 00 EC F6 00 D0 05 A9 01 8D F1 00 A2 01 EC F1 00 A0 E5 D0 02 A0 EB A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 10:
                    opCodes = "A9 00 8D E6 00 A9 03 8D E7 00 AE E6 00 EC E7 00 A2 00 D0 02 A2 01 EC FF 00 D0 2A A9 03 8D F1 00 A9 02 6D F1 00 8D F0 00 A9 01 6D F0 00 8D F0 00 AC F0 00 A2 01 FF A9 01 6D E6 00 8D E6 00 A2 01 EC FF 00 D0 C0 A9 03 8D E8 00 A9 02 6D E8 00 8D E8 00 A9 01 8D EC 00 A9 01 6D EC 00 8D EB 00 A9 01 6D EB 00 8D EA 00 A9 01 6D EA 00 8D E9 00 A9 01 6D E9 00 8D E9 00 AE E9 00 EC E8 00 D0 0B AD D6 00 A0 D6 8D F2 00 A2 02 FF A9 08 8D ED 00 A9 03 8D EF 00 A9 05 6D EF 00 8D EE 00 A9 01 6D EE 00 8D EE 00 AE EE 00 EC ED 00 A2 00 D0 02 A2 01 EC FF 00 D0 0B AD CB 00 A0 CB 8D F3 00 A2 02 FF A0 D1 A2 02 FF A0 D1 A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 61 64 64 69 74 69 6F 6E 20 63 68 65 63 6B 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 11:
                    opCodes = "A9 00 8D 9C 00 A9 04 8D 9C 00 A9 00 8D 9D 00 A9 04 8D 9E 00 A9 04 6D 9E 00 8D 9D 00 A9 03 6D 9D 00 8D 9F 00 A9 01 6D 9C 00 8D A0 00 AE A0 00 EC 9F 00 A2 00 D0 02 A2 01 EC FF 00 D0 2B A9 01 6D 9C 00 8D 9C 00 AD 8F 00 A0 8F 8D A2 00 A2 02 FF AC 9C 00 A2 01 FF AD 99 00 A0 99 8D A3 00 A2 02 FF A2 01 EC FF 00 D0 B4 AD 85 00 A0 85 8D A1 00 A2 02 FF AC 9D 00 A2 01 FF 00 66 61 6C 73 65 00 74 72 75 65 00 69 6E 74 20 6D 20 69 73 20 00 69 6E 74 20 61 20 69 73 20 00 20 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                case 12:
                    opCodes = "A9 00 8D F5 00 A9 01 8D F5 00 A9 01 8D F6 00 A2 01 EC F5 00 D0 10 A9 02 8D F5 00 AD A5 00 A0 A5 8D FB 00 A2 02 FF A9 01 8D F7 00 AE F5 00 EC F7 00 A2 00 D0 02 A2 01 EC FF 00 D0 10 A9 03 8D F5 00 AD B2 00 A0 B2 8D FC 00 A2 02 FF A9 01 8D F8 00 AE F5 00 EC F7 00 D0 10 A9 03 8D F5 00 AD C2 00 A0 C2 8D FD 00 A2 02 FF A2 00 EC FF 00 D0 12 AD D6 00 A0 D6 8D FE 00 A2 02 FF A2 01 EC FF 00 D0 E7 A9 00 8D 9A 00 A2 01 EC 9A 00 D0 0B AD F0 00 A0 F0 8D FF 00 A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 61 20 6E 6F 77 20 69 73 20 74 77 6F 00 20 61 20 6E 6F 77 20 69 73 20 74 68 72 65 65 00 74 68 69 73 20 64 6F 65 73 20 6E 6F 74 20 70 72 69 6E 74 00 20 74 68 69 73 20 77 69 6C 6C 20 61 6C 77 61 79 73 20 62 65 20 74 72 75 65 00 74 68 69 00 00 00 00 00 00 00 00 00 00 00 00 00";
                    break;
                    
            }
            // Set User Input
            $('#taProgramInput').val(opCodes);
            // Load Program
            _KernelInputQueue.enqueue('l');
            _KernelInputQueue.enqueue('o');
            _KernelInputQueue.enqueue('a');
            _KernelInputQueue.enqueue('d');
            _Kernel.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
            // Run Program
            _KernelInputQueue.enqueue('r');
            _KernelInputQueue.enqueue('u');
            _KernelInputQueue.enqueue('n');
            _KernelInputQueue.enqueue(' ');
            _KernelInputQueue.enqueue((_ProcessCount - 1).toString());
            _Kernel.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

        }
    }
}
