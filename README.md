> 在前端领域中，jQuery操作的DOM的时代渐渐被人们所遗弃，SPA应用开始被广泛使用。但是如果依旧使用DOM操作的模式来开发SPA，整个开发过程会比较繁琐，后期难以维护。为了解决这一问题，前端开发者们提出了MVC(同样有其它如MVVM、MVP)的设计模式，也就是将DOM相关的内容抽象成数据模型、视图、控制器三个部分。所有MV*的交互模式本质都是对DOM交互的抽象。

## MVC模式

> 前面我们也提到了，MVC模式英文全称为Model-View-Controller，即数据模型、视图、控制器三个部分。

每个部分都有自己的职责：
M: 数据模型，负责存放请求的数据结果；
V：视图，用来承载DOM的展示，包括更新渲染；
C：事件控制函数，用来根据前端路由条件来调用不同的Model传递给View渲染不同的数据内容。

这里我们使用HTML5中的 `pushState`来模拟整个交互过程。

````html
<!-- 点击重新渲染view -->
<div id="A" onclick='Controller.A.event.change'>change</div>
````
````javascript
// history.pushState({page: 'A'}, 'page A', 'a.html'); // 设置当前url为A页面

// 初始化Controller、Model、View
let Controller = {};
let Model = {};
let View = {};

View['A'] = function(data) {
    let tpl = "<input type='text' id='input' value='{{text}}'/><span id='showText'>{{text}}</span>"
    // 调用模板渲染获取HTML片段
    let html = render(tpl, data);
    document.getElementById('A').innerHTML = html;
}
Model['A'] = {
    text: 'View渲染完成'
};
Controller['A'] = function(){
    View['A'](model['A']);
    // 当url hash值改变，触发Controller来改变Model和View
    window.addEventListener('hashchange', (e) => {
      model['A'].text = location.hash;
      View['A'](model['A']);
    });
    // 用户点击 触发 Controller 改变Model 并重新渲染View
    self.event['change'] = function() {
     model['A'].text = '用户主动点击--新的ViewA渲染完成';
     View['A'](model['A']);
    }
}
````

当然，这里我们只有一个A模块，在实际开发过程中，会有B、C、D等许多模块，每个模块都有自己的一套MVC，从而消除了各个模块之间的数据、事件的冲突。

![MVC.png](https://upload-images.jianshu.io/upload_images/1515792-8273c45f42b05714.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

整个流程其实很简单，通过监听URL或者用户点击等操作 来触发Controller，从而来进行改变数据、视图。

在一些成熟的MVC框架中一般都是通过事件监听或者观察者模式来实现的。

## MVP模式

> MVP模式，即Model-View-Presenter，跟MVC不同之处在于P(Presenter)，它与C(Controller)有点相似，但是又有不同之处：用户在进行DOM操作的的时候将**通过View上的行为触发**，然后将修通知给Presenter来完成后面的Model修改和其他的View更新，而MVC模式下，用户的操作则是直接通过Controller来控制的。

Presenter和View的操作绑定通常是双向的，View的改变一般会触发Presenter的动作，Presenter的动作也会改变View。

## MVVM模式

> 这里说明一下，Vue、React两者的严格意义上都不是MVVM框架，Vue已经明确在官网上说明了，React也一直强调自己只是一个视图View。MVVM模式强调Model和View分离，只通过ViewModel进行交互；React只不过通过将state、props做为参数传入render，然后返回一个View，所以并不是MVVM，顶多只是一个View。

MVVM是我们重点要了解的对象，现在比如Vue、React都有MVVM的影子。熟悉Vue的同学应该都知道，Vue有自己的一套指令（Directive）。

而MVVM可以认为是一个自动化的MVP，只不过使用了ViewModel替代了Presenter。即数据Model的调用和模板内容的渲染不需要我们主动操作，而是ViewModel自动触发来完成，任何用户的操作也都是通过ViewModel的改变来驱动的。

ViewModel会自动捕获数据的变换，然后反映到View层。当然，ViewMode的数据操作最终在页面上以指令（Directive）的形式体现。所谓指令，就是形如Vue中的`v-for`、`@click`、`v-if`等，熟悉Vue的同学应该不会模式，在渲染的过程中，框架会扫描节点上的Directive，然后绑定、执行对象的方法和属性。

![QQ20180421-100102@2x.png](https://upload-images.jianshu.io/upload_images/1515792-61079ea9445074b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

对于MVVM框架，其实整个思路非常简单，我们自己也可以去手动的实现一个MVVM框架。当然，完整的框架涉及的东西远远比这多。但这并不阻碍我们掌握核心原理。

一般的，MVVM框架主要包含下面几个内容：

- Directive。即指令。如Vue中的v-for、v-html等等。
- Filter。过滤器。如Angular中使用了管道符来实现过滤器。
- 表达式。如Vue中的v-if。
- ViewModel设计。
- 数据变更检测。为了实现数据的双向绑定。首先对于View层，我们一般是通过一些特殊元素，如input、select等的onchange事件来触发修改ViewModel对象数据的数据。另一方便，如果要实现ViewModel的修改，来改变View层，一般通过手动触发绑定、脏值检查、对象劫持、Proxy等。

### 数据变更检测

> 前面我们说了，实现ViewModel的修改，来改变View层，需要用到数据变更检测，而手段有许多，我们一一来介绍。

 #### 手动触发绑定

手动触发绑定是最直接的一种方式，主要思路是通过在数据对象上定义`get()`方法和`set()`方法，调用的时候手动触发`get()`、`set()`函数来获取、修改数据，而改变数据后也会主动触发`get()`、`set()`函数进行View层的重新渲染。

````html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>手动触发</title>
</head>
<body>
    <input type="text" q-value="value" id="input"/>
    <span q-text="value" id="span"></span>
    <script>
        let eleSpan = document.getElementById('span');
        let eleInput = document.getElementById('input');
        let elems = [eleSpan, eleInput];
        let data = {
            value: 'Hello'
        };
        // 定义Directive
        let directive = {
            // text指令
            text: function(text) {
                this.innerHTML = text
            },
            // value 指令
            value: function(val) {
                this.setAttribute('value', val);
            }
        }
        // 数据绑定监听
        if (document.addEventListener) {
            eleInput.addEventListener('keyup', (e) => {
                ViewModelSet('value', e.target.value);
            }, false);
        } else {
            eleInput.addEventListener('onkeyup', (e) => {
                ViewModelSet('value', e.target.value);
            }, false)
        }

        // 扫描节点
        scan();

        setTimeout(() => {
            ViewModelSet('value', 'hello ouvenzhang');
        }, 2000);

        function scan() {
            // 扫描带指令的节点属性
            for(let ele of elems) {
                ele.directive = [];
                for(let attr of ele.attributes) {
                    if (attr.nodeName.indexOf('q-') >= 0) {
                        // 调用属性指令
                        directive[attr.nodeName.slice(2)].call(ele, data[attr.nodeValue]);
                        ele.directive.push(attr.nodeName.slice(2))
                    }
                }
            }
        }

        // 设置数据改变后扫描节点
        function ViewModelSet(key, val) {
            data[key] = val;
            scan();
        }
    </script>
</body>
</html>
````

#### 脏检查机制

所谓脏检查机制，其基本原理是在ViewModel对象的某个属性值发生变化时找到与这个属性值相关的所有元素，然后比较数据是否发生变化，如果变化则调用Directive指定，对这个元素重新扫描渲染。

[示例代码](https://github.com/imhxc/MVVM/blob/master/%E8%84%8F%E6%A3%80%E6%9F%A5%E6%9C%BA%E5%88%B6.html)

#### 数据劫持

数据劫持是使用比较广的方式。比如Vue。大概思路就是使用`Object.defineProperty`和`Object.defineProperies`对ViewModel数据对象进行属性`get()`、`set()`的监听。当有新的数据读取恶化赋值操作的时候则进行扫描元素节点，运行对应的节点的Directive(指令)，这样ViewModel使用通用的等号赋值就可以了。相信对Object.defineProperty有所了解的同学会很容易理解。

[示例代码](https://github.com/imhxc/MVVM/blob/master/%E6%95%B0%E6%8D%AE%E5%8A%AB%E6%8C%81.html)

当然，大家需要注意`Object.defineProperty`的兼容性问题。

#### Proxy

了解ES6的同学应该清楚，ES6为我们提供了一个Proxy特性，它可以在已有的对象基础上重新定义一个对象，并重新定义对象原型上的方法，包括`get()`和`set()`方法。

[示例代码](https://github.com/imhxc/MVVM/blob/master/Proxy.html)


## 总结


前端框架从DOM操作到MVC、MVP以及现在的MVVM设计，都是为了解决前端开发的效率、维护、扩展等问题，总的方向是越来月方便我们开发者。当然，这仅仅是 提高了开发效率，本质上还是对DOM的操作。了解DOM操作开销的同学，都知道操作DOM是极其消耗资源的，所以前端开发领域又提出Virtual DOM，即虚拟DOM。所以这也是我们需要掌握的。
