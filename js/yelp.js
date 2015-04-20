function loadData() {

    const YELP_KEY = 'bv-f4fN8pfiBGodIp824VA';
    const YELP_KEY_SECRET = 'Lmq4G67yJ8avCfy6LqCaxFiEm1E';
    const YELP_TOKEN = '-rBzvZN5TaldkdYTsM_vv4SDm8lvOVZM';
    const YELP_TOKEN_SECRET = 'x9rkfFF6cKAnNJgz5oR5GsH_pew';

    var $body = $('body');
    var $yelpElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $yelpElem.text("");
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



    // load yelp data
    var yelp_url = "http://api.yelp.com/v2/search";
    var yelpRequestTimeout = setTimeout(function(){
        $yelpElem.text("failed to get yelp resources");
    }, 8000);

    var nonce = (Math.floor(Math.random() * 1e12).toString());
    var parameters = {
        oauth_consumer_key: YELP_KEY,
        oauth_token: YELP_TOKEN,
        oauth_nonce: nonce,
        oauth_timestamp: Math.floor(Date.now()/1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb',
        location: 'Manhattan, NY',
        term: 'food',
        category_filter: 'restaurants',
        limit: 10,
        sort: 2
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters,
        YELP_KEY_SECRET, YELP_TOKEN_SECRET);
    parameters.oauth_signature = encodedSignature;
    console.log("obtaining encodedSignature:"+encodedSignature);


    $.ajax({
        url: yelp_url,
        data: parameters,
        cache: true,
        dataType: "jsonp",
        jsonp: "callback",
        success: function( response ) {
            for (var i = 0; i<response.businesses.length; i++) {
                var bizname = response.businesses[i].name;
                var bizurl = response.businesses[i].url;
                console.log(bizname);
                $yelpElem.append('<li><a href="' + bizurl + '">' + bizname + '</a></li>');
            }
            
            clearTimeout(yelpRequestTimeout);
        }

    });

    return false;
};

$('#form-container').submit(loadData);

// loadData();
