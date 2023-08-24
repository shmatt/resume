const nunjucks = require("nunjucks");
const fs = require("fs");
const yaml = require("js-yaml");
const http = require("http");
const process = require("process");

const render = (resume) => {

  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader('templates'),
    { autoescape: false }
  );

  env.addFilter("slugify", (str) => {
    return str
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  });

  try {
    return env.render("theme.njk", resume);
  } catch (e) {
    console.log(e);
  }

  return null;

};

const renderResumeYml = () => {

  const resume = yaml.load(fs.readFileSync("resume.yml", "utf8"));
  const html = render(resume);

  return html;
};

const writeResume = () => {

  const html = renderResumeYml();

  if(!html) {
    return;
  }

  //Create out directory if it doesn't exist
  if (!fs.existsSync("out")) {
    fs.mkdirSync("out");
  }

  fs.writeFileSync("out/index.html", html);
};

const watch = () => {
  fs.watchFile("resume.yml", () => {
    console.log("resume.yml changed, re-rendering...");
    writeResume();
  });
  fs.watchFile("templates/theme.njk", () => {
    console.log("theme.njk changed, re-rendering...");
    writeResume();
  });
  console.log("Watching resume.yml and theme.njk for changes...");
};

const serve = () => {

  const host = 'localhost';
  const port = 4200;

  const requestListener = function (req, res) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      var html = renderResumeYml(); 
      res.end(html);
  };

  const server = http.createServer(requestListener);
  server.listen(port, host, () => {
      console.log(`Server is running on http://${host}:${port}`);
  });
};

const watchOn = process.argv.indexOf("--watch") > -1;
const serveOn = process.argv.indexOf("--serve") > -1;

writeResume();

if(watchOn) watch();
if(serveOn) serve();

if(watchOn || serveOn) {

  console.log("Press any key to exit...");

  // wait for keypress to exit
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", process.exit.bind(process, 0));

}

exports.render = render;
exports.renderResumeYml = renderResumeYml;