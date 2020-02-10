document.addEventListener('click', e => {
  if (e.target.classList.contains('edit-me')) {
    let userInput = prompt('Enter the desired new name');
    axios
      .post('/update-item', { text: userInput })
      .then(() => console.log('item was updated'))
      .catch(err => console.log(err));
  }
});
