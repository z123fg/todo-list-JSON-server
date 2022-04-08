//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ API ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Api = (() => {
  const URL = "http://localhost:3000";
  const PATH = "todos";

  const getTodos = () => {
    return fetch(`${URL}/${PATH}`).then(res => res.json());
  };

  const addTodo = todo => {
    return fetch(`${URL}/${PATH}`, {
      method: "POST",
      body: JSON.stringify(todo),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    }).then(res => res.json());
  };

  const deleteToDo = id =>
    fetch(`${URL}/${PATH}/${id}`, {
      method: "DELETE"
    });

  const updateToDo = (todo, id) =>
    fetch(`${URL}/${PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(todo),
      headers: {
        "Content-Type": "application/json"
      }
    });

  return { getTodos, addTodo, deleteToDo };
})();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ VIEW ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const View = (() => {
  const domClassStr = {
    inputbox: document.querySelector(".todo__input"),
    submitButton: document.querySelector(".submit__task__button"),
    pendingTasksUL: document.querySelector(".pending__tasks"),
    completedTasksUL: document.querySelector(".completed__tasks")
  };

  const render = (elem, tmp) => {
    elem.innerHTML = tmp;
  };

  const createPending = arr => {
    return [...arr].reduce((acc, curr) => {
      acc += `
        <li class=${curr.isCompleted}>${curr.content}</li>
        <button>edit</button>
        <button id=${curr.id}>X</button>
        <button>completed</button>
        `;
      return acc;
    }, "");
  };

  return {
    render,
    createPending,
    domClassStr
  };
})();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ MODEL ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Model = ((api, view) => {
  class Todo {
    constructor(todo) {
      this.content = todo;
      this.isCompleted = false;
    }
  }

  class State {
    #pending = [];

    get pending() {
      return this.#pending;
    }
    set pending(newtodo) {
      this.#pending = [...newtodo];

      const container = document.querySelector(".pending__tasks");
      const tmp = view.createPending(this.#pending);

      view.render(container, tmp);
    }
  }

  const getTodos = api.getTodos;
  const addTodo = api.addTodo;
  const deleteToDo = api.deleteToDo;

  return {
    getTodos,
    addTodo,
    deleteToDo,
    State,
    Todo
  };
})(Api, View);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ CONTROLLER ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Controller = ((model, view) => {
  const state = new Model.State();

  const addTodo = () => {
    const input = document.querySelector(".todo__input");
    const form = document.querySelector(".input__container");
    const submitBtn = document.querySelector(".submit__task__button");

    input.addEventListener("keyup", ev => {
      let result = "";
      result += ev.target.value;
      if (ev.key === "Enter") {
        const newtodo = new model.Todo(result);
        model.addTodo(newtodo).then(todo => {
          state.pending = [todo, ...state.pending];
        });
        ev.target.value = "";
      }
    });
  };

  const deleteToDo = () => {
    const container = document.querySelector(".tasks");

    container.addEventListener("click", ev => {
      state.pending = state.pending.filter(todo => +todo.id !== +ev.target.id);
      model.deleteToDo(ev.target.id);
    });
  };

  const updateToDo = id => {};

  const init = () => {
    model.getTodos().then(todos => {
      state.pending = todos;
    });
  };

  const bootstrap = () => {
    init();
    addTodo();
    deleteToDo();
  };
  return { bootstrap };
})(Model, View);

Controller.bootstrap();
