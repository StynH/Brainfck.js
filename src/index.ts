import _, { isNull, isUndefined } from "lodash";

type LoopPair = {
    start: number;
    end: number;
    nesting: number;
}

export class Brainfck{
    private static MEMORY_SIZE: number = 30000;

    private static BYTE_MIN_VALUE = 0;
    private static BYTE_MAX_VALUE = 255;
    private static ZERO_BYTE: number = 0;

    private static OPERATOR_MOVE_LEFT: string = "<";
    private static OPERATOR_MOVE_RIGHT: string = ">";
    private static OPERATOR_INCREMENT: string = "+";
    private static OPERATOR_DECREMENT: string = "-";
    private static OPERATOR_OUTPUT: string = ".";
    private static OPERATOR_INPUT: string = ",";
    private static OPERATOR_JUMP_ZERO: string = "[";
    private static OPERATOR_JUMP_NO_ZERO: string = "]";

    private stop: boolean;
    private errorCallback: (message: string) => any;

    private memory: number[];
    private code: string;
    private loopLookupTable: LoopPair[];

    private pointer: number;
    private codeIndexer: number;
    private outputCallback: (output: string) => any;

    constructor(outputCallback: (output: string) => any) {
        this.stop = false;
        this.memory = _.times(Brainfck.MEMORY_SIZE, _.constant(0));
        this.loopLookupTable = [];
        this.pointer = 0;
        this.code = "";
        this.codeIndexer = 0;

        this.errorCallback = this.consoleError;
        this.outputCallback = outputCallback;
    }

    public interpret(code: string): void{
        this.code = this.sanitizeCode(code);
        this.analyzeCode(this.code);

        while(this.codeIndexer < this.code.length && !this.stop){
            this.executeSymbol(this.code[this.codeIndexer]);
            ++this.codeIndexer;
        }
    }

    private sanitizeCode(code: string): string{
        return code.replace(/(\r\n|\n|\r)/gm, "");
    }

    private analyzeCode(code: string): void{
        this.loopLookupTable = [];

        let nesting = 0;
        for(let i = 0; i < code.length; ++i){
            const symbol = code[i];
            if(symbol == Brainfck.OPERATOR_JUMP_ZERO){
                ++nesting;
                this.loopLookupTable.push({ start: i, end: Number.MIN_SAFE_INTEGER, nesting: nesting });
            }
            else if(symbol == Brainfck.OPERATOR_JUMP_NO_ZERO){
                const pair = _.find(this.loopLookupTable, (pair: LoopPair) => {
                    return pair.nesting == nesting && pair.end == Number.MIN_SAFE_INTEGER;
                })!;

                if(isNull(pair) || isUndefined(pair)){
                    console.error("Ending symbol found without starting symbol @ " + i);
                    this.errorOutput(i, this.errorCallback);
                    continue;
                }

                pair.end = i;
                --nesting;
            }
        }
    }

    private errorOutput(errorIndex: number, callback: (stack: string) => any): void{
        const tabs = _.times(errorIndex, _.constant(" ")).join("");
        callback("\n" + tabs + "V\n" + this.code);
    }

    private consoleError(message: string){
        console.error(message);
    }

    private findLoopPairInLookupTable(index: number, isStartPosition: boolean): any{
        return _.find(this.loopLookupTable, (pair: LoopPair) => {
            return isStartPosition ? pair.start == index : pair.end == index
        })!;
    }

    private executeSymbol(symbol: string){
        switch (symbol){
            case Brainfck.OPERATOR_MOVE_LEFT:
                --this.pointer;
                if(this.pointer < 0){
                    this.pointer = 0;
                }
                break;
            case Brainfck.OPERATOR_MOVE_RIGHT:
                ++this.pointer;
                if(this.pointer >= Brainfck.MEMORY_SIZE){
                    this.pointer = Brainfck.MEMORY_SIZE - 1;
                }
                break;
            case Brainfck.OPERATOR_INCREMENT:
                ++this.memory[this.pointer];
                if(this.memory[this.pointer] > Brainfck.BYTE_MAX_VALUE){
                    this.memory[this.pointer] = Brainfck.BYTE_MIN_VALUE;
                }
                break;
            case Brainfck.OPERATOR_DECREMENT:
                --this.memory[this.pointer];
                if(this.memory[this.pointer] < Brainfck.BYTE_MIN_VALUE){
                    this.memory[this.pointer] = Brainfck.BYTE_MAX_VALUE;
                }
                break;
            case Brainfck.OPERATOR_OUTPUT:
                this.outputCallback(String.fromCharCode(this.memory[this.pointer]));
                break;
            case Brainfck.OPERATOR_INPUT:

                break;
            case Brainfck.OPERATOR_JUMP_ZERO:
                if(this.memory[this.pointer] == Brainfck.ZERO_BYTE){
                    const pair = this.findLoopPairInLookupTable(this.codeIndexer, true);
                    this.codeIndexer = pair.end;
                }
                break;
            case Brainfck.OPERATOR_JUMP_NO_ZERO:
                if(this.memory[this.pointer] != Brainfck.ZERO_BYTE){
                    const pair = this.findLoopPairInLookupTable(this.codeIndexer, false);
                    this.codeIndexer = pair.start;
                }
                break;
        }
    }
}
