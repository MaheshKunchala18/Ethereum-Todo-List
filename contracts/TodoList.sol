pragma solidity ^0.5.0;

contract TodoList {
  uint public taskCount = 0;

  struct Task {
    uint id;
    string content;
    bool completed;
    uint createdTime;
    uint dueTime;
  }

  mapping(uint => Task) public tasks;

  event TaskCreated(
    uint id,
    string content,
    bool completed,
    uint createdTime,
    uint dueTime
  );

  event TaskCompleted(
    uint id,
    bool completed
  );

  constructor() public {
    createTask("Task #1", block.timestamp + 1 weeks);
  }

  function createTask(string memory _content, uint _dueTime) public {
  taskCount++;
  uint currentTime = block.timestamp;
  tasks[taskCount] = Task(taskCount, _content, false, currentTime, _dueTime);
  emit TaskCreated(taskCount, _content, false, currentTime, _dueTime);
}

  
  function toggleCompleted(uint _id) public {
    Task storage _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;
    emit TaskCompleted(_id, _task.completed);
  }
}