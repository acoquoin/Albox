/*!
 * Albox (Another Lightbox) - jQuery Modal
 *
 * @license The MIT License
 * Copyright (c) 2013-* Alban COQUOIN acoquoin@gmail.com
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

(function($) {

	// Validator (JSHint - http://www.jshint.com/)
	/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, jquery:true, indent:4, maxerr:50 */
	'use strict';

	// Global var declaration
	var $albox = null;

	// Stacking
	var Albox = function(settings, mode) {
		// Steps mode, okay assign some datas
		if(false === $.isEmptyObject(settings.steps)) {
			mode = 'steps';
			settings.stepsKeys = Object.keys(settings.steps);
			if('number' === typeof settings.current) {
				settings.current = Math.min(Math.max(settings.current - 1, 1), settings.items.length);
			} else {
				settings.current = Math.max($.inArray(settings.current, settings.stepsKeys), 0);
			}
		}
		// Init
		this.init($.extend(settings, {mode: mode}));
		// Assigndifferent callback
		if('object' === typeof settings.callbacks) {
			for(var i in settings.callbacks) {
				if('undefined' === typeof this.settings.context[i]) {
					this.settings.context[i] = settings.callbacks[i];
				}
			}
		}
	};

	// List of Albox
	Albox.stack = [];
	
	// Current instance
	Albox.instance = [];

	// adding from stack
	Albox.push = function(instance) {
		Albox.stack.unshift(instance);
		Albox.instance = instance;
	};

	// Removing from stack
	Albox.pop = function(instance) {
		Albox.stack.shift(instance);
		Albox.instance = Albox.stack[0] || null;
		$albox = $.albox.content();
	};

	// Rewrite config
	Albox.config = function(settings) {
		AlboxSettings = settings;
	};

	// Default Settings
	Albox.settings = {
		mode: 'html',
		context: $('body'),
		append: 'body',
		title: '',
		description: '',
		url: null,
		content: null,
		get: {},
		post: {},
		crossDomain: false,
		//keyboard: true,
		current: null,
		steps: {},
		items: [],
		stepsKeys: [],
		locale: {
			close: 'close',
			previous: '&lsaquo; previous',
			next: 'next &rsaquo;',
			error: 'An error has occured !',
			autoClose: 'Automatically close in <x> <second|seconds>.'
		},
		//overlay: '.5',
		//speed: 200,
		close: true,
		skin: 'default',
		height: 'auto',
		width: 'auto',
		minWidth: 420,
		margin: 30,
		button: {},
		zoom: false,
		afterShow: $.noop,
		beforeLoad: $.noop,
		afterLoad: $.noop,
		beforeClose: $.noop,
		afterClose: $.noop,
		beforePos: $.noop,
		afterPos: $.noop,
		beforeNextStep: $.noop,
		beforePrevStep: $.noop,
		afterStepLoad: $.noop,
		callbacks: {}
	};

	/**
	 * Albox.prototype
	 * Albox main code
	 * @core
	 */
	Albox.prototype = {
		// Init
		init: function(settings) {
			// Ref
			var $this = this;
			// Stack this instance
			Albox.push(this);
			// Extend settings
			this.settings = $.extend({}, Albox.settings, settings || {});
			// Callback beforeLoad
			this.settings.beforeLoad();
			
			
			
			
			//Generate HTML box et append it
			var render = '<div class="albox ' + this.settings.skin + '">';
			render += '<div data-albox="overlay"></div>';
			render += '<div data-albox="loading"></div>';
			render += '<div data-albox="box" data-albox-mode="' + this.settings.mode + '">';
			render += '<div data-albox="header">';
			render += '<button data-albox="close" type="button">&times;</button>';
			render += '<h3 data-albox="title">' + this.settings.title + '</h3>';
			render += '</div>';
			render += '<div data-albox="content"></div>';
			render += '<div data-albox="footer">';
			render += '<span data-albox="count"></span>';
			render += '<a href="#" data-albox="prev" class="disabled"></a>';
			render += '<a href="#" data-albox="next" class="disabled"></a>';
			render += '</div>';
			render += '</div>';
			render += '</div>';
			
			
			
			
			
			this.$content = $(render)
				.appendTo(this.settings.append)
				.css('z-index', 1E5 + Albox.stack.length * 1E4)
				.find('[data-albox=overlay]')
					.hide()
					.css('z-index', 1E5 + Albox.stack.length * 1E4 + 1)
					.fadeIn(200, function() {
						$this.reveal();
					})
					.end()
				.find('[data-albox=box]')
					.css('z-index', 1E5 + Albox.stack.length * 1E4 + 2)
					.end()
				.find('[data-albox=loading]')
					.css('z-index', 1E5 + Albox.stack.length * 1E4 + 3)
					.end();
			// Bootstrap compatible
			if('bootstrap' === this.settings.skin) {
				this.$content
					.find('[data-albox=box]').addClass('modal').end()
					.find('[data-albox=header]').addClass('modal-header').end()
					.find('[data-albox=close]').addClass('close').end()
					.find('[data-albox=content]').addClass('modal-body').end()
					.find('[data-albox=footer]').addClass('modal-footer').end()
					.find('[data-albox=count]').addClass('muted').end()
					.find('[data-albox=prev]').addClass('btn btn-small pull-left').end()
					.find('[data-albox=next]').addClass('btn btn-small pull-right');
			}
			// Assign global var $albox
			$albox = $.albox.content();
			// Hide controls
			this.$content.find('[data-albox=content], [data-albox=footer], [data-albox=close], [data-albox=title]').css('visibility', 'hidden');

			this.safeContentPosition();

			// Allow or disallow to close box ?
			if(true === this.settings.close) {
				this.$content.on('click', '[data-albox=overlay], [data-albox=close]', function() {
					$this.close();
				});
			} else {
				this.$content.find('[data-albox=close]').remove();
			}
			// Button options ? Okay, make it
			if(false === $.isEmptyObject(this.settings.button)) {
				this.$content.find('[data-albox=footer]').html('');
				$.each(this.settings.button, function(index, value) {
					var button = $('<button />').attr({
						name: index,
						id: value.id,
						'class': ('bootstrap' === $this.settings.skin ? 'btn ' : '') + (value['class'] || '')
					});
					button.text(value.text);
					$this.$content.find('[data-albox=footer]').append(button);
				});
				// Call for button
				this.$content.find('[data-albox=footer] button').on('click', function() {
					$this.settings.button[$(this).attr('name')].call();
				});
			}
			// Image / Step mode
			if(('image' === this.settings.mode && this.settings.items.length > 1) || 'steps' === this.settings.mode) {
				// Button callbacks
				this.$content
					.find('[data-albox=prev]')
						.html(this.settings.locale.previous)
						.on('click', function() {
							if(false === $(this).hasClass('disabled')) {
								if('steps' === $this.settings.mode) {
									if(false !== $this.settings.beforePrevStep($this.settings.stepsKeys[$this.settings.current], $this.settings.current + 1)) {
										$this.steps($this.settings.current - 1);
									}
								} else {
									$this.gallery($this.settings.current - 1);
								}
							}
						})
						.end()
					.find('[data-albox=next]')
						.html(this.settings.current < this.settings.items.length - 1 ? this.settings.locale.next : this.settings.locale.close)
						.removeClass('disabled')
						.on('click', function() {
							if(false === $(this).hasClass('disabled')) {
								if('steps' === $this.settings.mode) {
									if(false !== $this.settings.beforeNextStep($this.settings.stepsKeys[$this.settings.current], $this.settings.current + 1)) {
										if($(this).text() === $this.settings.locale.close) {
											$this.close();
										} else {
											$this.steps($this.settings.current + 1);
										}
									}
								} else {
									if($(this).text() === $this.settings.locale.close) {
										$this.close();
									} else {
										$this.gallery($this.settings.current + 1);
									}
								}
							}
						})
						.end();
			} else {
				if(true === $.isEmptyObject(this.settings.button)) {
					this.$content.find('[data-albox=footer]').html('');
				}
				if('image' === this.settings.mode && this.settings.items.length === 0) {
					this.$content.find('[data-albox=footer]').remove();
				}
			}
			this.realSize = this.realSpace();
		},
		// Steps navigation
		steps: function(index) {
			// Display controls ?
			if('steps' === this.settings.mode && index >= 0 && index < this.settings.stepsKeys.length) {
				// Ref
				var $this = this;
				// Okay, step > 1
				if(index > 0) {
					this.$content.find('[data-albox=prev]').removeClass('disabled');
				} else {
					this.$content.find('[data-albox=prev]').addClass('disabled');
				}
				// Step < max
				this.$content
					.find('[data-albox=next]')
						.html(index < this.settings.stepsKeys.length - 1 ? this.settings.locale.next : this.settings.locale.close)
						.removeClass('disabled');
				// Change counter and paginate
				this.settings.current = index;
				this.$content.find('[data-albox=count]').html((index + 1) + ' / ' + this.settings.stepsKeys.length);
				// Display next or prev step
				$albox
					.width(this.settings.width)
					.height(this.settings.height)
					.find('#' + this.settings.stepsKeys.join(', #'))
						.hide()
						.end()
					.find('#' + this.settings.stepsKeys[index])
						.show();
				// Callback
				this.settings.afterStepLoad(this.settings.stepsKeys[index], index + 1);
				// Hide all children
				$albox.find('> *').fadeTo(0, 0);
				// Move to re-center
				this.position(function() {
					// Change title
					$this.title(null, $this.settings.steps[Albox.instance.settings.stepsKeys[index]]);
					// Reveal
					$albox.find('> *').fadeTo(200, 1, function() {
						//Callback
						$this.settings.afterShow($this.settings.stepsKeys[index], index + 1);
					});
				});
			}
		},
		// Gallery navigation
		gallery: function(index) {
			// Okay, picture not out of range
			if(index >= 0 && index < this.settings.items.length) {
				// Ref
				var $this = this;
				// Pagination
				$this.settings.current = index;
				$this.$content.find('[data-albox=close]').hide();
				$this.reveal();
			}
		},
		// Hide the main loading animation
		loading: function() {
			this.$content.find('[data-albox=loading]').toggle(0);
			return this;
		},
		// Change title and subtitle
		title: function(title, subtitle) {
			if(arguments.length > 0) {
				this.$content.find('[data-albox=title]')
					.html((title || this.settings.title) + ('undefined' !== typeof subtitle && subtitle.length > 0 ? '<span>' + subtitle + '</span>' : ''));
			}
			return this.$content.find('[data-albox=title]');
		},
		
		displayInfo: function(display) {
			if('show' === display) {
				this.$content.find('[data-albox=close]' + (this.title().text().length > 0 ? ', [data-albox=title]' : '')).fadeIn(200);
			} else {
				this.$content.find('[data-albox=close], [data-albox=title]').fadeOut(200);
			}
		},
		
		// Open in window.open on picture's zooming
		zoomable: function(enable) {
			if(true === enable && true === this.settings.zoom) {
				// Ref
				var $this = this;
				// Okay, we can zoom in it
				$albox.find('img').css('cursor', 'pointer').on('click', function() {
					window.open($this.settings.url);
				});
			}
		},

		// Close Albox
		close: function(callback) {
			// Assign this
			var $this = this;
			// Ensure we can close modal
			if(false === this.$content.find('[data-albox=loading]').is(':visible')) {
				// Callback
				this.settings.beforeClose();
				// Hide box
				this.$content.find('[data-albox=box]').fadeOut(200, function() {
					//Hide Albox
					$this.$content.fadeOut(200, function() {
						// Remove node
						$(this).remove();
						// Callback
						$this.settings.afterClose();
						// Personal callbacks
						if('object' === typeof $this.settings.callbacks){
							for(var i in $this.settings.callbacks) {
								if('undefined' !== typeof $this.settings.context[i]){
									// Destroy it !
									$($this.settings.context).removeData($this.settings.callbacks[i]);
								}
							}
						}
						// Pop from stack
						Albox.pop();
						// Internal callback
						if('function' === typeof callback) {
							callback();
						}
					});
					
				});
			}
		},
		safeContentPosition: function() {
			this.$content.css({
				width: $(window).width() - parseInt(this.settings.margin, 10),
				height: $(window).height() - parseInt(this.settings.margin, 10),
				left: parseInt(this.settings.margin / 2, 10) + 'px',
				top: parseInt(this.settings.margin / 2, 10) + 'px'
			});
		},
		// Max allowed size
		safeSize: function(element, prev) {
			var width, height;
			$albox.css('display', 'inline-block').height('').width('');
			this.realSize = this.realSpace();
			width = Math.min(this.realSize.maxWidth, Math.max(('auto' === this.settings.width ? $albox.outerWidth() : parseInt(this.settings.width, 10)), parseInt(this.settings.minWidth, 10)));
			$albox.css('display', 'block').width(width - this.realSize.width);
			height = Math.min(this.realSize.maxHeight, ('auto' === this.settings.height ? $albox.outerHeight(true) + this.realSize.delta : parseInt(this.settings.height, 10)));
			if(height > this.realSize.maxHeight) {
				height = 'auto';
			}
			return {
				'width': width,
				'height': height
			};
		},
		// realSpace
		realSpace: function() {
			var height = $albox.outerHeight(true) - $albox.height();
			var width = $albox.outerWidth(true) - $albox.width();
			var outerHeight = 0;
			this.$content.find('[data-albox=box] > *:not([data-albox=content])').each(function() {
				outerHeight += $(this).outerHeight(true);
			});
			return {
				'width': width,
				'height': height,
				'maxWidth': this.$content.width() - width,
				'maxHeight': this.$content.height() - height,
				'delta': outerHeight
			};
		},
		// Position
		position: function(callback) {
			var box = this.$content.find('[data-albox=box]'),
				$this = this;
			$this.safeContentPosition();
			$('[data-albox=loading]').hide();
			var size = this.safeSize();
			this.boxSize = this.boxSize || false;
			box.find('[data-albox=' + ('image' === $this.settings.mode ? 'header': 'footer') + '], [data-albox=content] > *').css('visibility', 'hidden');
			if(false === this.boxSize) {
				box.width(0).height(0);
			}
			$albox.css('visibility', 'visible');
			box.css('visibility', 'visible');
			this.settings.beforePos(size);
			box.stop().animate({
				width: size.width,
				height: size.height,
				'margin': '-' + Math.floor(size.height / 2, 10) + 'px 0 0 -' + Math.floor(size.width / 2, 10) + 'px'
			}, {
				duration: 200,
				easing: 'linear',
				complete: function() {
					if(null !== $albox) {
						$albox.height(size.height - ($this.realSize.delta + $this.realSize.height));
						box.find('[data-albox=content] > *').css('visibility', 'visible').hide().fadeIn(200);
						box.find('[data-albox=' + ('image' === $this.settings.mode ? 'header': 'footer') + ']').css('visibility', 'visible').hide().fadeIn(200, function() {
							if('image' === $this.settings.mode) {
								box.find('[data-albox=footer]').css('visibility', 'visible').fadeTo(200, 1);
							}
							if(false === $this.boxSize) {
								box.find('[data-albox=close], [data-albox=title]').css('visibility', 'visible').hide().fadeTo(200, 1);
								$this.boxSize = true;
							}
							$this.settings.afterPos(size);
							if('function' === typeof callback) {
								callback(size);
							}
						});
					}
				}
			});
		},
		// Revealer
		reveal: function() {
			// Current ref
			var $this = this;
			// Callback
			this.settings.afterLoad();
			// Image case
			if('image' === this.settings.mode) {
				// Gallery mode
				if(this.settings.items.length > 0) {
					// Update settings
					$.extend(this.settings, this.settings.items[this.settings.current]);
					$this.$content.find('[data-albox=next], [data-albox=prev]').addClass('disabled');
					// Changing image
					$('[data-albox=loading]').stop().fadeIn(200);
				}
				// Instanciate image
				var imgLoad = new Image();
				// If not load : error
				imgLoad.onerror = function() {
					// Close current Albox
					$albox.hide();
					$this.loading().close(function() {
						$.albox.alert();
					});
				};
				// Everything okay
				imgLoad.onload = function() {

					if(null !== $albox) {
						// Gallery mode
						if($this.settings.items.length > 0) {
							// Update navigate legend
							$this.$content.find('[data-albox=count]').html(($this.settings.current + 1) + ' / ' + $this.settings.items.length);
						}

						// Add image to content
						$albox.html($('<img />').attr('src', $this.settings.url));
						// Init vars
						var $image = this;
						// Resize
						var maxWidth = $this.realSize.maxWidth - $this.realSize.width;
						var maxHeight = $this.realSize.maxHeight - $this.realSize.height - $this.realSize.delta;
						var ratio = parseFloat(($image.width > maxWidth || $image.height > maxHeight ? Math.max($image.width / maxWidth, $image.height / maxHeight) : 1).toFixed(1));
						// New size ?
						var size = {
							width: Math.min(maxWidth, Math.floor($image.width / ratio)),
							height: Math.min(maxHeight, Math.floor($image.height / ratio))
						};
						// Remove loading image
						$this.loading();
						// Add image to content
						$albox.find('img').css(size);
						// Update box title
						$this.title($this.settings.title, $this.settings.description).hide();
						// Need zooming ?
						$this.zoomable($image.width !== size.width || $image.height !== size.height);
						// Move main box to window center
						$this.position(function() {
							// Align and display title
							if($this.$content.find('[data-albox=title]').text().length > 0) {
								$this.$content.find('[data-albox=title]').css({
									bottom: $this.realSize.delta + ($this.realSize.height / 2),
									width: $.albox.content().width()
								}).fadeIn(200);
							} else {
								$this.$content.find('[data-albox=title]').hide();
							}
							$this.$content.find('[data-albox=next]').html($this.settings.current < $this.settings.items.length - 1 ? $this.settings.locale.next : $this.settings.locale.close).removeClass('disabled');
							if($this.settings.current > 0) {
								$this.$content.find('[data-albox=prev]').removeClass('disabled');
							}
							if($this.galeryHide) {
								clearTimeout($this.galeryHide);
							}
							$this.galeryHide = setTimeout(function() { $this.displayInfo('hide'); }, 2E3);
							$('[data-albox=content], [data-albox=header]').on('mousemove mouseleave', function(event) {
								clearTimeout($this.galeryHide);
								if('mousemove' === event.type) {
									$this.displayInfo('show');
								}
								if($('[data-albox=header]').find(event.target).length === 0 || 'mouseleave' === event.type) {
									$this.galeryHide = setTimeout(function() { $this.displayInfo('hide'); }, 2E3);
								}
							});
							// Callback
							$this.settings.afterShow();
						});
					}
				};
				// Load image
				imgLoad.src = this.settings.url;
			// Other cases
			} else {
				// Live content
				if(null !== this.settings.content) {
					// Remove loading
					this.loading();
					// Update html
					$albox.hide().html(this.settings.content);
					// Update title
					this.title();
					// Move main box to window center
					this.position(function() {
						// Callback
						$this.settings.afterShow();
					});
				// Url 
				} else if(null !== this.settings.url) {
					// CSS selector
					if(-1 !== this.settings.url.substr(0, 1).search(/#|\./)) {
						// Element exist ?
						if($(this.settings.url).length) {
							// Remove loading
							this.loading();
							// Update content
							$albox.hide().html($(this.settings.url).html());
							// Update title
							this.title(this.settings.title);
							// Move main box to window center
							this.position(function() {
								// Callback
								$this.settings.afterShow();
							});
						} else {
							this.$content.find('[data-albox=prev]').removeClass('disabled');
							// Close current Albox
							$albox.hide();
							this.loading().close(function() {
								$.albox.alert();
							});
						}
					// Iframe
					} else if(this.settings.url.match(/^https?:\/\//i) && false === !!this.settings.crossDomain) {
						// Update settings if auto height of auto width
						if('auto' === this.settings.width) {
							$.extend(this.settings, {width: 1E6});
						}
						if('auto' === this.settings.height) {
							$.extend(this.settings, {height: 1E6});
						}
						// Update title
						this.title($this.settings.title);
						// Iframe
						$('<iframe />')
							.attr({
								src: this.settings.url,
								'data-albox': 'iframe'
							})
							.css('visibility', 'hidden')
							.load(function() {
								if(null !== $albox) {
									// Center it
									$this.position(function() {
										// Callback
										$this.settings.afterShow();
									});
								}
							})
							.appendTo($albox);
					// Ajax
					} else if(null !== this.settings.url) {
						$.ajax({
							url: this.settings.url,
							type: (false === $.isEmptyObject(this.settings.post) ? 'POST' : 'GET'),
							data: (false === $.isEmptyObject(this.settings.post) ? this.settings.post : this.settings.get),
							xhrFields: {
								withCredentials: !!this.settings.crossDomain
							},
							success: function(content) {
								// Remove loading
								$this.loading();
								// Update content
								$albox.hide()
									.html(function() {
										// In steps mode
										if('steps' === $this.settings.mode) {
											// If we haven't the urrent steps
											if($('#' + $this.settings.stepsKeys[$this.settings.current], content).length < 1) {
												$this.loading().close(function() {
													$.albox.alert();
												});
											}
										}
										// Content
										return content;
									});
								// Again in steps mode
								if($this.settings.stepsKeys.length > 0) {
									// Display steps
									$this.steps($this.settings.current);
								} else {
									// Update title
									$this.title($this.settings.title);
									// Update position
									$this.position(function() {
										// Callback
										$this.settings.afterShow();
									});
								}
							},
							// Error time !
							error: function(error) {
								// Close box
								$this.loading().close(function() {
									$.albox.alert(error.status + ' - ' + error.statusText);
								});
							}
						});
					}
				} else {
					$albox.hide();
					// Close box
					this.loading().close(function() {
						
						$.albox.alert();
					});
				}
			}
		},
		// Callbacks
		call: function() {
			return this.settings.context;
		}
	};

	/**
	 * Public Callbacks
	 * @desc Using by Albox.instance private method
	 * @public
	 */
	// Instance declaration 
	$.albox = function(settings, mode) {
		new Albox(settings, mode);
	};
	// $.protype extended
	$.fn.albox = function(settings, mode) {
		settings = settings || {};
		$(this).on('click', function(event) {
			event.preventDefault();
			settings.context = this;
			new Albox(settings, mode);
		});
	};
	// User's callbacks
	$.albox.call = function() {
		if(Albox.stack.length) {
			return Albox.instance.call();
		}
	};
	// Regenerate Alboxposition in main window
	$.albox.position = function(callback) {
		if(Albox.stack.length) {
			return Albox.instance.position(callback);
		}
	};
	// Return stack parent
	$.albox.parent = function() {
		if(Albox.stack.length) {
			return Albox.stack[1];
		}
	};
	// Closing
	$.albox.close = function(callback) {
		if(Albox.stack.length) {
			return Albox.instance.close(callback);
		}
	};
	// Previous
	$.albox.previous = function() {
		if(Albox.stack.length && $('[data-albox=prev]', Albox.instance.$content).length) {
			Albox.instance.$content.find('[data-albox=prev]').trigger('click');
		}
	};
	// Next
	$.albox.next = function() {
		if(Albox.stack.length && $('[data-albox=next]', Albox.instance.$content).length) {
			Albox.instance.$content.find('[data-albox=next]').trigger('click');
		}
	};
	// Change title
	$.albox.title = function(title, subtitle) {
		if(Albox.stack.length) {
			return Albox.instance.title(title, subtitle);
		}
	};
	// Display loading
	$.albox.loading = function() {
		if(Albox.stack.length) {
			Albox.instance.loading();
		}
	};
	// Content access
	$.albox.content = function() {
		if(Albox.stack.length) {
			return Albox.instance.$content.find('[data-albox=content]');
		}
		return null;
	};
	// Overwrite default settings
	$.albox.setDefaults = function(settings) {
		if(false === $.isEmptyObject(settings)) {
			$.extend(window.Albox.settings, settings);
		}
	};

	// Alert mod 
	$.albox.alert = function() {
		var data = {
			content: arguments[0] || window.Albox.settings.locale.error,
			title: 'string' === typeof arguments[1] ? arguments[1] : '',
			callback: null,
			timer: arguments.length > 1 ? !!arguments[arguments.length - 1] : false
		};
		// Get callback
		for(var i in arguments) {
			if('function' === typeof arguments[i]) {
				data.callback = arguments[i];
				break;
			}
		}
		var extended = {};
		if(true === data.timer) {
			extended.button = {
				close: {
					text: window.Albox.settings.locale.close,
					call: function(){
						if('function' === typeof data.callback) {
							data.callback();
						} else {
							$.albox.close();
						}
					}
				}
			};
		} else {
			extended = {
				content: data.content + '<div class="muted">' + window.Albox.settings.locale.autoClose.replace('<x>', '<span>3').replace(/<[^\|>]+\|(.*)>/gi, '$1</span>') + '</div>',
				afterShow: function() {
					// Call for auto-close
					var locale = window.Albox.settings.locale.autoClose.match(/<([^>]+)\|([^>]+)>/i),
						change = $.albox.content().find('div span'), timer = window.setInterval(function() {
							var num = parseInt(change.text(), 10) - 1;
							if(num > 0) {
								change.text(num + ' ' + (num > 1 ? locale[2] : locale[1]));
							}
						}, 1E3);
					// Deacrease time
					window.setTimeout(function() {
						window.clearInterval(timer);
						$.albox.close();
					}, 3E3);
				},
				afterClose: function() {
					// Callback
					if('function' === typeof data.callback) {
						data.callback();
					}
				}
			};
		}
		$.albox($.extend({
			title: data.title,
			content: data.content,
			close: false,
			afterLoad: function() {
				// Auto-close ? Okay, adding sentence
				$.albox.content().addClass('alerting');
				if($.albox.title().text().length === 0) {
					$.albox.content().parent().find('[data-albox=header]').remove();
				}
			}
		}, extended));
	};

	/*!
	 * Helpers
	 * Way to open differents modals with HTML REL attributes (no case sensitive)
	 * 
	 * - Simple usage:
	 *     <element rel='albox'>
	 *     Open an automatic modal to click on <element>
	 * 
	 * - Image usage:
	 *     <element rel='albox-image'>
	 *     Open an automatic image view modal to click on <element>
	 *     With "zoom" rel attributes, zomming enabled (disable by default)
	 * 
	 * - Gallery usage:
	 *     <element rel='albox-gallery'>
	 *     Open an automatic gallery view modal to click on every <element> with rel attribute
	 *     With "zoom" rel attributes, zomming enabled (disable by default)
	 */
	$(document).ready(function() {

		// Simple usage
		$('*[rel~=albox]').on('click', function() {
			$.albox({
				title: this.title,
				url: $(this).attr('href')
			});
			return false;
		});

		// Image / Gallery usage
		$('*[rel*=albox-gallery], *[rel*=albox-image]').on('click', function() {
			// Images stack
			var items = [];
			// Fold image
			$(-1 !== this.rel.search(/albox-gallery/i) ? '*[rel^=albox-gallery]' : this).each(function() {
				items.push({
					url: this.src || this.href,
					title: this.title || '',
					description: this.rev || '',
					zoom: -1 !== this.rel.search(/zoom/i)
				});
			});
			// Single image
			if(1 === items.length) {
				$.albox(items[0], 'image');
			// Gallery
			} else if(items.length > 1) {
				$.albox({
					items: items,
					current: $(this).index('*[rel^=albox-gallery]')
				}, 'image');
			}
			return false;
		});

		// Resize on tab focus if size change
		$(window).on('focus', function() {
			
			// Albox exist
			if(Albox.stack.length) {
				
				// On window resize
				$(window).on('resize', function() {
					if(this.resizeTO) {
						clearTimeout(this.resizeTO);
					}
					this.resizeTO = setTimeout(function() {
						$.albox.position();
					}, 500);
				});
			}
		});

		// Using keyboard ?
		$(document).keypress(function(event) {
			if(Albox.stack.length) {
				if(37 === event.keyCode && 'image' == Albox.instance.settings.mode) { // left
					$.albox.previous();
				} else if(39 === event.keyCode && 'image' == Albox.instance.settings.mode) { // right
					$.albox.next();
				} else if(27 === event.keyCode && true === Albox.instance.settings.close) { // escape
					$.albox.close();
				}
			}
		});
	});

	// Assign Albox
	window.Albox = Albox;

})(jQuery);