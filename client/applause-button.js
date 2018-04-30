class ApplauseButton extends HTMLElement {
  clap() {
    console.log("Apes are great!");
  }

  connectedCallback() {
    const xhr = new XMLHttpRequest();

    this.innerHTML = "<b>claps = <span>?</span></b>";

    this.addEventListener("mouseup", () => {
      xhr.open(
        "POST",
        "https://rkqvakocg4.execute-api.us-east-1.amazonaws.com/dev/test"
      );
      xhr.responseType = "text";
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.response);
          const claps = response.claps;
          const span = this.querySelector('span');
          span.innerHTML = claps;
        }
      };
      xhr.send(JSON.stringify({claps: 5}));
    });


    
    
    // TODO: convert this to a GET request
    xhr.open(
      "POST",
      "https://rkqvakocg4.execute-api.us-east-1.amazonaws.com/dev/test"
    );
    xhr.responseType = "text";
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.response);
        const claps = response.claps;
        const span = this.querySelector('span');
        span.innerHTML = claps;
      }
    };
    xhr.send();
  }
}

window.customElements.define("applause-button", ApplauseButton);
