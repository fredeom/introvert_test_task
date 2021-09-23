const http = require('http');
const https = require('https');
const port = 3001;

const MONTH_IN_SECONDS = 31 * 24 * 60 * 60;

const apiModule = require('./api');
const apiToken = apiModule.apiToken;
const apiContacts = apiModule.apiContacts;
const apiTasks = apiModule.apiTasks;
const apiCreateTask = apiModule.apiCreateTask;

const domain = "fruncheese";
const client_id = "client_id";
const client_secret = "client_secret";
const redirect_uri = 'https://0291-95-79-176-11.ngrok.io';

const getAllContacts = async (access_token) => {
  const allContacts = [];
  let page = 1;
  while (true) {
    try {
      const contacts = await apiContacts(domain, {
        with: 'leads',
        page,
        limit: 50
      }, access_token);

      if (!contacts) break;

      const contactsArr = contacts._embedded.contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        hasLeads: contact._embedded.leads.length > 0,
        created_at: contact.created_at
      }));

      allContacts.push(...contactsArr);
    } catch (e) {
      if (e.message === 'Connection timeout') {
        break;
      } else {
        throw e
      }
    }
    page++;
  }
  return allContacts;
}

const getAllTasks = async (access_token) => {
  const allTasks = [];
  let page = 1;
  while (true) {
    try {
      const tasks = await apiTasks(domain, {
        page,
        limit: 50
      }, access_token);

      if (!tasks) break;

      const tasksArr = tasks._embedded.tasks.map(task => ({
        text: task.text,
        entity_id: task.entity_id,
        entity_type: task.entity_type
      }));

      allTasks.push(...tasksArr);
    } catch (e) {
      if (e.message === 'Connection timeout') {
        break;
      } else {
        throw e
      }
    }
    page++;
  }
  return allTasks;
}

const createNoLeadsContactTasks = async (contacts, tasks, access_token) => {
  const tasksZipped = tasks.map(task => task.text + task.entity_id + task.entity_type);
  let count = 0;
  for (const contact of contacts) {
    if (!contact.hasLeads && !tasksZipped.includes('Контакт без сделок' + contact.id + 'contacts')) {
      const response = await apiCreateTask(domain,           [
        {
          text: 'Контакт без сделок',
          complete_till: contact.created_at + MONTH_IN_SECONDS,
          entity_id: contact.id,
          entity_type: 'contacts'
        }
      ], access_token);
      count++
    }
  }
  return count;
}

const requestHandler = async (request, response) => {
  var urlParams = new URLSearchParams(request.url.substring(1));
  if (urlParams.has('code')) {
    try {
      const access_token = (await apiToken(domain, {
        client_id,
        client_secret,
        grant_type: "authorization_code",
        code : urlParams.get('code'),
        redirect_uri,
      })).access_token;

      console.log("ACCESS TOKEN: " + access_token.substring(0, 20) + "...");

      const allContacts = await getAllContacts(access_token);
      const allTasks = await getAllTasks(access_token);

      console.log("Current contacts: ", allContacts);
      console.log("Current tasks: ", allTasks);

      const numberOfNewTasks = await createNoLeadsContactTasks(allContacts, allTasks, access_token);

      console.log("Number of tasks created is " + numberOfNewTasks);

    } catch (e) {
      console.log('Something went wrong. Error: ', e);
    }
    response.end("Got OAuth code.");
  } else {
    response.writeHead(301,
      {Location: `https://www.amocrm.ru/oauth?client_id=${client_id}&mode=post_message`}
    );
    response.end();
  }
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})