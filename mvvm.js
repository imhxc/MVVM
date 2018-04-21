//  数据劫持
// 所谓数据劫持就是设置get、set
function Observer(data) {
    for (let key in data) {
        let val = data[key]; // 得到对应的val值
        observer(val); // 递归调用，目的为了可以深度实现数据绑定
        Object.defineProperty(data, key, {
            // 利用defineProperty 来实现
            configurable: true,
            get() {
                return val; // 返回前面定义的val
            },
            set(newVal) {
                if (newVal === val) { return; }
                val = newVal;
                observer(val);
            }
        })
    }
}

function observer(data) {
    if (!data || typeof data !== 'object') return;
    return new Observer(data);
}