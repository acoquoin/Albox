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
 * Date: Fri Jan 25 2013 08:54:39 GMT+0100 (CET)
 */

(function($) {

	// Validator (JSHint - http://www.jshint.com/)
	/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, jquery:true, indent:4, maxerr:50 */
	'use strict';

	// Global var declaration
	var $albox = null;

	// Global settings
	var AlboxSettings;

	// Stacking
	var Albox = function(settings, mode) {
		var countStack = 0;

		settings = $.extend({mode: mode || 'html'}, settings, AlboxSettings);

		if(Albox.stack.length > 1) {
			for(var i in Albox.stack) {
				if('undefined' !== typeof Albox.stack[i].settings) {
					if((settings.url && settings.url === Albox.stack[i].settings.url) || (!settings.url && settings.content === Albox.stack[i].settings.content)) {
						countStack++;
					}
				}
			}
			if(countStack > 1) {
				return false;
			}
		}
		this.init(settings);
		if('object' === typeof settings.callbacks) {
			for(var j in settings.callbacks) {
				if('undefined' === typeof this.settings.context[j]) {
					this.settings.context[j] = settings.callbacks[j];
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
		$albox = null === Albox.instance ? null : Albox.instance.$content.find('.lb-content');
	};

	// Rewrite config
	Albox.config = function(settings) {
		AlboxSettings = settings;
	};

	// Default Settings
	Albox.settings = {
		context: $('body'),
		append: 'body',
		title: '',
		description: '',
		url: null,
		content: null,
		post: {},
		keyboard: true,
		current: null,
		steps: {},
		items: [],
		stepsKeys: [],
		locale: {
			close: '&times;',
			navigate : {
				previous: '&lsaquo; previous',
				next: 'next &rsaquo;',
				close: 'close',
				stop: 'stop'
			},
			alert: {
				notFound: '404 - Not Found',
				close: 'Automatically close in',
				seconds:  {
					singular: 'second',
					plural: 'seconds'
				}
			}
		},
		overlay: '.5',
		speed: 200,
		close: true,
		skin: 'default',
		width: 'auto',
		minWidth: 320,
		margin: 30,
		height: 'auto',
		minHeight: 0,
		button: null,
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
		callbacks: {},
		render: {
			html: '<div class="albox"><div class="lb-overlay"></div><div class="lb-box lb-loading"><div class="lb-header"><div class="lb-close"></div><div class="lb-title"></div></div><div class="lb-content"></div><div class="lb-footer"></div></div></div>',
			alert: '<div class="albox"><div class="lb-overlay"></div><div class="lb-box lb-alert"><div class="lb-content"></div></div></div>',
			image: '<div class="albox"><div class="lb-overlay"></div><div class="lb-box lb-loading"><div class="lb-header"><div class="lb-close"></div><div class="lb-title"></div></div><div class="lb-content"></div><div class="lb-navigate"><a href="#" class="lb-previous lb-disable"></a><span class="lb-count"></span><a href="#" class="lb-next lb-disable"></a></div></div></div>',
			steps: '<div class="albox"><div class="lb-overlay"></div><div class="lb-box lb-loading"><div class="lb-header"><div class="lb-close"></div><div class="lb-title"></div></div><div class="lb-content"></div><div class="lb-navigate"><a href="#" class="lb-previous lb-disable"></a><span class="lb-count"></span><a href="#" class="lb-next lb-disable"></a></div></div></div>'
		}
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
			// Steps mode, okay assign some datas
			if(!$.isEmptyObject(settings.steps)) {
				settings.mode = 'steps';
				settings.stepsKeys = Object.keys(settings.steps);
				if(parseInt(settings.current, 10)) {
					settings.current = Math.min(Math.max(settings.current - 1, 1), settings.stepsKeys.length);
				} else {
					settings.current = Math.max($.inArray(settings.current, settings.stepsKeys), 0);
				}
			}
			// Extend settings
			this.settings = $.extend({}, Albox.settings, settings || {});
			// Callback beforeLoad
			this.settings.beforeLoad();
			//Generate HTML box et append it
			this.$content = $(this.settings.render[this.settings.mode])
				.appendTo(this.settings.append)
				.addClass(this.settings.skin)
				.find('.lb-overlay')
					.hide()
					.css('z-index', 1E5 + (Albox.stack.length * 1E3))
					.fadeTo(this.settings.speed, this.settings.overlay, function() {
						$this.$content.find('.lb-box').fadeIn($this.settings.speed, function() {
							$this.reveal();
						});
					})
					.end()
				.find('.lb-box')
					.css('z-index', 1E5 + 10 + (Albox.stack.length * 1E3))
					.hide()
					.end()
				.find('.lb-close')
					.html('image' === this.settings.mode ? this.settings.locale.navigate.close : this.settings.locale.close)
					.end();
			// Assign global var $albox
			$albox = this.$content.find('.lb-content');
			// Hide controls
			this.$content.find('.lb-header, .lb-footer, .lb-navigate').hide();
			// Allow or disallow to clone box ?
			if(true === this.settings.close) {
				this.$content.on('click', '.lb-overlay, .lb-close', function() {
					$this.close();
				});
			} else {
				this.$content.find('.lb-close').hide();
			}
			// Button options ? Okay, make it
			if(null !== this.settings.button) {
				$.each(this.settings.button, function(index, value) {
					var input = $('<input />').attr({
						'type' : 'button',
						'name' : index,
						'id' : value.id,
						'class' : value.className,
						'value' : value.text
					});
					$this.$content.find('.lb-footer').append(input);
				});
				// Call for button
				this.$content.find('.lb-footer input:button').on('click', function() {
					$this.settings.button[$(this).attr('name')].call();
				});
			} else {
				this.$content.find('.lb-footer').remove();
			}
			// Image mode
			if('image' === this.settings.mode) {
				if(this.settings.current > 0) {
					this.$content.find('.lb-previous').removeClass('lb-disable');
				} else {
					this.$content.find('.lb-previous').addClass('lb-disable');
				}
				if(this.settings.current < this.settings.items.length - 1) {
					this.$content.find('.lb-next').html(this.settings.locale.navigate.next).removeClass('lb-disable');
				} else {
					this.$content.find('.lb-next').html(this.settings.locale.navigate.close).removeClass('lb-disable');
				}
				// Button callbacks
				this.$content
					.find('.lb-previous')
						.html(this.settings.locale.navigate.previous)
						.on('click', function() {
							if(false === $(this).hasClass('lb-disable')) {
								$this.gallery($this.settings.current - 1);
							}
						})
						.end()
					.find('.lb-next')
						.on('click', function() {
							if(false === $(this).hasClass('lb-disable')) {
								if($(this).text() === $this.settings.locale.navigate.close) {
									$this.close();
								} else {
									$this.gallery($this.settings.current + 1);
								}
							}
						})
						.end();
			}
			// Steps mode
			if('steps' === this.settings.mode) {
				// Button callbacks
				this.$content
					.find('.lb-previous')
						.html(this.settings.locale.navigate.previous)
						.on('click', function() {
							if(false === $(this).hasClass('lb-disable')) {
								if(false !== $this.settings.beforePrevStep($this.settings.stepsKeys[$this.settings.current], $this.settings.current + 1)) {
									$this.steps($this.settings.current - 1);
								}
							}
						})
						.end()
					.find('.lb-next')
						.html(this.settings.locale.navigate.next)
						.on('click', function() {
							if(false === $(this).hasClass('lb-disable')) {
								if(false !== $this.settings.beforeNextStep($this.settings.stepsKeys[$this.settings.current], $this.settings.current + 1)) {
									if($(this).text() === $this.settings.locale.navigate.stop) {
										$this.close();
									} else {
										$this.steps($this.settings.current + 1);
									}
								}
							}
						})
						.end();
				// In steps mode, disable first and last :input tab selector
				$albox.on('keypress', ':input:visible:first,:input:visible:last', function(event) {
					if(9 === event.keyCode) {
						event.preventDefault();
					}
				});
			}
		},
		// Steps navigation
		steps: function(index) {
			// Display controls ?
			if('steps' === this.settings.mode && index >= 0 && index < this.settings.stepsKeys.length) {
				// Ref
				var $this = this;
				// Okay, step > 1
				if(index > 0) {
					this.$content.find('.lb-previous').removeClass('lb-disable');
				} else {
					this.$content.find('.lb-previous').addClass('lb-disable');
				}
				// Step < max
				this.$content
					.find('.lb-next')
						.html(index < this.settings.stepsKeys.length - 1 ? this.settings.locale.navigate.next : this.settings.locale.navigate.stop)
						.removeClass('lb-disable');
				// Change counter and paginate
				this.settings.current = index;
				this.$content.find('.lb-count').html('Etape ' + (index + 1) + ' / ' + this.settings.stepsKeys.length);
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
					$albox.find('> *').fadeTo($this.settings.speed, 1, function() {
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
				// First picture
				if(index > 0) {
					this.$content.find('.lb-previous').removeClass('lb-disable');
				} else {
					this.$content.find('.lb-previous').addClass('lb-disable');
				}
				// Pagination
				this.$content
					.find('.lb-next')
						.html(index < this.settings.items.length - 1 ? this.settings.locale.navigate.next : this.settings.locale.navigate.close)
						.removeClass('lb-disable')
						.end()
					.find('.lb-title')
						.fadeOut(this.settings.speed, function(){
							$this.settings.current = index;
							$this.reveal();
					});
			}
		},
		// Hide the main loading animation
		stopLoading: function() {
			this.$content.find('.lb-box')
				.removeClass('lb-loading')
				.addClass('lb-' + this.settings.mode);
			return this;
		},
		// Change title and subtitle
		title: function(title, subtitle) {
			this.$content.find('.lb-title')
				.html((title || this.settings.title) + ('undefined' !== typeof subtitle && subtitle.length > 0 ? '<span>' + subtitle + '</span>' : ''));
			return this.$content.find('.lb-title');
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
		// Max allowed size
		safeSize: function(element) {
			// To be or not to be...
			element = {
				width: parseInt(element.outerWidth(true), 10) || 0,
				height: parseInt(element.outerHeight(true), 10) || 0
			};
			// Return optimisez width and height
			return {
				width: Math.min(
					parseInt($(window).width(), 10) - parseInt(this.settings.margin, 10),
					Math.max(
						element.width,
						parseInt(this.settings.minWidth, 10),
						('auto' === this.settings.width ? 0 : parseInt(this.settings.width, 10))
					)
				),
				height: Math.min(
					parseInt($(window).height(), 10) - parseInt(this.settings.margin, 10),
					Math.max(
						element.height,
						parseInt(this.settings.minHeight, 10),
						('auto' === this.settings.height ? 0 : parseInt(this.settings.height, 10))
					)
				)
			};
		},
		// Close Albox
		close: function(callback) {
			// Assign this
			var $this = this;
			// Ensure we can close modal
			if(false === this.$content.find('.lb-box').hasClass('lb-loading')) {
				// Callback
				this.settings.beforeClose();
				// Hide box
				this.$content.find('.lb-box').fadeOut(this.settings.speed, function() {
					//Hide Albox
					$this.$content.fadeOut($this.settings.speed, function() {
						// Remove node
						$(this).remove();
						// Callback
						$this.settings.afterClose();
						// Personal callbacks
						if('object' === typeof $this.settings.callbacks){
							for(var i in $this.settings.callbacks){
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
		position: function(callback) {
			// .lb-box selector / this
			var box = this.$content.find('.lb-box'),
				$this = this;
			// Reset CSS width & height
			box.width('').height('');
			// Display direct child of .lf-box
			box.find('> *').show();
			// Best size ?
			var size = {
				box: this.safeSize(box),
				window: {
					width: parseInt($(window).width(), 10),
					height: parseInt($(window).height(), 10)
				}
			};
			// Keep resize of the box
			this.boxSize = this.boxSize || [0, 0];
			// Callback
			this.settings.beforePos(size.box);
			// Reset size & Animate it
			box.width(parseInt(this.boxSize[0], 10)).height(parseInt(this.boxSize[1], 10)).stop().animate(size.box, {
				duration: $this.settings.speed,
				easing: 'linear', 
				step: function(now, fx) {
					// Move box during animation from top and left
					if('width' === fx.prop) {
						box.css('left', (size.window.width - parseInt(now, 10)) / 2);
					} else {
						box.css('top', (size.window.height - parseInt(now, 10)) / 2);
					}
				},
				complete: function() {
					// Keep box resize
					$this.boxSize = [size.box.width, size.box.height];
					// Callback
					$this.settings.afterPos(size.box);
					// Internal Callback
					if('function' === typeof callback) {
						callback(size.box);
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
					// Changing image
					$albox.find('img').fadeTo(0, 0).end().append($('<div />').addClass('lb-loading'));
					// Update navigate legend
					this.$content.find('.lb-count').html('Image ' + (this.settings.current + 1) + ' / ' + this.settings.items.length);
				}
				// Instanciate image
				var imgLoad = new Image();
				// If not load : error
				imgLoad.onerror = function() {
					// Close current Albox
					$this.stopLoading().close(function() {
						$.albox.alert();
					});
				};
				// Everything okay
				imgLoad.onload = function() {
					// Remove navigation for stand-alone image
					if($this.settings.items.length <= 1) {
						$this.$content.find('.lb-navigate').remove();
					}
					// Init vars
					var $image = this, 
						maxSize = {
							width: parseInt($(window).width(), 10) - parseInt($this.settings.margin, 10),
							height: parseInt($(window).height(), 10) - parseInt($this.settings.margin, 10) - $this.$content.find('.lb-navigate').outerHeight(true)
						};
					// Resize
					var ratio = $image.width > maxSize.width || $image.height > maxSize.height ? Math.max($image.width / maxSize.width, $image.height / maxSize.height) : 1;
					// New size ?
					var size = {
						width: Math.round($image.width / ratio),
						height: Math.round($image.height / ratio)
					};
					// Remove loading image
					$this.stopLoading();
					// Add image to content
					$albox.html($('<img />').css(size).fadeTo(0, 0).attr('src', $this.settings.url));
					// Update box title
					$this.title($this.settings.title, $this.settings.description).hide();
					// Need zooming ?
					$this.zoomable($image.width !== size.width || $image.height !== size.height);
					// Move main box to window center
					$this.position(function() {
						// Align title
						if($this.$content.find('.lb-navigate').length) {
							$this.$content.find('.lb-title').css('bottom', parseInt($this.$content.find('.lb-navigate').outerHeight(true), 10));
						}
						// Animate for beautiful effect :O
						$albox.find('img').show().fadeTo($this.settings.speed, 1, function() {
							// Display close button and title
							$this.$content.find('.lb-title:not(:empty), .lb-close:hidden').slideDown($this.settings.speed);
							// Callback
							$this.settings.afterShow();
						});
					});
				};
				// Load image
				imgLoad.src = this.settings.url;
			// Other cases
			} else {
				// Live content
				if(null !== this.settings.content) {
					// Remove loading
					this.stopLoading();
					// Update html
					$albox.html(this.settings.content);
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
							this.stopLoading();
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
							this.$content.find('.lb-previous').removeClass('lb-disable');
							// Close current Albox
							this.stopLoading().close(function() {
								$.albox.alert();
							});
						}
					// Iframe
					} else if(this.settings.url.match(/^https?:\/\//i) || true === this.settings.iframe) {
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
							.attr('src', this.settings.url)
							.addClass('lb-iframe')
							.fadeTo(0, 0)
							.css('height', this.safeSize(this.$content.find('.lb-box')).height - this.$content.find('.lb-header').height())
							.load(function() {
								if(null !== $albox) {
									// Remove loading
									$this.stopLoading();
									// Center it
									$this.position(function() {
										// Resize iframe
										$albox.find('.lb-iframe').fadeTo($this.settings.speed, 1, function() {
											// Callback
											$this.settings.afterShow();
										});
										
									});
								}
							})
							.appendTo($albox);
					// Ajax
					} else if(null !== this.settings.url) {
						$.post(this.settings.url,  this.settings.post, function(content) {
							// Remove loading
							$this.stopLoading();
							// Update content
							$albox.hide()
								.html(function() {
									// In steps mode
									if('steps' === $this.settings.mode) {
										// If we haven't the urrent steps
										if($('#' + $this.settings.stepsKeys[$this.settings.current], content).length < 1) {
											$this.stopLoading().close(function() {
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
						// Error time !
						}).error(function(error) {
							// Close box
							$this.stopLoading().close(function() {
								$.albox.alert(error.status + ' - ' + error.statusText);
							});
						});
					}
				} else {
					// Close box
					this.stopLoading().close(function() {
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
	$.albox.close = function() {
		if(Albox.stack.length) {
			return Albox.instance.close();
		}
	};
	// Previous
	$.albox.previous = function() {
		if(Albox.stack.length && $('.lb-previous', Albox.instance.$content).length) {
			Albox.instance.$content.find('.lb-previous').trigger('click');
		}
	};
	// Next
	$.albox.next = function() {
		if(Albox.stack.length && $('.lb-next', Albox.instance.$content).length) {
			Albox.instance.$content.find('.lb-next').trigger('click');
		}
	};
	// Change title
	$.albox.title = function(title, subtitle) {
		if(Albox.stack.length) {
			return Albox.instance.title(title, subtitle);
		}
	};
	// Alert mod 
	$.albox.alert = function(message, timeout, callback) {
		timeout = ('undefined' === typeof timeout ? 4 : timeout);
		$.albox({
			content : message,
			close: false,
			afterLoad: function() {
				// Display message
				var settings = Albox.instance.settings,
					locale = settings.locale.alert;
				settings.content = settings.content || locale.notFound;
				// Auto-close ? Okay, adding sentence
				if(timeout > 0) {
					var left = Math.max(1, timeout - 1);
					settings.content += '<span>' + locale.close + ' <span>' + left + ' ' + (left > 1 ? locale.seconds.plural : locale.seconds.singular) + '</span>.</span>';
				}
			},
			afterShow: function() {
				// Call for auto-close
				if(timeout > 0) {
					var locale = Albox.instance.settings.locale.alert,
						change = $albox.find('span span'), timer = window.setInterval(function() {
							var num = parseInt(change.text(), 10) - 1;
							change.text(num + ' ' + (num > 1 ? locale.seconds.plural : locale.seconds.singular));
						}, 1E3);
					// Deacrease time
					window.setTimeout(function() {
						window.clearInterval(timer);
						$.albox.close();
					}, (timeout - 1) * 1E3);
				}
			},
			afterClose: function() {
				// Callback
				if ('function' === typeof callback) {
					callback();
				}
			}
		}, 'alert');
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
				title: $(this).attr('title'),
				url: $(this).attr('href')
			});
			return false;
		});

		// Image / Gallery usage
		$('*[rel*=albox-gallery], *[rel*=albox-image]').on('click', function() {
			// Images stack
			var items = [];
			// Fold image
			$(-1 !== $(this).attr('rel').search(/albox-gallery/i) ? '*[rel^=albox-gallery]' : this).each(function() {
				items.push({
					url: $(this).attr('src') || $(this).attr('href'),
					title: $(this).attr('title') || '',
					description: $(this).attr('rev') || '',
					zoom: -1 !== $(this).attr('rel').search(/zoom/i)
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
			if(Albox.stack.length) {
				$(window).on('resize', function() {
					$.albox.position();
				});
			}
		});

		// Using keyboard ?
		$(document).keypress(function(event) {
			if(Albox.stack.length && true === Albox.instance.settings.keyboard) {
				if(37 === event.keyCode) { // left
					$.albox.previous();
				} else if(39 === event.keyCode) { // right
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