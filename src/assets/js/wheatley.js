/*!
 * CSS Portals, v1.0a (http://github.com/scfrsn)
 * Copyright 2016 Stef Friesen (http://frsn.ca)
 * Licensed under the MIT license
 * Last Updated: 1/18/2016, 10:30:15 AM
 */

(function($) {
    $.portals = function(element, options) {
      var plugin = this,
			  $element = $(element),
         element = element;

      // Establish our default settings
      var defaults = {
        portalSize     : 200,
        restrictGun    : false,
        animatePortals : true,
        highQuality    : true
      };

      plugin.settings = {};

      /**
       * Initialize the plugin.
       * Creates the portal gun and sets up the event
       * listeners for click, contextmenu (right click), and mousemove.
       */
      plugin.init = function() {
        plugin.settings = $.extend({}, defaults, options);
        $('body').addClass('frsn-portals');
        if (plugin.settings.highQuality == true) $('body').addClass('high-quality');
        // Initialize the portal gun
        plugin.portalGun('init');
        // Listen for left / right clicks on the element
        // Left click to create a blue portal, right click for orange
        $('.frsn-portals').on('click contextmenu', function(e) {
          e.stopPropagation();
          if ($(e.target).is(element, element + ' *')) {
            if(e.type == 'click')       plugin.portal('create', 'blue',   { x : e.pageX, y : e.pageY });
            if(e.type == 'contextmenu') plugin.portal('create', 'orange', { x : e.pageX, y : e.pageY });
            return false;
          } else {
		        plugin.portalGun('misfire');
            // Disable the context menu everywhere if the gun is not restricted
				    if (plugin.settings.restrictGun == false) return false;
          }
        });
        // Listen for left / right clicks on existing portals
        // Left click to destroy a blue portal, right click for orange
        $('.frsn-portals').on('click contextmenu', '.portal *', function(e) {
          e.stopPropagation();
          // Listen for left clicks
          if(e.type == 'click') {
            if ($(e.target).is('#blue-portal *')) {
              plugin.portal('destroy', 'blue');
              plugin.portalGun('fire');
            } else {
              plugin.portalGun('misfire');
            }
          } // Listen for right clicks
          if(e.type == 'contextmenu') {
            if ($(e.target).is('#orange-portal *')) {
              plugin.portal('destroy', 'orange')
              plugin.portalGun('fire');
            } else {
              plugin.portalGun('misfire');
            }
          }
          return false;
        });
      }

      /**
       * Destroys the portal gun and portal elements, unbinds the event
       * listeners, and removes the plugin data from the element.
       * @param {function} [callback] - Function to run upon completion.
       */
      plugin.destroy = function(callback) {
        plugin.portalGun('destroy');
        plugin.portal('destroy', 'blue');
        plugin.portal('destroy', 'orange');
        $('.frsn-portals').off('click contextmenu');
        $('.frsn-portals').off('click contextmenu', '.portal *');
        $element.removeData();
        // Run the call back function
        if (callback && (typeof callback == "function")) callback();
      }

      /**
       * Represents the portals.
       * @param {string} action - What the portal gun should do
       * @param {string} color - The color to target (blue or orange)
       * @param {object} [coordinates] - Where to place the portal (e.g. { x:0, y:0 })
       * @param {function} [callback] - Function to run upon completion.
       */
      plugin.portal = function(action, color, coordinates, callback) {
        // The coordinates and callback arguments are optional
        // Check the quantity of arguments and make sure the proper
        // argument is passed if others are missing
        if (arguments.length == 2) {
          coordinates = { x : 0, y : 0 };
          callback = function() {};
        } else if (arguments.length == 3) {
          if (typeof coordinates == 'function') {
            callback = coordinates;
          } else {
            callback = function() {};
          }
        }

        var x = coordinates.x, y = coordinates.y;

      	// Create the portal
      	if (action == 'create') {
          var animation = (plugin.settings.animatePortals == true) ? 'spin' : '';
          var template =
        	'<div id="' + color + '-portal" class="portal appear ' + animation + '">' +
            '<div class="darkest"></div>' +
            '<div class="darker"></div>' +
            '<div class="normal"></div>' +
            '<div class="lighter"></div>' +
            '<div class="lightest"></div>' +
            '<div class="entrance"></div>' +
          '</div>';

          // Prevent the portals from spilling over the edges of the element
          var portalRect = plugin.getPortalRect(x, y);

          // Upper constraints
          if (portalRect.left < portalRect.parent.left) x = portalRect.parent.left + portalRect.center.x;
          if (portalRect.top  < portalRect.parent.top)  y = portalRect.parent.top  + portalRect.center.y;
          // Lower constraints
          if (portalRect.right  > portalRect.parent.right)  x = portalRect.parent.right  - portalRect.center.x;
          if (portalRect.bottom > portalRect.parent.bottom) y = portalRect.parent.bottom - portalRect.center.y;

          // Prepare the updated coordinates and dimensions to apply to the new portal
          var portalStyles = {
            width  : plugin.settings.portalSize + 'px',
            height : plugin.settings.portalSize + 'px',
            // Subtracting half the portal size centers it over the cursor
            top  : y - (plugin.settings.portalSize / 2),
            left : x - (plugin.settings.portalSize / 2)
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
      	// Destroy the portal
      	if (action == 'destroy') {
          var portal = $('#' + color + '-portal');
      		portal.addClass('disappear');
      		portal.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
      			$(this).remove();
      		});
      	}
        // Run the call back function
        callback();
      }

      /**
       * Represents the portal gun.
       * @param {string} action - What the portal gun should do
       * @param {function} [callback] - Function to run upon completion.
       */
      plugin.portalGun = function(action, callback) {
        var gun = $('#portal-gun');
      	// Initialize the portal gun
      	if (action == 'init') {
          // Attach the portal gun to the DOM
      		$('<div id="portal-gun"></div>').appendTo('body');
          $('body').addClass('disable-cursor');
        	// Map the portal gun to the cursor
          // Default: restrict the gun to the entire page (body)
          var gunRestriction = $('body');
          if (plugin.settings.restrictGun == true) { gunRestriction = $element; }
          gunRestriction.addClass('contain-portal-gun')
          // Update portal gun location
        	$('.frsn-portals').on('mousemove', '.contain-portal-gun, .contain-portal-gun *, .portal *', function(e) {
    				plugin.portalGun('setActive');
        		 $('#portal-gun').css({
        			top:  e.pageY - ( $('#portal-gun').outerWidth() / 4),
        			left: e.pageX - ( $('#portal-gun').outerWidth() / 4)
            });
        	});
          // Remove .deactivate class from body when mouse leaves the gun zone
        	$('.frsn-portals').on('mouseout', '.contain-portal-gun', function(e){ plugin.portalGun('setInactive'); });
      	}
        // Invoke the portal gun's animations
        if (action == 'fire' || action == 'misfire') {
      		gun.addClass(action);
      		gun.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
      			$(this).removeClass(action);
      		});
        }
        // Add / remove the .portal-gun-active class from the body
        if (action == 'setActive')   $('body').addClass('portal-gun-active');
        if (action == 'setInactive') $('body').removeClass('portal-gun-active');
      	// Destroy the portal gun
      	if (action == 'destroy') {
          // Unbind event listeners
        	$('.frsn-portals').off('mousemove', '.contain-portal-gun, .contain-portal-gun *, .portal *');
          $('.frsn-portals').off('mouseout', '.contain-portal-gun');
          // Destroy the element
          gun.remove();
        }
        // Run the call back function
        if (callback && (typeof callback == "function")) callback();
      }

      /**
       * Calculates the bounding box, center position, and dimensions of a
       * portal and it's parent element at a given position.
       * .offset() and .position() won't work for this because any margins, padding, etc.
       * will throw it off. This needs to work regardless of the user's layout.
       * @param {number} x - Horizontal position from viewport left
       * @param {number} y - Vertical position from viewport top
       * @return {object}
       */
      plugin.getPortalRect = function(x, y) {
        var center = {
          y : plugin.settings.portalSize * 1.3 / 2, // Multiplier accounts for the scaleY() transform
          x : plugin.settings.portalSize / 2
        };
        var rect = {
          top      : y - center.y,
          left     : x - center.x,
          bottom   : y + center.y,
          right    : x + center.x,
          center: {
            y : center.y,
            x : center.x
          },
          parent: {
            top    : $element.offset().top,
            left   : $element.offset().left,
            bottom : $element.offset().top + $element.outerHeight(),
            right  : $element.offset().left + $element.outerWidth(),
          }
        };
        return rect;
      }

      /**
       * Get/set a plugin option.
       * Get usage: $('#el').demoplugin('option', 'key');
       * Set usage: $('#el').demoplugin('option', 'key', value);
       */
      plugin.option = function(key, value) {
        if (value) {
          plugin.settings[key] = value;
        } else {
          return plugin.settings[key];
        }
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
