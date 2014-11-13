var active;	//id of active window
var n;//# of error buttons/tables
var tableName = ["Error in a measurement", "Error in an average", "Standard Deviation", "sources of error"];
var logO = {
    "objectType": "test",
    "id": "hm_13",
    "content": "error analysis"
  }
var actionLogger;
var hypothesisToolMetadataHandler;
$( document ).ready(function() {
	n = document.getElementsByClassName("ErrorContainer").length;
	//var questions;
	for (var i=0;i<n;i++)
	{
		reset_table(i);
		/*questions = document.getElementsByClassName(i+"-questions");
		for (j=0;j<questions.length;j++)
			questions[j].style.display="none";	*/
	}
	$(".ErrorButtons").click(function(){	//Change displayed error table
		show_table($(this).attr("id").replace("errorButton",""));
	});
	$(".infoIcons").click(function(){	//Show/hide error info/formula
		toggle_info($(this).attr("id").replace("infoIcon",""));
	});
	$(".saveButtons").click(function(){	//Save output
		getString($(this).closest('.ErrorContainer').attr('id'));
	});
	$(".calculate").click(function(){	//Show/hide error info/formula
		var parent_id = $(this).closest('.ErrorContainer').attr('id');
		if(parent_id == 0)
			calculateMeasurementError();
		else if(parent_id == 1)
			calculateAverage();
		else if(parent_id == 2)
			calculateDeviation();
	});
	$(".reset").click(function(){	//Reset error table input fields
		reset_table($(this).closest('.ErrorContainer').attr('id'));
	});
	test();
	//Hide all error tables,show the first one and set it as the active table
	show_table(0);	//Must be placed after event handlers so table 0 can be logged as a member of "ErrorButtons" class before show_table() change its class to "ErrorButtonsActive" 
	$("html").keypress(function(e){
	  if(e.keyCode==9) {
			test();
		}
	});
});

function test(){
/* 	var documentType = "newDocumentType";
	var toolName = "golab.errorAnalysisTool";
	var initialMetadata = {
		"id": "",
		"published": "",
		"actor": {
		  "objectType": "person",
		  "id": "unknown",
		  "displayName": "unknown"
		},
		"target": {
		  "objectType": documentType,
		  "id": ut.commons.utils.generateUUID(),
		  "displayName": "unnamed " + documentType
		},
		"generator": {
		  "objectType": "application",
		  "url": window.location.href,
		  "id": ut.commons.utils.generateUUID(),
		  "displayName": toolName
		},
		"provider": {
		  "objectType": "ils",
		  "url": window.location.href,
		  "id": "unknown",
		  "inquiryPhase": "unknown",
		  "displayName": "unknown"
		}
	};

	new window.golab.ils.metadata.GoLabMetadataHandler(initialMetadata, function(metadataHandler) {
		actionLogger = new window.ut.commons.actionlogging.ActionLogger(metadataHandler);
		//actionLogger.setLoggingTarget("opensocial");
		// for development, using the following line might be helpful,
		// as it sets the ActionLogger to log to the console for easy debugging
		actionLogger.setLoggingTarget("console");
		actionLogger.log("hmhm", logO);
		//here, actionLogger is ready for usage
	}); */
	
	var documentType = "newDocumentType";
	var toolName = "golab.errorAnalysisTool";
	hypothesisToolMetadataHandler;
	new golab.ils.metadata.GoLabMetadataHandler({
		"actor": {
		  "objectType": "person",
		  "id": "unknown",
		  "displayName": "unknown"
		},
		"target": {
		  "objectType": documentType,
		  "id": ut.commons.utils.generateUUID(),
		  "displayName": "unnamed " + documentType
		},
		"generator": {
		  "objectType": "application",
		  "url": window.location.href,
		  "id": ut.commons.utils.generateUUID(),
		  "displayName": toolName
		},
		"provider": {
		  "objectType": "ils",
		  "url": window.location.href,
		  "id": "unknown",
		  "inquiryPhase": "unknown",
		  "displayName": "unknown"
		}}, function(error, metadataHandler) {
		  if (error == undefined) {
			hypothesisToolMetadataHandler = metadataHandler;
			actionLogger = new window.ut.commons.actionlogging.ActionLogger(metadataHandler);
			actionLogger.setLoggingTarget("opensocial");
		  } else {
			console.error ("Something went wrong when creating the MetadataHandler: "+error);
		  }
	  })
	
}

function show_table(id)
{
	if(active==id)return;	//don't try to show an already active error table
	for (var i=0;i<n;i++){	//hide all error tables and set their button on the inactive class
		if(id!=i)hide_table(i);	
	}
	hide_info();
	document.getElementById(id).style.display = "block";
	document.getElementById("errorButton"+id).className = "ErrorButtonsActive";
	active=id;
	
}
function hide_info()
{
	var elements = document.getElementsByClassName("error_info");
	for (var i=0;i<elements.length;i++)
	{
		elements[i].style.height="0px";
		elements[i].style.opacity="0";
	}
}
function hide_table(id)
{
	document.getElementById(id).style.display = "none";
	document.getElementById("errorButton"+id).className = "ErrorButtons";
	
	if(id==active)active=-1;
}
function toggle_info(id)
{
	if(id!=active)return;		//only toggle info on current table
	var element = document.getElementById('info-'+id);
	document.getElementById('info-'+id).style.height = element.style.height=="0px"?"auto":"0px";
	document.getElementById('info-'+id).style.opacity = element.style.opacity=="0"?"1":"0";
}
function popupExplanation(id)
{
	if(id==0) alert("Absolute error:\nThe absolute error is the magnitude of the difference between the theoretical and the experimental value.\n\nRelative error:\nThe relative error is the absolute error divided by the magnitude of the theoretical value. Ideally the relative error must be zero or very close to zero.\n\nPercentage error:\nThe percent error is the relative error expressed in terms of percentage.");
	if(id==1) alert("Error in an average:\nWhen repeating the same measurement a number of times, we produce a set of values and then the average value is calculated. Respectively, one must also calculate the average error.");
	if(id==2) alert("Standard Deviation:\nStandard deviation is a statistical measurement that is used to illustrate the dispersion of the experiment's values relative to an average value or standard value. The bigger standard deviation is, the more scattered the data are.");
}
function reset_table(id)
{
	if(id == 3)return;	//table 3 doesnt have any elements to reset.
	/*var table = document.getElementById(id);
	var elements = table.getElementsByTagName("input");
	for (var i=0;i<(id==2?1:2);i++)//table 2 has only 1 input area to get cleared
	{
		elements[i].value="";
	}*/
	$('#'+id+' input:text').val('');
	/*var elements = table.getElementsByClassName("screen");
	for (var i=0;i<elements.length;i++)
	{
		elements[i].innerHTML="";
	}*/
	$('#'+id+' .screen').html('');
	/*var questions = document.getElementsByClassName(id+"-questions");
	for (var i=0;i<questions.length;i++)
		{
			questions[i].style.display="none";
		}*/
	$('#'+id+' .'+id+'-questions').hide();
	$('#'+id+' input:checkbox').removeAttr('checked');
	//$('#'+id+' input:radio').attr("checked", true);
}
function calculateMeasurementError()
{
	var table = 0;	//table id
	if( !testInput(table) ){
		alert("Invalid input\nOnly numerical values are allowed.");
		return;
	}
	
	var theoretical = document.getElementById(table+'-0').value;
	var experimental = document.getElementById(table+'-1').value;
	
	//absolute error
	document.getElementById(table+'-screen'+'-0').innerHTML=Math.abs(theoretical-experimental).toFixed(3);
	//relative error
	document.getElementById(table+'-screen'+'-1').innerHTML=Math.abs((theoretical-experimental)/theoretical).toFixed(3);
	//percentage error
	document.getElementById(table+'-screen'+'-2').innerHTML=Math.abs( ( (theoretical-experimental)/theoretical )*100 ).toFixed(3)+'%';
	
	//display questions
	var questions = document.getElementsByClassName(table+"-questions");
	for (var i=0;i<questions.length;i++)
		questions[i].style.display="";
		
	logO.id = 'tbl_'+table;
	actionLogger.log("start", logO);
}
function calculateAverage(){
	var table = 1;	//table id
	if( !testInput(table) ){
		alert("Invalid input\nOnly numerical values are allowed.");
		return;
	}
	var standar = document.getElementById(table+'-0').value;
	var nV = document.getElementById(table+'-1').value;
	document.getElementById(table+'-screen').innerHTML=(standar/Math.sqrt(nV)).toFixed(3);
	var questions = document.getElementsByClassName(table+"-questions");
	for (var i=0;i<questions.length;i++)
		questions[i].style.display="";
		
	logO.id = 'tbl_'+table;
	actionLogger.log("start", logO);
}

function calculateDeviation()
{	
	var table = 2;	//table id
	if( !testInput(table) ){
		alert("Invalid input\nOnly numerical values are allowed.\nFor decimal numbers please use \".\"\nIn order to separate values use \",\"\nMore than one values should be defined.");
		return;
	}
	var values = document.getElementById(table+'-0').value.split(",");
	var avg=0;
	var avg1=0;
	for (i = 0; i < values.length; i++){
		values[i]=parseFloat(values[i]);
		avg+=values[i];
		}
	avg/=values.length;
	for (i = 0; i < values.length; i++){
		avg1+=Math.pow(values[i]-avg,2);
	}
	avg1/=(values.length-1);
	document.getElementById(table+'-screen'+'-0').innerHTML=avg.toFixed(3);
	document.getElementById(table+'-screen'+'-1').innerHTML=Math.sqrt(avg1).toFixed(3);
	
	var questions = document.getElementsByClassName(table+"-questions");
	for (var i=0;i<questions.length;i++)
		questions[i].style.display="";
}

function testInput(table){	//returns true for numerical values and false for everything else
	if(table!=2)		//table 2 has only 1 form to check
	{
		inputValue=document.getElementById(table+'-0').value;
		if(isNaN(inputValue) || inputValue=="" || ( ( inputValue.indexOf(' ')==0 && inputValue.length-1==0 ) || ( inputValue.indexOf(' ')==inputValue.length-1 && inputValue.length-1==0 ) ) )return false;	//Third argument checks for a space but allows one at the start or the end of the number
		inputValue=document.getElementById(table+'-1').value;
		if(isNaN(inputValue) || inputValue=="" || ( ( inputValue.indexOf(' ')==0 && inputValue.length-1==0 ) || ( inputValue.indexOf(' ')==inputValue.length-1 && inputValue.length-1==0 ) ) )return false;
	}
	else
	{
		var values = document.getElementById(table+'-0').value.split(",");
		for (i = 0; i < values.length; i++){
			if(isNaN(values[i]) || values[i]=="" || values[i]==" " || values.length<2)return false;
		}
	}
	return true;
}

function getString(table)
{
	if(table==0)
	{
		var table_obj = document.getElementById(table);
		var temp_string = table_obj.getElementsByClassName('Error_title')[0].textContent;
		temp_string += '\r\n' + table_obj.getElementsByClassName('p1')[0].textContent.replace('Insert the ','') + ': ' + document.getElementById(table+'-0').value;
		temp_string += '\r\n' + table_obj.getElementsByClassName('p1')[1].textContent.replace('Insert the ','') + ': ' + document.getElementById(table+'-1').value;
		temp_string += '\r\nThe absolute error is: ' + document.getElementById('0-screen-0').textContent;
		temp_string += '\r\nThe relative error is: ' + document.getElementById('0-screen-1').textContent;
		temp_string += '\r\nThe percentage error is: ' + document.getElementById('0-screen-2').textContent;
		temp_string += '\r\n' + table_obj.getElementsByClassName('question_title')[0].innerHTML + (document.getElementById(table+'-r-0').checked?' Yes':' No');
		temp_string += '\r\n' + table_obj.getElementsByClassName('question_title')[1].innerHTML + (document.getElementById(table+'-r-2').checked?' Yes':' No');
		temp_string += '\r\n' + table_obj.getElementsByClassName('question_title')[2].innerHTML;
		if(document.getElementById(table+'-cb-0').checked) temp_string+=' '+document.getElementById(table+'-cb-0').value.replace('_',' ');
		if(document.getElementById(table+'-cb-1').checked) temp_string+=' '+document.getElementById(table+'-cb-1').value.replace('_',' ');
		if(document.getElementById(table+'-cb-2').checked) temp_string+=' '+document.getElementById(table+'-cb-2').value.replace('_',' ');
		temp_string=temp_string.replace('Error Systematic','Error,Systematic');	//replace " " with "," in case of more than one error check boxes are currently selected
		temp_string=temp_string.replace('Error Random','Error,Random');
		var blob = new Blob([temp_string], {type: "text/plain;charset=utf-8"});
		saveAs(blob, table_obj.getElementsByClassName('Error_title')[0].textContent+".txt");
	}
	if(table==1)
	{
		var table_obj = document.getElementById(table);
		var temp_string = table_obj.getElementsByClassName('Error_title')[0].textContent;
		temp_string += '\r\n' + table_obj.getElementsByClassName('p1')[0].textContent.replace('Insert the ','') + ': ' + document.getElementById(table+'-0').value;
		temp_string += '\r\n' + table_obj.getElementsByClassName('p1')[1].textContent.replace('Insert the ','') + ': ' + document.getElementById(table+'-1').value;
		temp_string += '\r\nResult: ' + document.getElementById(table+'-screen').textContent;
		temp_string += '\r\n' + table_obj.getElementsByClassName('question_title')[0].innerHTML + (document.getElementById(table+'-r-0').checked?' Yes':' No');
		temp_string += '\r\n' + table_obj.getElementsByClassName('question_title')[1].innerHTML + (document.getElementById(table+'-r-2').checked?' Yes':' No');
		temp_string += '\r\n' + table_obj.getElementsByClassName('question_title')[2].innerHTML;
		if(document.getElementById(table+'-cb-0').checked) temp_string+=' '+document.getElementById(table+'-cb-0').value.replace('_',' ');
		if(document.getElementById(table+'-cb-1').checked) temp_string+=' '+document.getElementById(table+'-cb-1').value.replace('_',' ');
		if(document.getElementById(table+'-cb-2').checked) temp_string+=' '+document.getElementById(table+'-cb-2').value.replace('_',' ');
		temp_string=temp_string.replace('Error Systematic','Error,Systematic');	//replace " " with "," in case of more than one error check boxes are currently selected
		temp_string=temp_string.replace('Error Random','Error,Random');
		var blob = new Blob([temp_string], {type: "text/plain;charset=utf-8"});
		saveAs(blob, table_obj.getElementsByClassName('Error_title')[0].textContent+".txt");
	}
	if(table == 2)
	{
		var table_obj = document.getElementById(table);
		var temp_string = table_obj.getElementsByClassName('Error_title')[0].textContent;
		temp_string += '\r\nvalues you have measured: ' + document.getElementById(table+'-0').value;
		temp_string += '\r\nThe mean value is: ' + document.getElementById('2-screen-0').textContent;
		temp_string += '\r\nThe standard deviation is:' + document.getElementById('2-screen-1').textContent;
		var get_sigma = table_obj.getElementsByClassName('question_title')[0].innerHTML;
		get_sigma=get_sigma.charAt(get_sigma.indexOf('1')+1);
		temp_string += '\r\n' + table_obj.getElementsByClassName('question_title')[0].innerHTML + ( document.getElementById(table+'-r-0').checked?' 1'+get_sigma:(document.getElementById(table+'-r-1').checked?' 2'+get_sigma:' 3'+get_sigma) );
		temp_string += '\r\n' + table_obj.getElementsByClassName('question_title')[1].innerHTML + (document.getElementById(table+'-r-3').checked?' Yes':' No');
		temp_string += '\r\n' + table_obj.getElementsByClassName('question_title')[2].innerHTML;
		if(document.getElementById(table+'-cb-0').checked) temp_string+=' '+document.getElementById(table+'-cb-0').value.replace('_',' ');
		if(document.getElementById(table+'-cb-1').checked) temp_string+=' '+document.getElementById(table+'-cb-1').value.replace('_',' ');
		if(document.getElementById(table+'-cb-2').checked) temp_string+=' '+document.getElementById(table+'-cb-2').value.replace('_',' ');
		temp_string=temp_string.replace('Error Systematic','Error,Systematic');	//replace " " with "," in case of more than one error check boxes are currently selected
		temp_string=temp_string.replace('Error Random','Error,Random');
		var blob = new Blob([temp_string], {type: "text/plain;charset=utf-8"});
		saveAs(blob, table_obj.getElementsByClassName('Error_title')[0].textContent+".txt");
	}
	//return s;
}