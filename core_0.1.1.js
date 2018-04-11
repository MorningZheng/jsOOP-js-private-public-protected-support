(function () {
    /**
     * 这是实现了JS面对对象的核心。
     * 实现了面对对象的private、public、super、self。
     * 在方法中，使用$super,$self进行调用。
     * 使用_来定义private（我也想用private啊-.=）
     * 其他的，看GitHub上的例子吧。
     * https://github.com/MorningZheng/jsOOO-private-public-support-
     * 最后，引用的时候，请写上作者，谢谢了。
     * ===@copyright ZhengChen 20180411 QQ:99713366 Email:vsystem@126.com===
     */
    var $dock;
    var $browser=(function () {
        try{
            $dock=window;
            //判断IE浏览器版本
            $dock['$ie']=(function () {
                var b = document.createElement('b');
                for(var i=6;i<12;i++){
                    b.innerHTML = '<!--[if IE '+i+']><i></i><![endif]-->';
                    if(b.getElementsByTagName('i').length === 1){
                        return i;
                        break;
                    };
                };
                return -1;
            })();

            return true;
        } catch (_){
            $dock=global;
            return false;
        };
    })();

    if($dock.$package instanceof Function)return true;
    Number.MAX_VALUE=1.79769313486231e+308;
    Number.MIN_VALUE=4.9406564584124654e-324;
    Number.NaN=NaN;
    Number.NEGATIVE_INFINITY=-Infinity;
    Number.POSITIVE_INFINITY=Infinity;

    (function () {
        'use strict';
        var $callee=undefined;
        var $scope=undefined;
        var $index=-1;

        var KEY_ANONYMOUS='anonymous';
        var KEY_SCOPE='^_^scope';
        var KEY_PROTO='@-prototype';

        var $var=(function () {
            var $={'_':'private','$':'protected','#':'static'};
            return function (name) {
                if(name==='__construct')return 'public';
                name=name.substr(0,1);
                return $.hasOwnProperty(name)?$[name]:'public';
            }
        })();

        var $proxy=(function () {
            var $fix=function (args) {
                while (args.length<$callee.length) Array.prototype.push.call(args,undefined);
                return args;
            };

            return {
                'object':{
                    'public':function (structure,name,key) {
                        return structure.proxy[name][key]=function () {
                            var _scope=$scope;

                            //所有的实例一定继承至某个父，有KEY_PROTO是属性，并且入口都在最上层
                            if(this instanceof structure.factory && this.hasOwnProperty(KEY_PROTO)===false)$dock['$this']=$scope=this;

                            var _index=$index;
                            $index=structure.chainIndex;

                            var _super=$dock.$super;
                            $dock.$super=$dock.$parent=structure.super;

                            var _self=$dock.$self;
                            $dock.$self=structure.factory;

                            var _callee=$callee
                            $callee=structure.chain[$index].descript[name][key];
                            try{
                                //切换作用域
                                return $callee.apply($scope,$fix(arguments));
                            }finally {
                                $dock['$this']=$scope=_scope;
                                $index=_index;
                                $dock.$super=$dock.$parent=_super;
                                $dock.$self=_self;
                                $callee=_callee;
                            };
                        };
                    },
                    'private':function (structure,name,key) {
                        return structure.proxy[name][key]=function () {
                            if($index===-1)throw new Error('从在外部访问了一个私有的方法：'+structure.package+'.'+name+'。');
                            if(!structure.chain[$index] || !structure.chain[$index].descript[name])throw new Error('访问了一个不在本类上的私有方法：'+structure.package+'.'+name+'。');
                            var _scope=$scope;
                            if(this instanceof structure.factory && this.hasOwnProperty(KEY_PROTO)===false)$dock['$this']=$scope=this;

                            var _super=$dock.$super;
                            $dock.$super=$dock.$parent=structure.super;

                            var _self=$dock.$self;
                            $dock.$self=structure.factory;

                            var _callee=$callee
                            $callee=structure.chain[$index].descript[name][key];
                            try {
                                //切换作用域
                                return $callee.apply($scope,$fix(arguments));
                            }finally {
                                $dock['$this']=$scope=_scope;
                                $dock.$super=$dock.$parent=_super;
                                $dock.$self=_self;
                                $callee=_callee;
                            };
                        };
                    },
                    value:function (structure,name,type) {
                        //这里只做转换，不涉及空间变化
                        var value=structure.descript[name].val=structure.descript[name].data=structure.descript[name].value;
                        delete structure.descript[name].value;
                        delete structure.descript[name].writable;

                        if(value instanceof Function){
                            // structure.descript[name].length=value.length;
                            // structure.descript[name].args=[];
                            // structure.descript[name].args.length=value.length;
                            value=$proxy.object[type](structure,name,'val');
                            value.toString=function () {
                                return structure.descript[name].val.toString();
                            };
                        };
                        structure.descript[name].get=function () {
                            return $scope[KEY_SCOPE][$index].hasOwnProperty(name)?$scope[KEY_SCOPE][$index][name]:value;
                        };

                        structure.descript[name].set=function (newVal) {
                            $scope[KEY_SCOPE][$index][name]=newVal;
                        };
                    },
                    get:function (structure,name,type) {
                        if(structure.descript[name].set && !structure.descript[name].get)structure.descript[name].get=function () {
                            throw new Error('对只读属性：'+structure.package+'.'+name+' 取值失败。');
                        };
                        $proxy.object[type](structure,name,'get');
                        if(structure.descript[name].length===undefined) structure.descript[name].length=0;
                    },
                    set:function (structure,name,type) {
                        if(structure.descript[name].get && !structure.descript[name].set)structure.descript[name].set=function () {
                            throw new Error('对只读属性：'+structure.package+'.'+name+' 赋值失败。');
                        };
                        $proxy.object[type](structure,name,'set');
                        if(structure.descript[name].length===undefined) structure.descript[name].length=0;
                    },
                },
                'static':{
                    'public':function (structure,name,key) {
                        return function () {
                            var _index=$index;
                            $index=structure.chainIndex;

                            var _self=$dock.$self;
                            $dock.$self=structure.factory;

                            var _callee=$callee
                            $callee=structure.static[name][key];

                            try{
                                //切换作用域
                                return $callee.apply($scope,$fix(arguments));
                            }finally {
                                $index=_index;
                                $dock.$self=_self;
                                $callee=_callee;
                            };
                        };
                    },
                    'private':function (structure,name,key) {
                        return function () {
                            if($index===-1)throw new Error('从在外部访问了一个私有的方法：'+structure.package+'.'+name+'。');

                            var _self=$dock.$self;
                            $dock.$self=structure.factory;

                            var _callee=$callee
                            $callee=structure.static[name][key];

                            try{
                                //切换作用域
                                return $callee.apply($scope,$fix(arguments));
                            }finally {
                                $dock.$self=_self;
                                $callee=_callee;
                            };
                        };
                    },
                    value:function (structure,name,type) {
                        structure.static[name].data=structure.static[name].val=structure.static[name].value;
                        delete structure.static[name].value;
                        delete structure.static[name].writable;

                        if(structure.static[name].data instanceof Function){
                            structure.static[name].data=$proxy.static[type](structure,name,'val');
                            structure.static[name].data.toString=function () {
                                return structure.static[name].val.toString();
                            };
                        };

                        structure.static[name].get=function () {
                            return structure.static[name].data;
                        };

                        structure.static[name].set=function (newVal) {
                            structure.static[name].data=newVal;
                        };

                        return structure;
                    },
                    get:function (structure,name,type) {
                        if(structure.static[name].set && !structure.static[name].get)structure.static[name].get=function () {
                            throw new Error('对只读属性：'+structure.package+'.'+name+' 取值失败。');
                        };
                        $proxy.static[type](structure,name,'get');
                    },
                    set:function (structure,name,type) {
                        if(structure.static[name].get && !structure.static[name].set)structure.static[name].set=function () {
                            throw new Error('对只读属性：'+structure.package+'.'+name+' 赋值失败。');
                        };
                        $proxy.static[type](structure,name,'set');
                    },
                },
            };
        })();

        var $factory=(function () {

            var $initializing=false;
            $dock['$this']=$dock['$super']=$dock['$parent']=$dock['$self']=undefined;

            var $config=function (scope,structure,args) {
                if(scope instanceof structure.factory){
                    if(structure.initialized===false){
                        var _initializing=$initializing;
                        $initializing=true;

                        //初始化
                        structure.chain=[];
                        structure.descript={};
                        structure.proxy={};

                        //继承的实现
                        if(structure.parent){
                            structure.factory.prototype=new structure.parent.factory();
                            structure.factory.prototype.constructor=structure.factory;
                            structure.super=structure.parent.factory.prototype;
                            Array.prototype.push.apply(structure.chain,structure.parent.chain);
                        }else structure.super={};
                        structure.factory.prototype[KEY_PROTO]=true;

                        //缓存数据结果，减少计算
                        structure.chainIndex=structure.chain.length;
                        structure.chain.push(structure);

                        //属性解包
                        structure.property['__construct']=structure.construct;
                        for(var p in structure.property){
                            structure.proxy[p]={};
                            var t=$var(p);
                            structure.descript[p]=Object.getOwnPropertyDescriptor(structure.property,p);

                            //将value转换成getter/setter
                            if(structure.descript[p].value)$proxy.object.value(structure,p,t);

                            $proxy.object.get(structure,p,t);
                            $proxy.object.set(structure,p,t);
                        };
                        //设置
                        Object.defineProperties(structure.factory.prototype,structure.proxy);

                        structure.initialized=true;
                        scope=new structure.factory();
                        $initializing=_initializing;
                    };

                    //应用
                    if($initializing===false){
                        scope[KEY_SCOPE]=[];
                        while (scope[KEY_SCOPE].length<structure.chain.length)scope[KEY_SCOPE].push({});
                        return scope['__construct'].apply(scope,args)||scope;
                    }else return scope;

                }else{
                    if(structure.initialized===false)Array.prototype.forEach.call(args,function (a) {
                        if(a instanceof Object) structure.property=a;
                        if(a instanceof Function) structure.construct=a;
                    });
                    return structure.factory;
                };
            };

            var $empty={
                property:{},
                construct:function () {
                    return this;
                },
            };

            return function ($path,$name,$property,$parent) {
                var $={
                    initialized:false,
                    name:$name,
                    path:$path,
                    pathArray:$path.split('.').reduce(function (a,p) {
                        p=p.trim();
                        if(p)a.push(p);
                        return a;
                    },[]),
                    'package':$path+'::'+$name,
                    parent:$parent,
                    property:$property||$empty.property,
                    construct:$empty.construct,
                };

                $.factory=(new Function('a','b','c',"return {'"+$.package+"':function () {return a(this===c?undefined:this,b,arguments);}}['"+$.package+"'];"))($config,$,$dock);
                $.factory.toString=function () {
                    return $.construct.toString();
                };
                $.factory.__GLOBAL__=$;

                return $;
            };
        })();

        $dock['$parameter']=function (args,rule) {
            if(args.hasOwnProperty('callee')===false) throw new Error('在应用'+$callee.toString()+'于时，参数1 args必须是arguments的引用。');
            if(rule)rule.split(',').forEach(function (v,k) {
                if(args[k]===undefined){
                    var s=v.indexOf('=');
                    if(s!==-1)args[k]=new Function('return '+v.substr(s+1))();
                };
            });
        };

        $dock['$bind']=function (methods) {
            if($scope){
                Array.prototype.forEach.call(arguments,function (m) {
                    if($scope[m] instanceof Function){
                        try{
                            $scope[m]=$scope[m].bind($scope);
                        }catch (_){};
                    };
                });
            };
        };

        var Singleton=$dock['$Singleton']={};

        var $package=$dock['$package']=function (path) {
            return $space(path||'local',Singleton,true);
        };

        var $space=(function () {
            var classHandler=function (name) {
                var $;
                if(this.data.hasOwnProperty(name)===false){
                    $=$factory(this.name,name);
                    $.factory.static=staticHandler;
                    $.factory.extends=extendsHandler;
                    if(this.name!==KEY_ANONYMOUS)this.data[name]=$;
                }else $=this.data[name];

                try{
                    return $.factory;
                }finally {
                    $=null;
                };
            };

            var staticHandler=function (method) {
                var space=this instanceof Function?this.__GLOBAL__:this;
                if(space.hasOwnProperty('static')===false){
                    space.static={};
                    for(var m in method){
                        var t=$var(m);
                        space.static[m]=Object.getOwnPropertyDescriptor(method,m);
                        if(space.static[m].value)$proxy.static.value(space,m,t);
                        $proxy.static.get(space,m,t);
                        $proxy.static.set(space,m,t);
                    };
                    Object.defineProperties(space.factory,space.static);
                };
                return space.factory;
            };

            var extendsHandler=function (parent) {
                var space=this instanceof Function?this.__GLOBAL__:this;
                if(space.initialized===false) space.parent=parent.__GLOBAL__;
                return space.factory;
            };

            return function (dir,scope) {
                var create=arguments[2]?true:false;
                scope=scope||Singleton;

                if(dir==null)return;
                if(dir.constructor===String)dir=dir.split('.');
                dir=dir.reduce(function (a,d) {
                    d=d.trim();
                    if(d)a.push(d);
                    return a;
                },[]).join('.');

                if(scope.hasOwnProperty(dir)===false && create){
                    scope[dir]={
                        name:dir,
                        'class':classHandler,
                        data:{},
                    };
                };

                return scope[dir];
            };
        })();

        var $class=$dock['$class']=function (name) {
            return $package(KEY_ANONYMOUS).class(name);
        };
    })();
})(this);
