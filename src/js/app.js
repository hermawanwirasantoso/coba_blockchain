App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    db: firebase.firestore(),

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        if (window.ethereum) {
            ethereum.enable().then(function () {
            });
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = window.ethereum;
            web3 = new Web3(App.web3Provider);
            App.identifyUser();
        } else {
            // Specify default instance if no web3 instance provided
            // const customNodeOptions = {
            //     rpcUrl: 'http://192.168.1.5:8042',
            //     chainId: 42
            // };
            // let fm = new Fortmatic('pk_test_AFDE79F5F19A4457', customNodeOptions);
            App.web3Provider = new Web3.providers.HttpProvider("http://192.168.1.5:8042");
            web3 = new Web3(App.web3Provider);
            alert("Tolong Install MetaMask Browser Extension pada Browser Anda")
            console.log(web3.eth.getBalance("0xe94770f47ad375fc8e6874547877579f989e452c"));
        }
        return App.initContract();
    },

    identifyUser: function () {
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                App.account = account;
                App.db.collection(user_collection).doc(account).get().then(function (doc) {
                    if (doc.exists) {
                        console.log("Dokumen Ditemukan: ", doc.data());
                        App.updateNamaPengguna();
                    } else {
                        console.log("Dokumen Tidak Ditemukan");
                        App.registerDialog();
                    }
                }).catch(function (error) {
                    console.log("Error Getting Document: ", error);
                });
            }
        });
    },

    registerDialog: function () {
        $("#login-modal").modal('show');
    },

    registerUser: function () {
        let name_input = $("#input-nama").val();
        let email_input = $("#input-email").val();
        if (name_input.length > 0) {
            if (email_input.length > 0) {
                App.db.collection(user_collection).doc(App.account).set({
                    nama_pengguna: name_input,
                    email_pengguna: email_input
                })
                    .then(function () {
                        console.log("Dokumen Berhasil Dibuat");
                        $("#login-modal").modal('hide');
                        App.updateNamaPengguna();
                    })
                    .catch(function (error) {
                        console.error("Gagal Menulis Dokumen: ", error);
                    });
            } else {
                alert("Masukan Alamat E-Mail Anda")
            }
        } else {
            alert("Masukan Nama Anda")
        }
    },

    updateNamaPengguna() {
        App.db.collection(user_collection).doc(App.account).get()
            .then(function (doc) {
                if (doc.exists) {
                    $('#profile-name').html(doc.data().nama_pengguna.toUpperCase());
                    console.log("Nama disesuaikan");
                } else {
                    App.registerDialog();
                }
            }).catch(function (error) {
            console.error("Error getting document: ", error);
        })
    },

    initContract: function () {
        $.getJSON("Certification.json", function (certification) {
            // Instantiate a new truffle contract from the artifact
            App.contracts.Certification = TruffleContract(certification);
            // Connect provider to interact with contract
            App.contracts.Certification.setProvider(App.web3Provider);
        });
    },

    render: function () {
        var electionInstance;
        var loader = $("#loader");
        var content = $("#content");

        loader.show();
        content.hide();

        // Load account data
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {

                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
            }
        });

        // Load contract data
        App.contracts.Election.deployed().then(function (instance) {
            electionInstance = instance;
            return electionInstance.candidatesCount();
        }).then(function (candidatesCount) {
            var candidatesResults = $("#candidatesResults");
            candidatesResults.empty();

            var candidateSelect = $("#candidatesSelect");
            candidateSelect.empty();

            for (var i = 1; i <= candidatesCount; i++) {
                electionInstance.candidates(i).then(function (candidate) {
                    var id = candidate[0];
                    var name = candidate[1];
                    var voteCount = candidate[2];

                    // Render candidate Result
                    var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>";
                    candidatesResults.append(candidateTemplate);

                    var candidateOption = "<option value='" + id + "'>" + name + "</option>";
                    candidateSelect.append(candidateOption);
                });
            }
            return electionInstance.voters(App.account);
        }).then(function (hasVoted) {
            if (hasVoted) {
                $('form').hide();
            }
            loader.hide();
            content.show();
        }).catch(function (error) {
            console.warn(error);
        });
    },
    castVote: function () {
        var candidateId = $('#candidatesSelect').val();
        App.contracts.Election.deployed().then(function (instance) {
            return instance.vote(candidateId, {from: App.account});
        }).then(function (result) {
            $('#content').hide();
            $('#loader').show();
        }).catch(function (err) {
            console.error(err);
        });
    },

    enroll: function () {
        //todo pay class and enroll class

        //bayar class
        App.contracts.Certification.deployed().then(function (instance) {
            return instance.getContractAddress();
        }).then(function (result) {
            console.log(result.receipt.to);
            let contractAddress = result.receipt.to;
            web3.eth.sendTransaction({from: App.account, to: contractAddress ,value: web3.toWei(100, 'ether')}, function (result) {

            });
        }).catch(function (err) {
            console.error(err);
        });

        // enroll class - blockchain

        // enroll class - input ke firestore
        App.db.collection(kelas_pengguna_collection).add({})
    },

    isEnrolled: function () {
        return false;
    },

    showEnrollModal: function () {
        $("#enroll-modal").modal('show');
        App.getCurrentAccountBalance();
    },

    getCurrentAccountBalance: function () {
        web3.eth.getBalance(App.account, function (err, balance) {
            if (err == null) {
                $("#current-balance").html("Uang Anda: " + web3.fromWei(balance)+" WEI");
            }
        });
    },

    getContractAddress: function () {
        App.contracts.Certification.deployed().then(function (instance) {
            return instance.getContractAddress();
        }).then(function (result) {
            console.log(result.receipt.to);
            let contractAddress = result.receipt.to;

        }).catch(function (err) {
            console.error(err);
        });
    }
};
$(function () {
    $(window).on('load', function () {
        App.init();
    });
});
