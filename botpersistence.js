var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

// Create connection to database
var config = {
    userName: process.env.BOTDATABASE_USERNAME,
    password: process.env.BOTDATABASE_PASSWORD,
    server: process.env.BOTDATABASE_SERVERNAME,
    options: {
        database: 'pslquestionbot',
        encrypt: true
    }
}

function updateUserAddress(session) {
    var connection = new Connection(config);
    connection.on('connect', function (err) {
        if (err) {
            console.log(err)
        }
        else {
            var deleteRequest = new Request(
                "DELETE FROM dbo.userid_address WHERE userid LIKE '%" + session.userData.emailAddress + "%'",
                function (err, rowCount, rows) {
                    console.log(rowCount + ' row(s) deleted');
                    insertRequest = new Request(
                        "INSERT into dbo.userid_address(userid,address) values ('" + session.userData.emailAddress + "','" + JSON.stringify(session.message.address) + "');",
                        function (err, rowCount, rows) {
                            console.log(rowCount + ' row(s) inserted');
                            connection.close();
                        }
                    );
                    connection.execSql(insertRequest);
                }
            );
            connection.execSql(deleteRequest);
        }
    });

}


function getAddressForUserId(userId, params, callback) {
    var connection = new Connection(config);
    var addressToReturn;
    connection.on('connect', function (err) {
        if (err) {
            console.log(err)
        } else {
            selectRequest = new Request(
                "SELECT TOP 1 address FROM dbo.userid_address WHERE userId LIKE '%" + userId + "%';",
                function (err, rowCount, rows) {
                    console.log(rows);
                }
            );
            connection.execSql(selectRequest);
            selectRequest.on('row', function(columns) {
                var address = columns[0].value;
                callback(address, params);
            });
        }

    });
    
    return addressToReturn;
}

exports.updateUserAddress = updateUserAddress;
exports.getAddressForUserId = getAddressForUserId;