define(["jquery", "text!./animationpane.css","qlik"], function($, cssContent,qlik ) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");

	var i=-1,timerCnt=0;
	var stopFlag=false;

	function createBtn(cmd, text) {
		return '<button class="lui-button stepBut'+cmd+'" style="font-size:13px;" data-cmd="' + cmd + '">' + text + '</button>';
	}

	// function Reset(controlApi)
	// {
	// 	qlik.app.field(eMonth).clear();
	// 	if (!(controlApi.getDimensionInfos()[0].qStateCounts.qSelected==1 && controlApi.getDataRow(0)[0].qState=="S"))
	// 	{
	// 		controlApi.select(0, [0], false);
	// 	}
	// }

	return {
		initialProperties : {
			qListObjectDef : {
				qShowAlternatives : true,
				qFrequencyMode : "V",
				qSortCriterias : {
					qSortByState : 1
				},
				qInitialDataFetch : [{
					qWidth : 2,
					qHeight : 50
				}]
			},
			fixed : true,
			width : 25,
			percent : true,
			selectionMode : "CONFIRM"
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				config : {
					type : "items",
					label : "Configuration",
					items : {
						interval : {
							ref : "interval",
							label : "Time interval",
							type : "number",
							defaultValue : 1500,
						},
					}
				},
				dimension : {
					type : "items",
					label : "Dimensions",
					ref : "qListObjectDef",
					min : 1,
					max : 1,
					items : {
						label : {
							type : "string",
							ref : "qListObjectDef.qDef.qFieldLabels.0",
							label : "Label",
							show : true
						},
						libraryId : {
							type : "string",
							component : "library-item",
							libraryItemType : "dimension",
							ref : "qListObjectDef.qLibraryId",
							label : "Dimension",
							show : function(data) {
								return data.qListObjectDef && data.qListObjectDef.qLibraryId;
							}
						},
						field : {
							type : "string",
							expression : "always",
							expressionType : "dimension",
							ref : "qListObjectDef.qDef.qFieldDefs.0",
							label : "Field",
							show : function(data) {
								return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
							}
						},
						frequency : {
							type : "string",
							component : "dropdown",
							label : "Frequency mode",
							ref : "qListObjectDef.qFrequencyMode",
							options : [{
								value : "N",
								label : "No frequency"
							}, {
								value : "V",
								label : "Absolute value"
							}, {
								value : "P",
								label : "Percent"
							}, {
								value : "R",
								label : "Relative"
							}],
							defaultValue : "V"
						},
						qSortByLoadOrder:{
							type: "numeric",
							component : "dropdown",
							label : "Sort by Load Order",
							ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByLoadOrder",
							options : [{
								value : 1,
								label : "Ascending"
							}, {
								value : 0,
								label : "No"
							}, {
								value : -1,
								label : "Descending"
							}],
							defaultValue : 0,
							
						},
						qSortByFrequency:{
							type: "numeric",
							component : "dropdown",
							label : "Sort by Frequence",
							ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByFrequency",
							options : [{
								value : -1,
								label : "Ascending"
							}, {
								value : 0,
								label : "No"
							}, {
								value : 1,
								label : "Descending"
							}],
							defaultValue : 0,
							
						},
						qSortByNumeric:{
							type: "numeric",
							component : "dropdown",
							label : "Sort by Numeric",
							ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByNumeric",
							options : [{
								value : 1,
								label : "Ascending"
							}, {
								value : 0,
								label : "No"
							}, {
								value : -1,
								label : "Descending"
							}],
							defaultValue : 0,
							
						},
						qSortByAscii:{
							type: "numeric",
							component : "dropdown",
							label : "Sort by Alphabetical",
							ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByAscii",
							options : [{
								value : 1,
								label : "Ascending"
							}, {
								value : 0,
								label : "No"
							}, {
								value : -1,
								label : "Descending"
							}],
							defaultValue : 0,							
						}
					}
				},

				settings : {
					uses : "settings"
				}
			}
		},
		snapshot : {
			canTakeSnapshot : true
		},

		paint : function($element, layout) {

			//Opens currApp
			var app = qlik.currApp(this);
			var api = this.backendApi;
			var maxCnt=api.getRowCount();
			var mydimTextValue ="No selection";
			 var tempDataRow=api.getDataRow(i);

			 //console.log(tempDataRow[0].qText);
			 //console.log(tempDataRow[0].qState);
			//Making buttons
			if(i>=0){
				mydimTextValue = tempDataRow[0].qText
			};

			var html = "";
			html += layout.qListObject.qDimensionInfo.qGroupFieldDefs[0];
			html += " | "+mydimTextValue;
			html += "<br>";
			html += '<div class="lui-buttongroup qui-buttongroup" style="margin-right:3px;">';
			html += createBtn("Clear", '<span class="lui-icon lui-icon--clear-selections"></span>');
			//html += createBtn("Reset", "Reset");
			html += createBtn("back", '<span class="lui-icon lui-icon--selections-back"></span>');
			html += createBtn("forward", '<span class="lui-icon lui-icon--selections-forward"></span>');
			html += '</div>';
			if(timerCnt==0)
				html += createBtn("play", '<span class="lui-icon lui-icon--play"></span>');
			else
				html += '<button class="lui-button stepButplay" style="font-size:13px; color:red;" data-cmd="play">Stop</button>';
			$element.html(html);


			
			var prevButObj = $element.find('.stepButback');
			var nextButObj = $element.find('.stepButforward');
			prevButObj.attr("disabled", false);
			nextButObj.attr("disabled", false);

			//trigers dimension incremental
			if(timerCnt>0)
			{
				setTimeout(	function() {
								if(stopFlag==false)
								{
									
									i++;
									if(i>=maxCnt)
										i=0;
									app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);

								}
							},layout.interval);
				timerCnt--;
			}

			
			
			if(i<1){
				prevButObj.attr("disabled", true);
			}; 
			if(i>=maxCnt){ 
				nextButObj.attr("disabled", true);
			};

			$element.find('button').on('qv-activate', function() {
				switch($(this).data('cmd')) {
					case 'Clear':
						timerCnt=0;
						i=-1;
						app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).clear();
						break;
					//case 'Reset':
					//	timerCnt=0;
					//	i=-1;
					//	app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
					//	break;
					case 'forward':
						timerCnt=0;
						i++;
						if(i>=maxCnt)
							//nextButObj.attr("disabled", true);
							i=0;
						//api.select(0, [i], false);
						app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
						break;
					case 'back':
						timerCnt=0;
						i--;
						if(i<0)
							//prevButObj.attr("disabled", true);
							i=maxCnt;
						//api.select(0, [i], false);
						app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
						break;
					case 'play':
						if(timerCnt==0)
						{
							stopFlag=false;
							setTimeout(	function() {
											i++;
											if(i>=maxCnt)
												i=0;
											app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
										},layout.interval);
							timerCnt=maxCnt;
						}
						else
						{
							//alert("animation stoped");
							i++;
							if(i>=maxCnt)
								i=0;
							app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
							stopFlag=true;
							timerCnt=0;
						}
					break;
				}
			});

		}
	};
});
