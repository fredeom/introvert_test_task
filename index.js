const AmoCRM = require( 'amocrm-js' );

const MONTH_IN_SECONDS = 31 * 24 * 60 * 60;

const crm = new AmoCRM({
    // логин пользователя в портале, где адрес портала domain.amocrm.ru
    domain: 'fruncheese', // может быть указан полный домен вида domain.amocrm.ru, domain.amocrm.com
    /* 
      Информация об интеграции (подробности подключения 
      описаны на https://www.amocrm.ru/developers/content/oauth/step-by-step)
    */
    auth: {
      client_id: 'client_id', // ID интеграции
      client_secret: 'client_secret', // Секретный ключ
      redirect_uri: 'https://c366-95-79-176-11.ngrok.io', // Ссылка для перенаправления
      server: {
        port: 3001
      }
    },
});

async function getAllContacts(url) {
  const response = await crm.request.get( url )
  return response.data ?
    [
      ...response.data._embedded.contacts.map(
        contact => ({
          id: contact.id,
          name: contact.name,
          hasLeads: contact._embedded.leads.length > 0,
          created_at: contact.created_at
        })
      ),
      ...await getAllContacts(response.data._links.next.href)
    ] : [];
}

async function getAllTasks(url) {
  const response = await crm.request.get( url )
  return response.data ?
    [
      ...response.data._embedded.tasks.map(
        task => ({
          text: task.text,
          entity_id: task.entity_id,
          entity_type: task.entity_type
        })
      ),
      ...await getAllTasks(response.data._links.next.href)
    ] : [];
}

async function createNoLeadsContactTasks(contacts, tasksZipped) {
  let count = 0;
  for (const contact of contacts) {
    if (!contact.hasLeads && !tasksZipped.includes('Контакт без сделок' + contact.id + 'contacts')) {
      const response = await crm.request
        .post( '/api/v4/tasks', 
          [
            {
              text: 'Контакт без сделок',
              complete_till: contact.created_at + MONTH_IN_SECONDS,
              entity_id: contact.id,
              entity_type: 'contacts'
            }
          ]
        )
      if (response.data) {
        count++
      }
    }
  }
  return count
}

(async () => {
  const url = crm.connection.getAuthUrl()

  console.log("OAuthorize using following: ", {url})

  const allContacts = await getAllContacts('/api/v4/contacts?with=leads&page=1&limit=50')
  const allTasks = await getAllTasks('/api/v4/tasks')

  console.log("Current contacts: ", allContacts)
  console.log("Current tasks: ", allTasks)

  const allTasksZipped = allTasks.map(task => task.text + task.entity_id + task.entity_type)

  const numberOfNewTasks = await createNoLeadsContactTasks(allContacts, allTasksZipped);

  console.log("Number of tasks created is " + numberOfNewTasks);
})();