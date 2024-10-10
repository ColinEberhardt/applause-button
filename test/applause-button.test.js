const {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} = require("@jest/globals");

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

const VERSION = process.env.npm_package_version;
const BASE_URL = "https://api.applause-button.com";
let serverClapCount;

const loadPage = async (pause = false) => {
  await jestPuppeteer.resetPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.url().startsWith(`${BASE_URL}/get-claps`)) {
      if (pause) {
        setTimeout(() => {
          request.abort();
        }, 500);
      } else {
        request.respond({
          status: 200,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: `${serverClapCount}`,
        });
      }
    } else if (request.url().startsWith(`${BASE_URL}/update-claps`)) {
      serverClapCount += Number(request.postData().split(",")[0]);
      request.respond({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: `${serverClapCount}`,
      });
    } else {
      request.continue();
    }
  });
  await page.goto("http://localhost:8080");
};

describe("Applause button", () => {
  beforeEach(() => {
    serverClapCount = 3;
  });

  describe("loading", () => {
    it("initialises in loading state", async () => {
      await loadPage(true);
      const applauseButton = await page.$("applause-button");
      await expect(applauseButton).toHaveClass("loading");
    });
  });

  describe("initialised", () => {
    beforeAll(async () => {
      await loadPage();
    });

    it("updates the clap count with the server-returned value", async () => {
      const clapCount = await page.$eval(
        ".clap-count",
        (element) => element.innerHTML
      );
      expect(clapCount).toEqual(`${serverClapCount}`);
    });

    it("removes loading state when clap count retrieved", async () => {
      const applauseButton = await page.$("applause-button");
      await expect(applauseButton).not.toHaveClass("loading");
    });

    it("is not in clapped state", async () => {
      const applauseButton = await page.$("applause-button");
      await expect(applauseButton).not.toHaveClass("clapped");
    });

    it("initial clap count resolves to the server-returned value", async () => {
      const initialClapCount = await page.$eval(
        "applause-button",
        (e) => e.initialClapCount
      );
      const clapCount = await initialClapCount;
      expect(clapCount).toEqual(serverClapCount);
    });
  });

  describe("clicked", () => {
    // default 5000ms is dangerously close to our longest test runs!
    const timeout = 10000;
    let clapButton;

    beforeEach(async () => {
      await loadPage();
      clapButton = page.locator(
        '::-p-aria([role="button"][name="applaud post"])'
      );
    });

    it("updates clapped state", async () => {
      await clapButton.click();
      const applauseButton = await page.$("applause-button");
      await expect(applauseButton).toHaveClass("clapped");
    });

    it("updates clap count on the page", async () => {
      const initialCount = serverClapCount;
      await clapButton.click();
      await page.waitForSelector(`.clap-count::-p-text(${initialCount + 1})`);
    });

    it(
      "sends the updated clap count to the server",
      async () => {
        await clapButton.click();
        const request = await page.waitForRequest((request) =>
          request.url().startsWith(`${BASE_URL}/update-claps`)
        );
        expect(request.postData()).toEqual(`"1,${VERSION}"`);
      },
      timeout
    );

    it(
      "only a single clap is registered if not in multiclap mode",
      async () => {
        await page.evaluate(() => {
          document.querySelector("applause-button").multiclap = false;
        });
        await clapButton.click({ count: 3, delay: 5 });
        const request = await page.waitForRequest((request) =>
          request.url().startsWith(`${BASE_URL}/update-claps`)
        );
        expect(request.postData()).toEqual(`"1,${VERSION}"`);
      },
      timeout
    );

    it(
      "max clap count is not exceeded when multiclapping",
      async () => {
        await clapButton.click({ count: 11, delay: 5 });
        const request = await page.waitForRequest((request) =>
          request.url().startsWith(`${BASE_URL}/update-claps`)
        );
        expect(request.postData()).toEqual(`"10,${VERSION}"`);
      },
      timeout
    );
  });
});
