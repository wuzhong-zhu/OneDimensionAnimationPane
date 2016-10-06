define(["jquery", "text!./animationpane.css","qlik"], function($, cssContent,qlik ) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");

	var i=0,timerCnt=0;
	var stopFlag=false;
	var initialized=false;

	function createBtn(cmd, text) {
		return '<button class="lui-button style="font-size:13px;" data-cmd="' + cmd + '">' + text + '</button>';
	};

	return {
		initialProperties : {
			qListObjectDef : {
				qShowAlternatives : true,
				qFrequencyMode : "V",
				qSortCriterias : {
					qSortByState : 1
				},
				qInitialDataFetch : [{
					qWidth : 1,
					qHeight : 10000
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
			var data=layout.qListObject.qDataPages[0].qMatrix;
			if(data[0][0].qState=="S"){
				var temp=data.shift();
					data.splice(i, 0, temp);
			}
			console.log(data);

			// function reconstructDataArray(dataArr,currIndex){

			// 	if(data[0][0].qState=="S"){
			// 		var temp=dataArr.shift();
			// 		dataArr.splice(i, 0, temp);
			// 	}
			// 	console.log(dataArr);
			// };

			var html = "";
			html += layout.qListObject.qDimensionInfo.qGroupFieldDefs[0];
			// html += " | "+mydimTextValue;
			html += "<br>";
			html += "Index:"+i;
			html += "<br>";
			html += createBtn("Clear", "Clear");
			html += createBtn("Reset", "Reset");
			html += createBtn("back", "Prev");
			html += createBtn("forward", "Next");
			if(timerCnt==0)
				html += createBtn("play", 'play');
			else
				html += createBtn("play", 'stop');
			$element.html(html);

			//triggers dimension increment
			if(timerCnt>0)
			{
				setTimeout(	function() {
								if(stopFlag==false)
								{
									i++; 
									if(i>=maxCnt)
										i=0;
									// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
									api.selectValues(0, [data[i][0].qElemNumber], false);

								}
							},layout.interval);
				timerCnt--;
			}

			$element.find('button').on('qv-activate', function() {
				switch($(this).data('cmd')) {
					case 'Clear':
						timerCnt=0;
						i=0;
						app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).clear();
						break;
					case 'Reset':
						timerCnt=0;
						i=0;
						// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
						api.selectValues(0, [data[0][0].qElemNumber], false);
						break;
					case 'forward':
						timerCnt=0;
						i++;
						if(i>=maxCnt)
							i=0;
						api.selectValues(0, [data[i][0].qElemNumber], false);
						break;
					case 'back':
						timerCnt=0;
						i--;
						if(i<0)
							i=maxCnt-1;
						// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
						api.selectValues(0, [data[i][0].qElemNumber], false);
						break;
					case 'play':
						if(timerCnt==0)
						{
							stopFlag=false;
							setTimeout(	function() {
											i++;
											if(i>=maxCnt)
												i=0;
											// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
											api.selectValues(0, [data[i][0].qElemNumber], false);
										},layout.interval);
							timerCnt=maxCnt;
						}
						else
						{
							alert("animation stopped");
							i++;
							if(i>=maxCnt)
								i=0;
							// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
							api.selectValues(0, [data[i][0].qElemNumber], false);
							stopFlag=true;
							timerCnt=0;
						}
					break;
				}
			});
		}
	};
});
