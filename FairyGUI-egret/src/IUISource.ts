module fairygui {
    
    export interface IUISource {
        fileName: string;
        loaded: boolean;
        
        load(callback: Function, thisObj:any): void;
    }
}