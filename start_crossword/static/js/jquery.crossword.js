(function($){
	$.fn.crossword = function(entryData) {
			window.onerror = null;
			var puzz = {};
			puzz.data = entryData;
			var tbl = ['<table id="puzzle">'],
			    puzzEl = this,
				clues = $('#puzzle-clues'),
				clueLiEls,
				coords,
				entryCount = puzz.data.length,
				entries = [],
				rows = [],
				cols = [],
				solved = new Set(),
				solvedFlag = false,
				tabindex,
				$actives,
				activePosition = 0,
				activeClueIndex = 0,
				currOri,
				targetInput,
				mode = 'interacting',
				solvedToggle = false,
				z = 0;

			var puzInit = {
				init: function() {
					currOri = 'across';
					puzz.data.sort(function(a,b) {
						return a.position - b.position;
					});
					puzzEl.delegate('input', 'keyup', function(e){
						mode = 'interacting';
						switch(e.which) {
							case 39:
							case 37:
								currOri = 'across';
								break;
							case 38:
							case 40:
								currOri = 'down';
								break;
							default:
								break;
						}

						if ( e.keyCode === 9) {
							return false;
						} else if (
							e.keyCode === 37 ||
							e.keyCode === 38 ||
							e.keyCode === 39 ||
							e.keyCode === 40 ||
							e.keyCode === 8 ||
							e.keyCode === 46 ) {



							if (e.keyCode === 8 || e.keyCode === 46) {
								currOri === 'across' ? nav.nextPrevNav(e, 37) : nav.nextPrevNav(e, 38);
							} else {
								nav.nextPrevNav(e);
							}

							e.preventDefault();
							return false;
						} else {


							puzInit.checkAnswer(e);

						}

						e.preventDefault();
						return false;
					});
					puzzEl.delegate('input', 'keydown', function(e) {

						if ( e.keyCode === 9) {

							mode = "setting ui";
							if (solvedToggle) solvedToggle = false;

							puzInit.checkAnswer(e)
							nav.updateByEntry(e);

						} else {
							return true;
						}

						e.preventDefault();

					});
					puzzEl.delegate('input', 'click', function(e) {
						mode = "setting ui";
						if (solvedToggle) solvedToggle = false;



						nav.updateByEntry(e);
						e.preventDefault();

					});
					clues.delegate('li', 'click', function(e) {
						mode = 'setting ui';

						if (!e.keyCode) {
							nav.updateByNav(e);
						}
						e.preventDefault();
					});
					puzzEl.delegate('#puzzle', 'click', function(e) {
						$(e.target).focus();
						$(e.target).select();
					});
					puzInit.calcCoords();
					clueLiEls = $('#puzzle-clues li');
					$('#' + currOri + ' li' ).eq(0).addClass('clues-active').focus();
					puzInit.buildTable();
					puzInit.buildEntries();

				},
				calcCoords: function() {
					for (var i = 0, p = entryCount; i < p; ++i) {
						entries.push(i);
						entries[i] = [];

						for (var x=0, j = puzz.data[i].answer.length; x < j; ++x) {
							entries[i].push(x);
							coords = puzz.data[i].orientation === 'across' ? "" + puzz.data[i].startx++ + "," + puzz.data[i].starty + "" : "" + puzz.data[i].startx + "," + puzz.data[i].starty++ + "" ;
							entries[i][x] = coords;
						}
						$('#' + puzz.data[i].orientation).append('<li tabindex="1" data-position="' + i + '">' + puzz.data[i].clue + '</li>');
					}
					for (var i = 0, p = entryCount; i < p; ++i) {
						for (var x=0; x < entries[i].length; x++) {
							cols.push(entries[i][x].split(',')[0]);
							rows.push(entries[i][x].split(',')[1]);
						};
					}

					rows = Math.max.apply(Math, rows) + "";
					cols = Math.max.apply(Math, cols) + "";

				},

				buildTable: function() {
					for (var i=1; i <= rows; ++i) {
						tbl.push("<tr>");
							for (var x=1; x <= cols; ++x) {
								tbl.push('<td data-coords="' + x + ',' + i + '"></td>');
							};
						tbl.push("</tr>");
					};

					tbl.push("</table>");
					puzzEl.append(tbl.join(''));
				},

				buildEntries: function() {
					var puzzCells = $('#puzzle td'),
						light,
						$groupedLights,
						hasOffset = false,
						positionOffset = entryCount - puzz.data[puzz.data.length-1].position; // diff. between total ENTRIES and highest POSITIONS

					for (var x=1, p = entryCount; x <= p; ++x) {
						var letters = puzz.data[x-1].answer.split('');

						for (var i=0; i < entries[x-1].length; ++i) {
							light = $(puzzCells +'[data-coords="' + entries[x-1][i] + '"]');
							if(x > 1 ){
								if (puzz.data[x-1].position === puzz.data[x-2].position) {
									hasOffset = true;
								};
							}

							if($(light).empty()){
								$(light)
									.addClass('entry-' + (hasOffset ? x - positionOffset : x) + ' position-' + (x-1) )
									.append('<input maxlength="1" val="" type="text" tabindex="-1" />');
							}
						};

					};
					for (var i=1, p = entryCount; i < p; ++i) {
						$groupedLights = $('.entry-' + i);
						if(!$('.entry-' + i +':eq(0) span').length){
							$groupedLights.eq(0)
								.append('<span>' + puzz.data[i].position + '</span>');
						}
					}

					util.highlightEntry();
					util.highlightClue();
					$('.active').eq(0).focus();
					$('.active').eq(0).select();

				},

				checkAnswer: function(e) {
					var valToCheck, currVal;
					util.getActivePositionFromClassGroup($(e.target));
					valToCheck = puzz.data[activePosition].answer.toLowerCase();
					currVal = $('.position-' + activePosition + ' input')
						.map(function() {
					  		return $(this)
								.val()
								.toLowerCase();
						})
						.get()
						.join('');

					if(valToCheck === currVal){
						$('.active')
							.addClass('done')
							.removeClass('active');

						$('.clues-active').addClass('clue-done');

						solved.add(valToCheck);
						solvedToggle = true;
						if(solved.size == puzz.data.length  && !solvedFlag){
                            console.log("==");
                            solvedFlag = true;
                            send_result();
                            return;
                        }

						return;
					}
					else{
                        $('.active').removeClass('done');
                        $('.clues-active').removeClass('clue-done');
					}

					currOri === 'across' ? nav.nextPrevNav(e, 39) : nav.nextPrevNav(e, 40);
				}


			};


			var nav = {

				nextPrevNav: function(e, override) {

					var len = $actives.length,
						struck = override ? override : e.which,
						el = $(e.target),
						p = el.parent(),
						ps = el.parents(),
						selector;

					util.getActivePositionFromClassGroup(el);
					util.highlightEntry();
					util.highlightClue();

					$('.current').removeClass('current');

					selector = '.position-' + activePosition + ' input';
					switch(struck) {
						case 39:
							p
								.next()
								.find('input')
								.addClass('current')
								.select();

							break;

						case 37:
							p
								.prev()
								.find('input')
								.addClass('current')
								.select();

							break;

						case 40:
							ps
								.next('tr')
								.find(selector)
								.addClass('current')
								.select();

							break;

						case 38:
							ps
								.prev('tr')
								.find(selector)
								.addClass('current')
								.select();

							break;

						default:
						break;
					}

				},

				updateByNav: function(e) {
					var target;

					$('.clues-active').removeClass('clues-active');
					$('.active').removeClass('active');
					$('.current').removeClass('current');
					currIndex = 0;

					target = e.target;
					activePosition = $(e.target).data('position');

					util.highlightEntry();
					util.highlightClue();

					$('.active').eq(0).focus();
					$('.active').eq(0).select();
					$('.active').eq(0).addClass('current');

					currOri = $('.clues-active').parent('ol').prop('id');

					activeClueIndex = $(clueLiEls).index(e.target);

				},

				updateByEntry: function(e, next) {
					var classes, next, clue, e1Ori, e2Ori, e1Cell, e2Cell;

					if(e.keyCode === 9 || next){
						activeClueIndex = activeClueIndex === clueLiEls.length-1 ? 0 : ++activeClueIndex;

						$('.clues-active').removeClass('.clues-active');

						next = $(clueLiEls[activeClueIndex]);
						currOri = next.parent().prop('id');
						activePosition = $(next).data('position');

						util.getSkips(activeClueIndex);
						activePosition = $(clueLiEls[activeClueIndex]).data('position');


					} else {
						activeClueIndex = activeClueIndex === clueLiEls.length-1 ? 0 : ++activeClueIndex;

						util.getActivePositionFromClassGroup(e.target);

						clue = $(clueLiEls + '[data-position=' + activePosition + ']');
						activeClueIndex = $(clueLiEls).index(clue);

						currOri = clue.parent().prop('id');

					}

						util.highlightEntry();
						util.highlightClue();

						//$actives.eq(0).addClass('current');

				}

			};


			var util = {
				highlightEntry: function() {
					$actives = $('.active');
					$actives.removeClass('active');
					$actives = $('.position-' + activePosition + ' input').addClass('active');
					$actives.eq(0).focus();
					$actives.eq(0).select();
				},

				highlightClue: function() {
					var clue;
					$('.clues-active').removeClass('clues-active');
					$(clueLiEls + '[data-position=' + activePosition + ']').addClass('clues-active');

					if (mode === 'interacting') {
						clue = $(clueLiEls + '[data-position=' + activePosition + ']');
						activeClueIndex = $(clueLiEls).index(clue);
					};
				},

				getClasses: function(light, type) {
					if (!light.length) return false;

					var classes = $(light).prop('class').split(' '),
					classLen = classes.length,
					positions = [];
					for(var i=0; i < classLen; ++i){
						if (!classes[i].indexOf(type) ) {
							positions.push(classes[i]);
						}
					}

					return positions;
				},

				getActivePositionFromClassGroup: function(el){

						classes = util.getClasses($(el).parent(), 'position');

						if(classes.length > 1){
							e1Ori = $(clueLiEls + '[data-position=' + classes[0].split('-')[1] + ']').parent().prop('id');
							e2Ori = $(clueLiEls + '[data-position=' + classes[1].split('-')[1] + ']').parent().prop('id');
							e1Cell = $('.position-' + classes[0].split('-')[1] + ' input').index(el);
							e2Cell = $('.position-' + classes[1].split('-')[1] + ' input').index(el);

							if(mode === "setting ui"){
								currOri = e1Cell === 0 ? e1Ori : e2Ori;
							}

							if(e1Ori === currOri){
								activePosition = classes[0].split('-')[1];
							} else if(e2Ori === currOri){
								activePosition = classes[1].split('-')[1];
							}
						} else {
							activePosition = classes[0].split('-')[1];
						}


				},

				getSkips: function(position) {
					if ($(clueLiEls[position]).hasClass('clue-done')  && !solvedFlag){
						activeClueIndex = position === clueLiEls.length-1 ? 0 : ++activeClueIndex;
						util.getSkips(activeClueIndex);
					} else {
						return false;
					}
				}

			};
			puzInit.init();
	}
})(jQuery);