const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");

const app = express();
app.use(express.json());

const filepath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: filepath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch {
    console.log(`DB Error: ${e.message}`);
  }
};
initializeDBAndServer();

const convertSnakeNormal = (object) => {
  return {
    id: object.id,
    todo: object.todo,
    priority: object.priority,
    status: object.status,
    category: object.category,
    dueDate: object.due_date,
  };
};

const hasStatusProperty = (requestObject) => {
  return requestObject.status !== undefined;
};

const hasPriorityProperty = (requestObject) => {
  return requestObject.priority !== undefined;
};

const hasPriorityAndStatusProperty = (requestObject) => {
  return (
    requestObject.priority !== undefined && requestObject.status !== undefined
  );
};

const hasSearchqProperty = (requestObject) => {
  return requestObject.search_q !== undefined;
};

const hasCategoryAndStatusProperty = (requestObject) => {
  return (
    requestObject.category !== undefined && requestObject.status !== undefined
  );
};

const hasCategoryProperty = (requestObject) => {
  return requestObject.category !== undefined;
};

const hasCategoryAndPriorityProperty = (requestObject) => {
  return (
    requestObject.category !== undefined && requestObject.priority !== undefined
  );
};

//API 1

app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q } = request.query;
  let todoQuery = "";
  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          todoQuery = `select * from todo where status='${status}' and priority='${priority}' ;`;
          const dbResponse = await db.all(todoQuery);
          const answer = dbResponse.map((each) => convertSnakeNormal(each));
          response.send(answer);
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasCategoryAndStatusProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          todoQuery = `select * from todo where status='${status}' and category='${category}' ;`;
          const dbResponse = await db.all(todoQuery);
          const answer = dbResponse.map((each) => convertSnakeNormal(each));
          response.send(answer);
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategoryAndPriorityProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          todoQuery = `select * from todo where priority='${priority}' and category='${category}' ;`;
          const dbResponse = await db.all(todoQuery);
          const answer = dbResponse.map((each) => convertSnakeNormal(each));
          response.send(answer);
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        todoQuery = `select * from todo where status='${status}'; `;
        const dbResponse = await db.all(todoQuery);
        const answer = dbResponse.map((each) => convertSnakeNormal(each));
        response.send(answer);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        todoQuery = `select * from todo where priority='${priority}' ;`;
        const dbResponse = await db.all(todoQuery);
        const answer = dbResponse.map((each) => convertSnakeNormal(each));
        response.send(answer);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        todoQuery = `select * from todo where category='${category}'; `;
        const dbResponse = await db.all(todoQuery);
        const answer = dbResponse.map((each) => convertSnakeNormal(each));
        response.send(answer);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasSearchqProperty(request.query):
      todoQuery = `select * from todo where todo like '%${search_q}%' ; `;
      const dbResponse = await db.all(todoQuery);
      const answer = dbResponse.map((each) => convertSnakeNormal(each));
      response.send(answer);
      break;

    default:
      break;
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const idQuery = `select * from todo where id='${todoId}'`;
  const dbResponse = await db.get(idQuery);
  const answer = convertSnakeNormal(dbResponse);
  response.send(answer);
});

//API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  //   console.log(date);
  //   console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const date1 = format(new Date(date), "yyyy-MM-dd");
    const idQuery = `select * from todo where due_date='${date1}'`;
    const dbResponse = await db.all(idQuery);
    const answer = dbResponse.map((each) => convertSnakeNormal(each));
    response.send(answer);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4

app.post("/todos/", async (request, response) => {
  let postQuery = "";
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const date1 = format(new Date(dueDate), "yyyy-MM-dd");
          postQuery = `insert into todo (id,todo,category,priority,status,due_date) values(
              '${id}',
              '${todo}',
              '${category}',
              '${priority}',
              '${status}',
              '${date1}'
          );`;
          const dbResponse = await db.run(postQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let putQuery = "";
  const { todo, status, priority, category, dueDate } = request.body;
  switch (true) {
    case hasStatusProperty(request.body):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const putQuery = `update todo set 
         status='${status}'
         where
         id='${todoId}'
         ;`;
        const dbResponse = await db.run(putQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasPriorityProperty(request.body):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const putQuery = `update todo set 
         priority='${priority}'
         where
         id='${todoId}'
         ;`;
        const dbResponse = await db.run(putQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasCategoryProperty(request.body):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        const putQuery = `update todo set 
         category='${category}'
         where
         id='${todoId}'
         ;`;
        const dbResponse = await db.run(putQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case request.body.todo !== undefined:
      const putQuery = `update todo set 
         todo='${todo}'
         where
         id='${todoId}'
         ;`;
      const dbResponse = await db.run(putQuery);
      response.send("Todo Updated");
      break;

    case request.body.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        const putQuery = `update todo set 
         due_date='${newDate}'
         where
         id='${todoId}'
         ;`;
        const dbResponse = await db.run(putQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
    default:
      break;
  }
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `delete from todo where id='${todoId}'`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
