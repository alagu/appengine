if(typeof TZDate == 'undefined') { TZDate  = {};}


TZDate.Date = function()
{
  var args = Array.prototype.slice.apply(arguments);
  var obj = new Date();


  return obj;
};


var d = new TZDate.Date();
