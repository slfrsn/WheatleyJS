/*!
 * CSS Portals, v1.0a (http://github.com/scfrsn)
 * Copyright 2016 Stef Friesen (http://frsn.ca)
 * Licensed under the MIT license
 * Last Updated: 1/18/2016, 10:30:15 AM
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

      plugin.option = function(key, value) {
        if (value !== undefined) {
          plugin.settings[key] = value;
        } else {
          return plugin.settings[key];
        }
      }

      // Calculates the bounding box of all of the plugin elements
      plugin.positions = function() {
        var portal = function(color) {
          var $portal = $('#' + color + '-portal');
          if($portal.length) {
            return {
              top      : $portal.offset().top,
              left     : $portal.offset().left,
              bottom   : $portal.offset().top + plugin.settings.size * 1.3,
              right    : $portal.offset().left + plugin.settings.size,
            };
          }
          return null;
        }
        var parent = {
          top    : $element.offset().top,
          left   : $element.offset().left,
          bottom : $element.offset().top + $element.outerHeight(),
          right  : $element.offset().left + $element.outerWidth()
        };
        return { parent : parent, blue : portal('blue'), orange : portal('orange') };
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
        create: function(color, coordinates, callback) {
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
                 template = '<div id="' + color + '-portal" class="portal appear ' + animation + ' ' + quality + '">' +
                              '<div class="darkest"></div>' +
                              '<div class="darker"></div>' +
                              '<div class="normal"></div>' +
                              '<div class="lighter"></div>' +
                              '<div class="lightest"></div>' +
                              '<div class="entrance"></div>' +
                            '</div>';
            // Prevent the portals from spilling over the edges of the element
            var newPortal = plugin.portal.calculate(x, y);
            if (newPortal.left   < newPortal.parent.left  ) x = newPortal.parent.left   + newPortal.center.x;
            if (newPortal.top    < newPortal.parent.top   ) y = newPortal.parent.top    + newPortal.center.y;
            if (newPortal.right  > newPortal.parent.right ) x = newPortal.parent.right  - newPortal.center.x;
            if (newPortal.bottom > newPortal.parent.bottom) y = newPortal.parent.bottom - newPortal.center.y;

            // Prepare the updated coordinates and dimensions to apply to the new portal
            var portalProperties = {
              width  : plugin.settings.size + 'px',
              height : plugin.settings.size + 'px',
              top    : y - (plugin.settings.size / 2),
              left   : x - (plugin.settings.size / 2)
            }

            var altPortal;
            if(color == 'orange') altPortal = plugin.positions().blue;
            if(color == 'blue') altPortal = plugin.positions().orange;
            if (altPortal !== null &&
                newPortal.right > altPortal.left &&
                newPortal.left < altPortal.right &&
                newPortal.top < altPortal.bottom &&
                newPortal.bottom > altPortal.top) {
              plugin.gun.animate('misfire');
              console.log('Error: Portals cannot overlap.');
            } else {
              // If the portal already exists, move it
        	    var $oldPortal = $('#' + color + '-portal');
            	if($oldPortal.length) {
          	    var $newPortal = $oldPortal.clone(true);
          	    $oldPortal.removeClass('appear').addClass('disappear').before($newPortal).remove();
          	    $newPortal.css(portalProperties);
          	    // Clone the portal to restart the CSS animation
              } else {
          	    $(template).appendTo('body').css(portalProperties);
              }
            }
        		plugin.gun.animate('fire');
            if (callback && (typeof callback == "function")) callback();
        },
        // Calculates the bounding box, center position, and dimensions of a
        // portal and its parent element at a given position.
        calculate: function(x, y) {
            var center = {
              y : plugin.settings.size * 1.3 / 2, // Multiplier accounts for the scaleY() transform
              x : plugin.settings.size / 2
            };
            var rect = {
              top      : y - center.y,
              left     : x - center.x,
              bottom   : y + center.y,
              right    : x + center.x,
              center   : { y : center.y, x : center.x },
              parent   : {
                top    : $element.offset().top,
                left   : $element.offset().left,
                bottom : $element.offset().top + $element.outerHeight(),
                right  : $element.offset().left + $element.outerWidth()
              }
            };
            return rect;
        },
        destroy: function(color, callback) {
        		$('#' + color + '-portal').addClass('disappear').one(animationEnd, function() { $(this).remove(); });
            if (callback && (typeof callback == "function")) callback();
        }
      }

      plugin.gun = {
        initialize: function(callback) {
            // Only allow one instance of the portal gun
            if ($gun.length) plugin.gun.destroy();
            // Place the portal gun at the top of the container
            var y = plugin.portal.calculate(0,0).parent.top,
                x = plugin.portal.calculate(0,0).parent.left;
            // Attach the portal gun to the DOM
        		$gun.appendTo('body').css({ top : y, left : x });
          	// Map the portal gun to the cursor
          	$document.on('mousemove', plugin.settings.container + ', .portal div', function(e) {
        			$body.addClass('portal-gun-active');
              plugin.gun.position(e.pageX, e.pageY);
          	}).on('mouseout', plugin.settings.container, function(){
              $body.removeClass('portal-gun-active');
            });
            if (callback && (typeof callback == "function")) callback();
        },
        // Position the portal gun over the cursor, accounting for the proper offset
        position: function(x, y) {
            $gun.css({
              top:  y - ($gun.outerWidth() / 4),
              left: x - ($gun.outerWidth() / 4)
            });
        },
        // Accepts any CSS animation class (e.g. 'fire', 'misfire' or custom)
        animate: function(animation, callback) {
        		$gun.addClass(animation).one(animationEnd, function() { $(this).removeClass(animation); });
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
