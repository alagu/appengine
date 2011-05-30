      var Timestamp = { current : {}, custom : {}, create : {}};
    
    (function(){
     Timestamp.HUMANTIME = '%a, %d %b \'%y %I:%M:%S %p';
     Timestamp.TIMEZONE  = '%Z (%z)';
     Timestamp.timer     = 0;
     Timestamp.update = function() {
       Timestamp.current.dateObj     = new Date();
       Timestamp.current.timeStamp   =  Math.floor(Number(Timestamp.current.dateObj / 1000));
       Timestamp.current.timeString  = Timestamp.current.dateObj.strftime(Timestamp.HUMANTIME);
       Timestamp.current.timeZoneStr = Timestamp.current.dateObj.strftime(Timestamp.TIMEZONE);

       $('#current-timestamp').val(Timestamp.current.timeStamp);
       $('#current-timestamp-human').html(Timestamp.current.timeString);
       $('#current-timezone-human').html(Timestamp.current.timeZoneStr);
     }
     
    

     Timestamp.createFromTimestamp = function () {
        var year  = $('#create-yr').val();
        var month = $('#create-month').val();
        var dt    = $('#create-date').val();
        var hr    = $('#create-hr').val();
        var min   = $('#create-min').val();
        Timestamp.create.dateObj     = new Date(year, month - 1, dt, hr, min);
        Timestamp.create.timeStamp   = Math.floor(Number(Timestamp.create.dateObj / 1000));
        Timestamp.create.timeString  = Timestamp.create.dateObj.strftime(Timestamp.HUMANTIME);
        Timestamp.create.timeZoneStr = Timestamp.create.dateObj.strftime(Timestamp.TIMEZONE);
        
        $('#create-timestamp').val(Timestamp.create.timeStamp);
        $('#create-timestamp-human').html(Timestamp.create.timeString);
        $('#create-timezone-human').html(Timestamp.create.timeZoneStr);
     }

     Timestamp.calculate = function() {
         var yr    = $('#calc-yr').val();
         var month = $('#calc-month').val();
         var days  = $('#calc-days').val();
         var hrs   = $('#calc-hrs').val();
         var difference = yr*365*24*3600;
         difference += month*30*24*3600;
         difference += days*24*3600;
         difference += hrs*3600;
         if($('#operation').val() == 'sub')
            difference = difference * -1;

         var newts = Number($('#initial-timestamp').val())  + difference;
         var newdate = new Date(newts*1000);
         $('#calculated-timestamp').val(newts);
         $('#calculated-timestamp-human').html(newdate.strftime(Timestamp.HUMANTIME));
         $('#calculated-timezone-human').html(newdate.strftime(Timestamp.TIMEZONE));
     }


     Timestamp.customCalculate = function () {
        var ts = $('#custom-timestamp').val();
        Timestamp.custom.dateObj     = new Date(ts*1000);
        Timestamp.custom.timeStamp   = Math.floor(Number(Timestamp.custom.dateObj / 1000));
        Timestamp.custom.timeString  = Timestamp.custom.dateObj.strftime(Timestamp.HUMANTIME);
        Timestamp.custom.timeZoneStr = Timestamp.custom.dateObj.strftime(Timestamp.TIMEZONE);
        
        $('#custom-timestamp-human').html(Timestamp.custom.timeString);
        $('#custom-timezone-human').html(Timestamp.custom.timeZoneStr);
     }

     Timestamp.copy = function(evt) {
       var source = evt.data.src;
       if(source  == 'current')
       {
         var timeObj = Timestamp.current;
       } else if (source == 'create') {
         var timeObj = Timestamp.create;
       } else {
         var timeObj = Timestamp.custom;
       }

       $('#initial-timestamp').val(timeObj.timeStamp);
       $('#initial-timestamp-human').html(timeObj.timeString);
       $('#initial-timezone-human').html(timeObj.timeZoneStr);
     }

     Timestamp.filltime = function(node,limit,start) {
       if(!start) 
          start = 0;
        for(var i=start;i<limit;i++)
        {
          if(i < 10) 
          {
            var stringi = '0' + i;
          } 
          else
          {
            var stringi = i;
          }
          $('#' + node).append("<option value='"+ i +"'>"+ stringi +"</option>"); 
        }
     }
     
     Timestamp.togglePause = function() {
       if(Timestamp.timer) {
           clearInterval(Timestamp.timer);
           Timestamp.timer = 0;
           $('#toggleupdate').val('Play');
       } 
       else
       {
           Timestamp.timer = setInterval(Timestamp.update,1000);
           $('#toggleupdate').val('Pause');
       }
     };
     
     Timestamp.chooserSetTime = function() {
         var curDate = new Date();
         console.log(curDate.getFullYear());
         
         $('#create-yr').val(curDate.getFullYear());
         $('#create-month').val(curDate.getMonth() + 1);
         $('#create-date').val(curDate.getDate());
         $('#create-hr').val(curDate.getHours());
         $('#create-min').val(curDate.getMinutes());
     }

     $('#copybtn').bind('click', {src : 'current'}, Timestamp.copy);
     $('#current-timestamp').bind('focus',function(){this.select();});
     $('#initial-timestamp').bind('focus',function(){this.select();});
     $('#calculated-timestamp').bind('focus',function(){this.select();});
     $('#copy-create-btn').bind('click', {src : 'create'}, Timestamp.copy);
     $('#update-create-btn').bind('click',Timestamp.createFromTimestamp);
     $('#copy-custom-btn').bind('click', {src : 'custom'}, Timestamp.copy);
     $('#update-custom-btn').bind('click',Timestamp.customCalculate);
     $('#toggleupdate').bind('click',Timestamp.togglePause);
     $('#calculate').bind('click',Timestamp.calculate);
     Timestamp.filltime('create-yr',2999,1970);
     Timestamp.filltime('create-month',13,1);
     Timestamp.filltime('create-date',32,1);
     Timestamp.filltime('create-hr',24,0);
     Timestamp.filltime('create-min',60,0);

     Timestamp.filltime('calc-yr',99);
     Timestamp.filltime('calc-month',99);
     Timestamp.filltime('calc-days',99);
     Timestamp.filltime('calc-hrs',99);

     Timestamp.update();
     Timestamp.copy({ data : { src : 'current'}});
     Timestamp.chooserSetTime();
     
     Timestamp.timer = setInterval(Timestamp.update, 1000);

     })();
