
const Fakeit = require('fakeit').default;

const fakeit = new Fakeit();

const MongoClient = require('mongodb').MongoClient;

var ipport = process.env.MONGO_URL || "localhost:27017";

const url = `mongodb://${ipport}`;
var dbName = process.env.MONGO_DBNAME || 'ycsb';

var numDocsPerCustomer = process.env.NUM_DOCS_PER_CUSTOMER || 5;

MongoClient.connect(url, async function (err, client) {
    if(client) {
        console.log("Fakeit: Connected successfully to server");
    
        const db = client.db(dbName);
        const collection = db.collection('jsondata');
        var numDocs = await collection.countDocuments();
        if(numDocs > 0) {
            await collection.drop();
        }
        await insertDocuments(db);
        client.close();
    }
    else {
        console.error(err.message);
        process.exit(1);
    }
});

const dateTimeReviver = function (key, value) {
    if(key == "dob") {
        return new Date(value);
    }
    return value;
}

const insertDocuments = async function (db) {
    // Get the documents collection
    const collection = db.collection('jsondata');
    var cdata = await fakeit.generate(__dirname+'/customers.yaml');
    cdata = JSON.parse(cdata, dateTimeReviver);

    for(var customer of cdata) {
        var order_count = Math.floor(Math.random() * (numDocsPerCustomer - 1)) + 1;

        for(var i=1; i<=order_count; i++) {
            var odata = await fakeit.generate(__dirname+'/orders.yaml');
            odata = JSON.parse(odata);
            odata[0]['_id'] = `order_${i}_${customer['_id']}`;
            customer['order_list'].push(odata[0]['_id']);

            collection.insertMany( odata, function (err, result) {
                // console.log("Fakeit: Inserted order documents into the collection");
            });
            
            // console.log(odata);
        }

        // console.log(customer);
    }

    collection.insertMany( cdata, function (err, result) {
        console.log("Fakeit: Inserted the documents into the collection");
    });
    
    

};