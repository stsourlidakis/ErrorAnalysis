var active=-1;	//id of the active table
var experimentalValuesDone=false;
var n;	//# of error buttons/tables
var tables = {	//Associate table titles with ids
	"Error in measurements": 0,
	"Error in an average": 1,
	"Standard Deviation": 2,
	"Sources of error": 3,
	"Experimental values": 4,
	"Introduction": 5,
	"Error propagation": 6
	};

var documentType = "errorAnalysisInstance";
var logItems = {};	//The object that contains the information about each element in order to log changes.
var actionLogger, storageHandler, errorAnalysisToolMetadataHandler;
var resourceContent = {};
var langPrefs = new gadgets.Prefs();	//text for pop-ups
$( document ).ready(function() {
	n = document.getElementsByClassName("ErrorContainer").length;
	
	init_log_items();
	init_golab_handlers();
	event_handlers();
	
	reset();
});
function reset(){
	active = -1;
	for (var i=0;i<n;i++) {
		reset_table(i);
	}
	
	//Hide all error tables, show the first one and set it as the active table.
	show_table(tables["Experimental values"]);	//Must be placed after event handlers so the first active table can be logged as a member of "ErrorButtons" class before show_table() change its class to "ErrorButtonsActive"	
	disable_error_buttons();
}
function event_handlers() {
	$(".ErrorButtons").click(function() {	//Change displayed error table
		show_table($(this).attr("id").replace("errorButton",""));
	});
	
	$(".infoIcons").click(function() {	//Show/hide error info/formula
		toggle_info($(this).attr("id").replace("infoIcon",""));
	});
	
	$(".calculate").click(function() {
		var parent_id = $(this).closest('.ErrorContainer').attr('id');
		if(parent_id == tables["Error in measurements"])
			calculateMeasurementError();
		else if(parent_id == tables["Error in an average"])
			calculateAverageError();
		else if(parent_id == tables["Standard Deviation"])
			calculateStandardDeviation();
		else if(parent_id == tables["Experimental values"])
			calculateMeanValue();
	});
	
	$(".reset").click(function() {	//Reset error input fields on the active table
		reset_table($(this).closest('.ErrorContainer').attr('id'));
	});
	$(".clearButtons").click(function() {	//Clear
		reset();
	});
	$(".openButtons").click(function() {	//Load
		loadResource();
	});
	$(".saveButtons").click(function() {	//Save
		saveResource();
	});
	
	
	$('input:text').change(function() {	//log changes on input fields when the value changes
		if( $(this).val() != logItems[$(this).attr('id')].content ) {
			logItems[$(this).attr('id')].content = $(this).val();
			actionLogger.log("change", logItems[$(this).attr('id')]);
		}
	});
	
 	$("html").keypress(function(e) {	//testing
		if(e.keyCode==33) {	//page up
			// console.log(logItems);
			// testStorage();
			// saveResource();
		}
	});
}
function saveResource(){
	updateLocalResource();
	storageHandler.readLatestResource(documentType, function(error, resource) {	//check if there is a resource for the current user that can be updated.
		if( resource != undefined ){	//Update the latest resource.
			storageHandler.updateResource(resource.metadata.id, resourceContent, function(updateError, updatedResource) {
				if( updateError != undefined ){
					console.warn("something went wrong:");
					console.warn(updateError);
				}
				else{
					console.log("the resource has been updated successfully");
					console.log("id:"+updatedResource.metadata.id);
					console.log(updatedResource);
					logItems['resource'].id = updatedResource.metadata.id;
					actionLogger.log("update", logItems['resource']);
				}
			});
		}
		else{	//Create a new resource.
			storageHandler.createResource(resourceContent, function(newError, newResource) {
				if (newError != undefined) {
					console.warn("something went wrong:");
					console.warn(newError);
				}
				else {
					console.log("the resource has been created successfully.");
					console.log("id:"+newResource.metadata.id);
					console.log(newResource);
					logItems['resource'].id = newResource.metadata.id;
					actionLogger.log("create", logItems['resource']);
				}
			});
		}
	});
}
function loadResource(){
	storageHandler.readLatestResource(documentType, function(error, resource) {
		if( resource != undefined ){
			reset();	//Reset first in order to clear the screens.
			//Replace with the saved values and if they are valid, do the calculations.
			$('input[name=experimentalValues]').val(resource.content['experimentalValues']);
			$('input[name=systematicError]').val(resource.content['systematicError']);
			if( check_input(tables['Experimental values']) )
				calculateMeanValue();
			$('input[name=theoreticalValue]').val(resource.content['theoreticalValue']);
			$('input[name=experimentalValue]').val(resource.content['experimentalValue']);			
			if( check_input(tables['Error in measurements']) )
				calculateMeasurementError();
			$('input[name=sdValues]').val(resource.content['sdValues']);			
			if( check_input(tables['Standard Deviation']) )
				calculateStandardDeviation();
			$('input[name=standardError]').val(resource.content['standardError']);
			$('input[name=numberOfValues]').val(resource.content['numberOfValues']);			
			if( check_input(tables['Error in an average']) )
				calculateAverageError();
			logItems['resource'].id = resource.metadata.id;
			actionLogger.log("open", logItems['resource']);
		}
	});
}
function updateLocalResource(){
	resourceContent['experimentalValues'] = $('input[name=experimentalValues]').val();
	resourceContent['systematicError'] = $('input[name=systematicError]').val();
	resourceContent['theoreticalValue'] = $('input[name=theoreticalValue]').val();
	resourceContent['experimentalValue'] = $('input[name=experimentalValue]').val();
	resourceContent['sdValues'] = $('input[name=sdValues]').val();
	resourceContent['standardError'] = $('input[name=standardError]').val();
	resourceContent['numberOfValues'] = $('input[name=numberOfValues]').val();
}
function init_log_items() {
	$('.ErrorContainer').each(function() {
		logItems[$(this).attr('id')] = {
			'objectType': 'errorTable',
			'id': ut.commons.utils.generateUUID(),
			'content': $(this).attr('name')
		};
	});
 	$('.error_info').each(function() {
		logItems[$(this).attr('id')] = {
			'objectType': 'helpText',
			'id': ut.commons.utils.generateUUID(),
			'content': $(this).attr('name')
		};
	});
	$('input:text').each(function() {	//Input fields
		logItems[$(this).attr('id')] = {
			'objectType': $(this).attr('name'),
			'id': ut.commons.utils.generateUUID(),
			'content': ''
		};
	});
	logItems['resource'] = {
		'objectType': 'resource',
		'id': '',
		'content': 'app data'
	};
}
function init_golab_handlers() {
	var toolName = "golab.errorAnalysisTool";
	var currUser, currIls;
	var initialMetadata = {
		"id": '',
		"published": '',
		"actor": {
		  "objectType": "person",
		  "id": ut.commons.utils.generateUUID(),
		  "displayName": ''
		},
		"target": {
		  "objectType": documentType,
		  "id": ut.commons.utils.generateUUID(),
		  "displayName": ''
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
		  "id": '',
		  "displayName": ''
		} 
	};
	ils.getCurrentUser(function(current_user){
		initialMetadata.actor.displayName = current_user;
		currUser = current_user;
		ils.getIls(function(ils_space){
			initialMetadata.provider.id = ils_space.id;
			initialMetadata.provider.displayName = ils_space.displayName;
			initialMetadata.target.displayName = ils_space.displayName+' '+documentType;
			currIls = ils_space;
			
			new golab.ils.metadata.GoLabMetadataHandler(initialMetadata, function(error, metadataHandler) {
			  if (error == undefined) {
				// errorAnalysisToolMetadataHandler = metadataHandler;
				actionLogger = new window.ut.commons.actionlogging.ActionLogger(metadataHandler);
				actionLogger.setLoggingTarget("opensocial");
				// actionLogger.setLoggingTarget("console");
				storageHandler = new golab.ils.storage.LocalStorageHandler(metadataHandler);
			  } else {
				console.error ("Something went wrong when creating the MetadataHandler: "+error);
			  }
		  });
		});
	});
}
function show_table(id) {
	if(active==id)return;	//Don't try to show an already active error table
	if( $('#errorButton'+id ).hasClass('ErrorButtonsInactive') )return;
	for (var i=0;i<n;i++) {	//Hide all error tables and set their button on the inactive class
		if(id!=i)hide_table(i);
	}
	hide_info();
	document.getElementById(id).style.display = "block";
	document.getElementById("errorButton"+id).className = "ErrorButtonsActive";
	if(active!=-1)	//Don't log the action when the document gets initialized
		actionLogger.log("access", logItems[id]);
	active=id;
}
function hide_table(id) {
	document.getElementById(id).style.display = "none";
	if( !$('#errorButton'+id ).hasClass('ErrorButtonsInactive') )document.getElementById("errorButton"+id).className = "ErrorButtons";
}
function reset_table(id) {
	if( (id == tables["Sources of error"]) || (id == tables["Error propagation"]) || (id == tables["Introduction"]) )return;	//Skip tables that don't have any elements to reset.
	
	$('#'+id+' input:text').val('');
	$('#'+id+' .screen').html('');
	$('#'+id+' .'+id+'-questions').hide();
	$('#'+id+' input:checkbox').removeAttr('checked');
	//$('#'+id+' input:radio').attr("checked", true);
	
	if(id==tables["Experimental values"])
	{
		$('#'+id+'-screen-0').closest('.row').hide();	//Hide "corrected set of measurement" screen.
		$('#'+id+'-screen-1').closest('.row').find('.p1').html('The mean value is:');
		$('#'+id+'-screen-1').closest('.row').find('.p1').html(langPrefs.getMsg("table.experimentalValues.resultInfo.1")+':');
	}
	if(active!=-1)	//Don't log the action when the document gets initialized
		actionLogger.log("cancel", logItems[id]);
}
function hide_info() {
	var elements = document.getElementsByClassName("error_info");
	for (var i=0;i<elements.length;i++)	{
		elements[i].style.height="0px";
		elements[i].style.opacity="0";
	}
}
function toggle_info(id) {
	var element = document.getElementById('info-'+id);
	document.getElementById('info-'+id).style.height = element.style.height=="0px"?"auto":"0px";
	document.getElementById('info-'+id).style.opacity = element.style.opacity=="0"?"1":"0";
	if(document.getElementById('info-'+id).style.opacity != "0"){
		actionLogger.log("access", logItems['info-'+id]);
	}
}
function disable_error_buttons() {
	/* document.getElementById("errorButton0").className = "ErrorButtonsInactive";
	document.getElementById("errorButton1").className = "ErrorButtonsInactive";
	document.getElementById("errorButton2").className = "ErrorButtonsInactive";
	document.getElementById("errorButton6").className = "ErrorButtonsInactive"; */
 	var id;
	$('.ErrorButtons').each(function() {
		id = $(this).attr('id');
		if( (id!='errorButton'+tables["Sources of error"]) && (id!='errorButton'+tables["Experimental values"]) && (id!='errorButton'+tables["Introduction"]) && (id!='errorButton'+tables["Error propagation"]) )
			document.getElementById(id).className = "ErrorButtonsInactive";
	});
}
function enable_error_buttons() {
 	/* document.getElementById("errorButton0").className = "ErrorButtons";
	document.getElementById("errorButton1").className = "ErrorButtons";
	document.getElementById("errorButton2").className = "ErrorButtons";
	document.getElementById("errorButton6").className = "ErrorButtons"; */
 	var id;
	$('.ErrorButtonsInactive').each(function() {
		id = $(this).attr('id');
		if( (id!='errorButton'+tables["Sources of error"]) && (id!='errorButton'+tables["Experimental values"]) && (id!='errorButton'+tables["Introduction"]) && (id!='errorButton'+tables["Error propagation"]) )
			document.getElementById(id).className = "ErrorButtons";
	});
}
function calculateMeasurementError() {
	var table = tables["Error in measurements"];	//table id
	if( !check_input(table) ) {
		alert(langPrefs.getMsg('js.invalidInput.0.0')+"\n"+langPrefs.getMsg('js.invalidInput.0.1'));
		return;
	}
	
	var theoretical = +document.getElementById(table+'-0').value;	//+ will cast any spaces to zero.
	document.getElementById(table+'-0').value = theoretical;	//Replace the input with the numerical value in order to remove the spaces.
	if(theoretical==0) {
		alert(langPrefs.getMsg('js.invalidInput.1'));
		return;
	}
	var experimental = +document.getElementById(table+'-1').value;
	document.getElementById(table+'-1').value = experimental;
	
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

	actionLogger.log("start", logItems[table]);
}
function calculateAverageError() {
	var table = tables["Error in an average"];	//table id
	if( !check_input(table) ) {
		alert(langPrefs.getMsg('js.invalidInput.0.0')+"\n"+langPrefs.getMsg('js.invalidInput.0.1'));
		return;
	}
	var standar = +document.getElementById(table+'-0').value;	//+ will cast any spaces to zero
	document.getElementById(table+'-0').value = standar	//Replace the input with the numerical value in order remove the spaces.
	var nV = +document.getElementById(table+'-1').value;
	document.getElementById(table+'-1').value = nV;
	if(nV==0) {
		alert(langPrefs.getMsg('js.invalidInput.2'));
		return;
	}
	document.getElementById(table+'-screen').innerHTML=(standar/Math.sqrt(nV)).toFixed(3);
	var questions = document.getElementsByClassName(table+"-questions");
	for (var i=0;i<questions.length;i++)
		questions[i].style.display="";

	actionLogger.log("start", logItems[table]);
}

function calculateStandardDeviation() {
	var i;
	var table = tables["Standard Deviation"];	//table id
	document.getElementById(table+'-0').value = document.getElementById(table+'-0').value.replace(/\s/g, " ").replace(/\s+/g," ").trim();
	if( !check_input(table) ) {
		/*alert(langPrefs.getMsg('js.invalidInput.3.0')+"\n"+\nFor decimal numbers please use \".\"\nIn order to separate values use space\nMore than one values should be defined.");*/
		alert(langPrefs.getMsg('js.invalidInput.0.0')+"\n"+langPrefs.getMsg('js.invalidInput.0.1')+"\n"+langPrefs.getMsg('js.invalidInput.3.0')+"\".\"\n"+langPrefs.getMsg('js.invalidInput.3.1')+"\n"+langPrefs.getMsg('js.invalidInput.3.2'));
		return;
	}
	var values = document.getElementById(table+'-0').value.split(" ");
	var avg=0;
	var avg1=0;
	for (i = 0; i < values.length; i++) {	//Average calculation
		values[i]=parseFloat(values[i]);
		avg+=values[i];
		}
	avg/=values.length;
	for (i = 0; i < values.length; i++) {	//Standard deviation calculation
		avg1+=Math.pow(values[i]-avg,2);
	}
	avg1/=(values.length-1);
	avg = avg.toFixed(3);
	document.getElementById(table+'-screen'+'-0').innerHTML=avg;
	document.getElementById(table+'-screen'+'-1').innerHTML=Math.sqrt(avg1).toFixed(3);
	
	var questions = document.getElementsByClassName(table+"-questions");
	for (var i=0;i<questions.length;i++)
		questions[i].style.display="";
		
	actionLogger.log("start", logItems[table]);
}

function calculateMeanValue() {
	var i, maxProbableError, avg, newValues, table=tables["Experimental values"];
	var expValTable = tables["Error in measurements"];	//Table that contains the experimental value input field in order to be auto-filled.
	var sdTable = tables["Standard Deviation"];	//Standard deviation table
	var systematicError = $('#4-1').val().trim();	//Trim removes whitespace characters
	if( systematicError=='' || isNaN(systematicError) ) {
		$('#4-1').val(0);
		systematicError=0;
	}
	document.getElementById(table+'-0').value = document.getElementById(table+'-0').value.replace(/\s/g, " ").replace(/\s+/g," ").trim();
	if( !check_input(table) ) {
		/*alert(langPrefs.getMsg('js.invalidInput.3.0')+"\n"+\nFor decimal numbers please use \".\"\nIn order to separate values use space\nMore than one values should be defined.");*/
		alert(langPrefs.getMsg('js.invalidInput.0.0')+"\n"+langPrefs.getMsg('js.invalidInput.0.1')+"\n"+langPrefs.getMsg('js.invalidInput.3.0')+"\".\"\n"+langPrefs.getMsg('js.invalidInput.3.1')+"\n"+langPrefs.getMsg('js.invalidInput.3.2'));
		return;
	}
	$('#'+table+'-screen'+'-0').closest('.row').hide();
	var values = document.getElementById(table+'-0').value.split(" ");
	avg=0;
	newValues='';
	for (i = 0; i < values.length; i++) {	//Average calculation
		values[i]=parseFloat(values[i]);
		avg+=values[i]-systematicError;
		newValues +=(i==values.length-1)?(values[i]-systematicError).toFixed(3).replace(/\.000$/, ''):(values[i]-systematicError).toFixed(3).replace(/\.000$/, '')+' ';	//ifthenelse in order to prevent a stray space after the last value. Regex to remove the no needed zeroes
		}
	maxProbableError = Math.abs( (Math.min.apply(Math, values)-Math.max.apply(Math, values)) / 2);	//Max probable error calculation
	avg = (avg/values.length).toFixed(3);
	document.getElementById(table+'-screen'+'-1').innerHTML=avg;
	document.getElementById(expValTable+'-1').value=avg;
	document.getElementById(table+'-screen'+'-2').innerHTML=maxProbableError.toFixed(3);

	if(systematicError==0) {
		document.getElementById(sdTable+'-0').value = document.getElementById(table+'-0').value;
		$('#'+table+'-screen-1').closest('.row').find('.p1').html('You have now calculated the mean value of your measurements\' set. This mean value is your experimental value.');
	}
	else{
		document.getElementById(sdTable+'-0').value = newValues;
		document.getElementById(table+'-screen'+'-0').value=newValues;
		$('#'+table+'-screen'+'-0').closest('.row').show();
		$('#'+table+'-screen-1').closest('.row').find('.p1').html('The mean value of the corrected measurements is:');
	}
	experimentalValuesDone = true;
	enable_error_buttons();
	actionLogger.log("start", logItems[table]);
}

function check_input(table)	{	//Returns true for valid values on the selected error table

	if(table==tables["Standard Deviation"]) {	//Table 2 has only 1 form to check
		var values = document.getElementById(table+'-0').value.split(" ");
		if(values.length<2)return false;
		for (var i = 0; i < values.length; i++) {
			if(isNaN(values[i]) || values[i]=="" || values[i]==" ")return false;
		}
	}
	else if(table==tables["Experimental values"]) {
		var values = document.getElementById(table+'-0').value.split(" ");
		if(values.length<2)return false;
		for (var i = 0; i < values.length; i++) {
			if(isNaN(values[i]) || values[i]=="" || values[i]==" ")return false;
		}
		var inputValue=document.getElementById(table+'-1').value.trim();
		if(isNaN(inputValue) || inputValue=="" || ( ( inputValue.indexOf(' ')==0 && inputValue.length-1==0 ) || ( inputValue.indexOf(' ')==inputValue.length-1 && inputValue.length-1==0 ) ) )return false;
	}
	else {
		var inputValue=document.getElementById(table+'-0').value.trim();
		if(isNaN(inputValue) || inputValue=="" || ( ( inputValue.indexOf(' ')==0 && inputValue.length-1==0 ) || ( inputValue.indexOf(' ')==inputValue.length-1 && inputValue.length-1==0 ) ) )return false;	//Third argument checks for a space allowing only one at the start or at the end of the number
		inputValue=document.getElementById(table+'-1').value.trim();
		if(isNaN(inputValue) || inputValue=="" || ( ( inputValue.indexOf(' ')==0 && inputValue.length-1==0 ) || ( inputValue.indexOf(' ')==inputValue.length-1 && inputValue.length-1==0 ) ) )return false;
	}
	return true;
}