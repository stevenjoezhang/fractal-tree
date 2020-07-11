import { mat4 } from './gl-matrix';

class MatrixStack {
    constructor() {
        this.top = mat4.create();
        this.stack = [];
    }
    push() {
        const copy = mat4.create();
        mat4.set(this.top, copy);
        this.stack.push(copy);
    }
    pop() {
        if (this.stack.length === 0) {
            throw "Too many calls to MatrixStack.pop()";
        }
        this.top = this.stack.pop();
    }
    getTop() {
        return this.top;
    }
}

export {
    MatrixStack
}
