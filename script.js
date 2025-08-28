// *** Loading the localStorage data ***
const onLoad = () => {
  const kanban_data = JSON.parse(localStorage.getItem("kanban_data")) || {};

  document.querySelectorAll(".column").forEach((column) => {
    const heading = column.querySelector(".column-head h3").innerText.trim();
    const tasks = kanban_data[heading] || [];

    tasks.forEach((task) => {
      const taskElement = createTask(task.id, task.des);
      column.appendChild(taskElement);
    });
  });
};
// **** Updating the local storage *****
const fetchingLocalStorge = (textarea) => {
  const column = textarea.closest(".column");
  const columnHead = column.querySelector(".column-head");
  const innerText = columnHead.querySelector("h3").innerText.trim();

  const taskId = textarea.dataset.id;
  const taskText = textarea.value.trim();

  let kanban_data = JSON.parse(localStorage.getItem("kanban_data")) || {
    "To-Do": [],
    Progress: [],
    Completed: [],
  };

  const taskList = kanban_data[innerText];
  const existingIndex = taskList.findIndex((task) => task.id === taskId);
  // ****** Update existing task
  if (existingIndex !== -1) {
    taskList[existingIndex].des = taskText;
  } else {
    // *** Add new task
    taskList.push({
      id: taskId,
      des: taskText,
    });
  }
  kanban_data[innerText] = taskList;
  localStorage.setItem("kanban_data", JSON.stringify(kanban_data));
};

// ***** filter ****
const handleRemove = (e) => {
  const textarea = e.target.closest(".task").querySelector(".task-input");
  const deleteId = textarea.dataset.id;

  const column = textarea.closest(".column");
  const columnName = column.querySelector(".column-head h3").innerText.trim();

  let kanban_data = JSON.parse(localStorage.getItem("kanban_data")) || {};

  kanban_data[columnName] = (kanban_data[columnName] || []).filter(
    (task) => task.id !== deleteId
  );

  localStorage.setItem("kanban_data", JSON.stringify(kanban_data));
  console.log("Trying to delete task:", deleteId);
  console.log("Column:", columnName);
  console.log(" Stored tasks:", kanban_data[columnName]);
};

// **** creating New tasks***

const createTask = (id, value) => {
  let uniqueID = Date.now().toString(36).slice(3, -1);

  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;

  const textarea = document.createElement("textarea");
  textarea.className = "task-input";
  textarea.dataset.id = id || uniqueID;
  textarea.value = value || "";
  textarea.placeholder = "write something..";
  textarea.draggable = false;
  textarea.style.height = "3rem";

  const delBtn = document.createElement("button");
  delBtn.className = "btn de-btn";
  delBtn.ariaLabel = "Delete Task";
  delBtn.onclick = (e) => {
    handleRemove(e);
    e.target.closest(".task").remove();
  };
  const icon = document.createElement("i");
  icon.className = "bi bi-trash";

  const menu = document.createElement("menu");
  menu.className = "menu";
  delBtn.appendChild(icon);
  menu.appendChild(delBtn);
  task.appendChild(menu);
  task.appendChild(textarea);

  task.addEventListener("dragstart", handleDragstart);
  task.addEventListener("dragend", handleDragend);

  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
    fetchingLocalStorge(textarea);
  });
  textarea.addEventListener("focus", () => {
    textarea.style.height = textarea.scrollHeight + "px";
  });

  textarea.addEventListener("blur", () => {
    textarea.style.height = "3rem";
  });

  return task;
};

const addTask = (e) => {
  e.preventDefault();
  const task = createTask();
  e.target.closest(".column").appendChild(task);
  task.querySelector("textarea").focus();
};

// **** disabling drag inside text area ******
document.addEventListener("mousedown", (e) => {
  if (e.target.closest(".task-input")) {
    const task = e.target.closest(".task");
    if (task) task.draggable = false;
  } else {
    document.querySelectorAll(".task").forEach((task) => {
      task.draggable = true;
    });
  }
});

// ********* DROP AND DRAG ********
const columns = document.querySelectorAll(".column");

const handleDragstart = (e) => {
  e.target.classList.add("dragging");
};

const handleDragend = (e) => {
  e.target.classList.remove("dragging");
};

columns.forEach((column) => {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  column.addEventListener("drop", (e) => {
    const draggingElement = document.querySelector(".dragging");
    const targetElement = handleSort(column, e.clientY);
    if (targetElement == null) {
      column.appendChild(draggingElement);
    } else {
      column.insertBefore(draggingElement, targetElement);
    }

    const updatedTextarea = draggingElement.querySelector(".task-input");

    const kanban_data = JSON.parse(localStorage.getItem("kanban_data")) || {};

    // Remove from all columns
    for (const col in kanban_data) {
      kanban_data[col] = kanban_data[col].filter(
        (task) => task.id !== updatedTextarea.dataset.id
      );
    }

    // Add to new column at correct position
    const newColName = column.querySelector(".column-head h3").innerText.trim();

    const updatedTasks = [...column.querySelectorAll(".task")].map((task) => {
      const ta = task.querySelector(".task-input");
      return {
        id: ta.dataset.id,
        des: ta.value.trim(),
      };
    });

    kanban_data[newColName] = updatedTasks;

    localStorage.setItem("kanban_data", JSON.stringify(kanban_data));
  });
});

// **** sorting the dropped task****
const handleSort = (column, coordinateY) => {
  let closest = Number.NEGATIVE_INFINITY;
  let element = null;
  const tasks = [...column.querySelectorAll(".task:not(.dragging)")];
  for (const child of tasks) {
    const box = child.getBoundingClientRect();
    const offset = coordinateY - (box.top + box.height / 2);
    if (offset < 0 && offset > closest) {
      closest = offset;
      element = child;
    }
  }
  return element;
};

// *** toggle Mode ***
const toggleBtn = document.getElementById("mode-change");
const icon = document.getElementById("mode-icon");
toggleBtn.addEventListener("click", () => {
  const root = document.documentElement;
  const isDark = root.classList.toggle("dark");
  icon.className = isDark ? "bi bi-moon" : "bi bi-sun";
});

// *** toggle Grid ***

const gridTogle = document.getElementById("grid-change");
gridTogle.addEventListener("click", () => {
  document.body.classList.toggle("grid");
});
document.body.classList.toggle("grid");
onLoad();
