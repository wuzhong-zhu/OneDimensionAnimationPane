define(["jquery", "text!./animationpane.css","qlik"], function($, cssContent,qlik ) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");

	var startFlag=true;
	var i=0,timerCnt=0;
	var stopFlag=false;
	var reverseFlag=false;
	var varmaxCnt=0;
	var maxCnt=0;

	function createBtn(cmd, text, icon) {
		return '<button class="lui-button" data-cmd="' + cmd + '" title="' + text + '"><span class="lui-button__icon  lui-icon  lui-icon--' + icon + '"></span></button>';
	};

	function htmlDraw(reverseFlag,startFlag,stopFlag,maxCnt,i) {
				// console.log("Redrawing html")
				var html = "";
				html += '<div class="lui-buttongroup">';
				html += "<div class='test' style='width:170px; background-color:rgb(245, 245, 245); height:4px;border:1px;border-style:solid;border-color:rgb(175, 175, 175);'>";
				html += "<div class='barcode' style='width:" + Math.round((i/ (maxCnt-1)*170)) + "px; background-color:rgb(91, 192, 222); height:4px;'></div>";
				html += '</div></div></div><br>'
				html += '<div class="lui-buttongroup">';
				html += createBtn("Clear", "Clear", "clear-selections");
				html += createBtn("Reset", "Reset", "selections-reload");
				if(startFlag==true) {
					html += createBtn("play", "Play", "triangle-right lui-fade-button--success");
						}
						else {
							if(stopFlag==true) {
								html += createBtn("play", "Continue", "triangle-right lui-fade-button--warning");
										}
										else {
											html += createBtn("play", "startFlag", "close lui-fade-button--warning");
										}
								}
				if(reverseFlag==false) {
						html += createBtn("reverseFlag", "Play ascending","close lui-icon--ascending");
						}
						else {
						html += createBtn("reverseFlag", "Play descending","close lui-icon--descending");
								}
				html += '</div>';
				html += '<div class="lui-buttongroup">';
				html += createBtn("back10", "Prev 10", "arrow-left lui-fade-button--warning");
				html += createBtn("back", "Previous", "arrow-left");
				html += createBtn("forward", "Next", "arrow-right");
				html += createBtn("forward10", "Next 10", "arrow-right lui-fade-button--warning");
				html += '</div>';
				return html;
	};

	function updateIndex(i) {
		var returnPage;
				 returnPage = [{
								 qTop: i,
								 qLeft: 0,
								 qWidth: 1,
								 qHeight: 1
				 }];
				 return returnPage;
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
			//Opens currApp and get key variables
			var app = qlik.currApp(this);
			var api = this.backendApi;
			var maxCnt=layout.qListObject.qDimensionInfo.qCardinal;
			var data=	 layout.qListObject.qDataPages[0].qMatrix;
			var dataElemNumber;

						$element.html( htmlDraw(reverseFlag,startFlag,stopFlag,maxCnt,i));

						if(timerCnt>0)
							{
								setTimeout(	function() {
												if(stopFlag==false)
												{
													if(timerCnt==1) {
														startFlag=true;
													}
													if(reverseFlag==false) {
													i++;
													}
													else {
													i--;
												  }
													api.getData( updateIndex(i) ).then( function ( dataPages ) {
										        dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
														api.selectValues(0, [dataElemNumber], false);
											        });
												}
												else {
													timerCnt = 0;
													api.getData( updateIndex(i) ).then( function ( dataPages ) {
														dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
														api.selectValues(0, [dataElemNumber], false);
													});
													$element.html( htmlDraw(reverseFlag,startFlag,stopFlag,timerCnt,maxCnt,varmaxCnt,i));
												}
											},layout.interval);
								timerCnt--;
								}

						$element.find('button').on('qv-activate', function() {
							switch($(this).data('cmd')) {
								case 'Clear':
									stopFlag=true;
									timerCnt=0;
									i=0;
									startFlag=true;
									api.selectValues(0, [-1], false);
									break;

								case 'Reset':
									stopFlag=true;
									i=0;
									timerCnt = 0;
									startFlag =true;
									api.getData( updateIndex(i) ).then( function ( dataPages ) {
						            	dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
													api.selectValues(0, [dataElemNumber], false);
												});
									break;

								case 'forward':
									stopFlag=true;
									i++;
									startFlag = false;
									timerCnt = 0;
									if(i>=maxCnt) {
										i=0;
									}
									api.getData( updateIndex(i) ).then( function ( dataPages ) {
						            	dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
													api.selectValues(0, [dataElemNumber], false);
							        });
									break;

								case 'back':
									stopFlag=true;
									i--;
									startFlag = false;
									timerCnt = 0;
									if(i<0) {
										i=maxCnt-1;
									}
									api.getData( updateIndex(i) ).then( function ( dataPages ) {
						            	dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
													api.selectValues(0, [dataElemNumber], false);
							        });
									break;

								case 'forward10':
										stopFlag=true;
										i=i+10;
										startFlag = false;
										timerCnt = 0;
										if(i>=maxCnt) {
											i=0;
										}
										api.getData( updateIndex(i) ).then( function ( dataPages ) {
							            	dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
														api.selectValues(0, [dataElemNumber], false);
								        });
										break;

								case 'back10':
										stopFlag=true;
										i=i-10;
										startFlag = false;
										timerCnt = 0;
										if(i<0) {
											i=maxCnt-1;
										}
										api.getData( updateIndex(i) ).then( function ( dataPages ) {
							            	dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
														api.selectValues(0, [dataElemNumber], false);
								        });
										break;

								case 'play':
										if(timerCnt==0)
										{
											if(startFlag==true && reverseFlag==false) {
											i = 0;
											varmaxCnt = (maxCnt-1);
											}
											else {
												if(startFlag==true && reverseFlag == true) {
													i = (maxCnt-1);
													varmaxCnt = maxCnt -1;
													}
											}
											if(startFlag==false && reverseFlag == false) {
											varmaxCnt = (maxCnt-1 - i);
											}
											else {
												if(startFlag==false && reverseFlag == true) {
													varmaxCnt = i;
												}
											}
											startFlag=false;
											stopFlag=false;
											console.log("play start")
											api.getData( updateIndex(i) ).then( function ( dataPages ) {
								            	dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
															api.selectValues(0, [dataElemNumber], false);
									        });
											timerCnt=varmaxCnt;
											}
										else
											{
											stopFlag=true;
											api.getData( updateIndex(i) ).then( function ( dataPages ) {
															dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
															api.selectValues(0, [dataElemNumber], false);
													});
											}
									break;

								case 'reverseFlag':
									if(reverseFlag==false) {
											reverseFlag=true;
										}
									else {
											reverseFlag=false;
										}
									if(startFlag==false && stopFlag==false) {
										stopFlag=true;
										timerCnt = 0;
											}
											console.log("update reverseFlag");
											api.getData( updateIndex(i) ).then( function ( dataPages ) {
															dataElemNumber=dataPages[0].qMatrix[0][0].qElemNumber;
															api.selectValues(0, [dataElemNumber], false);
													});
								break;
							}
						});
					}
	};
});
