/**
 * @date  	2014-03-22
 * @author 	GPA創新低 sing09200920@gmail.com 
 *
 * @desc 	擷取股票列表及窩輪牛熊證列表
 *			手動加入兩個指數
 * 			示範資源取自 money18.on.cc
*/
"use strict";

var Source_stockList = function() {

	var _self 				= this,
		_stockList 			= [],
		loadedTime 			= 0,
		URLNeededToRequest 	= [ "http://money18.on.cc/js/daily/stocklist/stockList_secCode.js", 	/* 股票 */
								"http://money18.on.cc/js/daily/stocklist/warrantList_secCode.js" ]; /* 窩輪牛熊證 */

	this.init = function(sucessCallback, failCallBack) {
		for(var url in URLNeededToRequest)
			_doRequest(URLNeededToRequest[url], function() { 
				if(++loadedTime == URLNeededToRequest.length) {
					_stockList.push('HSI 恆指 恆生指數');				/* 手動加入 HSI */
					_stockList.push('HSCEI 國企 恆生中國企業指數');		/* 手動加入 HSCEI */
					sucessCallback(_stockList); 						/* All Sources have been loaded */
				}
			}, function() { failCallBack(); }); 						/* Failed */
	}

	var _doRequest = function(url, sucessCallback, failCallBack) {
		$.ajax({
			url 		: url,
			type 		: "GET",
			dataType 	: "text",
			cache 		: false,
			beforeSend: function(xhr) { xhr.overrideMimeType("text/plain; charset=BIG5"); }
		}).done(function(data) { /* Success */
			/**
			 *	1. Data Example									: M18.list.add("00001","&#x9577;&#x6c5f;&#x5be6;&#x696d;","CHEUNG KONG");
			 *	2. Change &#x????; to Chinese					: M18.list.add("00001","長江實業","CHEUNG KONG");
			 *	3. Filter Stock data							: 00001 長江實業 CHEUNG KONG 
			 *	4. Pass it to app in array						: split("\n") = Array. Add to _stockList
			 *	5. Success Callback 							: sucessCallback()
			*/
			data = data.replace(/&#(x)?([^&]{1,5});?/g, function (a, b, c) { return String.fromCharCode(parseInt(c, b ? 16 : 10)); });
			data = data.replace(/M18.list.add\("(.+)","(.+)","(.+)"\);/gi, "$1 $2 $3");
			_stockList = _stockList.concat(data.split("\n"));
			sucessCallback();
		}).fail(function() { 
			/* Plan B: Use YQL if something wrong such as 412 or 403 */
			var YQL =  "https://query.yahooapis.com/v1/public/yql?q=";
				YQL += encodeURIComponent('select * from html where url="' + url + '" AND charset="Big5"');
				YQL += "&format=json&callback=?";
			$.ajax({
				url 		: YQL,
				type 		: "GET",
				dataType 	: "jsonp", /* YQL need jsonp */
				cache 		: false,
				beforeSend: function(xhr) { xhr.overrideMimeType("text/plain; charset=UTF8"); }
			}).done(function(data) {
				if(data.query.count) {
					data = data.query.results.body.p.replace(/; /gi, "\n");
					data = data.replace(/M18.list.add\("(.+)","(.+)","(.+)"\)/gi, "$1 $2 $3");
					_stockList = concat(data.split("\n"));
					sucessCallback();
				} else 
					failCallBack(); /* Fail Callback */
			}).fail(function() {
				/* YQL will not fail. If you really ajax fail with YQL, probably is you network problem */
			});
		});
	}
};
