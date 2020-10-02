const logic = require('./urlShortUtility');
const express = require('express');
const router = express.Router();
var url = require('url');

console.log("urlshort");

/**
* Description: Generates the custom URL address(which is unique for every url) or displays the appropriate error
* @param {*} req : request
* @param {*} res : response
* @param {*} '/add' : Api to gives information of the custom URL generates and status code
*/ 
router.get('/add', (req, res) => {
      
     console.log(req.query.url);
 
     var url_original = req.query.url;
     var url_vanity = req.query.vanity; // custom url name given by the user
     console.log("vanity = ",url_vanity);
     logic.addUrl(url_original, req, res,url_vanity);
    
});

/** 
* Description: Shows the statistics of the Custom Url like no of total views, IP address of the person who used it,
*              Date on which it is viewed( datetime)
* @param {*} '/stats' : to get the statistics api
* @param {*} req : request
* @param {*} res : response
*/
router.get('/stats', async(req, res) => {
        var url_short = req.query.url;
        console.log(url_short);
        logic.stats(url_short, req, res);
});

/**
*Description: Redirecting Custom URL to its Original URL Address
* @param {*} req : request
* @param {*} res : response
* @param {*} url_short : Short URL which redirects to Original URL
*/
router.get('/:url_short', (req, res) =>{
      console.log(req.params.url_short);
      logic.getUrl(req.params.url_short, req, res);
});

module.exports = router;