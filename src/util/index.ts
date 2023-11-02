export const tuple = (function () {
  let map = new Map();

  function tuple(...data: number[]) {
    let current: Map<any, any> & { _myVal?: any } = map;
    let args = Object.freeze(Array.from(data));
    for (let item of args) {
      if (current.has(item)) {
        current = current.get(item);
      } else {
        let next = new Map();
        current.set(item, next);
        current = next;
      }
    }
    if (!current._myVal) {
      current._myVal = args;
    }
    return current._myVal;
  }

  return tuple;
})();
