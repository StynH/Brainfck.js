import _ from "lodash";

export class Brainfck{
    private static MEMORY_SIZE: number = 30000;

    private static ZERO_BYTE: number = 0;

    private static OPERATOR_MOVE_LEFT: string = "<";
    private static OPERATOR_MOVE_RIGHT: string = ">";
    private static OPERATOR_INCREMENT: string = "+";
    private static OPERATOR_DECREMENT: string = "-";
    private static OPERATOR_OUTPUT: string = ".";
    private static OPERATOR_INPUT: string = ",";
    private static OPERATOR_JUMP_ZERO: string = "[";
    private static OPERATOR_JUMP_NO_ZERO: string = "]";

    private memory: Uint8Array;
    private pointer: number;
    private code: string;
    private codeIndexer: number;
    private outputCallback: (output: string) => any;

    constructor(outputCallback: (output: string) => any) {
        this.memory = new Uint8Array(Brainfck.MEMORY_SIZE);
        this.pointer = 0;
        this.code = "";
        this.codeIndexer = 0;
        this.outputCallback = outputCallback;
    }

    public interpret(code: string): void{
        this.code = code;
        while(this.codeIndexer < this.code.length){
            this.executeSymbol(this.code[this.codeIndexer]);
            ++this.codeIndexer;
        }
    }

    private executeSymbol(symbol: string){
        switch (symbol){
            case Brainfck.OPERATOR_MOVE_LEFT:
                --this.pointer;
                break;
            case Brainfck.OPERATOR_MOVE_RIGHT:
                ++this.pointer;
                break;
            case Brainfck.OPERATOR_INCREMENT:
                ++this.memory[this.pointer];
                break;
            case Brainfck.OPERATOR_DECREMENT:
                --this.memory[this.pointer];
                break;
            case Brainfck.OPERATOR_OUTPUT:
                this.outputCallback(String.fromCharCode(this.memory[this.pointer]));
                break;
            case Brainfck.OPERATOR_INPUT:

                break;
            case Brainfck.OPERATOR_JUMP_ZERO:
                if(this.memory[this.pointer] == Brainfck.ZERO_BYTE){
                    while(this.code[this.codeIndexer] != Brainfck.OPERATOR_JUMP_NO_ZERO) ++this.codeIndexer;
                }
                break;
            case Brainfck.OPERATOR_JUMP_NO_ZERO:
                if(this.memory[this.pointer] != Brainfck.ZERO_BYTE){
                    while(this.code[this.codeIndexer] != Brainfck.OPERATOR_JUMP_ZERO) --this.codeIndexer;
                }
                break;
        }
    }
}
