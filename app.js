//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ API ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Api = (() => {
  const URL = "http://localhost:3000";
  const PATH = "todos";

  const getTodos = async () => {
    const res = await fetch(`${URL}/${PATH}`);
    return await res.json();
  };

  const addTodo = async (todo) => {
    const res = await fetch(`${URL}/${PATH}`, {
      method: "POST",
      body: JSON.stringify(todo),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    return await res.json();
  };

  const deleteToDo = async(id) =>
    await fetch(`${URL}/${PATH}/${id}`, {
      method: "DELETE",
    });

  const updateToDo = (todo, id) =>
    fetch(`${URL}/${PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(todo),
      headers: {
        "Content-Type": "application/json",
      },
    });

  return { getTodos, addTodo, deleteToDo, updateToDo };
})();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ VIEW ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const View = (() => {

  const render = (elem, tmp) => {
    elem.innerHTML = tmp;
  };

  const createPending = (arr) => {
    return [...arr].reduce((acc, curr) => {
      acc += `
      <div class="task__to__do" id=${curr.id}>
        <li id=false class="content">${
        curr.content
      }</li>
        <button class='edit__btn'><span class="material-icons-outlined">
        edit
        </span></button>
        <button class=${
          curr.id
        } id="deleteBtn"><span class="material-icons-outlined" id=${curr.id}>
        delete
        </span></button>
        <button><span class="material-icons-outlined">
        chevron_right
        </span></button>
      </div>
        `;
      return acc;
    }, "");
  };

  const createCompleted = (arr) => {
    return [...arr].reduce((acc, curr) => {
      acc += `
      <div class="task__completed" id=true>
      <li id=${curr.id} class="content">${
        curr.content
      }</li>
        <button class='edit__btn'><span class="material-icons-outlined">
        edit
        </span></button>
        <button class=${
          curr.id
        } id="deleteBtn"><span class="material-icons-outlined" id=${curr.id}>
        delete
        </span></button>
      </div>
        `;
      return acc;
    }, "");
  }
  return {
    render,
    createPending,
    createCompleted,
  };
})();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ MODEL ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Model = ((api, view) => {
  class Todo {
    constructor(todo, isCompleted) {
      this.content = todo;
      this.isCompleted = isCompleted;
    }
  }

  class State {
    #pending = [];
    #completed = [];

    get pending() {
      return this.#pending;
    }
    get completed() {
      return this.#completed;
    }

    set pending(newtodo) {
      this.#pending = [...newtodo];

          const container = document.querySelector('.pending__tasks');
          const tmp = view.createPending(this.#pending);
          view.render(container, tmp);
      }
    set completed(todo) {
      this.#completed = [...todo];

      const container = document.querySelector('.completed__tasks');
      const tmp = view.createCompleted(this.#completed);
      view.render(container, tmp)
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
    Todo,
  };
})(Api, View);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ CONTROLLER ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Controller = ((model, view) => {
  const state = new Model.State();
  
  const init = () => {
    model.getTodos().then((todos) => {
      let pend = [];
      let comp = [];
      for(let i = 0; i < todos.length; i++){
        let todo = todos[i];
        if(todo.isCompleted){
          comp.push(todo)
        } else {
          pend.push(todo)
        }
      }
      state.pending = pend;
      state.completed = comp;
    });
  };
  
  const addTodo = () => {
    const input = document.querySelector(".todo__input");
    const btn = document.querySelector(".submit__task__button");
    
    btn.addEventListener("click", (ev) => {
      const newtodo = new model.Todo(input.value, false);
      model.addTodo(newtodo).then((todo) => {
        state.pending = [todo, ...state.pending];
      });
    });
  };

  const deleteToDo = () => {
    console.log("DELETE");
    const container = document.querySelector(".pending__tasks");
    let id = {};

    console.log(container)
    
    
    // const deleteBtn = document.querySelector("#deleteBtn");
    // console.log(deleteBtn.id)

    container.addEventListener("click", (ev) => {
      ev.stopPropagation();
      // [...ev.path].forEach(el => console.log(el))
      let id = state.pending = state.pending.filter((todo) => {
        +todo.id !== +ev.target.id;
      });
      model.deleteToDo(ev.target.id);
    });
  };

  const updateToDo = () => {
    let result = "";
    const task = document.querySelector(".tasks__container");

    task.querySelector("click", (ev) => {
      ev.preventDefault();
      console.log("CLICK")
    });
    return null;
  };


  const bootstrap = () => {
    init();
    addTodo();
    deleteToDo();
    updateToDo();
  };
  return { bootstrap };
})(Model, View);

Controller.bootstrap();
