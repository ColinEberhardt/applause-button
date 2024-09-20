# Applause Button

[![Backers on Open Collective](https://opencollective.com/applause-button/backers/badge.svg)](#backers)
 [![Sponsors on Open Collective](https://opencollective.com/applause-button/sponsors/badge.svg)](#sponsors)
 [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

A zero-configuration button for adding applause / claps / kudos to web pages and blog-posts.

## Minimal example

The applause button is a custom element that can be added directly to the page. Here is a minimal example:

```html
<head>
  <!-- add the button style & script -->
  <link rel="stylesheet" href="dist/applause-button.css" />
  <script src="dist/applause-button.js"></script>
</head>
<body>
  <!-- add the button! -->
  <applause-button style="width: 58px; height: 58px;"/>
</body>
```

The above will render an applause button, persisting claps and clap counts. 

For more information, visit the [project website](https://colineberhardt.github.io/applause-button/);

## Development

![Node LTS](https://img.shields.io/node/v-lts/applause-button?logo=nodedotjs)

Clone this repo and install dependencies via yarn:

~~~
$ yarn
~~~

Use `yarn test` to run the test suite. These use Jest as the test runner, and Puppeteer as a headless Chrome instance,
allowing the applause button to make API requests (with appropriate responses faked within the test code).

You can build project and start watching the `src` folder for changes as follows:

~~~
$ yarn run watch
~~~

Run `yarn test:server` to start a dev server in another process. 


### Releases

All releases are created automatically via
[semantic release](https://github.com/semantic-release/semantic-release)
running on Travis.


## Contributors

This project exists thanks to all the people who contribute. 
<a href="https://github.com/ColinEberhardt/applause-button/graphs/contributors"><img src="https://opencollective.com/applause-button/contributors.svg?width=890&button=false" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/applause-button#backer)]

<a href="https://opencollective.com/applause-button#backers" target="_blank"><img src="https://opencollective.com/applause-button/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website.
[[Become a sponsor](https://opencollective.com/applause-button#sponsor)]

<a href="https://opencollective.com/applause-button/sponsor/0/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/applause-button/sponsor/1/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/applause-button/sponsor/2/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/applause-button/sponsor/3/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/applause-button/sponsor/4/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/applause-button/sponsor/5/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/applause-button/sponsor/6/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/applause-button/sponsor/7/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/applause-button/sponsor/8/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/applause-button/sponsor/9/website" target="_blank"><img src="https://opencollective.com/applause-button/sponsor/9/avatar.svg"></a>


