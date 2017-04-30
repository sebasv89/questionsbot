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
                "DELETE FROM dbo.userid_address WHERE userid='" + session.userData.emailAddress + "'",
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

exports.updateUserAddress = updateUserAddress;