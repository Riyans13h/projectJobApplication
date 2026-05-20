const major = Number.parseInt(process.versions.node.split(".")[0], 10);

if (major < 18 || major >= 23) {
  console.error(`JobFlow frontend requires Node >=18.17 and <23. Current Node: ${process.version}`);
  console.error("Run: source ~/.nvm/nvm.sh && nvm use");
  process.exit(1);
}
