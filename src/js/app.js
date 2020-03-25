App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    db: firebase.firestore(),
    isMyClass: false,
    isModuleClass: false,
    isMyCertificate: false,
    classPrice: 200,
    monthNames : [
        "Januari", "Februari", "Maret",
        "April", "Mei", "Juni", "Juli",
        "Agustus", "September", "Oktober",
        "November", "Desember"
    ],

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
            if (App.isMyClass) {
                App.showEnrolledClass();
            }
            if (App.isModuleClass){
                App.isEnrolled();
            }
            if (App.isMyCertificate){
                App.getMyPublishedCertificate();
            }
            App.getOwnerAddress();
        });
        // $.getJSON("Election.json", function (election) {
        //     // Instantiate a new truffle contract from the artifact
        //     App.contracts.Election = TruffleContract(election);
        //     // Connect provider to interact with contract
        //     App.contracts.Election.setProvider(App.web3Provider);
        //     App.render();
        // });
    },


    showEnrolledClass: function () {
        var certificationInstance;
        App.contracts.Certification.deployed().then(function (instance) {
            certificationInstance = instance;
            return certificationInstance.classCount(App.account);
        }).then(function (classCount) {
            console.log("CLASS COUNT: " + classCount);
            var classList = [];
            for (let i = 0; i < classCount; i++) {
                certificationInstance.enrolledClass(App.account, i).then(function (kelas) {
                    console.log(kelas[0]);
                    console.log("Selesai "+kelas[2]);
                    classList.push(kelas[0]);
                }).then(function () {
                    if ((i + 1) == classCount) {
                        console.log(classList);
                        console.log(classList.length);
                        loadEnrolledClass(classList);
                    }
                })
            }
        }).catch(function (err) {
            console.error(err);
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

    enroll: function (classId) {
        //todo pay class and enroll class

        //bayar class
        let certificationInstance;
        App.contracts.Certification.deployed().then(function (instance) {
            certificationInstance = instance;
            return certificationInstance.contractAddress();
        }).then(function (result) {
            web3.eth.sendTransaction({
                from: App.account,
                to: result,
                value: web3.toWei(App.classPrice, 'ether')
            }, function (result) {
                $('#loading').show();
                certificationInstance.enrollClass(web3.toWei(App.classPrice, 'ether'), classId, {from: App.account})
                    .then(function (result) {
                        $('#enroll-modal').modal('hide');
                        console.log("MODAL HIDE");
                        window.location.replace('module_kelas.html?'+classId);
                    });
            });
        }).catch(function (err) {
            console.error(err);
        });

        // enroll class - blockchain

        // enroll class - input ke firestore
        // App.db.collection(kelas_pengguna_collection).add({})
    },

    isEnrolled: function () {
        var certificationInstance;
        App.contracts.Certification.deployed().then(function (instance) {
            certificationInstance = instance;
            return certificationInstance.classCount(App.account);
        }).then(function (classCount) {
            let isModuleShowed = false;
            if (classCount>0) {
                for (let i = 0; i < classCount; i++) {
                    certificationInstance.enrolledClass(App.account, i).then(function (kelas) {
                        if (isModuleShowed ===false) {
                            if (kelas[0] === classId) {
                                showModules(true);
                                console.log("TRUE");
                                isModuleShowed = true;
                            } else if ((i + 1) == classCount) {
                                showModules(false);
                                console.log("FALSE");
                                isModuleShowed = true;
                            }
                            console.log("I+1 = " + (i + 1));
                            console.log("classCount = " + classCount);
                        }
                    })
                }
            }else {
                showModules(false);
            }
        }).catch(function (err) {
            console.error(err);
        });
    },

    showEnrollModal: function () {
        $("#loading").hide();
        $("#enroll-modal").modal('show');
        $("#harga-kelas").html("Harga Kelas: " + App.classPrice + " WEI");
        App.getCurrentAccountBalance();

    },

    getCurrentAccountBalance: function () {
        web3.eth.getBalance(App.account, function (err, balance) {
            if (err == null) {
                $("#current-balance").html("Uang Anda: " + web3.fromWei(balance) + " WEI");
            }
        });
    },

    getContractAddress: function () {
        App.contracts.Certification.deployed().then(function (instance) {
            return instance.contractAddress();
        }).then(function (result) {
            console.log(result.receipt.to);
            let contractAddress = result.receipt.to;

        }).catch(function (err) {
            console.error(err);
        });
    },

    getOwnerAddress: function () {
        App.contracts.Certification.deployed().then(function (instance) {
            return instance.contractAddress();
        }).then(function (result) {
            console.log("CONTRACT ADDRESS: "+ result);
        });
        App.contracts.Certification.deployed().then(function (instance) {
            return instance.owner();
        }).then(function (result) {
            console.log("OWNER ADDRESS: "+ result);
        })
    },
    publishCertificate: function (classId) {
        App.contracts.Certification.deployed().then(function (instance) {
            return instance.publishCertificate(classId, {from:App.account});
        }).then(function (result) {
            $('#download-sertifikat-modal').modal('show');
        }).catch(function (error) {
            console.error(error);
        })
    },

    getMyPublishedCertificate: function () {
        let certificationInstance;
        App.contracts.Certification.deployed().then(function (instance) {
            certificationInstance = instance;
            return certificationInstance.certificateCount()
        }).then(function (result) {
            let sertificateList = [];
            for(let i =1; i<=result; i++){
                certificationInstance.publishedCertificates(i).then(function (certificate) {
                    if (certificate[1]===App.account){
                        let c = new Certificate(certificate[3], certificate[2],
                            certificate[0], certificate[1]);
                        sertificateList.push(c);
                    }
                }).then(function () {
                    if (i==result){
                        showCertificates(sertificateList);
                    }
                })
            }
        })
    },

    lihatSertifikat:function(nomor_sertifikat){
        let certificationInstance;
        App.contracts.Certification.deployed().then(function (instance) {
            certificationInstance = instance;
            return certificationInstance.certificateCount()
        }).then(function (jumlahSertifikat) {
            if (nomor_sertifikat>0 && nomor_sertifikat<=jumlahSertifikat){
                certificationInstance.publishedCertificates(nomor_sertifikat).then(function (certificate) {
                    showCertificateResult(new Certificate(certificate[3], certificate[2],
                        certificate[0], certificate[1]));
                });
            }else {
                showCertificateResult(null);
            }
        })
    }
};
$(function () {
    $(window).on('load', function () {
        App.init();
    });
});
