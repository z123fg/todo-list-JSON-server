// * ~~~~~~~~~~~~~~~~~~~ Api ~~~~~~~~~~~~~~~~~~~
const Api = (() => {
  const baseUrl = "http://localhost:3000";
  const path = "todos";

  const getTodos = () => {
    return fetch([baseUrl, path].join("/")).then((res) => {
      return res.json();
    });
  };

  const addTodo = (todo) => {
    return fetch([baseUrl, path].join("/"), {
      method: "POST",
      body: JSON.stringify(todo),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((res) => {
      return res.json();
    });
  };

  const updateTodo = (context, id, finished) => {
    const todo = {
      title: context,
      completed: finished,
    };

    return fetch([baseUrl, path, id].join("/"), {
      method: "PUT",
      body: JSON.stringify(todo),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((res) => {
      return res.json();
    });
  };

  const deleteTodo = (id) => {
    return fetch([baseUrl, path, id].join("/"), {
      method: "DELETE",
    });
  };

  return {
    getTodos,
    addTodo,
    updateTodo,
    deleteTodo,
  };
})();

// * ~~~~~~~~~~~~~~~~~~~ View ~~~~~~~~~~~~~~~~~~~
const View = (() => {
  const domstr = {
    pendingListContainer: "#pending-tasks-list",
    completeListContainer: "#Completed-tasks-list",
    inputbox: ".todolist__input",
    submitButton: ".todolist__submit",
  };

  const render = (element, tmp) => {
    element.innerHTML = tmp;
  };

  const createPendingTmp = (arr) => {
    let tmp = "";
    arr.forEach((todo) => {
      tmp += `
        <li id="${todo.id}">
          <span>${todo.title}</span>
          <input style="display:none"/>
          <div class="pending-button-group">
              <button class="edit-button">edit</button>
              <button class="delete-button">delete</button>
              <button class="compeleted-button">complete</button>
          </div>
        </li>
      `;
    });
    return tmp;
  };

  const createCompleteTmp = (arr) => {
    let tmp = "";
    arr.forEach((todo) => {
      tmp += `
      <li id="${todo.id}">
          <span>${todo.title}</span>
          <input style="display:none"/>
          <div class="completed-button-group">
            <button class="edit-button">edit</button>
            <button class="delete-button">delete</button>
            <button class="unfinish-button">unfinish</button>
          </div>
      </li>
      `;
    });
    return tmp;
  };

  return {
    render,
    createPendingTmp,
    createCompleteTmp,
    domstr,
  };
})();

// * ~~~~~~~~~~~~~~~~~~~ Model ~~~~~~~~~~~~~~~~~~~
const Model = ((api, view) => {
  const { getTodos, addTodo, updateTodo, deleteTodo } = api;

  class Todo {
    constructor(title, completed) {
      this.userId = 2;
      this.completed = completed;
      this.title = title;
    }
  }

  class State {
    #pendingList = [];
    #completeList = [];

    get pendingList() {
      return this.#pendingList;
    }

    set pendingList(newList) {
      this.#pendingList = newList;

      const pendingListContainer = document.querySelector(
        view.domstr.pendingListContainer
      );
      const tmp = view.createPendingTmp(this.#pendingList);
      view.render(pendingListContainer, tmp);
    }

    get completeList() {
      return this.#completeList;
    }

    set completeList(newList) {
      this.#completeList = newList;

      const completeListContainer = document.querySelector(
        view.domstr.completeListContainer
      );
      const tmp = view.createCompleteTmp(this.#completeList);
      view.render(completeListContainer, tmp);
    }
  }

  return {
    getTodos,
    deleteTodo,
    updateTodo,
    addTodo,
    State,
    Todo,
  };
})(Api, View);

// * ~~~~~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~~~~~~
const Controller = ((model, view) => {
  const state = new model.State();

  const init = () => {
    model.getTodos().then((todos) => {
      state.pendingList = todos.filter((todo) => {
        return !todo.completed;
      });

      state.completeList = todos.filter((todo) => {
        return todo.completed;
      });
    });
  };

  const deleteTodo = () => {
    const pendingListContainer = document.querySelector(
      view.domstr.pendingListContainer
    );
    const completeListContainer = document.querySelector(
      view.domstr.completeListContainer
    );
    pendingListContainer.addEventListener("click", (event) => {
      if (event.target.className === "delete-button") {
        const id = event.target.parentElement.parentElement.id;
        model.deleteTodo(id).then(init);
      }
    });

    completeListContainer.addEventListener("click", (event) => {
      if (event.target.className === "delete-button") {
        const id = event.target.parentElement.parentElement.id;
        model.deleteTodo(id).then(init);
      }
    });
  };

  const addTodo = () => {
    const inputbox = document.querySelector(view.domstr.inputbox);
    const submitButton = document.querySelector(view.domstr.submitButton);
    submitButton.addEventListener("click", (event) => {
      if (inputbox.value !== "") {
        const todo = new model.Todo(inputbox.value, false);
        model.addTodo(todo).then((todofromBE) => {
          (todofromBE);
          state.pendingList = [todofromBE, ...state.pendingList];
          inputbox.value = "";
        });
      }
    });
  };

  const editTodoPending = () => {
    const pendingListContainer = document.querySelector(
      view.domstr.pendingListContainer
    );
    pendingListContainer.addEventListener("click", (event) => {
      if (event.target.className === "edit-button") {
        const id = event.target.parentElement.parentElement.id;
        let current = document.getElementById(id);
        let text = current.children[0].innerHTML;
        let input = current.children[1];
        let span = current.children[0];
        span.style.display = "none";
        input.style.display = "inline";
        input.value = text;
        input.addEventListener("keyup", (event) => {
          if (event.key === "Enter" && event.target.value.trim() !== "") {
            model.updateTodo(event.target.value, id, false).then(init);
          }
        });
      }
    });
  };

  const editTodoCompleted = () => {
    const completeListContainer = document.querySelector(
      view.domstr.completeListContainer
    );
    completeListContainer.addEventListener("click", (event) => {
      if (event.target.className === "edit-button") {
        const id = event.target.parentElement.parentElement.id;
        let current = document.getElementById(id);
        let text = current.children[0].innerHTML;
        let input = current.children[1];
        let span = current.children[0];
        span.style.display = "none";
        input.style.display = "inline";
        input.value = text;
        input.addEventListener("keyup", (event) => {
          if (event.key === "Enter" && event.target.value.trim() !== "") {
            model.updateTodo(event.target.value, id, true).then(init);
          }
        });
      }
    });
  };

  const completeTodo = () => {
    const pendingListContainer = document.querySelector(
      view.domstr.pendingListContainer
    );
    pendingListContainer.addEventListener("click", (event) => {
      if (event.target.className === "compeleted-button") {
        const id = event.target.parentElement.parentElement.id;
        const current = document.getElementById(id);
        const text = current.children[0].innerHTML;
        model.updateTodo(text, id, true).then(init);
      }
    });
  };

  const unfinishTodo = () => {
    const completeListContainer = document.querySelector(
      view.domstr.completeListContainer
    );
    completeListContainer.addEventListener("click", (event) => {
      if (event.target.className === "unfinish-button") {
        const id = event.target.parentElement.parentElement.id;
        const current = document.getElementById(id);
        const text = current.children[0].innerHTML;
        model.updateTodo(text, id, false).then(init);
      }
    });
  };

  const bootstrap = () => {
    init();
    deleteTodo();
    addTodo();
    editTodoPending();
    editTodoCompleted();
    completeTodo();
    unfinishTodo();
  };

  return { bootstrap };
})(Model, View);

Controller.bootstrap();
