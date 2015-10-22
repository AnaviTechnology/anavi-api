var records = [
    { id: 1, username: 'demo', password: 'demo', displayName: 'John', displaySurname: 'Smith', emails: [ { value: 'john@example.com' } ] }
  , { id: 2, username: 'admin', password: 'demo', displayName: 'Jane', displaySurname: 'Smith', emails: [ { value: 'jane@example.com' } ] }
];

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}
