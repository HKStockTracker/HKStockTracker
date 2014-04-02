"use strict";

var Source_stockInfo = function() {

	var _self 				= this,

		_status				= null,
		_stockName			= null,
		_lastUpdateTime		= null,
		_currentPrice		= null,
		_changeValue		= null,
		_changeRate			= null,
		_todayRange			= null,
		_fifteenTwo			= null,
		_dealVolume			= null,
		_dealPrice			= null,

		StockURLRequest 	= "http://www.aastocks.com/tc/ltp/RTQuoteContent.aspx?process=y&symbol=", 	/* 股票 */
		IndexURLRequest 	= [ "http://money18.on.cc//js/real/index/", 								/* 指數 */
								"http://money18.on.cc/js/daily/index/" ];

	this.getStockInfo = function(symbol, successCallback, failCallback) {
		if(isNaN(symbol)) {
			 /* Symbol is not number thus it is index (指數) */
			_doRequestIndex(symbol, IndexURLRequest, function() {
				successCallback(
					_status, 
					_stockName, 
					_lastUpdateTime, 
					_currentPrice, 
					_changeValue, 
					_changeRate, 
					_todayRange, 
					_fifteenTwo, 
					_dealVolume, 
					_dealPrice
				);
			}, function() { failCallback(); });
		} else { 
			/* It is number means normal stock (股票窩輪牛熊證) */
			_doRequestStock(StockURLRequest + symbol, function() {
				successCallback(
					_status, 
					_stockName, 
					_lastUpdateTime, 
					_currentPrice, 
					_changeValue, 
					_changeRate, 
					_todayRange, 
					_fifteenTwo, 
					_dealVolume, 
					_dealPrice
				);
			}, function() { failCallback(); });
		}
	}

	var _doRequestStock = function(url, successCallback, failCallback) {
		$.ajax({
			url 		: url,
			type 		: "GET",
			dataType 	: "html",
			cache 		: false,
			beforeSend: function(xhr) { xhr.overrideMimeType("text/plain; charset=UTF8"); }
		}).done(function(data) { /* Success */
			var $html 			= $(data.replace(/<img[^>]*>/g, "")).find('.bmp-s1'),
				$status 		= $html.find('.font28 span');

				_status			= ($status.hasClass('neg')) ? 1 : (($status.hasClass('pos')) ? 2 : 0);								/* 升(2), 跌(1), 平(0) */
				_stockName 		= $html.find('.f15').text().replace(/\s+(.+)\s(\d+).HK(.*)/g, "$1<span class='symbol'> $2</span>");	/* 股票名	: 長江實業 00001 */
				_lastUpdateTime = $html.find('.tb-h1 .floatR:eq(1)').text().replace(/\s+(.+)\s+/g, "$1"); 							/* 最後更新	: 2014-03-21 16:01 */
				_currentPrice 	= $status.text();																					/* 現價 	: 122.800 */
				_changeValue 	= $html.find('.font20 span:eq(0)').text(); 															/* 升跌		: 2.200 */
				_changeRate 	= $html.find('.font20 span:eq(1)').text(); 															/* 升跌(%) 	: 1.824% */
				_todayRange 	= $html.find('.c1 strong').text(); 																	/* 今日波幅 : 121.400 - 123.100 */
				_fifteenTwo 	= $html.find('.c3 strong:last').text().replace(/\s+(.+)\s+/g, "$1 "); 								/* 52週波幅 : 98.000 - 127.000 */
				_dealVolume 	= $html.find('.c3 strong:first').text().replace(/\s+(.+)\s+/g, "$1");								/* 成交量  	: 4.69百萬股 */
				_dealPrice 		= $html.find('.c3 strong:eq(2)').text().replace(/\s+(.+)\s+/g, "$1");								/* 成交金額 : 5.74億 */

			successCallback();

		}).fail(function() { failCallback(); });
	}

	var _doRequestIndex = function(symbol, IndexURLRequest, successCallback, failCallback) {
		var datetime = new Date().getTime().toString();
			datetime = datetime.substring(0, datetime.length - 3) + '9' + datetime.substring(datetime.length - 2, datetime.length);
		$.when(
			$.ajax({
				url 		: IndexURLRequest[0] + symbol + "_r.js?t=" + datetime,
				type 		: "POST",
				dataType 	: "text",
				cache 		: false,
				beforeSend: function(xhr) { xhr.overrideMimeType("text/plain; charset=BIG5"); }
			}), 
			$.ajax({
				url 		: IndexURLRequest[1] + symbol + "_d.js",
				type 		: "GET",
				dataType 	: "text",
				cache 		: false,
				beforeSend: function(xhr) { xhr.overrideMimeType("text/plain; charset=BIG5"); }
			})
		).then(function(quote, info) {
			quote 				= _money18ToJSON(quote[0]);
			info 				= _money18ToJSON(info[0]);

			var perPrice		= parseFloat(quote.pc);

				_currentPrice 	= parseFloat(quote.value);
				_status			= (_currentPrice < perPrice) ? 1 : ((_currentPrice > perPrice) ? 2 : 0);
				_stockName 		= info.big5_name;
				_lastUpdateTime = quote.ltt.replace(/\//g, "-");
				_changeValue 	= (_currentPrice - perPrice).toFixed(3);
				_changeRate		= ((_currentPrice - perPrice) / perPrice * 100).toFixed(2) + "%";
				_todayRange 	= quote.low + " - " + quote.high;
				_fifteenTwo 	= info.wk52Low + " - " + info.wk52High;
				_dealVolume 	= "N/A";
				_dealPrice 		= parseFloat(quote.turnover).toChiUnit(2);

			successCallback();

		}, function() { failCallback(); });
	}

	var _money18ToJSON = function(data) {
		data = data.substring(data.indexOf("{"), data.lastIndexOf(";"));
		data = JSON.parse(data.replace(/([_A-Za-z]\w*?):/gm, '"$1":').replace(/'(.*?)'/gm, '"$1"'));
		return data;
	}
};
