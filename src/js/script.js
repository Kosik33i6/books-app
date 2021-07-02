{
  'use strict';

  const select = {
    templateOf: {
      book: '#template-book',
    },
    containerOf: {
      booksList: '.books-list'
    },
    book: {
      bookImage: '.book__image',
    },
  };

  const templates = {
    book: Handlebars.compile(document.querySelector(select.templateOf.book).innerHTML),
  };

  const classNames = {
    book: {
      bookFavorite: 'favorite',
    },
  };

  class Book {
    constructor(data, bookContainer) {
      const thisBook = this;

      thisBook.id = data.id;
      thisBook.data = data;
      thisBook.dom ={};
      thisBook.dom.bookContainer = bookContainer;
    }

    render() {
      const thisBook = this;

      // generate HTMLL based on template
      const generatedHTML = templates.book(thisBook.data);

      // create book element
      thisBook.element = utils.createDOMFromHTML(generatedHTML);

      // add created element to container
      thisBook.dom.bookContainer.appendChild(thisBook.element);
    }

    getElements() {
      const thisBook = this;
      // thisBook.dom = {};

      thisBook.dom.bookImage = thisBook.element.querySelector(select.book.bookImage);
    }

    toggleClassHandler() {
      const thisBook = this;

      if(!thisBook.dom.bookImage.classList.contains(classNames.book.bookFavorite)) {
        thisBook.dom.bookImage.classList.add(classNames.book.bookFavorite);
      } else {
        thisBook.dom.bookImage.classList.remove(classNames.book.bookFavorite);
      }

      thisBook.announce();
    }

    initActions() {
      const thisBook = this;

      thisBook.element.addEventListener('dblclick', function(event) {
        event.preventDefault();
        thisBook.toggleClassHandler();
      });
    }

    announce() {
      const thisBook = this;

      const event = new CustomEvent('update', {
        bubbles: true,
        detail: {
          id: thisBook.id,
        }
      });
      thisBook.element.dispatchEvent(event);
    }

    init() {
      const thisBook = this;

      thisBook.render();
      thisBook.getElements();
      thisBook.initActions();
    }
  }

  class BooksList {
    constructor(data) {
      const thisBooksList = this;

      thisBooksList.data = data;
      thisBooksList.favoriteBooks = [];
    }

    getElements() {
      const thisBooksList = this;

      thisBooksList.dom = {};
      thisBooksList.dom.element = document.querySelector(select.containerOf.booksList);
    }

    initBooks(booksData) {
      const thisBooksList = this;

      for(let bookData of booksData) {
        const book = new Book(bookData, thisBooksList.dom.element);
        book.init();
      }
    }

    initActions() {
      const thisBooksList = this;

      thisBooksList.dom.element.addEventListener('update', function(event) {
        const id = event.detail.id;
        thisBooksList.update(id);
      });

    }

    update(id) {
      const thisBooksList = this;

      // if book is added to favorite then add bookId to array favoriteBooks else remove bookId from array favoriteBooks
      if(!thisBooksList.favoriteBooks.includes(id)) {
        thisBooksList.favoriteBooks.push(id);
      } else {
        const index = thisBooksList.favoriteBooks.indexOf(id);
        const deleteCount = 1;
        thisBooksList.favoriteBooks.splice(index, deleteCount);
      }
    }

    init() {
      const thisBooksList = this;

      thisBooksList.getElements();
      thisBooksList.initBooks(thisBooksList.data.books);
      thisBooksList.initActions();
    }
  }

  const app = new BooksList(dataSource);

  app.init();

}

