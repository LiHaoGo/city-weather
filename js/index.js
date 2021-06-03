$(function(){
//    //自动执行按钮的click事件
    setTimeout(function() {
        // IE
        if(document.all) {
            document.getElementById("choice").click();
            
        }
        // 其它浏览器
        else {
            var e = document.createEvent("MouseEvents");
            e.initEvent("click", true, true);
            document.getElementById("choice").dispatchEvent(e);
        }
    }, 2000);
   
    //城市选择表单
    var cityPicker = new IIInsomniaCityPicker({
        data: cityData,
        target: '#cityChoice',
        valType: 'k-v',
        hideCityInput: '#city',
        hideProvinceInput: '#province',
        callback: function(city_id){
            // alert(city_id);
        }
    });

    cityPicker.init();

      //根据ip地址定位
        var map = new AMap.Map("container",{
            resizeEnable: true,
            center: [116.397428, 39.90923],
            zoom: 13
        });
        //获取用户所在城市信息
        function showCityInfo() {
            //实例化城市查询类
            var citysearch = new AMap.CitySearch();
            //自动获取用户IP，返回当前城市
            citysearch.getLocalCity(function(status, result) {
              
                if (status === 'complete' && result.info === 'OK') {
                   
                    if (result && result.city && result.bounds) {
    
                        var cityinfo = result.city;
                        var  provinceinfo= result.province;
                        var citybounds = result.bounds;
                        console.log(provinceinfo,cityinfo);
                       
                        $('#city_address').text(provinceinfo+' '+cityinfo);
                        $('#cityChoice').val(cityinfo); 
                        map.setBounds(citybounds); 
                    }
                } else {
                    // document.getElementById('info').innerHTML = result.info;
            
                }
            });
        }
        showCityInfo();
		$('#weather').submit(function() {
            //获取表单数据
           $('#city_address').text($('#city_address').attr('data-name'));
			var data = {};
            var t = $(this).serializeArray();
            $.each(t, function() {
                 data[this.name] = this.value;
            });
            var _cityName = data.city;
            _cityName = _cityName.substr(0, _cityName.length - 1);  
            console.log(_cityName);
            // 汉字转拼音
            var cityPinYin = pinyin.getFullChars(_cityName);
            $('#cityName').text(cityPinYin)
            console.log( pinyin.getFullChars(_cityName));  
            //改变背景图
            
			var city = data.city;
			if(city){
				get_city(city);
			}
			return false;
		});
 
        // 只能搜索市、区、县
		function get_city(city, source='pc'){
			$.ajax({
				url: 'https://wis.qq.com/city/like', 
				type: 'get',
				data: {
					source: source, 
					city: city
				}, 
				dataType: 'jsonp',
				success: function(res){
                    if(res.status == 200 && res.data){
                        console.log(res.data); //搜索json列表
 
                        for(var key in res.data){ //遍历接口
                            get_weather(res.data[key]);
                        }
                        
                    }
				}
                
			});
		}
 
        /*
        * 天气查询
        * 参数介绍
        * source: pc  //接口类型pc或者wx
        * callback: 回调函数 不传直接返回json
        * weather_type参数(查询类型，多个|分隔): 
        *   observe 当前天气
        *   alarm 预警
        *   tips 天气介绍
        *   index 穿衣，舒适度等等...
        *   air 空气质量
        *   rise 日出
        */
        function get_weather(data, source='pc', weather_type='observe|forecast_1h|forecast_24h|index|alarm|limit|tips|air|rise', callback=''){
            let address = data.split(',');
            let province = address[0], city = address[1], county = address[2] || '';
            $.ajax({
				url: 'https://wis.qq.com/weather/common', 
				type: 'get',
				data: {
					source: source, 
					weather_type: weather_type,
                    province: province,
                    city: city,
                    county: county
				}, 
				dataType: 'jsonp',
				success: function(res){
                    if(res.status == 200 && res.data){
                        console.log(res);
                       
                        //当前天气
                        var observe = res.data.observe;
                        var air = res.data.air;
                        var forecast_1h = res.data.forecast_1h;
                        var index = res.data.index;
                        var text = '天气：' + observe.weather + '，气温：' + observe.degree + ',' + '，湿度：' + observe.humidity + '，气压：' + observe.pressure + '，风力：' + observe.wind_power;
                        // console.log(text);
                        var textArray = new Array();
                        textArray[0] = index.clothes.detail;
                        textArray[1] = index.cold.detail;
                        textArray[2] = index.heatstroke.detail;
                        textArray[3] = index.drying.detail;
                        textArray[4] = index.comfort.detail;
                        textArray[5] = index.sunglasses.detail;
                        textArray[6] = index.tourism.detail;
                        textArray[7] = index.ultraviolet.detail;
                        textArray[8] = index.umbrella.detail;
                        textArray[9] = index.mood.detail;
                        textArray[10] = index.sunscreen.detail;
                        var num =0;
                        $('#text-care').html( `  <i class="layui-icon layui-icon-speaker"  id="speaker">:</i>` +textArray[num]);
                      
                        
                       var time = setInterval(function(){
                        if(num>=textArray.length){
                            num=0;
                        }else{
                            num++;
                        }
                        $('#text-care').html( `  <i class="layui-icon layui-icon-speaker"  id="speaker">:</i>`+  textArray[num]);
                        
                      
                       },10000);
                       
    
    
                        // 天气
                        $('#txt-name').text(observe.weather);
                        $('#txt-temperature').text(observe.degree+'℃');
                        // console.log(air["pm2.5"]);
                        $('.num_weather').text(air.aqi+' '+air.aqi_name)
                        // console.log(air.aqi_level);
                        //判断空气质量
                        if(air.aqi_level == 1){
                            $('#hd_aqi').attr('class','color1');
                        }else if(air.aqi_level == 2){
                            $('#hd_aqi').attr('class','color2');
                        }else{
                            $('#hd_aqi').attr('class','color3');
                        }
                        // 变量名中有小数点的解决办法
                        $('.pm25').find('.val').text(air["pm2.5"]);
                        $('.pm10').find('.val').text(air["pm10"]);
                        $('.so2').find('.val').text(air["so2"]);
                        $('.no2').find('.val').text(air["no2"]);
                        $('.no').find('.val').text(air["no"]);
                        $('.o3').find('.val').text(air["o3"]);
                        $('.co').find('.val').text(air["co"]);
                    //   风力
                    $('#wind').text(forecast_1h[0].wind_direction+' '+forecast_1h[0].wind_power+'级');
                    $('#water').text('湿度'+' '+observe.humidity+'%')
                    $('#txt-kPa').text('气压'+' '+observe.pressure+'hPa')
                    $('#care').text(res.data.tips.observe[1])
                    
                     //切换tips
    $('#switch').click(function(){
       if($('#care').text()==res.data.tips.observe[1]){
        $('#care').text(res.data.tips.observe[0])
       }else{
        $('#care').text(res.data.tips.observe[1])
       }
    })
       
    if(date-date_hours>6&&date_hours<18){
        flag=true;
    }else{
        flag=false;
    }
   


    // console.log(flag)
       //判断晴天白昼换图 00晴天夜晚 01晴天白天 02阴天黑夜  04多云白天 05下雨
           
       function setWeatherImg(){
               console.log(observe.weather)
        if(observe.weather=='晴' && !flag){
            $('#weather-img').children('img').attr('src','img/00.png')
            $('.header').css("background-image","url(img/sun.jpg)");
            
      }else{
         $('#weather-img').children('img').attr('src','img/01.png')
         $('.header').css("background-image","url(img/sun.jpg)");

      }
      if(observe.weather=='阴' ){
         $('#weather-img').children('img').attr('src','img/02.png')
         $('.header').css("background-image","url(img/yin.jpg)");
   }
      if(observe.weather=='多云' ){
         $('#weather-img').children('img').attr('src','img/04.png')
         $('.header').css("background-image","url(img/yin1.jpg)");
   }
      if(observe.weather=='阵雨' ){
         $('#weather-img').children('img').attr('src','img/06.png')
         $('.header').css("background-image","url(img/rain.jpg)");
   }
     
console.log(123)}
       setWeatherImg();
    
                    }
                   
				}
               
            });
            
        }
    var jieQi
        ,jieQiArray = new Array("立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至","小寒","大寒")
        ,jieQiEnglishArray = new Array("Spring begins","The rains","Insects awaken","Vernal Equinox","Clear and bright","Grain rain","Summer begins","Grain buds","Grain in ear","Summer solstice","Slight heat","Great heat","Autumn begins","Stopping the heat","White dews","Autumn Equinox","Cold dews","Hoar-frost falls","Winter begins","Light snow","Heavy snow","Winter Solstice","Slight cold","Great cold");
    var date=new Date();
    var date_year =date.getFullYear(); 
    var date_month =date.getMonth()+1; 
    var date_day =date.getDate(); 
    console.log(date_year,date_month,date_day);
    getjq(date_year,date_month,date_day);

function getjq(yyyy,mm,dd){
mm = mm-1;
var sTermInfo = new Array(0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758);
var solarTerm = new Array("小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至");
var solarTerms = '';
//　　此方法是获取该日期是否为某节气
   var tmp1 = new Date((31556925974.7*(yyyy-1900)+sTermInfo[mm*2+1]*60000)+Date.UTC(1900,0,6,2,5));
   var tmp2 = tmp1.getUTCDate();
   if (tmp2==dd)
       solarTerms = solarTerm[mm*2+1];

   tmp1 = new Date((31556925974.7*(yyyy-1900)+sTermInfo[mm*2]*60000)+Date.UTC(1900,0,6,2,5));
   tmp2= tmp1.getUTCDate();
   if (tmp2==dd)
       solarTerms = solarTerm[mm*2];
//　　此方法可以获取该日期处于某节气
while (solarTerms==""){ 
var tmp1 = new Date((31556925974.7*(yyyy-1900)+sTermInfo[mm*2+1]*60000)+Date.UTC(1900,0,6,2,5)); 
var tmp2 = tmp1.getUTCDate(); 
if (tmp2==dd) solarTerms = solarTerm[mm*2+1];
tmp1 = new Date((31556925974.7*(yyyy-1900)+sTermInfo[mm*2]*60000)+Date.UTC(1900,0,6,2,5)); 
tmp2= tmp1.getUTCDate(); if (tmp2==dd) solarTerms = solarTerm[mm*2]; 
if(dd>1){
 dd=dd-1; 
}else {
 mm=mm-1; 
　　if(mm<0){ 
　　　　yyyy=yyyy-1; mm=11; 
　　} 
　　dd=31; 
　　} 
} 

// console.log(solarTerm) 

$.get("http://api.tianapi.com/txapi/jieqi/index?key=38b994442cae091609083286836e7f3c&word="+ solarTerms,
function(data,status){
    console.log(data);
    var jieQiName = data.newslist[0].name;
    var jieQiImg = data.newslist[0].nameimg;
    var jieQiTime = data.newslist[0].day;
    var jieQiYuanYin = data.newslist[0].yuanyin;
    var jieQiShiJu = data.newslist[0].shiju;
    var jieQiJieShao = data.newslist[0].jieshao;
    var jieQiFood = data.newslist[0].meishi;
    var jieQiYiJI = data.newslist[0].yiji;
    var jieQiXiShu = data.newslist[0].xishu;
    $('#jieQiImg').attr('src','img/jieqi/'+jieQiImg);
    $('.jieQiName').text(jieQiName);
    $('.jieQiTime').text(jieQiTime);
    $('.jieQiYuanYin').text(jieQiYuanYin);
    $('.jieQiShiJu').text(jieQiShiJu);
    $('.jieQiJieShao').text(jieQiJieShao);
    $('.jieQiFood').text(jieQiFood);
    $('.jieQiYiJi').text(jieQiYiJI);
    $('.jieQiXiShu').text(jieQiXiShu);
});
return solarTerms;

}



//logo替换
var date_hours=date.getHours();
var date_minutes =date.getMinutes()
// console.log(date_hours,date_minutes);
var flag=true;

if(date_minutes<=9){
    $('.pub_time').text(date_hours +':'+'0'+ date_minutes)
}else{
    $('.pub_time').text(date_hours +':'+ date_minutes)
}
if(date_hours>8 &&date_hours<20){
    $('.logo_day').stop().fadeIn(100);
    $('.logo_night').stop().fadeOut(100);
    console.log('now is day')
}else{
    $('.logo_day').stop().fadeOut(100);
    $('.logo_night').stop().fadeIn(100);
    console.log('now is night')
}

//页面是否加载完成

$(document).ready(function(){
    // alert("加载完成");
    // console.log(1) 
    
   var time_ =  setInterval(function(){
    $('#app').stop().fadeOut(500);
    clearInterval(time_)
    var timer_  =setInterval(() => {
        document.getElementById('loading').setAttribute('disabled','')
        $('body').css("overflow",'auto');
  clearInterval(timer_)
    }, 1000);
    },1500)
   
    });
    
   //获取日期时间
   setInterval(function() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var weekArray = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var week = weekArray[date.getDay()];
    var hour = date.getHours();
    var minute = date.getMinutes();
    if(minute<10 ){
        minute ='0'+minute;
    }
    
    var second = date.getSeconds();
    if(second<10 ){
        second ='0'+second;
    }
    
    var nyr = year +'-'+ month +'-' + day + ' ' + week + ' ' + hour + ':' + minute + ':' + second;
    // console.log(nyr)
    $('.time-day').text(nyr);
    $('.now-jieQi').text( '显示是 : '+nyr )
    }, 1000);
 

    // 设置右边弹出层
    for(var i = 0;i <24;i++){
      $('.jieQiUl').append(`<li class="jieQiUlLi"> <i class="jieQiUlI  layui-icon layui-icon-face-smile-fine"></i> <a class="jieQiUlA " href="#${i}">${jieQiArray[i]} <span >${jieQiEnglishArray[i]}</span></a></li>`);
    }
  $('.jieQiUlA').each(function(){
    $(this).mouseover(function(){
      $(this).children().addClass('blue-color');
      $(this).addClass('blue-color');
      $(this).prev().addClass('blue-color');
      $(this).prev().addClass('layui-icon-face-surprised');
      $(this).prev().removeClass('layui-icon-face-smile-fine');
    });
    $(this).mouseleave(function(){
      $(this).children().removeClass('blue-color')
      $(this).removeClass('blue-color')
      $(this).prev().removeClass('blue-color')
      $(this).prev().removeClass('layui-icon-face-surprised');
      $(this).prev().addClass('layui-icon-face-smile-fine');
    });
    $(this).click(function(){
        $('.jieQiUlA').each(function(){
            $(this).children().removeClass('lightblue-color')
            $(this).removeClass('lightblue-color')
            $(this).prev().removeClass('lightblue-color')
            $(this).prev().removeClass('layui-icon-face-smile-b');
            $(this).prev().addClass('layui-icon-face-smile-fine');
        })
        $(this).children().addClass('lightblue-color')
        $(this).addClass('lightblue-color')
        console.log($(this).siblings().html());
        // $(this).siblings().removeClass('lightblue-color')
        $(this).prev().addClass('lightblue-color')
        // $(this).prev().siblings().removeClass('lightblue-color')
        $(this).prev().removeClass('layui-icon-face-smile-fine');
        // $(this).prev().siblings().removeClass('layui-icon-face-smile-fine');
        $(this).prev().addClass('layui-icon-face-smile-b');
        // $(this).prev().siblings().addClass('layui-icon-face-smile-b');
   
    });
  })
    //更多节气时间
 var jieQiElement
,moreJieQiTime
,moreJieQiName
,moreJieQiXiShu
,moreJieQiShiJu
,moreJieQiJiYi
,moreJieQiYuanYin
,moreJieQiJieShao
,moreJieQiSrc
,moreJieQiFood
,moreFlag = true
,moreBtn = true
,index_ = 0;

 $('.more').click(function(){
    $(".moreLi").mouseover(function() {

        layer.tips($(this).text(), this, {

          tips: [3, "#4794ec"]

        });

    });
     if( moreFlag){
          for(var n = 0; n < 24;n++){
       getJieQiData(jieQiArray[n]);           
 }
 $('.moreJieQiUl').append(`<li class="layui-timeline-item" id="now-jieQi">
 <i class="layui-icon layui-timeline-axis">&#xe63f;</i>
 <div class="layui-timeline-content layui-text">
   <div class="layui-timeline-title now-jieQi"></div>
 </div>
</li>`);
     }
     if(moreBtn){
         var more_loading = `<i class="layui-icon loading-more layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>`;
         $('.more').before(more_loading);
         var time = setInterval(function(){
             $('.loading-more').stop().fadeOut(100);
             $('.moreJieQi').stop().slideDown(500);
             $('.more').html('收起' +  `<i class="layui-icon layui-icon-up" style="font-size: 12px;margin-left: 5px;"></i>`);
             $('.moreJieQi').before(`<hr class="layui-bg-gray line">`)
             
        layer_ul();
        $('#JieQi').parent().stop().fadeIn(1000);
             clearInterval(time);
        $('#jieQiListMore').css('display','inline-block');
         $('#shadowRight').css('display','inline-block');
         },1000);

        
       
        moreBtn = false;
     
   }else{
      $('.moreJieQi').stop().slideUp(100);
      $('.more').html('更多节气时间' +  `<i class="layui-icon layui-icon-down" style="font-size: 12px;margin-left: 5px;"></i>`);
      moreBtn = true;
      $('#JieQi').parent().stop().fadeOut(200);
      $('.line').remove();
      $('#jieQiListMore').css('display','none');
      $('#shadowRight').css('display','none');
      $('#shadowLeft').css('display','none');
   }

     moreFlag = false;
 })



//24节气接口
function  getJieQiData(solarTerms){
    // get请求默认是异步，改为同步，为防止布局错误
    $.ajaxSettings.async = false; 
 $.get("http://api.tianapi.com/txapi/jieqi/index?key=38b994442cae091609083286836e7f3c&word="+ solarTerms,
function(data,status){
//  console.log(data);
moreJieQiName= data.newslist[0].name;
 moreJieQiSrc = data.newslist[0].nameimg;
 moreJieQiTime = data.newslist[0].day;
 moreJieQiYuanYin = data.newslist[0].yuanyin;
 moreJieQiShiJu = data.newslist[0].shiju;
 moreJieQiJieShao = data.newslist[0].jieshao;
 moreJieQiFood = data.newslist[0].meishi;
 moreJieQiJiYi = data.newslist[0].yiji;
 moreJieQiXiShu = data.newslist[0].xishu;
   jieQiMore = ` <li><a href="https://www.baidu.com/s?wd=${moreJieQiName+'是什么意思'}" target="_blank"><img src="img/jieqi/${moreJieQiSrc}" alt="">
   <p> ${moreJieQiName}:${moreJieQiTime} </p></a> </li>`;
  jieQiElement =`<li class="layui-timeline-item " id="${index_}">
<i class="layui-icon layui-timeline-axis">&#xe63f;</i>
<div class="layui-timeline-content layui-text">
<h3 class="layui-timeline-title">${moreJieQiTime}</h3>
<img  class="moreImg" src="img/jieqi/${moreJieQiSrc}" alt="">
<p>${moreJieQiName}<em>"${moreJieQiYuanYin}"</em></p>
<ul>
 <li>${moreJieQiShiJu}</li>
 <li>${moreJieQiJieShao}</li>
 <li>${moreJieQiXiShu}</li>
 <li>${moreJieQiFood}</li>
 <li>${moreJieQiJiYi}</li>
</ul>
</div>
</li>`; 
$('.moreJieQiUl').append(jieQiElement);
$('.moveUl').append(jieQiMore);
 index_++;

});
}


    //返回顶部
   var top = `<div class="top"><i class="layui-icon layui-icon-top"></i></div>`; 
   $('body').append(top);
   $(window).scroll(function(){//开始监听滚动条
    var top_height = $(document).scrollTop();
    if(top_height >= 100){
        $('.top').stop().fadeIn(200);
        　$('.top').click(function(){
            　　　　$('html').stop().animate({
            　　　　　　scrollTop:0,
            　　　　},500)
            console.log(top_height)
            　　})
    }else{
        $('.top').stop().fadeOut(200);
    }
    })
  
    // 滚动更多节气图片
    $('.moreRight').click(function(){  
        $('.moveUl').css('marginLeft', '-1716px');
        $('.moreLeft').css('display','inline-block');
        $(this).css('display','none');
        $('#shadowLeft').css('display','inline-block');
        $('#shadowRight').css('display','none');
    })
    $('.moreLeft').click(function(){  
        $('.moveUl').css('marginLeft', '0px');
        $('.moreRight').css('display','inline-block');
        $(this).css('display','none');
        $('#shadowRight').css('display','inline-block');
        $('#shadowLeft').css('display','none');
    });
   

    
   
})
