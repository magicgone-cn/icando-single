import React from 'react';
import './App.css';
import TodoList from "./modules/TodoList";
import connectStorage from "./modules/Storage";

// 与存储连接，后续可以改为redux
const TodoListWithStorage = connectStorage(TodoList);

function App() {
  return (
    <TodoListWithStorage />
  );
}

export default App;
