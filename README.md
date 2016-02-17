# Wheatley.js

**Portal gun, meet the web.** You're thinking: why on _Earth_ would you go through all the trouble of recreating Valve's portals and packaging it up in a jQuery plugin? Well... I... **"Science isn't about _why_, it's about _why not_."** Yeah! What Cave Johnson said. Thanks, Cave! Alright, on to the good stuff...

> **Disclaimer:** This is 110% for fun. It's a project I work on when I need to unwind. As such, browser testing is pretty lax and commits may be seldom. _However_, if you find an issue or have a contribution to make, I'll be all over that. Please don't hesitate to get involved.

#### [LAUNCH THE DEMO!](https://wheatleyjs.github.io)

## Usage

1. Download and include the CSS and Javascript files...

	```html
	<link href="wheatley.min.css" rel="stylesheet">
  <script src="wheatley.min.js"></script>
	```

	**Note**: Wheatley requires jQuery (1.12.0 or newer). Make sure you include jQuery before Wheatley.

2. Initialize Wheatley...

	```javascript
	$('#some-element').wheatley();
	```

## Options

Options can be set during initialization...

```javascript
$('#some-element').wheatley({
	size: 200, // Default: 200
	container: '#some-container' // Default: 'body'
});
```
The following options are currently available. More will be added in the future as Wheatley matures.

| Option        | Default | Description |
| ------------- |:-------:| :-----------|
| **size**      | 200     | Portal width (in pixels) |
| **container** | 'body'  | Restrict movement of the crosshair to this element |

## API

To interact with Wheatley you'll need to target its data on the element you attached it to. If you plan on doing this more than once, it's a good idea to assign a variable. For example...
```javascript
var wheatley = $('#some-element').data('wheatley');
```
For the sake of simplicity, we'll use that variable throughout the rest of this documentation.

**Note:** for methods that accept callback arguments, you can use an anonymous function like the following and it will execute when the method is finished.

```javascript
wheatley.some.method(function(){
	alert('Some method has finished!');
});
```

#### General Methods

- **Initialize:** initializes Wheatley and sets up the mouse click listeners
 - **callback** _Optional:_ Accepts a function to call when it's finished  

```javascript
wheatley.initialize();
```

- **Option:** Sets or returns an option
 - **key** _Required:_ Accepts any valid option as a string (e.g. ```size``` or ```container```)
 - **value** _Optional:_ Accepts a value to update the option with  

```javascript
wheatley.option('size'); // Returns 200, the default option for portal size
wheatley.option('size', 400); // Updates the portal size to 400
```

- **Locate:** Returns the coordinates for all of the Wheatley components currently on the page. If an element doesn't exist on the page its value in the object will be null.  

```javascript
wheatley.locate(); // Returns the following object format...
{
	blue:      { top: 555, left: 289, bottom: 815, right: 489 },
	crosshair: { top: 237.75, left: -31.25 },
	orange:    { top: 555, left: 671, bottom: 815, right: 871 },
	parent:    { top: 555, left: 289, bottom: 843, right: 1326 }
}
```

- **Destroy:** Destroys the Wheatley instance and resets the changes it made to the DOM
 - **callback** _Optional:_ Accepts a function to call when it's finished  

```javascript
wheatley.destroy();
```

#### Portal Methods

- **Create:** Create a portal of the specified colour at the specified coordinates  
 - **colour** _Required:_ Accepts ```'blue'``` or ```'orange'```
 - **coordinates** _Optional:_ Accepts an object of x, y values. These coordinates are relative to the element we've attached Wheatley to. Default is ```{ x: 0, y: 0 }```
 - **callback** _Optional:_ Accepts a function to call when it's finished  

```javascript
wheatley.portal.create('blue'); // Creates a blue portal at 0,0
wheatley.portal.create('blue', {x: 10, y: 20}); // Creates a blue portal at 10,20
```

- **Destroy:** Destroys the portal  
 - **colour** _Required:_ Accepts ```'blue'``` or ```'orange'```
 - **callback** _Optional:_ Accepts a function to call when it's finished  

```javascript
wheatley.portal.destroy('orange'); // Destroys the orange portal
```

#### Crosshair Methods

- **Initialize:** Initializes the crosshair and starts listening to mouse movement
 - **callback** _Optional:_ Accepts a function to call when it's finished  

```javascript
wheatley.crosshair.initialize();
```

- **Animate:** Triggers a CSS animation on the crosshair element
 - **animation** _Required:_ any CSS animation class name, default behaviour is to use ```'.misfire'```, the animation bundled with Wheatley.
 - **callback** _Optional:_ Accepts a function to call when the animation has finished  

```javascript
wheatley.crosshair.animate('misfire'); // Triggers the misfire animation
```

- **Destroy:** Destroys the crosshair
 - **callback** _Optional:_ Accepts a function to call when it's finished  

```javascript
wheatley.crosshair.destroy();
```

## Road Map

- [ ] Add support for relevant browsers (e.g. the crosshair relies on ```pointer-events: none``` and IE 10 and under don't support it)
- [ ] Add support for touch devices (1-point touch for blue portals, 2-point touch for orange)
- [ ] Add the ability to "throw" objects into one portal and exit the opposite portal while maintaining kinetic motion

## Contributing

Contributions are welcome! And encouraged! Help me check some of those road map items off my list, or submit an issue or pull request if you find a bug.

## License

Copyright © 2016 [slfrsn](https://github.com/slfrsn) - [The MIT License (MIT)](https://opensource.org/licenses/MIT)
