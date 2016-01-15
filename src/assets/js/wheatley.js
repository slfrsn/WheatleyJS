/*!
 * CSS Portals, v1.0a (http://github.com/scfrsn)
 * Copyright 2016 Stef Friesen (http://frsn.ca)
 * Licensed under the MIT license
 * Last Updated: 1/14/2016, 1:32:43 PM
 */

(function($) {
    $.portals = function(element, options) {
      var plugin = this,
			  $element = $(element),
         element = element,
			  settings = {};
      // Establish our default settings
      var defaults = {
        restrictGun: false,
        portalSize: 100
      }

      plugin.init = function() {
        settings = $.extend({}, defaults, options);
      	// Attach the portal gun to the DOM
				var gun = $('<div id="portal-gun"></div>');
        // The restrictGun boolean dictates whether we attach the portal
        // gun to the element, or let it roam free on the body
				if (settings.restrictGun == true) {
					gun.appendTo(element);
				} else {
					gun.appendTo('body');
          $('body').addClass('disable-cursor');
				}

        // Listen for left / right clicks on the element
        // Left click to create a blue portal, right click for orange
        $('body *').on('click contextmenu', function(e) {
          e.stopPropagation();
          if ($(e.target).is(element, element + ' *')) {
            if(e.type == 'click')       plugin.createPortal('blue',   e.pageX, e.pageY);
            if(e.type == 'contextmenu') plugin.createPortal('orange', e.pageX, e.pageY);
            return false;
          } else {
		        plugin.portalGun('misfire');
            // Disable the context menu everywhere if the gun is not restricted
				    if (settings.restrictGun == false) return false;
          }
        });

        // Listen for left / right clicks on existing portals
        // Left click to destroy a blue portal, right click for orange
        $(document).on('click contextmenu', '.portal *', function(e) {
          e.stopPropagation();
          if(e.type == 'click') {
            if ($(e.target).is('#blue-portal *')) {
              plugin.destroyPortal('blue');
              plugin.portalGun('fire');
            } else {
              plugin.portalGun('misfire');
            }
          }
          if(e.type == 'contextmenu') {
            if ($(e.target).is('#orange-portal *')) {
              plugin.destroyPortal('orange')
              plugin.portalGun('fire');
            } else {
              plugin.portalGun('misfire');
            }
          }
          return false;
        });

      	// Map the portal gun to the cursor
        // Default: restrict the gun to the entire page (body)
        var gunZone = 'body';
        if (settings.restrictGun == true) gunZone = element, element + ' *';
      	$(gunZone).on('mousemove', function(e){
  				plugin.portalGun('activate');
      		gun.css({
      			top:  e.pageY - (gun.outerWidth() / 4),
      			left: e.pageX - (gun.outerWidth() / 4)
          });
      	});
      	$(gunZone).on('mouseout', function(e){
  				plugin.portalGun('deactivate');
      	});
      }

      plugin.createPortal = function(color, x, y) {
		    var template =
	    	'<div id="' + color + '-portal" class="portal appear">' +
          '<div class="darkest"></div>' +
          '<div class="darker"></div>' +
          '<div class="normal"></div>' +
          '<div class="lighter"></div>' +
          '<div class="lightest"></div>' +
          '<div class="entrance"></div>' +
	      '</div>';

        // Prevent the portals from spilling over the edges of the element
        // .offset() and .position() won't work for this because any margins, padding, etc.
        // will throw off the offset.
        var bounds = getBounds(x, y);
        // Upper constraints
        if (bounds.portal.left < bounds.element.left)     x = bounds.element.left + bounds.portal.center.x;
        if (bounds.portal.top < bounds.element.top)       y = bounds.element.top + bounds.portal.center.y;
        // Lower constraints
        if (bounds.portal.right > bounds.element.right)   x = bounds.element.right - bounds.portal.center.x;
        if (bounds.portal.bottom > bounds.element.bottom) y = bounds.element.bottom - bounds.portal.center.y;

        // Prepare the updated coordinates and dimensions to apply to the new portal
        var portalStyles = {
          width  : settings.portalSize + 'px',
          height : settings.portalSize + 'px',
          // Subtracting half the portal size centers it over the cursor
          top  : y - (settings.portalSize / 2),
          left : x - (settings.portalSize / 2)
        }

        // Check if the portal already exists
        // If it exists, move it. If it doesn't create it
      	if($('#' + color + '-portal').length) {  // Portal exists, move it!
  		    // Clone the portal to restart the CSS animation
  		    var oldPortal = $('#' + color + '-portal');
  		        newPortal = oldPortal.clone(true);
  		    // Add the new portal to the DOM and destroy the old one
          // 1. Invoke the .disappear animation, 2. Insert the new portal, 3. Remove the old portal
  		    oldPortal.removeClass('appear').addClass('disappear').before(newPortal).remove();
  		    // Update the new portal's positioning and size
  		    newPortal.css(portalStyles);
        } else { // Portal doesn't exist, create it!
  		    $(template).appendTo('body').css(portalStyles);
        }

        // Invoke the portal gun animation: fire
				plugin.portalGun('fire');
      }

		  plugin.destroyPortal = function(color) {
        var portal = $('#' + color + '-portal');
				portal.addClass('disappear');
				portal.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
					$(this).remove();
				});
			}

		  plugin.portalGun = function(action) {
        // Invoke the portal gun's animations
        if (action == 'fire' || action == 'misfire') {
  				$('#portal-gun').addClass(action);
  				$('#portal-gun').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
  					$(this).removeClass(action);
  				});
        }
        // Add / remove the .portal-gun-active class from the body
        if (action == 'activate')   $('body').addClass('portal-gun-active');
        if (action == 'deactivate') $('body').removeClass('portal-gun-active');
			}

      var getBounds = function(x, y) {
        var center = {
          y : settings.portalSize * 1.3 / 2, // Multiplier accounts for the scaleY() transform
          x : settings.portalSize / 2
        };
        var bounds = {
          portal: {
            top      : y - center.y,
            left     : x - center.x,
            bottom   : y + center.y,
            right    : x + center.x,
            center: {
              y : center.y,
              x : center.x
            }
          },
          element: {
            top    : $element.offset().top,
            left   : $element.offset().left,
            bottom : $element.offset().top + $element.outerHeight(),
            right  : $element.offset().left + $element.outerWidth()
          }
        };
        return bounds;
      }

      plugin.init();
    }

    $.fn.portals = function(options) {
      return this.each(function() {
        if (undefined == $(this).data('portals')) {
          var plugin = new $.portals(this, options);
          $(this).data('portals', plugin);
        }
      });
    }

})(jQuery);
