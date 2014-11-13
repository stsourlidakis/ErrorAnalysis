"use strict";

var ut = ut || {}
ut.commons = ut.commons || {}
ut.commons.utils = ut.commons.utils || {}

ut.commons.utils.printDebugInformation = function () {
   console.log("*** ut.commons.utils.printDebugInformation ***")

   if (typeof osapi == 'object') {
      console.log("osapi: " + osapi);
   } else {
      console.log("osapi is undefined.");
   }
   if (typeof gadgets == 'object') {
      console.log("gadgets: " + gadgets);
   } else {
      console.log("gadgets is undefined.");
   }

   if (typeof osapi == 'object') {
      var batch = osapi.newBatch();
      batch.add('context', osapi.context.get());
      batch.add('viewer', osapi.people.getOwner());
      batch.add('app', osapi.apps.get({contextId: "@self"}));
      batch.execute(function (response) {
         console.log("actor.id (viewer.id): " + response.viewer.id);
         var uncapitalizedContextType = response.context.contextType.slice(1);
         var contextType = uncapitalizedContextType.charAt(0).toUpperCase() + uncapitalizedContextType.slice(1);
         console.log("objectType (context.contextType): " + contextType);
         console.log("generator.id (app.id): " + response.app.id);

      });
   }

   console.log("*** /debugInformation ***")
}

/**
 * If "gadgets" object exists, call gadgets.window.adjustHeight.
 * @return {undefined}
 */
ut.commons.utils.gadgetResize = function resize() {
   if (typeof gadgets == 'object') {
      console.log("calling gadgets.window.adjustHeight().");
      gadgets.window.adjustHeight();
   }
}

/**
 * Generates and returns a random UUID.
 * @return {String}   Returns a string value containing a random UUID
 */
ut.commons.utils.generateUUID_deprecated = function () {
   return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
       s4() + '-' + s4() + s4() + s4();

   function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
   };
}

/**
 * Generates and returns a random UUID with a much smaller collision chance
 * due to integration of a timestamp. It's a tiny little bit slower, though.
 * @return {String}   Returns a string value containing a random UUID
 */
ut.commons.utils.generateUUID = function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function isStringEmpty(inputStr) {
   if (null == inputStr || "" == inputStr) {
      return true;
   } else {
      return false;
   }
}

/**
 * Converts a string with line breaks into a string with <br/>s.
 * Useful to get a multi-line text from a textarea and put it into a <p>.
 * @return {String}   Returns a string with line breaks replaced by <br> tags.
 */
function nl2br(str, is_xhtml) {
   var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br/>' : '<br>';
   return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

ut.commons.utils.getAttributeValue = function (attributes, attributeName, defaultValue) {
   var lcName = attributeName.toLowerCase()
   if (attributes[lcName])
      return attributes[lcName]
   else if (typeof defaultValue !== "undefined")
      return defaultValue
   else
      return null
}

ut.commons.utils.addAttributeValueToOptions = function (attributes, attributeName, options, defaultValue) {
   var lcName = attributeName.toLowerCase()
   if (attributes[lcName])
      options[attributeName] = attributes[lcName]
   else if (typeof defaultValue !== "undefined")
      options[attributeName] = defaultValue
}

ut.commons.utils.getBooleanAttributeValue = function (attributes, attributeName, defaultValue) {
   var value = ut.commons.utils.getAttributeValue(attributes, attributeName, defaultValue)
   if (value) {
      if (typeof value === "boolean")
         return value
      var lcValue = value.toLowerCase().trim()
      switch (lcValue){
         case "true":
         case "on":
            return true
         default:
            return false
      }
   } else
      return false
}

ut.commons.utils.getCommonsPath = function () {
   var endPart = "/commons/"
   if (typeof golab !== 'undefined' && golab.common && golab.common.resourceLoader)
      return golab.common.resourceLoader.getBaseUrl() + endPart
   var commonsPath = "http://go-lab.gw.utwente.nl/sources" + endPart
   var currentHref = window.location.href
   var trySubPath = function (subPath) {
      var index = currentHref.lastIndexOf(subPath)
      if (index >= 0)
         commonsPath = currentHref.substr(0, index) + endPart
      else
         null
   }
   var subPaths = ["/tools/", "/labs/", "/web/"]
   for (var index in subPaths) {
      var subPath = subPaths[index]
      if (trySubPath(subPath))
         break
   }
   return commonsPath
}

ut.commons.utils.commonsPath = ut.commons.utils.getCommonsPath();

ut.commons.utils.getCommonsImagesPath = function () {
   return ut.commons.utils.getCommonsPath() + "images/"
}

ut.commons.utils.commonsImagesPath = ut.commons.utils.getCommonsImagesPath();

ut.commons.utils.getCommonsImagesDataSourcesPath = function () {
   return ut.commons.utils.getCommonsPath() + "images/dataSources/"
}

ut.commons.utils.commonsImagesDataSourcesPath = ut.commons.utils.getCommonsImagesDataSourcesPath();

// automatically calls "gadgetResize" if the window size changes
// please call it only once...
/*
 // this function breaks in Graasp
 ut.commons.utils.gadgetAutoResize = function() {
 window.onresize = function(event) {
 window.clearTimeout(this.resizeTimeoutId);
 return this.resizeTimeoutId = setTimeout((function() {
 return ut.commons.utils.gadgetResize();
 }), 500);
 };
 ut.commons.utils.gadgetResize();
 }
 */

ut.commons.utils.equalizeHeight = function () {
   var elementClassNames = []
   var addElementClassNames = function (classNames) {
      if (Array.isArray(classNames)) {
         for (var i in classNames) {
            addElementClassNames(classNames[i])
         }
      } else {
         elementClassNames.push(classNames)
      }
   }
   addElementClassNames(Array.prototype.slice.call(arguments))
   var equalize = function () {
      var elements = []
      var i = 0
      for (i in elementClassNames){
         var element = $(elementClassNames[i])
         element.each(function (i) {
            elements.push($(element[i]))
         })
      }
      if (elements.length == 0)
         return
      var heights = []
      var maxHeight = 0
      var minHeight = Number.MAX_VALUE
      for (i in elements) {
         var height = elements[i].height()
         heights.push(height)
         maxHeight = Math.max(maxHeight, height)
         minHeight = Math.min(minHeight, height)
      }
      if (minHeight > 0) {
         for (i in elements) {
            if (maxHeight > heights[i])
               elements[i].height(maxHeight)
         }
      } else {
         setTimeout(equalize, 200)
      }
   }
   if (elementClassNames.length){
      equalize()
   }
}
