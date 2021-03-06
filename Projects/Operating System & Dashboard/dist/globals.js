/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
var APP_NAME = "TienminatOS"; // 'cause Bob and I were at a loss for a better name.
var APP_VERSION = "0.01"; // What did you expect?
var USER_AGENT = navigator.userAgent; // Extraneous Information about current environment.
var CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
// Interrupt Constants
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var CONTEXT_SWITCH_IRQ = 2;
var FILE_SYSTEM_IRQ = 3;
var EMPTY_FILE_DATA = "000000000000000000000000000000000000000000000000000000000000";
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the CPU class.
var _SingleStep = false;
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
// Memory related global variables
var _Memory;
var _MemoryAccessor;
var _MemoryManager;
var _MemorySize = 768; // 768 bytes, 3 segments of 256 bytes
var _SegmentSize = 256;
// Storage related global variables
var _HDD;
var _HDDAccessor;
// Debugger variables, references Memory
var _Debuggers = [];
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue; // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue = null; // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers = null; // when clearly 'any' is not what we want. There is likely a better way, but what is it?
// Standard input and output
var _StdIn; // Same "to null or not to null" issue as above.
var _StdOut;
// UI
var _Console;
var _OsShell;
// Console Resolution
var _MaxYPosition = 405;
var _MaxXPosition = 537;
// Variables for up_down key press - Console History
var _CommandList = [];
var _CommandIndex = 0;
// Variables for Tab Complete
var _ShellCommandList;
var _TabCompleteList = _ShellCommandList;
var _TabCompleteIndex = -1;
// Variable for Text Wrap
var _WrappedPosition = [];
// Variable for Console Scrolling
var _ConsoleScrolling = false;
// Variable for Process Storage
var _CurrentPCB;
var _ProcessCount = 0;
var _PCBList = [];
// Variable for Process Manager
var _ProcessManager;
// Variable for Scheduler
var _Scheduler;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Variable for Wait Time and Turn Around Time Calculator
var _CalculateWTTAT = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;
var _krnFileSystemDriver;
var _hardwareClockID = null;
// Global Variable For Log Message
var _LastLogMsg = null;
// Global Variable FOR HDD Scrolling
var _EnableHDDScroll = false;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
