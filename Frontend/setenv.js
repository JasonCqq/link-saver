const setEnv = () => {
  const fs = require("fs");
  const writeFile = fs.writeFile;
  const targetPath = "./src/environments/environment.ts";

  require("dotenv").config({
    path: "src/environments/.env",
  });

  const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}',
  };
  `;
  writeFile(targetPath, envConfigFile, (err) => {
    if (err) {
      console.error(err);
      throw err;
    }
  });
};
setEnv();
