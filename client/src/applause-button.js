import "document-register-element/build/document-register-element";

const API = "https://ltxkcod9s9.execute-api.us-east-1.amazonaws.com/production";

const getClaps = () =>
  // TODO: polyfill for IE (not edge)
  fetch(`${API}/get-claps`, {
    headers: {
      "Content-Type": "text/plain"
    }
  }).then(response => response.text());

const updateClaps = claps =>
  // TODO: polyfill for IE (not edge)
  fetch(`${API}/update-claps`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: JSON.stringify(claps)
  }).then(response => response.text());

const arrayOfSize = size => new Array(size).fill(undefined);

// toggle a CSS class to re-trigger animations
const toggleClass = (element, cls) => {
  element.classList.remove(cls);
  setTimeout(() => {
    element.classList.add(cls);
  }, 100);
  setTimeout(() => {
    element.classList.remove(cls);
  }, 1000);
};

const debounce = (fn, delay) => {
  var timer = null;
  return function() {
    var context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(context, args), delay);
  };
};

// https://github.com/WebReflection/document-register-element#v1-caveat
class HTMLCustomElement extends HTMLElement {
  constructor(_) {
    return (_ = super(_)).init(), _;
  }
  init() {}
}

const MAX_MULTI_CLAP = 10;

class ApplauseButton extends HTMLCustomElement {
  connectedCallback() {
    this.classList.add("loading");
    this.style.display = "block";
    // when the color of the button is set via its color property, various
    // style properties are set on style-root, which are then inherited by the child elements
    this.innerHTML = `
      <div class="style-root">
        <div class="shockwave"></div>
        <div class="count"></div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-549 338 100.1 125">
          <path d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z"/>
          <path d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9"/>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 20 20">
          <g class="sparkle">
          ${arrayOfSize(5)
            .map(s => `<g><circle cx="0" cy="0" r="1"/></g>`)
            .join("")}
          </g>
        </svg>
      </div>
      `;

    this._styleRootElement = this.querySelector(".style-root");
    this._countElement = this.querySelector(".count");
    this._updateRootColor();
    this._totalClaps = 0;

    this._bufferedClaps = 0;
    this._updateClaps = debounce(() => {
      if (this._totalClaps < MAX_MULTI_CLAP) {
        const increment = Math.min(
          this._bufferedClaps,
          MAX_MULTI_CLAP - this._totalClaps
        );
        updateClaps(increment);
        this._totalClaps += increment;
        this._bufferedClaps = 0;
      }
    }, 2000);

    this.addEventListener("mousedown", () => {
      this.classList.add("clapped");
      if (this.classList.contains("clap-limit-exceeded")) {
        return;
      }

      toggleClass(this, "clap");
      this._bufferedClaps++;
      this._updateClaps();

      setTimeout(() => {
        this._countElement.innerHTML = Number(this._countElement.innerHTML) + 1;
      }, 250);

      if (this.multiclap) {
        if (this._bufferedClaps + this._totalClaps >= MAX_MULTI_CLAP) {
          this.classList.add("clap-limit-exceeded");
        }
      } else {
        this.classList.add("clap-limit-exceeded");
      }
    });

    getClaps().then(claps => {
      this.classList.remove("loading");
      this._countElement.innerHTML = Number(claps);
    });
  }

  get color() {
    return this.getAttribute("color");
  }

  set color(color) {
    if (color) {
      this.setAttribute("color", color);
    } else {
      this.removeAttribute("color");
    }
    this._updateRootColor();
  }

  get multiclap() {
    return this.getAttribute("multiclap") === "true";
  }

  set multiclap(multiclap) {
    if (multiclap) {
      this.setAttribute("multiclap", multiclap ? "true" : "false");
    } else {
      this.removeAttribute("multiclap");
    }
  }

  static get observedAttributes() {
    return ["color"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this._updateRootColor();
  }

  _updateRootColor() {
    if (!this._styleRootElement) {
      return;
    }
    const rootColor = this.getAttribute("color") || "green";
    const style = this._styleRootElement.style;
    style.fill = rootColor;
    style.stroke = rootColor;
    style.color = rootColor;
  }
}

customElements.define("applause-button", ApplauseButton);
