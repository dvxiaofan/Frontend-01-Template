# 课堂笔记



script,UI交互，setTimeout,setInterval都是宏任务



```JavaScript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0);

async1();

new Promise(function(resolve) {
    console.log('promise1');
    resolve();
  }).then(function() {
    console.log('promise2');
});

console.log('script end');
```





https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/



await、then 之前都是同步代码



一个宏任务中，只存在一个微任务队列，根据入队时间决定个微任务执行顺序吗，当前宏任务内微任务执行完之后才会执行下个宏任务，是这样吗？

一个settime out是新开一个宏任务，每个异步代码resolve 或者reject的状态才会进队列等待处理

逗号运算符依次执行

所以说一个宏任务里的同步代码也可以理解为微任务  只不过比宏任务里异步代码微任务先入队

标准 104页

- 宏任务
  - 0 4 5 -2
    - 入队 1 ， -1
  - 1
    - 入队 1.5
  - -1
  - -1.5
- 宏任务
  - 2
  - 3



> 待补充