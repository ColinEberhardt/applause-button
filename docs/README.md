# Applause Button

A zero-configuration button for adding applause / claps / kudos to web pages and blog-posts.

## Minimal example

The applause button is a custom element that can be added directly to the page. Here is a minimal example:

```html
<head>
  <!-- add the button style & script -->
  <link rel="stylesheet" href="dist/style.css" />
  <script src="dist/applause-button.js"></script>
</head>
<body>
  <!-- add the button! -->
  <applause-button style="width: 58px; height: 58px;"/>
</body>
```

The above will render an applause button, persisting claps and clap counts. 

## Styling / Config

Notes:

 - Style the button to ensure it is square
 - Set its colour via the `color` attribute
 - You can enable multi-clap via the `multiclap` attribute

## TODO

 - perhaps add a loading state? i.e. don't enable the button until the clap count is retreived
