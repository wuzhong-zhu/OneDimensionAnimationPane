define(["jquery", "text!./animationpane.css","qlik","text!./angular-progress.js"], function($, cssContent,qlik,ProgressBar ) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");
	var pause = 2;
	var i=0,timerCnt=0,i2=0;
	var stopFlag=false;
	var reverse=false;
	var varmaxCnt=0;
	var maxCnt=0;

	var html2 = "";
	var html = "";
	//

	// var bar = new ProgressBar.Line(container, {
	//   strokeWidth: 4,
	//   easing: 'easeInOut',
	//   duration: 1400,
	//   color: '#FFEA82',
	//   trailColor: '#eee',
	//   trailWidth: 1,
	//   svgStyle: {width: '100%', height: '100%'}
	// });
	//
	// bar.animate(1.0);  // Number from 0.0 to 1.0



	function createBtn(cmd, text, icon) {
		return '<button class="lui-button" data-cmd="' + cmd + '" title="' + text + '"><span class="lui-button__icon  lui-icon  lui-icon--' + icon + '"></span></button>';
	};

	function htmlDraw(reverse2,pause2,timerCnt2,maxCnt2,varmaxCnt2,i2) {
		//html += layout.qListObject.qDimensionInfo.qGroupFieldDefs[0];
				// html += " | "+mydimTextValue;
				console.log(reverse2,pause2,timerCnt2,maxCnt2,varmaxCnt2,i2);
				console.log(Math.round((i2/ (maxCnt2-1))))
				html = "";
				html += '<div class="lui-buttongroup">';
				html += "<div class='barcode' style='width:" + Math.round((i2/ (maxCnt2-1)*176)) + "px; background-color:#1580dd; height:3px; padding:1px; margin:1px;'></div>";
				html += '</div><br>'
				html += '<div class="lui-buttongroup">';
				html += createBtn("Clear", "Clear", "clear-selections");
				html += createBtn("Reset", "Reset", "selections-reload");
				//html += '</div>&nbsp;<div class="lui-buttongroup">';
				if(timerCnt2==0 && pause2==2) {
					html += createBtn("play", "Play", "triangle-right lui-fade-button--success");
						}
						else {
							if(pause2==1) {
								html += createBtn("play", "Continue", "triangle-right lui-fade-button--warning");
										}
										else {
											html += createBtn("play", "Pause", "close lui-fade-button--warning");
										}
								}
				if(reverse2==false) {
						html += createBtn("reverse", "Play ascending","close lui-icon--ascending");
						}
						else {
						html += createBtn("reverse", "Play descending","close lui-icon--descending");
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
            var prevDataElemNumber,nextDataElemNumber,firstElemNumber,dummyElem;
									var samePage = [{
													qTop: currentIndex,
													qLeft: 0,
													qWidth: 1,
													qHeight: 1
									}];
									var nextPage = [{
			                    qTop: i+1,
			                    qLeft: 0,
			                    qWidth: 1,
			                    qHeight: 1
			            }];
			            var prevPage = [{
			                    qTop: i-1,
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

						var html2 = ""
						html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
						// console.log("html =" + html);
						// console.log(html2);
						$element.html(html2);

						$element.find('button').on('qv-activate', function() {
							switch($(this).data('cmd')) {
								case 'Clear':
									stopFlag=true;
									timerCnt=0;
									i=0;
									pause=2;
									html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
									$element.html(html2);
									api.selectValues(0, [-1], false);
									break;

								case 'Reset':
									stopFlag=true;
									i=0;
									pause =2
									timerCnt = 0;
									html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
									$element.html(html2);
									api.selectValues(0, [i], false);
									break;

								case 'forward':
									stopFlag=true;
									i++;
									pause = 1;
									timerCnt = 0;
									if(i>=maxCnt) {
										i=0;
									}
										html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
										$element.html(html2);
										api.selectValues(0, [i], false);
									break;

								case 'back':
									stopFlag=true;
									i--;
									pause = 1;
									timerCnt = 0;
									if(i<0) {
										i=maxCnt-1;
									}
										html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
										$element.html(html2);
										api.selectValues(0, [i], false);
									break;

									case 'forward10':
										stopFlag=true;
										i=i+10;
										pause = 1;
										timerCnt = 0;
										if(i>=maxCnt) {
											i=0;
										}
											html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
											$element.html(html2);
											api.selectValues(0, [i], false);
										break;

									case 'back10':
										stopFlag=true;
										i=i-10;
										pause = 1;
										timerCnt = 0;
										if(i<0) {
											i=maxCnt-1;
										}
											html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
											$element.html(html2);
											api.selectValues(0, [i], false);
										break;

								case 'play':
									if(timerCnt==0)
									{
										if(pause==2 && reverse == false) {
										i = 0;
										varmaxCnt = (maxCnt-1);
										}
										else {
											if(pause==2 && reverse == true) {
												i = (maxCnt-1);
												varmaxCnt = maxCnt -1;
												}
										}
										if(pause==1 && reverse == false) {
										varmaxCnt = (maxCnt-1 - i);
										}
										else {
											if(pause==1 && reverse == true) {
												varmaxCnt = i;
											}
										}
										html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
										$element.html(html2);
										pause=0;
										stopFlag=false;
  									api.getData( nextPage ).then( function ( dataPages1 ) {
										api.selectValues(0, [i], false);
										console.log("update button loop");
													});
//													};
										timerCnt=varmaxCnt;
									}
									else
									{
										pause=1;
										stopFlag=true;
										html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
										$element.html(html2);
									}
								break;

								case 'reverse':
									if(reverse==false) {
											reverse=true;
										}
									else {
											reverse=false;
										}
									if(pause==0) {
											pause=1;
											}
											timerCnt = 0;
											stopFlag=true;
											console.log("update reverse");
											//api.selectValues(0, [i], false);
											html2 = htmlDraw(reverse,pause,timerCnt,maxCnt,varmaxCnt,i);
											$element.html(html2);
											api.selectValues(0, [i], false);
								break;
							}
						});

						if(timerCnt>0)
						{
							setTimeout(	function() {
											if(stopFlag==false)
											{
												if(reverse==false) {
												i++;
												api.getData( nextPage ).then( function ( dataPages2 ) {
													api.selectValues(0, [i], false);
														});
												}
												else {
												i--;
												api.getData( prevPage ).then( function ( dataPages3 ) {
													api.selectValues(0, [i], false);
														});
												}
												console.log("update egen loop")
											}
											else {
												api.selectValues(0, [i], false);
												timerCnt = 0;
											}

										},layout.interval);
							timerCnt--;
							if(timerCnt==0)
								pause=2;
						}
						return qlik.Promise.resolve();
					}
				};
			});
