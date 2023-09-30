let GLOBAL_USERS = [];
let EDITING_USER = null;

// JSDoc -> JS Documentating
/**
 * @type {HTMLFormElement}
 */
const userForm = document.getElementById("createUserForm");

/**
 * @type {HTMLInputElement}
 */
const userFormFirstNameField = document.getElementById('firstName');

/**
 * @type {HTMLInputElement}
 */
const userFormLastNameField = document.getElementById('lastName');

/**
 * @type {HTMLInputElement}
 */
const userFormAgeField = document.getElementById('age');


/**
 * @type {HTMLButtonElement}
 */
const formSubmitBtn = document.getElementById("createUserFormSubmit");

/**
 * @type {HTMLSpanElement}
 */
const formNotif = document.getElementById("createUserFormNotification");

function createUser(user) {
  return fetch("http://127.0.0.1:8000/user", {
    method: "POST",
    headers: {
      accept: "application/json",
      ["content-type"]: "application/json; charset=utf-8",
    },
    body: JSON.stringify(user),
  }).then((res) => {
    if (res.status !== 200) throw new Error("Failed to create user");
    return res.json();
  });
}

function deleteUser(user) {
  const url = new URL("http://127.0.0.1:8000/user");
  url.searchParams.set("id", user.id);

  // "http://127.0.0.1:8000/user?" + params.toString()
  return fetch(url.toString(), {
    method: "DELETE",
    headers: {
      accept: "application/json",
    },
  }).then((res) => {
    if (res.status !== 200) throw new Error("Failed to create user");
    return res;
  });
}

function updateUser(user) {
  debugger;
  return fetch("http://127.0.0.1:8000/user", {
    method: "PUT",
    headers: {
      accept: "application/json",
      ["content-type"]: "application/json; charset=utf-8",
    },
    body: JSON.stringify(user),
  }).then((res) => {
    if (res.status !== 200) throw new Error("Failed to create user");
    return res.json();
  });
  // .then((userWithId) => {
  //   GLOBAL_USERS = GLOBAL_USERS.map(u => u.id === user.id ? user : u);
  //   renderUsers(GLOBAL_USERS);
  //   return userWithId
  // });
}

function fetchUsers() {
  return fetch("http://127.0.0.1:8000/users", {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      return data;
    });
}


function switchFormToCreateUser() {
  /**
   * @type {HTMLButtonElement}
   */
  const formCancelBtn = document.getElementById('createUserFormCancel')
  formCancelBtn.remove();
  formSubmitBtn.innerText = 'Create User';
}

function switchFormToEditUser() {
  /**
   * @type {HTMLButtonElement}
   */
  const formCancelBtn = document.createElement("button");
  formCancelBtn.id = "createUserFormCancel";
  formCancelBtn.type = "reset";
  formCancelBtn.innerText = "cancel editing";
  formCancelBtn.addEventListener("click", (e) => {
    // no prevent dafault to reset form
    switchFormToCreateUser();
    userForm.reset()
  });
  userForm.insertBefore(formCancelBtn, formNotif);
  formSubmitBtn.innerText = 'Update User'

  userFormFirstNameField.value = EDITING_USER.firstName;
  userFormLastNameField.value = EDITING_USER.lastName;
  userFormAgeField.value = EDITING_USER.age;
}

const renderUsers = (users) => {
  /**
   * @type {HTMLDivElement}
   */
  const container = document.getElementById("userList");
  const list = document.createElement("ul");
  users.forEach((u) => {
    const listItem = document.createElement("li");
    // listItem.classList.add('my-list-item')
    listItem.innerText = `FirstName: ${u.firstName}, LastName: ${u.lastName}, age: ${u.age}`;
    /**
     * @type {HTMLButtonElement}
     */
    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "delete";
    deleteBtn.addEventListener("click", (e) => {
      deleteBtn.disabled = true;
      deleteUser(u)
        .then(() => {
          GLOBAL_USERS = GLOBAL_USERS.filter((g) => g.id !== u.id);
          renderUsers(GLOBAL_USERS);
        })
        .finally(() => {
          deleteBtn.disabled = false;
        });
    });
    listItem.appendChild(deleteBtn);
    /**
     * @type {HTMLButtonElement}
     */
    const editBtn = document.createElement("button");
    editBtn.innerText = "edit";
    editBtn.addEventListener("click", (e) => {
      debugger;
      EDITING_USER = u;
      switchFormToEditUser();
    });
    listItem.appendChild(editBtn);
    list.appendChild(listItem);
  });
  container.replaceChildren(list);
  // NOTE: alternative
  // while(container.firstChild)
  // {
  //   container.removeChild(container.firstChild);
  // }
  // container.appendChild(newChild)
};

let prevNotificationTimeout;

userForm.addEventListener("submit", (e) => {
  // form will submit post request to current url or `action` url by default
  e.preventDefault();

  formSubmitBtn.disabled = true;
  clearTimeout(prevNotificationTimeout);
  formNotif.innerText = "";

  /**
   * @type {HTMLFormElement}
   */
  const form = e.target;
  const formData = new FormData(form);
  const user = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    age: parseInt(formData.get("age")),
  };
  console.log("user", user);

  if (!EDITING_USER) {
    return createUser(user)
      .then((userWithId) => {
        formNotif.innerText = "Success";
        GLOBAL_USERS.push(userWithId);
        renderUsers(GLOBAL_USERS);
      })
      .catch(() => {
        formNotif.innerText = "Failed to create user";
      })
      .finally(() => {
        formSubmitBtn.disabled = false;
        prevNotificationTimeout = setTimeout(() => {
          formNotif.innerText = "";
        }, 3000);
      });
  }

  updateUser({
    ...user,
    id: EDITING_USER.id,
  })
    .then((userWithId) => {
      EDITING_USER = null;
      form.reset();
      switchFormToCreateUser();
      formNotif.innerText = "Success";
      GLOBAL_USERS = GLOBAL_USERS.map((u) => (u.id === user.id ? user : u));
      renderUsers(GLOBAL_USERS);
    })
    .catch(() => {
      formNotif.innerText = "Failed to update user";
    })
    .finally(() => {
      formSubmitBtn.disabled = false;
      prevNotificationTimeout = setTimeout(() => {
        formNotif.innerText = "";
      }, 3000);
    });
});

// init
fetchUsers().then((users) => {
  if (Array.isArray(users)) {
    GLOBAL_USERS = users;
    renderUsers(GLOBAL_USERS);
  }
});
