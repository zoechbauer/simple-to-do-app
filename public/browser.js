document.addEventListener('click', e => {
  // edit feature
  if (e.target.classList.contains('edit-me')) {
    let userInput = prompt(
      'Enter the desired new name',
      e.target.parentElement.parentElement.querySelector('.item-text').innerHTML
    );
    if (userInput) {
      axios
        .post('/update-item', {
          text: userInput,
          id: e.target.getAttribute('data-id')
        })
        .then(() => {
          e.target.parentElement.parentElement.querySelector(
            '.item-text'
          ).innerHTML = userInput;
          console.log('item was updated');
        })
        .catch(err => console.log(err));
    }
  }

  // delete feature
  if (e.target.classList.contains('delete-me')) {
    if (confirm('Do you really want to delete this item permanently?')) {
      axios
        .post('/delete-item', { id: e.target.getAttribute('data-id') })
        .then(e.target.parentElement.parentElement.remove())
        .catch(err => console.log('Delete Error: ', err));
    }
  }
});
