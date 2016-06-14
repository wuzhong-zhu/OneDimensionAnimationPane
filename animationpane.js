define(["jquery", "text!./animationpane.css","qlik"], function($, cssContent,qlik ) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");

	var i=0,timerCnt=0;
	var stopFlag=false;

	function createBtn(cmd, text) {
		return '<button class="qui-button" style="font-size:13px;" data-cmd="' + cmd + '">' + text + '</button>';
	}

	function Reset(dataRow,controlApi)
	{
		if (!(controlApi.getDimensionInfos()[0].qStateCounts.qSelected==1 && controlApi.getDataRow(0)[0].qElemNumber==0))
		{
			controlApi.selectValues(0, [0], false);
		}
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
			var api=this.backendApi;
			var tempDataRow=api.getDataRow(0);
			var cardinal=api.getRowCount();

			var html = "<ul>";
			//rendering buttons
			html += '<div class="qui-buttongroup">';
			html += createBtn("Reset", "Reset");
			html += createBtn("back", "Prev");
			html += createBtn("forward", "Next");
			if(timerCnt==0)
				html += createBtn("play", "Play");
			else
				html += createBtn("play", "Stop");
			html += '</div>';

			$element.html(html);

			//trigers dimension incremental
			if(timerCnt>0)
			{
				setTimeout(	function() {
								if(stopFlag==false)
								{
									i++;
									if(i>=cardinal)
										i=0;
									api.selectValues(0, [i], false);
								}
							},layout.interval);
				timerCnt--;
			}

			$element.find('button').on('qv-activate', function() {
				switch($(this).data('cmd')) {
					case 'Reset':
						timerCnt=0;
						i=0;
						Reset(api);
						break;
					case 'forward':
						timerCnt=0;
						i++;
						if(i>=cardinal)
							i=0;
						api.selectValues(0, [i], false);
						break;
					case 'back':
						timerCnt=0;
						i--;
						if(i<0)
							i=cardinal-1;
						api.selectValues(0, [i], false);
						break;
					case 'play':
						if(timerCnt==0)
						{
							stopFlag=false;
							setTimeout(	function() {
											i++;
											if(i>=cardinal)
												i=0;
											api.selectValues(0, [i], false);
										},layout.interval);
							timerCnt=cardinal;
						}
						else
						{
							alert("animation stoped");
							// i++;
							// api.selectValues(0, [i], false);
							stopFlag=true;
							timerCnt=0;
						}
					break;
				}
			});
		}
	};
});
