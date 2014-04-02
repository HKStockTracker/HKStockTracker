"use strict";

var Source_marketStatus = function() {

	var _self 				= this,
		_marketStatus		= null,
		URLNeededToRequest 	= "http://money18.on.cc//js/daily/market_status/MAIN_s.js"; /* 市場狀態 */

	this.getMarketStatus = function(openingCallback, closingCallBack, failCallBack) {
		_doRequest(URLNeededToRequest, function() { 
			if(_marketStatus == "開市中") 	openingCallback(_marketStatus);	/* Determine opening or closing */
			else 							closingCallBack(_marketStatus);
		}, function() { failCallBack(); }); /* Failed */
	}

	var _doRequest = function(url, sucessCallback, failCallBack) {
		$.ajax({
			url 		: url,
			type 		: "GET",
			dataType 	: "text",
			cache 		: false,
			beforeSend: function(xhr) { xhr.overrideMimeType("text/plain; charset=BIG5"); }
		}).done(function(data) { /* Success */
			/*
				1. Data Example									: M18.s_MAIN = 'DC';
				2. Filter market status							: DC
				3. Determine the status in chinese				: _statusInChi('DC') = 全日收市
				4. Success Callback 							: sucessCallback()
			*/
			data = data.substring(data.indexOf("'")+1, data.lastIndexOf("'"));
			_statusInChi(data);
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
					data = data.query.results.body.p;
					data = data.substring(data.indexOf("'")+1, data.lastIndexOf("'"));
					_statusInChi(data);
					sucessCallback();
				} else 
					failCallBack(); /* Fail Callback */
			}).fail(function() {
				/* YQL will not fail. If you really ajax fail with YQL, probably is you network problem */
			});
		});
	}

	var _statusInChi = function(status) {
		if(status == "CT" || status == "MA") 
			_marketStatus = "開市中";
		else
			if(status == "CL" || status == "OC")
				_marketStatus = "中午收市";
			else if(status == "DC")
				_marketStatus = "全日收市";
			else
				_marketStatus = "已收市";
	}
};


var sing = "test";
console.log(sing);
