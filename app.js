//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ API ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Api = (() => {
  const URL = "http://localhost:3000";
  const PATH = "todos";

  const getTodos = async () => {
    const res = await fetch(`${URL}/${PATH}`);
    return await res.json();
  };

  const addTodo = async todo => {
    const res = await fetch(`${URL}/${PATH}`, {
      method: "POST",
      body: JSON.stringify(todo),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    return await res.json();
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

  return { getTodos, addTodo, deleteToDo, updateToDo };
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
        <li class='task__to__do' id=${curr.isCompleted}>${curr.content}</li>
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
    const btn = document.querySelector(".submit__task__button");

    input.addEventListener("input", ev => {
      ev.preventDefault();
      //EV.TARGET.VALUE DOES COME IN AS A STRING
      console.log("EV:", ev.target.value);
      //BROKE MY ADD EVENT LISTENER
      if (ev.type === "ENTER") {
        const newtodo = new model.Todo(ev.target.value);
        model.addTodo(newtodo).then(todo => {
          console.log("TODOOOOOO:", todo);
          state.pending = [todo, ...state.pending];
        });
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

  const updateToDo = id => {
    const li = document.querySelector(".task__to__do");
  };

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
