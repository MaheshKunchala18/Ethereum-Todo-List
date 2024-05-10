App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()

    await App.render()
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = (await web3.eth.getAccounts())[0];
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json');
    App.contracts.TodoList = TruffleContract(todoList);
    App.contracts.TodoList.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed();
    
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },


  renderTasks: async () => {
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')
    $('#taskList').empty();

    for (var i = 1; i <= taskCount; i++) {
      const task = await App.todoList.tasks(i)
      const taskId = task.id.toNumber()
      const taskContent = task.content
      const taskCompleted = task.completed
      const taskCreatedTime = new Date(task.createdTime * 1000);
      const taskDueTime = new Date(task.dueTime * 1000); // Convert due time to milliseconds

      if (taskCompleted) {
        continue;
      }

      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('.time').html(`Created Time: &nbsp; ${taskCreatedTime.toLocaleString()} <br> &nbsp;&nbsp; Due Time: &nbsp; ${taskDueTime.toLocaleString()}`)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      .on('click', App.toggleCompleted)

      $('#taskList').append($newTaskTemplate)
      $newTaskTemplate.show()
    }
  },



  createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    const dueTime = new Date($('#dueTime').val()).getTime() / 1000; // Get due time in seconds
    await App.todoList.createTask(content, dueTime, {from: App.account}) // Pass due time
    window.location.reload()
  },  


  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleCompleted(taskId, {from: App.account})
    window.location.reload()
  },


  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}


$(() => {
  $(window).load(() => {
    App.load()
  })
})