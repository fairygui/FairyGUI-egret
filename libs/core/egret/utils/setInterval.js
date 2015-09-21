var egret;
(function (egret) {
    var __setInterval__cache = {};
    var __setInterval__index = 0;
    /**
     * 在指定的延迟（以毫秒为单位）后运行指定的函数。
     * @method egret.setInterval
     * @param listener {Function} 侦听函数
     * @param thisObject {any} this对象
     * @param delay {number} 延迟时间，以毫秒为单位
     * @param ...args {any} 参数列表
     * @returns {number} 返回索引，可以用于 clearInterval
     */
    function setInterval(listener, thisObject, delay) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var data = { listener: listener, thisObject: thisObject, delay: delay, originDelay: delay, params: args };
        if (__setInterval__index == 0) {
            egret.Ticker.getInstance().register(intervalUpdate, null);
        }
        __setInterval__index++;
        __setInterval__cache[__setInterval__index] = data;
        return __setInterval__index;
    }
    egret.setInterval = setInterval;
    /**
     * 清除指定延迟后运行的函数。
     * @method egret.clearInterval
     * @param key {number} egret.setInterval所返回的索引
     */
    function clearInterval(key) {
        delete __setInterval__cache[key];
    }
    egret.clearInterval = clearInterval;
    function intervalUpdate(dt) {
        for (var key in __setInterval__cache) {
            var data = __setInterval__cache[key];
            data.delay -= dt;
            if (data.delay <= 0) {
                data.delay = data.originDelay;
                data.listener.apply(data.thisObject, data.params);
            }
        }
    }
})(egret || (egret = {}));
