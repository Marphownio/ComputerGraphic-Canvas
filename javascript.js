//结构部分：定义存储边信息的类edgesCrossed
class edgesCrossed {
    constructor (pointHigh , pointLow){ //构造函数，分别代表边的两个端点坐标，其中High或Low是按照y轴来分的
        this.pointHigh=pointHigh
        this.pointLow=pointLow
        this.m=(pointHigh[0]-pointLow[0])/(pointHigh[1]-pointLow[1]) //x=my+n中的m斜率，保存是为了更好计算坐标
        this.n=pointHigh[0]-pointHigh[1]*this.m                      //x=my+n中的n常数，保存是为了更好计算坐标
        this.CurrentScanPoint=pointLow                               //当前与扫描线的交点，默认是最低点（因为扫描线从y=0开始扫描）
        this.nextedgeCrossed = null                                  //下一条与扫描线相交的边.也是就是edge table
        this.nextActiveEdge = null                                   //下一条活性边,也就是active edge table
    }
    setNextEdgeCrossed(next){//设置下一条相交边，也是就是edge table
        this.nextedgeCrossed=next
        this.nextActiveEdge=next
    }
    setNextActiveEdge(next){//设置下一条活性边,也就是active edge table
        this.nextActiveEdge=next
    }
}



//全局变量部分：方便函数获取
var scanLines               //定义扫面线数组
var activeEdges             //活性边链表
// var ifChanged             
var canvasBox               //全局dom对象，方便绘制
var redius                  //顶点半径
var targetedHandle          //用户鼠标点击的顶点序号



//执行部分
window.onload=function(){
    //获取dom对象与画布
    var myCanvas = document.getElementById("myCanvas");
    myCanvasContext=myCanvas.getContext("2d");
    //设置canvas画布的大小
    myCanvas.width=canvasSize.maxX;
    myCanvas.height=canvasSize.maxY;
    //将canvas坐标整体偏移0.5，用于解决宽度为1像素的线段的绘制问题
    myCanvasContext.translate(0.5, 0.5); 
    //初始化图像
    initializeMyCanvas();
    canvasBox = document.getElementById("myCanvas")
    //鼠标单击canvas进入事件
    canvasBox.addEventListener("mousedown",mousePress)
    //鼠标抬起或者离开canvas离开事件
    canvasBox.addEventListener("mouseup",mouseNoPress)
    
}



//函数功能部分
//1、确定4个四边形绘制顺序中，将序号为index的四边形放到最后绘制
function moveToLast(index){
    var i
    //寻找到最初的下标
    for(var i=0; ;i++){ 
        if(drawSequence[i]==index) break
    }
    //将在index之后的元素向前移
    if(i==drawSequence.length-1) return
    for(var j=i;j<drawSequence.length-1;j++){
        drawSequence[j]=drawSequence[j+1]
    }
    //最后将index赋值到数组最后
    drawSequence[j]=index
}

//2、确定4个四边形绘制顺序中，将序号为index1，index2的2个四边形放到最后绘制
function moveBothToLast(index1,index2){
    moveToLast(index2)
    moveToLast(index1)
}

//3、鼠标事件，当鼠标按下的时候执行
function mousePress(){
    //先确认鼠标是否在顶点范围内按下
    targetedHandle=checkWhichTarged()
    if(targetedHandle==-1) return
    else{
        switch(targetedHandle){//根据按下的不同顶点，重新确定四边形绘制顺序
            case 4:break             //不改变顺序的情况
            case 0:                  //改变1个四边形的情况
                moveToLast(0)
                break
            case 2:
                moveToLast(1)
                break
            case 6:
                moveToLast(2)
                break
            case 8:
                moveToLast(3)
                break
            case 1:                 //改变2个四边形的情况
                moveBothToLast(1,0)
                break
            case 3:
                moveBothToLast(2,0)
                break
            case 5:
                moveBothToLast(3,1)
                break
            case 7:
                moveBothToLast(3,2)
                break
        }

    }
    //添加鼠标移动事件
    canvasBox.addEventListener("mousemove",reDrawCanvas)
}

//4、重绘画布
function reDrawCanvas(){
    //清除canvas原有的内容
    myCanvas.width=canvasSize.maxX;
    myCanvas.height=canvasSize.maxY;
    //获取鼠标位置，更新顶点位置，同时处理鼠标离开canvas区域的情况
    var event = event || window.event;
    if(event.offsetX<0) vertex_pos[targetedHandle][0]=0                                  //如果鼠标Y坐标为负数，config.js中顶点X存为0
    else if(event.offsetX>canvasSize.maxX) vertex_pos[targetedHandle][0]=canvasSize.maxX //如果鼠标X坐标大于canvas宽度，config.js中顶点X存为canvas宽度
    else vertex_pos[targetedHandle][0]=event.offsetX                                     //否则正常存储
    if(event.offsetY<0) vertex_pos[targetedHandle][1]=0                                  //同理
    else if(event.offsetY>canvasSize.maxY) vertex_pos[targetedHandle][1]=canvasSize.maxY
    else vertex_pos[targetedHandle][1]=event.offsetY
    //绘制四边形
    initializeMyCanvas()
}

//5、鼠标事件，当鼠标抬起时，移除鼠标移动事件
function mouseNoPress(){
    canvasBox.removeEventListener("mousemove",reDrawCanvas)
}

//6、判断鼠标坐标是否在顶点内
function isInCircle(point1,point2){
    if((Math.pow(point1[0]-point2[0],2)+Math.pow(point1[1]-point2[1],2))<Math.pow(redius,2)){
        return true
    }
    else return false
}

//7、判断鼠标点击到了哪个顶点，如果在顶点外返回-1，否则返回对应的顶点序号
function checkWhichTarged(){
    var event = event || window.event;
    //依次判断鼠标坐标与顶点的关系
    for(var i=0;i<vertex_pos.length;i++){
        if(isInCircle([event.offsetX,event.offsetY],[vertex_pos[i][0],vertex_pos[i][1]])){
            return i
        }
    }
    return -1
}

//8、绘制图像：扫描线移动时，获取扫描线与edge相交的下一个点坐标
function getNextPoint(edge){
    edge.CurrentScanPoint[1]++   //y坐标+1
    edge.CurrentScanPoint[0]=Math.round(edge.m*edge.CurrentScanPoint[1]+edge.n) //计算x坐标
}

//9、绘制图像：获取扫描线数组（对单个四边形）
function getScanLines(index)
{
    //数组初始化
    scanLines = Array(canvasSize.maxY+1)
    //先确定画的是第几个四边形
    var currentPolygon = polygon[index];
    var lastVertex,currentVertex,nextVertex,temp,currentY
    for(var i = 0; i<currentPolygon.length; i++){
        //对当前四边形的每个点进行判断，获取当前点currentVertex
        currentVertex = currentPolygon[i]
        currentY = vertex_pos[currentVertex][1]
        //获取该点按照逆时针的上一点的lastVertex
        lastVertex = currentPolygon[(i-1+currentPolygon.length)%currentPolygon.length]
        //如果上一点lastVertex的y坐标大于当前点currentVertex的y坐标
        //注意：因为以下两个判断都是大于没有等于，所以相当于是把与扫描线平行的边剔除了
        if(vertex_pos[lastVertex][1]>vertex_pos[currentVertex][1]){
            //新建边edge
            var newEdge = new edgesCrossed([vertex_pos[lastVertex][0],vertex_pos[lastVertex][1]],[vertex_pos[currentVertex][0],vertex_pos[currentVertex][1]])
            //将边加入边组edge table中
            //如果当前为空，直接插入
            if(scanLines[currentY]==null){
                scanLines[currentY]=newEdge
            }
            else{
                temp=scanLines[currentY]
                //在最后一个边后插入
                while(temp.nextedgeCrossed!=null){
                    temp=temp.nextedgeCrossed
                }
                temp.setNextEdgeCrossed(newEdge)
            } 
        }
        //获取该点按照逆时针的下一点的nextVertex
        nextVertex = currentPolygon[(i+1+currentPolygon.length)%currentPolygon.length]
        //如果下一点nextVertex的y坐标大于当前点currentVertex的y坐标
        if(vertex_pos[nextVertex][1]>vertex_pos[currentVertex][1]){
            //新建边edge
            var newEdge = new edgesCrossed([vertex_pos[nextVertex][0],vertex_pos[nextVertex][1]],[vertex_pos[currentVertex][0],vertex_pos[currentVertex][1]])           
            //将边加入边组edge table中
            //与上同理
            if(scanLines[currentY]==null){
                scanLines[currentY]=newEdge
            }
            else{
                temp=scanLines[currentY]
                while(temp.nextedgeCrossed!=null){
                    temp=temp.nextedgeCrossed
                }
                temp.setNextEdgeCrossed(newEdge)
            } 
        }
    }
}

//10、绘制单个图形，以便于做扫描转换
function drawSingalCanvas(index)
{
    //先确定画的是第几个四边形
    var currentPolygon = polygon[index];
    //确定该四边形需要填充的颜色
    var OriginColor = vertex_color[currentPolygon[0]];
    //建立扫描线数组
    getScanLines(index)
    for(var YScanLine=0;YScanLine<=canvasSize.maxY;YScanLine++){
        //不用绘图，直到第一次scanLines[YScanLine]不为空的时候
        if(activeEdges==null&&scanLines[YScanLine]==null){
            continue;
        }
        //需要绘图
        else{
            //获取与扫描边的交点x轴坐标
            var temp=activeEdges
            var lastActiveEdge=activeEdges
            //当前需要绘制的点
            var drawIndex = [null,null,null,null,null]
            //需要加入新的活动边
            if(scanLines[YScanLine]!=null){
                if(activeEdges==null){
                    activeEdges=scanLines[YScanLine]
                }
                else{
                    var temp=activeEdges
                    while(temp.nextActiveEdge!=null){
                        temp=temp.nextActiveEdge
                    }
                    temp.setNextActiveEdge(scanLines[YScanLine])
                }
            }
            //进入绘制步骤：确认交点与扫描线相交的顺序
            temp=activeEdges
            lastActiveEdge=activeEdges
            var tempX
            //依次对每一个活性边表中的边进行判断
            while(temp!=null){
                //获取当前点的x坐标
                tempX = temp.CurrentScanPoint[0]
                //y轴上移动1px,并且获取下一个交点坐标
                getNextPoint(temp)
                //移除已经扫描到头的活动边
                if(temp.CurrentScanPoint[1]>=temp.pointHigh[1]){
                    //维护AET链表，如果temp是活性边表表头
                    if(temp==activeEdges){
                        //如果活性边表只有temp一个边
                        if(temp.nextActiveEdge==null){
                            activeEdges=null
                        }
                        else{
                            //否则将下一边设置为表头
                            activeEdges=temp.nextActiveEdge
                        } 
                    }
                    else{
                        //直接设置下一边为表头
                        lastActiveEdge.setNextActiveEdge(temp.nextActiveEdge)
                    }
                }
                else{
                    lastActiveEdge=temp
                }
                //确认当前扫描线的几个交点与扫描线相交的先后顺序
                for(var i=0;i<4;i++){
                    //数组为空，直接插入
                    if(drawIndex[i]==null){
                        drawIndex[i]=tempX
                        break
                    }
                    //X坐标大于当前元素，则下标后移
                    if(tempX>drawIndex[i]){
                        continue
                    }
                    //X坐标小于当前元素，则将当前下标之后的元素后移
                    if(tempX<=drawIndex[i]){
                        for(var k=3;k>=i;k--){
                            drawIndex[k+1]=drawIndex[k]
                        }
                        drawIndex[i]=tempX
                        break
                    }
                }
                temp=temp.nextActiveEdge
            }
            //绘制
            for(var i=0 ; i<drawIndex.length ; i=i+2){
                drawLine(myCanvasContext,drawIndex[i],YScanLine,drawIndex[i+1],YScanLine,OriginColor)
            }
        }
    }
}

//11、初始化图像
function initializeMyCanvas()
{
    //依次绘制每个四边形
    for(var i=0 ; i<drawSequence.length ; i++){
        drawSingalCanvas(drawSequence[i]);
    }
    //依次绘制9个顶点
    for(var j=0 ; j<vertex_pos.length; j++){
        drawHandlePoint(vertex_pos[j][0],vertex_pos[j][1])
    }
}

//12、绘制顶点
function drawHandlePoint(x,y){
    redius = 10
    var offset
    var handleColor = [255,0,0]
    for(var scanY=0;scanY<=2*redius;scanY++){
        //计算得出当前x坐标与圆心x坐标的偏移量
        offset=Math.round(Math.sqrt(2*redius*scanY-scanY*scanY))
        drawLine(myCanvasContext,x-offset,y-redius+scanY,x+offset,y-redius+scanY,handleColor)
    }
}

//13、来自助教代码：绘制线段的函数绘制一条从(x1,y1)到(x2,y2)的线段，cxt和color两个参数意义与绘制点的函数相同，
function drawLine(cxt,x1,y1,x2,y2,color){
    cxt.beginPath();
    cxt.strokeStyle ="rgba("+color[0] + "," +
                           +color[1] + "," +
                           +color[2] + "," +
                           +255 + ")" ;
    //这里线宽取1会有色差，但是类似半透明的效果有利于debug，取2效果较好
    cxt.lineWidth =2;
    cxt.moveTo(x1, y1);
    cxt.lineTo(x2, y2);
    cxt.stroke();
}
