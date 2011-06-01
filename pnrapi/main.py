from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext import db
from google.appengine.ext.webapp import template
import datetime
import httplib, urllib
import re
import os
import time


class APIHandler(webapp.RequestHandler):

  def getPNRStatus(self,pnrnumber):
    lccp_pnrno1 = pnrnumber[:3]
    lccp_pnrno2 = pnrnumber[3:]
    params = urllib.urlencode({'lccp_pnrno1': lccp_pnrno1, 'lccp_pnrno2': lccp_pnrno2, 'submitpnr': 'Get Status'})
    headers = {"Content-type": "application/x-www-form-urlencoded",
               "Host": "www.indianrail.gov.in",
               "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
               "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
               "Accept-Language": "en-us,en;q=0.5",
               "Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.7",
               "Keep-Alive": "115",
               "Connection": "keep-alive",
               "Referer": "http://www.indianrail.gov.in/pnr_stat.html",
               "Accept": "text/plain"}
    host = 'www.indianrail.gov.in'
    path = '/cgi_bin/inet_pnrstat_cgi.cgi'
    conn = httplib.HTTPConnection(host,80,timeout=1)
    return_object = {}
    return_object['status'] = 'OK'
    return_object['data']   = {}

    try :
      conn.request("POST", path, params, headers)
      response = conn.getresponse()
      data = response.read()
      conn.close()


      contents = data.split('\n')

      statuslines = []
      for line in contents:
        if line.find('border_both') != -1 and line.find('TD') != -1:
          statuslines.append(line)

      if len(statuslines) == 0:
        return_object['status'] = 'INVALID'
        return_object['data']   = 'No results'
      #check here


      expression = re.compile('>(.*)<')

      i = 0
      passenger_count = 0
      passenger_line  = -1
      for line in statuslines:
         matches = expression.findall(line) 
         if len(matches) > 0 :
            statement =  matches[0].replace('<B>','').replace('</B>','')
            statement = statement.strip()
            #print statement

            if(i == 0):
              return_object['data']['train_number'] = statement
              #print 'Train Number: ' + statement
            elif(i==1):
              return_object['data']['train_name'] = statement
              #print 'Train Name: ' + statement
            elif(i==2):
              date = statement.replace(' ','')
              timeobj = time.strptime(date, "%d-%m-%Y")
              return_object['data']['travel_date'] = {'timestamp':int(time.mktime(timeobj)),'date':date}
              #print 'Travel Date:' + statement
            elif(i==3):
              return_object['data']['from'] = statement
              #print 'From :' + statement
            elif(i==4):
              return_object['data']['to'] = statement
              #print 'To:' + statement
            elif(i==5):
              return_object['data']['alight'] = statement
              #print 'Reserved Up To:' + statement
            elif(i==6):
              return_object['data']['board'] = statement
              #print 'Boarding point:' + statement
            elif(i==7):
              return_object['data']['class'] = statement
              #print 'Class:' + statement
            elif(i>7):
              if statement.find('Passenger') != -1:
                passenger_count = passenger_count + 1
                passenger_line = 0
                if (passenger_count == 1):
                  return_object['data']['passenger'] = [] 
                return_object['data']['passenger'].append({'seat_number':'','status':''})
                continue
              else:
                if passenger_line == 0:
                  #print 'Passenger ' + str(passenger_count) + ' coach : ' + statement
                  return_object['data']['passenger'][passenger_count-1]['seat_number'] = statement 
                  passenger_line = passenger_line + 1
                elif passenger_line == 1:
                  return_object['data']['passenger'][passenger_count-1]['status'] = statement 
                  #print 'Passenger ' + str(passenger_count) + ' status : ' + statement
                  passenger_line = passenger_line + 1
              
            i=i+1
            return_object['data']['pnr_number'] = pnrnumber
    except:
      return_object['status'] = 'TIMEOUT'
      return_object['data']   = 'Request Timed Out'
      #check here too
      #print 'timed out'

    return return_object

  def get(self,pnrnumber):
      htmlcontent = str(self.getPNRStatus(pnrnumber))
      self.response.headers['Content-Type'] = 'application/json'
      jsonp = self.request.get("jsonp")
      if len(jsonp) > 0 :
        htmlcontent = jsonp + '(' + htmlcontent + ')'

      self.response.out.write(htmlcontent)


class DefaultHandler(webapp.RequestHandler):
  def get(self):
      path = os.path.join(os.path.dirname(__file__), 'man.html')
      self.response.out.write(template.render(path, {}))

def main():
  application = webapp.WSGIApplication([('/(\d{10})', APIHandler),
                                        ('/.*', DefaultHandler)
                                       ],
                                       debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
