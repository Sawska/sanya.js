const http = require("http");
const fs = require("fs");

function sanya() {
  return new Server();
}

class Server {
  constructor(port = 3000, hostName = "localhost") {
    this.port = port;
    this.hostName = hostName;
    this.http = http.createServer(this.request.bind(this));
    this.path = ""
  }

  get(url, callback) {
    this.addRoute("GET", url, callback);
  }

  post(url,callback) {
    this.addRoute("POST",url,callback)
  }

  put(url,callback) {
    this.addRoute("PUT",url,callback)
  }

  delete(url,callback) {
    this.addRoute("DELETE",url,callback)
  }

  views(path) {
    this.path =  `${__dirname}/` + path;
  }

  addRoute(method, url, callback) {
    this.routes = this.routes || [];
    this.routes.push({ method, url, callback });
  }

  listen(...args) {
    // this.http.listen(port,host,callback);
    if(args.length == 0) this.http.listen(this.port,this.hostName)
    if(args.length == 3) {
      this.http.listen(args[0],args[1],args[2])
    }
    else {
      try {
        let callback;
      for(let i = 0;i<args.length;i++) {
        if( typeof args[i] == "number") this.port = args[i]
        if(typeof args[i] == "string") this.hostName = args[i]
        if(typeof args[i] == "function") callback = args[i]
      }
      this.http.listen(this.port,this.hostName,callback)
      } catch {
        throw new Error("bad properties")
      }
    }
  }
  request(req, res) {
    res.send = (text) => res.end(text);
    res.json = (json) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(json));
    };

    res.render = function (html) {
      fs.readFile(`${this.path}/${html}.html`, (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Rendering err");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }.bind(this); 

    if (req.method != "GET") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          req.body = JSON.parse(body);
          const route = this.findRoute(req.method, req.url);

          if (route) {
            route.callback(req, res);
          } else {
            res.statusCode = 404;
            res.send("Not found");
          }
        } catch (error) {
          res.statusCode = 400;
          res.send("Invalid JSON data");
        }
      });
    } else {
      const route = this.findRoute(req.method, req.url);
      if (route) {
        route.callback(req, res);
      } else {
        res.statusCode = 404;
        res.send("Not found");
      }
    }
  }

  findRoute(method, url) {
    if (!this.routes) return null;
    for (let route of this.routes) {
      const isMethodMatch = route.method === method || route.method === "ALL";
      const isUrlMatch = route.url === url || route.url === "ALL" || route.url === "*";
      if (isMethodMatch && isUrlMatch) {
        return route;
      }
    }
    return null;
  }
}

module.exports = sanya




