define(["jquery", "text!./animationpane.css","qlik"], function($, cssContent,qlik ) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");

	var i=0,timerCnt=0;
	var stopFlag=false;

	function createBtn(cmd, text, icon) {
		return '<button class="lui-button" data-cmd="' + cmd + '" title="' + text + '"><span class="lui-button__icon  lui-icon  lui-icon--' + icon + '"></span></button>';
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
	            	"qTop": 0,
	            	"qLeft": 0,
					"qWidth" : 1,
					"qHeight" : 1
				}]
			},
			fixed : true,
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
			canTakeSnapshot : false
		},

		paint : function($element, layout) {

			//Uses currApp and get key variables
			var app = qlik.currApp(this);
			var api = this.backendApi;
			var maxCnt=layout.qListObject.qDimensionInfo.qCardinal;
			var data=layout.qListObject.qDataPages[0].qMatrix;


			var currentIndex,nextIndex,prevIndex;//for readability,can be omitted

			//selected data will be stored at the head of data array.
			//therefore need a parsing logic for prevIndex and nextIndex
			if(data[0][0].qState=="S" && maxCnt>1){
				currentIndex=i;
				//special case for currentIndex
				if(currentIndex==0){
					nextIndex=1;
					prevIndex=maxCnt-1;
				}
				else if(currentIndex==maxCnt-1){
					nextIndex=1;
					prevIndex=maxCnt-1;
				}
				else{
					nextIndex=currentIndex+1;
					prevIndex=currentIndex;
				}
			}
			else{
				currentIndex=0;
				if(maxCnt>1)
				{
					prevIndex=maxCnt-1;
					nextIndex=1;
				}
				else
				{
					nextIndex=0;
					prevIndex=0;
				}
			}

			

			//retrieve elemNumber of previous and next element
            var prevDataElemNumber,nextDataElemNumber,firstElemNumber;
			var nextPage = [{
                    qTop: nextIndex,
                    qLeft: 0,
                    qWidth: 1, 
                    qHeight: 1
            }];
            var prevPage = [{
                    qTop: prevIndex,
                    qLeft: 0,
                    qWidth: 1, 
                    qHeight: 1
            }];
            var firstPage = [{
                    qTop: 0,
                    qLeft: 0,
                    qWidth: 1,
                    qHeight: 2,
            }];

            var html = "";
//			html += layout.qListObject.qDimensionInfo.qGroupFieldDefs[0];
//			html += "<br>" + Index:"+i+"/"+(maxCnt-1) + "<br>";

			html += '<div class="lui-buttongroup">';
			html += createBtn("Clear", "Clear", "clear-selections");
			html += createBtn("Reset", "Reset", "selections-reload");
			html += '</div>&nbsp;<div class="lui-buttongroup">';
			html += createBtn("back", "Previous", "arrow-left");
			html += createBtn("forward", "Next", "arrow-right");
            html += '</div>&nbsp;';
            if(timerCnt==0)
                html += createBtn("play", "Play", "triangle-right lui-fade-button--success");
            else
                html += createBtn("play", "Stop", "close lui-fade-button--danger");
			$element.html(html);

			if(timerCnt>0)
			{
				setTimeout(	function() {
								if(stopFlag==false)
								{
									i++; 
									if(i>=maxCnt)
										i=0;
									// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
									api.getData( nextPage ).then( function ( dataPages1 ) {
						            	nextDataElemNumber=dataPages1[0].qMatrix[0][0].qElemNumber;
										api.selectValues(0, [nextDataElemNumber], false);
							        });

								}
							},layout.interval);
				timerCnt--;
			}

			$element.find('button').on('qv-activate', function() {
				switch($(this).data('cmd')) {
					case 'Clear':
						timerCnt=0;
						i=0;
						// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).clear();
						api.selectValues(0, [-1], false);
						break;
					case 'Reset':
						timerCnt=0;
						// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
						if(firstElemNumber!=-1){
							api.getData( firstPage ).then( function ( dataPages0 ) {
				            	if(firstElemNumber=dataPages0[0].qMatrix[0][0].qState=="S" && i!=0)
				            		firstElemNumber=dataPages0[0].qMatrix[1][0].qElemNumber;
				            	else if((firstElemNumber=dataPages0[0].qMatrix[0][0].qState=="S" && i==0))
				            		firstElemNumber=dataPages0[0].qMatrix[0][0].qElemNumber;
				            	else
				            		firstElemNumber=dataPages0[0].qMatrix[0][0].qElemNumber;
			            		api.selectValues(0, [firstElemNumber], false);
								i=0;
			            	});
						}
						break;
					case 'forward':
						timerCnt=0;
						i++;
						if(i>=maxCnt)
							i=0;
						api.getData( nextPage ).then( function ( dataPages1 ) {
			            	nextDataElemNumber=dataPages1[0].qMatrix[0][0].qElemNumber;
							api.selectValues(0, [nextDataElemNumber], false);
				        });
						break;
					case 'back':
						timerCnt=0;
						i--;
						if(i<0)
							i=maxCnt-1;
						// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
						api.getData( prevPage ).then( function ( dataPages2 ) {
			            	prevDataElemNumber=dataPages2[0].qMatrix[0][0].qElemNumber;
			            	api.selectValues(0, [prevDataElemNumber], false);
			            });
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
											api.getData( nextPage ).then( function ( dataPages1 ) {
								            	nextDataElemNumber=dataPages1[0].qMatrix[0][0].qElemNumber;
												api.selectValues(0, [nextDataElemNumber], false);
									        });
										},layout.interval);
							timerCnt=maxCnt-1;
						}
						else
						{
							alert("animation stopped");
							i++;
							if(i>=maxCnt)
								i=0;
							// app.field(layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]).select([i], false, false);
							api.getData( nextPage ).then( function ( dataPages1 ) {
				            	nextDataElemNumber=dataPages1[0].qMatrix[0][0].qElemNumber;
								api.selectValues(0, [nextDataElemNumber], false);
					        });
							stopFlag=true;
							timerCnt=0;
						}
					break;
				}
			});
		}
	};
});
