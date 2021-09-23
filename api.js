const https = require('https');

const api = (options, data) => {
  return new Promise((resolve, reject) => {

    const to = setTimeout(() => reject(new Error("Connection timeout")), 2000);

    var req = https.request(options, response => {
      response.on('data', (d) => {
        const result = d.toString('utf8');
        const resultObj = JSON.parse(result);
        if (resultObj.status && resultObj.status != 200) {
          clearTimeout(to);
          reject(resultObj);
        } else {
          clearTimeout(to);
          resolve(resultObj);
        }
      });
    });

    req.on('error', (e) => {
      clearTimeout(to);
      reject(e);
    });

    req.end(data ? data : "");
  });
}

const apiToken = async (domain, postData) => {
  const postDataString = JSON.stringify(postData);
  var options = {
    hostname: domain + '.amocrm.ru',
    port: 443,
    path: '/oauth2/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postDataString.length
    }
  };
  return await api(options, postDataString);
}

const queryDict2String = (queryDict) => {
  let queryArr = [];
  for (const key in queryDict) {
    queryArr.push(key + '=' + queryDict[key]);
  }
  return queryArr.length > 0 ? "?" + queryArr.join("&") : "";
}

const getHostname = (domain) => {
  return domain + '.amocrm.ru';
}

const apiContacts = async (domain, queryParams, access_token) => {
  var options = {
    hostname: getHostname(domain),
    port: 443,
    path: '/api/v4/contacts' + queryDict2String(queryParams),
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  };
  return await api(options);
}

const apiTasks = async (domain, queryParams, access_token) => {
  var options = {
    hostname: getHostname(domain),
    port: 443,
    path: '/api/v4/tasks' + queryDict2String(queryParams),
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  }
  return await api(options);
}

const apiCreateTask = async (domain, taskDescription, access_token) => {
  const postDataString = JSON.stringify(taskDescription);
  var options = {
    hostname: getHostname(domain),
    port: 443,
    path: '/api/v4/tasks',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  }
  return await api(options, postDataString);
}

module.exports = {
  apiToken,
  apiContacts,
  apiTasks,
  apiCreateTask
}