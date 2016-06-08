define(["jquery", "text!./animationpane.css","qlik"], function($, cssContent,qlik ) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");

	var i=0,timerCnt=0;
	var stopFlag=false;

	function createBtn(cmd, text) {
		return '<button class="qui-button" style="font-size:13px;" data-cmd="' + cmd + '">' + text + '</button>';
	}

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
						qSortByState:{
							type: "numeric",
							component : "dropdown",
							label : "Sort by State",
							ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByState",
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

			//For Feedback:
			// //Store the dimension into an array
			var tempDataRow=this.backendApi.getDataRow(0);
			//console.log(tempDataRow);

			// //Just for checking, append the data in first cell
			var html = "<ul>";
			if (tempDataRow!=null)
			{
				html+="data :"+tempDataRow[0].qText;
				//html+="state:"+tempDataRow[0].qState;
			}
			html += "</ul>";

			//rendering buttons
			html += '<div class="qui-buttongroup">';
			html += createBtn("Reset", "Reset");
			html += createBtn("clearAll", "Clear");
			html += "</br>";
			html += createBtn("back", "Prev");
			html += createBtn("forward", "Next");
			if(timerCnt==0)
				html += createBtn("play", "Play");
			else
				html += createBtn("play", "Stop");
			html += '</div>';

			$element.html(html);

			//get dimension infos (title and cardinal)
			var info=this.backendApi.getDimensionInfos()[0];
			var title=info.qFallbackTitle;
			var cardinal=info.qCardinal;
			//get field data. why field data? because field data remains unchanged despite changing in data frame
			var field=qlik.currApp(this).field(title);
			var dataRow=field.getData().rows;

			//timer session for animation
			//timeout ids are stored in timeOutArr
			if(timerCnt>0)
			{
				setTimeout(	function() {
								if(stopFlag==false)
								{
									i++;
									if(i>=cardinal)
										i=0;
									field.clear();
									field.select([dataRow[i].qElemNumber],true,false);
								} 
							},layout.interval);
				timerCnt--;
			}


			$element.find('button').on('qv-activate', function() {
				//console.log(info);
				switch($(this).data('cmd')) {
					case 'clearAll':
						timerCnt=0;
						field.clear();
						i=0;
						break;
					case 'Reset':
						timerCnt=0;
						field.clear();
						i=0;
						field.select([dataRow[i].qElemNumber],true,false);
						break;
					case 'forward':
						timerCnt=0;
						i++;
						if(i>=cardinal)
							i=0;
						field.clear();
						field.select([dataRow[i].qElemNumber],true,false);
						break;
					case 'back':
						timerCnt=0;
						i--;
						if(i<0)
							i=cardinal-1;
						field.clear();
						field.select([dataRow[i].qElemNumber],true,false);
						break;
					case 'play':
						if(timerCnt==0)
						{
							stopFlag=false;
							field.clear();
							field.select([dataRow[i].qElemNumber],true,false);
							timerCnt=cardinal;
						}
						else
						{
							alert("animation stoped");
							stopFlag=true;
							timerCnt=0;
							field.clear();
							field.select([dataRow[i].qElemNumber],true,false);
						}
					break;
				}
			});

		}
	};
});
