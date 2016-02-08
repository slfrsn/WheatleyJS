/*!
 * CSS Portals, v1.0a (http://github.com/scfrsn)
 * Copyright 2016 Stef Friesen (http://frsn.ca)
 * Licensed under the MIT license
 * Last Updated: 1/22/2016, 4:30:33 PM
 */

(function($) {
    $.wheatley = function(element, options) {
      var plugin = this,
        $element = $(element),
            $gun = $('<div id="portal-gun"></div>'),
       $document = $(document),
           $body = $('body'),
    animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

      var defaults = {
        size      : 200,
        animation : true,
        quality   : 'high',
        container : 'body'
      };

      plugin.settings = $.extend({}, defaults, options);

      plugin.initialize = function() {
        plugin.gun.initialize();
        // Left click in the element to create a blue portal, right click for orange
        $element.on('click contextmenu', function(e) {
          if(e.type == 'click')       plugin.portal.create('blue',   { x : e.pageX, y : e.pageY });
          if(e.type == 'contextmenu') plugin.portal.create('orange', { x : e.pageX, y : e.pageY });
          return false;
        });
        // Left click on an existing portal to destroy, right click to destroy orange
        $document.on('click contextmenu', '.portal div', function(e) {
          var eventTarget = $(e.target).parent().attr('id').replace('-portal',''),
                   target = e.type == 'click' ? 'blue' : 'orange';
          if(eventTarget == target) {
            plugin.portal.destroy(target);
            plugin.gun.animate('fire');
          } else {
            plugin.gun.animate('misfire');
          }
          return false;
        });
      }

// /////////////////////// DRAG AND DROP TESTING
//
//       plugin.dragReady = function(boolean) {
//         	var dropZoneOne = $('.portal');
//         	var dragElements = $('#companion-cube');
//         	var elementDragged = null;
//
//             // if(boolean === true) {
//           	// 	// Event Listener for when the drag interaction starts.
//           	// 	dragElements.on('dragstart', function(e) {
//           	// 		e.originalEvent.dataTransfer.effectAllowed = 'move';
//           	// 		elementDragged = this;
//           	// 	});
//           	// 	// Event Listener for when the drag interaction finishes.
//           	// 	dragElements.on('dragend', function(e) { elementDragged = null; });
//             // } else {
//             //   dragElements.off('dragstart');
//             //
//             // }
//
//           // if(boolean === true) {
//             dropZoneOne.bind({
//               dragenter: function(e) {
//                 e.stopPropagation(); e.preventDefault();
//               },
//               dragleave: function(e) {
//                 e.stopPropagation(); e.preventDefault();
//                 $(this).removeClass('drop');
//               },
//               dragover: function(e) {
//                 e.stopPropagation(); e.preventDefault();
//                 $(this).addClass('drop');
//               },
//               drop: function(e) {
//                 e.stopPropagation(); e.preventDefault();
//                 dragElements.remove();
//               }
//             });
//
//             dragElements.bind({
//               dragstart: function(e) {
//                 e.originalEvent.effectAllowed = "copy";
//                 $(this).addClass('dragged');
//                 var img = $('<img src="' + $(this).attr('src') + '"/>').css({ width : 200 });
//                 e.originalEvent.dataTransfer.setDragImage(img, 0, 0);
//               }
//             });
//
//             // }
//
// /////////////////////// END DRAG AND DROP TESTING

      plugin.option = function(key, value) {
        if (value !== undefined) {
          plugin.settings[key] = value;
        } else {
          return plugin.settings[key];
        }
      }

      // Calculates the bounding box of all of the plugin elements
      plugin.locate = function() {
          return new function() {
            var portal = function(colour) {
              var $portal = $('#' + colour + '-portal');
              if($portal.length) {
                return {
                  top    : $portal.offset().top,
                  left   : $portal.offset().left,
                  bottom : $portal.offset().top + plugin.settings.size * 1.3,
                  right  : $portal.offset().left + plugin.settings.size,
                };
              }
              return null;
            }
            this.blue   = portal('blue');
            this.orange = portal('orange');
            this.parent = {
              top    : $element.offset().top,
              left   : $element.offset().left,
              bottom : $element.offset().top + $element.outerHeight(),
              right  : $element.offset().left + $element.outerWidth()
            };
            this.gun = {
              top:  $gun.offset().top  - ($gun.outerWidth() / 4),
              left: $gun.offset().left - ($gun.outerWidth() / 4)
            };
          }
      }

      plugin.destroy = function(callback) {
        plugin.gun.destroy();
        plugin.portal.destroy('blue');
        plugin.portal.destroy('orange');
        $element.off('click contextmenu');
        $document.off('click contextmenu', '.portal div');
        $element.removeData();
        if (callback && (typeof callback == "function")) callback();
      }

      plugin.portal = {
        create: function(colour, coordinates, callback) {
            // The coordinates and callback arguments are both optional
            // Make the sure the proper argument is being passed if others are missing
            if (arguments.length == 1) {
              coordinates = { x : 0, y : 0 };
              callback = function() {};
            } else if (arguments.length == 2) {
              callback = function() {};
              if (typeof coordinates == 'function') callback = coordinates;
            }
            var x = coordinates.x,
                y = coordinates.y;
            var animation = plugin.settings.animation == true ? 'spin' : '',
                  quality = plugin.settings.quality == 'high' ? 'high-quality' : '',
                 template = '<div id="' + colour + '-portal" class="portal appear ' + animation + ' ' + quality + '">' +
                              '<div class="darkest"></div>' +
                              '<div class="darker"></div>' +
                              '<div class="normal"></div>' +
                              '<div class="lighter"></div>' +
                              '<div class="lightest"></div>' +
                              '<div class="entrance"></div>' +
                            '</div>';
            // Prevent the portals from spilling over the edges of the element
            var newPortal = plugin.portal.calculate(x, y);
            var container = plugin.locate().parent;
            if (newPortal.left   < container.left  ) x = container.left   + newPortal.center.x;
            if (newPortal.top    < container.top   ) y = container.top    + newPortal.center.y;
            if (newPortal.right  > container.right ) x = container.right  - newPortal.center.x;
            if (newPortal.bottom > container.bottom) y = container.bottom - newPortal.center.y;
            // Prepare the updated coordinates and dimensions to apply to the new portal
            var portalProperties = {
              width  : plugin.settings.size + 'px',
              height : plugin.settings.size + 'px',
              top    : y - (plugin.settings.size / 2),
              left   : x - (plugin.settings.size / 2)
            }
            // Recalculate the portal bounds after compensating for spillage
            newPortal = plugin.portal.calculate(x, y)
            // Check if the new portal will overlap the portal of the opposite colour
            var altPortal = (colour == 'orange') ? plugin.locate().blue : plugin.locate().orange;
            if (altPortal && newPortal.right > altPortal.left && newPortal.left < altPortal.right && newPortal.top < altPortal.bottom && newPortal.bottom > altPortal.top) {
              plugin.gun.animate('misfire');
            } else {
              // If the portal already exists, move it
        	    $('#' + colour + '-portal').remove();
        	    $(template).appendTo('body').css(portalProperties);
              $gun.addClass(colour);
        		  plugin.gun.animate('fire');
            }
            if (callback && (typeof callback == "function")) callback();
        },
        // Calculates what the bounding box, center position, and dimensions of a
        // portal at a given position.
        calculate: function(x, y) {
            this.center = {
              y : plugin.settings.size * 1.3 / 2, // Multiplier accounts for the scaleY() transform
              x : plugin.settings.size / 2
            };
            this.top    = y - this.center.y;
            this.left   = x - this.center.x;
            this.bottom = y + this.center.y;
            this.right  = x + this.center.x;
            return this;
        },
        destroy: function(colour, callback) {
        		$('#' + colour + '-portal').addClass('disappear').one(animationEnd, function() { $(this).remove(); });
            $gun.removeClass(colour);
            if (callback && (typeof callback == "function")) callback();
        }
      }

      plugin.gun = {
        initialize: function(callback) {
            // Only allow one instance of the portal gun
            if ($gun.length) plugin.gun.destroy();
            // Place the portal gun at the top of the container
            var y = plugin.locate().parent.top,
                x = plugin.locate().parent.left;
            // Attach the portal gun to the DOM
        		$gun.appendTo('body').css({ top : y, left : x });
          	// Map the portal gun to the cursor
          	$document.on('mousemove', plugin.settings.container + ', .portal div', function(e) {
        			$body.addClass('portal-gun-active');
              plugin.gun.update(e.pageX, e.pageY);
          	}).on('mouseout', plugin.settings.container, function(){
              $body.removeClass('portal-gun-active');
            });
            if (callback && (typeof callback == "function")) callback();
        },
        // Position the portal gun over the cursor, accounting for the proper offset
        update: function(x, y) {
            $gun.css({
              top:  y - ($gun.outerWidth() / 1.6),
              left: x - ($gun.outerWidth() / 2)
            });
        },
        // Accepts any CSS animation class (e.g. 'fire', 'misfire' or custom)
        animate: function(animation, callback) {
        		// $gun.addClass(animation).one(animationEnd, function() { $(this).removeClass(animation); });
            if (callback && (typeof callback == "function")) callback();
        },
        destroy: function(callback) {
            $document.off('mousemove', plugin.settings.container + ', .portal div').off('mouseout', plugin.settings.container);
            $body.removeClass('portal-gun-active');
            $gun.remove();
            if (callback && (typeof callback == "function")) callback();
        }
      }
      plugin.initialize();
    }
    $.fn.wheatley = function(options) {
      return this.each(function() {
        if (undefined == $(this).data('wheatley')) {
          var plugin = new $.wheatley(this, options);
          $(this).data('wheatley', plugin);
        }
      });
    }
})(jQuery);
