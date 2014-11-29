




var indentFromCenter =120;
var indentLastNode = 135;

var backgroundcolor = "#303030";

var width = 1300;//width and height for entire svg chart, margin included
var height = 1350;


var diameter = 1000 - 2* indentFromCenter - 2 *indentLastNode;

var radiuscorretion= 0;
var radius = diameter/2 - radiuscorretion ;

var horizontalCorrection = 4.5;
var verticalCorrection = -2.0;//-1.8

var tree = d3.layout.tree()
    .size([270+horizontalCorrection, radius])
    .separation(function(a, b) { 
      return (a.parent == b.parent ? 1 : 2) / a.depth;
        //return (a.parent == b.parent ? 1 : 1.5);
    });



var svgtranslateX = radius + 2*indentFromCenter+indentLastNode+radiuscorretion+40;
var svgtranslateY = svgtranslateX ;

var svg = d3.select("#d3graph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class","chart")
    //.style('background','#FFFFFF')
    .append("g")
    .attr("transform", "translate("+svgtranslateX+","+svgtranslateY+")rotate("+verticalCorrection+")")
    .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
    .append("g")

//append a rect over the svg for dragging
svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate("+ (-svgtranslateX) +","+ (-svgtranslateY)+")rotate("+(-verticalCorrection)+")")

function zoom() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}



//rotate(" + (d.x - 90 ) + ")translate(" + d.y + ")"
 d3.json("realdata.json", function(error, data) {

  var nodes = tree.nodes(data);

  var links = tree.links(nodes);
  
  //i basically spent two days trying out to figure out how to make the links
  //straight
  
  var diagonal = d3.svg.diagonal.radial()
    .projection( function (d) {return [d.y + indentFromCenter, d.x/180*Math.PI];})
    

  var link = svg.selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d",diagonal)
        .attr('fill','none')
        .attr('stroke-width',function(d){
          return  d.source.name=='God'?'0px':'1px';
        })
        .attr('stroke','#484848')



  var node = svg.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function(d,i) {
          var translatey;

          if (d.depth>0&&d.depth<20){
            translatey = d.y+indentFromCenter;
          }
          else{
              translatey=d.y;
          }
           if(d.depth>19){

             translatey = d.y + indentFromCenter+indentLastNode;
           }
          

          // var translatey = (d.depth>0)? d.y+indentFromCenter : d.y;
          return "rotate(" + (d.x - 90 ) + ")translate(" + translatey + ")";
       });


  //CREATING CIRCULAR GRID
   var depthArray=[];

 
   for(var i=0;i<nodes.length;i++){
    depthArray.push(nodes[i].depth);
   }
   function getMax(array){
    return Math.max.apply(Math,array);
  }

  var depthWidth=getMax(depthArray);

  //INSERT GRID FOR NODE #1-19 INCLUSIVE
   for(var i =0;i<depthWidth-1;i++){
      svg.insert('circle','.node')//insert before .node so it is below the node
          .attr('r',function(d){
             //console.log((radius)/depthWidth*(i+1)+indentFromCenter)
            return (radius)/depthWidth*(i+1)+indentFromCenter;
          })
          .style('fill','none')
          .attr('stroke','#606060')
          .attr('class','grid')
   }

   //INSERT GRID FOR #20 node
   svg.insert('circle','.node')
        .attr('r',(radius)/depthWidth*20+indentFromCenter+indentLastNode)
        .style('fill','none')
        .attr('stroke','#606060')
        .attr('class','grid')


  var dotRadius = 12.2/2;
  var dotReducer = 1.5;

  var dots = [
    {'color':'none','isfull':'0'},

    {'color':'#FFFFFF','isfull':'1'},
    {'color':'#90D7F1','isfull':'0'},//2,empty dot 
    {'color':'#90D7F1','isfull':'1'},
    {'color':'#00ADEF','isfull':'1'},
    {'color':'#2F7FC2','isfull':'0'},//5

    {'color':'#2F7FC2','isfull':'1'},
    {'color':'#8D54A1','isfull':'1'},
    {'color':'#BD74B0','isfull':'0'},//8
    {'color':'#BD74B0','isfull':'1'},
    {'color':'#EC008B','isfull':'0'},//10

    {'color':'#EC008B','isfull':'1'},
    {'color':'#F15E38','isfull':'0'},//12
    {'color':'#F15E38','isfull':'1'},
    {'color':'#F9A445','isfull':'1'},
    {'color':'#FFF100','isfull':'0'},//15

    {'color':'#FFF100','isfull':'1'},
    {'color':'#BCD530','isfull':'1'},
    {'color':'#38B449','isfull':'0'},//18
    {'color':'#38B449','isfull':'1'},  //19th: last one for the kind

  ];

  
  node.append('circle')
    .attr('r',function(d,i){

        //if value is 1 and not parent node
        if(d.value!=0 && d.depth!= 0 && d.depth<20){

            return  dots[d.depth].isfull==0? dotRadius - dotReducer: dotRadius;
        }
        else if(d.depth ==20){

          //for later uses.
            return '0';
        }
        

    })
    .style('fill',function(d,i){
         if(d.value!=0 && d.depth!= 0 && d.depth<20){

            return dots[d.depth].isfull==0? backgroundcolor :dots[d.depth].color;
         }
    })
    .attr('stroke-width',function(d){
        if(d.value!=0 && d.depth!= 0 && d.depth<20){
          return dots[d.depth].isfull==0? 2 * dotReducer :'0';
        }
    })
    .attr('stroke',function(d){
        if(d.value!=0 && d.depth!= 0 && d.depth<20){
          return dots[d.depth].isfull==0? dots[d.depth].color : 'none';
        }
    })


    //APPEND NAMES
    function appendName(){
    node.append("text")
        .attr("dy", ".81em")
        .attr("font-family","Akkurat-Fett")
        .attr("font-size","6pt")
        .style("fill","#FFFFFF")
        .attr("text-anchor", function(d) {

         return d.x < 180 ? "start" : "end";
        })
        .attr("transform", function(d) { 
          return d.x < 180 ? "translate(35,-5)" : "rotate(180)translate(-35,-5)"; 
        })
        .text(function(d) {
          if(d.depth==19){
              return d.firstname + " "+ d.lastname;
          }

       });
    }

     var ss = new Date();
     appendName();
     var stopss = new Date() - ss;
     //console.log("append name takes " + stopss)

    //DRAW REGIONS CIRCLES
    var regions=[
      {"scale":"global","color": "#8D54A1","radius":"18.6"},//7 global
      {"scale":"country","color": "#4D62AD","radius":"16.4"},//6
      {"scale":"region","color": "#00ADEF","radius":"14.2"},//
      {"scale":"state","color": "#EC008B","radius":"12"},
      {"scale":"city","color": "#F15E38","radius":"9.8"},
      {"scale":"community","color": "#F9A445","radius":"7.6"},//2
      {"scale":"organization","color": "#FFF100","radius":"5.4"},//1
      {"scale":"individual","color": "#FFFFFF","radius":"3.2"},//0 individual

    ]
    
    //DRAW GLOBAL CIRCLE
    node.append("circle")
      .attr("r",function(d){
        if(d.depth==20){
          return d.global==1? regions[0].radius: 0 ;}
      })
      .attr('stroke',function(d){
          if(d.depth==20){
          return d.global==1? regions[0].color: 0 ;}
      })
      .attr('fill',backgroundcolor)

      //DRAW COUNTRY CIRCLE
      node.append("circle")
      .attr("r",function(d){
        if(d.depth==20){
          return d.country==1? regions[1].radius: 0 ;}
      })
      .attr('stroke',function(d){
          if(d.depth==20){
          return d.country==1? regions[1].color: 0 ;}
      })
      .attr('fill',backgroundcolor)

      //DRAW REGION CIRCLE
      node.append("circle")
      .attr("r",function(d){
        if(d.depth==20){
          return d.region==1? regions[2].radius: 0 ;}
      })
      .attr('stroke',function(d){
          if(d.depth==20){
          return d.region==1? regions[2].color: 0 ;}
      })
      .attr('fill',backgroundcolor)

      //DRAW STATE CIRCLE
      node.append("circle")
      .attr("r",function(d){
        if(d.depth==20){
          return d.state==1? regions[3].radius: 0 ;}
      })
      .attr('stroke',function(d){
          if(d.depth==20){
          return d.state==1? regions[3].color: 0 ;}
      })
      .attr('fill',backgroundcolor)

      //DRAW CITY CIRCLE
      node.append("circle")
      .attr("r",function(d){
        if(d.depth==20){
          return d.city==1? regions[4].radius: 0 ;}
      })
      .attr('stroke',function(d){
          if(d.depth==20){
          return d.city==1? regions[4].color: 0 ;}
      })
      .attr('fill',backgroundcolor)

      //DRAW COMMUNITY CIRCLE
      node.append("circle")
      .attr("r",function(d){
        if(d.depth==20){
          return d.community==1? regions[5].radius: 0 ;}
      })
      .attr('stroke',function(d){
          if(d.depth==20){
          return d.community==1? regions[5].color: 0 ;}
      })
      .attr('fill',backgroundcolor)

      //DRAW ORGANIZATION CIRCLE
      node.append("circle")
      .attr("r",function(d){
        if(d.depth==20){
          return d.organization==1? regions[6].radius: 0 ;}
      })
      .attr('stroke',function(d){
          if(d.depth==20){
          return d.organization==1? regions[6].color: 0 ;}
      })
      .attr('fill',backgroundcolor)

      //DRAW INDIVIDUAL CIRCLE
      node.append("circle")
      .attr("r",function(d){
        if(d.depth==20){
          return d.individual==1? regions[7].radius: 0 ;}
      })
      .attr('stroke',function(d){
          if(d.depth==20){
          return d.individual==1? regions[7].color: 0 ;}
      })
      .attr('fill','#FFFFFF')
  


      //This code needs to be rewritten, the purpose is to append dots separately from dots

      //-====================================================
      //APPEND TERMS
      //====================================================
      var termColor =[
        {"long":"#087F9A"},//long, termIndex =0
        {"medium":"#00ADEF"},//medium
        {"short":"#A6DDF0"}//short
      ]

      var sColor = "#A6DDF0";
      var mColor = "#00ADEF";
      var lColor = "#087F9A";

      var termDotRadius = 2.8;


      
      var positions = nodes.map(function(d) { return [d.x, d.y]; });

      var start = new Date();

      var dotgap = 30;

      var dot0 = 30;

      var gapBtw = 9;

      for(var i = 20 ; i< positions.length ; i+= 20){

        function makeDot(gap,color){
          svg.append("circle")
          .attr("r",termDotRadius)
          .style("fill",color)
          .attr("transform",function(){
            var translatey = positions[i][1] + indentFromCenter+indentLastNode + gap;
            return "rotate(" + (positions[i][0]- 90 ) + ")translate(" + translatey + ")";
          })

        }

          if (nodes[i].short==1 && nodes[i].medium==0 && nodes[i].long==0)
          {
            makeDot(dot0,sColor)
            makeDot(dot0+gapBtw,sColor)

          }
          else if (nodes[i].short==0 && nodes[i].medium==1 && nodes[i].long==0){
            makeDot(dot0,mColor)
            makeDot(dot0+gapBtw,mColor)
            makeDot(dot0+gapBtw*2,mColor)
            makeDot(dot0+gapBtw*3,mColor)
          }
          else if (nodes[i].short==0 && nodes[i].medium==0 && nodes[i].long==1)
          {

            makeDot(dot0,lColor)
            makeDot(dot0+gapBtw,lColor)
            makeDot(dot0+gapBtw*2,lColor)
            makeDot(dot0+gapBtw*3,lColor)
            makeDot(dot0+gapBtw*4,lColor)
            makeDot(dot0+gapBtw*5,lColor)
    
          }
          else if (nodes[i].short==1 && nodes[i].medium==1 && nodes[i].long==0){
            
            makeDot(dot0,sColor)
            makeDot(dot0+gapBtw,sColor)

            makeDot(dot0+gapBtw*3,mColor)
            makeDot(dot0+gapBtw*4,mColor)
            makeDot(dot0+gapBtw*5,mColor)
            makeDot(dot0+gapBtw*6,mColor)

          }
          else if(nodes[i].short==0 && nodes[i].medium==1 && nodes[i].long==1){
            

            makeDot(dot0,mColor)
            makeDot(dot0+gapBtw,mColor)
            makeDot(dot0+gapBtw*2,mColor)
            makeDot(dot0+gapBtw*3,mColor)

            makeDot(dot0+gapBtw*5,lColor)
            makeDot(dot0+gapBtw*6,lColor)
            makeDot(dot0+gapBtw*7,lColor)
            makeDot(dot0+gapBtw*8,lColor)
            makeDot(dot0+gapBtw*9,lColor)
            makeDot(dot0+gapBtw*10,lColor)
          }
          else if(nodes[i].short==1 && nodes[i].medium==0 && nodes[i].long==1){
         
            makeDot(dot0,sColor)
            makeDot(dot0+gapBtw,sColor)

            makeDot(dot0+gapBtw*3,lColor)
            makeDot(dot0+gapBtw*4,lColor)
            makeDot(dot0+gapBtw*5,lColor)
            makeDot(dot0+gapBtw*6,lColor)
            makeDot(dot0+gapBtw*7,lColor)
            makeDot(dot0+gapBtw*8,lColor)
          }
          else if(nodes[i].short==1 && nodes[i].medium==1 && nodes[i].long==1){
            makeDot(dot0,sColor)
            makeDot(dot0+gapBtw,sColor)

            makeDot(dot0+gapBtw*3,mColor)
            makeDot(dot0+gapBtw*4,mColor)
            makeDot(dot0+gapBtw*5,mColor)
            makeDot(dot0+gapBtw*6,mColor)

            makeDot(dot0+gapBtw*8,lColor)
            makeDot(dot0+gapBtw*9,lColor)
            makeDot(dot0+gapBtw*10,lColor)
            makeDot(dot0+gapBtw*11,lColor)
            makeDot(dot0+gapBtw*12,lColor)
            makeDot(dot0+gapBtw*13,lColor)

          }
      }






      var termtime = new Date() - start;
      //console.log("term time takes " +termtime) 


    //==========================END OF APPENDING TERMS==========================
    

    //==========================ANIMATION==========================  ^O^


    // var tooltip = d3.select("body").append("div")
    //       .style("position","absolute")
    //       .style("padding","0 10px")
    //       .style("background","white")
    //       .attr("class","selector")
    //       .style("opacity",0)


    // node.on("mouseover",function(d,i){

    //     tooltip.transition()
    //       .style("opacity",.7)

    //     var tooltiptext=[];

    //     function insertLineBreak(regionarray){
    //       if(regionarray.length>3){
    //         return "<br";
    //       }
    //     }
    //     if(d.depth<19){
    //       tooltiptext=d.name;
    //       tooltip.html(tooltiptext)
    //       .style('left',(d3.event.pageX +10 ) + 'px')
    //       .style('top', (d3.event.pageY ) + 'px')
         
    //       ;
    //     }
    //     else if (d.depth==20){
    //         if(d.individual==1){
    //           tooltiptext.push("individual<br>")
    //         }
    //         if(d.organization==1){
    //           tooltiptext.push("organization<br>")
    //         }
    //         if(d.community==1){
    //           tooltiptext.push("community<br>")
    //         }
    //         if(d.city==1){
    //           tooltiptext.push("city<br>")
    //         }
    //         if(d.state==1){
    //           tooltiptext.push("state<br>")
    //         }
    //         if(d.region==1){
    //           tooltiptext.push("region<br>")
    //         }
    //         if(d.country==1){
    //           tooltiptext.push("country<br>")
    //         }
    //         if(d.global==1){
    //           tooltiptext.push("global<br>")
    //         }
    //         tooltip.html(tooltiptext.join(" "))
    //             .style('left',(d3.event.pageX +10 ) + 'px')
    //             .style('top', (d3.event.pageY ) + 'px')
    //             ;
    //     }

    //     //MAKE DOTS BIGGER 
    //     if(d.depth>0 && d.value==1){

    //       //INCREASE THE RADIUS
    //       if(d.depth<20){
    //         d3.select(this).select('circle')
    //           .transition()
    //           .duration(120)
    //           .style('cursor','none')
    //           .attr('r',function(d){
    //             return dots[d.depth].isfull==0? dotRadius + 1.5 : dotRadius + 3;
    //           })

    //       }

      

    //     }})
    //     //when mouse move out, smake dots original size
    //     .on("mouseout",function(d,i){

    //       tooltip.html("")
    //       if(d.depth>0 && d.value==1){
    //         if(d.depth<20){
    //             d3.select(this).select('circle')
    //               .transition()
    //               .duration(250)
    //               .style('cursor','none')
    //               .attr('r',function(d){
    //                 return dots[d.depth].isfull==0? dotRadius - dotReducer : dotRadius;
          
    //               })
    //           }

    //       }
    //     })


      //========================
      //============MAKE ONE THIRD QUATRE OPAQUE


      var vis = d3.select("body").append("svg")
      var pi = Math.PI;
      
      var arcRotation = 270 - verticalCorrection;

      var arc = d3.svg.arc()
          .innerRadius(indentFromCenter+10)
          .outerRadius(355)
          .startAngle(0.0174532925/2) //converting from degs to radians
          .endAngle(pi/2) //just radians
          
      // Added height and width so arc is visible
          svg.insert("path",".node")
          .attr("d", arc)
          .attr("fill", backgroundcolor)
          .style("opacity",0.8)
          .attr("transform","rotate("+arcRotation+")")


      // //APPEND DEPARTMENT ARCS
      var departmentArc = [
         {"color":"#3D7B93","endangle":pi/2 - 0.5411,"ends":"Pitt"},
         {"color":"#80A9BC","endangle":pi/2 - 0.3840,"ends":"Hobbie"},
         {"color":"#BAD8E5","endangle":pi/2 - 0.2443,"ends":"Martin"},
         {"color":"#B5B381","endangle":pi/2 + 0.0698,"ends":"Snyder"},
         {"color":"#878737","endangle":pi/2 + 0.2967,"ends":"Uggen"},
         {"color":"#656229","endangle":pi/2 + 0.4363,"ends":"Pelican"},
         {"color":"#58585B","endangle":pi/2 + 0.5235,"ends":"Benjaafar"},
         {"color":"#808284","endangle":pi/2 + 0.5934,"ends":"Matson"},
         {"color":"#A7A9AB","endangle":pi/2 + 0.8203,"ends":"Ramaswami"},
         {"color":"#FFFFFF","endangle":pi/2 + 1.1345,"ends":"Gunn"},
         {"color":"#E17933","endangle":pi/2 + 1.3614,"ends":"Convertino"},
         {"color":"#B45626","endangle":pi/2 + 1.50098316,"ends":"Pawlisch"},
         {"color":"#9A3020","endangle":pi/2 + 1.95476876,"ends":"RT Rybak"},
         {"color":"#642E11","endangle":pi/2 + pi +0.0174532925,"ends":"Chapman"}

      ]

      var otherarcRotation = - verticalCorrection;
      // console.log("first angle is " + departmentArc[0].endangle)

      for(var i =0;i< departmentArc.length;i++){
          thearc= d3.svg.arc()
            .innerRadius(365)
            .outerRadius(370)
            .startAngle(function(){
              return i==0? 0 : departmentArc[i-1].endangle;
            })
            .endAngle(departmentArc[i].endangle)
          svg.append("path")
            .attr("d",thearc)
            .attr("fill",departmentArc[i].color)
            .attr("transform","rotate("+(otherarcRotation)+ ")")


      }

      var arcPitt = d3.svg.arc()
            .innerRadius(365)
            .outerRadius(370)
            .startAngle(0)
            .endAngle(departmentArc[0].endangle)
            

            svg.append("path")
              .attr("d",arcPitt)
              .attr("fill",departmentArc[0].color)
              .attr("transform","rotate("+(otherarcRotation)+ ")")
     // =================================================
     //  ADDING LEGEND ====================================
     //  ====================================

      var fieldData = [];

      for(var i = 1; i<20 ;i++){
        fieldData.push(nodes[i].name)
      }


      var legendfontsize = "6.2pt";

      var textIndent = - 70;
      var textHeightCorrection = -6;
      var circleHeightCorrection =10;

      var smallRadius = dotRadius  * 0.75;
      var samllDotReducer = dotReducer *0.75;
      for(var i =0; i <depthWidth  ; i++){

      // console.log(fieldData[i].name)
      
          svg.append("text")
            .attr("dy", ".81em")
            .attr("font-family","Akkurat-Fett")
            .attr("font-size",legendfontsize)
            .style("fill","#BBBDC0")
            .style("word-spacing",1)
            .attr("text-anchor","end")
            .text(fieldData[i])
            .attr("x",textIndent)
            .attr("y",-(radius)/depthWidth*(i+1)-indentFromCenter + textHeightCorrection)
            .attr("transform","rotate("+(-verticalCorrection)+")")


          var index =!19? i+1: i;

          svg.append("circle")
            .attr('r',function(){
              //return smallRadius;
              return dots[index].isfull==0? smallRadius - samllDotReducer: smallRadius;
            })
            .attr('cx',textIndent+25)
            .attr('cy',-(radius)/depthWidth*(i+1)-indentFromCenter + circleHeightCorrection )
            .attr("transform","rotate("+(-verticalCorrection)+")")
            .style('fill',function(d,i){

                return dots[index].isfull==0? backgroundcolor :dots[index].color;
           
              })
              .attr('stroke-width',function(d){
                    return dots[index].isfull==0? 2 * samllDotReducer :'0';
                  
              })
              .attr('stroke',function(d){
                    return dots[index].isfull==0? dots[index].color : 'none';
                  
              })

      }

      var regionData = [];

      var regionIndentY = -295;
      //APPEND REGION LEGEND
      for (var i =0;i<8;i++){

        svg.append("text")
            .attr("dy", ".81em")
            .attr("font-family","Akkurat-Fett")
            .attr("font-size",legendfontsize)
            .style("fill","#BBBDC0")
            .attr("text-anchor","end")
            .text(regions[i].scale)
            .attr("x",textIndent)
            .attr("y",-(radius)/depthWidth*(i+1)-indentFromCenter + textHeightCorrection +regionIndentY  )
            .attr("transform","rotate("+(-verticalCorrection)+")")

        svg.append("circle")
            .attr('r',smallRadius*0.75)
            .attr('cx',textIndent+25)
            .attr('cy',-(radius)/depthWidth*(i+1)-indentFromCenter + circleHeightCorrection +regionIndentY -12)
            .attr("transform","rotate("+(-verticalCorrection)+")")
            .style('stroke',function(){

                return regions[i].color;
           
              })
            .style('stroke-width',2)
            .style('fill',function(){
              return (regions[i].scale=="individual") ? "#FFFFFF" : backgroundcolor;
            })



      }

      var termData = [
        {"term":"short term (<1 yr)","color":"#A6DDF0"},
        {"term":"medium term (1 - 10 yr)","color":"#00ADEF"},
        {"term":"long term (10+ yr)","color":"#087F9A"}
      ]

      

     

      function drawDot(horizontalGap,verticalGap,color){
          svg.append("circle")
            .attr('r',termDotRadius)
            .attr('cx',textIndent+25+horizontalGap)
            .attr('cy',-(radius)/depthWidth*(i+1)-indentFromCenter + circleHeightCorrection +regionIndentY - 9.4 + verticalGap)
            .attr("transform","rotate("+(-verticalCorrection)+")")
            .style('fill',function(){

                return color;
              })
      }
      var shorty= -90;
      var mediumy= -100;
      var longy = -110;

      var termIndentY = -80;

      function drawShort(){
        drawDot(8,shorty,termData[0].color)
        drawDot(0,shorty,termData[0].color)

      }
      function drawMedium(){
        drawDot(24,mediumy,termData[1].color)
        drawDot(16,mediumy,termData[1].color)
        drawDot(8,mediumy,termData[1].color)
        drawDot(0,mediumy,termData[1].color)
      }
      function drawLong(){
        drawDot(40,longy,termData[2].color)
        drawDot(32,longy,termData[2].color)
        drawDot(24,longy,termData[2].color)
        drawDot(16,longy,termData[2].color)
        drawDot(8,longy,termData[2].color)
        drawDot(0,longy,termData[2].color)


      }

      drawShort()
      drawMedium()
      drawLong()

      for(var i =0;i<3;i++){
        svg.append("text")
            .attr("dy", ".81em")
            .attr("font-family","Akkurat-Fett")
            .attr("font-size",legendfontsize)
            .style("fill","#BBBDC0")
            .attr("text-anchor","end")
            .text(termData[i].term)
            .attr("x",textIndent)
            .attr("y",-(radius)/depthWidth*(i+1)-indentFromCenter + circleHeightCorrection +regionIndentY - 9.4 -190)
            .attr("transform","rotate("+(-verticalCorrection)+")")

      }

 

});

d3.select(self.frameElement).style("height", diameter - 150 + "px");

