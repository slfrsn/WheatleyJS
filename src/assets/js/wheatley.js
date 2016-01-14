/*!
 * CSS Portals, v1.0a (http://github.com/scfrsn)
 * Copyright 2016 Stef Friesen (http://frsn.ca)
 * Licensed under the MIT license
 * Last Updated: 1/13/2016, 9:16:44 AM
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
        $(element, element + ' *').on('click contextmenu', function(e) {
          e.stopPropagation();
          var coord = getCoordinates(e, true);
          if(e.type == 'click')       plugin.createPortal('blue',   coord.x, coord.y);
          if(e.type == 'contextmenu') plugin.createPortal('orange', coord.x, coord.y);
          return false;
        });

        // Listen for left / right clicks on existing portals
        // Left click to destroy a blue portal, right click for orange
        $(element, element + ' *').on('click contextmenu', '.portal *', function(e) {
          e.stopPropagation();
          if(e.type == 'click')       plugin.destroyPortal('blue');
          if(e.type == 'contextmenu') plugin.destroyPortal('orange');
          return false;
        });

      	// Map the portal gun to the cursor
        // Default: restrict the gun to the entire page (body)
        var gunZone = 'body';
        if (settings.restrictGun == true) gunZone = element, element + ' *';
      	$(gunZone).on('mousemove', function(e){
          var coord = getCoordinates(e, false);
      		gun.css({
      			top:  coord.y - 20,
      			left: coord.x - 50
          });
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
        var parentWidth = $element.outerWidth(),
           parentHeight = $element.outerHeight(),
            portalWidth = settings.portalSize / 2,
           portalHeight = settings.portalSize * 1.3 / 2; // Accounts for the scaleY() transform
        // Upper constraints
        if (x < portalWidth)  { x = x + (portalWidth - x); }
        if (y < portalHeight) { y = y + (portalHeight - y); }
        // Lower constraints
        if (x > (parentWidth - portalWidth))   { x = parentWidth - portalWidth; }
        if (y > (parentHeight - portalHeight)) { y = parentHeight - portalHeight; }

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
  		    $(template).appendTo(element).css(portalStyles);
        }

				fire();
      }

		  plugin.destroyPortal = function(color) {
        var portal = $('#' + color + '-portal');
				portal.removeClass('appear').addClass('disappear');
				portal.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
					$(this).remove();
				});
			}

      var getCoordinates = function(e, forceOffset) {
    		var x = e.pageX,
    		    y = e.pageY;
        // Subtract the offset of the portal area if the gun is restricted
				if (settings.restrictGun == true || forceOffset == true) {
    		  var offset = $element.offset();
          x = x - offset.left;
          y = y - offset.top;
        }
    		return { x : x, y : y };
      }

      var fire = function() {
				$('#portal-gun').addClass('fire');
				$('#portal-gun').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
					$(this).removeClass('fire');
				});
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
