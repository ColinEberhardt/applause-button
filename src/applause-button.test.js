const toHaveClass = async (elm, expectClassName) => {
  if (!elm) {
    throw new Error(`expect toHaveClass value is null`);
  }

  const className = await elm
    .getProperty("className")
    .then((a) => a.jsonValue());
  const classArray = className.split(" ");
  const pass = classArray.indexOf(expectClassName) !== -1;

  return {
    message: () =>
      `expected to ${pass ? "not " : ""}have css class "${expectClassName}"`,
    pass,
  };
};

expect.extend({
  toHaveClass,
});

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let postData;

const createPage = async (pause = false) => {
  page = await browser.newPage();
  page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.url().startsWith("https://api.applause-button.com/get-claps")) {
      if (pause) {
        setTimeout(() => {
          request.abort();
        }, 500);
      } else {
        request.respond({
          status: 200,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: "44",
        });
      }
    } else if (
      request.url().startsWith("https://api.applause-button.com/update-claps")
    ) {
      postData = request.postData();
      request.respond({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: "44",
      });
    } else {
      request.continue();
    }
  });
  await page.goto("http://localhost:8080");
};

const clickTheButton = async () =>
  await page.evaluate(() => {
    document
      .querySelector("applause-button")
      .dispatchEvent(new MouseEvent("mousedown"));
  });

describe("Applause button", () => {
  describe("initialisation", () => {
    it("updates the clap count with the server-returned value", async () => {
      await createPage();
      const count = await page.$eval(".count", (element) => element.innerHTML);
      await expect(count).toEqual("44");
    });

    it("initialises in loading state", async () => {
      await createPage(true);
      const button = await page.$("applause-button");
      await expect(button).toHaveClass("loading");
    });

    it("removes loading state when clap count retrieved", async () => {
      await createPage();
      const button = await page.$("applause-button");
      await expect(button).not.toHaveClass("loading");
    });

    it("is not in clapped state", async () => {
      await createPage();
      const button = await page.$(".style-root");
      await expect(button).not.toHaveClass("clapped");
    });

    it("initial clap count resolves to the server-returned value", async () => {
      await createPage();
      const initialClapCount = await page.$eval(
        "applause-button",
        (e) => e.initialClapCount
      );
      const clapCount = await initialClapCount;
      expect(clapCount).toEqual(44);
    });
  });

  describe("clicked", () => {
    it("updates clapped state", async () => {
      await createPage();
      await clickTheButton();
      const button = await page.$("applause-button");
      await expect(button).toHaveClass("clapped");
    });

    it("send the updated clap count to the server", async () => {
      await createPage();
      await clickTheButton();
      await pause(2200);
      expect(postData).toEqual('"1,3.3.0"');
    });

    it("ensure that only a single clap is registered if not in multiclap mode", async () => {
      await createPage();
      await page.evaluate(() => {
        document.querySelector("applause-button").multiclap = false;
      });
      await clickTheButton();
      await clickTheButton();
      await pause(2200);
      expect(postData).toEqual('"1,3.3.0"');
    });

    it("ensure the max clap count is not exceeded when multiclapping", async () => {
      await createPage();
      for (let i = 0; i < 15; i++) {
        await clickTheButton(page);
      }
      await pause(2200);
      expect(postData).toEqual('"10,3.3.0"');
    });
  });
});
