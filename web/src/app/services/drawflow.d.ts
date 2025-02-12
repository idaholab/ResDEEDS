declare module 'drawflow' {
    export default class Drawflow {
        constructor(container: HTMLElement, render?: object);
        start(): void;
        addNode(
            name: string,
            inputs: number,
            outputs: number,
            posx: number,
            posy: number,
            className: string,
            data: object,
            html: string
        ): number;
    }
}