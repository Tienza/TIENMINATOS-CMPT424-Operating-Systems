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
const APP_NAME: string    = "TienminatOS";   // 'cause Bob and I were at a loss for a better name.
const APP_VERSION: string = "0.01";   // What did you expect?
const USER_AGENT = navigator.userAgent; // Extraneous Information about current environment.

var CPU_CLOCK_INTERVAL: number = 100;   // This is in ms (milliseconds) so 1000 = 1 second.

// Interrupt Constants
const TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                              // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;
const CONTEXT_SWITCH_IRQ: number = 2;
const FILE_SYSTEM_IRQ: number = 3;
const EMPTY_FILE_DATA: string = "000000000000000000000000000000000000000000000000000000000000";


//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU: TSOS.CPU;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the CPU class.
var _SingleStep: boolean = false;

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

// Memory related global variables
var _Memory: TSOS.Memory;
var _MemoryAccessor: TSOS.MemoryAccessor;
var _MemoryManager: TSOS.MemoryManager;
var _MemorySize = 768; // 768 bytes, 3 segments of 256 bytes
var _SegmentSize = 256;

// Storage related global variables
var _HDD: TSOS.HDD;
var _HDDAccessor: TSOS.HDDAccessor;

// Debugger variables, references Memory
var _Debuggers: string[] = [];

var _Canvas: HTMLCanvasElement;         // Initialized in Control.hostInit().
var _DrawingContext: any; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily: string = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize: number = 13;
var _FontHeightMargin: number = 4;              // Additional space added to font size when advancing a line.

var _Trace: boolean = true;  // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue;          // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue: any = null;  // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers: any[] = null;   // when clearly 'any' is not what we want. There is likely a better way, but what is it?

// Standard input and output
var _StdIn;    // Same "to null or not to null" issue as above.
var _StdOut;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// Console Resolution
var _MaxYPosition: number = 405;
var _MaxXPosition: number = 537;

// Variables for up_down key press - Console History
var _CommandList = [];
var _CommandIndex: number = 0;

// Variables for Tab Complete
var _ShellCommandList: string[];
var _TabCompleteList: string[] = _ShellCommandList;
var _TabCompleteIndex: number = -1;

// Variable for Text Wrap
var _WrappedPosition = [];

// Variable for Console Scrolling
var _ConsoleScrolling: boolean = false;

// Variable for Process Storage
var _CurrentPCB: TSOS.PCB;
var _ProcessCount: number = 0;
var _PCBList: TSOS.PCB[] = [];

// Variable for Process Manager
var _ProcessManager: TSOS.ProcessManager;

// Variable for Scheduler
var _Scheduler: TSOS.Scheduler;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Variable for Wait Time and Turn Around Time Calculator
var _CalculateWTTAT: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;
var _krnFileSystemDriver: TSOS.DeviceDriverFs;

var _hardwareClockID: number = null;

// Global Variable For Log Message
var _LastLogMsg: string = null;

// Global Variable FOR HDD Scrolling
var _EnableHDDScroll: boolean = false;

// For testing (and enrichment)...
var Glados: any = null;  // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
