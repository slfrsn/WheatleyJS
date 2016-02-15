/*!
 * CSS Portals, v1.0a (http://github.com/scfrsn)
 * Copyright 2016 Stef Friesen (http://frsn.ca)
 * Licensed under the MIT license
 * Last Updated: 1/22/2016, 4:30:33 PM
 */

(function($) {
    $.wheatley = function(element, options) {
      var self = this,
      $element = $(element),
    $crosshair = $('<div id="wheatley-crosshair"></div>'),
     $document = $(document),
  animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

      var defaults = {
        size      : 200,
        container : 'body'
      };

      self.settings = $.extend({}, defaults, options);

      self.initialize = function(callback) {
        self.crosshair.initialize();

        // Left click in the element to create a blue portal, right click for orange
        $document.on('click contextmenu', $('body').not('.wheatley-portal div'), function(e) {
          // Check if the click occurred inside the element or one of its children
          if ($element.has(e.target).length > 0 || $element.is(e.target)) {
            var colour;
            if(e.type == 'click')       colour = 'blue';
            if(e.type == 'contextmenu') colour = 'orange';
            self.portal.create(colour, { x : e.pageX, y : e.pageY });
            return false;
          }
        });
        // Left click to destroy a blue portal, right click to destroy orange
        $document.on('click contextmenu', '.wheatley-portal div', function(e) {
          var eventTarget = $(e.target).parent().attr('id').replace('-portal',''),
                   target = e.type == 'click' ? 'blue' : 'orange';
          if(eventTarget == target) {
            self.portal.destroy(target);
          } else {
            self.crosshair.animate('misfire');
          }
          return false;
        });
      }

      self.option = function(key, value) {
        if (value !== undefined) {
          self.settings[key] = value;
        } else {
          return self.settings[key];
        }
      }

      // Calculates the bounding box of all of the plugin elements
      self.locate = function() {
          var portal = function(colour) {
            var $portal = $('#' + colour + '-portal');
            if($portal.length) {
              return {
                top    : $portal.offset().top,
                left   : $portal.offset().left,
                bottom : $portal.offset().top + self.settings.size * 1.3,
                right  : $portal.offset().left + self.settings.size,
              };
            }
          }
          return {
            blue   : portal('blue'),
            orange : portal('orange'),
            parent : {
              top    : $element.offset().top,
              left   : $element.offset().left,
              bottom : $element.offset().top + $element.outerHeight(),
              right  : $element.offset().left + $element.outerWidth()
            },
            crosshair : {
              top:  $crosshair.offset().top  - ($crosshair.outerWidth() / 4),
              left: $crosshair.offset().left - ($crosshair.outerWidth() / 4)
            }
          };
      }

      self.destroy = function(callback) {
          self.crosshair.destroy();
          self.portal.destroy('blue');
          self.portal.destroy('orange');
          $element.off('click contextmenu');
          $document.off('click contextmenu', '.wheatley-portal div');
          $element.removeData();
          if (callback && (typeof callback == 'function')) callback();
      }

      self.portal = {
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
            var template =  '<div id="' + colour + '-portal" class="wheatley-portal">' +
                              '<div class="darkest"></div>' +
                              '<div class="darker"></div>' +
                              '<div class="normal"></div>' +
                              '<div class="lighter"></div>' +
                              '<div class="lightest"></div>' +
                              '<div class="entrance"></div>' +
                            '</div>';
            // Prevent the portals from spilling over the edges of the element
            var newPortal = self.portal.calculate(x, y);
            var container = self.locate().parent;
            if (newPortal.left   < container.left  ) x = container.left   + newPortal.centre.x;
            if (newPortal.top    < container.top   ) y = container.top    + newPortal.centre.y;
            if (newPortal.right  > container.right ) x = container.right  - newPortal.centre.x;
            if (newPortal.bottom > container.bottom) y = container.bottom - newPortal.centre.y;
            // Prepare the updated coordinates and dimensions to apply to the new portal
            var portalProperties = {
              width  : self.settings.size + 'px',
              height : self.settings.size + 'px',
              top    : y - (self.settings.size / 2),
              left   : x - (self.settings.size / 2)
            }
            // Recalculate the portal bounds after compensating for spillage
            newPortal = self.portal.calculate(x, y)
            // Check if the new portal will overlap the portal of the opposite colour
            var altPortal = (colour == 'orange') ? self.locate().blue : self.locate().orange;
            if (altPortal && newPortal.right > altPortal.left && newPortal.left < altPortal.right && newPortal.top < altPortal.bottom && newPortal.bottom > altPortal.top) {
              self.crosshair.animate('misfire');
            } else {
              // If the portal already exists, move it
        	    $('#' + colour + '-portal').remove();
        	    $(template).appendTo('body').css(portalProperties);
              $crosshair.addClass(colour);
            }
            if (callback && (typeof callback == 'function')) callback();
        },
        // Calculates what the bounding box, centre position, and dimensions of a
        // portal are at a given position.
        calculate: function(x, y) {
            var centre = {
              y : self.settings.size * 1.3 / 2, // Multiplier accounts for the scaleY() transform
              x : self.settings.size / 2
            };
            return {
              top    : y - centre.y,
              left   : x - centre.x,
              bottom : y + centre.y,
              right  : x + centre.x,
              centre : {
                x : centre.x,
                y : centre.y
              }
            };
        },
        destroy: function(colour, callback) {
        		$('#' + colour + '-portal').addClass('disappear').one(animationEnd, function() { $(this).remove(); });
            $crosshair.removeClass(colour);
            if (callback && (typeof callback == 'function')) callback();
        }
      }

      self.crosshair = {
        initialize: function(callback) {
            // Only allow one instance of the portal crosshair
            if ($crosshair.length) self.crosshair.destroy();
            $(self.settings.container).addClass('wheatley-container');
            // Place the portal crosshair at the top of the container
            var y = self.locate().parent.top,
                x = self.locate().parent.left;
            // Attach the portal crosshair to the DOM
        		$crosshair.appendTo('body').css({ top : y, left : x });
          	// Map the portal crosshair to the cursor
          	$document.on('mousemove', function(e) {
              // Check if the cursor is moving inside the container. If not, hide the crosshair
              if ($('.wheatley-container, .wheatley-portal, .wheatley-portal div').is(e.target)) {
                $crosshair.fadeIn(200);
              } else {
                $crosshair.fadeOut(200);
              }
              self.crosshair.update(e.pageX, e.pageY);
          	})
            if (callback && (typeof callback == 'function')) callback();
        },
        // Position the portal crosshair over the cursor, accounting for the proper offset
        update: function(x, y) {
            $crosshair.css({
              top:  y - ($crosshair.outerWidth() / 2),
              left: x - ($crosshair.outerWidth() / 2.5)
            });
        },
        // Accepts any CSS animation class (e.g. 'fire', 'misfire' or custom)
        animate: function(animation, callback) {
        		$crosshair.addClass(animation).one(animationEnd, function() { $(this).removeClass(animation); });
            if (callback && (typeof callback == 'function')) callback();
        },
        destroy: function(callback) {
            $(self.settings.container).removeClass('wheatley-container');
            $document.off('mousemove');
            $crosshair.remove();
            if (callback && (typeof callback == 'function')) callback();
        }
      }
      self.initialize();
    }
    $.fn.wheatley = function(options) {
      return this.each(function() {
        if (undefined == $(this).data('wheatley')) {
          var self = new $.wheatley(this, options);
          $(this).data('wheatley', self);
        }
      });
    }
})(jQuery);
