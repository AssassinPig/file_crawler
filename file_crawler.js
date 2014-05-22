var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');

(function(){
  var options = {
    hostname: 'www.justing.com.cn',
    port: 80,
    path: '/search_action.jsp',
    method: 'POST', 
    headers: {  
              "Content-Type": 'application/x-www-form-urlencoded',  
              "Content-Length": 72  
      }  
  };

  var bufList = new Array();
  var urlList = new Array();
  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    
    res.setEncoding('utf8');
    var searchContent;
    res.on('data', function (chunk) {
      searchContent += chunk;
    });

    res.on('end', function () {
      var $ = cheerio.load(searchContent);
      $('.result').each(function(i, e){
        $(e).find("h1 > a").each(function(j, ee){
          var href = $(ee).attr('href');

          href = href.replace('page', 'playonline');
          href = href.replace('html', 'mp3');
          var file_name = href.match(/\d+/)+'.mp3';
          urlList.push(href);
         
          getRedirect(file_name, href);
        });
      });
    });

  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write('searchWord=%E6%9C%89%E4%B8%80%E7%B1%BB%E6%88%98%E7%8A%AF&searchType=name');
  req.end();

})();

function getRedirect(file_name, href) {
  var options = {
  hostname: 'www.justing.com.cn',
  port: 80,
  path: href,
  method: 'GET'
  };

  var redirectUrl;
  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('LOCATION: ' + res.headers['location']);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    //res.setEncoding('utf8');
    redirectUrl = res.headers['location'];
    res.on('data', function (chunk) {
      bufList.push(chunk);
      console.log('ok data received');
      //console.log(chunk);
    });

    res.on('end', function () {
      getMp3(file_name, redirectUrl);
    });

  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });


  //req.write('searchWord=%E6%9C%89%E4%B8%80%E7%B1%BB%E6%88%98%E7%8A%AF&searchType=name');
  req.end();
}

function getMp3(file_name, href) {
  var bufList = new Array();
  var req = http.get(href, function(res){

  //});
  //var req = http.request(options, function(res) {

  console.log('STATUS: ' + res.statusCode);
  console.log('LOCATION: ' + res.headers['location']);
  //console.log('HEADERS: ' + JSON.stringify(res.headers));
  
  //res.setEncoding('utf8');
  var buf = new Buffer(res.headers['content-length']);
  var sum = 0;
  res.on('data', function (chunk) {
    bufList.push(chunk);
    console.log('ok data received');
  });

  res.on('end', function () {
    var buf = Buffer.concat(bufList, res.headers['content-length']);
    fs.appendFile(file_name, buf, function (err) {
      if (err) throw err;
      console.log('It\'s saved!');
    });
  });

});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
//req.write('data\n');
//req.write('data\n');
  //console.log('write body');
//req.write('searchWord=%E6%9C%89%E4%B8%80%E7%B1%BB%E6%88%98%E7%8A%AF&searchType=name');
  req.end();
}

