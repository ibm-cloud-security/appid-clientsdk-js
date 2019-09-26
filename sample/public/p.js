function PromiseAll(promises) {
    let counter = 0;
    let result = [], rejected = false;
    return new Promise((resolve, reject) => {
        if (promises.length === 0){
            return resolve();
        }
        for (let index in promises) {
            promises[index].then((res) => {
                result[index] = res;
                if (++counter === promises.length) {
                    resolve(result);
                }
            }).catch(e => {
                if (!rejected) {
                    reject(e)
                }
                rejected = true;
            });
        }
    });
}

async function PromiseAllAsync(promises) {
    let result = [];
    for (let promise of promises) {
        const res = await promise;
        result.push(res);
    }
    return result;
}

async function sleep(time) {
    return new Promise((resolve, reject) => {
        // reject(new Error('bla'));
        setTimeout(() => resolve('hey ' + time), time);
    })
}

PromiseAll([sleep(400), sleep(200), sleep(500)]).then(([a, b, c]) => {
    console.log(a);
    console.log(b);
    console.log(c);
}).catch(e => {
    console.error(e);
});
