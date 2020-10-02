const mysql = require('mysql');
const req = require('request');
const db_config = require('../db_config');
const constants = require('../constants');
const crypto = require('crypto');

/** Configuring the connection with the database(MySQL) */
const con = mysql.createConnection({
    host: db_config.host,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database,
    queueLimit : 0, 
    connectionLimit : 0 
});

/* Connecting to the database */
con.connect( function(err) {
     if (err) {
    throw err;
}
console.log("Connected!");
});

/**
 * Description: Generates the unique custom url which wil be followed by the root url of size
 *              10 characters or throws the appropriate error
 * @param {*} onSuccess : Function which should be executed if the hash has been generated successfully
 * @param {*} onError : If there was an error, this function will be executed
 * @param {*} retryCount : Counts the num of times the function should check if a certain hash already exists in the database
 * @param {*} url : Original url entered by User
 * @param {*} req : Request
 * @param {*} res : Response
 * @param {*} con : Connection to database
 * @param {*} vanity : Custom URL name given by user which should be a string and represented as (e.g. "url" corresponds to localhost:port/url)
 */
function generateHash(onSuccess, onError, retryCount, url, req, res, con,vanity) {
    var hash = "";
    if(vanity){
        hash = vanity;
        var reg = /[^A-Za-z0-9-_]/;
        //If the hash contains invalid characters or is equal to other methods ("add" or "stats"), an error will be thrown
        if(reg.test(hash) || hash == "add" || hash == "stats"){
            onError(res, req, con, 403);
            console.log("custom url name contains invalid characters");
            return;
        }
        if(hash.length > 100){
            onError(res, req, con, 405);
            console.log("custom url name can't be longer than 100 characters");
            return;
        }
        else if(constants.min_vanity_length > 0 && hash.length < constants.min_vanity_length){
            onError(res, req, con, 407);
            console.log("custom url name should be longer than 5 characters");
            return;
        }
    }
      else{
        //Creates a string for a short URL on basis of an SHA1 hash
        var shasum = crypto.createHash('sha1');
        shasum.update((new Date).getTime()+"");
        hash = shasum.digest('hex').substring(0, 10);
        console.log("short url name of 10 characters is created");
      }
      //Query and looks if the short URL with the specific segment already exists
      //If the custom URL already exists it will not generate a new hash
      //Or will repeat the generateHash function until a segment is generated which does not exist in the database
      con.query(constants.get_all_urls_query.replace("{URL_SHORT}", con.escape(hash)), function(err, rows){
        if(err){
            throw err;
        }
        if (rows != undefined && rows.length == 0) {
            console.log("success: short/custom url got created");
            onSuccess(hash, url, req, res, con);
        }
         else {
            if (retryCount > 1 ) {
                console.log("retrying");
                generateHash(onSuccess, onError, retryCount - 1, url, req, res, con);
            } else {
                onError(res, req, con, 400);
                console.log("Can't add the given url, reason might be the given url already present in the database");
            }
        }
     });
    }


/**
 * Description: Executes when there's an error and res.send sends a message back to the client
 *  @param {*} code : Error Code
 *  @param {*} req : Request
 *  @param {*} res : Response
*/
function hashError(res, req, con, code){
    res.send(urlResult(null, false, code));
}
/**
 * Description: Executes when the short URL has been created successfully.
 * @param {*} hash : Custom URL generated which can be added to root URL
 * @param {*} url : Original URL
 * @param {*} req : request
 * @param {*} res : response
 * @param {*} con : connection to database
 */
function handleHash(hash, url, req, res, con){
    con.query(constants.add_url_query.replace("{URL}", con.escape(url)).replace("{URL_SHORT}", con.escape(hash)).replace("{URL_IP}", con.escape(getIP(req))), function(err, rows){
        if(err){
            throw err;
        }
    });
    res.send(urlResult(hash, true, 100));
    console.log("url is added to database");
}

/** 
* Description: Returns the object that will be sent to the client i.e. the new short url generated, result, statusCode
*@param {*} hash : custom url which will be added to root url address
*@param {*} result : boolean( if successfull = true else false)
*@param {*} statusCode : Gets the status code of the request
*                      100 = URL added successfully to database
*                      400 = Can't add the URL
*                      403 = Custom URL name contains invalid characters( should contain only alphabets(A-Z/a-z), digits(0-9))
*                      405 = Custom URL name too short (min characters =5)
*                      407 = Custom URL name too long (max characters = 100)
*/
function urlResult(hash, result, statusCode){
    return {
        url: hash != null ? constants.root_url+hash : null,
        result: result,
        statusCode: statusCode
    };
}

/** Description: Checks if the custom url exists in the database, if it exists then redirects to its original URL
*              and save the statistics that is click date, IP address of viewer to database
* @param {*} url_short : Custom URL
* @param {*} req : Request
* @param {*} res : Response
 */
var getUrl = function(url_short, req, res){
        // checking if the URL is present in the database
        con.query(constants.get_all_urls_query.replace("{URL_SHORT}", con.escape(url_short)), function(err, rows){
            if (err) 
              throw err;
            console.log("checkpoint 1 = ",rows);
            var url_result = rows;
            console.log("url_result = ",url_result);

            if( rows.length > 0){
                
                //Adding the new statistic point of the URL in the database i.e. View Date, IP address of viewer for the given URL
                con.query(constants.insert_view.replace("{URL_IP}", con.escape(getIP(req))).replace("{URL_ID}", con.escape(url_result[0].url_id)).replace("{URL_SHORT}", con.escape(url_result[0].url_short)), function(err, rows){
                    if(err){
                       throw err;
                    }
                    console.log("checkpoint 2  ");
                    // Updating the total no of views
                    con.query(constants.update_views_query.replace("{VIEWS}", con.escape(url_result[0].url_num_of_views+1)).replace("{URL_ID}", con.escape(url_result[0].url_id)), function(err, rows){
                        if(err){
                            throw err;
                        }
                        console.log("checkpoint 3 =",url_result," ", rows);
                    });
                });
                // Redirecting to original URL
                res.redirect(url_result[0].url_original);
             }
             else{
                 // URL doesn't exist in the database
                 console.log("Not found");
                 res.send(urlResult(null, false, 404));
             }
           
        }); 
};

/**
 * Description: Add the original URL to the database
 *              If the user doesn't gives his own custom name than the system generates the new custom url of 10 characters
 *              If the user gives his own custom name to url than add it to root url condition if in the database
 *              that custom url name doesn't already exist or else generates the new custom url name
 * @param {*} url : Original URL given by the user
 * @param {*} req : Request
 * @param {*} res : Response
 * @param {*} vanity : Custom URL name
 */
var addUrl = function(url, req, res,vanity){
        // If the URL is present
        if(url){
            console.log("checkpoint 1");
            // Converting URL to lowercase
            url = decodeURIComponent(url).toLowerCase();
            // Constraint: A single user can only generate max 1000 short URL
            // Query to check if the User if the user has exceeded his limit
            // It uses the IP address of the User generating it & stores it
            con.query(constants.check_ip_query.replace("{URL_IP}", con.escape(getIP(req))), function(err, rows){
                console.log("checkpoint 2");
                if(err){
                    console.log(err);
                } 
                // If the hasn't exceeded his limit
                else if(rows[0].url_count != undefined && rows[0].url_count < constants.num_of_urls_per_hour)
                {

                    console.log("checkpoint 3 = ",rows, rows[0].url_count);
                    // Checking if the URL is already present in the database or not
                    con.query(constants.check_url_query.replace("{URL}", con.escape(url)), function(err, rows){
                        console.log("checkpoint 4");
                        if(err){
                            throw err;
                        } 
                        else if(url.indexOf("http://localhost/urlShort/") > -1){
                            res.send(urlResult(null, false, 401));
                            console.log("url can't be reached: maybe the given url is wrong");
                            return;
                        }
                        // URL entered is too long can't be added to database
                        else if(url.length > 5000){
                            res.send(urlResult(null, false, 406));
                            console.log("url entered should be smaller than 5000 characters")
                            return;
                        }
                        else if(rows.length > 0){
                            // Gives the already present Custom URL address in the database i.e. url_short instead of adding the url again 
                            res.send(urlResult(rows[0].url_short, true, 100));
                            console.log("url added successfully");
                        }
                        else{
                                // Adding the new URL to database & generating the unique short URL
                                 if(res != undefined && res.statusCode == 200){
                                    console.log("checkpoint 6");
                                    generateHash(handleHash, hashError, 50, url, req, res, con,vanity);
                                }
                                else{
                                // Could not add the url
                                    res.send(urlResult(null, false, 401));
                                }
                 
                        }
                    });
                }
                // User has reached the limit
                else{
                    res.send(urlResult(null, false, 408));
                    console.log("Limit exceeded: maximum 1000 urls/hour");
                }
           });
       }
       // URL parameter is not present
        else{
            res.send(urlResult(null, false, 402));
            console.log("url parameter is not entered");
        }

};

/**
*Description: Gives the statistics of a specific short URL and sends it to the client
*@param {*} req : request
*@param {*} res : response
*@param {*} url_short : custom url given by the user(either full address/ only the short custom name after removing the root url address)
*/
var stats = function(url_short, req, res){
   
        var hash = url_short;
        if(!hash)
         hash = "";
        hash = hash.replace(constants.root_url, "");
        console.log("hash old=",hash);
        // Replaces the white space/ blank space at the begining
       hash= hash.replace(/\s+/g,"");

        // Query checks if the custom url is present in the database or not
        con.query(constants.get_all_urls_query.replace("{URL_SHORT}", con.escape(hash)), function(err, rows){
          //  console.log(rows);
            if(err)
            throw err;
            if(rows.length == 0){
                res.send({result: false, url: null});
            }
            else{
                // If custom url is present in database
                console.log(rows);
                
                // Get the statistics id, viewer IP, view date of the URL
                con.query(constants.get_viewers_query.replace("{URL_ID}",con.escape(rows[0].url_id)),function(err,views){
                    if(err)
                    throw err;
                    console.log("viewers = ",views);

                    // Generates the array containing (stat_id, viewer_ip,date of view) as single element in it
                    v = [];
                    for (i = 0; i < views.length; i++) {
                         v.push({stat_id:views[i].stat_id,viewer_ip:views[i].url_ip,view_date:views[i].click_date  });
                      }
                      console.log("v= ",v);
                res.send({result: true, url: rows[0].url, hash: hash, clicks: rows[0].url_num_of_views,viewers:v});
                });
            }
        });
    
};

/**
*Description: Returns the correct IP address. Node.js apps normally run behind a proxy,
*          so the remoteAddress will be equal to the proxy.
*           A proxy sends a header "X-Forwarded-For", so if this header is set, this IP address will be used.
*@param {*} req: Request
*/
function getIP(req){
    console.log("ip = ", req.connection.remoteAddress);
    return req.header("x-forwarded-for") || req.connection.remoteAddress;
}

exports.getUrl = getUrl;
exports.addUrl = addUrl;
exports.stats = stats;