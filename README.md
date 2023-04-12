# 计算机图形学-PJ1-项目文档

[TOC]

## 一、目录与运行

#### 1、文件目录及说明

**文件夹：PJ1**

- **config.js：**助教给出的原文件，存储了四个四边形的顶点坐标、顶点连接关系与顶点颜色。在助教源文件的基础上我个人增加了`drawSequence`数组来存储绘制过程中的先后顺序。
- **javascript.js：**canvas初始化、图形绘制、鼠标拖动交互的核心代码实现部分。
- **result.html：**本项目的展示与交互文件，最终的结果在本文件中展示，与用户的交互也在此文件中执行。
- **README.md：**本项目的说明文档，即本文PDF文件。



#### 2、开发运行环境

- **开发环境：**本项目基于Html+Javascript语言、利用VS Code编辑器在Windows环境下开发。开发时使用的是64位Google Chrome浏览器正式版，其版本号为105.0.5195.127。
- **运行环境：**可在任意环境下、支持Html5和WebGL的浏览器内运行，如IE11、最新版本的Firefox、Chrome和Safari。



#### 3、使用方法

**1.** 点击*result.html*文件即启动运行

**2.** 对页面内9个小红点中的任意一个，按住鼠标进行拖拽，将其到适当的位置时放开鼠标，即实现交互。其示意图如下：

<a id="pic1"> </a><img src="./1.png" style="zoom: 50%;">

​																			（图1）

<img src="./2.png" style="zoom: 50%;" >

​																				（图2）



<div STYLE="page-break-after: always;"></div>

## 二、实现方法

本项目的代码实现可分为以下6个步骤，分别为代码初始化、图形初始化、添加监听事件、确定触发点、确定绘图顺序与重绘图片。其执行流程如下图所示：

<img src="./3.jpg" style="zoom: 70%;" >

​                                                                                                                （图3）

#### 1、代码初始化

点击html文件执行后，进行代码的初始化。这一步主要是读取*config.js*文件中的配置信息，包括canvas画布的大小、四边形顶点的坐标以及对应的颜色、四边形顶点的连接关系、默认的四边形绘图顺序，为下一步初始化图形做准备。



#### 2、图形初始化

根据读到的四边形绘图顺序，依次对四个四边形进行绘制。默认顺序即0、1、2、3。具体绘图的实现会在项目亮点的[绘图部分](#one)介绍，这里边不再重复。本步骤结束后，就可以在页面上看到[图1](#pic1)所示的内容。

```javascript
function initializeMyCanvas()
{
    //按照绘图顺序drawSequence来依次绘图
    for(var i=0 ; i<drawSequence.length ; i++){
        drawSingalCanvas(drawSequence[i]); //对单个四边形进行绘制的函数
    }
    //依次绘点
    for(var j=0 ; j<vertex_pos.length; j++){
        drawHandlePoint(vertex_pos[j][0],vertex_pos[j][1])//对单个顶点进行绘制的函数
    }
}
```



#### 3、添加监听事件

通过document.getElementById(id)获取canvas对应的dom元素，为其添加鼠标触发事件，用以监听用户拖动四边形顶点的事件，从而实现实时更新顶点坐标、实时绘图。其监听事件的具体逻辑详见项目亮点的[鼠标交互部分](#two)，此处便不再赘述。

```javascript
function mousePress()//鼠标按下时确定坐标，实时跟新顶点位置，不再实时绘图
function mouseNoPress()//鼠标抬起时不再实时跟新顶点位置、不再实时绘图
//获取对应的dom元素
canvasBox = document.getElementById("myCanvas")
//鼠标单击canvas进入事件
canvasBox.addEventListener("mousedown",mousePress)
//鼠标抬起或者离开canvas离开事件
canvasBox.addEventListener("mouseup",mouseNoPress)
```



#### 4、确定触发点

JavaScript中定义了`event.offsetX`与`event.offsetY`两个参数来获取鼠标当前的坐标。因此，我们就可以将这个坐标对(x,y)依次与`vertex_pos`数组中存储的顶点的坐标进行对比，只要(x,y)到某一坐标点的距离小于顶点绘圆的半径，就可以确认该顶点就是用户拖动的顶点。

```javascript
function isINCircle(point1,point2){ //判断point1是否在以point2为原点，半径为redius的圆内（redius预先定义）
    if((Math.pow(point1[0]-point2[0],2)+Math.pow(point1[1]-point2[1],2))<Math.pow(redius,2)){
        return true
    }
    else return false
}
function checkWhichTarged(){
    var event = event || window.event; //获取鼠标坐标
    for(var i=0;i<vertex_pos.length;i++){//对所有的顶点坐标依次比较
        if(isINCircle([event.offsetX,event.offsetY],[vertex_pos[i][0],vertex_pos[i][1]])){
            //如果确认鼠标在圆内，返回该坐标点
            return i
        }
    }
    return -1
}
```



#### 5、确定绘图顺序

默认的绘图的顺序是从第1个四边形——>第4个四边形。在这种情况下，如果此时第1个四边形被其他四边形所覆盖，无论如何拖动第1个四边形的顶点，四边形都无法显现，用户交互十分不友好。因此需要将用户拖动的四边形放在最后来绘制，这样更清晰直观。

于是我们就可以在config.js文件中维护一个`drawSequence`数组，用来保存下一次绘制四边形的顺序。例如，假设本次拖动的是第1个四边形，就将`drawSequence[3]`赋值为0，并把其他元素依次前移1位。其他的元素也以此类推。这样就能保证用户所移动的四边形永不会被其他不移动的四边形全部覆盖。

具体的实现请见项目亮点[确定绘图顺序部分](#three)。

```javascript
//存储四个四边形的绘画顺序(默认是顺时针绘制)
var drawSequence = [0,1,2,3]
```



#### 6、重绘图片

在确定好新的坐标点与绘制顺序后，就可以重新开始绘制图像了。

首先是需要将原有的图像清除：根据canvas的特性，每当重新设置canvas元素的高或宽的时候，就能便捷地清除原有内容。接着，便根据第5步确认的绘制顺序，依次调用绘图函数`initializeMyCanvas()`来绘制新的图像。其代码实现如下：

```javascript
function initializeMyCanvas()
{
    for(var i=0 ; i<drawSequence.length ; i++){
        drawSingalCanvas(drawSequence[i]);
    }
    for(var j=0 ; j<vertex_pos.length; j++){
        drawHandlePoint(vertex_pos[j][0],vertex_pos[j][1])
    }
}
```

本步骤结束后，新的图像就绘制好了。然后程序会再次跳转执行监听步骤，只要监听到鼠标拖动顶点的时间，就会再一次执行步骤4、步骤5、步骤6。循环往复，直到用户关闭浏览器页面。



<div STYLE="page-break-after: always;"></div>

## 三、项目亮点

#### 1、图片绘制算法<a id="one"></a>

每次鼠标产生移动后，我们都会对Canvas进行清除，然后重新绘制图形，绘制的内容包括4个四边形以及9个顶点。

```javascript
//按照顺序绘制4个四边形
for(var i=0 ; i<drawSequence.length ; i++)   drawSingalCanvas(drawSequence[i]);
//按照顺序绘制9个顶点
for(var j=0 ; j<vertex_pos.length; j++)    drawHandlePoint(vertex_pos[j][0],vertex_pos[j][1])
```

4个四边形的绘制顺序在[第三点](#three)说明，9个顶点的绘制则按照默认顺序绘制。现在对单个图形的绘制算法进行说明：

- **绘制单个四边形**
  对于单个四边形的绘制，我们使用**扫描线算法**。其思想是从上到下对每排像素进行扫描，依次将扫描线与四边形交点的内部进行上色。如下图9所示，我们只需将扫描线从纵坐标0依次扫描到纵坐标9。对于每次扫描线与多边形内部的交点，如交点1与2、交点3与4，我们将其中间的点上色即可。
  
  <img src="./9.png" style="zoom: 100%;" >
  
  ​																									（图9）
  
  我们可以在以下几个地方进行优化
  
  - **优化扫描的范围：**在图9中，显然对纵坐标为0、8、9的点进行扫描是多余的。所以，我们可以提前通过四边形顶点的坐标，获取我们需要扫描的最小范围，节省扫描、画图的时间。
  
  - **维护边结构：**为了方便后续的计算，我们将边的数据维护在一个类中，其结构如下：
  
    ```javascript
    class edgesCrossed {
        constructor (pointHigh , pointLow){
            this.pointHigh=pointHigh    //边的最高点
            this.pointLow=pointLow      //边的最低点
            this.m=(pointHigh[0]-pointLow[0])/(pointHigh[1]-pointLow[1]) //x=my+n中的m
            this.n=pointHigh[0]-pointHigh[1]*this.m                      //x=my+n中的n
            this.CurrentScanPoint=pointLow    //当前扫描线与该边的交点
            this.nextedgeCrossed = null       //与扫描线相交顺序下的后一点
            this.nextActiveEdge = null        //当本边时活性边时，本边的下一条活性边
        }
    }
    ```
  
  - **避免重复计算扫描线与边的交点：**由于图形具有连续性，所以在相邻区域内扫描线与边的相交关系都是不变的。例如，从纵坐标2到纵坐标5，与扫描线相交的边都是不变的。在这个过程中，我们可以通过一个活性边链表Active Edges List来记录正在被扫描线相交的边，避免每次确认与那些边相交的繁琐计算。
  
  - **维护活性边链表Active Edges List：**由于活性边链表Active Edges List记录了当前与扫描线相交的边，所以我们需要对这个链表进行维护，包括何时会有新的边进入链表，何时会有边移出链表。因此，我们可以维护另一个边表Edges Table来确认何时会有边的进入与移除。如下图所示：
  
    <img src="./10.png"  style="zoom: 60%;">
  
    Edges Table的长度为Canvas区域的像素高度，因为我们知道顶点的位置，且由于与扫描线相交边的切换一定发生在顶点处，所以我们可以令`ET(Yi)`指向当前会新加入的边，其链表顺序就是与扫描线相交的先后顺序。因此在扫描时，每当`ET(Yi)`不为空，我们就可以将`ET(Yi)`指向的边直接放在活性边链表Active Edges List中即可。
  
  - **与扫描线平行边的处理：**不加入活性边表、不加入边表。
  
  - **活性边算法：**综上所述，我们可以将算法归纳如下：
  
      1. 建立边表Edges Table。
  
      2. 初始化活性边链表Active Edges List。
  
      3. 将扫描线的纵坐标Yi的初始值设置为ET中非空的最小序号。
  
      4. 重复以下操作，直到AEL与ET均为空：
  
         a.若ET(Yi)非空，则将ET(Yi)指向的边加入活性边链表Active Edges List，并为AET按照与扫描边相交的顺序排序
  
         b.对AET中的边两两配对，然后填充每个对子内部的像素
  
         c.对Yi递增，Yi=Yi+1
  
         d.将AEL中满足最高点等于Yi的边删除
  
- **绘制单个顶点**
  
  由于顶点式圆形，形状、大小不会改变。因此，当我们确认了顶点的坐标后，绘制顶点就很容易了。其实现代码如下：
  
  ```javascript
  function drawHandlePoint(x,y){
      redius = 10
      var offset
      var handleColor = [255,0,0]//顶点绘制颜色
      for(var scanY=0;scanY<=2*redius;scanY++){
          offset=Math.round(Math.sqrt(2*redius*scanY-scanY*scanY))
          drawLine(myCanvasContext,x-offset,y-redius+scanY,x+offset,y-redius+scanY,handleColor)
      }
  }
  ```
  
  






#### 2、鼠标交互明细<a id="two"></a>

在本次PJ中，鼠标的交互是一个需要精心设计的步骤。如果鼠标在顶点的区域内按下，则需要实时检测鼠标的位置以更新顶点坐标、并重绘图形，直到鼠标抬起；如果在顶点、甚至是canvas的范围外按下鼠标，就不能有任何的操作。因此，我将本PJ中与鼠标交互的流程设计如下：

- **第一步：为鼠标添加按下、抬起监听事件**

  由需求分析可知，我们需要监听鼠标的移动、按下、抬起三个事件。由于大多数时候用户移动鼠标不是为了拖拽顶点，图形也不会重绘。因此，若我们一直监听鼠标的移动，就会造成不必要的资源开销。故一开始我们只为鼠标添加按下、抬起两个事件。鼠标按下作为监听鼠标移动的开始、鼠标抬起作为监听鼠标移动的结束。

  ```javascript
  //鼠标单击canvas进入事件
  canvasBox.addEventListener("mousedown",mousePress)
  //鼠标抬起或者离开canvas离开事件
  canvasBox.addEventListener("mouseup",mouseNoPress)
  ```

- **第二步：确认鼠标是否在顶点区域内按下**

  JavaScript中定义了`event.offsetX`与`event.offsetY`两个参数来获取鼠标当前的坐标。因此，我们就可以将这个坐标对(x,y)依次与`vertex_pos`数组中存储的顶点的坐标进行对比，只要(x,y)到某一坐标点的距离小于顶点绘圆的半径，就可以确认该顶点就是用户拖动的顶点。

  ```javascript
  function isINCircle(point1,point2)//判断point1是否在以point2为原点，半径为redius的圆内（redius预先定义）
  function checkWhichTarged(){
      var event = event || window.event; //获取鼠标坐标
      for(var i=0;i<vertex_pos.length;i++){//对所有的顶点坐标依次比较
          if(isINCircle([event.offsetX,event.offsetY],[vertex_pos[i][0],vertex_pos[i][1]])){
              return i//如果确认鼠标在圆内，返回该坐标点
          }
      }
      return -1//如果在顶点外，返回-1
  }
  ```

- **第三步：为确认鼠标添加移动事件**

  在确认了鼠标位于顶点内部，并确认拖动哪一个顶点之后，就可以为鼠标添加移动事件，以方便实时监听鼠标的坐标

  ```javascript
  function mousePress(){
      //获取目标点
      targetedHandle=checkWhichTarged()
      //如果鼠标不在顶点内，不进行操作
      if(targetedHandle==-1) return
      //省略部分代码
      //反之，增添鼠标移动监听事件
      canvasBox.addEventListener("mousemove",reDrawCanvas)
  }
  ```

- **第四步：移动监听中**

  - **若鼠标抬起**

    那么就停止更新顶点坐标、停止绘图，并且移除鼠标的移动监听事件。

    ```javascript
    function mouseNoPress(){ //移除鼠标移动事件
        canvasBox.removeEventListener("mousemove",reDrawCanvas)
    }
    ```

  - **若鼠标移出canvas外**

    则停止绘图，只是更新顶点坐标。在config.js文件中，顶点的X坐标存储的是`min{鼠标X坐标,canvas宽度}`，Y坐标存储的是`min{鼠标Y坐标,canvas高度}`，且顶点坐标恒为正。实现如下：

    ```javascript
    //对X坐标记录
    if(event.offsetX<0) vertex_pos[targetedHandle][0]=0//如果鼠标Y坐标为负数，config.js中顶点X存为0
    else if(event.offsetX>canvasSize.maxX) vertex_pos[targetedHandle][0]=canvasSize.maxX//如果鼠标X坐标大于canvas宽度，config.js中顶点X存为canvas宽度
    else vertex_pos[targetedHandle][0]=event.offsetX //否则正常存储
    
    //对Y坐标记录
    if(event.offsetY<0) vertex_pos[targetedHandle][1]=0//如果鼠标Y坐标为负数，config.js中顶点Y存为0
    else if(event.offsetY>canvasSize.maxY) vertex_pos[targetedHandle][1]=canvasSize.maxY//如果鼠标Y坐标大于canvas宽度，config.js中顶点Y存为canvas宽度
    else vertex_pos[targetedHandle][1]=event.offsetY //否则正常存储
    ```

  - **若正常移动**

    则实时绘图、实时更新坐标。此处实现请见[绘图部分](#one)

为了更好地展示流程关系，将鼠标监听流程图绘制如下：

<img src="./4.jpg" style="zoom: 80%;" >

​																								（图4）



#### 3、绘制顺序确认<a id="three"></a>

首先我们来给4个四边形和9个顶点进行一个编号，如图5所示：

<img src="./7.png" style="zoom: 25%;" >

​																										（图5）

其中黑色的数字代表对应的顶点号、白色的数字代表对应的四边形号。因为我们默认的绘图顺序是：1—>2—>3—>4，若此时第1个四边形被其他四边形所覆盖（如图6所示），无论如何拖动第1个四边形的顶点，四边形都无法显现（如图7所示），用户交互十分不友好。

<a id="picSix"></a>

<img src="./5.png" style="zoom: 25%;" >

​																										（图6）

<img src="./6.png" style="zoom: 25%;" >

​																										（图7）

因此需要将用户拖动的四边形放在最后来绘制，这样才能显示出我们移动的四边形。这样更清晰直观。于是我们就可以在config.js文件中维护一个`drawSequence`数组，用来保存下一次绘制四边形的顺序。确认顺序的方法如下：

- **如果移动的顶点只会影响1个四边形，即点1、3、7、9：**那么我们就将这个顶点放到`drawSequence`数组的最后，原先在这个顶点后面的顶点一次前移。
  - 例：若原先`drawSequence[4]={2,3,1,4}`，此时我们拖动了顶点7，影响四边形3，那么新的数组就变成了`drawSequence[4]={2,1,4,3}`
- **如果移动的顶点只会影响2个四边形，即点2、4、6、8：**那么我们就把影响到的2个四边形，编号大的放在末尾、编号小的放在倒数第二位。
  - 例：若原先`drawSequence[4]={2,3,1,4}`，此时我们拖动了顶点2，影响四边形1、2，那么新的数组就会变成`drawSequence[4]={4,3,1,2}`
  - 例：若原先`drawSequence[4]={4,3,1,2}`，此时我们拖动了顶点2，影响四边形1、3，那么新的数组就会变成`drawSequence[4]={4,2,1,3}`
- **如果移动的顶点只会影响4个四边形，即点5：**那么`drawSequence`数组不做任何变化

实现代码如下：

```javascript
function moveToLast(index)  //移动第index个四边形到drawSequence末尾
function moveBothToLast(index1,index2){
    moveToLast(index2)
    moveToLast(index1)
}
function mousePress(){
    targetedHandle=checkWhichTarged()  //获取被选中顶点的编号
    if(targetedHandle==-1) return      //如果没选中则结束函数
    switch(targetedHandle){
        case 4:break               //影响4个四边形，不做任何操作
        case 0:                    //影响1个四边形的情况
        moveToLast(0)
        break
        case 2:                    //影响1个四边形的情况
        moveToLast(1)
        break
        case 6:                    //影响1个四边形的情况
        moveToLast(2)
        break
        case 8:                    //影响1个四边形的情况
        moveToLast(3)
        break
        case 1:                    //影响2个四边形的情况
        moveBothToLast(1,0)
        break
        case 3:                    //影响2个四边形的情况
        moveBothToLast(2,0)
        break
        case 5:                    //影响2个四边形的情况
        moveBothToLast(3,1)
        break
        case 7:                    //影响2个四边形的情况
        moveBothToLast(3,2)
        break
    }
    canvasBox.addEventListener("mousemove",reDrawCanvas) //添加鼠标移动监听事件
}
```

经过以上的操作，当我们再次在[图6](#picSix)的情况下移动顶点1的时候，我们就可以看到清晰的四边形1：

<img src="./8.png" style="zoom: 25%;">





<div STYLE="page-break-after: always;"></div>

## 四、问题及解决

 **1.扫面线算法的实现**

- 问题描述：这是我遇到的最大的问题。最开始由于我没有考虑到算法上的优化，就只是单纯地按照扫面线与各个边求交点，然后依次填充内部的办法来实现。结果花费了大量时间写出来的代码，运行效果很差、完全无法达到预期效果。
- 解决办法：于是我便重新整理思路、并且查阅相关的在线资料，参考网站上的优秀实现[案例](https://blog.csdn.net/qq_51476492/article/details/121368557)，然后我才逐步了解、掌握到了活性边算法。于是我几乎推翻了之前的全部代码，按照活性边算法的思想，重新开始，最后实现了满意的效果。具体可以参考我写的[亮点部分](#one)



 **2.图片绘制顺序的确定**

- 问题描述：在实现了扫描线算法之后，我发现在特定情况下，我移动某个被完全遮盖的四边形的顶点，这个四边形也不会显现出来。例如：当第1个四边形被其他四边形所覆盖（如图6所示），无论如何拖动第1个四边形的顶点，第1个四边形都无法显现，这让用户的交互体验很差。
- 解决办法：站在使用者角度，我肯定会希望我移动的四边形对我是可见的。所以，最后绘制被拖动的四边形，就可以避免被遮挡的情况。于是就像我在[亮点部分](#three)写的那样，每次绘制的时候我都重新确定顺序，解决了这个问题。



 **3.扫描线与边交点的确定**

- 问题描述：在最开始实现的时候，我本来像用Bresenham算法来实现扫描线与边交点的计算的。但是后来在实践中发现，当斜率很小的时候，效果就很差：因为在斜率很小时，一次y坐标的递增会让x坐标递增许多，这就会导致绘图的不精确。同样的，以X轴坐标递增为基准进行扫描，当斜率很大时也会出现类似的情况。因此Bresenham算法不适用
- 解决办法：最终我还是采用最传统的方法，用直线函数公式来计算、取整后，得到近似点的坐标。





## 五、缺陷与思考

目前代码最大的缺陷是：没有用上类似于Bresenham的优秀算法来计算扫描线与边的坐标，而只是通过函数公式计算、取整近似值来得到像素点坐标。这是因为我们以y轴坐标递增为基准进行扫描，就对于斜率很小的情况不友好。因为在斜率很小时，一次y坐标的递增会让x坐标递增许多，以X轴坐标递增为基准进行扫描同理。因此Bresenham算法不适用，但我也没能寻找到其他合适的算法来提升我的交点计算速度，希望以后能进行改进。

