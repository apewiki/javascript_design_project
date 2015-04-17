function loadData() {

    var YELP_KEY = "bv-f4fN8pfiBGodIp824VA";
    var YELP_KEY_SECRET = "Lmq4G67yJ8avCfy6LqCaxFiEm1E";
    var YELP_TOKEN = "LYJpN3oRpnxpBpxcEOJycgEfdVgfG9gu";
    var YELP_TOKEN_SECRET = "SDcj6qnDh9wdajeZQUGbJ2CslWE";

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    var streetStr = $('#street').val();
    var cityStr = $('#city').val();
    var address = streetStr + ', ' + cityStr;

    $greeting.text('So, you want to live at ' + address + '?');

    // load streetview
    var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + address + '';
    $body.append('<img class="bgimg" src="' + streetviewUrl + '">');


    // load nytimes
    var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + cityStr + '&sort=newest&api-key=3abc9a3d23e60b38c21b4ab9b0a91c07:17:69911633'
    $.getJSON(nytimesUrl, function(data){

        $nytHeaderElem.text('New York Times Articles About ' + cityStr);

        articles = data.response.docs;
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            $nytElem.append('<li class="article">'+
                '<a href="'+article.web_url+'">'+article.headline.main+'</a>'+
                '<p>' + article.snippet + '</p>'+
            '</li>');
        };

    }).error(function(e){
        $nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
    });



    // load wikipedia data
    var wikiUrl = "http://api.yelp.com/v2/search?term=food&location=New+York&limit=1";
    var wikiRequestTimeout = setTimeout(function(){
        $wikiElem.text("failed to get yelp resources");
    }, 8000);

    var nounce = Math.floor(Math.random() * 1e12).toString();
    var parameters = {
        oauth_consumer: YELP_KEY,
        oauth_token: YELP_TOKEN,
        oauth_nounce: nounce,
        oauth_timestamp: Math.floor(Date.now()/1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb'
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters,
        YELP_KEY_SECRET, YELP_TOKEN_SECRET);
    parameters.oauth_signature = encodedSignature;


    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        data: parameters,
        cache: true,
        success: function( response ) {
            var bizname = response.businesses.name;
            var bizurl = response.businesses.url;
            $wikiElem.append('<li><a href="' + bizurl + '">' + bizname + '</a></li>');
        }
    });

    return false;
};

$('#form-container').submit(loadData);

// loadData();
