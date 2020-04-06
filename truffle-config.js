module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    },
    live: {
      host: "192.168.1.23",
      port: 8042,
      network_id: "*",
    },
    second: {
      host: "192.168.1.23",
      port: 8043,
      network_id: "*",
    },
    test: {
      host: "127.0.0.1",
      port: 8545
    }
  }
};
