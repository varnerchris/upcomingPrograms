// Converts XML to JSON
// from: https://coursesweb.net/javascript/convert-xml-json-javascript_s2

function XMLtoJSON() {
  var me = this;      // stores the object instantce
  //console.log("XmlToJson Loaded")
  // gets the content of an xml file and returns it in
  me.fromFile = function(xml, rstr) {
    // Cretes a instantce of XMLHttpRequest object
    var xhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    // sets and sends the request for calling "xml"
    xhttp.open("GET", xml ,false);
    xhttp.send(null);

    // gets the JSON string
    var json_str = jsontoStr(setJsonObj(xhttp.responseXML));

    // sets and returns the JSON object, if "rstr" undefined (not passed), else, returns JSON string
    return (typeof(rstr) == 'undefined') ? JSON.parse(json_str) : json_str;
  }

  // returns XML DOM from string with xml content
  me.fromStr = function(xml, rstr) {
    // for non IE browsers
    if(window.DOMParser) {
      var getxml = new DOMParser();
      var xmlDoc = getxml.parseFromString(xml,"text/xml");
    }
    else {
      // for Internet Explorer
      var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = "false";
    }

    // gets the JSON string
    var json_str = jsontoStr(setJsonObj(xmlDoc));

    // sets and returns the JSON object, if "rstr" undefined (not passed), else, returns JSON string
    return (typeof(rstr) == 'undefined') ? JSON.parse(json_str) : json_str;
  }

  // receives XML DOM object, returns converted JSON object
  var setJsonObj = function(xml) {
    var js_obj = {};
    if (xml.nodeType == 1) {
      if (xml.attributes.length > 0) {
        js_obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          js_obj["@attributes"][attribute.nodeName] = attribute.value;
        }
      }
    } else if (xml.nodeType == 3) {
      js_obj = xml.nodeValue;
    }
    if (xml.hasChildNodes()) {
      for (var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = item.nodeName;
        if (typeof(js_obj[nodeName]) == "undefined") {
          js_obj[nodeName] = setJsonObj(item);
        } else {
          if (typeof(js_obj[nodeName].push) == "undefined") {
            var old = js_obj[nodeName];
            js_obj[nodeName] = [];
            js_obj[nodeName].push(old);
          }
          js_obj[nodeName].push(setJsonObj(item));
        }
      }
    }
    return js_obj;
  }

  // converts JSON object to string (human readablle).
  // Removes '\t\r\n', rows with multiples '""', multiple empty rows, '  "",', and "  ",; replace empty [] with ""
  var jsontoStr = function(js_obj) {
    var rejsn = JSON.stringify(js_obj, undefined, 2).replace(/(\\t|\\r|\\n)/g, '').replace(/"",[\n\t\r\s]+""[,]*/g, '').replace(/(\n[\t\s\r]*\n)/g, '').replace(/[\s\t]{2,}""[,]{0,1}/g, '').replace(/"[\s\t]{1,}"[,]{0,1}/g, '').replace(/\[[\t\s]*\]/g, '""');
    return (rejsn.indexOf('"parsererror": {') == -1) ? rejsn : 'Invalid XML format';
  }
};

// creates object instantce of XMLtoJSON
var xml2json = new XMLtoJSON();
var objson = xml2json.fromFile('https://cors-anywhere.herokuapp.com/http://www.varnerchris.com/wp-content/uploads/ftp/test.xml');


//filter out our passed start dates

function sortStartDates(jsonObject){
  var programResults = [];
  let todayMoment = moment().format("YYYY-MM-DD");
  //console.log(jsonObject.ttReport.ttReportRow[3].arsection_begindate['#text'])
  for(let i=0; i<jsonObject.ttReport.ttReportRow.length; i++){
    let beginDate = new moment(jsonObject.ttReport.ttReportRow[i].arsection_begindate['#text']).format("YYYY-MM-DD")
    if(beginDate>todayMoment){
      programResults.push(jsonObject.ttReport.ttReportRow[i]);
    }
}
return programResults;
}
var allActivities = sortStartDates(objson);
console.log(allActivities);

//Create a list of Active Activity Numbers
function uniqueActivityFinder(list){
  var programActivityArr = [];
  for(var i=0; i<list.length; i++){
    var text =  list[i].hasOwnProperty('arsection_activitycode') ?  list[i].arsection_activitycode['#text'] : null
    if (text && programActivityArr.indexOf(text) === -1) {
        programActivityArr.push(text)
    }
  }
  return programActivityArr
}
var uniqueActivityCodesList = uniqueActivityFinder(allActivities);
console.log(uniqueActivityCodesList);

//Use the list of Active Activity Numbers to Return just one Class
function returnJustOneActivity(fullList,uniques){
var uniqueActivityArr = [];
for(var i=0; i<uniques.length; i++){
  var uniqueActivity = fullList.find(activity => activity.arsection_activitycode['#text'] === uniques[i]);
  uniqueActivityArr.push(uniqueActivity)
  }
  return uniqueActivityArr
}

var uniqueActivities = returnJustOneActivity(allActivities,uniqueActivityCodesList)
//console.log(returnJustOneActivity(allActivities,uniqueActivityCodesList));


//Return all sections for each activity
function sortIntoSections(uniqueActivityList, fullList){
  for(var i=0; i<uniqueActivityList.length; i++){
    const result = fullList.filter(activity => activity.arsection_activitycode['#text'] == uniqueActivityList[i]);
        console.log(result)
  }
};

var sections = sortIntoSections(uniqueActivityCodesList, allActivities);





/*
 <script type="text/javascript">
 window.__ACTIVITY_FILTER = "IHOCK"
 </script>
*/

var filteredActivities = uniqueActivities.filter(activity => {
  return activity.arsection_category['#text'] === window.__ACTIVITY_FILTER
});

(function($) {
  $(document).ready(function(){
  var $container = $('div#upcoming-activities');
    $container.append(filteredActivities.map(activity => {
    var $item = $('<div  />');
    var $itemHeader = $('<h2 />');
    //var $itemDate = $('<h3 >')
    var $itemDescription = $('<p />');

    $itemDescription.text(activity.arsection_brochuretext['#text']);
    $itemHeader.text(activity.aractivity_shortdescription['#text'] );
    //$itemDate.text(activity.arsection_daterange['#text']);
    $item.append($itemHeader, $itemDescription)
    return $item;
  }));
});
})(jQuery)
