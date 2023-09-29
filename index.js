let users = [];

fetch("http://127.0.0.1:8000/users", {
  method: "GET",
  headers: {
    accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    if (Array.isArray(data)) {
      renderUsers(data)
    }
  });

const renderUsers = (users) => {
  /**
   * @type {HTMLDivElement}
   */
  const container = document.getElementById('userList');
  const list = document.createElement('ul');
  users.forEach((u) => {
    const listItem = document.createElement('li');
    listItem.innerText = `FirstName: ${u.firstName}, LastName: ${u.lastName}, age: ${u.age}`;
    list.appendChild(listItem);
  })
  container.replaceChildren(list);
  // NOTE: alternative
  // while(container.firstChild)
  // {
  //   container.removeChild(container.firstChild);
  // }
  // container.appendChild(newChild)
}

// JSDoc -> JS Documentating
/**
 * @type {HTMLFormElement}
 */
const userForm = document.getElementById('createUserForm');

/**
 * @type {HTMLButtonElement}
 */
const btn = document.getElementById('createUserFormSubmit');

/**
 * @type {HTMLSpanElement}
 */
const formNotif = document.getElementById('createUserFormNotification');

let prevNotificationTimeout;

userForm.addEventListener('submit', (e) => {
  // form will submit post request to current url or `action` url by default
  e.preventDefault();

  btn.disabled = true
  clearTimeout(prevNotificationTimeout);
  formNotif.innerText = ''

  /**
  * @type {HTMLFormElement}
  */
  const form = e.target;
  const formData = new FormData(form);
  const user = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    age: parseInt(formData.get('age')),
  }
  console.log('user', user)

  fetch("http://127.0.0.1:8000/user", {
    method: "POST",
    headers: {
      accept: "application/json",
      ['content-type']: 'application/json; charset=utf-8',
    },
    body: JSON.stringify(user),
  }).then((res) => {
    if (res.status !== 200) throw new Error('Failed to create user');
    formNotif.innerText = 'Success';
    users.push(user);
    renderUsers(users)

    // if (res.status === 200) {
    //   console.log("user created");
    //   formNotif.innerText = 'Success';
    //   return
    // }
    // throw new Error('Failed to create user');
  })
  .catch(() => {
    formNotif.innerText = 'Failed to create user';
  })
  .finally(() => {
    btn.disabled = false;
    prevNotificationTimeout = setTimeout(() => {
      formNotif.innerText = ''
    }, 3000)
  })


})
